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
          spinner.fail('Build failed');

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
    }

    codeForModel(model) {
      return _asyncToGenerator(function* () {
        //express = {models,routes}
        //returns array with records of lines of code
        return [];
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

          if (_this.context.x_config.nodeploy && _this.context.x_config.nodeploy == true) {
            _this.context.x_console.outT({
              message: "Aborting final deployment as requested",
              color: 'brightRed'
            });

            return true;
          } else {
            build.deploy_local = yield _this.run();

            if (build.deploy_local.length > 0) {
              _this.context.x_console.outT({
                message: "There was an error deploying locally.",
                color: 'red',
                data: build.deploy_local.toString()
              });

              return false;
            }
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

    codeForModel(model) {
      var _this3 = this;

      return _asyncToGenerator(function* () {
        //express = {models,routes}
        //returns array with records of lines of code
        var resp = []; //aws config requirements

        if (_this3.context.x_state.npm['aws-sdk']) {
          var aws_data = {};

          if (!_this3.context.x_state.config_node.aws) {
            _this3.context.x_state.npm['aws-get-credentials'] = '*';
            resp.push("const AWS = require('aws-sdk');\n                (async function() {\n                    const { getAWSCredentials } = require('aws-get-credentials');\n                    AWS.config.credentials = await getAWSCredentials();;\n                })();\n                const AWS_s3 = new AWS.S3();");
          } else {
            aws_data = {
              accessKeyId: _this3.context.x_state.config_node.aws.access,
              secretAccessKey: _this3.context.x_state.config_node.aws.secret
            };

            if (_this3.context.x_state.config_node.aws.region) {
              aws_data.region = _this3.context.x_state.config_node.aws.region;
            }

            resp.push("const AWS = require('aws-sdk');\n                AWS.config.update(".concat(_this3.context.jsDump(aws_data), ");\n                const AWS_s3 = new AWS.S3();"));
          }
        }

        return resp;
      })();
    }

  }

  class eb extends base_deploy {
    constructor() {
      var {
        context = {}
      } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      super({
        context,
        name: 'AWS EB'
      });
    }

    logo() {
      return _asyncToGenerator(function* () {
        var asciify = require('asciify-image'),
            path = require('path');

        var aws = path.join(__dirname, 'assets', 'aws.png');
        var logo_txt = yield asciify(aws, {
          fit: 'width',
          width: 25
        });
        console.log(logo_txt);
      })();
    }

    deploy() {
      var _this = this;

      return _asyncToGenerator(function* () {
        var build = {};

        _this.context.x_console.title({
          title: 'Deploying to Amazon AWS Elastic Bean',
          color: 'green'
        });

        yield _this.logo(); // builds the app

        build.try_build = yield _this.base_build();

        if (build.try_build.length > 0) {
          _this.context.x_console.outT({
            message: "There was an error building the project.",
            color: 'red'
          });

          return false;
        } // deploys to aws


        build.deploy_aws_eb = yield _this.run(); //test if results.length>0 (meaning there was an error)

        if (build.deploy_aws_eb.length > 0) {
          _this.context.x_console.outT({
            message: "There was an error deploying to Amazon AWS.",
            color: 'red',
            data: build.deploy_aws_eb.toString()
          });

          return false;
        }

        return true;
      })();
    }

    _createEBx_configNode() {
      var _this2 = this;

      return _asyncToGenerator(function* () {
        // create 01_confignode content for setting ENV vars within EB instance
        var yaml = require('yaml');

        var data = {
          option_settings: {
            'aws:elasticbeanstalk:application:environment': {
              APP_PORT: _this2.context.central_config.port,
              CLUSTER: 1,
              START_TYPE: 'development'
            }
          }
        }; //instancetype

        if (_this2.context.central_config.instance_type) {
          data.option_settings.container_commands = {
            'aws:autoscaling:launchconfiguration': {
              InstanceType: _this2.context.central_config.instance_type
            }
          };
        } //port


        if (_this2.context.central_config.port != 8081) {
          data.container_commands = {
            '00_remove_redirect_http': {
              command: 'sudo iptables -t nat -D PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080'
            },
            '01_add_redirect_http': {
              command: "sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port ".concat(_this2.context.central_config.port)
            }
          };
          data.option_settings['aws:elasticbeanstalk:environment'] = {
            EnvironmentType: 'SingleInstance'
          };
        } //stage & env_variables


        if (_this2.context.central_config.stage && _this2.context.central_config.stage != '') {
          data.option_settings['aws:elasticbeanstalk:application:environment'].STAGE = _this2.context.central_config.stage;

          if (_this2.context.central_config.stage != 'dev') {
            data.option_settings['aws:elasticbeanstalk:application:environment'].START_TYPE = _this2.context.central_config.stage;
          }
        }

        var _loop = function _loop(key) {
          // omit special config 'reserved' (aurora,vpc,aws) node keys
          if (!['copiar'].includes(key) && typeof _this2.context.x_state.config_node[key] === 'object') {
            Object.keys(_this2.context.x_state.config_node[key]).map(function (attr) {
              data.option_settings['aws:elasticbeanstalk:application:environment'][key.toUpperCase() + '_' + attr.toUpperCase()] = this.context.config_node[key][attr];
            }.bind(_this2));
          }
        };

        for (var key in _this2.context.x_state.config_node) {
          _loop(key);
        } //write


        var path = require('path');

        var eb_base = _this2.context.x_state.dirs.app;
        var eb_dir = path.join(eb_base, '.ebextensions');
        yield _this2.context.writeFile(path.join(eb_dir, '01_confignode.config'), yaml.stringify(data, {
          version: '1.1'
        }));
      })();
    }

    _createEBx_timeout() {
      var _this3 = this;

      return _asyncToGenerator(function* () {
        // create 01_confignode content for setting ENV vars within EB instance
        if (_this3.context.central_config.timeout) {
          var yaml = require('yaml');

          var data = {
            container_commands: {
              extend_proxy_timeout: {
                command: "sed -i '/s*location / {/c         client_max_body_size 500M;         location / {                 proxy_connect_timeout       ".concat(_this3.context.central_config.timeout, ";                proxy_send_timeout          ").concat(_this3.context.central_config.timeout, ";                proxy_read_timeout          ").concat(_this3.context.central_config.timeout, ";                send_timeout                ").concat(_this3.context.central_config.timeout, ";        ' /tmp/deployment/config/##etc##nginx##conf.d##00_elastic_beanstalk_proxy.conf")
              }
            }
          }; //write

          var path = require('path');

          var eb_base = _this3.context.x_state.dirs.app;
          var eb_dir = path.join(eb_base, '.ebextensions');
          yield _this3.context.writeFile(path.join(eb_dir, 'extend-proxy-timeout.config'), yaml.stringify(data, {
            version: '1.1'
          }));
        }
      })();
    }

    _createEBx_sockets() {
      var _this4 = this;

      return _asyncToGenerator(function* () {
        // create enable-websockets.config
        var yaml = require('yaml');

        var data = {
          container_commands: {
            enable_websockets: {
              command: "sed -i '/s*proxy_set_headers*Connection/c         proxy_set_header Upgrade $http_upgrade;        proxy_set_header Connection \"\"upgrade\"\";        ' /tmp/deployment/config/##etc##nginx##conf.d##00_elastic_beanstalk_proxy.conf"
            }
          }
        }; //write

        var path = require('path');

        var eb_base = _this4.context.x_state.dirs.app;
        var eb_dir = path.join(eb_base, '.ebextensions');
        yield _this4.context.writeFile(path.join(eb_dir, 'enable-websockets.config'), yaml.stringify(data, {
          version: '1.1'
        }));
      })();
    }

    _createEBx_puppeteer() {
      var _this5 = this;

      return _asyncToGenerator(function* () {
        // create puppeteer.config (chromium support)
        var yaml = require('yaml');

        var data = {
          container_commands: {
            install_chrome: {
              command: 'curl https://intoli.com/install-google-chrome.sh | bash'
            }
          }
        }; //write

        var path = require('path');

        var eb_base = _this5.context.x_state.dirs.app;
        var eb_dir = path.join(eb_base, '.ebextensions');
        yield _this5.context.writeFile(path.join(eb_dir, 'puppeteer.config'), yaml.stringify(data, {
          version: '1.1'
        }));
      })();
    }

    run() {
      var _this6 = this;

      return _asyncToGenerator(function* () {
        var spawn = require('await-spawn');

        var errors = []; //AWS EB deploy

        _this6.context.debug('AWS EB deploy');

        var eb_full = _this6.context.x_state.central_config.deploy.replaceAll('eb:', '');

        var eb_appname = eb_full;
        var eb_instance = "".concat(eb_appname, "-dev");

        if (_this6.context.x_state.central_config.deploy.contains(',')) {
          eb_appname = eb_full.split(',')[0];
          eb_instance = eb_full.split(',').splice(-1)[0];
        }

        if (eb_appname != '') {
          var spinner = _this6.context.x_console.spinner({
            message: 'Creating config files'
          }); //this.x_console.outT({ message:`Creating EB config yml: ${eb_appname} in ${eb_instance}`, color:'yellow' });
          //create .ebextensions directory


          var path = require('path'),
              fs = require('fs').promises;

          var eb_base = _this6.context.x_state.dirs.app;
          var eb_dir = path.join(eb_base, '.ebextensions');

          try {
            yield fs.mkdir(eb_dir, {
              recursive: true
            });
          } catch (ef) {} //write .npmrc file


          yield _this6.context.writeFile(path.join(eb_base, '.npmrc'), 'unsafe-perm=true'); //write .ebextensions/01_confignode.config

          yield _this6._createEBx_configNode(); //write .ebextensions/extend-proxy-timeout.config

          yield _this6._createEBx_timeout(); //enable websockets?

          if (_this6.context.central_config.rtc == true) {
            yield _this6._createEBx_sockets();
          }

          if (_this6.context.npm.puppeteer || _this6.context.npm['puppeteer-code']) {
            yield _this6._createEBx_puppeteer();
          } //create .ebignore file


          var eb_ig = "node_modules/\njspm_packages/\n.npm\n.node_repl_history\n*.tgz\n.yarn-integrity\n.editorconfig\n# Mac OSX\n.DS_Store\n# Elastic Beanstalk Files\n.elasticbeanstalk/*\n!.elasticbeanstalk/*.cfg.yml\n!.elasticbeanstalk/*.global.yml";
          yield _this6.context.writeFile(path.join(eb_base, '.ebignore'), eb_ig); //init git if not already

          spinner.succeed('EB config files created successfully');
          var results = {};

          if (!(yield _this6.exists(path.join(eb_base, '.git')))) {
            //git directory doesn't exist
            _this6.context.x_console.outT({
              message: 'CREATING .GIT DIRECTORY'
            });

            spinner.start('Initializing project git repository');
            spinner.text('Creating .gitignore file');
            var git_ignore = "# Mac System files\n.DS_Store\n.DS_Store?\n__MACOSX/\nThumbs.db\n# EB files\nnode_modules/";
            yield _this6.context.writeFile(path.join(eb_base, '.gitignore'), git_ignore);
            spinner.succeed('.gitignore created');
            spinner.start('Initializing local git repository ..');

            try {
              results.git_init = yield spawn('git', ['init', '-q'], {
                cwd: eb_base
              });
              spinner.succeed('GIT initialized');
            } catch (gi) {
              results.git_init = gi;
              spinner.fail('GIT failed to initialize');
              errors.push(gi);
            }

            spinner.start('Adding files to local git ..');

            try {
              results.git_add = yield spawn('git', ['add', '.'], {
                cwd: eb_base
              });
              spinner.succeed('git added files successfully');
            } catch (gi) {
              results.git_add = gi;
              spinner.fail('git failed to add local files');
              errors.push(gi);
            }

            spinner.start('Creating first git commit ..');

            try {
              results.git_commit = yield spawn('git', ['commit', '-m', 'Inicial'], {
                cwd: eb_base
              });
              spinner.succeed('git created first commit successfully');
            } catch (gi) {
              results.git_commit = gi;
              spinner.fail('git failed to create first commit');
              errors.push(gi);
            }
          }

          spinner.start('Deploying to AWS ElasticBean .. please wait'); // execute eb deploy

          try {
            if (_this6.context.x_config.nodeploy && _this6.context.x_config.nodeploy == true) {
              spinner.succeed('EB ready to be deployed (nodeploy as requested)');

              _this6.context.x_console.outT({
                message: "Aborting final deployment as requested",
                color: 'brightRed'
              });
            } else {
              results.eb_deploy = yield spawn('eb', ['deploy', eb_instance], {
                cwd: eb_base
              }); //, stdio:'inherit'

              spinner.succeed('EB deployed successfully');
            }
          } catch (gi) {
            //test if eb failed because instance has not being created yet, if so create it
            results.eb_deploy = gi;
            spinner.warn('EB failed to deploy'); //this.x_console.outT({ message:gi.toString(), color:'red'});

            if (gi.code == 4) {
              // IAM credentials are invalid or instance hasn't being created (eb create is missing)
              spinner.start('Checking if AWS credentials are valid ..');

              try {
                results.eb_create = yield spawn('aws', ['sts', 'get-caller-identity'], {
                  cwd: eb_base
                }); //, stdio:'inherit'

                spinner.succeed('AWS credentials are ok');
              } catch (aws_cred) {
                spinner.fail('Current AWS credentials are invalid');
                errors.push(aws_cred);
              }

              if (errors.length == 0) {
                spinner.start('EB it seems this is a new deployment: issuing eb create');

                try {
                  //console.log('\n');
                  results.eb_create = yield spawn('eb', ['create', eb_instance], {
                    cwd: eb_base
                  }); //, stdio:'inherit'

                  spinner.succeed('EB created and deployed successfully');
                } catch (ec) {
                  _this6.context.x_console.outT({
                    message: gi.stdout.toString(),
                    color: 'red'
                  });

                  spinner.fail('EB creation failed');
                  errors.push(gi);
                }
              }
            } else {
              _this6.context.x_console.outT({
                message: 'error: eb create (exitcode:' + gi.code + '):' + gi.stdout.toString(),
                color: 'red'
              });

              errors.push(gi);
            }
          } //if errors.length==0 && this.x_state.central_config.debug=='true'


          if (errors.length == 0 && _this6.context.x_state.central_config.debug == true && !_this6.context.x_config.nodeploy) {
            //open eb logging console
            var ci = require('ci-info');

            if (ci.isCI == false) {
              spinner.start('Opening EB debug terminal ..');

              try {
                var abs_cmd = path.resolve(eb_base);
                var cmd = "clear; sleep 2; clear; cd ".concat(abs_cmd, " && clear && eb open ").concat(eb_instance);
                results.eb_log = yield spawn('npx', ['terminal-tab', cmd], {
                  cwd: abs_cmd
                }); //, detached:true

                spinner.succeed("EB logging opened on new tab successfully");
              } catch (ot) {
                results.eb_log = ot;
                spinner.fail("I was unable to open a new tab terminal window with the EB debugging console");
              }
            } else {
              spinner.warn("Omitting EB debug, because a CI env was detected.");
            }
          } // eb deploy done

        }

        return errors;
      })();
    } //****************************
    // onPrepare and onEnd steps
    //****************************


    post() {
      var _this7 = this;

      return _asyncToGenerator(function* () {
        //restores aws credentials if modified by onPrepare after deployment
        if (!_this7.context.x_state.central_config.componente && _this7.context.x_state.central_config.deploy && _this7.context.x_state.central_config.deploy.indexOf('eb:') != -1 && _this7.context.x_state.config_node.aws) {
          // @TODO add this block to deploys/eb 'post' method and onPrepare to 'pre' 20-br-21
          // only execute after deploy and if user requested specific aws credentials on map
          var path = require('path'),
              copy = require('recursive-copy'),
              os = require('os');

          var fs = require('fs');

          var aws_bak = path.join(_this7.context.x_state.dirs.base, 'aws_backup.ini');
          var aws_file = path.join(os.homedir(), '/.aws/') + 'credentials'; // try to copy aws_bak over aws_ini_file (if bak exists)

          if (yield _this7.context.exists(aws_bak)) {
            yield copy(aws_bak, aws_file, {
              overwrite: true,
              dot: true,
              debug: false
            }); // remove aws_bak file

            yield fs.promises.unlink(aws_bak);
          }
        }
      })();
    }

    pre() {
      var _this8 = this;

      return _asyncToGenerator(function* () {
        if (!_this8.context.x_state.central_config.componente && _this8.context.x_state.central_config.deploy && _this8.context.x_state.central_config.deploy.indexOf('eb:') != -1) {
          // if deploying to AWS eb:x, then recover/backup AWS credentials from local system
          var ini = require('ini'),
              path = require('path'),
              fs = require('fs').promises; // read existing AWS credentials if they exist


          var os = require('os');

          var aws_ini = '';
          var aws_folder = path.join(os.homedir(), '/.aws/');
          var aws_ini_file = path.join(aws_folder, 'credentials');

          try {
            //this.debug('trying to read AWS credentials:',aws_ini_file);
            aws_ini = yield fs.readFile(aws_ini_file, 'utf-8'); //this.context.debug('AWS credentials:',aws_ini);
          } catch (err_reading) {} // 


          if (_this8.context.x_state.config_node.aws) {
            // if DSL defines temporal AWS credentials for this app .. 
            // create backup of aws credentials, if existing previously
            if (aws_ini != '') {
              var aws_bak = path.join(_this8.context.x_state.dirs.base, 'aws_backup.ini');

              _this8.context.x_console.outT({
                message: "config:aws:creating .aws/credentials backup",
                color: 'yellow'
              });

              yield fs.writeFile(aws_bak, aws_ini, 'utf-8');
            } // debug


            _this8.context.x_console.outT({
              message: "config:aws:access ->".concat(_this8.context.x_state.config_node.aws.access)
            });

            _this8.context.x_console.outT({
              message: "config:aws:secret ->".concat(_this8.context.x_state.config_node.aws.secret)
            }); // transform config_node.aws keys into ini


            var to_ini = ini.stringify({
              aws_access_key_id: _this8.context.x_state.config_node.aws.access,
              aws_secret_access_key: _this8.context.x_state.config_node.aws.secret
            }, {
              section: 'default'
            });

            _this8.context.debug('Setting .aws/credentials from config node'); // save as .aws/credentials (ini file)


            try {
              yield fs.writeFile(aws_ini_file, to_ini, 'utf-8');
            } catch (errdir) {
              //if fails, maybe target dir doesn't exist
              try {
                yield fs.mkdir(aws_folder, {
                  recursive: true
                });
              } catch (errdir2) {}
            }
          } else if (aws_ini != '') {
            // if DSL doesnt define AWS credentials, use the ones defined within the local system.
            var parsed = ini.parse(aws_ini);
            if (parsed.default) _this8.context.debug('Using local system AWS credentials', parsed.default);
            _this8.context.x_state.config_node.aws = {
              access: '',
              secret: ''
            };
            if (parsed.default.aws_access_key_id) _this8.context.x_state.config_node.aws.access = parsed.default.aws_access_key_id;
            if (parsed.default.aws_secret_access_key) _this8.context.x_state.config_node.aws.secret = parsed.default.aws_secret_access_key;
          }
        }
      })();
    } // config hooks


    setEnvs(envs) {
      return _asyncToGenerator(function* () {
        return [...envs, 'START_TYPE=production'];
      })();
    }

    codeForModel(model) {
      var _this9 = this;

      return _asyncToGenerator(function* () {
        //express = {models,routes}
        //returns array with records of lines of code
        var resp = []; //aws config requirements

        if (_this9.context.x_state.npm['aws-sdk']) {
          if (!_this9.context.x_state.config_node.aws) {
            _this9.context.x_state.npm['aws-get-credentials'] = '*';
            resp.push("const AWS = require('aws-sdk');\n                (async function() {\n                    const { getAWSCredentials } = require('aws-get-credentials');\n                    AWS.config.credentials = await getAWSCredentials();;\n                })();\n                const AWS_s3 = new AWS.S3();");
          } else {
            var aws_data = {
              accessKeyId: _this9.context.x_state.config_node.aws.access,
              secretAccessKey: _this9.context.x_state.config_node.aws.secret
            };

            if (_this9.context.x_state.config_node.aws.region) {
              aws_data.region = _this9.context.x_state.config_node.aws.region;
            }

            resp.push("const AWS = require('aws-sdk');\n                AWS.config.update(".concat(_this9.context.jsDump(aws_data), ");\n                const AWS_s3 = new AWS.S3();"));
          }
        }

        return resp;
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

        var ci = require('ci-info');

        _this.isCI = ci.isCI;
        _this.x_state.config_node = yield _this._readConfig(); //this.debug('config_node',this.x_state.config_node);

        _this.x_state.central_config = yield _this._readCentralConfig(); //this.debug('central_config',this.x_state.central_config);
        //this.x_state.assets = await this._readAssets();
        //this.debug('assets_node',this.x_state.assets);

        var _folders = {
          'bin': 'bin/',
          'models': 'models/',
          'routes': 'routes/',
          'views': 'views/',
          'db_models': 'db_models/',
          'public': 'public/',
          'doc': 'doc/'
        };

        if (_this.x_state.central_config.deploy && _this.x_state.central_config.deploy.includes('sls:')) {
          _folders.secrets = 'secrets/';
        }

        _this.x_state.dirs = yield _this._appFolders(_folders); // read modelos node (Sequelize DB)

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
        _this.x_state.npm['wait.for'] = '*';
        _this.x_state.npm['serve-favicon'] = '*'; // favicon support
        // FAVICON

        if (_this.x_state.config_node.favicon) {
          // copy icon to static dir
          var _path2 = require('path');

          var source = _path2.join(_this.x_state.dirs.base, _this.x_state.config_node.favicon);

          var target = _this.x_state.dirs.app + 'icon.png';

          _this.debug({
            message: "ICON dump (copy icon)",
            color: "yellow",
            data: source
          });

          var fs = require('fs').promises;

          try {
            yield fs.copyFile(source, target);
          } catch (err_fs) {
            _this.x_console.outT({
              message: "error: copying express icon",
              data: err_fs
            });
          }
        } // serialize 'secret' config keys as json files in app secrets sub-directory (if any)
        // extract 'secret's from config keys; 

        /* */


        _this.debug('serializing secrets');

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

              if (_this.x_state.dirs.secrets) {
                var _target = path.join(_this.x_state.dirs.secrets, "".concat(key, ".json"));

                yield _this.writeFile(_target, JSON.stringify(new_obj));
              }
            }
          }
        }

        _this.debug('setting ENV variables'); // set config keys as ENV accesible variables (ex. $config.childnode.attributename)


        var _loop = function _loop(_key) {
          // omit special config 'reserved' (aurora,vpc,aws) node keys
          if (!['vpc', 'aws', 'copiar'].includes(_key) && typeof _this.x_state.config_node[_key] === 'object') {
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
            _this3.deploy_module = new eb({
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
    } //.gitignore helper


    createGitIgnore() {
      var _this5 = this;

      return _asyncToGenerator(function* () {
        _this5.debug('writing .gitignore files');

        var fs = require('fs').promises;

        _this5.debug({
          message: 'writing dsl /.gitignore file'
        });

        var git = "# Mac System files\n.DS_Store\n.DS_Store?\n_MACOSX/\nThumbs.db\n# Concepto files\ndsl_cache/\ndsl_cache.ini\ntmp.ini\n/eb.dsl\nstore/\n".concat(_this5.x_state.dirs.compile_folder, "/node_modules/\n").concat(_this5.x_state.dirs.compile_folder, "/secrets/");
        yield fs.writeFile("".concat(_this5.x_state.dirs.base, ".gitignore"), git, 'utf-8'); //.gitignore
      })();
    } // create /README.md file


    createReadme() {
      var _this6 = this;

      return _asyncToGenerator(function* () {
        var fs = require('fs').promises;

        if (_this6.x_state.central_config.readme != '') {
          yield* function* () {
            var set_envs = [];

            var _loop2 = function _loop2(key) {
              if (!['vpc', 'aws', 'copiar'].includes(key) && typeof _this6.x_state.config_node[key] === 'object') {
                Object.keys(_this6.x_state.config_node[key]).map(function (attr) {
                  if (key.charAt(0) != ':' && attr.charAt(0) != ':') {
                    set_envs.push("".concat(key.toUpperCase(), "_").concat(attr.toUpperCase()));
                  }
                }.bind(_this6));
              }
            };

            for (var key in _this6.x_state.config_node) {
              _loop2(key);
            }

            var content = "<b>".concat(_this6.x_state.central_config.readme, "</b><br/><br/>\n            APP_PORT (int)<br/>\n            CLUSTER (int)<br/>");

            if (set_envs.length > 0) {
              content += "Esta aplicacion requiere configurar las siguientes variables de entorno en la instancia de ElasticBean:<br/><br/>";
              content += set_envs.join('<br/>') + '\n';
            }

            yield fs.writeFile("".concat(_this6.x_state.dirs.app, "README.md"), content, 'utf-8');
          }();
        }
      })();
    }

    createErrorTemplate() {
      var _this7 = this;

      return _asyncToGenerator(function* () {
        var fs = require('fs').promises;

        var content = "<h1><%= message %></h1>\n        <h2><%= error.status %></h2>\n        <pre><%= error.stack %></pre>";
        yield fs.writeFile("".concat(_this7.x_state.dirs.views, "error.ejs"), content, 'utf-8');
      })();
    }

    createJSDoc() {
      var _this8 = this;

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
        yield _this8.writeFile("".concat(_this8.x_state.dirs.app, "jsdoc.json"), content);
      })();
    }

    createBinFile() {
      var _this9 = this;

      return _asyncToGenerator(function* () {
        var content = "#!/usr/bin/env node\nvar app = require('../app');\nvar debug = require('debug')('api:server');\nvar http = require('http');\nvar port = normalizePort(process.env.PORT || '8081');\napp.set('port',port);\nvar server = http.createServer(app);\n// methods\nfunction normalizePort(val) {\n\tvar port = parseInt(val, 10);\n\tif (isNaN(port)) {\n\t\treturn val;\n\t}\n\tif (port >= 0) {\n\t\treturn port;\n\t}\n\treturn false;\n}\n// error handler\nfunction onError(error) {\n  if (error.syscall !== 'listen') {\n    throw error;\n  }\n\n  var bind = typeof port === 'string'\n    ? 'Pipe ' + port\n    : 'Port ' + port;\n\n  // handle specific listen errors with friendly messages\n  switch (error.code) {\n    case 'EACCES':\n      console.error(bind + ' requires elevated privileges');\n      process.exit(1);\n      break;\n    case 'EADDRINUSE':\n      console.error(bind + ' is already in use');\n      process.exit(1);\n      break;\n    default:\n      throw error;\n  }\n}\n// listening event\nfunction onListening() {\n  var addr = server.address();\n  var bind = typeof addr === 'string'\n    ? 'pipe ' + addr\n    : 'port ' + addr.port;\n  debug('Listening on ' + bind);\n}";
        yield _this9.writeFile("".concat(_this9.x_state.dirs.bin, "www"), content);
      })();
    }

    createPackageJSON() {
      var _this10 = this;

      return _asyncToGenerator(function* () {
        var cleanLinesDoc = function cleanLinesDoc(text) {
          //trim each line
          var resp = '',
              lines = text.split('\n');

          for (var line in lines) {
            var t_line = lines[line].trim();

            if (t_line != '') {
              //if (used!=0) resp += ' * ';
              resp += t_line + '\n';
            }
          }

          if (resp.slice(-1) == '\n') resp = resp.substr(0, resp.length - 1); //resp += ' * ';

          return resp;
        };

        var data = {
          name: _this10.x_state.central_config.service_name.toLowerCase(),
          description: cleanLinesDoc(_this10.x_state.central_config[':description']),
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
        if (_this10.x_state.central_config[':version'] != 'auto') data.version = _this10.x_state.central_config[':version'];
        if (_this10.x_state.central_config[':author']) data.author = _this10.x_state.central_config[':author'];
        if (_this10.x_state.central_config[':license']) data.license = _this10.x_state.central_config[':license'];

        if (_this10.x_state.central_config[':git']) {
          data.repository = {
            type: 'git',
            url: "git+".concat(_this10.x_state.central_config[':git'], ".git")
          };
          data.bugs = {
            url: "".concat(_this10.x_state.central_config[':git'], "/issues")
          };
          data.homepage = _this10.x_state.central_config[':git'];
        }

        if (_this10.x_state.central_config[':keywords']) data.keywords = _this10.x_state.central_config[':keywords'].split(','); // set port and env variables to script dev

        var set_envs = ["APP_PORT=".concat(_this10.x_state.central_config.port), "CLUSTER=1"];

        var _loop3 = function _loop3(key) {
          if (!['vpc', 'aws', 'copiar'].includes(key) && typeof _this10.x_state.config_node[key] === 'object') {
            Object.keys(_this10.x_state.config_node[key]).map(function (attr) {
              if (key.charAt(0) != ':' && attr.charAt(0) != ':') {
                set_envs.push("".concat(key.toUpperCase(), "_").concat(attr.toUpperCase(), "=").concat(this.x_state.config_node[key][attr]));
              }
            }.bind(_this10));
          }
        };

        for (var key in _this10.x_state.config_node) {
          _loop3(key);
        } // omit stage as start_type; it seems its not needed
        // call hook for deploy_module (if needs to add env variables depending on deploy)


        if (_this10.deploy_module.setEnvs) {
          set_envs = yield _this10.deploy_module.setEnvs(set_envs);
        } // add to package script _dev


        data.scripts.dev = set_envs.join(' ') + ' ' + data.scripts.dev; //
        //add dependencies

        for (var pack in _this10.x_state.npm) {
          if (_this10.x_state.npm[pack].includes('http') && _this10.x_state.npm[pack].includes('github.com')) {
            data.dependencies[pack] = "git+".concat(_this10.x_state.npm[pack]);
          } else {
            data.dependencies[pack] = _this10.x_state.npm[pack];
          }
        } //add devDependencies


        for (var _pack in _this10.x_state.dev_npm) {
          if (_this10.x_state.dev_npm[_pack].includes('http') && _this10.x_state.dev_npm[_pack].includes('github.com')) {
            data.devDependencies[_pack] = "git+".concat(_this10.x_state.dev_npm[_pack]);
          } else {
            data.devDependencies[_pack] = _this10.x_state.dev_npm[_pack];
          }
        } //write to disk


        var path = require('path');

        var target = path.join(_this10.x_state.dirs.app, "package.json");
        var content = JSON.stringify(data);
        yield _this10.writeFile(target, content); //this.x_console.outT({ message:'future package.json', data:data});
      })();
    }

    createVSCodeHelpers() {
      var _this11 = this;

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

        var target = path.join(_this11.x_state.dirs.app, "jsconfig.json");
        var content = JSON.stringify(data);
        yield _this11.writeFile(target, content);
      })();
    }

    createServerlessYML() {
      var _this12 = this;

      return _asyncToGenerator(function* () {
        var yaml = require('yaml'),
            data = {};

        var deploy = _this12.x_state.central_config.deploy + '';

        if (deploy.includes('eb:') == false && deploy != false && deploy != 'local') {
          data.service = _this12.x_state.central_config.service_name;
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

          for (var secret in _this12.x_state.secrets) {
            data.custom[secret] = '${file(secrets/' + secret + '.json)}';
          } //domain info


          if (_this12.x_state.central_config.dominio) {
            data.custom.customDomain = {
              domainName: _this12.x_state.central_config.dominio
            };
            if (_this12.x_state.central_config.basepath) data.custom.customDomain.basePath = _this12.x_state.central_config.basepath;
            if (_this12.x_state.central_config.stage) data.custom.customDomain.stage = _this12.x_state.central_config.stage;
            data.custom.customDomain.createRoute53Record = true;
          } //nodejs env on aws


          data.provider = {
            name: 'aws',
            runtime: 'nodejs8.10',
            timeout: _this12.x_state.central_config.timeout
          };
          if (_this12.x_state.central_config.stage) data.provider.stage = _this12.x_state.central_config.stage; //env keys

          if (Object.keys(_this12.x_state.config_node) != '') {
            data.provider.enviroment = {};
            if (_this12.x_state.central_config.stage) data.provider.enviroment.STAGE = _this12.x_state.central_config.stage;

            if (_this12.x_state.config_node.vpc) {
              data.provider.vpc = {
                securityGroupIds: [_this12.x_state.config_node.vpc.security_group_id],
                subnetIDs: []
              };

              if (_this12.x_state.secrets.vpc) {
                data.provider.vpc.securityGroupIds = ['${self:custom.vpc.SECURITY_GROUP_ID}'];
              }

              if (_this12.x_state.config_node.vpc.subnet1_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET1_ID}');
              if (_this12.x_state.config_node.vpc.subnet2_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET2_ID}');
              if (_this12.x_state.config_node.vpc.subnet3_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET3_ID}');
              if (_this12.x_state.config_node.vpc.subnet4_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET4_ID}');
              if (_this12.x_state.config_node.vpc.subnet5_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET5_ID}');
              if (_this12.x_state.config_node.vpc.subnet6_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET6_ID}');
              if (_this12.x_state.config_node.vpc.subnet7_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET7_ID}');
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

          if (_this12.x_state.central_config['keep-warm']) {
            data.functions.nuxt.events.push({
              schedule: 'rate(20 minutes)'
            });
          } //aws resources for s3 (x_state.aws_resources) (@TODO later - no commands use them - cfc:13017)
          //serverless plugins


          data.plugins = ['serverless-apigw-binary', 'serverless-offline', 'serverless-prune-plugin'];
          if (_this12.x_state.central_config.dominio) data.plugins.push('serverless-domain-manager'); //write yaml to disk

          var content = yaml.stringify(data);

          var path = require('path');

          var target = path.join(_this12.x_state.dirs.app, "serverless.yml");
          yield _this12.writeFile(target, content); //debug
          //this.debug('future serverless.yml', content);
        }
      })();
    }

    getExpressModels() {
      var _this13 = this;

      return _asyncToGenerator(function* () {
        var sort = function sort(obj) {
          return Object.entries(obj).sort((a, b) => a[0].length - b[0].length).map(el => el[0]);
        };

        var express_models = {}; // grouped functions by main path folder

        var routes = {
          raw: {},
          ordered: []
        };

        for (var key in _this13.x_state.functions) {
          var file = key.split('_')[0];

          if (!express_models[file]) {
            express_models[file] = {
              functions: {},
              ordered_functions: [],
              imports: {},
              route: file,
              model: file,
              path: "/".concat(file, "/")
            };
          }

          if (!express_models[file].functions[key]) {
            express_models[file].functions[key] = _this13.x_state.functions[key];
          }

          express_models[file].ordered_functions = sort(express_models[file].functions); // merge function's imports into dad (e_model) imports

          for (var import_name in _this13.x_state.functions[key].imports) {
            express_models[file].imports[import_name] = import_name;
          } // add pathlen key for later struct sort


          if (typeof _this13.x_state.functions[key].path == 'string') {
            express_models[file].functions[key].pathlen = _this13.x_state.functions[key].path.length;
          }

          if (express_models[file].functions[key].visible == true) {
            routes.raw["/".concat(file, "/")] = file;
          }
        }

        routes.ordered = sort(routes.raw);
        var resp = {
          models: express_models,
          routes
        };
        return resp;
      })();
    }

    createAppJS(express) {
      var _this14 = this;

      return _asyncToGenerator(function* () {
        var path = require('path'); // create app_routes code


        var app_routes = [];

        for (var route_x in express.routes.ordered) {
          var route = express.routes.ordered[route_x];
          app_routes.push("app.use('".concat(route, "', require('./routes/").concat(express.routes.raw[route], "'));"));
        } // content


        var content = "var express = require('express');\n";

        if (_this14.x_state.central_config.rtc && _this14.x_state.central_config.rtc == true) {
          content += "var http = require('http'), socket = require('socket.io'), rtc = require('rtcmulticonnection-server');\n";
        }

        content += "var cors = require('cors'),\n                    session = require('express-session'),\n                    path = require('path'),\n                    favicon = require('serve-favicon'),\n                    logger = require('morgan'),\n                    cookieParser = require('cookie-parser'),\n                    bodyParser = require('body-parser'),\n                    // NodeGeocoder: es utilizado para realizar la geo decodificacion y codificacion de lat-lon o direccion.\n                    //NodeGeocoder = require('node-geocoder'),\n                    // Mysql: es la instancia de mysql global.\n                    mysql = require('mysql2'),\n                    helmet = require('helmet'),\n                    // Cluster: es para realizar un cluster de servidor conectados por express.\n                    cluster = require('express-cluster'),\n                    // schedule: es usado para crear crons.\n                    schedule = require('node-schedule'),\n                    // Request: es utilizado para realizar las llamadas get y post hacia otros servicios o servicios internos.\n                    request = require('request'),\n                    wait = require('wait.for'),\n                    compress = require('compression')();\n                // Define en las variables del enviroment el TimeZone a utc.\n                process.env.TZ = 'utc';\n                \n                cluster(function(worker) {\n                var app = express();\n                var port = process.env.APP_PORT;\n        ";

        if (_this14.x_state.central_config.rtc && _this14.x_state.central_config.rtc == true) {
          content += "var httpServer = http.createServer(app);\n            var io = socket(httpServer).on('connection', function(sock) {\n";

          if (_this14.x_state.central_config['rtc:admin'] != '') {
            content += "rtc.addSocket(sock, {\n                    \"socketURL\": \"/\",\n                    \"dirPath\": \"\",\n                    \"homePage\": \"/\",\n                    \"socketMessageEvent\": \"RTCMultiConnection-Message\",\n                    \"socketCustomEvent\": \"RTCMultiConnection-Custom-Message\",\n                    \"port\": port,\n                    \"enableLogs\": false,\n                    \"autoRebootServerOnFailure\": false,\n                    \"isUseHTTPs\": false,\n                    \"sslKey\": \"./fake-keys/privatekey.pem\",\n                    \"sslCert\": \"./fake-keys/certificate.pem\",\n                    \"sslCabundle\": \"\",\n                    \"enableAdmin\": true,\n                    \"adminUserName\": \"".concat(_this14.x_state.central_config["rtc:admin"].split(',')[0].trim(), "\",\n                    \"adminPassword\": \"").concat(_this14.x_state.central_config["rtc:admin"].split(',').pop().trim(), "\"\n                  });\n");
          } else {
            content += "rtc.addSocket(sock);\n";
          }

          content += "});\n";
        } //


        content += "app.enable('trust proxy');\n        app.use(cors({ optionsSuccessStatus: 200 }));\n        app.options('*',cors());\n        app.use(compress);\n        app.use(helmet());\n        app.disable('x-powered-by');\n        app.use(session({\n          secret: 'c-r-34707$ee$$$10nBm_api',\n          resave: true,\n          saveUninitialized: true\n        }));\n        app.set('views', __dirname + '/views');\n        app.set('view engine', 'ejs');\n        //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));\n        app.use(logger('dev'));\n        app.use(bodyParser.urlencoded({ extended: false,limit: '2gb' }));\n        app.use(bodyParser.json({ extended: false,limit: '2gb' }));\n        app.use(cookieParser());\n        app.use(express.static(path.join(__dirname, 'public')));\n        app.use('/', require('./routes/index'));\n        ".concat(app_routes.join('\n'), "\n        // catch 404 and forward to error handler\n        app.use(function(req, res, next) {\n          var err = new Error('Not Found');\n          err.status = 404;\n          next(err);\n        });\n        // error handler\n        app.use(function(err, req, res, next) {\n          // set locals, only providing error in development\n          res.locals.message = err.message;\n          res.locals.error = process.env.START_TYPE === 'development' ? err : {};\n      \n          // render the error page\n          res.status(err.status || 500);\n          res.render('error');\n        });\n        process.env.UV_THREADPOOL_SIZE = 128;\n        // aqui van los schedules @TODO 1-6-19\n        // aqui creamos el servidor\n");

        if (_this14.x_state.central_config.rtc && _this14.x_state.central_config.rtc == true) {
          content += "return httpServer.listen(port, function () {\n                            console.log(`T: ${new Date().toLocaleString()} | EXPRESS (${process.env.START_TYPE}): server listening on port ${port}`);\n                            console.log(`SERVIDOR INICIADO CON RTC`);\n                        });\n";
        } else {
          content += "return app.listen(port, function () {\n                            console.log(`T: ${new Date().toLocaleString()} | EXPRESS (${process.env.START_TYPE}): server listening on port ${port}`);\n                            console.log(`SERVIDOR INICIADO`);\n                        });\n";
        }

        content += "// Al final creamos el cluster del servidor.\n                    }, {count: process.env.CLUSTER});\n"; //post-processing

        if (_this14.x_state.central_config.rtc && _this14.x_state.central_config.rtc == true) {
          _this14.x_state.npm['http'] = '*';
          _this14.x_state.npm = _objectSpread2(_objectSpread2({}, _this14.x_state.npm), {
            'http': '*',
            'socket.io': '*',
            'rtcmulticonnection-server': '*'
          });

          if (_this14.x_state.central_config['rtc:admin'] != '') {
            //copy rtcadmin from assets and unzip into public dir
            var anzip = require('anzip');

            var rtc_admin = path.join(__dirname, 'assets', 'rtc_admin.zip');
            yield anzip(rtc_admin, {
              outputPath: _this14.x_state.dirs.public
            }); //console.log('PABLO debug unzip',output);
          }
        } //write file


        var appjs = path.join(_this14.x_state.dirs.app, 'app.js');
        yield _this14.writeFile(appjs, content);
      })();
    }

    createIndex(express) {
      var _this15 = this;

      return _asyncToGenerator(function* () {
        var path = require('path'); // get path routes


        var app_routes = [];

        for (var route_x in express.routes.ordered) {
          var route = express.routes.ordered[route_x];
          if (route.charAt(0) == '/') route = route.right(route.length - 1);
          var no_slash = route.replaceAll('/', '');
          app_routes.push("case '".concat(no_slash, "':\n                                res.redirect('/');\n                                break;\n                             case '").concat(route, "':\n                                res.redirect('/');\n                                break;\n                            "));
        } // create content


        var content = "var express = require('express');\n        var router = express.Router();\n        var path = require('path');\n        // rutas por defecto para documentacion\n        router.get(['/*'], function(req, res, next) {\n            switch (req.url) {\n                case \"/\":\n                    res.send('OK');\n                break;\n                ".concat(app_routes.join('\n'), "\n                default:\n                    res.redirect('/');\n                break;\n            }\n        });\n        module.exports = router;\n"); // write file

        var target = path.join(_this15.x_state.dirs.routes, 'index.js');
        yield _this15.writeFile(target, content);
      })();
    }

    createRoutes(express) {
      var _this16 = this;

      return _asyncToGenerator(function* () {
        var listDeleteAt = function listDeleteAt(list, position, delimiter) {
          delimiter = delimiter === undefined ? "," : delimiter;
          var arr = list.split(delimiter);

          if (position >= 1 && position <= arr.length) {
            arr.splice(position - 1, 1);
            return arr.join(delimiter);
          }

          return list;
        };

        var cleanLinesDoc = function cleanLinesDoc(text) {
          //trim each line
          var resp = '',
              lines = text.split('\n'),
              used = 0;

          for (var line in lines) {
            var t_line = lines[line].trim();

            if (t_line != '') {
              if (used != 0) resp += ' * ';
              resp += t_line + '\n';
              used += 1;
            }
          }

          resp += ' * ';
          return resp;
        };

        var ccase = require('fast-case'),
            path = require('path'); // create routes files from express models


        for (var file in express.models) {
          // get unique sub-routes
          var unique = {};

          for (var func of express.models[file].ordered_functions) {
            if (express.models[file].functions[func] && express.models[file].functions[func].path) {
              var _path3 = express.models[file].functions[func].path.trim().split('/');

              _path3.pop(); //remove last item


              _path3 = _path3.join('/');

              if (!unique[_path3] && _path3.includes('/') == true && _path3 != '/' + file) {
                unique[_path3] = _path3.replaceAll('/', '_');
                if (unique[_path3].charAt(0) == '_') unique[_path3] = unique[_path3].substr(1, unique[_path3].length - 1);
              }
            }
          } // code


          var content = "/**\n * Servicios en ruta /".concat(file, "\n * @namespace {object} ").concat(file, "\n */\nvar express = require('express'), wait = require('wait.for');\nvar router = express.Router();\nvar ").concat(file, " = require('../models/").concat(file, "');\n            ");
          if (Object.keys(unique).length > 0) content += "// declaracion de sub-rutas en esta ubicacion\n";

          for (var route in unique) {
            content += "/**\n * Servicios en ruta ".concat(route, "\n * @namespace {object} ").concat(unique[route], "\n */\n");
          } // write each function signature


          for (var _func of express.models[file].ordered_functions) {
            if (express.models[file].functions[_func] && express.models[file].functions[_func].path) {
              // write jsdoc info for function
              var _jsdoc = {
                method: express.models[file].functions[_func].method.toLowerCase(),
                path_o: express.models[file].functions[_func].path.trim(),
                doc: cleanLinesDoc(express.models[file].functions[_func].doc)
              };
              if (_jsdoc.path_o.charAt(0) == '/') _jsdoc.path_o = _jsdoc.path_o.substr(1, _jsdoc.path_o.length - 1);
              if (_jsdoc.doc == '') _jsdoc.doc = 'Funcion no documentada'; //console.log('PABLO debug without first0:',_jsdoc.path_o);

              var without_first = listDeleteAt(_jsdoc.path_o, 1, '/'); //console.log('PABLO debug without first1:',without_first);

              _jsdoc.path = "/".concat(without_first);
              _jsdoc.method_name = _jsdoc.path_o.split('/').pop(); // last / item; f_jname

              _jsdoc.memberof = listDeleteAt(_jsdoc.path_o, _jsdoc.path_o.split('/').length, '/');
              _jsdoc.memberof = _jsdoc.memberof.replaceAll('_', '|').replaceAll('/', '_');
              var doc = "/**\n * (".concat(_jsdoc.method.toUpperCase(), ") ").concat(_jsdoc.doc, "\n * @method\n * @name ").concat(_func.replaceAll('_', ' / ').replaceAll('|', '_'), "\n * @alias ").concat(_jsdoc.method_name, "\n * @memberof! ").concat(_jsdoc.memberof, "\n"); // add params doc of function

              var func_params = express.models[file].functions[_func].params.split(',');

              for (var param of func_params) {
                var param_wstar = param.replaceAll('*', '');

                if (express.models[file].functions[_func].param_doc[param_wstar]) {
                  var p_type = ccase.pascalize(express.models[file].functions[_func].param_doc[param_wstar].type);

                  var p_desc = express.models[file].functions[_func].param_doc[param_wstar].desc.trim();

                  doc += " * @param {".concat(p_type, "} ").concat(param, " ").concat(p_desc, "\n");
                } else {
                  if (param.trim() == 'id' && !param.includes('identificador')) {
                    doc += " * @param {Int} ".concat(param, "\n");
                  } else if (param.includes('base64')) {
                    doc += " * @param {Base64} ".concat(param, "\n");
                  } else {
                    doc += " * @param {String} ".concat(param, "\n");
                  }
                }
              } // return


              if (express.models[file].functions[_func].param_doc.return) {
                var _p_type = ccase.pascalize(express.models[file].functions[_func].param_doc.return.type);

                var _p_desc = express.models[file].functions[_func].param_doc.return.desc.trim();

                doc += "* @return {".concat(_p_type, "} ").concat(_p_desc, "\n");
              } else if (_jsdoc.doc.includes('@return') == false) {
                doc += "* @return {object}\n";
              }

              doc += " */\n"; // router code

              doc += "router.".concat(_jsdoc.method, "('").concat(_jsdoc.path, "', function(req, res, next) {\n                        wait.launchFiber(").concat(file, ".").concat(_func, ", req, res);\n                    });\n"); // add doc to content if func is visible

              if (express.models[file].functions[_func].visible == true) {
                content += doc + '\n';
              } // 

            }
          } // write exports


          content += "module.exports = router;\n"; // write file

          var target = path.join(_this16.x_state.dirs.routes, file + '.js');
          yield _this16.writeFile(target, content);
        }
      })();
    }

    createModels(express) {
      var _this17 = this;

      return _asyncToGenerator(function* () {
        var path = require('path');

        for (var file in express.models) {
          var content = "//funciones para ruta ".concat(file, "\n");

          if (_this17.x_state.config_node.aurora) {
            content += "const connectToDatabase = require('../db'); // initialize connection\n";
          } //requires


          var requires = [];

          if (_this17.deploy_module.codeForModel) {
            var deploy_require = yield _this17.deploy_module.codeForModel(express.models[file]);
            requires = [...requires, ...deploy_require];
          } // add express models imports


          for (var imp in express.models[file].imports) {
            requires.push("var ".concat(imp.replaceAll('-', '').replaceAll('@', '').replaceAll('/', '_'), " = require('").concat(imp, "');"));
          } // write header of model


          content += "const Sequelize = require('sequelize'); // sequelize handler\n            var moment = require('moment');\n            var wait = require('wait.for');\n            var util = require('util');\n            var async = require('async');\n            var _ = require('underscore');\n            var fs = require('fs');\n            const fileType = require('file-type');\n            var path = require('path');\n            // requires globales segun requerimiento de codigos de funciones\n            ".concat(requires.join('\n'), "\n            // funciones para cada ruta\n            var self = {};\n"); // add function code

          content += express.models[file].code; // replace db connection info on funcs init { file_init }

          for (var func in express.models[file].functions) {
            if (express.models[file].functions[func] && express.models[file].functions[func].used_models) {
              var db_conn = "const { ".concat(Object.keys(express.models[file].functions[func].used_models), " } = await connectToDatabase();");
              content = content.replaceAll("{ ".concat(func, "_init }"), db_conn);
            }
          } // write exports


          content += "module.exports = self;\n"; // write file

          var target = path.join(_this17.x_state.dirs.models, file + '.js');
          yield _this17.writeFile(target, content);
        }
      })();
    }

    onEnd() {
      var _this18 = this;

      return _asyncToGenerator(function* () {
        //execute deploy (npm install, etc) AFTER vue compilation (18-4-21: this is new)
        if (!_this18.errors_found) {
          if (!(yield _this18.deploy_module.deploy()) && !_this18.x_state.central_config.componente) {
            _this18.x_console.outT({
              message: 'Something went wrong deploying, check the console, fix it and run again.',
              color: 'red'
            });
          }
          yield _this18.deploy_module.post();
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

    prettyCode() {
      var _arguments = arguments;
      return _asyncToGenerator(function* () {
        var ext = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : 'js';
        var content = _arguments.length > 1 ? _arguments[1] : undefined;

        var prettier = require('prettier'),
            resp = content;

        if (ext == 'js') {
          try {
            resp = prettier.format(resp, {
              parser: 'babel',
              useTabs: true,
              singleQuote: true
            });
          } catch (ee) {
            //this.debug(`error: could not format the JS file; trying js-beautify`);
            var beautify = require('js-beautify');

            var beautify_js = beautify.js;
            resp = beautify_js(resp, {});
          }
        }

        return resp;
      })();
    }

    writeFile(file, content) {
      var _arguments2 = arguments,
          _this19 = this;

      return _asyncToGenerator(function* () {
        var encoding = _arguments2.length > 2 && _arguments2[2] !== undefined ? _arguments2[2] : 'utf-8';

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
            _this19.debug("error: could not format the JS file; trying js-beautify");

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
            _this19.debug("warning: could not format the vue file; trying vue-beautify", ee);

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
      var _this20 = this;

      return _asyncToGenerator(function* () {
        require('fs').promises;
            var path = require('path'); //this.x_console.out({ message:'onCreateFiles', data:processedNodes });
        //this.x_console.out({ message:'x_state', data:this.x_state });


        yield _this20._writeModelos();
        yield _this20.createGitIgnore(); //write .npmrc file for ffmpeg support

        yield _this20.writeFile(path.join(_this20.x_state.dirs.app, '.npmrc'), "unsafe-perm=true");

        _this20.debug('processing nodes'); //console.log('PABLO debug x_state function general/login',this.x_state.functions.general_login);
        //console.log('PABLO debug create nodes',processedNodes);
        //group functions into express models (first folder is dad model)


        var express = yield _this20.getExpressModels(); //let express = { models:express_base.models, routes:express_base.routes }; // grouped functions by main path folder
        // add code to express models

        for (var thefile_num in processedNodes) {
          var thefile = processedNodes[thefile_num];

          if (express.models[thefile.file]) {
            express.models[thefile.file].code = thefile.code;
          }
        } //console.log('PABLO debug EXPRESS models',express.models);


        yield _this20.createAppJS(express);
        yield _this20.createIndex(express);
        yield _this20.createErrorTemplate();
        yield _this20.createJSDoc();
        yield _this20.createReadme();
        yield _this20.createBinFile();
        yield _this20.createRoutes(express);
        yield _this20.createModels(express); // *************************
        // Additional steps
        // *************************
        //create package.json

        yield _this20.createPackageJSON(); //create package.json
        //await this.createPackageJSON();
        //create VSCode helpers
        //await this.createVSCodeHelpers();
        //create serverless.yml for deploy:sls - cfc:12881
        //await this.createServerlessYML();
        //execute deploy (npm install, etc) - moved to onEnd
      })();
    } // ************************
    // INTERNAL HELPER METHODS 
    // ************************

    /*
     * Returns true if a local server is running on the DSL defined port
     */


    _isLocalServerRunning() {
      var _this21 = this;

      return _asyncToGenerator(function* () {
        var is_reachable = require('is-port-reachable');

        var resp = yield is_reachable(_this21.x_state.central_config.port);
        return resp;
      })();
    }
    /*
     * Reads the node called modelos and creates tables definitions and managing code (alias:database).
     */


    _readModelos() {
      var _this22 = this;

      return _asyncToGenerator(function* () {
        // @IDEA this method could return the insert/update/delete/select 'function code generators'
        _this22.debug('_readModelos');

        _this22.debug_time({
          id: 'readModelos'
        });

        var modelos = yield _this22.dsl_parser.getNodes({
          text: 'modelos',
          level: 2,
          icon: 'desktop_new',
          recurse: true
        }); //nodes_raw:true	

        var tmp = {
          appname: _this22.x_state.config_node.name
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
                name: _this22.hash(table.text + '_' + table[':idex']),
                unique: false,
                fields: table[':index'].split(',')
              });
            }

            if (table[':index_unique']) {
              if (!resp.tables[table.text].indexes) resp.tables[table.text].indexes = [];
              resp.tables[table.text].indexes.push({
                name: _this22.hash(table.text + '_' + table[':idex']),
                unique: true,
                fields: table[':index_unique'].split(',')
              });
            } //


            yield _this22.setImmediatePromise(); //@improved
          }
        } // create virtual table 'if' central node 'log'='modelo


        if (_this22.x_state.central_config.log && _this22.x_state.central_config.log.includes('model')) {
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


        _this22.x_state.npm['sequelize'] = '*';

        _this22.debug_timeEnd({
          id: 'readModelos'
        }); // return 


        return resp;
      })();
    }

    _writeModelos() {
      var _this23 = this;

      return _asyncToGenerator(function* () {
        _this23.debug('_writeModelos');

        _this23.debug_time({
          id: 'writeModelos'
        });

        var path = require('path'),
            fs = require('fs').promises; // ******************************************************
        // create db_models sequelize schema files @todo
        // ******************************************************


        for (var table in _this23.x_state.models.tables) {
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

          var target = path.join(_this23.x_state.dirs.db_models, target_file.join('/')); // create target folder

          var jfolder = path.dirname(target);

          try {
            yield fs.mkdir(jfolder, {
              recursive: true
            });
          } catch (errdir) {} // content


          var fields = _this23.x_state.models.tables[table].fields;
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
            'FLOAT': 'type.FLOAT',
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

          var content = "module.exports = (sequelize, type) => {\n                return sequelize.define('".concat(db_name, "', ").concat(_this23.jsDump(model, 'type.'), ");\n            }"); // write file

          yield _this23.writeFile(target, content);
        } // ******************************************************
        // create db.js for 'aurora' if defined on config node
        // ******************************************************


        if (_this23.x_state.config_node.aurora) {
          _this23.x_state.npm['mysql2'] = '*';
          _this23.x_state.npm['sequelize'] = '*';
          var _content = "const Sequelize = require('sequelize');\n";

          for (var _table in _this23.x_state.models.tables) {
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
            logging: _this23.x_state.central_config.dblog,
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
          _content += "const sequelize = new Sequelize(\n                process.env.AURORA_NAME,\n                process.env.AURORA_USER,\n                process.env.AURORA_PASSWORD,\n                ".concat(_this23.jsDump(seq_config), "\n            );\n            // check if given database exists, or create it\n            sequelize.query(\"CREATE DATABASE IF NOT EXISTS \"+process.env.AURORA_NAME).then(function(){});\n");
          var models = [];

          for (var _table2 in _this23.x_state.models.tables) {
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

          var _target2 = path.join(_this23.x_state.dirs.app, 'db.js');

          yield _this23.writeFile(_target2, _content);
        }

        _this23.debug_timeEnd({
          id: 'writeModelos'
        });
      })();
    }
    /* 
     * Grabs central node configuration information
     */


    _readCentralConfig() {
      var _this24 = this;

      return _asyncToGenerator(function* () {
        _this24.debug('_readCentralConfig');

        var central = yield _this24.dsl_parser.getNodes({
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
          ':cache': _this24.x_config.cache,
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

        if (!resp[':cache']) _this24.x_config.cache = false; // disables cache when processing nodes (@todo)
        // return

        return resp;
      })();
    }
    /*
     * Grabs the configuration from node named 'config'
     */


    _readConfig() {
      var _this25 = this;

      return _asyncToGenerator(function* () {
        _this25.debug('_readConfig');

        var resp = {
          id: '',
          meta: [],
          seo: {},
          secrets: {}
        },
            config_node = {};
        var search = yield _this25.dsl_parser.getNodes({
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

          var dsl_folder = path.dirname(path.resolve(_this25.x_flags.dsl));
          var parent_folder = path.resolve(dsl_folder, '../');
          var folder = dsl_folder.replace(parent_folder, '');
          resp.name = folder.replace('/', '').replace('\\', '') + '_' + path.basename(_this25.x_flags.dsl, '.dsl'); //console.log('folder:',{folder,name:resp.name});
          //this.x_flags.dsl
        } // create id if not given


        if (!resp.id) resp.id = 'com.puntorigen.' + resp.name;
        return resp;
      })();
    }

    getParentNodes() {
      var _arguments3 = arguments,
          _this26 = this;

      return _asyncToGenerator(function* () {
        var id = _arguments3.length > 0 && _arguments3[0] !== undefined ? _arguments3[0] : _this26.throwIfMissing('id');
        var exec = _arguments3.length > 1 && _arguments3[1] !== undefined ? _arguments3[1] : false;
        var parents = yield _this26.dsl_parser.getParentNodesIDs({
          id,
          array: true
        });
        var resp = [];

        for (var parent_id of parents) {
          var node = yield _this26.dsl_parser.getNode({
            id: parent_id,
            recurse: false
          });
          var command = yield _this26.findValidCommand({
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
      var _this27 = this;

      return _asyncToGenerator(function* () {
        var resp = yield _this27.dsl_parser.hash(thing);
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
