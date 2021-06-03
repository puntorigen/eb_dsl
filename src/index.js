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
import deploy_eb from './deploys/eb'

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
        this.x_state.npm['serve-favicon']='*'; // favicon support

        // FAVICON
        if (this.x_state.config_node.favicon) {
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
        this.debug('serializing secrets');
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
                    if (this.x_state.dirs.secrets) {
                        let target = path.join(this.x_state.dirs.secrets, `${key}.json`);
                        await this.writeFile(target,JSON.stringify(new_obj));
                    }
                }
            }
        }
        this.debug('setting ENV variables');
        // set config keys as ENV accesible variables (ex. $config.childnode.attributename)
        for (let key in this.x_state.config_node) {
            // omit special config 'reserved' (aurora,vpc,aws) node keys
            if (!['vpc', 'aws','copiar'].includes(key) && typeof this.x_state.config_node[key] === 'object') {
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
        let fs = require('fs').promises;
        if (this.x_state.central_config.readme!='') {        
            let set_envs = [];
            for (let key in this.x_state.config_node) {
                if (!['vpc', 'aws','copiar'].includes(key) && typeof this.x_state.config_node[key] === 'object') {
                    Object.keys(this.x_state.config_node[key]).map(function(attr) {
                        if (key.charAt(0)!=':' && attr.charAt(0)!=':') {
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
        let fs = require('fs').promises;
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
        let cleanLinesDoc = function(text) {
            //trim each line
            let resp = '', lines = text.split('\n'), used=0;
            for (let line in lines) {
                let t_line = lines[line].trim();
                if (t_line!='') {
                    //if (used!=0) resp += ' * ';
                    resp += t_line + '\n';
                    used+=1;
                }
            }
            if (resp.slice(-1)=='\n') resp = resp.substr(0,resp.length-1);
            //resp += ' * ';
            return resp;
        };
        let data = {
            name: this.x_state.central_config.service_name.toLowerCase(),
            description: cleanLinesDoc(this.x_state.central_config[':description']),
            main: 'app.js',
            scripts: {
                start: './app',
                dev: 'nodemon ./app.js',
                build: 'npm run _doc',
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
        // set port and env variables to script dev
        let set_envs = [`APP_PORT=${this.x_state.central_config.port}`,`CLUSTER=1`];
        for (let key in this.x_state.config_node) {
            if (!['vpc', 'aws','copiar'].includes(key) && typeof this.x_state.config_node[key] === 'object') {
                Object.keys(this.x_state.config_node[key]).map(function(attr) {
                    if (key.charAt(0)!=':' && attr.charAt(0)!=':') {
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
        // add to package script _dev
        data.scripts.dev = set_envs.join(' ') + ' ' + data.scripts.dev;
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

    async getExpressModels() {
        let sort = function(obj) {
            return Object.entries(obj).sort((a,b)=>a[0].length-b[0].length).map(el=>el[0]);
        };
        let express_models = {}; // grouped functions by main path folder
        let routes = { raw:{}, ordered:[] };
        for (let key in this.x_state.functions) {
            let file = key.split('_')[0];
            if (!express_models[file]) {
                express_models[file] = {
                    functions:{},
                    ordered_functions:[],
                    imports:{},
                    route:file,
                    model:file,
                    path:`/${file}/`,
                };
            }
            if (!express_models[file].functions[key]) {
                express_models[file].functions[key]=this.x_state.functions[key];
            }
            express_models[file].ordered_functions = sort(express_models[file].functions);
            // merge function's imports into dad (e_model) imports
            for (let import_name in this.x_state.functions[key].imports) {
                express_models[file].imports[import_name] = import_name;
            }
            // add pathlen key for later struct sort
            express_models[file].functions[key].pathlen = this.x_state.functions[key].path.length;
            if (express_models[file].functions[key].visible==true) {
                routes.raw[`/${file}/`] = file;
            }
        }
        routes.ordered = sort(routes.raw);
        let resp = { models:express_models, routes };
        return resp;
    }

    async createAppJS(express) {
        let path = require('path');
        // create app_routes code
        let app_routes = [];
        for (let route_x in express.routes.ordered) {
            let route = express.routes.ordered[route_x];
            app_routes.push(`app.use('${route}', require('./routes/${express.routes.raw[route]}'));`);
        }
        // content
        let content = `var express = require('express');\n`;
        if (this.x_state.central_config.rtc && this.x_state.central_config.rtc==true) {
            content += `var http = require('http'), socket = require('socket.io'), rtc = require('rtcmulticonnection-server');\n`;
        }
        content += `var cors = require('cors'),
                    session = require('express-session'),
                    path = require('path'),
                    favicon = require('serve-favicon'),
                    logger = require('morgan'),
                    cookieParser = require('cookie-parser'),
                    bodyParser = require('body-parser'),
                    // NodeGeocoder: es utilizado para realizar la geo decodificacion y codificacion de lat-lon o direccion.
                    //NodeGeocoder = require('node-geocoder'),
                    // Mysql: es la instancia de mysql global.
                    mysql = require('mysql2'),
                    helmet = require('helmet'),
                    // Cluster: es para realizar un cluster de servidor conectados por express.
                    cluster = require('express-cluster'),
                    // schedule: es usado para crear crons.
                    schedule = require('node-schedule'),
                    // Request: es utilizado para realizar las llamadas get y post hacia otros servicios o servicios internos.
                    request = require('request'),
                    wait = require('wait.for'),
                    compress = require('compression')();
                // Define en las variables del enviroment el TimeZone a utc.
                process.env.TZ = 'utc';
                
                cluster(function(worker) {
                var app = express();
                var port = process.env.APP_PORT;
        `;
        if (this.x_state.central_config.rtc && this.x_state.central_config.rtc==true) {
            content += `var httpServer = http.createServer(app);
            var io = socket(httpServer).on('connection', function(sock) {\n`;
            if (this.x_state.central_config['rtc:admin']!='') {
                content += `rtc.addSocket(sock, {
                    "socketURL": "/",
                    "dirPath": "",
                    "homePage": "/",
                    "socketMessageEvent": "RTCMultiConnection-Message",
                    "socketCustomEvent": "RTCMultiConnection-Custom-Message",
                    "port": port,
                    "enableLogs": false,
                    "autoRebootServerOnFailure": false,
                    "isUseHTTPs": false,
                    "sslKey": "./fake-keys/privatekey.pem",
                    "sslCert": "./fake-keys/certificate.pem",
                    "sslCabundle": "",
                    "enableAdmin": true,
                    "adminUserName": "${this.x_state.central_config["rtc:admin"].split(',')[0].trim()}",
                    "adminPassword": "${this.x_state.central_config["rtc:admin"].split(',').pop().trim()}"
                  });\n`;
            } else {
                content += `rtc.addSocket(sock);\n`;
            }
            content += `});\n`;
        }
        //
        content += `app.enable('trust proxy');
        app.use(cors({ optionsSuccessStatus: 200 }));
        app.options('*',cors());
        app.use(compress);
        app.use(helmet());
        app.disable('x-powered-by');
        app.use(session({
          secret: 'c-r-34707$ee$$$10nBm_api',
          resave: true,
          saveUninitialized: true
        }));
        app.set('views', __dirname + '/views');
        app.set('view engine', 'ejs');
        //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        app.use(logger('dev'));
        app.use(bodyParser.urlencoded({ extended: false,limit: '2gb' }));
        app.use(bodyParser.json({ extended: false,limit: '2gb' }));
        app.use(cookieParser());
        app.use(express.static(path.join(__dirname, 'public')));
        app.use('/', require('./routes/index'));
        ${app_routes.join('\n')}
        // catch 404 and forward to error handler
        app.use(function(req, res, next) {
          var err = new Error('Not Found');
          err.status = 404;
          next(err);
        });
        // error handler
        app.use(function(err, req, res, next) {
          // set locals, only providing error in development
          res.locals.message = err.message;
          res.locals.error = process.env.START_TYPE === 'development' ? err : {};
      
          // render the error page
          res.status(err.status || 500);
          res.render('error');
        });
        process.env.UV_THREADPOOL_SIZE = 128;
        // aqui van los schedules @TODO 1-6-19
        // aqui creamos el servidor\n`;
        if (this.x_state.central_config.rtc && this.x_state.central_config.rtc==true) {
            content += `return httpServer.listen(port, function () {
                            console.log(\`T: \${new Date().toLocaleString()} | EXPRESS (\${process.env.START_TYPE}): server listening on port \${port}\`);
                            console.log(\`SERVIDOR INICIADO CON RTC\`);
                        });\n`;
        } else {
            content += `return app.listen(port, function () {
                            console.log(\`T: \${new Date().toLocaleString()} | EXPRESS (\${process.env.START_TYPE}): server listening on port \${port}\`);
                            console.log(\`SERVIDOR INICIADO\`);
                        });\n`;
        }
        content += `// Al final creamos el cluster del servidor.
                    }, {count: process.env.CLUSTER});\n`;
        //post-processing
        
        if (this.x_state.central_config.rtc && this.x_state.central_config.rtc==true) {
            this.x_state.npm['http'] = '*';
            this.x_state.npm = {...this.x_state.npm,...{
                'http':'*',
                'socket.io':'*',
                'rtcmulticonnection-server':'*'
            }};
            if (this.x_state.central_config['rtc:admin']!='') {
                //copy rtcadmin from assets and unzip into public dir
                let anzip = require('anzip');
                let rtc_admin = path.join(__dirname,'assets','rtc_admin.zip');
                let output = await anzip(rtc_admin, { outputPath:this.x_state.dirs.public });
                //console.log('PABLO debug unzip',output);
            }            
        }
        //write file
        let appjs = path.join(this.x_state.dirs.app,'app.js');
        await this.writeFile(appjs,content);
    }

    async createIndex(express) {
        let path = require('path');
        // get path routes
        let app_routes = [];
        for (let route_x in express.routes.ordered) {
            let route = express.routes.ordered[route_x];
            if (route.charAt(0)=='/') route = route.right(route.length-1);
            let no_slash = route.replaceAll('/','');
            app_routes.push(`case '${no_slash}':
                                res.redirect('/');
                                break;
                             case '${route}':
                                res.redirect('/');
                                break;
                            `);
        }
        // create content
        let content = `var express = require('express');
        var router = express.Router();
        var path = require('path');
        // rutas por defecto para documentacion
        router.get(['/*'], function(req, res, next) {
            switch (req.url) {
                case "/":
                    res.send('OK');
                break;
                ${app_routes.join('\n')}
                default:
                    res.redirect('/');
                break;
            }
        });
        module.exports = router;\n`;
        // write file
        let target = path.join(this.x_state.dirs.routes,'index.js');
        await this.writeFile(target,content);
    }

    async createRoutes(express) {
        let listDeleteAt = function(list, position, delimiter) {
            delimiter = (delimiter === undefined) ? "," : delimiter;
            var arr = list.split(delimiter);
            if (position >= 1 && position <= arr.length) {
                arr.splice(position - 1, 1);
                return arr.join(delimiter);
            }
            return list;
        };
        let cleanLinesDoc = function(text) {
            //trim each line
            let resp = '', lines = text.split('\n'), used=0;
            for (let line in lines) {
                let t_line = lines[line].trim();
                if (t_line!='') {
                    if (used!=0) resp += ' * ';
                    resp += t_line + '\n';
                    used+=1;
                }
            }
            resp += ' * ';
            return resp;
        };
        let ccase = require('fast-case'), path = require('path');
        // create routes files from express models
        for (let file in express.models) {
            // get unique sub-routes
            let unique = {};
            for (let func of express.models[file].ordered_functions) {
                let path = express.models[file].functions[func].path.trim().split('/');
                path.pop(); //remove last item
                path = path.join('/');
                if (!unique[path] && path.includes('/')==true && path!='/'+file) {
                    unique[path] = path.replaceAll('/','_');
                    if (unique[path].charAt(0)=='_') unique[path]=unique[path].substr(1,unique[path].length-1);
                }
            }
            // code
            let content = `/**
 * Servicios en ruta /${file}
 * @namespace {object} ${file}
 */
var express = require('express'), wait = require('wait.for');
var router = express.Router();
var ${file} = require('../models/${file}');
            `;
            if (Object.keys(unique).length>0) content += `// declaracion de sub-rutas en esta ubicacion\n`;
            for (let route in unique) {
                content += `/**
 * Servicios en ruta ${route}
 * @namespace {object} ${unique[route]}
 */\n`;
            }
            // write each function signature
            for (let func of express.models[file].ordered_functions) {
                // write jsdoc info for function
                let _jsdoc = {
                    method: express.models[file].functions[func].method.toLowerCase(),
                    path_o: express.models[file].functions[func].path.trim(),
                    doc: cleanLinesDoc(express.models[file].functions[func].doc)
                };
                if (_jsdoc.path_o.charAt(0)=='/') _jsdoc.path_o = _jsdoc.path_o.substr(1,_jsdoc.path_o.length-1); 
                if (_jsdoc.doc=='') _jsdoc.doc = 'Funcion no documentada';
                //console.log('PABLO debug without first0:',_jsdoc.path_o);
                let without_first = listDeleteAt(_jsdoc.path_o,1,'/');
                //console.log('PABLO debug without first1:',without_first);
                _jsdoc.path = `/${without_first}`;
                _jsdoc.method_name = _jsdoc.path_o.split('/').pop(); // last / item; f_jname
                _jsdoc.memberof = listDeleteAt(_jsdoc.path_o,_jsdoc.path_o.split('/').length,'/');
                _jsdoc.memberof = _jsdoc.memberof.replaceAll('_','|').replaceAll('/','_');
                let doc = `/**
 * (${_jsdoc.method.toUpperCase()}) ${_jsdoc.doc}
 * @method
 * @name ${func.replaceAll('_',' / ').replaceAll('|','_')}
 * @alias ${_jsdoc.method_name}
 * @memberof! ${_jsdoc.memberof}\n`;
                // add params doc of function
                let func_params = express.models[file].functions[func].params.split(',');
                for (let param of func_params) {
                    let param_wstar = param.replaceAll('*','');
                    if (express.models[file].functions[func].param_doc[param_wstar]) {
                        let p_type = ccase.pascalize(express.models[file].functions[func].param_doc[param_wstar].type);
                        let p_desc = express.models[file].functions[func].param_doc[param_wstar].desc.trim();
                        doc += ` * @param {${p_type}} ${param} ${p_desc}\n`;
                    } else {
                        if (param.trim()=='id' && !param.includes('identificador')) {
                            doc += ` * @param {Int} ${param}\n`;
                        } else if (param.includes('base64')) {
                            doc += ` * @param {Base64} ${param}\n`;
                        } else {
                            doc += ` * @param {String} ${param}\n`;
                        }
                    }
                }
                // return
                if (express.models[file].functions[func].param_doc.return) {
                    let p_type = ccase.pascalize(express.models[file].functions[func].param_doc.return.type);
                    let p_desc = express.models[file].functions[func].param_doc.return.desc.trim();
                    doc += `* @return ${p_type} ${p_desc}\n`;
                } else if (_jsdoc.doc.includes('@return')==false) {
                    doc += `* @return {object}\n`;
                }
                doc += ` */\n`;
                // router code
                doc += `router.${_jsdoc.method}('${_jsdoc.path}', function(req, res, next) {
                    wait.launchFiber(${file}.${func}, req, res);
                });\n`;
                // add doc to content if func is visible
                if (express.models[file].functions[func].visible==true) {
                    content += doc+'\n';
                }
                // 
            }
            // write exports
            content += `module.exports = router;\n`;
            // write file
            let target = path.join(this.x_state.dirs.routes,file+'.js');
            await this.writeFile(target,content);
        }
    }

    async createModels(express) {
        let path = require('path');
        for (let file in express.models) {
            let content = `//funciones para ruta ${file}\n`;
            if (this.x_state.config_node.aurora) {
                content += `const connectToDatabase = require('../db'); // initialize connection\n`;
            }
            //requires
            let requires = [];
            if (this.deploy_module.codeForModel) {
                let deploy_require = await this.deploy_module.codeForModel(express.models[file]);
                requires = [...requires,...deploy_require];
            }
            // add express models imports
            for (let imp in express.models[file].imports) {
                requires.push(`var ${imp.replaceAll('-','').replaceAll('@','').replaceAll('/','_')} = require('${imp}');`);
            }
            // write header of model
            content += `const Sequelize = require('sequelize'); // sequelize handler
            var moment = require('moment');
            var wait = require('wait.for');
            var util = require('util');
            var async = require('async');
            var _ = require('underscore');
            var fs = require('fs');
            const fileType = require('file-type');
            var path = require('path');
            // requires globales segun requerimiento de codigos de funciones
            ${requires.join('\n')}
            // funciones para cada ruta
            var self = {};\n`;
            // add function code
            content += express.models[file].code;
            // replace db connection info on funcs init { file_init }
            for (let func in express.models[file].functions) {
                let db_conn = `const { ${Object.keys(express.models[file].functions[func].used_models)} } = await connectToDatabase();`;
                content = content.replaceAll(`{ ${func}_init }`,db_conn);
            }
            // write exports
            content += `module.exports = self;\n`;
            // write file
            let target = path.join(this.x_state.dirs.models,file+'.js');
            await this.writeFile(target,content);
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

    async prettyCode(ext='js',content) {
        let prettier = require('prettier'), resp = content;
        if (ext=='js') {
            try {
                resp = prettier.format(resp, { parser: 'babel', useTabs:true, singleQuote:true });
            } catch(ee) {
                //this.debug(`error: could not format the JS file; trying js-beautify`);
                let beautify = require('js-beautify');
                let beautify_js = beautify.js;
                resp = beautify_js(resp,{});
            }
        }
        return resp;
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
        await this.createGitIgnore();
        //write .npmrc file for ffmpeg support
        await this.writeFile(path.join(this.x_state.dirs.app,'.npmrc'),`unsafe-perm=true`);
        this.debug('processing nodes');
        //console.log('PABLO debug x_state function general/login',this.x_state.functions.general_login);
        //console.log('PABLO debug create nodes',processedNodes);
        //group functions into express models (first folder is dad model)
        let express = await this.getExpressModels();
        //let express = { models:express_base.models, routes:express_base.routes }; // grouped functions by main path folder
        // add code to express models
        for (let thefile_num in processedNodes)  {
            let thefile = processedNodes[thefile_num];
            if (express.models[thefile.file]) {
                express.models[thefile.file].code = thefile.code;
            }
        }
        //console.log('PABLO debug EXPRESS models',express.models);
        await this.createAppJS(express);
        await this.createIndex(express);
        await this.createErrorTemplate();
        await this.createJSDoc();
        await this.createReadme();
        await this.createBinFile();
        await this.createRoutes(express);
        await this.createModels(express);
        // *************************
        // Additional steps
        // *************************
        //create package.json
        await this.createPackageJSON();
        //create package.json
        //await this.createPackageJSON();
        //create VSCode helpers
        //await this.createVSCodeHelpers();
        //create serverless.yml for deploy:sls - cfc:12881
        //await this.createServerlessYML();
        //execute deploy (npm install, etc) - moved to onEnd
        
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