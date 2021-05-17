(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.vue_dsl = factory());
}(this, (function () { 'use strict';

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

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
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

  /**
  * Concepto DSL Base Class: A base class (to be extended) for defining new languages for Concepto to be compiled to.
  * @name 	concepto
  * @module 	concepto
  **/
  //import commands from '../../vue_dsl/lib/commands';

  /**
   * A node object representation of a DSL node.
   * @typedef {Object} NodeDSL
   * @property {number} id - Node unique ID.
   * @property {number} level - Indicates the depth level from the center of the dsl map.
   * @property {string} text - Indicates the text defined in the node itself.
   * @property {string} text_rich - Indicates the html defined in the node itself.
   * @property {string} text_note - Indicates the text/html defined in the notes view of the node (if any).
   * @property {string} image - Image link defined as an image within the node.
   * @property {Object} cloud - Cloud information of the node.
   * @property {string} cloud.bgcolor - Background color of cloud.
   * @property {boolean} cloud.used - True if cloud is used, false otherwise. 
   * @property {Arrow[]} arrows - Visual connections of this node with other nodes {@link #module_concepto..Arrow}.
   * @property {NodeDSL[]} nodes - Children nodes of current node.
   * @property {Object} font - Define font, size and styles of node texts.
   * @property {Object} font.face - Font face type used on node.
   * @property {Object} font.size - Font size used on node.
   * @property {Object} font.bold - True if node text is in bold.
   * @property {Object} font.italic - True if node text is in italics.
   * @property {string} style - Style applied to the node.
   * @property {string} color - Text color of node.
   * @property {string} bgcolor - Background color of node.
   * @property {string} link - Link defined on node.
   * @property {string} position - Position in relation of central node (left,right).
   * @property {Object} attributes - Object with each attribute (key is attribute name, value is attribute value).
   * @property {string[]} icons - Array with icon names used in the node.
   * @property {date} date_modified - Date of node when it was last modified.
   * @property {date} date_created - Date of node when it was created.
   */

  /**
   * Arrow object definition, for connections to other nodes within a DSL.
   * @typedef {Object} Arrow
   * @property {string} target - Target node ID of connection.
   * @property {string} color - Color of visual connection.
   * @property {string} style - Graphical representation type of link (source-to-target, target-to-source, both-ways). 
  */
  //import dsl_parser from '../../dsl_parser/src/index'
  //import console_ from '../../console/src/index'
  class concepto {
    constructor(file) {
      var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (arguments.length != 2 || typeof arguments[0] === 'object') throw new Error('fatal error! missing file parameter for parser!');

      var console_ = require('open_console');
      var def_config = {
        class: 'concepto',
        console: true,
        debug: false,
        cache: true,
        dsl_git: true,
        prefix: ''
      };
      this.x_config = _objectSpread2(_objectSpread2({}, def_config), config);
      this.x_console = new console_({
        silent: !this.x_config.console
      });
      this.x_console.setPrefix({
        prefix: this.x_config.class,
        color: 'yellow'
      });
      this.x_flags = {
        init_ok: false,
        dsl: file,
        watchdog: {
          start: new Date(),
          end: new Date()
        }
      };
      this.x_commands = {}; //this.commands();

      this.x_time_stats = {
        times: {},
        tables: {}
      };
      this.x_state = {}; // for dsl parser to share variables within commands and onMethods.

      this.x_memory_cache = {
        findCommand: {},
        findValidCommand: {},
        isExactParentID: {},
        hasBrotherBefore: {},
        hasBrotherNext: {}
      };
      this.x_match = require('minimatch'); // grab class methods that start with the 'on' prefix

      /* @TODO check if this is useful or needed 1-Aug-2020
      this.x_on_methods={};
      let my_methods=getInstanceMethodNames(this);
      for (let i in my_methods) {
      	let name = my_methods[i].name;
      	if (name.substring(0,2)=='on') {
      		delete my_methods[i].name;
      		this.x_on_methods[name]=my_methods[i];
      	}
      }
      console.log('x_on_methods says',this.x_on_methods);*/
    }
    /**
    * Initializes/starts the class 
    * @async
    */


    init() {
      var _this = this;

      return _asyncToGenerator(function* () {
        if (!_this.x_flags.init_ok) {
          var dsl_parser = require('dsl_parser');

          var path = require('path'),
              fs = require('fs').promises,
              tmp = {}; // show title


          _this.x_console.title({
            title: "DSL Interpreter ".concat(_this.x_config.class, "\ninit:compiling file:\n").concat(_this.x_flags.dsl),
            color: 'cyan',
            config: {
              align: 'left'
            }
          });

          _this.dsl_parser = new dsl_parser({
            file: _this.x_flags.dsl,
            config: {
              cancelled: false,
              debug: _this.x_config.debug
            }
          });

          try {
            yield _this.dsl_parser.process();
          } catch (d_err) {
            _this.x_console.out({
              message: "error: file ".concat(_this.x_flags.dsl, " does't exist!"),
              data: d_err
            });

            return;
          }

          tmp.directory = path.dirname(path.resolve(_this.x_flags.dsl));

          _this.x_console.outT({
            message: "time passed since start .. ".concat(_this.secsPassed_()),
            color: 'cyan'
          }); // @TODO create github compatible DSL


          if (_this.x_config.dsl_git) {
            _this.x_console.outT({
              message: "creating git compatible DSL",
              color: 'green'
            });

            var for_git = yield _this.dsl_parser.createGitVersion(); // save dsl git file

            if (typeof _this.x_config.dsl_git === 'boolean') {
              //tmp.dsl_git_path = path.join(tmp.directory,'dsl_git');
              tmp.dsl_git_path = tmp.directory;

              _this.debug("dsl_git dir", tmp.dsl_git_path);
              /*try { 
              	await fs.mkdir(tmp.dsl_git_path);
              } catch(cpath_err) {}*/


              var git_target = path.join(tmp.dsl_git_path, 'vue_git.dsl'); //,path.basename(this.x_flags.dsl)

              yield fs.writeFile(git_target, for_git, 'utf-8');

              _this.debug("dsl_git file saved as: ".concat(git_target));
            } else if (typeof _this.x_config.dsl_git === 'function') {
              // if dsl_git is a function, call it with out ready content; maybe to send it though sockets, further processing or saving in a diferent location
              _this.debug("calling dsl_git custom method ".concat(_this.x_config.dsl_git.name));

              yield _this.x_config.dsl_git(for_git);
            } //


            _this.x_console.outT({
              message: "ready github compatible DSL",
              color: 'green'
            });
          } //config persistant cache


          _this.x_console.outT({
            message: "configuring cache ..",
            color: 'cyan'
          });

          _this.cache = require('node-persist');
          var cache_path = path.join(tmp.dsl_git_path, '.concepto', '.dsl_cache');
          yield _this.cache.init({
            dir: cache_path,
            expiredInterval: 3 * 60 * 60 * 1000 //expire within 2hrs 

          }); // continue

          _this.x_flags.init_ok = true;

          try {
            yield _this.onInit();
          } catch (eeee) {
            _this.x_console.out({
              message: "onInit() ".concat(eeee),
              color: 'red'
            });
          }
        } else {
          // this was already called!
          _this.x_console.out({
            message: "you may only call method init() once!"
          });
        }
      })();
    } // **********************************
    // template methods (to be extended)
    // **********************************

    /**
    * Sets the default reply Object for commands
    * @param 	{Object}	[init]				- Merges given object keys with default defined template
    * @return 	{Object}
    */


    reply_template() {
      var init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var resp = {
        init: '',
        open: '',
        close: '',
        hasChildren: true,
        type: 'simple',
        valid: true,
        _meta: {
          _set: {},
          cache: true
        }
      };
      return _objectSpread2(_objectSpread2({}, resp), init);
    }
    /**
    * Gets automatically executed after init method finishes.
    * You should place any parser preparation steps here (ex. load commands)
    * @async
    */


    onInit() {
      return _asyncToGenerator(function* () {
        console.log('hello from concepto.js');
      })();
    }
    /**
    * Gets automatically executed after parsing all nodes level 2 of the given dsl (before onCompleteCodeTemplate)
    * @async
    * @param 	{Object}		processedNode		- reply content of process method per processed level2 node (keys of reply_template method)
    * @return 	{Object}
    */


    onAfterProcess(processedNode) {
      return _asyncToGenerator(function* () {
        return processedNode;
      })();
    }
    /**
    * Gets automatically executed within writer method for setting the title for a node level 2.
    * @async
    * @param 	{NodeDSL}		node		- node to process
    * @return 	{String}
    */


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
        	if (node.attributes[i]=='title' || node.attributes[i]=='titulo') {
        		resp = node.attributes[i];
        		break;
        	}
        }*/

        return resp;
      })();
    }
    /**
    * Gets automatically executed for naming filename of class/page by testing node (you could use a slud method here).
    * @async
    * @param 	{NodeDSL}		node		- node to process
    * @return 	{String}
    */


    onDefineFilename(node) {
      return _asyncToGenerator(function* () {
        return node.text;
      })();
    }
    /**
    * Gets automatically called for naming the class/page by testing node (similar to a filename, but for objects reference).
    * @async
    * @param 	{NodeDSL}		node		- node to process
    * @return 	{String}
    */


    onDefineNodeName(node) {
      return _asyncToGenerator(function* () {
        return node.text.replace(' ', '_');
      })();
    }
    /**
    * Defines template for code given the processedNodes of writer(). Useful to prepend/append code before writting code to disk.
    * @async
    * @param 	{Object}		processedNode		- reply content of process method per processed level2 node (keys of reply_template method)
    * @return 	{Object}
    */


    onCompleteCodeTemplate(processedNode) {
      return _asyncToGenerator(function* () {
        return processedNode;
      })();
    }
    /**
    * Defines preparation steps before processing nodes.
    * @async
    */


    onPrepare() {
      return _asyncToGenerator(function* () {})();
    }
    /**
    * Gets automatically called after errors have being found while processing nodes (with the defined commands)
    * @async
    * @param 	{string[]}		errors		- array of errors messages
    */


    onErrors(errors) {
      return _asyncToGenerator(function* () {})();
    }
    /**
    * Gets automatically called after all processing on nodes has being done. You usually create the files here using the received processedNodes array.
    * @async
    * @param 	{Object[]}		processedNodes		- array of nodes already processed (keys of reply_template method) ready to be written to disk
    */


    onCreateFiles(processedNodes) {
      return _asyncToGenerator(function* () {})();
    }
    /**
    * Gets automatically called after all processes have finished. Useful for cleaning the enviroment.
    * @async
    */


    onEnd() {
      return _asyncToGenerator(function* () {})();
    } // ********************
    // helper methods
    // ********************

    /**
    * A command object specifying requirements for a node to execute its function.
    * @typedef {Object} Command
    * @property {string} [x_icons] 				- List of required icons that the node must define to be a match for this command.
    * @property {string} [x_not_icons] 			- List of icons that the node cannot define to be a match for this command.
    * @property {string} [x_not_empty] 			- List of keys that must not be empty to be a match for this command (can be any key from a NodeDSL object). Example: 'attribute[src],color'
    * @property {string} [x_not_text_contains] 	- List of strings, which cannot be within the node text.
    * @property {string} [x_empty] 				- List of NodeDSL keys that must be empty to be a match for this command.
    * @property {string} [x_text_contains]		- List of strings, that can be contain in node text (if delimiter is |) or that must be all contained within the node text (if delimiter is comma).
    * @property {string|string[]} [x_text_pattern]		- Minimatch pattern to match to be a match for this command. Can also be an array of patterns (one must match).
    * @property {string} [x_level] 				- Numeric conditions that the level of the node must met (example: '>2,<5' or '2,3,4').
    * @property {string} [x_all_hasparent] 		- List of commands ids (keys), which must be ancestors of the node to be a match for this command.
    * @property {string} [x_or_hasparent] 		- List of commands ids (keys), which at least one must be an ancestor of the node to be a match for this command.
    * @property {string} [x_or_isparent] 		- List of commands ids (keys), which at least one must be the exact parent of the node to be a match for this command.
    * @property {Object} [autocomplete] 			- Describes the node for the autocomplete feature of Concepto DSL software and its related documentation. The feature also takes into account the definition of the command (x_level and x_icons)
    * @property {string} [autocomplete.key_text] 	- String that the node text must have for this command to be suggested.
    * @property {string} [autocomplete.hint] 		- Text description for this command to be shown on Concepto DSL.
    * @property {Function} func - Function to execute with a matching node. Receives one argument and it must be a NodeDSL object.
    */

    /**
    * Add commands for processing nodes with the current class
    * @async
    * @param 	{Function}		command_func		- async function returning an object with commands objects ({@link Command}) where each key is the command id, and its value a Command object.
    */


    addCommands(command_func) {
      var _this3 = this;

      return _asyncToGenerator(function* () {
        if (!_this3.x_flags.init_ok) throw new Error('error! the first called method must be init()!');

        if (command_func && typeof command_func === 'function') {
          var t = yield command_func(_this3);

          if (typeof t === 'object') {
            // if there was a meta, add new info as name child
            if (_this3.x_commands && _this3.x_commands.meta && t.meta && t.meta.name) {
              if (!_this3.x_commands.meta.other) _this3.x_commands.meta.other = {};
              _this3.x_commands.meta.other[t.meta.name] = t.meta;
              delete t.meta;
            }

            _this3.x_commands = _objectSpread2(_objectSpread2({}, _this3.x_commands), t);
          } else {
            throw new Error('error! addCommands() argument doesn\'t reply with an Object');
          }

          if (t.meta && t.meta.version && t.meta.name) {
            _this3.x_console.outT({
              message: "x_commands '".concat(t.meta.name, "' v").concat(t.meta.version, " ready"),
              color: 'brightYellow'
            });
          }
        } else if (command_func && typeof command_func === 'object') {
          // if there was a meta, add new info as name child
          if (_this3.x_commands && _this3.x_commands.meta && command_func.meta && command_func.meta.name) {
            if (!_this3.x_commands.meta.other) _this3.x_commands.meta.other = {};
            _this3.x_commands.meta.other[command_func.meta.name] = command_func.meta;
            delete command_func.meta;
          }

          _this3.x_commands = _objectSpread2(_objectSpread2({}, _this3.x_commands), command_func);

          if (command_func.meta && command_func.meta.version && command_func.meta.name) {
            _this3.x_console.outT({
              message: "x_commands '".concat(command_func.meta.name, "' v").concat(command_func.meta.version, "' ready"),
              color: 'brightYellow'
            });
          }
        }
      })();
    }
    /**
    * Detects which x_commands changed their code since last persistant cache usage. To be called before process().
    * @async
    */


    cacheCommands() {
      var _this4 = this;

      return _asyncToGenerator(function* () {
        //add hash of x_commands to cache; if diferent from cache,invalidate node caches!
        var x_cmds_hashes = {};

        for (var x in _this4.x_commands) {
          if (x == 'meta') {
            x_cmds_hashes[x] = yield _this4.dsl_parser.hash(JSON.stringify(_this4.x_commands[x]));
          } else {
            x_cmds_hashes[x] = yield _this4.dsl_parser.hash(_this4.x_commands[x].func.toString());
          }
        } //console.log('obj_to_hash',x_cmds_hashes);


        var commands_hash = yield _this4.dsl_parser.hash(x_cmds_hashes);
        var commands_cache = yield _this4.cache.getItem('commands_hash');
        var commands_cached_hashes = yield _this4.cache.getItem('commands_hashes');
        var changed_x_cmds = [];

        _this4.x_console.outT({
          prefix: 'cache,yellow',
          message: "x_commands hash: ".concat(commands_hash),
          color: 'dim'
        });

        if (commands_cache != commands_hash) {
          if (typeof commands_cached_hashes === 'object') {
            //compare which x_commands changed
            for (var _x in x_cmds_hashes) {
              if (_x in commands_cached_hashes && commands_cached_hashes[_x] != x_cmds_hashes[_x]) {
                changed_x_cmds.push(_x);
              }
            }

            if (changed_x_cmds.includes('meta')) {
              //x_command version changed! wipe all cache
              _this4.x_console.outT({
                prefix: 'cache,yellow',
                message: "x_commands meta changed! wiping all cache",
                color: 'brightYellow'
              });

              yield _this4.cache.clear();
            } else {
              if (changed_x_cmds.length > 0) _this4.x_console.outT({
                prefix: 'cache,yellow',
                message: "x_commands has changed hash! cleaning cache of x_commands: ".concat(changed_x_cmds.join(',')),
                color: 'yellow'
              }); //search which pages (within cache) are using the modified x_commands

              var meta_cache = yield _this4.cache.getItem('meta_cache');

              if (meta_cache && typeof meta_cache === 'object' && Object.keys(meta_cache).length > 0) {
                for (var _x2 in meta_cache) {
                  if (_this4.array_intersect(meta_cache[_x2].x_ids.split(','), changed_x_cmds).length > 0) {
                    //remove page 'hashkey' from cache
                    _this4.x_console.outT({
                      prefix: 'cache,yellow',
                      message: "removing ".concat(_x2, " file info from cache .."),
                      color: 'dim'
                    });

                    yield _this4.cache.removeItem(meta_cache[_x2].cachekey);
                    yield _this4.cache.removeItem(meta_cache[_x2].cachekey + '_x_state');
                  }
                }
              }
            }
          } else {
            // if cached_hashses doesn't exist, clean everything from cache (should be first upgrade)
            _this4.x_console.outT({
              prefix: 'cache,yellow',
              message: "x_commands has changed hash! cleaning all previous cache",
              color: 'yellow'
            });

            yield _this4.cache.clear();
          } //set new comparision to cache


          yield _this4.cache.setItem('commands_hash', commands_hash);
          yield _this4.cache.setItem('commands_hashes', x_cmds_hashes);
        }
      })();
    }
    /**
    * Finds one or more commands defined that matches the specs of the given node.
    * @async
    * @param 	{NodeDSL}		node			- node for which to find commands that match
    * @param 	{boolean}		[justone=true]	- indicates if you want just the first match (true), or all commands that match the given node (false)
    * @return 	{Command|Command[]}
    */


    findCommand() {
      var _arguments = arguments,
          _this5 = this;

      return _asyncToGenerator(function* () {
        var {
          node = _this5.throwIfMissing('node'),
          justone = true,
          show_debug = true
        } = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : {};
        if (!_this5.x_flags.init_ok) throw new Error('error! the first called method must be init()!');

        var resp = _objectSpread2(_objectSpread2({}, _this5.reply_template()), {
          id: 'not_found',
          hint: 'failover command'
        }),
            xtest = [];

        if (typeof node.icons === 'undefined') {
          if (show_debug) _this5.debug('error: findCommand was given a blank node!');
          return resp;
        }

        var cache_key = node.id + node.date_modified.toString(); //+node.nodes_raw.toString();

        var t_cache = yield _this5.cache.getItem(cache_key);

        if (t_cache && (Array.isArray(t_cache) && t_cache.length > 0 || t_cache.data)) {
          // node.id in this.x_memory_cache.findCommand
          if (show_debug) _this5.debug("using memory_cache for findCommand for node ID ".concat(node.id));
          return t_cache;
        } else {
          if (show_debug) _this5.debug("findCommand for node ID ".concat(node.id));
          var keys = 'x_icons,x_not_icons,x_not_empty,x_not_text_contains,x_empty,x_text_exact,x_text_contains,x_text_pattern,x_level,x_or_hasparent,x_all_hasparent,x_or_isparent';
          var command_requires1 = setObjectKeys(keys, '');

          var node_features = _objectSpread2({}, command_requires1);

          var command_defaults = _objectSpread2({}, command_requires1);

          var def_matched = setObjectKeys(keys, true);
   // iterate through commands

          for (var key in _this5.x_commands) {
            //let comm_keys = Object.keys(this.x_commands[key]);
            // reset defaults for current command
            var matched = _objectSpread2({}, def_matched); // build template for used keys


            var command_requires = _objectSpread2(_objectSpread2({}, command_defaults), _this5.x_commands[key]);

            delete command_requires.func; // test command features vs node features
            // test 1: icon match
            //if (this.x_config.debug) this.x_console.time({ id:`${key} x_icons` });

            if (command_requires['x_icons'] != '') {
              _this5.debug_time({
                id: "".concat(key, " x_icons")
              });

              for (var qi of command_requires.x_icons.split(',')) {
                matched.x_icons = node.icons.includes(qi) ? true : false;
                if (!matched.x_icons) break;
                yield setImmediatePromise();
              }

              _this5.debug_timeEnd({
                id: "".concat(key, " x_icons")
              });
            } //if (this.x_config.debug) this.x_console.timeEnd({ id:`${key} x_icons` });
            // test 2: x_not_icons


            if (command_requires['x_not_icons'] != '' && allTrue(matched, keys)) {
              _this5.debug_time({
                id: "".concat(key, " x_not_icons")
              }); // special case first


              if (node.icons.length > 0 && command_requires['x_not_icons'] != '' && ['*'].includes(command_requires['x_not_icons'])) {
                matched.x_not_icons = false;
              } else if (command_requires['x_not_icons'] != '') {
                // if node has any icons of the x_not_icons, return false aka intersect values, and if any assign false.
                matched.x_not_icons = _this5.array_intersect(command_requires['x_not_icons'].split(','), node.icons).length > 0 ? false : true;
              }

              _this5.debug_timeEnd({
                id: "".concat(key, " x_not_icons")
              });
            } // test 3: x_not_empty. example: attributes[event,name] aka key[value1||value2] in node
            // supports multiple requirements using + as delimiter "attributes[event,name]+color"


            if (command_requires['x_not_empty'] != '' && allTrue(matched, keys)) {
              _this5.debug_time({
                id: "".concat(key, " x_not_empty")
              }); //this.debug(`test x_not_empty: ${command_requires['x_not_empty']}`);
              // transform x_not_empty value => ex. attributes[event,name]+color => attributes[event+name],color in com_reqs


              var com_reqs = command_requires['x_not_empty'].replace(/\+/g, '/').replace(/\,/g, '+').replace(/\//g, ',').split(','); //this.debug(':transformed x_not_empty',com_reqs.join(','));

              for (var test of com_reqs) {
                // start tests
                if (test.indexOf('.') != -1) {
                  // struct type definition: ex. cloud.bgcolor (if exists, it must not be empty, or false if doesnt exist)
                  var testpath = getVal(node, test);

                  if (typeof testpath === 'string' && testpath == '' || typeof testpath === 'boolean' && testpath == false) {
                    matched.x_not_empty = false;
                    break;
                  }
                } else if (test.indexOf('[') != -1) {
                  (function () {
                    // array type definition: ex. attributes[value1,value2..] (attributes is an array type)
                    // it must exist value1,value2,.. within array attributes of objects to be true
                    var array_key = test.split('[')[0];

                    var keys = _this5.dsl_parser.findVariables({
                      text: test,
                      symbol: '[',
                      symbol_closing: ']'
                    }).split('+');

                    var has_keys = [];

                    if (array_key != 'attributes' && node[array_key]) {
                      for (var obj of node[array_key]) {
                        Object.keys(obj).filter(function (x) {
                          has_keys.push(x);
                        });
                      }
                    } else if (array_key == 'attributes') {
                      Object.keys(node.attributes).filter(function (x) {
                        has_keys.push(x);
                      });
                    }

                    if (_this5.array_intersect(has_keys, keys).length != keys.length) {
                      matched.x_not_empty = false;
                    }
                  })();
                } else {
                  // single attribute
                  if (test in node && typeof node[test] === 'string' && node[test] == '') {
                    matched.x_not_empty = false;
                  } else if (test in node && typeof node[test] === 'boolean' && node[test] == false) {
                    matched.x_not_empty = false;
                  } else if (typeof node[test] === 'undefined') {
                    matched.x_not_empty = false;
                  }
                }

                yield setImmediatePromise();
              }

              _this5.debug_timeEnd({
                id: "".concat(key, " x_not_empty")
              });
            } // test 4: x_not_text_contains
            // can have multiple values.. ex: margen,arriba


            if (command_requires['x_not_text_contains'] != '' && allTrue(matched, keys)) {
              _this5.debug_time({
                id: "".concat(key, " x_not_text_contains")
              });

              for (var word of command_requires['x_not_text_contains'].split(',')) {
                if (node.text.indexOf(word) != -1) {
                  matched.x_not_text_contains = false;
                  break;
                }

                yield setImmediatePromise();
              }

              _this5.debug_timeEnd({
                id: "".concat(key, " x_not_text_contains")
              });
            } // test 5: x_empty (node keys that must be empty (undefined also means not empty))


            if (command_requires['x_empty'] != '' && allTrue(matched, keys)) {
              _this5.debug_time({
                id: "".concat(key, " x_empty")
              });

              for (var _key of command_requires['x_empty'].split(',')) {
                var _testpath = getVal(node, _key);

                if (typeof _testpath === 'string' && _testpath != '') {
                  matched.x_empty = false;
                  break;
                } else if (typeof _testpath === 'object' && _testpath.length > 0) {
                  matched.x_empty = false;
                  break;
                } else if (typeof _testpath === 'undefined') {
                  matched.x_empty = false;
                  break;
                }

                yield setImmediatePromise();
              }

              _this5.debug_timeEnd({
                id: "".concat(key, " x_empty")
              });
            } // test 6: x_text_exact


            if (allTrue(matched, keys) && command_requires['x_text_exact'] != '') {
              _this5.debug_time({
                id: "".concat(key, " x_text_exact")
              });

              matched.x_text_exact = command_requires['x_text_exact'] == node.text ? true : false;

              _this5.debug_timeEnd({
                id: "".concat(key, " x_text_exact")
              });
            } // test 7: x_text_contains


            if (allTrue(matched, keys) && command_requires['x_text_contains'] != '') {
              _this5.debug_time({
                id: "".concat(key, " x_text_contains")
              }); // @TODO here we are


              if (command_requires['x_text_contains'].indexOf('|') != -1) {
                // 'or' delimiter
                var n_match = false;

                for (var _key2 of command_requires['x_text_contains'].split('|')) {
                  if (node.text.indexOf(_key2) != -1) {
                    n_match = true;
                    break;
                  }
                }

                matched.x_text_contains = n_match;
              } else if (command_requires['x_text_contains'].indexOf(',') != -1) {
                // 'and' delimiter
                for (var _key3 of command_requires['x_text_contains'].split(',')) {
                  if (node.text.indexOf(_key3) == -1 || _key3 == '' && node.text.indexOf(',') == -1) {
                    //test if empty for case where coma is required
                    matched.x_text_contains = false;
                    break;
                  }
                }
              } else if (node.text.toLowerCase().indexOf(command_requires['x_text_contains'].toLowerCase()) == -1) {
                matched.x_text_contains = false;
              }

              _this5.debug_timeEnd({
                id: "".concat(key, " x_text_contains")
              });
            } // test 8: x_level - example: '2,3,4' (any) or '>2,<7' (all)


            if (command_requires['x_level'] != '' && allTrue(matched, keys)) {
              _this5.debug_time({
                id: "".concat(key, " x_level")
              });

              matched.x_level = numberInCondition(node.level, command_requires['x_level']);

              _this5.debug_timeEnd({
                id: "".concat(key, " x_level")
              });
            } // test 9: x_or_hasparent


            if (command_requires['x_or_hasparent'] != '' && allTrue(matched, keys)) {
              _this5.debug_time({
                id: "".concat(key, " x_or_hasparent")
              }); //matched.x_or_hasparent=false;


              matched.x_or_hasparent = yield _this5.hasParentID(node.id, command_requires['x_or_hasparent']);

              _this5.debug_timeEnd({
                id: "".concat(key, " x_or_hasparent")
              });
            } // test 10: x_all_hasparent


            if (command_requires['x_all_hasparent'] != '' && allTrue(matched, keys)) {
              _this5.debug_time({
                id: "".concat(key, " x_all_hasparent")
              });

              matched.x_all_hasparent = yield _this5.hasParentID(node.id, command_requires['x_all_hasparent'], true);

              _this5.debug_timeEnd({
                id: "".concat(key, " x_all_hasparent")
              });
            } // test 11: x_or_isparent


            if (command_requires['x_or_isparent'] != '' && allTrue(matched, keys)) {
              _this5.debug_time({
                id: "".concat(key, " x_or_isparent")
              });

              var is_direct = false;

              for (var _key4 of command_requires['x_or_isparent'].split(',')) {
                is_direct = yield _this5.isExactParentID(node.id, _key4);
                if (is_direct == true) break;
                yield setImmediatePromise();
              }

              matched.x_or_isparent = is_direct;

              _this5.debug_timeEnd({
                id: "".concat(key, " x_or_isparent")
              });
            } // test 12: x_text_pattern
            // example: ejecutar en "*" +(segundos|minutos|horas)


            if (typeof command_requires['x_text_pattern'] === 'string' && command_requires['x_text_pattern'] != '' && allTrue(matched, keys)) {
              _this5.debug_time({
                id: "".concat(key, " x_text_pattern")
              });

              matched.x_text_pattern = _this5.x_match(node.text.trim(), command_requires['x_text_pattern']);

              _this5.debug_timeEnd({
                id: "".concat(key, " x_text_pattern")
              });
            } // test 12b: x_text_pattern as array of strings
            // any must match


            if (Array.isArray(command_requires['x_text_pattern']) == true && command_requires['x_text_pattern'].length > 0 && allTrue(matched, keys)) {
              _this5.debug_time({
                id: "".concat(key, " x_text_pattern[]")
              });

              var _test = false,
                  text_trim = node.text.trim();

              for (var xtp of command_requires['x_text_pattern']) {
                _test = _this5.x_match(text_trim, xtp);
                if (_test == true) break;
              }

              matched.x_text_pattern = _test;

              _this5.debug_timeEnd({
                id: "".concat(key, " x_text_pattern[]")
              });
            } // ***************************
            // if we passed all tests ... 
            // ***************************


            if (allTrue(matched, keys)) {
              // count num of defined requires on matched command (more is more exact match, aka priority)
              var count = Object.entries(command_requires).reduce((n, x) => n + (x[1] != ''), 0); // assign resp

              resp = _objectSpread2(_objectSpread2(_objectSpread2({}, {
                x_priority: -1
              }), _this5.x_commands[key]), {
                x_id: key,
                priority: count
              });

              if (!justone) {
                xtest.push(resp);
              } else {
                break;
              }
            }
            /*if (node.id=='ID_923953027') {
            console.log(`${node.text}: ${key} command_requires`,command_requires);
            console.log(`${node.text}: matched`,matched);
            }*/


            yield setImmediatePromise();
          } // sort by priority


          if (show_debug) _this5.debug_time({
            id: "sorting by priority"
          });
          var sorted = xtest.sort(function (a, b) {
            if (a.x_priority != -1 && b.x_priority != -1) {
              // sort by x_priority
              return b.x_priority - a.x_priority;
            } else {
              // sort by priority (number of features)
              return b.priority - a.priority;
            }
          });
          if (show_debug) _this5.debug_timeEnd({
            id: "sorting by priority"
          }); // reply

          if (!justone) {
            /*
            // get just the ids
            let sorted_ids = sorted.map(function(elem,value) {
            	return elem.id;	
            });
            */
            // return the array of commands, sorted by 'priority' key
            resp = sorted;
          } //console.log(`findCommand resp`,resp);


          if (Array.isArray(resp) && resp.length > 0 || resp.data) {
            //only add to cache, if at least 1 command was found.
            yield _this5.cache.setItem(cache_key, resp);
          } //this.x_memory_cache.findCommand[node.id] = resp;


          return resp;
        }
      })();
    }
    /**
    * Finds the valid/best command match for the given node.
    * Also tests the command for its 'valid' attribute, in case the command func specified aditional conditions.
    * If no command is found, returns false.
    *
    * @async
    * @param 	{NodeDSL}		node			- node for which to find the command
    * @param 	{boolean}		[object=false]	- if false returns the command reference, true returns the command execution answer
    * @return 	{Command|boolean}
    */


    findValidCommand() {
      var _arguments2 = arguments,
          _this6 = this;

      return _asyncToGenerator(function* () {
        var {
          node = _this6.throwIfMissing('node'),
          object = false,
          x_command_shared_state = {},
          show_debug = true
        } = _arguments2.length > 0 && _arguments2[0] !== undefined ? _arguments2[0] : {};
        if (!_this6.x_flags.init_ok) throw new Error('error! the first called method must be init()!');

        if (node.id in _this6.x_memory_cache.findValidCommand) {
          //if (show_debug) this.debug({ message:`findValidCommand called for node ${node.id}, level:${node.level}, text:${node.text} using CACHE`, color:'green' });
          return _this6.x_memory_cache.findValidCommand[node.id];
        } else {
          if (show_debug) _this6.debug({
            message: "findValidCommand called for node ".concat(node.id, ", level:").concat(node.level, ", text:").concat(node.text),
            color: 'yellow'
          });
          var reply = {};
          var commands_ = yield _this6.findCommand({
            node,
            justone: false,
            show_debug: show_debug
          }); // @TODO debug and test

          if (commands_.length == 0) {
            _this6.debug({
              message: 'findValidCommand: no command found.',
              color: 'red'
            });

            reply.error = true;
            reply.catch = 'no command found';
          } else if (commands_.length == 1) {
            reply = _objectSpread2({}, commands_[0]); // try executing the node on the found commands_

            try {
              //if (object==true) {
              var test = yield _this6.x_commands[reply.x_id].func(node, x_command_shared_state);
              reply.exec = test; //}
              // @TODO test if _f4e is used; because its ugly

              reply._f4e = commands_[0].x_id;
              if (show_debug) _this6.debug({
                message: "findValidCommand: 1/1 applying command ".concat(commands_[0].x_id, " ... VALID MATCH FOUND! (nodeid:").concat(node.id, ")"),
                color: 'green'
              });
            } catch (test_err) {
              if (show_debug) _this6.debug({
                message: "findValidCommand: 1/1 applying command ".concat(commands_[0].x_id, " ... ERROR! (nodeid:").concat(node.id, ")"),
                color: 'red'
              }); // @TODO emit('internal_error','findValidCommand')

              reply.error = true;
              reply.valid = false;
              reply.catch = test_err; //throw new Error(test_err); // @TODO we should throw an error, so our parents catch it (9-AGO-20)
            }
          } else {
            // more than one command found
            if (show_debug) _this6.debug({
              message: "findValidCommand: ".concat(commands_.length, " commands found: (nodeid:").concat(node.id, ")"),
              color: 'green'
            }); // test each command

            for (var qm_index in commands_) {
              var qm = commands_[qm_index];

              try {
                var _test2 = yield _this6.x_commands[qm.x_id].func(node, x_command_shared_state);

                if (_test2 && _test2.valid && _test2.valid == true) {
                  if (show_debug) _this6.debug({
                    message: "findValidCommand: ".concat(parseInt(qm_index) + 1, "/").concat(commands_.length, " testing command ").concat(qm.x_id, " ... VALID MATCH FOUND! (nodeid:").concat(node.id, ")"),
                    color: 'green'
                  });
                  if (show_debug) _this6.debug({
                    message: '---------------------',
                    time: false
                  });

                  if (object) {
                    //==true) { -this needs further testing 27abr21
                    reply = _test2;
                  } else {
                    // @TODO test if _f4e is used; because its ugly
                    reply = qm;
                    reply.exec = _test2;
                    reply._f4e = qm.x_id;
                  }

                  break;
                }
              } catch (test_err1) {
                if (show_debug) _this6.debug({
                  message: "findValidCommand: error executing command ".concat(qm, " (nodeid:").concat(node.id, ")"),
                  data: test_err1,
                  color: 'red'
                });
                reply.error = true;
                reply.valid = false;
                reply.catch = test_err1; // @TODO we should throw an error, so our parents catch it (9-AGO-20) and break the loop
              }

              yield setImmediatePromise();
            }
          }

          if (Object.keys(reply).length == 0) reply = false;
          _this6.x_memory_cache.findValidCommand[node.id] = reply;
          return reply;
        }
      })();
    } // ****************************
    // ADVANCED PROCESSING METHODS
    // ****************************

    /**
    * This method traverses the dsl parsed tree, finds/execute x_commands and generated code as files.
    * @return 	{Object}
    */


    process() {
      var _this7 = this;

      return _asyncToGenerator(function* () {
        yield _this7.cacheCommands();
        if (!_this7.x_flags.init_ok) throw new Error('error! the first called method must be init()!');

        _this7.debug_time({
          id: 'process/writer'
        });

        var resp = {
          nodes: []
        }; // read nodes

        _this7.x_console.outT({
          prefix: 'process,yellow',
          message: "processing nodes ..",
          color: 'cyan'
        });

        var x_dsl_nodes = yield _this7.dsl_parser.getNodes({
          level: 2,
          nodes_raw: true,
          hash_content: true
        });

        _this7.debug('calling onPrepare');

        _this7.debug_time({
          id: 'onPrepare'
        });

        yield _this7.onPrepare();

        _this7.debug_timeEnd({
          id: 'onPrepare'
        });

        if (!_this7.x_config.debug) {
          _this7.progress_multi = {};
          _this7.multibar = _this7.x_console.progress({
            format: "{text} {bar} | {screen}",
            config: {
              barsize: 20,
              etaBuffer: 500,
              fps: 20
            },
            formatData: data => {
              //color the progress bar
              if (typeof data.error === 'undefined') data.error = false;

              if (data.error && data.error == true) {
                data.bar = data.funcs.colors.red(data.bar);
                data.text = data.funcs.colors.red('processing error'); //+' '+data.funcs.symbols.fail;
              } else if (data.percentage <= 20) {
                data.bar = data.funcs.colors.magenta(data.bar);
              } else if (data.percentage <= 60) {
                data.bar = data.funcs.colors.yellow(data.bar);
              } else {
                data.bar = data.funcs.colors.green(data.bar);
              }

              if (data.screen) data.screen = data.funcs.colors.cyan(data.screen);

              if (data.total_ && data.total_ == 'x') {
                if (data.percentage >= 100) {
                  var took = data.funcs.colors.dim(' - {duration}');
                  data._format = '{text}' + took; // | {screen}

                  data.text = data.funcs.colors.green('processing complete! ') + data.funcs.symbols.success;
                } else {
                  data._format = '{text} {bar} | {screen} ({eta} remaining)';
                  data.text = data.funcs.colors.dim('overall progress');
                }
              } else {
                if (data.sub && data.sub != '') {
                  data.sub = data.funcs.colors.dim(data.sub);
                  data.percentage = data.funcs.colors.dim(data.percentage + ' %');
                  data._format = '{text} {bar} | {screen} -> {sub} {percentage}';
                }

                if (data.percentage >= 100) {
                  var _took = data.funcs.colors.dim(' - {duration}');

                  data._format = '{text} | {screen}' + _took;
                  data.text = 'processing done! ' + data.funcs.symbols.success;
                } else {
                  data.text = data.funcs.colors.dim('processing');
                }
              }

              return data;
            }
          }); // 

          _this7.progress_multi['_total_'] = _this7.multibar.create(x_dsl_nodes.length - 1, {
            total_: 'x',
            screen: 'initializing..'
          });
        }

        var counter_ = 0;
        var meta_cache = {};
        var meta_cache_ = yield _this7.cache.getItem('meta_cache');
        if (meta_cache_) meta_cache = meta_cache_;

        var obj_diff = require('deep-object-diff').diff;

        var deep = require('deepmerge');

        for (var level2 of x_dsl_nodes) {
          //this.debug('node',level2);
          //break;
          if (!_this7.x_config.debug) {
            if (_this7.progress_last) _this7.progress_last.raw().stop();
            _this7.progress_multi[level2.text] = _this7.multibar.create(level2.nodes_raw.length - 1, {
              total_: '',
              screen: 'initializing..'
            });

            _this7.progress_multi['_total_'].update(counter_, {
              total_: 'x',
              screen: level2.text
            });

            _this7.progress_last = _this7.progress_multi[level2.text];
            _this7.progress_last_screen = level2.text;
          } //cache: check if current node has any children that were modified since last time


          var main = yield _this7.cache.getItem(level2.hash_content); // remove await when in production (use Promise.all after loop then)

          if (!main) {
            var before_state = JSON.parse(JSON.stringify(_this7.x_state));
            main = yield _this7.process_main(level2, {});
            var state_to_save = obj_diff(before_state, _this7.x_state); //console.log('state_to_save',{ state_to_save });

            if (main.error && main.error == true) ; else {
              //meta info for controlling cache
              meta_cache[main.file] = {
                cachekey: level2.hash_content,
                x_ids: main.x_ids
              };
              yield _this7.cache.setItem(level2.hash_content, main);
              yield _this7.cache.setItem(level2.hash_content + '_x_state', state_to_save);
            } //console.log('metido al cache:'+level2.id,main);

          } else {
            var cached_state = yield _this7.cache.getItem(level2.hash_content + '_x_state');
            _this7.x_state = deep.all([_this7.x_state, cached_state]);

            if (main.error && main.error == true) {
              yield _this7.cache.removeItem(level2.hash_content); //reprocess the removed failed cached node.

              var _before_state = JSON.parse(JSON.stringify(_this7.x_state));

              main = yield _this7.process_main(level2, {});

              var _state_to_save = obj_diff(_before_state, _this7.x_state); //console.log('state_to_save2',{ state_to_save });


              if (main.error && main.error == true) ; else {
                //meta info for controlling cache
                meta_cache[main.file] = {
                  cachekey: level2.hash_content,
                  x_ids: main.x_ids
                };
                yield _this7.cache.setItem(level2.hash_content, main);
                yield _this7.cache.setItem(level2.hash_content + '_x_state', _state_to_save);
              }
            } //console.log(level2.id,main);

          } //


          if (!_this7.x_config.debug) {
            _this7.progress_multi[level2.text].total(level2.nodes_raw.length - 1);

            _this7.progress_multi[level2.text].update(level2.nodes_raw.length - 1, {
              screen: level2.text,
              sub: '',
              total_: ''
            });
          } // append to resp


          resp.nodes.push(main);
          yield setImmediatePromise();
          counter_ += 1;
        }

        if (!_this7.x_config.debug) {
          _this7.progress_multi['_total_'].raw().stop(); //.remove();


          _this7.multibar.stop();
        } // @TODO enable when not debugging
        //resp.nodes = await Promise.all(resp.nodes);


        _this7.debug_timeEnd({
          id: 'process/writer'
        }); // check if there was some error


        var were_errors = false;
        resp.nodes.map(function (x) {
          if (x.error == true) {
            were_errors = true;
            return false;
          }
        }); // if there was no error

        if (!were_errors) {
          // request creation of files
          yield _this7.onCreateFiles(resp.nodes);

          _this7.x_console.title({
            title: "Interpreter ".concat(_this7.x_config.class.toUpperCase(), " ENDED. Full Compilation took: ").concat(_this7.secsPassed_()),
            color: 'green'
          });

          _this7.debug_table('Amount of Time Per Command');
        } else {
          // errors occurred
          _this7.x_console.title({
            title: "Interpreter ".concat(_this7.x_config.class.toUpperCase(), " ENDED with ERRORS.\nPlease check your console history.\nCompilation took: ").concat(_this7.secsPassed_()),
            color: 'red'
          }); //this.debug_table('Amount of Time Per Command');

        } // some debug
        //this.debug('after nodes processing, resp says:',resp);
        //this.debug('app state says:',this.x_state);


        yield _this7.onEnd();
        yield _this7.cache.setItem('last_compile_date', new Date()); //add meta cache to cache

        yield _this7.cache.setItem('meta_cache', meta_cache);
        return resp;
      })();
    } // process helper methods 
    // improved in my imagination ...


    sub_process(source_resp, nodei, custom_state) {
      var _this8 = this;

      return _asyncToGenerator(function* () {
        var resp = _objectSpread2({}, source_resp);

        if (resp.hasChildren == true && resp.valid == true) {
          var sub_nodes = yield nodei.getNodes();
          var new_state = {},
              xx = 0;
          if (nodei.state) new_state = _objectSpread2({}, nodei.state);
          new_state = _objectSpread2(_objectSpread2({}, new_state), custom_state);

          if (!_this8.x_config.debug) {
            _this8.progress_last.total(sub_nodes.length - 1); //this.progress_multi['_total_'].raw().updateETA();

          }

          for (var sublevel of sub_nodes) {
            xx += 1;
            var real = yield _this8.dsl_parser.getNode({
              id: sublevel.id,
              nodes_raw: true,
              recurse: false
            });
            var real2 = yield _this8.findValidCommand({
              node: real,
              object: false,
              x_command_shared_state: new_state
            });

            if (!_this8.x_config.debug) {
              _this8.progress_last.update(xx, {
                screen: _this8.progress_last_screen,
                sub: real2.x_id,
                total_: ''
              });
            } //console.log('sub_process->findValidCommand node:'+real.text,real2);
            //if (nodei.state) new_state = {...new_state, ...nodei.state, ...real2.state}; // inherint state from last command if defined


            if (real2.state) new_state = _objectSpread2(_objectSpread2({}, new_state), real2.state); // inherint state from last command if defined

            if (real2 && real2.exec && real2.exec.valid == true) {
              //resp.children.push(real2.exec);
              if (real2.exec.state) new_state = _objectSpread2(_objectSpread2({}, new_state), real2.exec.state); //console.log('real2 dice:',real2);

              resp.init += real2.exec.init;
              resp.code += real2.exec.open;
              if (!resp.x_ids) resp.x_ids = [];
              resp.x_ids.push(real2.x_id);
              resp = yield _this8.sub_process(resp, sublevel, new_state);
              resp.code += real2.exec.close;
            } else if (real2.error == true) {
              if (!_this8.x_config.debug) {
                _this8.progress_last.total(xx);

                _this8.progress_last.update(xx, {
                  screen: 'ERROR',
                  error: true
                });
              }

              _this8.x_console.outT({
                message: "error: Executing func x_command:".concat(real2.x_id, " for node: id:").concat(real.id, ", level ").concat(real.level, ", text: ").concat(real.text, "."),
                data: {
                  id: real.id,
                  level: real.level,
                  text: real.text,
                  data: real2.catch,
                  x_command_state: new_state
                }
              });

              yield _this8.onErrors(["Error executing func for x_command:".concat(real2.x_id, " for node id ").concat(real.id, ", text: ").concat(real.text, " ")]);
              resp.valid = false, resp.hasChildren = false, resp.error = true;
              break;
            }

            yield setImmediatePromise();
          }
        }

        return resp;
      })();
    }

    process_main(node, custom_state) {
      var _this9 = this;

      return _asyncToGenerator(function* () {
        var resp = {
          state: custom_state,
          id: node.id,
          name: yield _this9.onDefineNodeName(node),
          file: yield _this9.onDefineFilename(node),
          init: '',
          title: yield _this9.onDefineTitle(node),
          attributes: node.attributes,
          code: '',
          open: '',
          close: '',
          x_ids: [],
          subnodes: node.nodes_raw.length
        };

        if (_this9.x_config.debug) {
          _this9.x_console.outT({
            prefix: 'process,yellow',
            message: "processing node ".concat(node.text, " .."),
            color: 'yellow'
          });
        } //
        //try {
        //console.log('process_main->findValidCommand node:'+node.text);


        var copy_state = _objectSpread2({}, custom_state);

        var test = yield _this9.findValidCommand({
          node: node,
          object: false,
          x_command_shared_state: copy_state
        }); //this.debug(`test para node: text:${node.text}`,test);

        if (test && test.exec && test.exec.valid == true) {
          if (test.exec.state) copy_state = _objectSpread2(_objectSpread2({}, copy_state), test.exec.state);
          resp = _objectSpread2(_objectSpread2({}, resp), test.exec);
          resp.error = false;
          resp.init += resp.init;
          resp.code += resp.open;
          resp.state = copy_state;
          if (!resp.x_ids) resp.x_ids = [];
          resp.x_ids.push(test.x_id);

          if (typeof node.getNodes === 'function') {
            resp = yield _this9.sub_process(resp, node, copy_state);
          }

          resp.code += resp.close;
          resp.x_ids = resp.x_ids.join(',');
        } else if (test.error == true) {
          _this9.x_console.outT({
            message: "error: Executing func x_command:".concat(test.x_id, " for node: id:").concat(node.id, ", level ").concat(node.level, ", text: ").concat(node.text, "."),
            data: {
              id: node.id,
              level: node.level,
              text: node.text,
              catch: test.catch,
              x_command_state: test.state
            }
          });

          yield _this9.onErrors(["Error executing func for x_command:".concat(test.x_id, " for node id ").concat(node.id, ", text: ").concat(node.text, " ")]);
          resp.valid = false, resp.hasChildren = false, resp.error = true;
        } else {
          _this9.x_console.outT({
            message: 'error: FATAL, no method found for node processing.',
            data: {
              id: node.id,
              level: node.level,
              text: node.text
            }
          });

          yield _this9.onErrors(["No method found for given node id ".concat(node.id, ", text: ").concat(node.text, " ")]);
          resp.valid = false, resp.hasChildren = false, resp.error = true;
        } // closing level2 'on' calls


        resp = yield _this9.onAfterProcess(resp);
        resp = yield _this9.onCompleteCodeTemplate(resp); //

        /*} catch(err) {
        	// @TODO currently findValidCommand doesn't throw an error when an error is found.
        	this.x_console.outT({ message:`error: Executing func x_command for node: id:${node.id}, level ${node.level}, text: ${node.text}.`, data:{ id:node.id, level:node.level, text:node.text, error:err }});
        	await this.onErrors([`Error executing func for x_command for node id ${node.id}, text: ${node.text} `]);
        	resp.valid=false, resp.hasChildren=false, resp.error=true;
        }*/
        // return

        return resp;
      })();
    } // **********************
    // public helper methods
    // **********************


    secsPassed_() {
      var tmp = new Date().getTime() - this.x_flags.watchdog.start.getTime();

      var humanize = require('humanize-duration');

      return humanize(tmp, {
        maxDecimalPoints: 0
      }); //tmp/1000
    }

    throwIfMissing(name) {
      throw new Error('Missing ' + name + ' parameter!');
    }
    /**
    * Helper method for obtaining the common values (which can be anything) between two arrays.
    * @param 	{string[]|Object[]|boolean[]}		arr1	- first array
    * @param 	{string[]|Object[]|boolean[]}		arr2	- second array
    * @return 	{string[]|Object[]|boolean[]}
    */


    array_intersect(arr1, arr2) {
      return arr1.filter(x => arr2.includes(x));
    }
    /**
    * Helper method for obtaining the first array items minus the second array items (which can be anything).
    * @param 	{string[]|Object[]|boolean[]}		arr1	- first array from which to substract
    * @param 	{string[]|Object[]|boolean[]}		arr2	- second array with items to substract from arr1
    * @return 	{string[]|Object[]|boolean[]}
    */


    array_substract(arr1, arr2) {
      return arr1.filter(x => !arr2.includes(x));
    }
    /**
    * Helper method for obtaining the unique values (which can be anything) between two arrays.
    * @param 	{string[]|Object[]|boolean[]}		arr1	- first array
    * @param 	{string[]|Object[]|boolean[]}		arr2	- second array
    * @return 	{string[]|Object[]|boolean[]}
    */


    array_difference(arr1, arr2) {
      return arr1.filter(x => !arr2.includes(x)).concat(arr2.filter(x => !arr1.includes(x)));
    }
    /**
    * Helper method for joining the values (which can be anything) between two arrays.
    * @param 	{string[]|Object[]|boolean[]}		arr1	- first array
    * @param 	{string[]|Object[]|boolean[]}		arr2	- second array
    * @return 	{string[]|Object[]|boolean[]}
    */


    array_union(arr1, arr2) {
      return [...arr1, ...arr2];
    } // public helpers

    /**
    * Helper method for defining how to display (or do with them; if you overload it) debug messages.
    * @param 	{string|Object}		message		- message to display. It can also be an Object of open-console params.
    * @param 	{*}					[data]		- data variable to show with message
    */


    debug(message, data) {
      var params = {};

      if (arguments.length == 1 && typeof arguments[0] === 'object') {
        params = arguments[0];
      } else {
        params = {
          message,
          data
        };
      }

      if (this.x_config.debug && params.time) {
        this.x_console.outT(_objectSpread2(_objectSpread2({}, {
          prefix: 'debug,dim',
          color: 'dim'
        }), params));
      } else if (this.x_config.debug) {
        this.x_console.out(_objectSpread2(_objectSpread2({}, {
          prefix: 'debug,dim',
          color: 'dim'
        }), params));
      }
    }
    /*
    * Creates required app folder structure needed for file generation as the given specs and returns object with absolute paths
    * optional output_dir overwrites base target directory (which is location of .dsl file + apptitle subdir)
    * @param 	{Object} 	keys 			- Object with keys for which to return absolute paths. Each key must contain a relative output directory (can be nested) to be created and returned.
    * @param 	{string} 	[output_dir]	- Overwrites the default output base directory (which is the location of the dsl file being proccessed).
    * @return 	{Object}
    */


    _appFolders(keys) {
      var _arguments3 = arguments,
          _this10 = this;

      return _asyncToGenerator(function* () {
        var compile_folder = _arguments3.length > 1 && _arguments3[1] !== undefined ? _arguments3[1] : _this10.x_state.central_config.apptitle;
        var output_dir = _arguments3.length > 2 ? _arguments3[2] : undefined;

        var fs = require('fs').promises;

        _this10.debug('_appFolders');

        var path = require('path');

        var dsl_folder = path.dirname(path.resolve(_this10.x_flags.dsl)) + path.sep;
        if (output_dir) dsl_folder = output_dir;
        var resp = {
          base: dsl_folder,
          src: dsl_folder + (compile_folder ? compile_folder : _this10.x_state.central_config.apptitle) + path.sep
        };
        resp.app = path.normalize(resp.src);
        resp.compile_folder = compile_folder; // depending on central config type

        for (var key in keys) {
          resp[key] = path.join(resp.app, keys[key]); // create directories as needed

          try {
            yield fs.mkdir(resp[key], {
              recursive: true
            });
          } catch (errdir) {}
        } // return


        return resp;
      })();
    }
    /**
    * Helper method for measuring (start) time in ms from this method until debug_timeEnd() method and show it in the console.
    * @param 	{string}		id		- id key (which can also have spaces and/or symbols) with a unique id to identify the stopwatch.
    */


    debug_time() {
      // instead of marking and showing time, we want in vue to build a time table and show it with another method
      if (arguments.length > 0) {
        var keys = _objectSpread2({}, arguments[0]);

        if (typeof keys.id !== 'undefined' && keys.id.indexOf('def_') != -1) {
          //&& keys.id.indexOf('_x')!=-1
          var filter_key = keys.id.split(' ')[0];

          if (typeof this.x_time_stats.times[filter_key] === 'undefined' && filter_key.indexOf('def_') != -1) {
            this.x_time_stats.times[filter_key] = new Date();
            this.x_time_stats.tables[filter_key] = {
              command: filter_key,
              calls: 0,
              average_call: 0,
              total_ms: 0
            };
          } else if (this.x_config.debug == true) {
            this.x_console.time(_objectSpread2({}, arguments[0]));
          }
        } else if (this.x_config.debug == true) {
          this.x_console.time(_objectSpread2({}, arguments[0]));
        }
      }
    }
    /*
    debug_time() {
    	if (this.x_config.debug && arguments.length>0) {
    		this.x_console.time({...arguments[0]});
    	}
    }*/

    /**
    * Helper method for measuring (end) time in ms from the call of debug_time() method.
    * @param 	{string}		id		- id key used in the call for debug_time() method.
    */


    debug_timeEnd() {
      if (arguments.length > 0) {
        var keys = _objectSpread2({}, arguments[0]),
            filter_key = ''; // && keys.id.indexOf('_x')!=-1


        if (typeof keys.id !== 'undefined') filter_key = keys.id.split(' ')[0];

        if (typeof keys.id !== 'undefined' && filter_key.indexOf('def_') != -1 && filter_key in this.x_time_stats.times) {
          //if (!this.x_time_stats.tables[keys.id]) this.x_time_stats.tables[keys.id] = {};
          if (typeof this.x_time_stats.tables[filter_key] !== 'undefined') {
            var timePassed = new Date().getTime() - this.x_time_stats.times[filter_key].getTime();
            this.x_time_stats.tables[filter_key].calls += 1;
            this.x_time_stats.tables[filter_key].total_ms = timePassed;
            this.x_time_stats.tables[filter_key].average_call = Math.round(this.x_time_stats.tables[filter_key].total_ms / this.x_time_stats.tables[filter_key].calls);
          }
        } else if (this.x_config.debug == true) {
          this.x_console.timeEnd(_objectSpread2(_objectSpread2({}, {
            color: 'dim',
            prefix: 'debug,dim'
          }), arguments[0]));
        }
      }
    }
    /*debug_timeEnd() {
    	if (this.x_config.debug && arguments.length>0) {
    		this.x_console.timeEnd({...{ color:'dim',prefix:'debug,dim' },...arguments[0]});
    	}
    }*/

    /**
    * Helper method for showing a table with each command execution time and amount of calls
    * @param 	{string}		title		- Optional custom title for table.
    */


    debug_table(title) {
      // build a table with x_time_stats and show it on the console
      var table = [];

      try {
        Object.keys(this.x_time_stats.tables).map(function (key) {
          table.push(this.x_time_stats.tables[key]);
        }.bind(this));
        this.x_console.table({
          title: title ? title : 'Times per Command',
          data: table,
          color: 'cyan'
        });
      } catch (e) {
        this.x_console.outT({
          message: "used cache for finding every command",
          color: 'cyan'
        });
      }
    }
    /**
    * Helper method to return true if given node id has a brother of given command x_id
    * @async
    * @param 	{string}	id		- ID of NodeDSL object to query
    * @param 	{string}	x_id	- Command object x_id to test for
    * @return 	{Boolean}
    */


    hasBrotherID() {
      var _arguments4 = arguments,
          _this11 = this;

      return _asyncToGenerator(function* () {
        var id = _arguments4.length > 0 && _arguments4[0] !== undefined ? _arguments4[0] : _this11.throwIfMissing('id');
        var x_id = _arguments4.length > 1 && _arguments4[1] !== undefined ? _arguments4[1] : _this11.throwIfMissing('x_id');

        // @TODO test it after having 'real' commands on some parser 3-ago-20
        if (id + x_id in _this11.x_memory_cache.hasBrotherID) {
          return _this11.x_memory_cache.hasBrotherID[id + x_id];
        } else {
          var brother_ids = yield _this11.dsl_parser.getBrotherNodesIDs({
            id,
            before: true,
            after: true
          }).split(',');
          var brother_x_ids = [],
              resp = false;

          for (var q of brother_ids) {
            var node = yield _this11.dsl_parser.getNode({
              id: q,
              recurse: false
            });
            var command = yield findValidCommand({
              node: node,
              show_debug: false,
              object: true
            });
            brother_x_ids.push(command.x_id);
            if (brother_x_ids.includes(x_id) == true) return true;
          } //resp = (brother_x_ids.includes(x_id));


          _this11.x_memory_cache.hasBrotherID[id + x_id] = resp;
          return resp;
        }
      })();
    }
    /**
    * Helper method to return true if given node ID has a brother before it
    * @async
    * @param 	{string}	id		- ID of NodeDSL object to query
    * @return 	{Boolean}
    */


    hasBrotherBefore() {
      var _arguments5 = arguments,
          _this12 = this;

      return _asyncToGenerator(function* () {
        var id = _arguments5.length > 0 && _arguments5[0] !== undefined ? _arguments5[0] : _this12.throwIfMissing('id');

        if (id in _this12.x_memory_cache.hasBrotherBefore) {
          return _this12.x_memory_cache.hasBrotherBefore[id];
        } else {
          var brother_ids = yield _this12.dsl_parser.getBrotherNodesIDs({
            id,
            before: true,
            after: false
          }).split(',');
          _this12.x_memory_cache.hasBrotherBefore[id] = brother_ids.includes(id);
          return _this12.x_memory_cache.hasBrotherBefore[id];
        }
      })();
    }
    /**
    * Helper method to return true if given node ID has a brother following it
    * @async
    * @param 	{string}	id		- ID of NodeDSL object to query
    * @return 	{Boolean}
    */


    hasBrotherNext() {
      var _arguments6 = arguments,
          _this13 = this;

      return _asyncToGenerator(function* () {
        var id = _arguments6.length > 0 && _arguments6[0] !== undefined ? _arguments6[0] : _this13.throwIfMissing('id');

        if (id in _this13.x_memory_cache.hasBrotherNext) {
          return _this13.x_memory_cache.hasBrotherNext[id];
        } else {
          var brother_ids = yield _this13.dsl_parser.getBrotherNodesIDs({
            id,
            before: false,
            after: true
          }).split(',');
          _this13.x_memory_cache.hasBrotherNext[id] = brother_ids.includes(id);
          return _this13.x_memory_cache.hasBrotherNext[id];
        }
      })();
    }
    /**
    * Helper method to return true if given Command object x_id is the exact parent for the given NodeDSL object id
    * @async
    * @param 	{string}	id		- ID of NodeDSL object to query
    * @param 	{string}	x_id	- Command object x_id to test for
    * @return 	{Boolean}
    */


    isExactParentID() {
      var _arguments7 = arguments,
          _this14 = this;

      return _asyncToGenerator(function* () {
        var id = _arguments7.length > 0 && _arguments7[0] !== undefined ? _arguments7[0] : _this14.throwIfMissing('id');
        var x_id = _arguments7.length > 1 && _arguments7[1] !== undefined ? _arguments7[1] : _this14.throwIfMissing('x_id');

        // @TODO test it after having 'real' commands on some parser 4-ago-20
        if (id + x_id in _this14.x_memory_cache.isExactParentID) {
          return _this14.x_memory_cache.isExactParentID[id + x_id];
        } else {
          var parent_node = yield _this14.dsl_parser.getParentNode({
            id
          });
          var parent_command = yield _this14.findValidCommand({
            node: parent_node,
            show_debug: false,
            object: true
          });

          if (parent_command && parent_command.x_id == x_id) {
            _this14.x_memory_cache.isExactParentID[id + x_id] = true;
            return true;
          }

          _this14.x_memory_cache.isExactParentID[id + x_id] = false;
          return false;
        }
      })();
    }
    /**
    * Helper method to return true if given Command object x_id is the parent or is an ancestor for the given NodeDSL object id
    * @async
    * @param 	{string}	id		- ID of NodeDSL object to query
    * @param 	{string}	x_id	- Command object x_id to test for
    * @return 	{Boolean}
    */


    hasParentID() {
      var _arguments8 = arguments,
          _this15 = this;

      return _asyncToGenerator(function* () {
        var id = _arguments8.length > 0 && _arguments8[0] !== undefined ? _arguments8[0] : _this15.throwIfMissing('id');
        var x_id = _arguments8.length > 1 && _arguments8[1] !== undefined ? _arguments8[1] : _this15.throwIfMissing('x_id');
        var onlyTrueIfAll = _arguments8.length > 2 && _arguments8[2] !== undefined ? _arguments8[2] : false;
        // @TODO test it after having 'real' commands on some parser aug-4-20, fixed on aug-15-20
        var x_ids = x_id.split(',');
        var parents = yield _this15.dsl_parser.getParentNodesIDs({
          id,
          array: true
        });
        var tested_parents_x_ids = [];

        for (var parent_id of parents) {
          var node = yield _this15.dsl_parser.getNode({
            id: parent_id,
            recurse: false
          });
          var parentCommand = yield _this15.findValidCommand({
            node,
            show_debug: false,
            object: true
          });

          if (onlyTrueIfAll == false && x_ids.includes(parentCommand.x_id)) {
            return true;
          } else if (onlyTrueIfAll == false) ; else if (onlyTrueIfAll == true) {
            // onlyTrueIfAll==true
            tested_parents_x_ids.push(parentCommand.x_id);

            if (_this15.array_intersect(tested_parents_x_ids, x_ids).length == x_ids.length) {
              return true;
            }
          }
        } // test again if we are here


        if (_this15.array_intersect(tested_parents_x_ids, x_ids).length == x_ids.length) {
          return true;
        } else {
          return false;
        } //if (!onlyTrueIfAll) return false;
      })();
    }
    /**
    * Helper method to return all Command object x_ids parents of given NodeDSL id; if array=true, 
    * @async
    * @param 	{string}	id		- ID of NodeDSL object to query
    * @param 	{Boolean}	array	- If true, returns array of objects with x_id and ids, instead of a list of NodeDSL ids.
    * @return 	{string|Object[]}
    */


    getParentIDs() {
      var _arguments9 = arguments,
          _this16 = this;

      return _asyncToGenerator(function* () {
        var id = _arguments9.length > 0 && _arguments9[0] !== undefined ? _arguments9[0] : _this16.throwIfMissing('id');
        var array = _arguments9.length > 1 && _arguments9[1] !== undefined ? _arguments9[1] : false;
        // @TODO test it after having 'real' commands on some parser 4-ago-20
        var parents = yield _this16.dsl_parser.getParentNodesIDs({
          id,
          array: true
        });
        var resp = [];

        for (var parent_id of parents) {
          var node = yield _this16.dsl_parser.getNode({
            parent_id,
            recurse: false
          });
          var command = yield _this16.findValidCommand({
            node,
            show_debug: false
          });

          if (command && array) {
            resp.push({
              id: parent_id,
              x_id: command.x_id
            });
          } else {
            resp.push(command.x_id);
          }
        }

        if (array && array == true) return resp;
        return resp.join(',');
      })();
    }
    /**
    * Helper method to return all Command object x_ids parents of given NodeDSL id as an array (its an alias for getParentIDs) 
    * @async
    * @param 	{string}	id		- ID of NodeDSL object to query
    * @return 	{Object[]}
    */


    getParentIDs2Array() {
      var _arguments10 = arguments,
          _this17 = this;

      return _asyncToGenerator(function* () {
        var id = _arguments10.length > 0 && _arguments10[0] !== undefined ? _arguments10[0] : _this17.throwIfMissing('id');
        return yield _this17.getParentIDs(id, true);
      })();
    } // 3-aug-20 PSB doesn't seem to be used anywhere)

    /**
    * Helper method to return all NodeDSL ids parents of given NodeDSL id 
    * @async
    * @param 	{string}	id		- ID of NodeDSL object to query
    * @return 	{Object[]}
    * @deprecated
    */


    getParentIDs2ArrayWXID() {
      var _arguments11 = arguments,
          _this18 = this;

      return _asyncToGenerator(function* () {
        var id = _arguments11.length > 0 && _arguments11[0] !== undefined ? _arguments11[0] : _this18.throwIfMissing('id');
        // this is only used in ti.cfc: def_textonly (just for back-compatibility in case needed);
        // @deprecated 4-ago-2020
        var parents = yield _this18.getParentIDs(id, true);
        return parents.map(x => {
           x.id;
        }); // just return ids as an array of objects
      })();
    }
    /**
    * Helper method to return a tag with key/values as tag attributes
    * @param 	{Object}	struct		- Object with keys and values to transform from.
    * @return 	{string}
    */


    tagParams() {
      var tag = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var selfclose = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var resp = '';
      var x_params = this.struct2params(params);

      if (x_params != '') {
        resp = "<".concat(tag, " ").concat(x_params);
        if (selfclose == true) resp += '/';
        resp += '>';
      } else {
        resp = "<".concat(tag);
        if (selfclose == true) resp += '/';
        resp += '>';
      }

      return resp;
    }

    /**
    * Helper method to transform object keys/values into params for customtags usage
    * @param 	{Object}	struct		- Object with keys and values to transform from.
    * @return 	{string}
    */
    struct2params() {
      var struct = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.throwIfMissing('id');
      var resp = [];

      for (var [key, value] of Object.entries(struct)) {
        if (typeof value !== 'object' && typeof value !== 'function' && typeof value !== 'undefined') {
          resp.push("".concat(key, "='").concat(value, "'"));
        }
      }

      return resp.join(' ');
    }

    cleanIDs4node() {
      var node = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.throwIfMissing('node');
      var copy = node;
      delete copy.id;
      return copy;
    }

  } // private helper methods; not to be exported


  function setObjectKeys(obj, value) {
    var resp = obj;

    if (typeof resp === 'string') {
      resp = {};
      var keys = obj.split(',');

      for (var i in keys) {
        resp[keys[i]] = value;
      }
    } else {
      for (var _i in resp) {
        resp[_i] = value;
      }
    }

    return resp;
  }

  function allTrue(object, keys) {
    //ex. allTrue(matched,'x_icons,x_not_icons');
    var resp = true;

    for (var key of keys.split(',')) {
      if (object[key] !== true) {
        resp = false;
        break;
      }
    }

    return resp;
  } //returns true if num meets the conditions listed on test (false otherwise)


  function numberInCondition(num, command_test) {
    // num is always 'number' type
    var resp = true;

    if (command_test.toString() === num.toString()) ; else if (typeof command_test === 'number') {
      // cases test: 2,5,9,1 (exact matches)
      if (num == command_test) {
        resp = true;
      } else if (num != command_test) {
        resp = false;
      }
    } else if (typeof command_test === 'string') {
      if (command_test.indexOf(',') == -1 && command_test.charAt(0) == '<') {
        // one condition: <2 or <7
        if (num >= parseInt(command_test.replace('<', ''))) {
          resp = false;
        }
      } else if (command_test.indexOf(',') == -1 && command_test.charAt(0) == '>') {
        // one condition: >2 or >7
        if (num <= parseInt(command_test.replace('>', ''))) {
          resp = false;
        }
      } else if (command_test.indexOf(',') == -1 && command_test != num.toString()) {
        resp = false;
      } else {
        // cases test:['2','>2','2,3,5']
        var test2 = command_test.split(',');

        if (command_test.indexOf('<') == -1 && command_test.indexOf('>') == -1 && test2.includes(num)) {
          // exact match;
          resp = true;
        } else if (command_test.indexOf('<') != -1 || command_test.indexOf('>') != -1) {
          // test may be >2,<5,>7
          // 'and/all' (>2,<7)
          for (var i of test2) {
            if (i.charAt(0) == '>') {
              if (num <= parseInt(i.replace('>', ''))) {
                resp = false;
                break;
              }
            } else if (i.charAt(0) == '<') {
              if (num >= parseInt(i.replace('<', ''))) {
                resp = false;
                break;
              }
            }
          }
        }
      }
    } else {
      resp = false;
    }

    return resp;
  }

  function getVal(project, myPath) {
    return myPath.split('.').reduce((res, prop) => res[prop], project);
  }

  function setImmediatePromise() {
    //for preventing freezing node thread within loops (fors)
    return new Promise(resolve => {
      setImmediate(() => resolve());
    });
  } // end: private helper methods

  String.prototype.replaceAll = function (strReplace, strWith) {
    // See http://stackoverflow.com/a/3561711/556609
    var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    var reg = new RegExp(esc, 'ig');
    return this.replace(reg, strWith);
  };

  String.prototype.contains = function (test) {
    if (this.indexOf(test) != -1) {
      return true;
    } else {
      return false;
    }
  };

  function internal_commands (_x) {
    return _ref.apply(this, arguments);
  }

  function _ref() {
    _ref = _asyncToGenerator(function* (context) {
      // context.x_state; shareable var scope contents between commands and methods.
      var null_template = {
        hint: 'Allowed node type that must be ommited',
        func: function () {
          var _func = _asyncToGenerator(function* (node, state) {
            return context.reply_template({
              hasChildren: false,
              state
            });
          });

          function func(_x2, _x3) {
            return _func.apply(this, arguments);
          }

          return func;
        }()
      };

      var getTranslatedTextVar = function getTranslatedTextVar(text) {
        var vars = context.dsl_parser.findVariables({
          text,
          symbol: "**",
          symbol_closing: "**"
        });
        var new_vars = context.dsl_parser.replaceVarsSymbol({
          text,
          from: {
            open: "**",
            close: "**"
          },
          to: {
            open: '${',
            close: '}'
          }
        });

        if ('${' + vars + '}' == new_vars) {
          return vars;
        } else {
          return "`".concat(new_vars, "`");
        }
      }; // process our own attributes_aliases to normalize node attributes
      /*
      //special node names you can define:
      'not_found': {
      	//executed when no there was no matching command for a node.
      	func: async function(node) {
      		return me.reply_template();
      	}
      }
       full node example:
      'def_otro': {
      	x_priority: 'lowest,last,highest,first',
      	x_icons: 'cancel,desktop_new,idea,..',
      	x_not_icons: '',
      	x_not_empty: 'attribute[name]',
      	x_not_text_contains: '',
      	x_empty: '',
      	x_text_exact: '',
      	x_text_contains: '',
      	x_level: '2,>2,<5,..',
      	x_all_hasparent: 'def_padre_otro',
      	x_or_hasparent: '',
      	x_or_isparent: '',
      	x_not_hasparent: '', //@TODO create this meta_attribute in Concepto
      	hint: 'Testing node',
      	autocomplete: {
      		text: 'otro', //activate autocomplete if the node text equals to this
      		icon: 'idea', //activate autocomplete if the node has this icon
      		
      		attributes: {
      			'from': {
      				type: 'int',
      				description: 'If defined, sets the start offset for the node. (example)'
      			}
      		}
      	},
      	func: async function(node,state) {
      		let resp = context.reply_template({ state });
      		return resp;
      	}
      }
      */


      return {
        //'cancel': {...null_template,...{ x_icons:'button_cancel'} },
        'def_config': _objectSpread2(_objectSpread2({}, null_template), {
          x_icons: 'desktop_new',
          x_level: '2',
          x_text_contains: 'config'
        }),
        'def_modelos': _objectSpread2(_objectSpread2({}, null_template), {
          x_icons: 'desktop_new',
          x_level: '2',
          x_text_contains: 'modelos'
        }),
        'def_assets': _objectSpread2(_objectSpread2({}, null_template), {
          x_icons: 'desktop_new',
          x_level: '2',
          x_text_contains: 'assets'
        }),
        // ********************
        //  Express Methods
        // ********************
        // *************
        // 	 VARIABLES
        // *************
        'def_variables': {
          x_icons: 'xmag',
          x_level: 3,
          x_text_contains: 'variables',
          hint: 'Definicion local de variables observadas',
          func: function () {
            var _func2 = _asyncToGenerator(function* (node, state) {
              var resp = context.reply_template({
                state
              });
              // set vars

              if (typeof state.current_page !== 'undefined') {
                if (typeof context.x_state.pages[state.current_page] === 'undefined') context.x_state.pages[state.current_page] = {};
                if ('variables' in context.x_state.pages[state.current_page] === false) context.x_state.pages[state.current_page].variables = {};
                if ('types' in context.x_state.pages[state.current_page] === false) context.x_state.pages[state.current_page].types = {};
              }

              return resp;
            });

            function func(_x4, _x5) {
              return _func2.apply(this, arguments);
            }

            return func;
          }()
        },
        'def_variables_field': {
          x_priority: 1,
          x_empty: 'icons',
          x_level: '>3',
          x_all_hasparent: 'def_variables',
          hint: 'Campo con nombre de variable observada y tipo',
          func: function () {
            var _func3 = _asyncToGenerator(function* (node, state) {
              var resp = context.reply_template({
                state
              });
              var params = {},
                  tmp = {
                type: 'string',
                field: node.text.trim(),
                level: node.level - 3
              }; //

              if (tmp.field.contains('[') && tmp.field.contains(']') || tmp.field.contains('{') && tmp.field.contains('}')) {
                // this is a script node
                tmp.type = 'script';
                tmp.field = "script".concat(node.id);
              } else if (tmp.field.contains(':')) {
                tmp.type = tmp.field.split(':').pop().toLowerCase().trim(); //listlast

                tmp.field = tmp.field.split(':')[0].trim();
              } else if (node.nodes_raw && node.nodes_raw.length > 0) {
                // get children nodes, and test that they don't have a help icon.
                var subnodes = yield node.getNodes();
                var has_event = false;

                for (var i of subnodes) {
                  if (i.icons.includes('help')) {
                    has_event = true;
                  }
                }

                if (has_event == false) {
                  tmp.type = 'object';
                }
              } else {
                tmp.type = 'string';
              } // process attributes (and overwrite types if needed)


              Object.keys(node.attributes).map(function (keym) {
                var keytest = keym.toLowerCase().trim();
                var value = node.attributes[keym]; //console.log(`${tmp.field} attr key:${keytest}, value:${value}`);

                if ('type,tipo,:type,:tipo'.split(',').includes(keytest)) {
                  tmp.type = value.toLowerCase().trim();
                } else if ('valor,value,:valor,:value'.split(',').includes(keytest)) {
                  var t_value = value.replaceAll('$variables', 'this.').replaceAll('$vars.', 'this.').replaceAll('$params.', 'this.').replaceAll('$config.', 'process.env.').replaceAll('$store.', 'this.$store.state.');
                  if (t_value.toLowerCase().trim() == '{now}') t_value = 'new Date()';

                  if (t_value.contains('assets:')) {
                    t_value = context.getAsset(t_value, 'js');
                  }

                  params.value = t_value;
                } else {
                  if (keytest.contains(':')) {
                    params[keym.trim()] = value.trim();
                  }
                }
              }); // assign default value for type, if not defined

              if ('string,text,texto'.split(',').includes(tmp.type)) {
                if ('value' in params === false) {
                  params.value = '';
                } else {
                  params.value = params.value.toString();
                }
              } else if ('script' == tmp.type) {
                params.value = node.text.trim().replaceAll('&#xa;', '').replaceAll('&apos;', '"').replaceAll('&#xf1;', 'ñ');

                if (params.value.charAt(0) != '[') {
                  params.value = '[' + params.value + ']';
                }

                var convertjs = require('safe-eval');

                try {
                  params.value = convertjs(params.value);
                } catch (cjerr) {
                  params.value = [{
                    error_in_script_var: cjerr
                  }];
                } //params.value = JSON.parse('['+params.value+']');

              } else if ('int,numeric,number,numero'.split(',').includes(tmp.type)) {
                if ('value' in params === false) {
                  params.value = 0;
                } else {
                  params.value = parseInt(params.value);
                }
              } else if ('float,real,decimal'.split(',').includes(tmp.type)) {
                if ('value' in params === false) {
                  params.value = 0.0;
                } else {
                  params.value = parseFloat(params.value);
                }
              } else if ('boolean,boleano,booleano'.split(',').includes(tmp.type)) {
                if ('value' in params === false) {
                  if (tmp.field == 'true') {
                    // ex value of an array (true/false)
                    params.value = true;
                  } else if (tmp.field == 'false') {
                    params.value = false;
                  } else {
                    params.value = false;
                  }
                } else {
                  if (params.value == 'true') {
                    // ex value of an array (true/false)
                    params.value = true;
                  } else if (params.value == 'false') {
                    params.value = false;
                  }
                }
              } else if ('array'.split(',').includes(tmp.type)) {
                tmp.type = 'array';

                if ('value' in params === false) {
                  params.value = [];
                } else {
                  params.value = JSON.parse(params.value);
                }
              } else if ('struct,object'.split(',').includes(tmp.type)) {
                tmp.type = 'object';

                if ('value' in params === false) {
                  params.value = {};
                } else {
                  params.value = JSON.parse(params.value);
                }
              } // check and prepare global state


              if (typeof state.current_page !== 'undefined') {
                if (state.current_page in context.x_state.pages === false) context.x_state.pages[state.current_page] = {};
                if ('variables' in context.x_state.pages[state.current_page] === false) context.x_state.pages[state.current_page].variables = {};
                if ('var_types' in context.x_state.pages[state.current_page] === false) context.x_state.pages[state.current_page].var_types = {};
              } // assign var info to page state


              if (tmp.level == 1) {
                // this is a single variable (no dad); eq. variables[field] = value/children
                context.x_state.pages[state.current_page].var_types[tmp.field] = tmp.type;
                context.x_state.pages[state.current_page].variables[tmp.field] = params.value;
                resp.state.vars_path = [tmp.field];
                resp.state.vars_types = [tmp.type];
                resp.state.vars_last_level = tmp.level;
              } else {
                // variables[prev_node_text][current_field] = value
                if (resp.state.vars_last_level == tmp.level) {
                  // this node is a brother of the last processed one
                  resp.state.vars_path.pop(); // remove last field from var path

                  resp.state.vars_types.pop(); // remove last field type from vars_types
                }

                resp.state.vars_path.push(tmp.field); // push new var to paths
                //console.log(`trying to set: ${resp.state.vars_path.join('.')} on context.x_state.pages['${state.current_page}'].variables as ${tmp.type}`);

                if (resp.state.vars_types[resp.state.vars_types.length - 1] == 'object') {
                  // dad was an object
                  //console.log('dad was an object',resp.state.vars_types[resp.state.vars_types.length-1]);
                  setToValue(context.x_state.pages[state.current_page].variables, params.value, resp.state.vars_path.join('.'));
                } else if (resp.state.vars_types[resp.state.vars_types.length - 1] == 'array') {
                  //console.log('dad was an array',resp.state.vars_types[resp.state.vars_types.length-1]);
                  // dad is an array.. 
                  var copy_dad = [...resp.state.vars_path];
                  copy_dad.pop(); //console.log('my dad path is '+copy_dad.join('.'));

                  var daddy = getVal$1(context.x_state.pages[state.current_page].variables, copy_dad.join('.')); //console.log('daddy says:',daddy);

                  if (tmp.type == 'script') {
                    // if we are a script node, just push our values, and not ourselfs.
                    params.value.map(i => {
                      daddy.push(i);
                    });
                  } else if (tmp.field != params.value) {
                    // push as object (array of objects)
                    var tmpi = {};
                    tmpi[tmp.field] = params.value;
                    daddy.push(tmpi);
                  } else {
                    // push just the value (single value)
                    daddy.push(params.value);
                  } // re-set daddy with new value


                  setToValue(context.x_state.pages[state.current_page].variables, daddy, copy_dad.join('.'));
                }

                resp.state.vars_types.push(tmp.type); // push new var type to vars_types

                context.x_state.pages[state.current_page].var_types[resp.state.vars_path.join('.')] = tmp.type;
                resp.state.vars_last_level = tmp.level;
              }

              return resp;
            });

            function func(_x6, _x7) {
              return _func3.apply(this, arguments);
            }

            return func;
          }()
        },
        // *************************
        //  Scriptable definitions
        // *************************
        //..scripts..
        'def_responder': {
          x_icons: 'desktop_new',
          x_text_contains: 'responder',
          x_not_text_contains: 'traducir,struct,extender',
          x_all_hasparent: 'def_variables',
          x_level: '>3',
          hint: 'Emite una respuesta para la variable de tipo funcion',
          func: function () {
            var _func4 = _asyncToGenerator(function* (node, state) {
              var resp = context.reply_template({
                state
              });
              if (node.text_note != '') resp.open = "//".concat(node.text_note, "\n");
              var text = context.dsl_parser.findVariables({
                text: node.text,
                symbol: "\"",
                symbol_closing: "\""
              }); // tests return types

              if (text.contains('**') && node.icons.includes('bell')) {
                var new_vars = getTranslatedTextVar(text);
                resp.open += "return ".concat(new_vars, ";\n");
              } else if (text.contains('$')) {
                text = text.replaceAll('$params', 'this.').replaceAll('$variables', 'this.');
                resp.open += "return ".concat(text, ";\n");
              } else if (text.contains('assets:')) {
                text = context.getAsset(text, 'js');
                resp.open += "return ".concat(text, ";\n");
              } else if (text == '') {
                resp.open += "return '';\n";
              } else if (text.charAt(0) == '(' && text.slice(-1) == ')') {
                text = text.slice(1).slice(0, -1);
                resp.open += "return ".concat(text, ";\n");
              } else {
                if (context.x_state.central_config.idiomas && context.x_state.central_config.idiomas.contains(',')) ; else {
                  resp.open += "return '".concat(text, "';\n");
                }
              }

              return resp;
            });

            function func(_x8, _x9) {
              return _func4.apply(this, arguments);
            }

            return func;
          }()
        },
        'def_struct': {
          x_icons: 'desktop_new',
          x_text_contains: 'struct',
          x_not_text_contains: 'traducir',
          x_level: '>3',
          hint: 'Crea una variable de tipo Objeto, con los campos y valores definidos en sus atributos.',
          func: function () {
            var _func5 = _asyncToGenerator(function* (node, state) {
              var resp = context.reply_template({
                state
              });
              var tmp = {};

              if (node.text.contains(',')) {
                // parse output var
                tmp.var = node.text.split(',').pop(); //last comma element

                if (context.hasParentID(node.id, 'def_event_server')) {
                  tmp.var = tmp.var.replaceAll('$variables.', 'resp.').replaceAll('$vars.', 'resp.').replaceAll('$params.', 'resp.');
                  tmp.var = tmp.var == 'resp.' ? 'resp' : tmp.var;
                  tmp.parent_server = true;
                } else {
                  tmp.var = tmp.var.replaceAll('$variables.', 'this.').replaceAll('store.', 'this.$store.state.');
                  tmp.var = tmp.var == 'this.' ? 'this' : tmp.var;
                } // process attributes


                var attrs = _objectSpread2({}, node.attributes);

                Object.keys(node.attributes).map(function (key) {
                  var keytest = key.toLowerCase().trim();
                  var value = node.attributes[key].trim();

                  if (node.icons.includes('bell')) {
                    value = getTranslatedTextVar(value);
                  } else if (value.contains('assets:')) {
                    value = context.getAsset(value, 'jsfunc');
                  } else {
                    // normalize vue type vars
                    if (tmp.parent_server) {
                      value = value.replaceAll('$variables.', 'resp.').replaceAll('$vars.', 'resp.').replaceAll('$params.', 'resp.');
                    } else {
                      value = value.replaceAll('$variables.', 'this.').replaceAll('$vars.', 'this.').replaceAll('$params.', 'this.').replaceAll('$store.', 'this.$store.state.');
                    }
                  } // modify values to copy


                  attrs[key] = value;
                }); // write output

                if (node.text_note != '') resp.open = "// ".concat(node.text_note, "\n");
                resp.open += "var ".concat(tmp.var.trim(), " = ").concat(JSON.stringify(attrs), ";\n");
              } else {
                resp.valid = false;
              }

              return resp;
            });

            function func(_x10, _x11) {
              return _func5.apply(this, arguments);
            }

            return func;
          }()
        } //*def_responder (@todo i18n)
        //def_insertar_modelo
        //def_consultar_modelo
        //def_modificar_modelo
        //def_eliminar_modelo
        //def_consultar_web
        //def_consultar_web_upload
        //def_consultar_web_download
        //def_aftertime
        //*def_struct
        //def_extender
        //def_npm_instalar
        //def_agregar_campos
        //def_preguntar
        //def_array_transformar
        //def_procesar_imagen
        //def_imagen_exif
        //def_var_clonar
        //def_modificar
        //def_probar
        //def_event_try (def_probar_try)
        //def_literal_js
        //def_guardar_nota
        //def_console
        //def_xcada_registro
        //def_crear_id_unico
        //def_enviarpantalla
        // OTHER node types

        /*'def_imagen': {
        	x_icons:'idea',
        	x_not_icons:'button_cancel,desktop_new,help',
        	x_not_empty:'attributes[:src]',
        	x_empty:'',
        	x_level:'>2',
        	func:async function(node,state) {
        		return context.reply_template({ otro:'Pablo', state });
        	}
        },*/
        //

      };
    });
    return _ref.apply(this, arguments);
  }

  function setToValue(obj, value, path) {
    var i;
    path = path.split('.');

    for (i = 0; i < path.length - 1; i++) {
      obj = obj[path[i]];
    }

    obj[path[i]] = value;
  }

  function getVal$1(project, myPath) {
    return myPath.split('.').reduce((res, prop) => res[prop], project);
  }

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
        // define and assign commands
        yield _this.addCommands(internal_commands);

        _this.x_console.outT({
          message: "".concat(Object.keys(_this.x_commands).length, " local x_commands loaded!"),
          color: "green"
        }); //this.debug('x_commands',this.x_commands);


        _this.x_crypto_key = require('crypto').randomBytes(32); // for hash helper method
        // init vue
        // set x_state defaults

        _this.x_state = {
          plugins: {},
          npm: {},
          dev_npm: {},
          envs: {},
          funciones: {},
          proxies: {},
          pages: {},
          current_func: '',
          current_folder: '',
          current_proxy: '',
          strings_i18n: {},
          stores_types: {
            versions: {},
            expires: {}
          }
        };
        _this.x_state.config_node = yield _this._readConfig(); //this.debug('config_node',this.x_state.config_node);

        _this.x_state.central_config = yield _this._readCentralConfig(); //this.debug('central_config',this.x_state.central_config);

        _this.x_state.assets = yield _this._readAssets(); //this.debug('assets_node',this.x_state.assets);

        if (_this.x_state.central_config.componente) {
          _this.x_state.dirs = yield _this._appFolders({
            'components': '',
            'pages': '',
            'assets': 'assets/',
            'static': 'static/',
            'umd': 'umd/'
          });
        } else {
          _this.x_state.dirs = yield _this._appFolders({
            'client': 'client/',
            'layouts': 'client/layouts/',
            'components': 'client/components/',
            'pages': 'client/pages/',
            'plugins': 'client/plugins/',
            'static': 'client/static/',
            'middleware': 'client/middleware/',
            'server': 'client/server/',
            'assets': 'client/assets/',
            'css': 'client/assets/css/',
            'store': 'client/store/',
            'lang': 'client/lang/'
          });
        } // read modelos node (virtual DB)


        _this.x_state.models = yield _this._readModelos(); //alias: database tables
        //is local server running? if so, don't re-launch it

        _this.x_state.nuxt_is_running = yield _this._isLocalServerRunning();

        _this.debug('is Server Running: ' + _this.x_state.nuxt_is_running); // init terminal diagnostics (not needed here)
        // copy sub-directories if defined in node 'config.copiar' key


        if (_this.x_state.config_node.copiar) {
          var path = require('path'),
              basepath = path.dirname(path.resolve(_this.x_flags.dsl));

          var copy = require('recursive-copy');

          _this.x_console.outT({
            message: "copying config:copiar directories to 'static' target folder",
            color: "yellow"
          });

          yield Object.keys(_this.x_state.config_node.copiar).map( /*#__PURE__*/function () {
            var _ref = _asyncToGenerator(function* (key) {
              var abs = path.join(basepath, key);

              try {
                yield copy(abs, this.x_state.dirs.static);
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
        // NUXT:ICON


        if (_this.x_state.config_node['nuxt:icon']) {
          // add @nuxtjs/pwa module to app
          _this.x_state.npm['@nuxtjs/pwa'] = '*'; // copy icon to static dir

          var _path = require('path'),
              _basepath = _path.dirname(_path.resolve(_this.x_flags.dsl));

          var source = _path.join(_basepath, _this.x_state.config_node['nuxt:icon']);

          var target = _this.x_state.dirs.static + 'icon.png';

          _this.debug({
            message: "NUXT ICON dump (copy icon)",
            color: "yellow",
            data: source
          });

          var fs = require('fs').promises;

          try {
            yield fs.copyFile(source, target);
          } catch (err_fs) {
            _this.x_console.outT({
              message: "error: copying NUXT icon",
              data: err_fs
            });
          }
        } // GOOGLE:ADSENSE


        if (_this.x_state.config_node['google:adsense']) {
          _this.x_state.npm['vue-google-adsense'] = '*';
          _this.x_state.npm['vue-script2'] = '*';
        } // GOOGLE:ANALYTICS


        if (_this.x_state.config_node['google:analytics']) {
          _this.x_state.npm['@nuxtjs/google-gtag'] = '*';
        } // DEFAULT NPM MODULES & PLUGINS if dsl is not 'componente' type


        if (!_this.x_state.central_config.componente) {
          _this.x_console.outT({
            message: "vue initialized() ->"
          });

          _this.x_state.plugins['vue-moment'] = {
            global: true,
            npm: {
              'vue-moment': '*'
            },
            extra_imports: ['moment'],
            requires: ['moment/locale/es'],
            config: '{ moment }'
          }; // axios

          _this.x_state.npm['@nuxtjs/axios'] = '*';

          if (_this.x_state.central_config.nuxt == 'latest') {
            _this.x_state.npm['nuxt'] = '*';
          } else {
            _this.x_state.npm['nuxt'] = '2.11.0'; // default for compatibility issues with existing dsl maps	
          } // express things


          _this.x_state.npm['express'] = '*';
          _this.x_state.npm['serverless-http'] = '*';
          _this.x_state.npm['serverless-apigw-binary'] = '*';
          _this.x_state.npm['underscore'] = '*'; // dev tools

          _this.x_state.dev_npm['serverless-prune-plugin'] = '*';
          _this.x_state.dev_npm['serverless-offline'] = '*';
          _this.x_state.dev_npm['vue-beautify-loader'] = '*'; //

          if (_this.x_state.central_config.dominio) {
            _this.x_state.dev_npm['serverless-domain-manager'] = '*';
          }
        } else {
          // If DSL mode 'component(e)' @TODO this needs a revision (converting directly from CFC)
          _this.x_console.outT({
            message: "vue initialized() -> as component/plugin"
          });

          _this.x_state.npm['global'] = '^4.4.0';
          _this.x_state.npm['poi'] = '9';
          _this.x_state.npm['underscore'] = '*';
          _this.x_state.dev_npm['@vue/test-utils'] = '^1.0.0-beta.12';
          _this.x_state.dev_npm['babel-core'] = '^6.26.0';
          _this.x_state.dev_npm['babel-preset-env'] = '^1.6.1';
          _this.x_state.dev_npm['jest'] = '^22.4.0';
          _this.x_state.dev_npm['jest-serializer-vue'] = '^0.3.0';
          _this.x_state.dev_npm['vue'] = '*';
          _this.x_state.dev_npm['vue-jest'] = '*';
          _this.x_state.dev_npm['vue-server-renderer'] = '*';
          _this.x_state.dev_npm['vue-template-compiler'] = '*';
        } // serialize 'secret' config keys as json files in app secrets sub-directory (if any)
        // extract 'secret's from config keys; this is not needed in VUE DSL, but in EB DSL
        // commented for future reference

        /*
        this.x_state.secrets={}; //await _extractSecrets(config_node)
        for (let key in this.x_state.config_node) {
        	if (this.x_state.config_node[key][':secret']) {
        		let new_obj = {...this.x_state.config_node[key]};
        		delete new_obj[':secret']
        		if (new_obj[':link']) delete new_obj[':link']
        		// set object keys to uppercase
        		this.x_state.secrets[key]={};
        		let obj_keys = Object.keys(new_obj);
        		obj_keys.map(function(x) {
        			this.x_state.secrets[key][x.toUpperCase()] = new_obj[x];
        		}.bind(this));
        	}
        }*/
        // set config keys as ENV accesible variables (ex. $config.childnode.attributename)


        var _loop = function _loop(key) {
          // omit special config 'reserved' node keys
          if (['aurora', 'vpc', 'aws'].includes(key) && typeof _this.x_state.config_node[key] === 'object') {
            Object.keys(_this.x_state.config_node[key]).map(function (attr) {
              this.x_state.envs["config.".concat(key, ".").concat(attr)] = "process.env.".concat((key + '_' + attr).toUpperCase());
            }.bind(_this));
          }
        };

        for (var key in _this.x_state.config_node) {
          _loop(key);
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
      var _this3 = this;

      return _asyncToGenerator(function* () {
        var resp = node.text; // @idea we could use some 'slug' method here

        resp = resp.replace(/\ /g, '_') + '.vue';

        if (node.icons.includes('gohome')) {
          if (_this3.x_state.central_config.componente == true && _this3.x_state.central_config.service_name) {
            resp = _this3.x_state.central_config.service_name + '.vue';
          } else {
            resp = 'index.vue';
          }
        } else if (node.icons.includes('desktop_new')) {
          if (node.text.indexOf('assets') != -1) {
            resp = 'internal_assets.omit';
          } else if (node.text.indexOf('store') != -1) {
            resp = 'internal_stores.omit';
          } else if (node.text.indexOf('proxy') != -1 || node.text.indexOf('proxies') != -1) {
            resp = 'internal_middleware.omit';
          } else if (node.text.indexOf('config') != -1) {
            resp = 'config.omit';
          } else if (node.text.indexOf('modelos') != -1) {
            resp = 'modelos.omit';
          } else if (['servidor', 'server', 'api'].includes(node.text)) {
            resp = 'server.omit';
          }
        } else if (node.text.indexOf('componente:') != -1) {
          resp = node.text.split(':')[node.text.split(':').length - 1] + '.vue';
        } else if (node.text.indexOf('layout:') != -1) {
          resp = node.text.split(':')[node.text.split(':').length - 1] + '.vue';
        }

        return resp;
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
      var _this4 = this;

      return _asyncToGenerator(function* () {
        if (!_this4.x_state.central_config.componente && _this4.x_state.central_config.deploy && _this4.x_state.central_config.deploy.indexOf('eb:') != -1) {
          // if deploying to AWS eb:x, then recover/backup AWS credentials from local system
          var ini = require('ini'),
              path = require('path'),
              fs = require('fs').promises; // read existing AWS credentials if they exist


          var os = require('os');

          var aws_ini = '';
          var aws_ini_file = path.join(os.homedir(), '/.aws/') + 'credentials';

          try {
            //this.debug('trying to read AWS credentials:',aws_ini_file);
            aws_ini = yield fs.readFile(aws_ini_file, 'utf-8'); //this.debug('AWS credentials:',aws_ini);
          } catch (err_reading) {} // 


          if (_this4.x_state.config_node.aws) {
            // if DSL defines temporal AWS credentials for this app .. 
            // create backup of aws credentials, if existing previously
            if (aws_ini != '') {
              var basepath = path.dirname(path.resolve(_this4.x_flags.dsl));
              var aws_bak = path.join(basepath, 'aws_backup.ini');

              _this4.x_console.outT({
                message: "config:aws:creating .aws/credentials backup",
                color: 'yellow'
              });

              yield fs.writeFile(aws_bak, aws_ini, 'utf-8');
            } // debug


            _this4.x_console.outT({
              message: "config:aws:access ->".concat(_this4.x_state.config_node.aws.access)
            });

            _this4.x_console.outT({
              message: "config:aws:secret ->".concat(_this4.x_state.config_node.aws.secret)
            }); // transform config_node.aws keys into ini


            var to_ini = ini.stringify({
              aws_access_key_id: _this4.x_state.config_node.aws.access,
              aws_secret_access_key: _this4.x_state.config_node.aws.secret
            }, {
              section: 'default'
            });

            _this4.debug('Setting .aws/credentials from config node'); // save as .aws/credentials (ini file)


            yield fs.writeFile(aws_ini_file, to_ini, 'utf-8');
          } else if (aws_ini != '') {
            // if DSL doesnt define AWS credentials, use the ones defined within the local system.
            var parsed = ini.parse(aws_ini);
            if (parsed.default) _this4.debug('Using local system AWS credentials', parsed.default);
            _this4.x_state.config_node.aws = {
              access: '',
              secret: ''
            };
            if (parsed.default.aws_access_key_id) _this4.x_state.config_node.aws.access = parsed.default.aws_access_key_id;
            if (parsed.default.aws_secret_access_key) _this4.x_state.config_node.aws.secret = parsed.default.aws_secret_access_key;
          }
        }
      })();
    } //Executed when compiler founds an error processing nodes.


    onErrors(errors) {
      return _asyncToGenerator(function* () {})();
    } //Transforms the processed nodes into files.


    onCreateFiles(processedNodes) {
      var _this5 = this;

      return _asyncToGenerator(function* () {
        _this5.x_console.out({
          message: 'onCreateFiles',
          data: processedNodes
        }); //this.x_console.out({ message:'pages state', data:this.x_state.pages });

      })();
    } // ************************
    // INTERNAL HELPER METHODS 
    // ************************

    /*
    * Returns true if a local server is running on the DSL defined port
    */


    _isLocalServerRunning() {
      var _this6 = this;

      return _asyncToGenerator(function* () {
        var is_reachable = require('is-port-reachable');

        var resp = yield is_reachable(_this6.x_state.central_config.port);
        return resp;
      })();
    }
    /*
    * Reads the node called modelos and creates tables definitions and managing code (alias:database).
    */


    _readModelos() {
      var _this7 = this;

      return _asyncToGenerator(function* () {
        // @IDEA this method could return the insert/update/delete/select 'function code generators'
        _this7.debug('_readModelos');

        _this7.debug_time({
          id: 'readModelos'
        });

        var modelos = yield _this7.dsl_parser.getNodes({
          text: 'modelos',
          level: 2,
          icon: 'desktop_new',
          recurse: true
        }); //nodes_raw:true	

        var tmp = {
          appname: _this7.x_state.config_node.name
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
        }); // parse nodes into tables with fields

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

            resp.tables[table.text].sql = "CREATE TABLE ".concat(table.text, "(").concat(tmp.sql_fields.join(','), ")");
          }
        }

        _this7.debug_timeEnd({
          id: 'readModelos'
        }); // install alaSQL plugin and define tables


        if (resp.length > 0) {
          // get tables sql create
          var ala_create = [];

          for (var _table in resp.tables) {
            ala_create.push("alasqlJs('".concat(resp.tables[_table].sql, "');"));
          } // set custom install code


          var ala_custom = "const alasql = {\n\t\t\t\tinstall (v) {\n\t\t\t\t\t// create tables from models\n\t\t\t\t\t".concat(ala_create.join('\n'), "\n\t\t\t\t\tVue.prototype.alasql = alasqlJs;\n\t\t\t\t}\n\t\t\t}"); // set plugin info in state

          _this7.x_state.plugins['../../node_modules/alasql/dist/alasql.min.js'] = {
            global: true,
            npm: {
              alasql: '*'
            },
            var: 'alasqlJs',
            mode: 'client',
            customvar: 'alasql',
            custom: ala_custom
          };
        } // return 


        return resp;
      })();
    }
    /*
    * Reads assets node, and returns object with info
    */


    _readAssets() {
      var _this8 = this;

      return _asyncToGenerator(function* () {
        var resp = {},
            path = require('path');

        _this8.debug('_readAssets');

        _this8.debug_time({
          id: '_readAssets'
        });

        var assets = yield _this8.dsl_parser.getNodes({
          text: 'assets',
          level: 2,
          icon: 'desktop_new',
          recurse: true
        }); //nodes_raw:true

        var sep = path.sep; //
        //this.debug('assets search',assets);

        if (assets.length > 0) {
          assets = assets[0]; // 15ms full

          for (var child of assets.nodes) {
            if (child.nodes.length == 1 && child.nodes[0].image != '') {
              // if there is just 1 grand-child and has an image defined
              resp[child.text.toLowerCase()] = {
                i18n: false,
                original: child.nodes[0].image,
                css: '~assets' + sep + path.basename(child.nodes[0].image),
                js: '~' + sep + 'assets' + sep + path.basename(child.nodes[0].image)
              };
            } else if (child.nodes.length > 1) {
              // if child has more than 1 child (grandchild), we'll assume its an image with i18n alternatives
              var key = child.text.toLowerCase();
              resp[key] = {
                i18n: true,
                i18n_keys: []
              };

              for (var i18n_node of child.nodes) {
                // expand node attributes
                var attrs = _objectSpread2({}, i18n_node.attributes);
                /*i18n_node.attributes.map(function(x) {
                	attrs = {...attrs,...x};
                });*/


                if (attrs.idioma && i18n_node.image != '') {
                  var lang = attrs.idioma.toLowerCase();
                  resp[key].i18n_keys.push(lang);
                  resp[key][lang] = {
                    original: i18n_node.image,
                    css: '~assets' + sep + path.basename(i18n_node.image),
                    js: '~' + sep + 'assets' + sep + path.basename(i18n_node.image)
                  };
                }
              } // transform i18n_keys to list


              resp[key].i18n_keys = resp[key].i18n_keys.join(',');
            } else if (child.link != '') {
              resp[child.text.toLowerCase()] = {
                original: child.link,
                css: '~assets' + sep + path.basename(child.link),
                js: '~' + sep + 'assets' + sep + path.basename(child.link)
              };
            } //console.log('child of asset '+assets.text,child);

          } // 12ms full

          /*let children = await assets.getNodes();
          for (let child of children) {
          	console.log('child of asset '+assets.text,children);
          }*/

        }

        _this8.debug_timeEnd({
          id: '_readAssets'
        });

        return resp;
      })();
    }
    /* 
    * Grabs central node configuration information
    */


    _readCentralConfig() {
      var _this9 = this;

      return _asyncToGenerator(function* () {
        _this9.debug('_readCentralConfig');

        var central = yield _this9.dsl_parser.getNodes({
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
          deploy: false,
          static: false,
          timeout: 30,
          modelos: 'aurora',
          componente: false,
          'keep-alive': true,
          'keep-warm': true,
          port: 3000,
          git: true,
          nuxt: '2.11.0',
          idiomas: 'es',
          ':cache': _this9.x_config.cache,
          ':mode': 'spa',
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

        resp = _objectSpread2(_objectSpread2({}, resp), central[0].attributes);
        /*central[0].attributes.map(function(x) {
        	resp = {...resp,...x};
        });*/

        if (resp.dominio) {
          resp.service_name = resp.dominio.replace(/\./g, '').toLowerCase();
        } else {
          resp.service_name = resp.apptitle;
        }

        if (!resp[':cache']) _this9.x_config.cache = false; // disables cache when processing nodes (@todo)
        // return

        return resp;
      })();
    }
    /*
    * Grabs the configuration from node named 'config'
    */


    _readConfig() {
      var _this10 = this;

      return _asyncToGenerator(function* () {
        _this10.debug('_readConfig');

        var resp = {
          id: '',
          meta: [],
          seo: {},
          secrets: {}
        },
            config_node = {};
        var search = yield _this10.dsl_parser.getNodes({
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
            if (key.text.toLowerCase() == 'meta') {
              for (var meta_child of key.nodes) {
                // apply grand_childs as meta tags
                if (meta_child.text.toLowerCase() == 'keywords') {
                  resp.seo['keywords'] = meta_child.nodes.map(x => x.text);
                  resp.meta.push({
                    hid: _this10.hash(meta_child.nodes[0].text),
                    name: 'keywords',
                    content: resp.seo['keywords'].join(',')
                  });
                } else if (meta_child.text.toLowerCase() == 'language') {
                  resp.seo['language'] = meta_child.nodes[0].text;
                  resp.meta.push({
                    hid: _this10.hash(meta_child.nodes[0].text),
                    lang: meta_child.nodes[0].text
                  });
                } else if (meta_child.text.toLowerCase() == 'charset') {
                  resp.seo['charset'] = meta_child.nodes[0].text;
                  resp.meta.push({
                    charset: meta_child.nodes[0].text
                  });
                } else {
                  resp.seo['charset'] = meta_child.nodes[0].text;

                  if (meta_child.text.indexOf(':') != -1) {
                    resp.meta.push({
                      property: meta_child.text,
                      vmid: meta_child.text,
                      content: meta_child.nodes[0].text
                    });
                  } else {
                    resp.meta.push({
                      hid: _this10.hash(meta_child.nodes[0].text),
                      name: meta_child.text,
                      content: meta_child.nodes[0].text
                    });
                  }
                } //

              }
            } else {
              // apply keys as config keys (standard config node by content types)
              if (Object.keys(key.attributes).length > 0) {
                // prepare config key
                var config_key = key.text.toLowerCase().replace(/ /g, '');

                var values = _objectSpread2({}, key.attributes);
                /*key.attributes.map(function(x) {
                	values = {...values,...x};
                });*/


                resp[config_key] = values; // mark secret status true if contains 'password' icon

                if (key.icons.includes('password')) resp[config_key][':secret'] = true; // add link attribute if defined

                if (key.link != '') resp[config_key][':link'] = key.link;
              } else if (key.nodes.length > 0) {
                resp[key.text] = key.nodes[0].text;
              } else if (key.link != '') {
                resp[key.text] = key.link;
              } //

            }
          }
        } // assign dsl file folder name+filename if node.name is not given


        if (!resp.name) {
          var path = require('path');

          var dsl_folder = path.dirname(path.resolve(_this10.x_flags.dsl));
          var parent_folder = path.resolve(dsl_folder, '../');
          var folder = dsl_folder.replace(parent_folder, '');
          resp.name = folder.replace('/', '').replace('\\', '') + '_' + path.basename(_this10.x_flags.dsl, '.dsl'); //console.log('folder:',{folder,name:resp.name});
          //this.x_flags.dsl
        } // create id if not given


        if (!resp.id) resp.id = 'com.puntorigen.' + resp.name;
        return resp;
      })();
    }

    getParentNodes() {
      var _arguments = arguments,
          _this11 = this;

      return _asyncToGenerator(function* () {
        var id = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : _this11.throwIfMissing('id');
        var exec = _arguments.length > 1 && _arguments[1] !== undefined ? _arguments[1] : false;
        var parents = yield _this11.dsl_parser.getParentNodesIDs({
          id,
          array: true
        });
        var resp = [];

        for (var parent_id of parents) {
          var node = yield _this11.dsl_parser.getNode({
            id: parent_id,
            recurse: false
          });
          var command = yield _this11.findValidCommand({
            node,
            object: exec
          });
          if (command) resp.push(command);
        }

        return resp;
      })();
    } //gets the asset code for a given string like: assets:assetname


    getAsset() {
      var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.throwIfMissing('text');
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'js';
      //this.x_state.assets
      var resp = text,
          type_o = text.replaceAll('jsfunc', 'js').toLowerCase();

      if (resp.toLowerCase().indexOf('assets:') != -1) {
        if (resp in this.x_state.assets) {
          if (this.x_state.central_config.idiomas.indexOf(',') != -1 && this.x_state.assets[resp].i18n == true) {
            var first_key = this.x_state.assets[resp].i18n_keys.split(',')[0];
            resp = this.x_state.assets[resp][first_key][type_o];

            if (type.toLowerCase() == 'js') {
              resp = resp.replaceAll("/".concat(first_key, "/"), "/' + $i18n.locale + '/");
              resp = "require('".concat(resp, "')");
            } else if (type.toLowerCase() == 'jsfunc') {
              resp = resp.replaceAll("/".concat(first_key, "/"), "/' + this.$i18n.locale + '/");
              resp = "require('".concat(resp, "')");
            }
          } else if (resp in this.x_state.assets && type_o in this.x_state.assets[resp]) {
            resp = this.x_state.assets[resp][type_o];

            if (type.toLowerCase().indexOf('js') != -1) {
              resp = "require('".concat(resp, "')");
            }
          } else ;
        }
      }

      return resp;
    } //vue attributes tag version


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
        if (value === null) {
          resp.push(key);
        } else if (typeof value !== 'object' && typeof value !== 'function' && typeof value !== 'undefined') {
          resp.push("".concat(key, "='").concat(value, "'"));
        }
      }

      return resp.join(' ');
    } // hash helper method


    hash(thing) {
      // returns a hash of the given object, using google highwayhash (fastest)
      //this.debug_time({ id:`hash ${thing}` });
      var highwayhash = require('highwayhash');

      var input;

      if (typeof thing === 'string') {
        input = Buffer.from(thing);
      } else if (typeof thing === 'object') {
        // serialize object into buffer first
        input = Buffer.from(JSON.stringify(thing));
      }

      var resp = highwayhash.asHexString(this.x_crypto_key, input); //this.debug_timeEnd({ id:`hash ${thing}` });;

      return resp;
    }

  }

  return eb_dsl;

})));
