(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.eb_dsl = factory());
}(this, (function () { 'use strict';

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);

      if (enumerableOnly) {
        symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      }

      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  /**
  * Base Deploy: A class to define deployments for eb_dsl.
  * @name 	base_deploy
  * @module 	base_deploy
  **/
  class base_deploy {
    constructor() {
      var {
        context = {},
        name = 'base_deploy'
      } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.context = context;
      this.name = name;
    }

    logo() {
      var _arguments = arguments,
          _this = this;

      return _asyncToGenerator(function* () {
        var {
          name = _this.name,
          config = {}
        } = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : {};

        var cfonts = require('cfonts');

        cfonts.say(name, _objectSpread2(_objectSpread2({}, {
          font: 'block',
          gradient: 'red,blue'
        }), config));
      })();
    }

    run() {
      return _asyncToGenerator(function* () {
        return true;
      })();
    }

    deploy() {
      var _this2 = this;

      return _asyncToGenerator(function* () {
        var errors = [];

        _this2.context.x_console.spinner({
          message: "Deploying ".concat(_this2.name, " instance")
        });

        return errors;
      })();
    } // building methods


    base_build() {
      var _this3 = this;

      return _asyncToGenerator(function* () {
        // builds the project
        var spawn = require('await-spawn'),
            path = require('path'),
            fs = require('fs').promises; //let ora = require('ora');


        var node_modules_final = path.join(_this3.context.x_state.dirs.app, 'node_modules');
        var node_package = path.join(_this3.context.x_state.dirs.app, 'package.json');
        var npm = {},
            errors = [];

        _this3.context.x_console.outT({
          message: "Building project",
          color: 'cyan'
        });

        var spinner = _this3.context.x_console.spinner({
          message: 'Building project'
        });

        var node_modules_exist = yield _this3.exists(node_modules_final);
        var node_package_exist = yield _this3.exists(node_package);

        if (node_modules_exist && node_package_exist) {
          //test if every package required is within node_modules
          spinner.start("Some npm packages where installed; checking ..");
          var pkg = JSON.parse(yield fs.readFile(node_package, 'utf-8'));
          var all_ok = true;

          for (var pk in pkg.dependencies) {
            var tst_dir = path.join(_this3.context.x_state.dirs.app, 'node_modules', pk);
            var tst_exist = yield _this3.exists(tst_dir);
            if (!tst_exist) all_ok = false;
          }

          node_modules_exist = all_ok;

          if (all_ok) {
            spinner.succeed('Using existing npm packages');
          } else {
            spinner.warn('Some packages are new, requesting them');
          }
        } // issue npm install (400mb)


        if (!node_modules_exist) {
          spinner.start("Installing npm packages"); //this.x_console.outT({ message:`Installing npm packages` });

          try {
            npm.install = yield spawn('npm', ['install'], {
              cwd: _this3.context.x_state.dirs.app
            }); //, stdio:'inherit'

            spinner.succeed("npm install succesfully");
          } catch (n) {
            npm.install = n;
            spinner.fail('Error installing npm packages');
            errors.push(n);
          }
        } // issue npm run build


        spinner.start("Building NodeJS project");

        try {
          npm.build = yield spawn('npm', ['run', 'build'], {
            cwd: _this3.context.x_state.dirs.app
          });
          spinner.succeed('Project built successfully');
        } catch (nb) {
          npm.build = nb;
          spinner.fail('NUXT build failed');

          _this3.context.x_console.out({
            message: "Building NodeJS again to show error in console",
            color: 'red'
          }); //build again with output redirected to console, to show it to user


          try {
            console.log('\n');
            npm.build = yield spawn('npm', ['run', 'dev'], {
              cwd: _this3.context.x_state.dirs.app,
              stdio: 'inherit',
              timeout: 15000
            });
          } catch (eg) {}

          errors.push(nb);
        }

        return errors;
      })();
    } //****************************
    // onPrepare and onEnd steps
    //****************************


    pre() {
      return _asyncToGenerator(function* () {})();
    }

    post() {
      return _asyncToGenerator(function* () {})();
    } // config hooks


    setEnvs(envs) {
      return _asyncToGenerator(function* () {
        return envs; //array with already set env vars
      })();
    } // HELPER methods


    exists(dir_or_file) {
      return _asyncToGenerator(function* () {
        var fs = require('fs').promises;

        try {
          yield fs.access(dir_or_file);
          return true;
        } catch (e) {
          return false;
        }
      })();
    }

    _isLocalServerRunning() {
      var _arguments2 = arguments,
          _this4 = this;

      return _asyncToGenerator(function* () {
        var port = _arguments2.length > 0 && _arguments2[0] !== undefined ? _arguments2[0] : _this4.context.x_state.central_config.port;

        var is_reachable = require('is-port-reachable');

        var resp = yield is_reachable(port);
        return resp;
      })();
    }

    launchTerminal(cmd) {
      var _arguments3 = arguments;
      return _asyncToGenerator(function* () {
        var args = _arguments3.length > 1 && _arguments3[1] !== undefined ? _arguments3[1] : [];
        var basepath = _arguments3.length > 2 ? _arguments3[2] : undefined;

        var spawn = require('await-spawn');

        var args_p = '';
        var resp = {
          error: false
        };

        if (basepath) {
          args_p = "sleep 2; clear; cd ".concat(basepath, " && ").concat(cmd, " ").concat(args.join(' '));
        } else {
          args_p = 'sleep 2; clear; ' + cmd + ' ' + args.join(' ');
        }

        try {
          resp = yield spawn('npx', ['terminal-tab', args_p]);
        } catch (e) {
          resp = _objectSpread2(_objectSpread2({}, e), {
            error: true
          });
        }

        return resp;
      })();
    }

  }

  class local extends base_deploy {
    constructor() {
      var {
        context = {}
      } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      super({
        context,
        name: 'Local'
      });
    }

    setEnvs(envs) {
      return _asyncToGenerator(function* () {
        return [...envs, 'START_TYPE=development'];
      })();
    }

    deploy() {
      var _this = this;

      return _asyncToGenerator(function* () {
        var build = {};

        if ((yield _this._isLocalServerRunning()) == false) {
          _this.context.x_console.title({
            title: 'Deploying local NodeJS server instance',
            color: 'green'
          });

          yield _this.logo(); //only launch nuxt server if its not running already
          // builds the app

          build.try_build = yield _this.base_build();

          if (build.try_build.length > 0) {
            _this.x_console.outT({
              message: "There was an error building the project.",
              color: 'red'
            });

            return false;
          }

          build.deploy_local = yield _this.run();

          if (build.deploy_local.length > 0) {
            _this.context.x_console.outT({
              message: "There was an error deploying locally.",
              color: 'red',
              data: build.deploy_local.toString()
            });

            return false;
          }
        } else {
          _this.context.x_console.title({
            title: 'Updating local running NodeJS instance',
            color: 'green'
          });

          yield _this.logo();

          _this.context.x_console.outT({
            message: "Project updated.",
            color: 'green'
          });
        }

        return true;
      })();
    }

    run() {
      var _this2 = this;

      return _asyncToGenerator(function* () {
        //issue npm run dev
        var errors = [];

        require('await-spawn');

        var spinner = _this2.context.x_console.spinner({
          message: 'Deploying local instance'
        }); //this.debug('Local deploy');


        spinner.start('Deploying local instance');

        try {
          //launch in a new terminal
          yield _this2.launchTerminal('npm', ['run', 'dev'], _this2.context.x_state.dirs.app); //results.git_add = await spawn('npm',['run','dev'],{ cwd:this.x_state.dirs.app });

          spinner.succeed('NodeJS Express launched successfully');
        } catch (gi) {
          spinner.fail('Project failed to launch');
          errors.push(gi);
        }

        return errors;
      })();
    }

  }

  var concepto = require('concepto'); //import { timingSafeEqual } from 'crypto';

  class eb_dsl extends concepto {
    constructor(file) {
      var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      // we can get class name, from package.json name key (after its in its own project)
      var my_config = {
        class: 'eb',
        debug: true
      };

      var nuevo_config = _objectSpread2(_objectSpread2({}, my_config), config);

      super(file, nuevo_config); //,...my_config
    } // **************************
    // methods to be auto-called
    // **************************
    //Called after init method finishes


    onInit() {
      var _this = this;

      return _asyncToGenerator(function* () {
        if (Object.keys(_this.x_commands).length > 0) _this.x_console.outT({
          message: "".concat(Object.keys(_this.x_commands).length, " local x_commands loaded!"),
          color: "green"
        }); // init
        // set x_state defaults

        _this.x_state = {
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
          stores_types: {
            versions: {},
            expires: {}
          },
          nuxt_config: {
            head_script: {},
            build_modules: {},
            modules: {}
          }
        };
        _this.x_state.config_node = yield _this._readConfig(); //this.debug('config_node',this.x_state.config_node);

        _this.x_state.central_config = yield _this._readCentralConfig(); //this.debug('central_config',this.x_state.central_config);
        //this.x_state.assets = await this._readAssets();
        //this.debug('assets_node',this.x_state.assets);        

        _this.x_state.dirs = yield _this._appFolders({
          'bin': 'bin/',
          'models': 'models/',
          'routes': 'routes/',
          'views': 'views/',
          'db_models': 'db_models/',
          'public': 'public/',
          'doc': 'doc/'
        }); // read modelos node (Sequelize DB)

        _this.x_state.models = yield _this._readModelos(); //alias: database tables
        //console.log('PABLO debug models',this.x_state.models);
        //is local server running? if so, don't re-launch it

        _this.x_state.express_is_running = yield _this._isLocalServerRunning();

        _this.debug('is Server Running: ' + _this.x_state.express_is_running); // init terminal diagnostics


        if (_this.atLeastNode('10') == false) {
          //this.debug('error: You need at least Node v10+ to use latest version!');
          throw new Error('You need to have at least Node v10+ to run these instances!');
        }

        _this.x_state.es6 = true; // copy sub-directories if defined in node 'config.copiar' key

        if (_this.x_state.config_node.copiar) {
          var _path = require('path');

          var copy = require('recursive-copy');

          _this.x_console.outT({
            message: "copying config:copiar directories to 'root' target folder",
            color: "yellow"
          });

          yield Object.keys(_this.x_state.config_node.copiar).map( /*#__PURE__*/function () {
            var _ref = _asyncToGenerator(function* (key) {
              var abs = _path.join(this.x_state.dirs.base, key);

              try {
                yield copy(abs, _path.join(this.x_state.dirs.app, key));
              } catch (err_copy) {
                if (err_copy.code != 'EEXIST') this.x_console.outT({
                  message: "error: copying directory ".concat(abs),
                  data: err_copy
                });
              } //console.log('copying ',{ from:abs, to:this.x_state.dirs.static });

            });

            return function (_x) {
              return _ref.apply(this, arguments);
            };
          }().bind(_this));

          _this.x_console.outT({
            message: "copying config:copiar directories ... READY",
            color: "yellow"
          });
        } // *********************************************
        // install requested modules within config node
        // *********************************************


        _this.x_console.outT({
          message: "eb initialized() ->"
        }); // JSDoc


        _this.x_state.dev_npm['jsdoc'] = '*';
        _this.x_state.dev_npm['jsdoc-i18n-plugin'] = '*';
        _this.x_state.dev_npm['@pixi/jsdoc-template'] = '*';
        _this.x_state.dev_npm['lodash'] = '^4.17.11'; // undescore support

        _this.x_state.npm['underscore'] = '*';
        _this.x_state.npm['axios'] = '*'; // additional required dependencies

        _this.x_state.npm['aws-sdk'] = '*';
        _this.x_state.npm['file-type'] = '*';
        _this.x_state.npm['async'] = '*';
        _this.x_state.npm['body-parser'] = '*';
        _this.x_state.npm['buffer'] = '*';
        _this.x_state.npm['compare-lat-lon'] = '*';
        _this.x_state.npm['connect-redis'] = '*';
        _this.x_state.npm['cookie-parser'] = '*';
        _this.x_state.npm['country-tz'] = '^1.0.0';
        _this.x_state.npm['countryinfo'] = '^1.0.2';
        _this.x_state.npm['debug'] = '*';
        _this.x_state.npm['ejs'] = '*';
        _this.x_state.npm['extract-string'] = '*'; // add express support

        _this.x_state.npm['express'] = '*';
        _this.x_state.npm['express-cluster'] = '*';
        _this.x_state.npm['express-session'] = '*'; // express protection and related libraries

        _this.x_state.npm['helmet'] = '*';
        _this.x_state.npm['cors'] = '*';
        _this.x_state.npm['http'] = '*';
        _this.x_state.npm['http-proxy'] = '*';
        _this.x_state.npm['compression'] = '*'; // other libraries

        _this.x_state.npm['moment'] = '*';
        _this.x_state.npm['moment-timezone'] = '*';
        _this.x_state.npm['morgan'] = '*'; // log related

        _this.x_state.npm['multer'] = '*'; // file upload support

        _this.x_state.npm['mysql2'] = '*'; // sql support

        _this.x_state.npm['sequelize'] = '*'; // db

        _this.x_state.npm['node-geocoder'] = '*';
        _this.x_state.npm['node-pushnotifications'] = '*';
        _this.x_state.npm['node-schedule'] = '*';
        _this.x_state.npm['nodemon'] = '*';
        _this.x_state.npm['postman-request'] = '*';
        _this.x_state.npm['request'] = '*';
        _this.x_state.npm['wait.for'] = '*'; // FAVICON

        if (_this.x_state.config_node.favicon) {
          _this.x_state.npm['serve-favicon'] = '*'; // favicon support
          // copy icon to static dir

          var _path2 = require('path');

          var source = _path2.join(_this.x_state.dirs.base, _this.x_state.config_node.favicon);

          var target = _this.x_state.dirs.app + 'icon.png';

          _this.debug({
            message: "ICON dump (copy icon)",
            color: "yellow",
            data: source
          });

          var _fs = require('fs').promises;

          try {
            yield _fs.copyFile(source, target);
          } catch (err_fs) {
            _this.x_console.outT({
              message: "error: copying express icon",
              data: err_fs
            });
          }
        } // serialize 'secret' config keys as json files in app secrets sub-directory (if any)
        // extract 'secret's from config keys; 

        /* */


        _this.x_state.secrets = {}; //await _extractSecrets(config_node)

        var path = require('path');

        for (var key in _this.x_state.config_node) {
          if (typeof key === 'string' && key.includes(':') == false) {
            if (_this.x_state.config_node[key][':secret']) {
              var new_obj = _objectSpread2({}, _this.x_state.config_node[key]);

              delete new_obj[':secret'];
              if (new_obj[':link']) delete new_obj[':link']; // set object keys to uppercase

              _this.x_state.secrets[key] = {};
              var obj_keys = Object.keys(new_obj);

              for (var x in obj_keys) {
                _this.x_state.secrets[key][x.toUpperCase()] = new_obj[x];
              }

              var _target = path.join(_this.x_state.dirs.secrets, "".concat(key, ".json"));

              yield _this.writeFile(_target, JSON.stringify(new_obj));
            }
          }
        } // set config keys as ENV accesible variables (ex. $config.childnode.attributename)


        var _loop = function _loop(_key) {
          // omit special config 'reserved' (aurora,vpc,aws) node keys
          if (!['aurora', 'vpc', 'aws'].includes(_key) && typeof _this.x_state.config_node[_key] === 'object') {
            Object.keys(_this.x_state.config_node[_key]).map(function (attr) {
              this.x_state.envs["config.".concat(_key, ".").concat(attr)] = "process.env.".concat((_key + '_' + attr).toUpperCase());
            }.bind(_this));
          }
        };

        for (var _key in _this.x_state.config_node) {
          _loop(_key);
        } // show this.x_state contents
        //this.debug('x_state says',this.x_state);

      })();
    } //Called after parsing nodes


    onAfterProcess(processedNode) {
      return _asyncToGenerator(function* () {
        return processedNode;
      })();
    } //Called for defining the title of class/page by testing node.


    onDefineTitle(node) {
      var _this2 = this;

      return _asyncToGenerator(function* () {
        var resp = node.text;
        Object.keys(node.attributes).map(function (i) {
          if (i == 'title' || i == 'titulo') {
            resp = node.attributes[i];
            return false;
          }
        }.bind(_this2));
        /*
        for (i in node.attributes) {
        	if (['title','titulo'].includes(node.attributes[i])) {
        		resp = node.attributes[i];
        		break;
        	}
        }*/

        return resp;
      })();
    } //Called for naming filename of class/page by testing node.


    onDefineFilename(node) {
      return _asyncToGenerator(function* () {
        return node.text;
      })();
    } //Called for naming the class/page by testing node.


    onDefineNodeName(node) {
      return _asyncToGenerator(function* () {
        return node.text.replace(' ', '_');
      })();
    } //Defines template for code given the processedNode of process() - for each level2 node


    onCompleteCodeTemplate(processedNode) {
      return _asyncToGenerator(function* () {
        return processedNode;
      })();
    } //Defines preparation steps before processing nodes.


    onPrepare() {
      var _this3 = this;

      return _asyncToGenerator(function* () {
        if (Object.keys(_this3.x_commands).length > 0) _this3.x_console.outT({
          message: "".concat(Object.keys(_this3.x_commands).length, " x_commands loaded!"),
          color: "green"
        });
        _this3.deploy_module = {
          pre: () => {},
          post: () => {},
          deploy: () => true
        };
        var deploy = _this3.x_state.central_config.deploy;

        if (deploy) {
          deploy += '';

          if (deploy.includes('eb:')) {
            _this3.deploy_module = new deploy_eb({
              context: _this3
            });
          } else if (deploy == 'local') {
            _this3.deploy_module = new local({
              context: _this3
            }); //
          } else ;
        }

        yield _this3.deploy_module.pre();
      })();
    } //Executed when compiler founds an error processing nodes.


    onErrors(errors) {
      var _this4 = this;

      return _asyncToGenerator(function* () {
        _this4.errors_found = true;
      })();
    } //configNode helper


    generalConfigSetup() {
      var _this5 = this;

      return _asyncToGenerator(function* () {
        //this.x_state.dirs.base
        _this5.debug('Setting general configuration steps');

        _this5.debug('Defining nuxt.config.js : initializing'); // default modules


        _this5.debug('Defining nuxt.config.js : default modules');

        _this5.x_state.nuxt_config.modules['@nuxtjs/axios'] = {}; //google analytics

        if (_this5.x_state.config_node['google:analytics']) {
          _this5.debug('Defining nuxt.config.js : Google Analytics');

          _this5.x_state.nuxt_config.build_modules['@nuxtjs/google-gtag'] = {
            'id': _this5.x_state.config_node['google:analytics'].id,
            'debug': true,
            'disableAutoPageTrack': true
          };
          if (_this5.x_state.config_node['google:analytics'].local) _this5.x_state.nuxt_config.build_modules['@nuxtjs/google-gtag'].debug = _this5.x_state.config_node['google:analytics'].local;

          if (_this5.x_state.config_node['google:analytics'].auto && _this5.x_state.config_node['google:analytics'].auto == true) {
            delete _this5.x_state.nuxt_config.build_modules['@nuxtjs/google-gtag']['disableAutoPageTrack'];
          }
        } //medianet


        if (_this5.x_state.config_node['ads:medianet'] && _this5.x_state.config_node['ads:medianet']['cid']) {
          _this5.debug('Defining nuxt.config.js : MediaNet');

          _this5.x_state.nuxt_config.head_script['z_ads_medianet_a'] = {
            'innerHTML': 'window._mNHandle = window._mNHandle || {}; window._mNHandle.queue = window._mNHandle.queue || []; medianet_versionId = "3121199";',
            'type': 'text/javascript'
          };
          _this5.x_state.nuxt_config.head_script['z_ads_medianet_b'] = {
            'src': "https://contextual.media.net/dmedianet.js?cid=".concat(_this5.x_state.config_node['ads:medianet'][cid]),
            'async': true
          };
          _this5.x_state.plugins['vue-script2'] = {
            global: true,
            npm: {
              'vue-script2': '*'
            }
          };
        } //google Adsense


        if (_this5.x_state.config_node['google:adsense']) {
          _this5.debug('Defining nuxt.config.js : Google Adsense');

          if (_this5.x_state.config_node['google:adsense'].auto && _this5.x_state.config_node['google:adsense'].client) {
            _this5.x_state.nuxt_config.head_script['google_adsense'] = {
              'src': 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
              'data-ad-client': _this5.x_state.config_node['google:adsense'].client,
              'async': true
            };
            _this5.x_state.plugins['adsense'] = {
              global: true,
              npm: {
                'vue-google-adsense': '*',
                'vue-script2': '*'
              },
              mode: 'client',
              customcode: "\n\t\t\t\t\timport Vue from \"vue\";\n\t\t\t\t\timport Ads from \"vue-google-adsense\";\n\n\t\t\t\t\tVue.use(require('vue-script2'));\n\t\t\t\t\tVue.use(Ads.AutoAdsense, { adClient: '".concat(_this5.x_state.config_node['google:adsense']['client'], "'});")
            };
          } else {
            _this5.x_state.plugins['adsense'] = {
              global: true,
              npm: {
                'vue-google-adsense': '*',
                'vue-script2': '*'
              },
              mode: 'client',
              customcode: "\n\t\t\t\t\timport Vue from \"vue\";\n\t\t\t\t\timport Ads from \"vue-google-adsense\";\n\n\t\t\t\t\tVue.use(require('vue-script2'));\n\t\t\t\t\tVue.use(Ads.Adsense);\n\t\t\t\t\tVue.use(Ads.InArticleAdsense);\n\t\t\t\t\tVue.use(Ads.InFeedAdsense);"
            };
          }
        } //nuxt:icon


        if (_this5.x_state.config_node['nuxt:icon']) {
          _this5.debug('Defining nuxt.config.js : module nuxtjs/pwa (nuxt:icon)');

          _this5.x_state.nuxt_config.modules['@nuxtjs/pwa'] = {};
        } //idiomas i18n


        if (_this5.x_state.central_config['idiomas'].indexOf(',') != -1) {
          _this5.debug('Defining nuxt.config.js : module nuxt/i18n (idiomas)');

          _this5.x_state.npm['nuxt-i18n'] = '*';
          _this5.x_state.npm['fs'] = '*';
          _this5.x_state.nuxt_config.modules['nuxt-i18n'] = {
            'defaultLocale': _this5.x_state.central_config['idiomas'].split(',')[0],
            'vueI18n': {
              'fallbackLocale': _this5.x_state.central_config['idiomas'].split(',')[0]
            },
            'detectBrowserLanguage': {
              'useCookie': true,
              'alwaysRedirect': true
            },
            locales: [],
            lazy: true,
            langDir: 'lang/'
          };
          var _self = _this5;

          _this5.x_state.central_config['idiomas'].split(',').map(function (lang) {
            if (lang == 'es') {
              _self.x_state.nuxt_config.modules['nuxt-i18n'].locales.push({
                code: 'es',
                iso: 'es-ES',
                file: "".concat(lang, ".js")
              });
            } else if (lang == 'en') {
              _self.x_state.nuxt_config.modules['nuxt-i18n'].locales.push({
                code: 'en',
                iso: 'en-US',
                file: "".concat(lang, ".js")
              });
            } else {
              _self.x_state.nuxt_config.modules['nuxt-i18n'].locales.push({
                code: lang,
                file: "".concat(lang, ".js")
              });
            }
          }.bind(_self));
        } //local storage


        if (_this5.x_state.stores_types['local'] && Object.keys(_this5.x_state.stores_types['local']) != '') {
          _this5.debug('Defining nuxt.config.js : module nuxt-vuex-localstorage (store:local)');

          _this5.x_state.nuxt_config.modules['nuxt-vuex-localstorage'] = {
            mode: 'debug',
            'localStorage': Object.keys(_this5.x_state.stores_types['local'])
          };
        } //session storage


        if (_this5.x_state.stores_types['session'] && Object.keys(_this5.x_state.stores_types['session']) != '') {
          _this5.debug('Defining nuxt.config.js : module nuxt-vuex-localstorage (store:session)');

          var prev = {}; // if vuex-localstorage was defined before, recover keys and just replace with news, without deleting previous

          if (_this5.x_state.nuxt_config.modules['nuxt-vuex-localstorage']) prev = _this5.x_state.nuxt_config.modules['nuxt-vuex-localstorage'];
          _this5.x_state.nuxt_config.modules['nuxt-vuex-localstorage'] = _objectSpread2(_objectSpread2({}, prev), {
            mode: 'debug',
            'sessionStorage': Object.keys(_this5.x_state.stores_types['session'])
          });
        } //proxies


        var has_proxies = false,
            proxies = {};
        var self = _this5;
        Object.keys(_this5.x_state.central_config).map(function (key) {
          if (key.indexOf('proxy:') != -1) {
            var just_key = key.split(':')[1];
            proxies[just_key] = self.x_state.central_config[key];
            has_proxies = true;
          }
        }.bind(self));

        if (has_proxies) {
          _this5.debug('Defining nuxt.config.js : module nuxtjs/proxy (central:proxy)');

          _this5.x_state.npm['@nuxtjs/proxy'] = '*';
          _this5.x_state.nuxt_config.modules['@nuxtjs/proxy'] = {
            'proxy': proxies
          };
        } //end

      })();
    } //.gitignore helper


    createGitIgnore() {
      var _this6 = this;

      return _asyncToGenerator(function* () {
        _this6.debug('writing .gitignore files');

        var fs = require('fs').promises;

        _this6.debug({
          message: 'writing dsl /.gitignore file'
        });

        var git = "# Mac System files\n.DS_Store\n.DS_Store?\n_MACOSX/\nThumbs.db\n# Concepto files\ndsl_cache/\ndsl_cache.ini\ntmp.ini\n/eb.dsl\nstore/\n".concat(_this6.x_state.dirs.compile_folder, "/node_modules/\n").concat(_this6.x_state.dirs.compile_folder, "/secrets/");
        yield fs.writeFile("".concat(_this6.x_state.dirs.base, ".gitignore"), git, 'utf-8'); //.gitignore
      })();
    } // create /README.md file


    createReadme() {
      var _this7 = this;

      return _asyncToGenerator(function* () {
        if (_this7.x_state.central_config.readme != '') {
          yield* function* () {
            var set_envs = [];

            var _loop2 = function _loop2(key) {
              if (!['aurora', 'vpc', 'aws'].includes(key) && typeof _this7.x_state.config_node[key] === 'object') {
                Object.keys(_this7.x_state.config_node[key]).map(function (attr) {
                  if (key.charAt(0) != ':') {
                    set_envs.push("".concat(key.toUpperCase(), "_").concat(attr.toUpperCase()));
                  }
                }.bind(_this7));
              }
            };

            for (var key in _this7.x_state.config_node) {
              _loop2(key);
            }

            var content = "<b>".concat(_this7.x_state.central_config.readme, "</b><br/><br/>\n            APP_PORT (int)<br/>\n            CLUSTER (int)<br/>");

            if (set_envs.length > 0) {
              content += "Esta aplicacion requiere configurar las siguientes variables de entorno en la instancia de ElasticBean:<br/><br/>";
              content += set_envs.join('<br/>') + '\n';
            }

            yield fs.writeFile("".concat(_this7.x_state.dirs.app, "README.md"), content, 'utf-8');
          }();
        }
      })();
    }

    createErrorTemplate() {
      var _this8 = this;

      return _asyncToGenerator(function* () {
        var content = "<h1><%= message %></h1>\n        <h2><%= error.status %></h2>\n        <pre><%= error.stack %></pre>";
        yield fs.writeFile("".concat(_this8.x_state.dirs.views, "error.ejs"), content, 'utf-8');
      })();
    }

    createJSDoc() {
      var _this9 = this;

      return _asyncToGenerator(function* () {
        // jsdoc.js file
        var data = {
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
        var content = JSON.stringify(data);
        yield _this9.writeFile("".concat(_this9.x_state.dirs.app, "jsdoc.json"), content);
      })();
    }

    createBinFile() {
      var _this10 = this;

      return _asyncToGenerator(function* () {
        var content = "#!/usr/bin/env node\nvar app = require('../app');\nvar debug = require('debug')('api:server');\nvar http = require('http');\nvar port = normalizePort(process.env.PORT || '8081');\napp.set('port',port);\nvar server = http.createServer(app);\n// methods\nfunction normalizePort(val) {\n\tvar port = parseInt(val, 10);\n\tif (isNaN(port)) {\n\t\treturn val;\n\t}\n\tif (port >= 0) {\n\t\treturn port;\n\t}\n\treturn false;\n}\n// error handler\nfunction onError(error) {\n  if (error.syscall !== 'listen') {\n    throw error;\n  }\n\n  var bind = typeof port === 'string'\n    ? 'Pipe ' + port\n    : 'Port ' + port;\n\n  // handle specific listen errors with friendly messages\n  switch (error.code) {\n    case 'EACCES':\n      console.error(bind + ' requires elevated privileges');\n      process.exit(1);\n      break;\n    case 'EADDRINUSE':\n      console.error(bind + ' is already in use');\n      process.exit(1);\n      break;\n    default:\n      throw error;\n  }\n}\n// listening event\nfunction onListening() {\n  var addr = server.address();\n  var bind = typeof addr === 'string'\n    ? 'pipe ' + addr\n    : 'port ' + addr.port;\n  debug('Listening on ' + bind);\n}";
        yield _this10.writeFile("".concat(_this10.x_state.dirs.bin, "www"), content);
      })();
    }

    createPackageJSON() {
      var _this11 = this;

      return _asyncToGenerator(function* () {
        var data = {
          name: _this11.x_state.central_config.service_name,
          description: _this11.x_state.central_config[':description'],
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
        if (_this11.x_state.central_config[':version'] != 'auto') data.version = _this11.x_state.central_config[':version'];
        if (_this11.x_state.central_config[':author']) data.author = _this11.x_state.central_config[':author'];
        if (_this11.x_state.central_config[':license']) data.license = _this11.x_state.central_config[':license'];

        if (_this11.x_state.central_config[':git']) {
          data.repository = {
            type: 'git',
            url: "git+".concat(_this11.x_state.central_config[':git'], ".git")
          };
          data.bugs = {
            url: "".concat(_this11.x_state.central_config[':git'], "/issues")
          };
          data.homepage = _this11.x_state.central_config[':git'];
        }

        if (_this11.x_state.central_config[':keywords']) data.keywords = _this11.x_state.central_config[':keywords'].split(','); // set port and env variables to script _dev

        var set_envs = ["APP_PORT=".concat(_this11.x_state.central_config.port), "CLUSTER=1"];

        var _loop3 = function _loop3(key) {
          if (!['aurora', 'vpc', 'aws'].includes(key) && typeof _this11.x_state.config_node[key] === 'object') {
            Object.keys(_this11.x_state.config_node[key]).map(function (attr) {
              if (key.charAt(0) != ':') {
                set_envs.push("".concat(key.toUpperCase(), "_").concat(attr.toUpperCase(), "=").concat(this.x_state.config_node[key][attr]));
              }
            }.bind(_this11));
          }
        };

        for (var key in _this11.x_state.config_node) {
          _loop3(key);
        } // omit stage as start_type; it seems its not needed
        // call hook for deploy_module (if needs to add env variables depending on deploy)


        if (_this11.deploy_module.setEnvs) {
          set_envs = yield _this11.deploy_module.setEnvs(set_envs);
        } //
        //add dependencies


        for (var pack in _this11.x_state.npm) {
          if (_this11.x_state.npm[pack].includes('http') && _this11.x_state.npm[pack].includes('github.com')) {
            data.dependencies[pack] = "git+".concat(_this11.x_state.npm[pack]);
          } else {
            data.dependencies[pack] = _this11.x_state.npm[pack];
          }
        } //add devDependencies


        for (var _pack in _this11.x_state.dev_npm) {
          if (_this11.x_state.dev_npm[_pack].includes('http') && _this11.x_state.dev_npm[_pack].includes('github.com')) {
            data.devDependencies[_pack] = "git+".concat(_this11.x_state.dev_npm[_pack]);
          } else {
            data.devDependencies[_pack] = _this11.x_state.dev_npm[_pack];
          }
        } //write to disk


        var path = require('path');

        var target = path.join(_this11.x_state.dirs.app, "package.json");
        var content = JSON.stringify(data);
        yield _this11.writeFile(target, content); //this.x_console.outT({ message:'future package.json', data:data});
      })();
    }

    createVSCodeHelpers() {
      var _this12 = this;

      return _asyncToGenerator(function* () {
        // creates Visual Studio code common helpers
        var path = require('path'); // creates /jsconfig.json file for IntelliSense


        var data = {
          include: ['./client/**/*'],
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
          exclude: ['node_modules', 'secrets']
        }; //write to disk

        var target = path.join(_this12.x_state.dirs.app, "jsconfig.json");
        var content = JSON.stringify(data);
        yield _this12.writeFile(target, content);
      })();
    }

    createServerlessYML() {
      var _this13 = this;

      return _asyncToGenerator(function* () {
        var yaml = require('yaml'),
            data = {};

        var deploy = _this13.x_state.central_config.deploy + '';

        if (deploy.includes('eb:') == false && deploy != false && deploy != 'local') {
          data.service = _this13.x_state.central_config.service_name;
          data.custom = {
            prune: {
              automatic: true,
              includeLayers: true,
              number: 1
            },
            apigwBinary: {
              types: ['*/*']
            }
          }; //add 'secrets' config json keys - cfc:12895
          //this.x_state.secrets

          for (var secret in _this13.x_state.secrets) {
            data.custom[secret] = '${file(secrets/' + secret + '.json)}';
          } //domain info


          if (_this13.x_state.central_config.dominio) {
            data.custom.customDomain = {
              domainName: _this13.x_state.central_config.dominio
            };
            if (_this13.x_state.central_config.basepath) data.custom.customDomain.basePath = _this13.x_state.central_config.basepath;
            if (_this13.x_state.central_config.stage) data.custom.customDomain.stage = _this13.x_state.central_config.stage;
            data.custom.customDomain.createRoute53Record = true;
          } //nodejs env on aws


          data.provider = {
            name: 'aws',
            runtime: 'nodejs8.10',
            timeout: _this13.x_state.central_config.timeout
          };
          if (_this13.x_state.central_config.stage) data.provider.stage = _this13.x_state.central_config.stage; //env keys

          if (Object.keys(_this13.x_state.config_node) != '') {
            data.provider.enviroment = {};
            if (_this13.x_state.central_config.stage) data.provider.enviroment.STAGE = _this13.x_state.central_config.stage;

            if (_this13.x_state.config_node.vpc) {
              data.provider.vpc = {
                securityGroupIds: [_this13.x_state.config_node.vpc.security_group_id],
                subnetIDs: []
              };

              if (_this13.x_state.secrets.vpc) {
                data.provider.vpc.securityGroupIds = ['${self:custom.vpc.SECURITY_GROUP_ID}'];
              }

              if (_this13.x_state.config_node.vpc.subnet1_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET1_ID}');
              if (_this13.x_state.config_node.vpc.subnet2_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET2_ID}');
              if (_this13.x_state.config_node.vpc.subnet3_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET3_ID}');
              if (_this13.x_state.config_node.vpc.subnet4_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET4_ID}');
              if (_this13.x_state.config_node.vpc.subnet5_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET5_ID}');
              if (_this13.x_state.config_node.vpc.subnet6_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET6_ID}');
              if (_this13.x_state.config_node.vpc.subnet7_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET7_ID}');
            }
          } //aws iam for s3 permissions (x_state.aws_iam) (@TODO later - cfc:12990)

          /*
          data.provider.iamRoleStatements = {
              Effect: 'Allow'
          };*/
          //nuxt handler


          data.functions = {
            nuxt: {
              handler: 'index.nuxt',
              events: [{
                'http': 'ANY /'
              }, {
                'http': 'ANY /{proxy+}'
              }]
            }
          };

          if (_this13.x_state.central_config['keep-warm']) {
            data.functions.nuxt.events.push({
              schedule: 'rate(20 minutes)'
            });
          } //aws resources for s3 (x_state.aws_resources) (@TODO later - no commands use them - cfc:13017)
          //serverless plugins


          data.plugins = ['serverless-apigw-binary', 'serverless-offline', 'serverless-prune-plugin'];
          if (_this13.x_state.central_config.dominio) data.plugins.push('serverless-domain-manager'); //write yaml to disk

          var content = yaml.stringify(data);

          var path = require('path');

          var target = path.join(_this13.x_state.dirs.app, "serverless.yml");
          yield _this13.writeFile(target, content); //debug
          //this.debug('future serverless.yml', content);
        }
      })();
    }

    onEnd() {
      var _this14 = this;

      return _asyncToGenerator(function* () {
        //execute deploy (npm install, etc) AFTER vue compilation (18-4-21: this is new)
        if (!_this14.errors_found) {
          if (!(yield _this14.deploy_module.deploy()) && !_this14.x_state.central_config.componente) {
            _this14.x_console.outT({
              message: 'Something went wrong deploying, check the console, fix it and run again.',
              color: 'red'
            });
          }
          yield _this14.deploy_module.post();
        }
      })();
    }

    exists(dir_or_file) {
      return _asyncToGenerator(function* () {
        var fs = require('fs').promises;

        try {
          yield fs.access(dir_or_file);
          return true;
        } catch (e) {
          return false;
        }
      })();
    }

    writeFile(file, content) {
      var _arguments = arguments,
          _this15 = this;

      return _asyncToGenerator(function* () {
        var encoding = _arguments.length > 2 && _arguments[2] !== undefined ? _arguments[2] : 'utf-8';

        var fs = require('fs').promises,
            prettier = require('prettier');

        var ext = file.split('.').splice(-1)[0].toLowerCase();
        var resp = content;

        if (ext == 'js') {
          try {
            resp = prettier.format(resp, {
              parser: 'babel',
              useTabs: true,
              singleQuote: true
            });
          } catch (ee) {
            _this15.debug("error: could not format the JS file; trying js-beautify");

            var beautify = require('js-beautify');

            var beautify_js = beautify.js;
            resp = beautify_js(resp, {});
          }
        } else if (ext == 'json') {
          resp = prettier.format(resp, {
            parser: 'json'
          });
        } else if (ext == 'vue') {
          try {
            resp = prettier.format(resp.replaceAll("=\"xpropx\"", ''), {
              parser: 'vue',
              htmlWhitespaceSensitivity: 'ignore',
              useTabs: true,
              printWidth: 2000,
              embeddedLanguageFormatting: 'auto',
              singleQuote: true,
              trailingComma: 'none'
            });
          } catch (ee) {
            _this15.debug("warning: could not format the vue file; trying vue-beautify", ee);

            var _beautify = require('js-beautify');

            var beautify_vue = _beautify.html;
            resp = beautify_vue(resp, {});
          }
        } else if (ext == 'css') {
          resp = prettier.format(resp, {
            parser: 'css'
          });
        }

        yield fs.writeFile(file, resp, encoding);
      })();
    } //Transforms the processed nodes into files.


    onCreateFiles(processedNodes) {
      var _this16 = this;

      return _asyncToGenerator(function* () {
        require('fs').promises;
            var path = require('path'); //this.x_console.out({ message:'onCreateFiles', data:processedNodes });
        //this.x_console.out({ message:'x_state', data:this.x_state });


        yield _this16._writeModelos(); //await this.generalConfigSetup();

        yield _this16.createGitIgnore();
        yield _this16.createErrorTemplate();
        yield _this16.createJSDoc();
        yield _this16.createReadme();
        yield _this16.createBinFile(); //write .npmrc file for ffmpeg support

        _this16.writeFile(path.join(_this16.x_state.dirs.app, '.npmrc'), "unsafe-perm=true");

        _this16.debug('processing nodes'); //group functions into express models (first folder is dad model)

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


        yield _this16.createPackageJSON();
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
      })();
    } // ************************
    // INTERNAL HELPER METHODS 
    // ************************

    /*
     * Returns true if a local server is running on the DSL defined port
     */


    _isLocalServerRunning() {
      var _this17 = this;

      return _asyncToGenerator(function* () {
        var is_reachable = require('is-port-reachable');

        var resp = yield is_reachable(_this17.x_state.central_config.port);
        return resp;
      })();
    }
    /*
     * Reads the node called modelos and creates tables definitions and managing code (alias:database).
     */


    _readModelos() {
      var _this18 = this;

      return _asyncToGenerator(function* () {
        // @IDEA this method could return the insert/update/delete/select 'function code generators'
        _this18.debug('_readModelos');

        _this18.debug_time({
          id: 'readModelos'
        });

        var modelos = yield _this18.dsl_parser.getNodes({
          text: 'modelos',
          level: 2,
          icon: 'desktop_new',
          recurse: true
        }); //nodes_raw:true	

        var tmp = {
          appname: _this18.x_state.config_node.name
        },
            fields_map = {};
        var resp = {
          tables: {},
          attributes: {},
          length: 0,
          doc: ''
        }; // map our values to real database values 

        var type_map = {
          id: {
            value: 'INT AUTOINCREMENT PRIMARY KEY',
            alias: ['identificador', 'autoid', 'autonum', 'key']
          },
          texto: {
            value: 'STRING',
            alias: ['text', 'varchar', 'string']
          },
          int: {
            value: 'INTEGER',
            alias: ['numero chico', 'small int', 'numero']
          },
          float: {
            value: 'FLOAT',
            alias: ['decimal', 'real']
          },
          boolean: {
            value: 'BOOLEAN',
            alias: ['boleano', 'true/false']
          },
          date: {
            value: 'DATEONLY',
            alias: ['fecha']
          },
          datetime: {
            value: 'DATETIME',
            alias: ['fechahora']
          },
          blob: {
            value: 'BLOB',
            alias: ['binario', 'binary']
          }
        }; // expand type_map into fields_map

        Object.keys(type_map).map(function (x) {
          var aliases = type_map[x].alias;
          aliases.push(x);
          aliases.map(y => {
            fields_map[y] = type_map[x].value;
          });
        }); // search real modelos nodes (ignore folders)

        var modelos_x = [];

        if (modelos.length > 0) {
          var ccase = require('fast-case');

          for (var main of modelos[0].nodes) {
            if (main.icons.includes('list')) {
              for (var child of main.nodes) {
                var with_folder = _objectSpread2({}, child); //@change: this is a breaking change - 23-may-21


                with_folder.text = ccase.camelize(main.text) + '/' + ccase.camelize(child.text);
                modelos_x.push(with_folder);
              }
            } else {
              // this is a real modelo node
              modelos_x.push(main);
            }
          }
        }

        modelos = [{
          nodes: modelos_x
        }]; // parse nodes into tables with fields

        if (modelos.length > 0) {
          //modelos[0].attributes.map(x=>{ resp.attributes={...resp.attributes,...x} }); //modelos attributes
          resp.attributes = _objectSpread2({}, modelos[0].attributes);
          resp.doc = modelos[0].text_note;
          resp.length = modelos[0].nodes.length;

          for (var table of modelos[0].nodes) {
            var fields = _objectSpread2({}, table.attributes); //table.attributes.map(x=>{ fields={...fields,...x} }); //table attributes


            resp.tables[table.text] = {
              fields: {}
            }; //create table

            tmp.sql_fields = [];

            for (var field in fields) {
              resp.tables[table.text].fields[field] = fields_map[fields[field]]; //assign field with mapped value

              tmp.sql_fields.push(field + ' ' + fields_map[fields[field]]);
            }

            resp.tables[table.text].sql = "CREATE TABLE ".concat(table.text, "(").concat(tmp.sql_fields.join(','), ")"); // test special attrs

            if (table[':dbname']) resp.tables[table.text].db = table[':dbname'];
            if (table[':tipo']) resp.tables[table.text].type = table[':tipo'];
            if (table[':type']) resp.tables[table.text].type = table[':type'];
            if (table[':tipo']) resp.tables[table.text].type = table[':tipo'];

            if (table[':index']) {
              if (!resp.tables[table.text].indexes) resp.tables[table.text].indexes = [];
              resp.tables[table.text].indexes.push({
                name: _this18.hash(table.text + '_' + table[':idex']),
                unique: false,
                fields: table[':index'].split(',')
              });
            }

            if (table[':index_unique']) {
              if (!resp.tables[table.text].indexes) resp.tables[table.text].indexes = [];
              resp.tables[table.text].indexes.push({
                name: _this18.hash(table.text + '_' + table[':idex']),
                unique: true,
                fields: table[':index_unique'].split(',')
              });
            } //


            yield _this18.setImmediatePromise(); //@improved
          }
        } // create virtual table 'if' central node 'log'='modelo


        if (_this18.x_state.central_config.log && _this18.x_state.central_config.log.includes('model')) {
          resp.tables['console_log'] = {
            fields: {
              id: 'INT AUTOINCREMENT PRIMARY KEY',
              class: 'STRING',
              method: 'STRING',
              message: 'STRING',
              date: 'DATE'
            }
          };
        } // add sequelize package


        _this18.x_state.npm['sequelize'] = '*';

        _this18.debug_timeEnd({
          id: 'readModelos'
        }); // return 


        return resp;
      })();
    }

    _writeModelos() {
      var _this19 = this;

      return _asyncToGenerator(function* () {
        _this19.debug('_writeModelos');

        _this19.debug_time({
          id: 'writeModelos'
        });

        var path = require('path'),
            fs = require('fs').promises; // ******************************************************
        // create db_models sequelize schema files @todo
        // ******************************************************


        for (var table in _this19.x_state.models.tables) {
          // define file name
          var target_file = [],
              db_name = '';

          if (table.includes('/')) {
            target_file.push(table.split('/')[0]);
            target_file.push(table.split('/').pop() + '.js');
            db_name = target_file[0] + '_' + target_file[1].replace('.js', '');
          } else {
            target_file.push(table + '.js');
            db_name = table;
          }

          var target = path.join(_this19.x_state.dirs.db_models, target_file.join('/')); // create target folder

          var jfolder = path.dirname(target);

          try {
            yield fs.mkdir(jfolder, {
              recursive: true
            });
          } catch (errdir) {} // content


          var fields = _this19.x_state.models.tables[table].fields;
          var model = {};
          var map = {
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

          for (var key in fields) {
            if (fields[key] in map) {
              model[key] = map[fields[key]];
            }
          }

          var content = "module.exports = (sequelize, type) => {\n                return sequelize.define('".concat(db_name, "', ").concat(_this19.jsDump(model, 'type.'), ");\n            }"); // write file

          yield _this19.writeFile(target, content);
        } // ******************************************************
        // create db.js for 'aurora' if defined on config node
        // ******************************************************


        if (_this19.x_state.config_node.aurora) {
          _this19.x_state.npm['mysql2'] = '*';
          _this19.x_state.npm['sequelize'] = '*';
          var _content = "const Sequelize = require('sequelize');\n";

          for (var _table in _this19.x_state.models.tables) {
            if (_table.includes('/')) {
              var _info = {
                folder: '',
                table: ''
              };
              _info.folder = _table.split('/')[0];
              _info.table = _table.split('/').pop();
              _content += "const db_".concat(_info.folder, "_").concat(_info.table, " = require('./db_models/").concat(_info.folder, "/").concat(_info.table, "');\n");
            } else {
              _content += "const db_".concat(_table, " = require('./db_models/").concat(_table, "');\n");
            }
          }

          var seq_config = {
            logging: _this19.x_state.central_config.dblog,
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
          _content += "const sequelize = new Sequelize(\n                process.env.AURORA_NAME,\n                process.env.AURORA_USER,\n                process.env.AURORA_PASSWORD,\n                ".concat(_this19.jsDump(seq_config), "\n            );\n            // check if given database exists, or create it\n            sequelize.query(\"CREATE DATABASE IF NOT EXISTS \"+process.env.AURORA_NAME).then(function(){});\n");
          var models = [];

          for (var _table2 in _this19.x_state.models.tables) {
            if (_table2.includes('/')) {
              var _info2 = {
                folder: '',
                table: ''
              };
              _info2.folder = _table2.split('/')[0];
              _info2.table = _table2.split('/').pop();
              models.push("".concat(_info2.folder, "_").concat(_info2.table));
              _content += "const ".concat(_info2.folder, "_").concat(_info2.table, " = db_").concat(_info2.folder, "_").concat(_info2.table, "(sequelize, Sequelize);\n");
            } else {
              models.push(info.table);
              _content += "const ".concat(_table2, " = db_").concat(_table2, "(sequelize, Sequelize);;\n");
            }
          } // add closing code


          _content += "const Models = { ".concat(models.join(','), " }\n\n            const connection = {};\n\n            module.exports = async() => {\n                if (connection.isConnected) {\n                    console.log('=> Using existing connection.');\n                    return Models;\n                }\n\n                await sequelize.sync({ alter:true });\n                await sequelize.authenticate()\n                connection.isConnected = true;\n                console.log('=> Created a new connection.');\n                return Models;\n            }\n            "); // write db.js file

          var _target2 = path.join(_this19.x_state.dirs.app, 'db.js');

          yield _this19.writeFile(_target2, _content);
        }

        _this19.debug_timeEnd({
          id: 'writeModelos'
        });
      })();
    }
    /* 
     * Grabs central node configuration information
     */


    _readCentralConfig() {
      var _this20 = this;

      return _asyncToGenerator(function* () {
        _this20.debug('_readCentralConfig');

        var central = yield _this20.dsl_parser.getNodes({
          level: 1,
          recurse: false
        }); //this.debug('central search',central);
        // set defaults

        var resp = {
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
          'rtc:admin': '',
          port: 8081,
          git: true,
          readme: central[0].text_note.trim(),
          'keep-alive': true,
          'keep-warm': true,
          ':cache': _this20.x_config.cache,
          ':keywords': '',
          ':author': 'Punto Origen SpA',
          ':license': 'MIT',
          ':github': '',
          ':version': '1.0.0',
          ':description': central[0].text_note,
          default_face: central[0].font.face,
          default_size: central[0].font.size,
          apptitle: central[0].text
        }; // overwrite default resp with info from central node
        //resp = {...resp, ...central[0].attributes };
        //bit slower but transforms string booleans (19-4-21)

        var values = {};

        for (var xz in central[0].attributes) {
          var x = central[0].attributes[xz];

          if (x == 'true') {
            x = true;
          } else if (x == 'false') {
            x = false;
          }

          values = _objectSpread2(_objectSpread2({}, values), {
            [xz]: x
          });
        }

        resp = _objectSpread2(_objectSpread2({}, resp), values);
        /*central[0].attributes.map(function(x) {
        	resp = {...resp,...x};
        });*/

        if (resp.dominio) {
          resp.service_name = resp.dominio.replace(/\./g, '').toLowerCase();
        } else {
          resp.service_name = resp.apptitle;
        }

        if (!resp[':cache']) _this20.x_config.cache = false; // disables cache when processing nodes (@todo)
        // return

        return resp;
      })();
    }
    /*
     * Grabs the configuration from node named 'config'
     */


    _readConfig() {
      var _this21 = this;

      return _asyncToGenerator(function* () {
        _this21.debug('_readConfig');

        var resp = {
          id: '',
          meta: [],
          seo: {},
          secrets: {}
        },
            config_node = {};
        var search = yield _this21.dsl_parser.getNodes({
          text: 'config',
          level: 2,
          icon: 'desktop_new',
          recurse: true
        }); //this.debug({ message:'search says',data:search, prefix:'_readConfig,dim' });
        //

        if (search.length > 0) {
          config_node = search[0]; // define default font_face

          resp.default_face = config_node.font.face;
          resp.default_size = config_node.font.size; // apply children nodes as keys/value for resp

          for (var key of config_node.nodes) {
            // apply keys as config keys (standard config node by content types)
            if (key.icons.includes('button_cancel') == false) {
              if (Object.keys(key.attributes).length > 0) {
                // prepare config key
                var config_key = key.text.toLowerCase().replace(/ /g, ''); //alt1 let values = {...key.attributes }; 
                //alt2, bit slower but considers booleans as string

                var values = {};

                for (var xz in key.attributes) {
                  var x = key.attributes[xz];

                  if (x == 'true') {
                    x = true;
                  } else if (x == 'false') {
                    x = false;
                  }

                  values = _objectSpread2(_objectSpread2({}, values), {
                    [xz]: x
                  });
                }

                resp[config_key] = values; // mark secret status true if contains 'password' icon

                if (key.icons.includes('password')) resp[config_key][':secret'] = true; // add link attribute if defined

                if (key.link != '') resp[config_key][':link'] = key.link;
              } else if (key.nodes.length > 0) {
                resp[key.text] = key.nodes[0].text;
              } else if (key.link != '') {
                resp[key.text] = key.link;
              }
            } //

          }
        } // assign dsl file folder name+filename if node.name is not given


        if (!resp.name) {
          var path = require('path');

          var dsl_folder = path.dirname(path.resolve(_this21.x_flags.dsl));
          var parent_folder = path.resolve(dsl_folder, '../');
          var folder = dsl_folder.replace(parent_folder, '');
          resp.name = folder.replace('/', '').replace('\\', '') + '_' + path.basename(_this21.x_flags.dsl, '.dsl'); //console.log('folder:',{folder,name:resp.name});
          //this.x_flags.dsl
        } // create id if not given


        if (!resp.id) resp.id = 'com.puntorigen.' + resp.name;
        return resp;
      })();
    }

    getParentNodes() {
      var _arguments2 = arguments,
          _this22 = this;

      return _asyncToGenerator(function* () {
        var id = _arguments2.length > 0 && _arguments2[0] !== undefined ? _arguments2[0] : _this22.throwIfMissing('id');
        var exec = _arguments2.length > 1 && _arguments2[1] !== undefined ? _arguments2[1] : false;
        var parents = yield _this22.dsl_parser.getParentNodesIDs({
          id,
          array: true
        });
        var resp = [];

        for (var parent_id of parents) {
          var node = yield _this22.dsl_parser.getNode({
            id: parent_id,
            recurse: false
          });
          var command = yield _this22.findValidCommand({
            node,
            object: exec
          });
          if (command) resp.push(command);
          yield setImmediatePromise(); //@improved
        }

        return resp;
      })();
    } //objeto to attributes tag version


    struct2params() {
      var struct = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.throwIfMissing('id');

      var resp = [],
          tmp = _objectSpread2({}, struct); // pre-process


      if ('aos' in tmp) {
        var aos_p = struct['aos'].split(',');

        if (aos_p.length == 3) {
          tmp['data-aos'] = aos_p[0];
          tmp['data-aos-duration'] = aos_p[1];
          tmp['data-aos-delay'] = aos_p[2];
        } else {
          tmp['data-aos'] = aos_p[0];
          tmp['data-aos-duration'] = aos_p[1];
        }

        delete tmp['aos'];
      } // process


      for (var [key, value] of Object.entries(tmp)) {
        if (value == null) {
          //needed cause cheerio assigns empty values to props, and vue props don't have values
          //little hack that works together with writeFile method
          resp.push("".concat(key, "=\"xpropx\""));
        } else if (typeof value !== 'object' && typeof value !== 'function' && typeof value !== 'undefined') {
          resp.push("".concat(key, "=\"").concat(value, "\""));
        } else if (typeof value === 'object') {
          //serialize value
          resp.push("".concat(key, "=\"").concat(this.jsDump(value), "\""));
        }
      }

      return resp.join(' ');
    } //serializes the given obj escaping quotes from values containing js code


    jsDump(obj) {
      var leave_as_is_if_contains = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var resp = '';

      var isNumeric = function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      };

      var escape = function escape(obi) {
        var nuevo = '',
            ob = obi; //special escapes first

        if (typeof ob === 'string') ob = ob.replaceAll('{now}', 'new Date()'); //

        if (typeof ob === 'number') {
          nuevo += ob;
        } else if (typeof ob === 'boolean') {
          nuevo += ob;
        } else if (typeof ob === 'string' && ob.substr(0, 2) == '**' && ob.substr(ob.length - 2) == '**') {
          nuevo += ob.replaceAll('**', ''); //escape single ** vars 21-abr-21
        } else if (typeof ob === 'string' && (ob.charAt(0) == '!' || ob.indexOf('this.') != -1 || ob.indexOf('new ') != -1 || ob.indexOf("'") != -1 || ob.indexOf('`') != -1 || leave_as_is_if_contains != '' && ob.indexOf(leave_as_is_if_contains) != -1 || ob.includes('process.') || ob.charAt(0) != '0' && isNumeric(ob) || ob == '0' || ob == 'true' || ob == 'false')) {
          nuevo += ob;
        } else if (typeof ob === 'string') {
          nuevo += "'".concat(ob, "'");
        } else {
          nuevo += ob;
        }

        return nuevo;
      };

      if (Array.isArray(obj)) {
        var tmp = [];

        for (var item in obj) {
          tmp.push(this.jsDump(obj[item], leave_as_is_if_contains));
        }

        resp = "[".concat(tmp.join(','), "]");
      } else if (typeof obj === 'object') {
        var _tmp = [];

        for (var llave in obj) {
          var llavet = llave;
          if (llavet.includes('-') && llavet.includes("'") == false) llavet = "'".concat(llave, "'");
          var nuevo = "".concat(llavet, ": ");
          var valor = obj[llave];

          if (typeof valor === 'object' || Array.isArray(valor)) {
            nuevo += this.jsDump(valor, leave_as_is_if_contains);
          } else {
            nuevo += escape(valor);
          }

          _tmp.push(nuevo);
        }

        resp = "{\n".concat(_tmp.join(','), "\n}");
      } else if (typeof obj === 'string') {
        resp = escape(obj);
      } else {
        resp = obj;
      }

      return resp;
    } // hash helper method


    hash(thing) {
      var _this23 = this;

      return _asyncToGenerator(function* () {
        var resp = yield _this23.dsl_parser.hash(thing);
        return resp;
      })();
    } // atLeastNode


    atLeastNode(r) {
      var n = process.versions.node.split('.').map(x => parseInt(x, 10));
      r = r.split('.').map(x => parseInt(x, 10));
      return n[0] > r[0] || n[0] === r[0] && (n[1] > r[1] || n[1] === r[1] && n[2] >= r[2]);
    }

    setImmediatePromise() {
      //for preventing freezing node thread within loops (fors)
      return new Promise(resolve => {
        setImmediate(() => resolve());
      });
    }

  }

  return eb_dsl;

})));
