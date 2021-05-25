const concepto = require('concepto');
//import { timingSafeEqual } from 'crypto';
//import { isContext, runInThisContext } from 'vm';
//import concepto from '../../concepto/src/index'
/**
 * Concepto EB DSL Class: A class for compiling eb.dsl Concepto diagrams into NodeJS Express backend services.
 * @name 	eb_dsl
 * @module 	eb_dsl
 **/
//import internal_commands from './commands'
import deploy_local from './deploys/local'
//import deploy_eb from './deploys/eb'

export default class eb_dsl extends concepto {

    constructor(file, config = {}) {
        // we can get class name, from package.json name key (after its in its own project)
        let my_config = {
            class: 'eb',
            debug: true
        };
        let nuevo_config = {...my_config, ...config };
        super(file, nuevo_config); //,...my_config
    }

    // **************************
    // methods to be auto-called
    // **************************

    //Called after init method finishes
    async onInit() {
        if (Object.keys(this.x_commands).length>0) this.x_console.outT({ message: `${Object.keys(this.x_commands).length} local x_commands loaded!`, color: `green` });
        // init
        // set x_state defaults
        this.x_state = {
            plugins: {},
            npm: {},
            dev_npm: {},
            envs: {},
            functions: {},
            proxies: {},
            pages: {},
            current_func: '',
            current_folder: '',
            current_proxy: '',
            strings_i18n: {},
            stores: {},
            stores_types: { versions: {}, expires: {} },
            nuxt_config: { head_script: {}, build_modules: {}, modules: {} },
        };
        this.x_state.config_node = await this._readConfig();
        //this.debug('config_node',this.x_state.config_node);
        this.x_state.central_config = await this._readCentralConfig();
        //this.debug('central_config',this.x_state.central_config);
        //this.x_state.assets = await this._readAssets();
        //this.debug('assets_node',this.x_state.assets);        
		this.x_state.dirs = await this._appFolders({
			'bin': 'bin/',
			'models': 'models/',
			'routes': 'routes/',
			'views': 'views/',
			'db_models': 'db_models/',
			'public': 'public/',
			'doc': 'doc/'
		});
        // read modelos node (Sequelize DB)
        this.x_state.models = await this._readModelos(); //alias: database tables
        //console.log('PABLO debug models',this.x_state.models);
        //is local server running? if so, don't re-launch it
        this.x_state.express_is_running = await this._isLocalServerRunning();
        this.debug('is Server Running: ' + this.x_state.express_is_running);
        // init terminal diagnostics
        if (this.atLeastNode('10') == false) {
            //this.debug('error: You need at least Node v10+ to use latest version!');
            throw new Error('You need to have at least Node v10+ to run these instances!');
        }
        this.x_state.es6 = true;
        // copy sub-directories if defined in node 'config.copiar' key
        if (this.x_state.config_node.copiar) {
            let path = require('path');
            let copy = require('recursive-copy');
            this.x_console.outT({ message: `copying config:copiar directories to 'root' target folder`, color: `yellow` });
            await Object.keys(this.x_state.config_node.copiar).map(async function(key) {
                let abs = path.join(this.x_state.dirs.base, key);
                try {
                    await copy(abs, path.join(this.x_state.dirs.app,key));
                } catch (err_copy) {
                    if (err_copy.code != 'EEXIST') this.x_console.outT({ message: `error: copying directory ${abs}`, data: err_copy });
                }
                //console.log('copying ',{ from:abs, to:this.x_state.dirs.static });
            }.bind(this));
            this.x_console.outT({ message: `copying config:copiar directories ... READY`, color: `yellow` });
        }
        // *********************************************
        // install requested modules within config node
        // *********************************************
        this.x_console.outT({ message: `eb initialized() ->` });
        // JSDoc
        this.x_state.dev_npm['jsdoc'] = '*';
        this.x_state.dev_npm['jsdoc-i18n-plugin'] = '*';
        this.x_state.dev_npm['@pixi/jsdoc-template'] = '*';
        this.x_state.dev_npm['lodash']='^4.17.11';
        // undescore support
        this.x_state.npm['underscore']='*';
        this.x_state.npm['axios']='*';
        // additional required dependencies
        this.x_state.npm['aws-sdk']='*';
        this.x_state.npm['file-type']='*';
        this.x_state.npm['async']='*';
        this.x_state.npm['body-parser']='*';
        this.x_state.npm['buffer']='*';
        this.x_state.npm['compare-lat-lon']='*';
        this.x_state.npm['connect-redis']='*';
        this.x_state.npm['cookie-parser']='*';
        this.x_state.npm['country-tz']='^1.0.0';
        this.x_state.npm['countryinfo']='^1.0.2';
        this.x_state.npm['debug']='*';
        this.x_state.npm['ejs']='*';
        this.x_state.npm['extract-string']='*';
        // add express support
        this.x_state.npm['express']='*';
        this.x_state.npm['express-cluster']='*';
        this.x_state.npm['express-session']='*';
        // express protection and related libraries
        this.x_state.npm['helmet']='*';
        this.x_state.npm['cors']='*';
        this.x_state.npm['http']='*';
        this.x_state.npm['http-proxy']='*';
        this.x_state.npm['compression']='*';
        // other libraries
        this.x_state.npm['moment']='*';
        this.x_state.npm['moment-timezone']='*';
        this.x_state.npm['morgan']='*'; // log related
        this.x_state.npm['multer']='*'; // file upload support
        this.x_state.npm['mysql2']='*'; // sql support
        this.x_state.npm['sequelize']='*'; // db
        this.x_state.npm['node-geocoder']='*';
        this.x_state.npm['node-pushnotifications']='*';
        this.x_state.npm['node-schedule']='*';
        this.x_state.npm['nodemon']='*';
        this.x_state.npm['postman-request']='*';
        this.x_state.npm['request']='*';
        this.x_state.npm['wait.for']='*';

        // FAVICON
        if (this.x_state.config_node.favicon) {
            this.x_state.npm['serve-favicon']='*'; // favicon support
            // copy icon to static dir
            let path = require('path');
            let source = path.join(this.x_state.dirs.base, this.x_state.config_node.favicon);
            let target = this.x_state.dirs.app + 'icon.png';
            this.debug({ message: `ICON dump (copy icon)`, color: `yellow`, data: source });
            let fs = require('fs').promises;
            try {
                await fs.copyFile(source, target);
            } catch (err_fs) {
                this.x_console.outT({ message: `error: copying express icon`, data: err_fs });
            }
        }
        // serialize 'secret' config keys as json files in app secrets sub-directory (if any)
        // extract 'secret's from config keys; 
        /* */
        this.x_state.secrets={}; //await _extractSecrets(config_node)
        let path = require('path');
        for (let key in this.x_state.config_node) {
            if (typeof key === 'string' && key.includes(':')==false) {
                if (this.x_state.config_node[key][':secret']) {
                    let new_obj = {...this.x_state.config_node[key]};
                    delete new_obj[':secret']
                    if (new_obj[':link']) delete new_obj[':link']
                    // set object keys to uppercase
                    this.x_state.secrets[key]={};
                    let obj_keys = Object.keys(new_obj);
                    for (let x in obj_keys) {
                        this.x_state.secrets[key][x.toUpperCase()] = new_obj[x];
                    }
                    let target = path.join(this.x_state.dirs.secrets, `${key}.json`);
                    await this.writeFile(target,JSON.stringify(new_obj));
                }
            }
        }
        // set config keys as ENV accesible variables (ex. $config.childnode.attributename)
        for (let key in this.x_state.config_node) {
            // omit special config 'reserved' (aurora,vpc,aws) node keys
            if (!['aurora', 'vpc', 'aws'].includes(key) && typeof this.x_state.config_node[key] === 'object') {
                Object.keys(this.x_state.config_node[key]).map(function(attr) {
                    this.x_state.envs[`config.${key}.${attr}`] = `process.env.${(key+'_'+attr).toUpperCase()}`;
                }.bind(this));
            }
        }
        
        // show this.x_state contents
        //this.debug('x_state says',this.x_state);
    }

    //Called after parsing nodes
    async onAfterProcess(processedNode) {
        return processedNode;
    }

    //Called for defining the title of class/page by testing node.
    async onDefineTitle(node) {
        let resp = node.text;
        Object.keys(node.attributes).map(function(i) {
            if (i == 'title' || i == 'titulo') {
                resp = node.attributes[i];
                return false;
            }
        }.bind(this));
        /*
        for (i in node.attributes) {
        	if (['title','titulo'].includes(node.attributes[i])) {
        		resp = node.attributes[i];
        		break;
        	}
        }*/
        return resp;
    }

    //Called for naming filename of class/page by testing node.
    async onDefineFilename(node) {
        return node.text;
    }

    //Called for naming the class/page by testing node.
    async onDefineNodeName(node) {
        return node.text.replace(' ', '_');
    }

    //Defines template for code given the processedNode of process() - for each level2 node
    async onCompleteCodeTemplate(processedNode) {
        return processedNode;
    }

    //Defines preparation steps before processing nodes.
    async onPrepare() {
        if (Object.keys(this.x_commands).length>0) this.x_console.outT({ message: `${Object.keys(this.x_commands).length} x_commands loaded!`, color: `green` });
        this.deploy_module = { pre:()=>{}, post:()=>{}, deploy:()=>true };
        let deploy = this.x_state.central_config.deploy;
        if (deploy) {
            deploy += '';
            if (deploy.includes('eb:')) {
                this.deploy_module = new deploy_eb({ context:this });
            } else if (deploy=='local') {
                this.deploy_module = new deploy_local({ context:this }); 
                //
            } else if (deploy=='localsls') {
                //sls local deployment

            } else if (deploy==true) {
                //sls deploy; use central_config domain for deployment
            }
        }
        await this.deploy_module.pre();
    }

    //Executed when compiler founds an error processing nodes.
    async onErrors(errors) {
        this.errors_found=true;
    }

    //configNode helper
    async generalConfigSetup() {
        //this.x_state.dirs.base
        this.debug('Setting general configuration steps');
        this.debug('Defining nuxt.config.js : initializing');
        // default modules
        this.debug('Defining nuxt.config.js : default modules');
        this.x_state.nuxt_config.modules['@nuxtjs/axios'] = {};
        //google analytics
        if (this.x_state.config_node['google:analytics']) {
            this.debug('Defining nuxt.config.js : Google Analytics');
            this.x_state.nuxt_config.build_modules['@nuxtjs/google-gtag'] = {
                'id': this.x_state.config_node['google:analytics'].id,
                'debug': true,
                'disableAutoPageTrack': true
            };
            if (this.x_state.config_node['google:analytics'].local) this.x_state.nuxt_config.build_modules['@nuxtjs/google-gtag'].debug = this.x_state.config_node['google:analytics'].local;
            if (this.x_state.config_node['google:analytics'].auto && this.x_state.config_node['google:analytics'].auto == true) {
                delete this.x_state.nuxt_config.build_modules['@nuxtjs/google-gtag']['disableAutoPageTrack'];
            }
        }
        //medianet
        if (this.x_state.config_node['ads:medianet'] && this.x_state.config_node['ads:medianet']['cid']) {
            this.debug('Defining nuxt.config.js : MediaNet');
            this.x_state.nuxt_config.head_script['z_ads_medianet_a'] = {
                'innerHTML': 'window._mNHandle = window._mNHandle || {}; window._mNHandle.queue = window._mNHandle.queue || []; medianet_versionId = "3121199";',
                'type': 'text/javascript'
            };
            this.x_state.nuxt_config.head_script['z_ads_medianet_b'] = {
                'src': `https://contextual.media.net/dmedianet.js?cid=${this.x_state.config_node['ads:medianet'][cid]}`,
                'async': true
            };
            this.x_state.plugins['vue-script2'] = {
                global: true,
                npm: { 'vue-script2': '*' }
            };
        }
        //google Adsense
        if (this.x_state.config_node['google:adsense']) {
            this.debug('Defining nuxt.config.js : Google Adsense');
            if (this.x_state.config_node['google:adsense'].auto && this.x_state.config_node['google:adsense'].client) {
                this.x_state.nuxt_config.head_script['google_adsense'] = {
                    'src': 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
                    'data-ad-client': this.x_state.config_node['google:adsense'].client,
                    'async': true
                };
                this.x_state.plugins['adsense'] = {
                    global: true,
                    npm: {
                        'vue-google-adsense': '*',
                        'vue-script2': '*'
                    },
                    mode: 'client',
                    customcode: `
					import Vue from "vue";
					import Ads from "vue-google-adsense";

					Vue.use(require('vue-script2'));
					Vue.use(Ads.AutoAdsense, { adClient: '${this.x_state.config_node['google:adsense']['client']}'});`
                };
            } else {
                this.x_state.plugins['adsense'] = {
                    global: true,
                    npm: {
                        'vue-google-adsense': '*',
                        'vue-script2': '*'
                    },
                    mode: 'client',
                    customcode: `
					import Vue from "vue";
					import Ads from "vue-google-adsense";

					Vue.use(require('vue-script2'));
					Vue.use(Ads.Adsense);
					Vue.use(Ads.InArticleAdsense);
					Vue.use(Ads.InFeedAdsense);`
                };
            }
        }
        //nuxt:icon
        if (this.x_state.config_node['nuxt:icon']) {
            this.debug('Defining nuxt.config.js : module nuxtjs/pwa (nuxt:icon)');
            this.x_state.nuxt_config.modules['@nuxtjs/pwa'] = {};
        }
        //idiomas i18n
        if (this.x_state.central_config['idiomas'].indexOf(',') != -1) {
            this.debug('Defining nuxt.config.js : module nuxt/i18n (idiomas)');
            this.x_state.npm['nuxt-i18n'] = '*';
            this.x_state.npm['fs'] = '*';
            this.x_state.nuxt_config.modules['nuxt-i18n'] = {
                'defaultLocale': this.x_state.central_config['idiomas'].split(',')[0],
                'vueI18n': { 'fallbackLocale': this.x_state.central_config['idiomas'].split(',')[0] },
                'detectBrowserLanguage': {
                    'useCookie': true,
                    'alwaysRedirect': true
                },
                locales: [],
                lazy: true,
                langDir: 'lang/'
            };
            let self = this;
            this.x_state.central_config['idiomas'].split(',').map(function(lang) {
                if (lang == 'es') {
                    self.x_state.nuxt_config.modules['nuxt-i18n'].locales.push({
                        code: 'es',
                        iso: 'es-ES',
                        file: `${lang}.js`
                    });
                } else if (lang == 'en') {
                    self.x_state.nuxt_config.modules['nuxt-i18n'].locales.push({
                        code: 'en',
                        iso: 'en-US',
                        file: `${lang}.js`
                    });
                } else {
                    self.x_state.nuxt_config.modules['nuxt-i18n'].locales.push({
                        code: lang,
                        file: `${lang}.js`
                    });
                }
            }.bind(self));
        }
        //local storage
        if (this.x_state.stores_types['local'] && Object.keys(this.x_state.stores_types['local']) != '') {
            this.debug('Defining nuxt.config.js : module nuxt-vuex-localstorage (store:local)');
            this.x_state.nuxt_config.modules['nuxt-vuex-localstorage'] = {
                mode: 'debug',
                'localStorage': Object.keys(this.x_state.stores_types['local'])
            };
        }
        //session storage
        if (this.x_state.stores_types['session'] && Object.keys(this.x_state.stores_types['session']) != '') {
            this.debug('Defining nuxt.config.js : module nuxt-vuex-localstorage (store:session)');
            let prev = {};
            // if vuex-localstorage was defined before, recover keys and just replace with news, without deleting previous
            if (this.x_state.nuxt_config.modules['nuxt-vuex-localstorage']) prev = this.x_state.nuxt_config.modules['nuxt-vuex-localstorage'];
            this.x_state.nuxt_config.modules['nuxt-vuex-localstorage'] = {...prev,
                ... {
                    mode: 'debug',
                    'sessionStorage': Object.keys(this.x_state.stores_types['session'])
                }
            };
        }
        //proxies
        let has_proxies = false,
            proxies = {};
        let self = this;
        Object.keys(this.x_state.central_config).map(function(key) {
            if (key.indexOf('proxy:') != -1) {
                let just_key = key.split(':')[1];
                proxies[just_key] = self.x_state.central_config[key];
                has_proxies = true;
            }
        }.bind(self));
        if (has_proxies) {
            this.debug('Defining nuxt.config.js : module nuxtjs/proxy (central:proxy)');
            this.x_state.npm['@nuxtjs/proxy'] = '*';
            this.x_state.nuxt_config.modules['@nuxtjs/proxy'] = { 'proxy': proxies };
        }
        //end
    }

    //.gitignore helper
    async createGitIgnore() {
        this.debug('writing .gitignore files');
        let fs = require('fs').promises;
        this.debug({ message: 'writing dsl /.gitignore file' });
        let git =
`# Mac System files
.DS_Store
.DS_Store?
_MACOSX/
Thumbs.db
# Concepto files
dsl_cache/
dsl_cache.ini
tmp.ini
/eb.dsl
store/
${this.x_state.dirs.compile_folder}/node_modules/
${this.x_state.dirs.compile_folder}/secrets/`;
            await fs.writeFile(`${this.x_state.dirs.base}.gitignore`, git, 'utf-8'); //.gitignore
    }

    // create /README.md file
    async createReadme() {
        if (this.x_state.central_config.readme!='') {        
            let set_envs = [];
            for (let key in this.x_state.config_node) {
                if (!['aurora', 'vpc', 'aws'].includes(key) && typeof this.x_state.config_node[key] === 'object') {
                    Object.keys(this.x_state.config_node[key]).map(function(attr) {
                        if (key.charAt(0)!=':') {
                            set_envs.push(`${key.toUpperCase()}_${attr.toUpperCase()}`);
                        }
                    }.bind(this));
                }
            }
            let content = `<b>${this.x_state.central_config.readme}</b><br/><br/>
            APP_PORT (int)<br/>
            CLUSTER (int)<br/>`;
            if (set_envs.length>0) {
                content += `Esta aplicacion requiere configurar las siguientes variables de entorno en la instancia de ElasticBean:<br/><br/>`;
                content += set_envs.join('<br/>')+'\n';
            }
            await fs.writeFile(`${this.x_state.dirs.app}README.md`, content, 'utf-8');
        }
    }

    async createErrorTemplate() {
        let content = `<h1><%= message %></h1>
        <h2><%= error.status %></h2>
        <pre><%= error.stack %></pre>`;
        await fs.writeFile(`${this.x_state.dirs.views}error.ejs`, content, 'utf-8');
    }

    async createJSDoc() {
        // jsdoc.js file
        let data = {
            plugins: ['./node_modules/jsdoc-i18n-plugin/'],
            i18n: {
                locale: 'en_ES',
                directory: './doc/en_ES/',
                srcDir: './doc/en_US/',
                extension: '.js'
            },
            tags: {
                allowUnknownTags: true
            },
            opts: {
                encoding: 'utf8',
                destination: './public/doc',
                recurse: true,
                template: './node_modules/@pixi/jsdoc-template'
            },
            templates: {
                default: {
                    outputSourceFiles: false
                }
            }
        };
        let content = JSON.stringify(data);
        await this.writeFile(`${this.x_state.dirs.app}jsdoc.json`,content);
    }

    async createBinFile() {
        let content = `#!/usr/bin/env node
var app = require('../app');
var debug = require('debug')('api:server');
var http = require('http');
var port = normalizePort(process.env.PORT || '8081');
app.set('port',port);
var server = http.createServer(app);
// methods
function normalizePort(val) {
	var port = parseInt(val, 10);
	if (isNaN(port)) {
		return val;
	}
	if (port >= 0) {
		return port;
	}
	return false;
}
// error handler
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}
// listening event
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}`;
        await this.writeFile(`${this.x_state.dirs.bin}www`,content);
    }

    async createPackageJSON() {
        let data = {
            name: this.x_state.central_config.service_name,
            description: this.x_state.central_config[':description'],
            main: 'app.js',
            scripts: {
                start: './app',
                _dev: 'nodemon ./app.js',
                _doc: 'jsdoc ./routes -c ./jsdoc.json -R ./README.md'
            },
            dependencies: {},
            devDependencies: {},
            keywords: []
        };
        if (this.x_state.central_config[':version']!='auto') data.version = this.x_state.central_config[':version'];
        if (this.x_state.central_config[':author']) data.author = this.x_state.central_config[':author'];
        if (this.x_state.central_config[':license']) data.license = this.x_state.central_config[':license'];
        if (this.x_state.central_config[':git']) {
            data.repository = {
                type: 'git',
                url: `git+${this.x_state.central_config[':git']}.git`
            };
            data.bugs = {
                url: `${this.x_state.central_config[':git']}/issues`
            }
            data.homepage = this.x_state.central_config[':git'];
        }
        if (this.x_state.central_config[':keywords']) data.keywords = this.x_state.central_config[':keywords'].split(',');
        // set port and env variables to script _dev
        let set_envs = [`APP_PORT=${this.x_state.central_config.port}`,`CLUSTER=1`];
        for (let key in this.x_state.config_node) {
            if (!['aurora', 'vpc', 'aws'].includes(key) && typeof this.x_state.config_node[key] === 'object') {
                Object.keys(this.x_state.config_node[key]).map(function(attr) {
                    if (key.charAt(0)!=':') {
                        set_envs.push(`${key.toUpperCase()}_${attr.toUpperCase()}=${this.x_state.config_node[key][attr]}`);
                    }
                }.bind(this));
            }
        }
        // omit stage as start_type; it seems its not needed
        // call hook for deploy_module (if needs to add env variables depending on deploy)
        if (this.deploy_module.setEnvs) {
            set_envs = await this.deploy_module.setEnvs(set_envs);
        }
        //
        //add dependencies
        for (let pack in this.x_state.npm) {
            if (this.x_state.npm[pack].includes('http') && this.x_state.npm[pack].includes('github.com')) {
                data.dependencies[pack] = `git+${this.x_state.npm[pack]}`;
            } else {
                data.dependencies[pack] = this.x_state.npm[pack];
            }
        }
        //add devDependencies
        for (let pack in this.x_state.dev_npm) {
            if (this.x_state.dev_npm[pack].includes('http') && this.x_state.dev_npm[pack].includes('github.com')) {
                data.devDependencies[pack] = `git+${this.x_state.dev_npm[pack]}`;
            } else {
                data.devDependencies[pack] = this.x_state.dev_npm[pack];
            }
        }
        //write to disk
        let path = require('path');
        let target = path.join(this.x_state.dirs.app,`package.json`);
        let content = JSON.stringify(data);
        await this.writeFile(target,content);
        //this.x_console.outT({ message:'future package.json', data:data});
    }

    async createVSCodeHelpers() {
        // creates Visual Studio code common helpers
        let path = require('path');
        // creates /jsconfig.json file for IntelliSense
        let data = {
            include: [ './client/**/*' ],
            compilerOptions: {
                module: 'es2015',
                moduleResolution: 'node',
                target: 'es5',
                sourceMap: true,
                paths: {
                    '~/*': ['./client/*'],
                    '@/*': ['./client/*'],
                    '~~/*': ['./*'],
                    '@@/*': ['./*'] 
                }
            },
            exclude: ['node_modules','secrets']
        };
        //write to disk
        let target = path.join(this.x_state.dirs.app,`jsconfig.json`);
        let content = JSON.stringify(data);
        await this.writeFile(target,content);
    }

    async createServerlessYML() {
        let yaml = require('yaml'), data = {};
        let deploy = this.x_state.central_config.deploy+'';
        if (deploy.includes('eb:')==false &&
            deploy!=false &&
            deploy!='local') {
            data.service = this.x_state.central_config.service_name;
            data.custom = {
                prune: {
                    automatic: true,
                    includeLayers: true,
                    number: 1
                },
                apigwBinary: {
                    types: ['*/*']
                }
            };
            //add 'secrets' config json keys - cfc:12895
            //this.x_state.secrets
            for (let secret in this.x_state.secrets) {
                data.custom[secret] = '${file(secrets/'+secret+'.json)}'
            }
            //domain info
            if (this.x_state.central_config.dominio) {
                data.custom.customDomain = {
                    domainName: this.x_state.central_config.dominio
                };
                if (this.x_state.central_config.basepath) data.custom.customDomain.basePath = this.x_state.central_config.basepath;
                if (this.x_state.central_config.stage) data.custom.customDomain.stage = this.x_state.central_config.stage;
                data.custom.customDomain.createRoute53Record = true;
            }
            //nodejs env on aws
            data.provider = {
                name: 'aws',
                runtime: 'nodejs8.10',
                timeout: this.x_state.central_config.timeout
            };
            if (this.x_state.central_config.stage) data.provider.stage = this.x_state.central_config.stage;
            //env keys
            if (Object.keys(this.x_state.config_node)!='') {
                data.provider.enviroment = {};
                if (this.x_state.central_config.stage) data.provider.enviroment.STAGE = this.x_state.central_config.stage;
                if (this.x_state.config_node.vpc) {
                    data.provider.vpc = {
                        securityGroupIds: [this.x_state.config_node.vpc.security_group_id],
                        subnetIDs: []
                    };
                    if (this.x_state.secrets.vpc) {
                        data.provider.vpc.securityGroupIds = ['${self:custom.vpc.SECURITY_GROUP_ID}'];
                    }
                    if (this.x_state.config_node.vpc.subnet1_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET1_ID}'); 
                    if (this.x_state.config_node.vpc.subnet2_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET2_ID}');
                    if (this.x_state.config_node.vpc.subnet3_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET3_ID}');
                    if (this.x_state.config_node.vpc.subnet4_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET4_ID}');
                    if (this.x_state.config_node.vpc.subnet5_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET5_ID}');
                    if (this.x_state.config_node.vpc.subnet6_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET6_ID}');
                    if (this.x_state.config_node.vpc.subnet7_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET7_ID}');
                }
            }
            //aws iam for s3 permissions (x_state.aws_iam) (@TODO later - cfc:12990)
            /*
            data.provider.iamRoleStatements = {
                Effect: 'Allow'
            };*/
            //nuxt handler
            data.functions = {
                nuxt: {
                    handler: 'index.nuxt',
                    events: [{'http':'ANY /'},{'http':'ANY /{proxy+}'}]
                }
            };
            if (this.x_state.central_config['keep-warm']) {
                data.functions.nuxt.events.push({ schedule: 'rate(20 minutes)'})
            }
            //aws resources for s3 (x_state.aws_resources) (@TODO later - no commands use them - cfc:13017)
            //serverless plugins
            data.plugins = ['serverless-apigw-binary',
                            'serverless-offline',
                            'serverless-prune-plugin'];
            if (this.x_state.central_config.dominio) data.plugins.push('serverless-domain-manager');
            //write yaml to disk
            let content = yaml.stringify(data);
            let path = require('path');
            let target = path.join(this.x_state.dirs.app,`serverless.yml`);
            await this.writeFile(target,content);
            //debug
            //this.debug('future serverless.yml', content);
        }
    }

    async onEnd() {
        //execute deploy (npm install, etc) AFTER vue compilation (18-4-21: this is new)
        if (!this.errors_found) {
            if (!(await this.deploy_module.deploy()) && !this.x_state.central_config.componente) {
                this.x_console.outT({ message:'Something went wrong deploying, check the console, fix it and run again.', color:'red' });
            };
            await this.deploy_module.post();
        }
    }

    async exists(dir_or_file) {
        let fs = require('fs').promises;
        try {
            await fs.access(dir_or_file);
            return true;
        } catch(e) {
            return false;
        }
    }

    async writeFile(file,content,encoding='utf-8') {
        let fs = require('fs').promises, prettier = require('prettier');
        let ext = file.split('.').splice(-1)[0].toLowerCase();
        let resp = content;
        if (ext=='js') {
            try {
                resp = prettier.format(resp, { parser: 'babel', useTabs:true, singleQuote:true });
            } catch(ee) {
                this.debug(`error: could not format the JS file; trying js-beautify`);
                let beautify = require('js-beautify');
                let beautify_js = beautify.js;
                resp = beautify_js(resp,{});
            }
        } else if (ext=='json') {
            resp = prettier.format(resp, { parser: 'json' });
        } else if (ext=='vue') {
            try {
                resp = prettier.format(resp.replaceAll(`="xpropx"`,''), { 
                    parser: 'vue',
                    htmlWhitespaceSensitivity: 'ignore',
                    useTabs: true,
                    printWidth: 2000,
                    embeddedLanguageFormatting: 'auto',
                    singleQuote: true,
                    trailingComma: 'none'
                });
            } catch(ee) {
                this.debug(`warning: could not format the vue file; trying vue-beautify`,ee);
                let beautify = require('js-beautify');
                let beautify_vue = beautify.html;
                resp = beautify_vue(resp,{});
            }

        } else if (ext=='css') {
            resp = prettier.format(resp, { parser: 'css' });
        }
        await fs.writeFile(file, resp, encoding);
    }

    //Transforms the processed nodes into files.
    async onCreateFiles(processedNodes) {
        let fs = require('fs').promises, path = require('path');
        //this.x_console.out({ message:'onCreateFiles', data:processedNodes });
        //this.x_console.out({ message:'x_state', data:this.x_state });
        await this._writeModelos();
        //await this.generalConfigSetup();
        await this.createGitIgnore();
        await this.createErrorTemplate();
        await this.createJSDoc();
        await this.createReadme();
        await this.createBinFile();
        //write .npmrc file for ffmpeg support
        this.writeFile(path.join(this.x_state.dirs.app,'.npmrc'),`unsafe-perm=true`);
        this.debug('processing nodes');
        //group functions into express models (first folder is dad model)
        /*
        for (let thefile_num in processedNodes)  {
            //await processedNodes.map(async function(thefile) {
            let thefile = processedNodes[thefile_num];
            let contenido = thefile.code + '\n';
            if (thefile.file.split('.').slice(-1) == 'omit') {
                await this.processOmitFile(thefile);
                //process special non 'files'
            } else {
                this.debug('processing node ' + thefile.title);
                let vue = await this.getBasicVue(thefile);
                let page = this.x_state.pages[thefile.title];
                // @TODO check the vue.template replacements (8-mar-21)
                // declare server:asyncData
                this.debug('post-processing internal custom tags');
                vue = await this.processInternalTags(vue, page);
                // closure ...
                // **** **** start script wrap **** **** **** **** 
                let script_imports = '';
                // header for imports
                if (page) {
                    for (let key in page.imports) {
                        script_imports += `import ${page.imports[key]} from '${key}';\n`;
                    } //);
                }
                // export default
                vue.script = `{concepto:mixins:import}
				${script_imports}
				export default {
					${vue.script}
                    {concepto:mixins:array}
				}`
                // **** **** end script wrap **** **** 
                // process Mixins
                vue = this.processMixins(vue, page);
                // process Styles
                vue = this.processStyles(vue, page);
                // removes refx attributes
                vue = this.removeRefx(vue);
                // fix {vuepath:} placeholders
                vue = this.fixVuePaths(vue, page);
                // process lang files (po)
                vue = await this.processLangPo(vue, page);
                // ********************************** //
                // beautify the script and template
                // ********************************** //
                vue.script = '<script>\n' + vue.script + '\n</script>';
                if (!vue.style) vue.style = '';
                vue.full = `${vue.template}\n${vue.script}\n${vue.style}`;
                // ********************************** //
                // write files
                let w_path = path.join(this.x_state.dirs.pages, thefile.file);
                if (page.tipo == 'componente') {
                    this.x_console.outT({ message: `trying to write vue 'component' file ${thefile.file}`, color: 'cyan' });
                    w_path = path.join(this.x_state.dirs.components, thefile.file);
                } else if (page.tipo == 'layout') {
                    this.x_console.outT({ message: `trying to write vue 'layout' file ${thefile.file}`, color: 'cyan' });
                    w_path = path.join(this.x_state.dirs.layouts, thefile.file);
                } else {
                    this.x_console.outT({ message: `trying to write vue 'page' file ${thefile.file}`, color: 'cyan' });
                }
                await this.writeFile(w_path, vue.full);
                //
                //this.x_console.out({ message: 'vue ' + thefile.title, data: { vue, page_style: page.styles } });
            }
            //this.x_console.out({ message:'pages debug', data:this.x_state.pages });
            await this.setImmediatePromise(); //@improved
        }
        */
        // *************************
        // Additional steps
        // *************************
        //create package.json
        await this.createPackageJSON();
        /*if (!this.x_state.central_config.componente) {
            //await this.createVueXStores();
            //await this.createServerMethods();
            //await this.createMiddlewares();
            //create server files (nuxt express, mimetypes)
            //await this.prepareServerFiles();
            //declare required plugins
            //await this.installRequiredPlugins();
            //create NuxtJS plugin definition files
            //let nuxt_plugs = await this.createNuxtPlugins(); //return plugin array list for nuxt.config.js
            //this.x_state.nuxt_config.plugins = nuxt_plugs.nuxt_config;
            //this.x_state.nuxt_config.css = nuxt_plugs.css_files;
            //create nuxt.config.js file
            await this.createNuxtConfig()
            //create package.json
            await this.createPackageJSON();
            //create VSCode helpers
            await this.createVSCodeHelpers();
            //create serverless.yml for deploy:sls - cfc:12881
            await this.createServerlessYML();
            //execute deploy (npm install, etc) - moved to onEnd
        }*/
        
    }

    // ************************
    // INTERNAL HELPER METHODS 
    // ************************

    /*
     * Returns true if a local server is running on the DSL defined port
     */
    async _isLocalServerRunning() {
        let is_reachable = require('is-port-reachable');
        let resp = await is_reachable(this.x_state.central_config.port);
        return resp;
    }

    /*
     * Reads the node called modelos and creates tables definitions and managing code (alias:database).
     */
    async _readModelos() {
        // @IDEA this method could return the insert/update/delete/select 'function code generators'
        this.debug('_readModelos');
        this.debug_time({ id: 'readModelos' });
        let modelos = await this.dsl_parser.getNodes({ text: 'modelos', level: 2, icon: 'desktop_new', recurse: true }); //nodes_raw:true	
        let tmp = { appname: this.x_state.config_node.name },
            fields_map = {};
        let resp = {
            tables: {},
            attributes: {},
            length: 0,
            doc: ''
        };
        // map our values to real database values 
        let type_map = {
            id: { value: 'INT AUTOINCREMENT PRIMARY KEY', alias: ['identificador', 'autoid', 'autonum', 'key'] },
            texto: { value: 'STRING', alias: ['text', 'varchar', 'string'] },
            int: { value: 'INTEGER', alias: ['numero chico', 'small int', 'numero'] },
            float: { value: 'FLOAT', alias: ['decimal', 'real'] },
            boolean: { value: 'BOOLEAN', alias: ['boleano', 'true/false'] },
            date: { value: 'DATEONLY', alias: ['fecha'] },
            datetime: { value: 'DATETIME', alias: ['fechahora'] },
            blob: { value: 'BLOB', alias: ['binario', 'binary'] }
        };
        // expand type_map into fields_map
        Object.keys(type_map).map(function(x) {
            let aliases = type_map[x].alias;
            aliases.push(x);
            aliases.map(y => { fields_map[y] = type_map[x].value });
        });
        // search real modelos nodes (ignore folders)
        let modelos_x = [];
        if (modelos.length > 0) {
            let ccase = require('fast-case');
            for (let main of modelos[0].nodes) {
                if (main.icons.includes('list')) {
                    for (let child of main.nodes) {
                        let with_folder = {...child};
                        //@change: this is a breaking change - 23-may-21
                        with_folder.text = ccase.camelize(main.text)+'/'+ccase.camelize(child.text);
                        modelos_x.push(with_folder);  
                    }
                } else {
                    // this is a real modelo node
                    modelos_x.push(main);
                }
            }
        }
        modelos = [{nodes:modelos_x}];
        // parse nodes into tables with fields
        if (modelos.length > 0) {
            //modelos[0].attributes.map(x=>{ resp.attributes={...resp.attributes,...x} }); //modelos attributes
            resp.attributes = {...modelos[0].attributes };
            resp.doc = modelos[0].text_note;
            resp.length = modelos[0].nodes.length;
            for (let table of modelos[0].nodes) {
                let fields = {...table.attributes }; //table.attributes.map(x=>{ fields={...fields,...x} }); //table attributes
                resp.tables[table.text] = { fields: {} }; //create table
                tmp.sql_fields = [];
                for (let field in fields) {
                    resp.tables[table.text].fields[field] = fields_map[fields[field]]; //assign field with mapped value
                    tmp.sql_fields.push(field + ' ' + fields_map[fields[field]]);
                }
                resp.tables[table.text].sql = `CREATE TABLE ${table.text}(${tmp.sql_fields.join(',')})`;
                // test special attrs
                if (table[':dbname']) resp.tables[table.text].db = table[':dbname'];
                if (table[':tipo']) resp.tables[table.text].type = table[':tipo'];
                if (table[':type']) resp.tables[table.text].type = table[':type'];
                if (table[':tipo']) resp.tables[table.text].type = table[':tipo'];
                if (table[':index']) {
                    if (!resp.tables[table.text].indexes) resp.tables[table.text].indexes=[];
                    resp.tables[table.text].indexes.push({
                        name: this.hash(table.text+'_'+table[':idex']),
                        unique: false,
                        fields: table[':index'].split(',')
                    });
                }
                if (table[':index_unique']) {
                    if (!resp.tables[table.text].indexes) resp.tables[table.text].indexes=[];
                    resp.tables[table.text].indexes.push({
                        name: this.hash(table.text+'_'+table[':idex']),
                        unique: true,
                        fields: table[':index_unique'].split(',')
                    });
                }
                //
                await this.setImmediatePromise(); //@improved
            }
        }
        // create virtual table 'if' central node 'log'='modelo
        if (this.x_state.central_config.log && this.x_state.central_config.log.includes('model')) {
            resp.tables['console_log'] = {
                fields: {
                    id: 'INT AUTOINCREMENT PRIMARY KEY',
                    class: 'STRING',
                    method: 'STRING',
                    message: 'STRING',
                    date: 'DATE'
                }
            };
        }
        // add sequelize package
        this.x_state.npm['sequelize'] = '*';
        this.debug_timeEnd({ id: 'readModelos' });
        // return 
        return resp;
    }

    async _writeModelos() {
        this.debug('_writeModelos');
        this.debug_time({ id: 'writeModelos' });
        let path = require('path'), fs = require('fs').promises;
        // ******************************************************
        // create db_models sequelize schema files @todo
        // ******************************************************
        for (let table in this.x_state.models.tables) {
            // define file name
            let target_file = [], db_name='';
            
            if (table.includes('/')) {
                target_file.push(table.split('/')[0]);
                target_file.push(table.split('/').pop()+'.js');
                db_name = target_file[0] + '_' + target_file[1].replace('.js','');
            } else {
                target_file.push(table+'.js');
                db_name = table;
            }
            let target = path.join(this.x_state.dirs.db_models,target_file.join('/'));
            // create target folder
            let jfolder = path.dirname(target);
            try {
                await fs.mkdir(jfolder, { recursive:true });
            } catch(errdir) {
            }
            // content
            let fields = this.x_state.models.tables[table].fields;
            let model = {};
            let map = {
                'INT AUTOINCREMENT PRIMARY KEY': {
                    type: 'type.INTEGER',
                    primaryKey: true,
                    autoIncrement: true
                },
                'INT PRIMARY KEY': {
                    type: 'type.INTEGER',
                    primaryKey: true,
                    autoIncrement: false
                },
                'INTEGER': 'type.INTEGER',
                'STRING': 'type.STRING',
                'FLOAT': 'type.FLOAR',
                'BOOLEAN': 'type.BOOLEAN',
                'DATEONLY': 'type.DATE',
                'DATETIME': 'type.DATE',
                'BLOB': 'type.BLOB'
            };
            for (let key in fields) {
                if (fields[key] in map) {
                    model[key] = map[fields[key]];
                }
            }
            let content = `module.exports = (sequelize, type) => {
                return sequelize.define('${db_name}', ${this.jsDump(model,'type.')});
            }`;
            // write file
            await this.writeFile(target,content);
        }
        // ******************************************************
        // create db.js for 'aurora' if defined on config node
        // ******************************************************
        if (this.x_state.config_node.aurora) {
            this.x_state.npm['mysql2'] = '*';
            this.x_state.npm['sequelize'] = '*';
            let content = `const Sequelize = require('sequelize');\n`;
            for (let table in this.x_state.models.tables) {
                if (table.includes('/')) {
                    let info = { folder:'', table:'' };
                    info.folder = table.split('/')[0];
                    info.table = table.split('/').pop();
                    content += `const db_${info.folder}_${info.table} = require('./db_models/${info.folder}/${info.table}');\n`;
                } else {
                    content += `const db_${table} = require('./db_models/${table}');\n`;  
                }
            }
            let seq_config = {
                logging: this.x_state.central_config.dblog,
                dialect: 'mysql',
                dialectOptions: {
                    connectTimeout: 60000
                },
                define: {
                    freezeTableName: true
                },
                pool: {
                    max: 10,
                    min: 0,
                    acquire: 12000,
                    idle: 12000,
                    evict: 12000
                },
                operatorAliases: false,
                host: 'process.env.AURORA_HOST',
                port: 'process.env.AURORA_PORT'
            };
            content += `const sequelize = new Sequelize(
                process.env.AURORA_NAME,
                process.env.AURORA_USER,
                process.env.AURORA_PASSWORD,
                ${this.jsDump(seq_config)}
            );
            // check if given database exists, or create it
            sequelize.query("CREATE DATABASE IF NOT EXISTS "+process.env.AURORA_NAME).then(function(){});\n`;
            let models = [];
            for (let table in this.x_state.models.tables) {
                if (table.includes('/')) {
                    let info = { folder:'', table:'' };
                    info.folder = table.split('/')[0];
                    info.table = table.split('/').pop();
                    models.push(`${info.folder}_${info.table}`);
                    content += `const ${info.folder}_${info.table} = db_${info.folder}_${info.table}(sequelize, Sequelize);\n`;
                } else {
                    models.push(info.table);
                    content += `const ${table} = db_${table}(sequelize, Sequelize);;\n`;  
                }
            }
            // add closing code
            content += `const Models = { ${models.join(',')} }\n
            const connection = {};

            module.exports = async() => {
                if (connection.isConnected) {
                    console.log('=> Using existing connection.');
                    return Models;
                }

                await sequelize.sync({ alter:true });
                await sequelize.authenticate()
                connection.isConnected = true;
                console.log('=> Created a new connection.');
                return Models;
            }
            `;
            // write db.js file
            let target = path.join(this.x_state.dirs.app,'db.js');
            await this.writeFile(target,content);
        }
        this.debug_timeEnd({ id: 'writeModelos' });
    }

    /* 
     * Grabs central node configuration information
     */
    async _readCentralConfig() {
        this.debug('_readCentralConfig');
        let central = await this.dsl_parser.getNodes({ level: 1, recurse: false });
        //this.debug('central search',central);
        // set defaults
        let resp = {
            cloud: 'aws',
            type: 'simple',
            i18n: false,
            log: 'console',
            debug: false,
            dblog: true,
            deploy: false,
            stage: '',
            timeout: 30,
            modelos: 'aurora',
            doc: false,
            rtc: false,
            'rtc:admin':'',
            port: 8081,
            git: true,
            readme: central[0].text_note.trim(),
            'keep-alive': true,
            'keep-warm': true,
            ':cache': this.x_config.cache,
            ':keywords': '',
            ':author': 'Punto Origen SpA',
            ':license': 'MIT',
            ':github': '',
            ':version': '1.0.0',
            ':description': central[0].text_note,
            default_face: central[0].font.face,
            default_size: central[0].font.size,
            apptitle: central[0].text
        };
        // overwrite default resp with info from central node
        //resp = {...resp, ...central[0].attributes };
        //bit slower but transforms string booleans (19-4-21)
        let values = {};
        for (let xz in central[0].attributes) {
            let x = central[0].attributes[xz];
            if (x=='true') { 
                x=true;
            } else if (x=='false') {
                x=false;
            }
            values = {...values,...{[xz]:x}};
        }
        resp = {...resp, ...values };
        /*central[0].attributes.map(function(x) {
        	resp = {...resp,...x};
        });*/
        if (resp.dominio) {
            resp.service_name = resp.dominio.replace(/\./g, '').toLowerCase();
        } else {
            resp.service_name = resp.apptitle;
        }
        if (!resp[':cache']) this.x_config.cache = false; // disables cache when processing nodes (@todo)
        // return
        return resp;
    }

    /*
     * Grabs the configuration from node named 'config'
     */
    async _readConfig() {
        this.debug('_readConfig');
        let resp = { id: '', meta: [], seo: {}, secrets: {} },
            config_node = {};
        let search = await this.dsl_parser.getNodes({ text: 'config', level: 2, icon: 'desktop_new', recurse: true });
        //this.debug({ message:'search says',data:search, prefix:'_readConfig,dim' });
        //
        if (search.length > 0) {
            config_node = search[0];
            // define default font_face
            resp.default_face = config_node.font.face;
            resp.default_size = config_node.font.size;
            // apply children nodes as keys/value for resp
            for (let key of config_node.nodes) {
                // apply keys as config keys (standard config node by content types)
                if (key.icons.includes('button_cancel')==false) {                
                    if (Object.keys(key.attributes).length > 0) {
                        // prepare config key
                        let config_key = key.text.toLowerCase().replace(/ /g, '');
                        //alt1 let values = {...key.attributes }; 
                        //alt2, bit slower but considers booleans as string
                        let values = {};
                        for (let xz in key.attributes) {
                            let x = key.attributes[xz];
                            if (x=='true') { 
                                x=true;
                            } else if (x=='false') {
                                x=false;
                            }
                            values = {...values,...{[xz]:x}};
                        }
                        resp[config_key] = values;
                        // mark secret status true if contains 'password' icon
                        if (key.icons.includes('password')) resp[config_key][':secret'] = true;
                        // add link attribute if defined
                        if (key.link != '') resp[config_key][':link'] = key.link;

                    } else if (key.nodes.length > 0) {
                        resp[key.text] = key.nodes[0].text;
                    } else if (key.link != '') {
                        resp[key.text] = key.link;
                    }
                }
                //
            }
        }
        // assign dsl file folder name+filename if node.name is not given
        if (!resp.name) {
            let path = require('path');
            let dsl_folder = path.dirname(path.resolve(this.x_flags.dsl));
            let parent_folder = path.resolve(dsl_folder, '../');
            let folder = dsl_folder.replace(parent_folder, '');
            resp.name = folder.replace('/', '').replace('\\', '') + '_' + path.basename(this.x_flags.dsl, '.dsl');
            //console.log('folder:',{folder,name:resp.name});
            //this.x_flags.dsl
        }
        // create id if not given
        if (!resp.id) resp.id = 'com.puntorigen.' + resp.name;
        return resp;
    }

    async getParentNodes(id = this.throwIfMissing('id'), exec = false) {
        let parents = await this.dsl_parser.getParentNodesIDs({ id, array: true });
        let resp = [];
        for (let parent_id of parents) {
            let node = await this.dsl_parser.getNode({ id: parent_id, recurse: false });
            let command = await this.findValidCommand({ node, object: exec });
            if (command) resp.push(command);
            await setImmediatePromise(); //@improved
        }
        return resp;
    }

    //objeto to attributes tag version
    struct2params(struct = this.throwIfMissing('id')) {
        let resp = [],
            tmp = {...struct };
        // pre-process
        if ('aos' in tmp) {
            let aos_p = struct['aos'].split(',');
            if (aos_p.length == 3) {
                tmp['data-aos'] = aos_p[0];
                tmp['data-aos-duration'] = aos_p[1];
                tmp['data-aos-delay'] = aos_p[2];
            } else {
                tmp['data-aos'] = aos_p[0];
                tmp['data-aos-duration'] = aos_p[1];
            }
            delete tmp['aos'];
        }
        // process
        for (let [key, value] of Object.entries(tmp)) {
            if (value == null) {
                //needed cause cheerio assigns empty values to props, and vue props don't have values
                //little hack that works together with writeFile method
                resp.push(`${key}="xpropx"`); 
            } else if (typeof value !== 'object' && typeof value !== 'function' && typeof value !== 'undefined') {
                resp.push(`${key}="${value}"`);
            } else if (typeof value === 'object') {
                //serialize value
                resp.push(`${key}="${this.jsDump(value)}"`);
            }
        }
        return resp.join(' ');
    }

    //serializes the given obj escaping quotes from values containing js code
    jsDump(obj,leave_as_is_if_contains='') {
        let resp='';
        let isNumeric = function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        };
        let escape = function(obi) {
            let nuevo = '', ob = obi;
            //special escapes first
            if (typeof ob === 'string') ob = ob.replaceAll('{now}','new Date()');
            //
            if (typeof ob === 'number') {
                nuevo += ob;
            } else if (typeof ob === 'boolean') {
                nuevo += ob;
            } else if (typeof ob === 'string' &&
                ob.substr(0,2)=='**' && ob.substr(ob.length-2)=='**') {
                nuevo += ob.replaceAll('**',''); //escape single ** vars 21-abr-21
            } else if ((typeof ob === 'string') && (
                ob.charAt(0)=='!' || 
                ob.indexOf('this.')!=-1 || 
                ob.indexOf('new ')!=-1 || 
                ob.indexOf(`'`)!=-1 || 
                ob.indexOf('`')!=-1 || 
                (leave_as_is_if_contains!='' && ob.indexOf(leave_as_is_if_contains)!=-1) || 
                ob.includes('process.') || 
                (ob.charAt(0)!='0' && isNumeric(ob)) ||
                ob=='0' || 
                ob=='true' || ob=='false')
                ) {
                nuevo += ob;
            } else if (typeof ob === 'string') {
                nuevo += `'${ob}'`;
            } else {
                nuevo += ob;
            }
            return nuevo;
        };
        if (Array.isArray(obj)) {
            let tmp = [];
            for (let item in obj) {
                tmp.push(this.jsDump(obj[item],leave_as_is_if_contains));
            }
            resp = `[${tmp.join(',')}]`;
        } else if (typeof obj === 'object') {
            let tmp=[];
            for (let llave in obj) {
                let llavet = llave;
                if (llavet.includes('-') && llavet.includes(`'`)==false) llavet = `'${llave}'`;
                let nuevo = `${llavet}: `;
                let valor = obj[llave];
                if (typeof valor === 'object' || Array.isArray(valor)) {
                    nuevo += this.jsDump(valor,leave_as_is_if_contains);
                } else {
                    nuevo += escape(valor);
                }
                tmp.push(nuevo);
            }
            resp = `{\n${tmp.join(',')}\n}`;
        } else if (typeof(obj) === 'string') {
            resp = escape(obj);
        } else {
            resp = obj;
        }
        return resp;
    }

    // hash helper method
    async hash(thing) {
        let resp = await this.dsl_parser.hash(thing);
        return resp;
    }

    // atLeastNode
    atLeastNode(r) {
        const n = process.versions.node.split('.').map(x => parseInt(x, 10));
        r = r.split('.').map(x => parseInt(x, 10));
        return n[0] > r[0] || (n[0] === r[0] && (n[1] > r[1] || (n[1] === r[1] && n[2] >= r[2])));
    }

    setImmediatePromise() {
        //for preventing freezing node thread within loops (fors)
        return new Promise((resolve) => {
          setImmediate(() => resolve());
        });
    }
}