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

  // helper class
  class helper {
    constructor(config) {
      var def_config = {
        debug: true
      };
      this.config = _objectSpread2(_objectSpread2({}, def_config), config);
    }

    fixAccents(text, recover) {
      var ctext = text;
      var from = '';
      var table = {
        'C1': 'A',
        'E1': 'á',
        'C9': 'E',
        'E9': 'é',
        'CD': 'I',
        'ED': 'í',
        'D1': 'Ñ',
        'F1': 'ñ',
        'D3': 'O',
        'F3': 'ó',
        'DA': 'U',
        'FA': 'ú',
        'DC': 'U',
        'FC': 'ü',
        'AB': '«',
        'BB': '»',
        'BF': '¿',
        'A1': '¡',
        '80': '€',
        '20A7': 'Pts'
      };

      if (recover) {
        for (from in table) {
          ctext.replace(table[from], '&#x' + from);
        }
      } else {
        for (from in table) {
          ctext.replace('&#x' + from, table[from]);
        }
      }

      return ctext;
    }

  }

  /**
  * dsl_parser: A class for parsing Concepto DSL files, and compile them with the OPEN Framework.
  * @name 	dsl_parser
  * @module 	dsl_parser
  **/

  /**
   * A node object representation of a DSL node.
   * @typedef {Object} NodeDSL
   * @property {string} id - Node unique ID.
   * @property {number} level - Indicates the depth level from the center of the dsl map.
   * @property {string} text - Indicates the text defined in the node itself.
   * @property {string} text_rich - Indicates the html defined in the node itself.
   * @property {string} text_note - Indicates the text/html defined in the notes view of the node (if any).
   * @property {string} image - Image link defined as an image within the node.
   * @property {Object} cloud - Cloud information of the node.
   * @property {string} cloud.bgcolor - Background color of cloud.
   * @property {boolean} cloud.used - True if cloud is used, false otherwise. 
   * @property {Arrow[]} arrows - Visual connections of this node with other nodes {@link #module_dsl_parser..Arrow}.
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
  //import console_ from '../../console/src/index'

  class dsl_parser {
    constructor() {
      var {
        file = this.throwIfMissing('file'),
        config = {}
      } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var console_ = require('open_console');

      var def_config = {
        cancelled: false,
        debug: true
      };
      this.file = file;
      this.config = _objectSpread2(_objectSpread2({}, def_config), config);
      this.help = new helper();
      this.debug = new console_({
        silent: !this.config.debug
      });
      this.$ = null;
      this.x_memory_cache = {
        getNode: {}
      };
    }

    hash(thing) {
      return _asyncToGenerator(function* () {
        var resp = thing.toString();

        if (thing) {
          var cryptoAsync = require('@ronomon/crypto-async');

          var hmac = {};

          if (typeof thing === 'object') {
            hmac = yield cryptoAsync.hmac('sha256', Buffer.alloc(1024), Buffer.from(JSON.stringify(thing)));
          } else {
            hmac = yield cryptoAsync.hmac('sha256', Buffer.alloc(1024), Buffer.from(thing));
          }

          resp = hmac.toString('hex');
        }
        /*
        let cryp = require('crypto').createHash;
        let resp = cryp('sha256').update(thing).digest('hex');*/

        /*
              const {sha1} = require('crypto-hash');
              let resp = await sha1(thing,{ outputFormat:'hex' });
          	*/


        return resp;
      })();
    }
    /**
    * Executes initial processing for parser
    */


    process() {
      var _this = this;

      return _asyncToGenerator(function* () {
        if (_this.file != '') {
          _this.debug.setPrefix({
            prefix: 'dsl_parser',
            color: 'yellow'
          });

          _this.debug.title({
            title: 'DSL Parser for ' + _this.file,
            color: 'green'
          });

          _this.debug.time({
            id: 'process'
          }); //if (this.config.debug) console.time('process');


          var cheerio = require('cheerio');
              require('path');

          var fs = require('fs').promises;

          var data = '';
          data = yield fs.readFile(_this.file, 'utf-8'); // fix accents -> unicode to latin chars

          _this.debug.outT({
            message: 'fixing accents'
          }); //if (this.config.debug) console.log('fixing accents');


          data = _this.help.fixAccents(data); // parse XML 

          _this.$ = cheerio.load(data, {
            ignoreWhitespace: false,
            xmlMode: true,
            decodeEntities: false
          }); // remove cancelled nodes if requested

          if (_this.config.cancelled == false) {
            _this.debug.outT({
              message: 'removing cancelled nodes from tree'
            }); //if (this.config.debug) console.log('removing cancelled nodes from tree');


            _this.$('icon[BUILTIN*=button_cancel]').parent().remove();
          }

          _this.debug.timeEnd({
            id: 'process'
          }); //if (this.config.debug) console.timeEnd('process');

        }
      })();
    }
    /**
    * Gets a reference to the internal parser
    * @return 	{Object}
    */


    getParser() {
      return this.$;
    }
    /**
    * Get all nodes that contain the given arguments (all optional)
    * @param 	{String}	[text]				- Finds all nodes that contain its text with this value
    * @param 	{String}	[attribute]			- Finds all nodes that contain an attribute with this name
    * @param 	{String}	[attribute_value]	- Finds all nodes that contain an attribute with this value
    * @param 	{String}	[icon]				- Finds all nodes that contain these icons
    * @param 	{Int}		[level] 			- Finds all nodes that are on this level
    * @param 	{String}	[link] 				- Finds all nodes that contains this link
    * @param 	{Boolean}	[recurse=true]		- include its children 
    * @param 	{Boolean}	[nodes_raw=false]	- if this is true, includes key nodes_raw (children nodes) in result with a cheerio reference instead of processing them.
    * @return 	{NodeDSL[]}
    */


    getNodes() {
      var _arguments = arguments,
          _this2 = this;

      return _asyncToGenerator(function* () {
        var {
          text,
          attribute,
          attribute_value,
          icon,
          level,
          link,
          recurse = true,
          nodes_raw = false,
          hash_content = false
        } = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : {};
        var resp = [],
            nodes = null,
            me = _this2,
            fmatch = '';
        if (nodes_raw == true) recurse = false; // match first param that is defined

        if (text) {
          var tmp = text.toString().replace(/ /g, '\\ ');
          nodes = _this2.$("node[TEXT*=".concat(tmp, "]"));
          fmatch = 'text';
        } else if (attribute) {
          var _tmp = attribute.replace(/ /g, '\\ ');

          nodes = _this2.$("attribute[NAME*=".concat(_tmp, "]")).parent('node');
          fmatch = 'attribute';
        } else if (attribute_value) {
          var _tmp2 = attribute_value.replace(/ /g, '\\ ');

          nodes = _this2.$("attribute[VALUE*=".concat(_tmp2, "]")).parent('node');
          fmatch = 'attribute_value';
        } else if (icon) {
          var _tmp3 = icon.replace(/ /g, '\\ ');

          nodes = _this2.$("icon[BUILTIN*=".concat(_tmp3, "]")).parent('node');
          fmatch = 'icon';
        } else if (level && !isNaN(level)) {
          nodes = _this2.$("node").filter(function (i, elem) {
            var padres = -1;

            try {
              padres = me.$(elem).parents('node').length + 1;
            } catch (ee) {}

            return padres === level;
          });
          fmatch = 'level';
        } else if (link) {
          var _tmp4 = link.replace(/ /g, '\\ ');

          nodes = _this2.$("node[LINK*=".concat(_tmp4, "]"));
          fmatch = 'level';
        } else {
          nodes = _this2.$("node");
          fmatch = 'none';
        } // iterate nodes and build resp array


        if (nodes != null) {
          yield nodes.map( /*#__PURE__*/function () {
            var _ref = _asyncToGenerator(function* (i, elem) {
              var cur = me.$(elem);

              if (typeof cur.attr('ID') != 'undefined') {
                var _tmp5 = yield me.getNode({
                  id: cur.attr('ID'),
                  recurse: recurse,
                  nodes_raw: nodes_raw,
                  hash_content: hash_content
                }); // re-filter to see if all params defined match in this node (@TODO make more efficient doing before calling getNode; needs to be re-thinked)


                var all_met = true; // text

                if (all_met && text && fmatch != 'text' && _tmp5.text.indexOf(text) == -1) all_met = false; // attribute

                if (all_met && attribute && fmatch != 'attribute') {
                  all_met = false;
                  /*tmp.attributes.map(function(x){ 
                  	if(Object.keys(x)[0]==attribute) all_met=true; 
                  });*/

                  Object.keys(_tmp5.attributes).map(function (x) {
                    if (x == attribute) all_met = true;
                  });
                } // attribute_value


                if (all_met && attribute_value && fmatch != 'attribute_value') {
                  all_met = false;
                  /*tmp.attribute_value.map(function(x){ 
                  	if(Object.keys(x)[1]==attribute_value) all_met=true; 
                  });*/

                  Object.keys(_tmp5.attributes).map(function (x) {
                    if (attr[x] == attribute_value) all_met = true;
                  });
                } // icon


                if (all_met && icon && fmatch != 'icon') {
                  all_met = false;

                  _tmp5.icons.map(function (x) {
                    if (x == icon) all_met = true;
                  });
                } // level


                if (all_met && level && fmatch != 'level') {
                  if (isNaN(level)) {
                    all_met = numberInCondition$1(_tmp5.level, level);
                  } else {
                    if (_tmp5.level != level) all_met = false;
                  }
                } //


                if (all_met == true) resp.push(_tmp5);
                /*if (recurse==true && all_met==true) {
                	let tmp2 = await me.getNode({ id:cur.attr('ID'), recurse:recurse, nodes_raw:nodes_raw });
                	resp.push(tmp2);
                } else if (all_met) {
                	resp.push(tmp);
                }*/
              }
            });

            return function (_x, _x2) {
              return _ref.apply(this, arguments);
            };
          }());
        } //console.log('resp',resp);


        return resp;
      })();
    }
    /**
     * Adds a node as an xml child of the given parent node ID
     * @param 	{String}	parent_id 		- ID of parent node
     * @param	{NodeDSL}	node			- NodeDSL object to add
     */


    addNode() {
      var _arguments2 = arguments,
          _this3 = this;

      return _asyncToGenerator(function* () {
        var {
          parent_id = _this3.throwIfMissing('parent_id - addNode'),
          node = _this3.throwIfMissing('node - addNode')
        } = _arguments2.length > 0 && _arguments2[0] !== undefined ? _arguments2[0] : {};
        //to do idea: secret icon nodes -> encrypted json with 'secrets' config node within _git.dsl version (cli arg --secret 'pass' y --un_git (crea ver no git con secrets desencriptado))
        //grab parentID
        var me = _this3;
        yield _this3.$('node[ID=' + parent_id + ']').each( /*#__PURE__*/function () {
          var _ref2 = _asyncToGenerator(function* (i, elem) {
            var cur = me.$(elem);
            var txml = yield me.nodeToXML({
              node
            });
            cur.append(txml);
          });

          return function (_x3, _x4) {
            return _ref2.apply(this, arguments);
          };
        }());
        return me.$.html();
      })();
    }
    /**
     * Edits the given node ID data keys
     * @param 	{String}	node_id 		- ID of node to edit
     * @param	{NodeDSL}	data			- NodeDSL object properties to modify or method(existing_properties_of_node) that returns object data to modify
     */


    editNode() {
      var _arguments3 = arguments,
          _this4 = this;

      return _asyncToGenerator(function* () {
        var {
          node_id = _this4.throwIfMissing('node_id - editNode'),
          data = _this4.throwIfMissing('data - editNode'),
          children = true
        } = _arguments3.length > 0 && _arguments3[0] !== undefined ? _arguments3[0] : {};
        //grab nodetID
        var me = _this4;

        _this4.debug.outT({
          message: "editNode: getting nodeID:".concat(node_id)
        });

        var key_node = yield _this4.getNode({
          id: node_id,
          recurse: children
        }); //overwrite node data with given data, and get the new xml

        var ndata = key_node,
            new_xml = '';

        if (typeof data === 'function') {
          var tmp = yield data(key_node);
          ndata = _objectSpread2(_objectSpread2({}, ndata), tmp);
        } else {
          ndata = _objectSpread2(_objectSpread2({}, ndata), data);
        }

        _this4.debug.outT({
          message: "editNode: converting data to xml"
        });

        new_xml = yield _this4.nodeToXML({
          node: ndata
        });

        _this4.debug.outT({
          message: "editNode: replacing xml"
        });

        var target = yield _this4.$('node[ID=' + node_id + ']').toArray();

        if (target.length > 0) {
          var target_node = _this4.$(target[0]);

          target_node.replaceWith(new_xml);
        }

        _this4.debug.outT({
          message: "editNode: ready!"
        });

        return me.$.html();
      })();
    }
    /**
     * Converts a NodeDSL into an XML of ConceptoDSL node child
     * @param	{NodeDSL}	node			- NodeDSL origin object
     */


    nodeToXML() {
      var _arguments4 = arguments,
          _this5 = this;

      return _asyncToGenerator(function* () {
        var {
          node = _this5.throwIfMissing('node - nodeToXML')
        } = _arguments4.length > 0 && _arguments4[0] !== undefined ? _arguments4[0] : {};

        require('he');

        var toxml = function toxml(o) {
          var {
            create
          } = require('xmlbuilder2');

          return create(o).end({
            prettyPrint: true
          });
        };

        var nodeToObj = function nodeToObj(node) {
          var getRandomInt = function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
          };

          var base = {
            id: 'ID_' + getRandomInt(10000000, 90000000),
            level: -1,
            text: '',
            text_rich: '',
            text_note: '',
            text_note_html: '',
            image: '',
            cloud: {
              used: false,
              bgcolor: ''
            },
            arrows: [],
            nodes: [],
            font: {
              face: 'SansSerif',
              size: 12,
              bold: false,
              italic: false
            },
            style: '',
            color: '',
            bgcolor: '',
            link: '',
            position: '',
            attributes: {},
            icons: [],
            date_modified: new Date(),
            date_created: new Date(),
            valid: true
          };

          var node_obj = _objectSpread2(_objectSpread2({}, base), node); //prepare node_obj


          var obj = {
            node: {
              '@ID': node_obj.id
            }
          };

          if (node_obj.date_created) {
            if (typeof node_obj.date_created == 'string') {
              var tmpdate = new Date(node_obj.date_created);
              obj.node['@CREATED'] = tmpdate.getTime();
            } else {
              obj.node['@CREATED'] = node_obj.date_created.getTime();
            }
          }

          if (node_obj.date_modified) {
            if (typeof node_obj.date_modified == 'string') {
              var _tmpdate = new Date(node_obj.date_modified);

              obj.node['@MODIFIED'] = _tmpdate.getTime();
            } else {
              obj.node['@MODIFIED'] = node_obj.date_modified.getTime();
            }
          }

          if (node_obj.link != '') obj.node['@LINK'] = '#' + node_obj.link;
          if (node_obj.position != '') obj.node['@POSITION'] = node_obj.position;
          if (node_obj.color != '') obj.node['@COLOR'] = node_obj.color;
          if (node_obj.bgcolor != '') obj.node['@BACKGROUND_COLOR'] = node_obj.bgcolor;
          if (node_obj.style != '') obj.node['@STYLE'] = node_obj.style;
          if (node_obj.text != '') obj.node['@TEXT'] = node_obj.text; //<attribute_layout NAME_WIDTH="230" VALUE_WIDTH="301"/>
          //determine attributes auto-width

          var attr_max_namelen = 0,
              attr_max_valuelen = 0;

          for (var att in node_obj.attributes) {
            if (att.length > attr_max_namelen) attr_max_namelen = att.length;
            if (node_obj.attributes[att].length > attr_max_valuelen) attr_max_valuelen = node_obj.attributes[att].length;
          }

          if (attr_max_namelen > 0 && attr_max_valuelen > 0) {
            if (!obj.node['#']) obj.node['#'] = [];
            obj.node['#'].push({
              attribute_layout: {
                '@NAME_WIDTH': Math.round(attr_max_namelen * 6.67),
                '@VALUE_WIDTH': Math.round(attr_max_valuelen * 6.67)
              }
            });
          } //attributes


          for (var _att in node_obj.attributes) {
            if (!obj.node['#']) obj.node['#'] = [];
            obj.node['#'].push({
              attribute: {
                '@NAME': _att,
                '@VALUE': node_obj.attributes[_att]
              }
            });
            if (_att.length > attr_max_namelen) attr_max_namelen = _att.length;
            if (node_obj.attributes[_att].length > attr_max_valuelen) attr_max_valuelen = node_obj.attributes[_att].length;
          } //icons


          for (var icon of node_obj.icons) {
            if (!obj.node['#']) obj.node['#'] = [];
            obj.node['#'].push({
              icon: {
                '@BUILTIN': icon
              }
            });
          } //fonts


          if (JSON.stringify(node_obj.font) != JSON.stringify(base.font)) {
            if (!obj.node['#']) obj.node['#'] = [];
            var font_obj = {
              font: {
                '@NAME': node_obj.font.face,
                '@SIZE': node_obj.font.size
              }
            };
            if (node_obj.font.bold && node_obj.font.bold == true) font_obj.font['@BOLD'] = true;
            if (node_obj.font.italic && node_obj.font.italic == true) font_obj.font['@ITALIC'] = true;
            obj.node['#'].push(font_obj);
          } // cloud definition


          if (node_obj.cloud.used == true) {
            if (!obj.node['#']) obj.node['#'] = [];
            obj.node['#'].push({
              cloud: {
                '@COLOR': node_obj.cloud.bgcolor
              }
            });
          } // image


          if (node_obj.image != '') {
            if (!obj.node['#']) obj.node['#'] = [];
            obj.node['#'].push({
              richcontent: {
                '@TYPE': 'NODE',
                '#': {
                  html: {
                    head: {},
                    body: {
                      p: {
                        img: {
                          '@src': node_obj.image,
                          '@width': 100,
                          '@height': 100
                        }
                      }
                    }
                  }
                }
              }
            });
          } // notes on node


          if (node_obj.text_note != '' || node_obj.text_note_html != '') {
            if (!obj.node['#']) obj.node['#'] = [];
            if (node_obj.text_note) ;
            if (node_obj.text_note_html) ;
            var t = {
              richcontent: {
                '@TYPE': 'NOTE',
                '#': {
                  html: {
                    head: {},
                    body: {}
                  }
                }
              }
            };

            if (node_obj.text_note_html) {
              t.richcontent['#'].html.body = node_obj.text_note_html;
            } else {
              t.richcontent['#'].html.body = {
                p: node_obj.text_note
              };
            }

            obj.node['#'].push(t);
          } // set node arrows


          if (node_obj.arrows.length > 0) {
            if (!obj.node['#']) obj.node['#'] = [];

            for (var arr of node_obj.arrows) {
              var arrow = {
                arrowlink: {
                  '@ID': 'Arrow_' + node_obj.id,
                  '@DESTINATION': arr.target,
                  '@STARTINCLINATION': '0;0;',
                  '@ENDINCLINATION': '0;0;'
                }
              };
              if (arr.color != '') arrow.arrowlink['@COLOR'] = arr.color;

              if (arr.type == 'source-to-target') {
                arrow.arrowlink['@STARTARROW'] = 'None';
                arrow.arrowlink['@ENDARROW'] = 'Default';
              } else if (arr.type == 'target-to-source') {
                arrow.arrowlink['@STARTARROW'] = 'Default';
                arrow.arrowlink['@ENDARROW'] = 'None';
              } else {
                arrow.arrowlink['@STARTARROW'] = 'Default';
                arrow.arrowlink['@ENDARROW'] = 'Default';
              }

              obj.node['#'].push(arrow);
            }
          } //process children nodes


          if (node_obj.nodes.length > 0) {
            for (var xc of node_obj.nodes) {
              if (!obj.node['#']) obj.node['#'] = [];
              obj.node['#'].push(nodeToObj(xc));
            }
          } //


          return obj;
        }; //


        return toxml(nodeToObj(node)).replace("<?xml version=\"1.0\"?>", "");
      })();
    }
    /**
    * Get node data for the given id
    * @param 	{String}	id				- ID of node to request
    * @param 	{Boolean}	[recurse=true] 	- include its children
    * @param 	{Boolean}	[dates=true]	- include parsing creation/modification dates
    * @param 	{Boolean}	[$=false]		- include cheerio reference
    * @param 	{Boolean}	[nodes_raw=false]	- if recurse is false and this is true, includes key nodes_raw (children nodes) in result with a cheerio reference instead of processing them.
    * @return 	{NodeDSL[]}
    */


    getNode() {
      var _arguments5 = arguments,
          _this6 = this;

      return _asyncToGenerator(function* () {
        var {
          id = _this6.throwIfMissing('id - getNode'),
          recurse = true,
          justlevel,
          dates = true,
          $ = false,
          nodes_raw = false,
          hash_content = false
        } = _arguments5.length > 0 && _arguments5[0] !== undefined ? _arguments5[0] : {};
        if (_this6.$ === null) throw new Error('call process() first!');

        if (id in _this6.x_memory_cache.getNode && _this6.x_memory_cache.getNode[id].valid && _this6.x_memory_cache.getNode[id].valid == true && nodes_raw == false && $ == false) {
          return _this6.x_memory_cache.getNode[id];
        } else {
          var me = _this6;
          var resp = {
            level: -1,
            text: '',
            text_rich: '',
            text_note: '',
            text_note_html: '',
            image: '',
            cloud: {
              used: false,
              bgcolor: ''
            },
            arrows: [],
            nodes: [],
            font: {
              face: 'SansSerif',
              size: 12,
              bold: false,
              italic: false
            },
            style: '',
            color: '',
            bgcolor: '',
            link: '',
            position: '',
            attributes: {},
            icons: [],
            date_modified: new Date(),
            date_created: new Date(),
            valid: true
          };

          var he = require('he');

          yield me.$('node[ID=' + id + ']').each( /*#__PURE__*/function () {
            var _ref3 = _asyncToGenerator(function* (i, elem) {
              var cur = me.$(elem);
              resp.id = cur.attr('ID');
              resp.level = cur.parents('node').length + 1; // limit level if defined

              if (justlevel && resp.level != justlevel) {
                resp.valid = false;
                return false;
              } // add ref to $


              if ($) resp.$ = cur; // add hash of content
              //me.debug.outT({ message:'creating hash for node '+resp.id });

              if (hash_content && hash_content == true) {
                var content_ = cur.html(); //me.debug.outT({ message:'content:'+content_ });

                resp.hash_content = yield me.hash(content_); //me.debug.outT({ message:'hash created:'+resp.hash_content });
              } //


              if (typeof cur.attr('LINK') != 'undefined') resp.link = cur.attr('LINK').split('#').join('');
              if (typeof cur.attr('POSITION') != 'undefined') resp.position = cur.attr('POSITION');
              if (typeof cur.attr('COLOR') != 'undefined') resp.color = cur.attr('COLOR');
              if (typeof cur.attr('BACKGROUND_COLOR') != 'undefined') resp.bgcolor = cur.attr('BACKGROUND_COLOR');
              if (typeof cur.attr('STYLE') != 'undefined') resp.style = cur.attr('STYLE');
              if (typeof cur.attr('TEXT') != 'undefined') resp.text = cur.attr('TEXT');
              resp.text = he.decode(resp.text);
              /*resp.text = resp.text 	.replaceAll('&lt;','<')
              						.replaceAll('&gt;','>')
              						.replaceAll('&amp;','&')
              						.replaceAll('&apos;',`'`)
              						.replaceAll('&quot;',`"`);*/
              // dates parsing

              if (dates) {
                if (typeof cur.attr('CREATED') != 'undefined') {
                  resp.date_created = new Date(parseFloat(cur.attr('CREATED')));
                }

                if (typeof cur.attr('MODIFIED') != 'undefined') {
                  resp.date_modified = new Date(parseFloat(cur.attr('MODIFIED')));
                }
              } // attributes


              cur.find('node[ID=' + resp.id + '] > attribute').map(function (a, a_elem) {
                var _fila = me.$(a_elem); //tmp_fila[_fila.attr('NAME')] = _fila.attr('VALUE');
                //resp.attributes.push(tmp_fila);


                resp.attributes[_fila.attr('NAME')] = he.decode(_fila.attr('VALUE'));
              }); // icons

              cur.find('node[ID=' + resp.id + '] > icon').map(function (a, a_elem) {
                resp.icons.push(me.$(a_elem).attr('BUILTIN'));
              }); // fonts definition

              cur.find('node[ID=' + resp.id + '] > font').map(function (a, a_elem) {
                var _fila = me.$(a_elem);

                resp.font.face = _fila.attr('NAME');
                resp.font.size = _fila.attr('SIZE');

                if (typeof _fila.attr('BOLD') != 'undefined') {
                  resp.font.bold = _fila.attr('BOLD') == 'true' ? true : false;
                }

                if (typeof _fila.attr('ITALIC') != 'undefined') {
                  resp.font.italic = _fila.attr('ITALIC') == 'true' ? true : false;
                }
              }); // cloud definition

              cur.find('node[ID=' + resp.id + '] > cloud').map(function (a, a_elem) {
                var _fila = me.$(a_elem);

                resp.cloud.used = true;

                if (typeof _fila.attr('COLOR') != 'undefined') {
                  resp.cloud.bgcolor = _fila.attr('COLOR');
                }
              }); // get image if any on node

              cur.find('node[ID=' + resp.id + '] > richcontent[TYPE=NODE] body').map(function (a, a_elem) {
                resp.text_rich = me.$(a_elem).html();
                me.$(a_elem).find('img[src]').map(function (i, i_elem) {
                  resp.image = me.$(i_elem).attr('src');
                });
              }); // get notes on node if any

              cur.find('node[ID=' + resp.id + '] > richcontent[TYPE=NOTE] body').map(function (a, a_elem) {
                resp.text_note = me.$(a_elem).text();
                resp.text_note_html = me.$(a_elem).html();
              }); // get defined arrows on node if any

              cur.find('node[ID=' + resp.id + '] > arrowlink').map(function (a, a_elem) {
                var _fila = me.$(a_elem),
                    _tmp_f = {
                  target: '',
                  color: '',
                  style: ''
                },
                    _tmpa = {};

                _tmp_f.target = _fila.attr('DESTINATION');

                if (typeof _fila.attr('COLOR') != 'undefined') {
                  _tmp_f.color = _fila.attr('COLOR');
                }

                _tmpa.type = _fila.attr('STARTARROW') + '-' + _fila.attr('ENDARROW');

                if (_tmpa.type.indexOf('None-Default') != -1) {
                  _tmp_f.style = 'source-to-target';
                } else if (_tmpa.type.indexOf('Default-None') != -1) {
                  _tmp_f.style = 'target-to-source';
                } else {
                  _tmp_f.style = 'both-ways';
                }

                resp.arrows.push(_tmp_f);
              }); // get children nodes .. (using myself for each child)

              if (recurse == true) {
                //console.log('getNode recurse:true, getting subnodes of nodeID:'+id);
                yield cur.find('node').map( /*#__PURE__*/function () {
                  var _ref4 = _asyncToGenerator(function* (a, a_elem) {
                    var _nodo = me.$(a_elem);

                    var _id = _nodo.attr('ID');

                    if (!_id) {
                      // 7-jun-21 hack: if the node doesn't have an ID attr, invent one.
                      var getRandomInt = function getRandomInt(min, max) {
                        return Math.floor(Math.random() * (max - min)) + min;
                      };

                      _id = 'ID_' + getRandomInt(10000000, 90000000);

                      _nodo.attr('ID', _id);
                    }

                    try {
                      var hijo = yield me.getNode({
                        id: _id,
                        recurse: recurse,
                        justlevel: resp.level + 1,
                        hash_content: hash_content
                      });

                      if (hijo.valid) {
                        //delete hijo.valid;
                        resp.nodes.push(hijo);
                      }
                    } catch (err00) {
                      console.log('ERROR getting child node info: ' + _nodo.toString(), err00);
                    }
                  });

                  return function (_x7, _x8) {
                    return _ref4.apply(this, arguments);
                  };
                }().bind(this));
              } else if (nodes_raw == true) {
                resp.nodes_raw = cur.find('node');
                /* */

                resp.getNodes = /*#__PURE__*/_asyncToGenerator(function* () {
                  // this.me and this.cur
                  var resp = []; //console.log('getNodes() called for node ID:'+this.dad.id);

                  yield this.cur.find('node').map( /*#__PURE__*/function () {
                    var _ref6 = _asyncToGenerator(function* (a, a_elem) {
                      var _nodo = this.me.$(a_elem);

                      var _id = _nodo.attr('ID');

                      if (!_id) {
                        // 28-may-21 hack: if the node doesn't have an ID attr, invent one.
                        var getRandomInt = function getRandomInt(min, max) {
                          return Math.floor(Math.random() * (max - min)) + min;
                        };

                        _id = 'ID_' + getRandomInt(10000000, 90000000);

                        _nodo.attr('ID', _id);
                      }

                      try {
                        var hijo = yield this.me.getNode({
                          id: _id,
                          justlevel: this.level + 1,
                          recurse: false,
                          nodes_raw: true,
                          hash_content: hash_content
                        });

                        if (hijo.valid) {
                          //10may21 @check this, maybe needs && hijo.valid==true
                          //delete hijo.valid;
                          resp.push(hijo);
                        }
                      } catch (errson) {
                        console.log('ERROR getting child node info: ' + _nodo.toString(), errson);
                      }
                    });

                    return function (_x9, _x10) {
                      return _ref6.apply(this, arguments);
                    };
                  }().bind(this));
                  return resp;
                }).bind({
                  me,
                  cur,
                  level: resp.level,
                  dad: resp
                });
              } // break loop


              return false;
            });

            return function (_x5, _x6) {
              return _ref3.apply(this, arguments);
            };
          }());

          if (resp.valid && resp.valid == true && nodes_raw == false && $ == false) {
            // remove 'valid' key if justLevel is not defined
            //if (!justlevel) delete resp.valid; //this doesnt seem right (27-4-21)
            _this6.x_memory_cache.getNode[id] = resp;
          } // reply


          return resp;
        }
      })();
    }
    /**
    * Returns the parent node of the given node id
    * @param 	{String}	id				- ID of node to request
    * @param 	{Boolean}	[recurse=false] - include its children
    * @return 	{NodeDSL} 
    */


    getParentNode() {
      var _arguments6 = arguments,
          _this7 = this;

      return _asyncToGenerator(function* () {
        var {
          id = _this7.throwIfMissing('id - ParentNode'),
          recurse = false
        } = _arguments6.length > 0 && _arguments6[0] !== undefined ? _arguments6[0] : {};
        if (_this7.$ === null) throw new Error('call process() first!');

        var padre = _this7.$("node[ID=".concat(id, "]")).parent('node');

        var resp = {},
            me = _this7;

        if (typeof padre.attr('ID') != 'undefined') {
          resp = yield me.getNode({
            id: padre.attr('ID'),
            recurse: recurse
          });
        }

        return resp;
      })();
    }
    /**
    * Returns the parent nodes ids of the given node id
    * @param 	{String}		id 				- node id to query
    * @param 	{Boolean}		[array=false]	- get results as array, or as a string
    * @return 	{String|Array}
    */


    getParentNodesIDs() {
      var _arguments7 = arguments,
          _this8 = this;

      return _asyncToGenerator(function* () {
        var {
          id = _this8.throwIfMissing('id - ParentNodesIDs'),
          array = false
        } = _arguments7.length > 0 && _arguments7[0] !== undefined ? _arguments7[0] : {};

        var padres = _this8.$("node[ID=".concat(id, "]")).parents('node');

        var resp = [],
            me = _this8;
        padres.map(function (i, elem) {
          var item = me.$(elem);

          if (typeof item.attr('ID') != 'undefined') {
            resp.push(item.attr('ID'));
          }
        }); // delete the last item (central node) and return

        resp.pop();

        if (array) {
          return resp;
        } else {
          return resp.join(',');
        }
      })();
    }
    /**
    * Returns the children nodes ids of the given node id
    * @param 	{String}	id 				- node id to query
    * @param 	{Boolean}	[array=false]	- get results as array, or as a string
    * @return 	{String|Array}
    */


    getChildrenNodesIDs() {
      var _arguments8 = arguments,
          _this9 = this;

      return _asyncToGenerator(function* () {
        var {
          id = _this9.throwIfMissing('id - ChildrenNodesIDs'),
          array = false
        } = _arguments8.length > 0 && _arguments8[0] !== undefined ? _arguments8[0] : {};

        var hijos = _this9.$("node[ID=".concat(id, "]")).find('node');

        var resp = [],
            me = _this9;
        hijos.map(function (i, elem) {
          var item = me.$(elem);

          if (typeof item.attr('ID') != 'undefined') {
            resp.push(item.attr('ID'));
          }
        });

        if (array) {
          return resp;
        } else {
          return resp.join(',');
        }
      })();
    }
    /**
    * Returns the brother nodes ids of the given node id
    * @param 	{String}	id 				- node id to query
    * @param 	{Boolean}	[before=true] 	- consider brothers before the queried node
    * @param 	{Boolean}	[after=true] 	- consider brothers after the queried node
    * @param 	{Boolean}	[array=false]	- get results as array of objects, or as a string
    * @return 	{String}
    */


    getBrotherNodesIDs() {
      var _arguments9 = arguments,
          _this10 = this;

      return _asyncToGenerator(function* () {
        var {
          id = _this10.throwIfMissing('id - BrotherNodesIDs'),
          before = true,
          after = true,
          array = false
        } = _arguments9.length > 0 && _arguments9[0] !== undefined ? _arguments9[0] : {};
        var me_data = yield _this10.getNode({
          id: id,
          recurse: false,
          $: true
        });
        var resp = [];

        if (before) {
          var prev = me_data.$.prev('node');

          while (typeof prev.get(0) != 'undefined') {
            if (array == false) {
              resp.push(prev.get(0).attribs.ID);
            } else {
              resp.push(prev.get(0).attribs);
            }

            prev = prev.prev('node');
          }
        }

        if (after) {
          var next = me_data.$.next('node');

          while (typeof next.get(0) != 'undefined') {
            if (array == false) {
              resp.push(next.get(0).attribs.ID);
            } else {
              resp.push(next.get(0).attribs);
            }

            next = next.next('node');
          }
        } // return


        if (array) {
          return resp;
        } else {
          return resp.join(',');
        }
      })();
    }
    /**
    * Returns a modified version of the current loaded DSL, ready to be push to a version control (like github)
    * @param 	{Boolean}	[remove] 		- Remove modified dates? (default:true)
    * @param 	{Function}	[extrastep] 	- Optional method to return make additional cleansing and return the xml
    * @return 	{String} 					  Modified DSL source ready to be saved and pushed to a version control
    */


    createGitVersion() {
      var _arguments10 = arguments,
          _this11 = this;

      return _asyncToGenerator(function* () {
        var remove = _arguments10.length > 0 && _arguments10[0] !== undefined ? _arguments10[0] : true;
        var extrastep = _arguments10.length > 1 ? _arguments10[1] : undefined;

        // 1) get copy of current DSL content into memory (for restoring after returning)
        var copy = _this11.$.html(),
            me = _this11; // 2) get all nodes


        var nodes = _this11.$("node"); // 


        nodes.each(function (i, elem) {
          // 3) replace all attributes CREATED with fixed value
          me.$(elem).attr("CREATED", "1552681669876");

          if (remove == true) {
            // 4) replace all attributes MODIFIED with fixed value
            me.$(elem).attr("MODIFIED", "1552681669876");
          } // 5) erase all attributes VSHIFT and HGAP


          me.$(elem).removeAttr("VSHIFT"); // 6) erase all attributes HGAP

          me.$(elem).removeAttr("HGAP");
        }); // 7) transform all latin accents into original-unicodes (fixAccents(text,recover=true) (helper class))

        var resp = _this11.$.html(); // 8) extrastep


        if (extrastep && typeof extrastep == 'function') {
          resp = extrastep(_this11.$);
        }

        resp = _this11.help.fixAccents(resp, true); // recover original tags to current parser $.

        _this11.$ = _this11.$.load(copy, {
          ignoreWhitespace: false,
          xmlMode: true,
          decodeEntities: false
        }); // return

        return resp;
      })();
    } // ********************
    // private methods
    // ********************


    throwIfMissing(name) {
      throw new Error('Missing ' + name + ' parameter!');
    }
    /**
    * Finds variables within given text
    * @param 	{String}	text 				- String from where to parse variables
    * @param 	{String}	[symbol=**]			- Wrapper symbol used as variable openning definition.
    * @param 	{String}	[symbol_closing=**] - Wrapper symbol used as variable closing definition.
    * @param 	{Boolean}	[array=false]		- get results as array, or as a string
    * @return 	{String}
    */


    findVariables() {
      var {
        text = this.throwIfMissing('text'),
        symbol = '**',
        symbol_closing = '**',
        array = false
      } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var escapseRegExp = function escapseRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      };

      var extractorPattern = new RegExp(escapseRegExp(symbol) + '(.*?)' + escapseRegExp(symbol_closing), 'g');
      var resp = [];
      var nadamas = false;

      while (!nadamas) {
        var test = new RegExp(extractorPattern, 'gim');
        var utiles = text.match(test);

        for (var i in utiles) {
          resp.push(utiles[i].split(symbol).join('').split(symbol_closing).join(''));
        }

        nadamas = true;
      }

      return array ? resp : resp.join(',');
    }
    /**
    * Finds and transform variables wrapping/handlebars symbols given a 'from' symbol object and a 'to' symbol object within the given text
    * @param 	{String}	text 				- String from where to parse variables
    * @param 	{Object}	from				- Object to identify source variables symbols (keys: open and close)
    * @param 	{Object}	to 					- Object to identify target variables symbols (keys: open and close)
    * @return 	{String}
    */


    replaceVarsSymbol() {
      var {
        text = this.throwIfMissing('text'),
        from = {
          open: '**',
          close: '**'
        },
        to = {
          open: '**',
          close: '**'
        }
      } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var source = this.findVariables({
        text,
        symbol: from.open,
        symbol_closing: from.close,
        array: true
      });
      var resp = text,
          tmp = {};

      for (var item of source) {
        tmp.from = from.open + item + from.close;
        tmp.to = to.open + item + to.close;
        resp = resp.replace(tmp.from, tmp.to);
      }

      return resp;
    }
    /** 
    * Finds all differences 'from' given dsl 'to' given dsl (for CLI arg --diff-from file.dsl)
    * and returns an object with 'deleted', 'added', and 'modified' IDs keys
    * @param 	{String}	from 				- From source DSL content (before code)
    * @param 	{String}	to 					- To source DSL content (after code, to compare)
    */


    getDifferences(from, to) {
      var _this12 = this;

      return _asyncToGenerator(function* () {
        _this12.debug.outT({
          message: 'getDifferences: init'
        });

        var changes = /*#__PURE__*/function () {
          var _ref7 = _asyncToGenerator(function* (source, target) {
            this.debug.outT({
              message: 'getDifferences: changes init'
            });

            var prettydiff = require('prettydiff');

            var extract = require('extractjs')();

            var report = {
              deleted: {},
              added: {},
              modified: {}
            }; //console.log(prettydiff);

            var opts = {
              source: source,
              diff: target
            };
            prettydiff.options.source = opts.source;
            prettydiff.options.diff = opts.diff;
            prettydiff.options.diff_format = 'json';
            this.debug.outT({
              message: "getDifferences: calling prettydiff"
            });
            var tdiff = prettydiff();
            this.debug.outT({
              message: "getDifferences: parsing diff as resp"
            });
            var resp = JSON.parse(tdiff).diff;
            this.debug.outT({
              message: "getDifferences: parsing diff as resp_bak"
            });
            var resp_bak = JSON.parse(tdiff).diff; // build report

            this.debug.outT({
              message: "getDifferences: building report"
            });
            var counter_ = 0;

            for (var line in resp) {
              if (counter_ % 1000 == 0) this.debug.outT({
                message: "getDifferences: reading 1000 lines from line ".concat(line, " (of ").concat(resp.length, ")")
              });
              counter_ += 1;
              var content = resp[line];
              var operator = content.shift();

              {
                //operator!='=' //true //operator!='r'
                //console.log('operador:'+operator);
                var related_id = -1;
                var test = extract("id=\"ID_{id}\"", content[0]);
                if (!test.id) test = extract("ID=\"ID_{id}\"", content[0]);

                if (test.id) {
                  related_id = "ID_".concat(test.id);

                  if (operator == '+') {
                    report.added[related_id] = resp[line]; //line
                  } else if (operator == 'r') {
                    //node modified
                    report.modified[related_id] = resp[line];
                  }
                } else {
                  //search parents for id if line doesn't contain it
                  //console.log('ID no encontrado en linea analizada '+content[0]+',revisando previos con operator tipo =');
                  for (var i = line; i >= 0; i--) {
                    resp_bak[i][0];

                    {
                      //'=,+,r,-'.split(',').includes(ope)
                      var to_check = resp_bak[i];

                      if (typeof to_check == 'string') {
                        to_check = to_check.trim(); //console.log('(string) getting code from '+to_check);
                      } else if (Array.isArray(to_check)) {
                        //console.log('to_check.length = '+to_check.length);
                        if (to_check.length == 3) {
                          //when ope is r=replace
                          to_check = to_check[2].trim();
                        } else {
                          to_check = to_check[1].trim();
                        }
                      }

                      if (to_check != '' && to_check.includes('ID_') == true) {
                        var _test = extract("id=\"ID_{id}\"", to_check);

                        if (!_test.id) _test = extract("ID=\"ID_{id}\"", to_check); //console.log('checking for ID',{to_check,test});

                        if (_test.id) {
                          related_id = "ID_".concat(_test.id);

                          if (operator == '+') {
                            report.added[related_id] = resp[line];
                          } else if (operator == '-') {
                            report.deleted[related_id] = resp[line];
                          } else if (operator == 'r') {
                            report.modified[related_id] = resp[line]; //line
                          }

                          break;
                        }
                      }
                    }
                  }
                }
              }
            }

            this.debug.outT({
              message: "getDifferences: applying post-filters"
            }); //filter; remove IDs from modified that also appear on added

            for (var x in report.added) {
              //21jun21
              if (opts.diff.includes(x) == true) {
                //if new file include the given ID and the old file, they it was modified (ex. an html note tag)
                if (report.added[x].length == 2) report.modified[x] = report.added[x];
                delete report.added[x];
              } else {
                delete report.modified[x];
              }
            } //filter2: remove IDs from added if they also appear on deleted


            for (var _x13 in report.deleted) {
              if (opts.source.includes(_x13) == false && opts.diff.includes(_x13) == true) ; else {
                if (_x13 in report.added) {
                  // if key is in added as well as deleted, then its a modified node
                  delete report.added[_x13];
                  report.modified[_x13] = report.deleted[_x13];
                  delete report.deleted[_x13];
                }
              }
            }

            for (var _x14 in report.modified) {
              if (opts.diff.includes(_x14) == false && opts.source.includes(_x14) == true) {
                //filter3: remove IDs from modified that dont exist in 'to' source, to 'deleted'
                report.deleted[_x14] = report.modified[_x14];
                delete report.modified[_x14];
              } else if (opts.source.includes(_x14) == false) {
                //filter3: remove IDs from modified that dont exist in 'source' source, to 'added'
                report.added[_x14] = report.modified[_x14];
                delete report.modified[_x14];
              } else if (_x14 in report.deleted) {
                delete report.deleted[_x14];
              } //only keep modified values that are of same node type


              if (report.modified[_x14] && report.modified[_x14].length == 2) {
                this.debug.outT({
                  message: "getDifferences: testing modified false positives"
                });

                var _from = extract("&lt;{tag} ", report.modified[_x14][0]);

                var after = extract("&lt;{tag} ", report.modified[_x14][1]); //let after = extract(`&lt;/{tag}&`,report.modified[x][1]);
                //if (!after.tag) after = extract(`&lt;/{tag} `,report.modified[x][1]);

                if (_from.tag != after.tag) {
                  this.debug.outT({
                    message: "getDifferences: removing: from '".concat(_from.tag, "' to '").concat(after.tag, "'")
                  });
                  delete report.modified[_x14];
                }
              } else {
                this.debug.outT({
                  message: "getDifferences: cleaning modified false positive"
                });
                delete report.modified[_x14];
              }
            }

            this.debug.outT({
              message: "getDifferences: finished processing"
            });
            return report;
          });

          return function (_x11, _x12) {
            return _ref7.apply(this, arguments);
          };
        }().bind(_this12);

        var resp = yield changes(from, to);
        return resp;
      })();
    }

  } //private methods
  //returns true if num meets the conditions listed on test (false otherwise)

  function numberInCondition$1(num, command_test) {
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

  String.prototype.replaceAll = function (strReplace, strWith) {
    // See http://stackoverflow.com/a/3561711/556609
    var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    var reg = new RegExp(esc, 'ig');
    return this.replace(reg, strWith);
  };

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
          //let dsl_parser = require('dsl_parser');
          var path = require('path'),
              fs = require('fs').promises,
              tmp = {}; // show title


          _this.x_console.title({
            title: "DSL Interpreter ".concat(_this.x_config.class.toUpperCase(), "\ninit:compiling file:\n").concat(_this.x_flags.dsl),
            color: 'cyan',
            config: {
              align: 'left'
            }
          });

          _this.dsl_parser = new dsl_parser({
            file: _this.x_flags.dsl,
            config: {
              cancelled: true,
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
            var for_git = yield _this.dsl_parser.createGitVersion(false, function ($) {
              //search aws node (even if it doesn't have the secret icon)
              var aws = $("node[TEXT=aws] attribute[NAME*=access]").toArray();
              aws.map(function (elem) {
                var cur = $(elem);
                cur.parent('node').remove();
                /*let dad = cur.parent('node');
                dad.find('attribute').map(function(a,a_elem) {
                	let att = $(a_elem);
                	att.attr('VALUE','xxxxxxxx');
                });
                dad.append(`<icon BUILTIN="button_cancel"/>`);*/
              }); //remove nodes with secret icon within config node

              /*
              let secret_config = $(`node[TEXT=config] icon[BUILTIN=password]`).toArray();
              secret_config.map(function(elem) {
              	let cur = $(elem);
              	cur.parent('node').remove();
              }); */
              //add cancel icon to nodes with secret icon, and replace attr values.

              var secret_config = $("node[TEXT=config] icon[BUILTIN=password]").toArray();
              secret_config.map(function (elem) {
                var cur = $(elem);
                var dad = cur.parent('node');
                dad.remove();
                /*dad.find('attribute').map(function(a,a_elem) {
                	let att = $(a_elem);
                	att.attr('VALUE','xxxx');
                });
                dad.append(`<icon BUILTIN="button_cancel"/>`);*/
              }); //return modified

              return $.html();
            }); // save dsl git file

            if (typeof _this.x_config.dsl_git === 'boolean') {
              //tmp.dsl_git_path = path.join(tmp.directory,'dsl_git');
              _this.x_console.outT({
                message: "creating git compatible DSL",
                color: 'green'
              });

              tmp.dsl_git_path = tmp.directory;

              _this.debug("dsl_git dir", tmp.dsl_git_path);
              /*try { 
              	await fs.mkdir(tmp.dsl_git_path);
              } catch(cpath_err) {}*/
              //get dsl filename - this.x_flags.dsl


              var git_target = path.join(tmp.dsl_git_path, path.basename(_this.x_flags.dsl).replace('.dsl', '_git.dsl')); //,path.basename(this.x_flags.dsl)

              yield fs.writeFile(git_target, for_git, 'utf-8');

              _this.debug("dsl_git file saved as: ".concat(git_target));

              _this.x_console.outT({
                message: "ready github compatible DSL",
                color: 'green'
              }); //

            } else if (typeof _this.x_config.dsl_git === 'function') {
              // if dsl_git is a function, call it with out ready content; maybe to send it though sockets, further processing or saving in a diferent location
              _this.debug("calling dsl_git custom method ".concat(_this.x_config.dsl_git.name));

              yield _this.x_config.dsl_git(for_git);
            } //

          } //reparse dsl without cancelled nodes


          _this.dsl_parser = new dsl_parser({
            file: _this.x_flags.dsl,
            config: {
              cancelled: false,
              debug: false
            }
          });

          try {
            yield _this.dsl_parser.process();
          } catch (d_err2) {} //config persistant cache


          _this.x_console.outT({
            message: "configuring cache ..",
            color: 'cyan'
          });

          _this.cache = require('node-persist');
          var cache_path = path.join(tmp.directory, '.concepto', '.dsl_cache');
          yield _this.cache.init({
            dir: cache_path,
            expiredInterval: 3 * 60 * 60 * 1000 //expire within 2hrs 

          });

          if (_this.x_config.clean && _this.x_config.clean == true) {
            _this.x_console.outT({
              message: "cleaning cache as requested ..",
              color: 'brightCyan'
            });

            yield _this.cache.clear();
          } //diff_from arg (creates {class}_diff.dsl)


          if (_this.x_config.diff_from) {
            yield* function* () {
              var show_debug = _this.x_config.debug;

              _this.x_console.outT({
                message: "(as requested) creating ".concat(_this.x_config.class, "_diff.dsl map from ").concat(_this.x_config.diff_from),
                color: 'brightCyan'
              });

              var fs = require('fs').promises,
                  path = require('path'); //read non _git .dsl file source


              var non_git = path.join(tmp.directory, path.basename(_this.x_flags.dsl).replace('_git.dsl', '.dsl'));
              if (show_debug) _this.debug("diff_from: reading 'non git' file ".concat(non_git));
              yield fs.readFile(non_git, 'utf-8'); //read given diff_from file

              var from_dsl = path.resolve(_this.x_config.diff_from);
              if (show_debug) _this.debug("diff_from: reading 'diff_from' file ".concat(from_dsl));
              yield fs.readFile(from_dsl, 'utf-8'); //create _diff.dsl file

              var diff_dsl = path.join(tmp.directory, path.basename(_this.x_flags.dsl).replace('_git.dsl', '.dsl').replace('.dsl', '_diff.dsl'));
              if (show_debug) _this.debug("diff_from: future target ".concat(diff_dsl)); //@todo clean CREATED and MODIFIED dates and FOLDED attributos from from_content and non_git_content, before getting differences

              var files = {};
              if (show_debug) _this.debug("diff_from: cleaning: pre-processing diff_from");
              files.from_parser = new dsl_parser({
                file: from_dsl,
                config: {
                  cancelled: false,
                  debug: false
                }
              });

              try {
                yield files.from_parser.process();
              } catch (d_err) {}

              if (show_debug) _this.debug("diff_from: cleaning: removing properties for diff");
              files.from_parser.$("node").each(function (i, elem) {
                var me = files.from_parser;
                me.$(elem).attr("CREATED", "1552681669876");
                me.$(elem).attr("MODIFIED", "1552681669876");
                me.$(elem).removeAttr("VSHIFT");
                me.$(elem).removeAttr("HGAP");
                me.$(elem).removeAttr("FOLDED");
                me.$(elem).removeAttr("STYLE");
              }); //remove attribute_layout tags from comparision

              if (show_debug) _this.debug("diff_from: cleaning: removing attribute_layout for diff");
              files.from_parser.$("attribute_layout").each(function (i, elem) {
                files.from_parser.$(elem).replaceWith('');
              });
              files.from_compare = files.from_parser.$.html();
              if (show_debug) _this.debug("diff_from: cleaning: pre-processing non_git");
              files.ng_parser = new dsl_parser({
                file: non_git,
                config: {
                  cancelled: false,
                  debug: false
                }
              });

              try {
                yield files.ng_parser.process();
              } catch (d_err) {}

              files.ng_compare_bak = files.ng_parser.$.html();
              if (show_debug) _this.debug("diff_from: cleaning: removing properties for diff");
              files.ng_parser.$("node").each(function (i, elem) {
                var me = files.ng_parser;
                me.$(elem).attr("CREATED", "1552681669876");
                me.$(elem).attr("MODIFIED", "1552681669876");
                me.$(elem).removeAttr("VSHIFT");
                me.$(elem).removeAttr("HGAP");
                me.$(elem).removeAttr("FOLDED");
                me.$(elem).removeAttr("STYLE");
              }); //remove attribute_layout tags from comparision

              if (show_debug) _this.debug("diff_from: cleaning: removing attribute_layout for diff");
              files.ng_parser.$("attribute_layout").each(function (i, elem) {
                files.ng_parser.$(elem).replaceWith('');
              });
              files.ng_compare = files.ng_parser.$.html(); //get differences
              //let compare = await this.dsl_parser.getDifferences(from_content,non_git_content);

              if (show_debug) _this.debug("diff_from: detecting remaining differences");
              var compare = yield _this.dsl_parser.getDifferences(files.from_compare, files.ng_compare); //if (show_debug) this.debug(`diff_from: raw differences`,compare);
              // reparse.... @todo improve!!!! ... this is just a hack to maintain original format and dates without taking those into account for the diff

              if (show_debug) _this.debug("diff_from: reparsing from_dsl and non_git files");
              files.from_parser = new dsl_parser({
                file: from_dsl,
                config: {
                  cancelled: false,
                  debug: false
                }
              });

              try {
                yield files.from_parser.process();
              } catch (d_err) {}

              files.from_compare = files.from_parser.$.html();
              files.ng_parser = new dsl_parser({
                file: non_git,
                config: {
                  cancelled: false,
                  debug: false
                }
              });

              try {
                yield files.ng_parser.process();
              } catch (d_err) {}

              files.ng_compare = files.ng_parser.$.html(); //

              var diff = {
                content: ''
              }; //parse diff content

              diff.parser = files.ng_parser;
              diff.content = files.ng_compare; //diff.parser.$.html();
              //remove all previous clouds from diff.content

              if (show_debug) _this.debug("diff_from: cleaning: removing existing cloud tags");
              var clouds = diff.parser.$("cloud");
              clouds.each(function (i, elem) {
                var cur = diff.parser.$(elem);
                cur.replaceWith('');
              }); //for each added IDs, search and add a Green CLOUD (#d9f7be, green-2)

              if (show_debug) _this.debug("diff_from: adding green clouds to ".concat(Object.keys(compare.added).length, " new nodes"));

              for (var key in compare.added) {
                diff.content = yield diff.parser.editNode({
                  node_id: key,
                  children: true,
                  data: function data(x) {
                    return {
                      text_note_html: {
                        p: ['ADDED NODE', x.text_note]
                      },
                      cloud: {
                        used: true,
                        bgcolor: '#d9f7be'
                      }
                    };
                  }
                }); // get first dad node of 'key' to highlight it as containing a diff

                /*let dads = await diff.parser.getParentNodesIDs({ id:key, array:true });
                let first_node = dads.pop();
                diff.content = await diff.parser.editNode({ node_id:first_node, 
                	data:{
                			text_note: `!! THIS NODE CONTAINS A *NEW* NODE INSIDE !!`,
                			cloud: {
                				used:true,
                				bgcolor:'#f6ffed' //green-1
                			}
                		}
                });*/
              } //for each modified IDs, search and add a Yellow CLOUD (gold-2)


              var from = {};
              from.parser = files.from_parser;
              /*if (show_debug) this.debug(`diff_from: grouping ${Object.keys(compare.modified).length} modified nodes`);				
              for (let key in compare.modified) {
              	let parents = await from.parser.getParentNodesIDs({ id:key, array:true });
              	let modified = Object.keys(compare.modified);
              	let intersect = this.array_intersect(parents,modified);
              	if (intersect.length>0) {
              		//there is a dad of ourself within compare.modified; erase ourselfs
              		delete compare.modified[key];
              	}
              };*/

              if (show_debug) _this.debug("diff_from: adding yellow clouds to ".concat(Object.keys(compare.modified).length, " modified nodes"));

              var _loop = function* _loop(_key) {
                diff.content = yield diff.parser.editNode({
                  node_id: _key,
                  children: true,
                  data: function data(x) {
                    return {
                      text_note_html: {
                        p: ['MODIFIED NODE', ...compare.modified[_key], x.text_note]
                      },
                      cloud: {
                        used: true,
                        bgcolor: '#fff1b8'
                      }
                    };
                  }
                }); // get first dad node of 'key' to highlight it as containing a diff

                /*
                let dads = await diff.parser.getParentNodesIDs({ id:key, array:true });
                let first_node = dads.pop();
                diff.content = await diff.parser.editNode({ node_id:first_node, 
                	data:{
                			text_note: `!! THIS NODE CONTAINS A *MODIFIED* NODE INSIDE !!`,
                			cloud: {
                				used:true,
                				bgcolor:'#fffbe6' //gold-1
                			}
                		}
                });*/
              };

              for (var _key in compare.modified) {
                yield* _loop(_key);
              } //for each deleted IDs, get deleted nodes from the source and add it to diff with a red CLOUD
              //21jun21: get parents of each deleted id, if any parent is within the deleted keys, remove the tested id


              if (show_debug) _this.debug("diff_from: grouping ".concat(Object.keys(compare.deleted).length, " deleted nodes"));

              for (var _key2 in compare.deleted) {
                var parents = yield from.parser.getParentNodesIDs({
                  id: _key2,
                  array: true
                });
                var deleted = Object.keys(compare.deleted);

                var intersect = _this.array_intersect(parents, deleted);

                if (intersect.length > 0) {
                  //there is a dad of ourself within compare.deleted; erase ourselfs
                  delete compare.deleted[_key2];
                }
              }

              if (show_debug) _this.debug("diff_from: recovering ".concat(Object.keys(compare.deleted).length, " deleted nodes and adding them as red cloud nodes"));

              if (Object.keys(compare.deleted).length > 0) {
                // get deleted node from 'from_dsl' source file
                //process
                for (var _key3 in compare.deleted) {
                  var deleted_node = yield from.parser.getNode({
                    id: _key3,
                    recurse: true
                  });
                  deleted_node.icons = [...deleted_node.icons, 'button_cancel'];
                  deleted_node.cloud = {
                    used: true,
                    bgcolor: '#ffa39e'
                  };
                  deleted_node.text_note_html = {
                    p: ['!! DELETED NODE !!', '', deleted_node.text_note]
                  }; // get parent node of deleted_node (to add it to that location within diff)

                  var dad = yield from.parser.getParentNode({
                    id: _key3
                  }); // add deleted_node as a child of dad within diff

                  diff.content = yield diff.parser.addNode({
                    parent_id: dad.id,
                    node: deleted_node
                  });
                }
              } //console.log('new diff content',diff.content);
              //console.log('compare results',compare);
              //save new eb_diff.dsl content from differences


              if (show_debug) _this.debug("diff_from: writing _diff.dsl file");

              try {
                yield fs.writeFile(diff_dsl, diff.content, 'utf-8', {
                  flag: 'w'
                }); //overwrite by default
              } catch (errwr) {
                //delete existing file and write again
                if (show_debug) _this.debug("diff_from: error writing _diff.dsl file", errwr);
              }

              _this.x_console.outT({
                message: "(as requested) file ".concat(_this.x_config.class, "_diff.dsl created"),
                color: 'brightCyan'
              }); //console.log('compare',compare);
              //process.exit(1000);

            }();
          } //export_html arg (creates an html representation of given dsl file)


          if (_this.x_config.export_html) {
            _this.x_console.outT({
              message: "(as requested) creating html version map to ".concat(_this.x_config.export_html),
              color: 'brightCyan'
            });

            var _fs = require('fs').promises,
                _path = require('path'); //use given dsl not, non git -> this.x_flags.dsl
            //transform path given to abs path


            var target_path = _path.join(tmp.directory, 'out'); //set default target path


            if (_this.x_config.export_html != '') {
              target_path = _path.resolve(_this.x_config.export_html);
            } //create target path if it doesn't exist


            try {
              yield _fs.mkdir(target_path);
            } catch (cpath_err) {} //get our assets path


            var concepto_loc = _path.dirname(require.resolve('concepto/package.json'));

            var export_ = _path.join(concepto_loc, 'lib', 'export');

            var runtime_ = _path.join(export_, 'runtime'); //copy runtime assets to target_path


            var copy = require('recursive-copy');

            try {
              yield copy(runtime_, target_path);
            } catch (ercp) {} //transform to .dsl file to html


            var spawn = require('await-spawn');

            var target_html = _path.join(target_path, 'index.html');

            var export_xslt = _path.join(export_, 'toxhtml.xsl');

            yield spawn('xsltproc', ['-o', target_html, export_xslt, _this.x_flags.dsl], {
              cwd: tmp.directory
            });

            var sleep = function sleep(ms) {
              return new Promise(resolve => setTimeout(resolve, ms));
            };

            yield sleep(50); //search all images/assets used within generated .html

            var cheerio = require('cheerio');

            var generated_html = yield _fs.readFile(target_html, 'utf-8');
            var $ = cheerio.load(generated_html, {
              ignoreWhitespace: false,
              xmlMode: true,
              decodeEntities: false
            });
            var images = [];
            $('img[src]').toArray().map(function (elem) {
              var src = $(elem).attr('src');

              if (src.charAt(0) != '.' && images.includes(src) == false) {
                var full_ = _path.join(tmp.directory, src);

                images.push(full_);
              }
            }); //copy existing found images to target_path

            for (var x of images) {
              var y = x.replace(tmp.directory, '');

              var target = _path.join(target_path, y);

              try {
                //console.log(`copying ${x} to ${target}`);
                yield copy(x, target);
              } catch (ercp) {}
            } //copy existing found images to target_path - , data:{images,concepto_loc,export_,runtime_,target_path}


            _this.x_console.outT({
              message: "export ready",
              color: 'brightGreen'
            }); //process.exit(1500);
            //ready

          } // continue


          if (_this.x_config.justgit && _this.x_config.justgit == true) {
            _this.x_console.out({
              message: "Stopping after creating DSL GIT version as requested!",
              color: 'brightYellow'
            });

            process.exit(1);
          } else {
            _this.x_flags.init_ok = true;

            try {
              yield _this.onInit();
            } catch (eeee) {
              _this.x_console.out({
                message: "onInit() ".concat(eeee),
                color: 'red'
              });
            }
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
        var x_cmds_hashes = {},
            x_watches = {},
            watched_vars = {};

        var safe = require('safe-eval');

        for (var x in _this4.x_commands) {
          if (_this4.x_commands[x].x_watch) {
            var watched = _this4.x_commands[x].x_watch.split(',');

            for (var xi in watched) {
              var key = watched[xi];

              if (key.includes('x_state.')) {
                //this is a var value watch, not command
                if (!watched_vars[x]) watched_vars[x] = {};

                try {
                  watched_vars[x][key.trim()] = safe('this.' + key.trim(), _this4);
                } catch (doesnt_exist) {
                  watched_vars[x][key.trim()] = '';
                }
              } else {
                x_watches[watched[xi].trim()] = x;
              }
            }
          }

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
        var watched_vars_hash_now = yield _this4.dsl_parser.hash(watched_vars);
        var watched_vars_hash_cache = yield _this4.cache.getItem('watched_vars_cache');
        var watched_vars_cache = yield _this4.cache.getItem('watched_vars'); //console.log('PABLO debug: watched_vars_now',{current:watched_vars,cache:watched_vars_cache});

        _this4.x_console.outT({
          prefix: 'cache,yellow',
          message: "x_commands hash: ".concat(commands_hash),
          color: 'dim'
        });

        if (commands_cache != commands_hash || watched_vars_hash_now != watched_vars_hash_cache) {
          if (typeof commands_cached_hashes === 'object') {
            //compare which x_commands changed
            for (var _x in x_cmds_hashes) {
              if (_x in commands_cached_hashes && commands_cached_hashes[_x] != x_cmds_hashes[_x]) {
                changed_x_cmds.push(_x); // search x within x_watches, if x is found, also add that cmd (value) to be cleaned from cache

                if (_x in x_watches) {
                  if (!changed_x_cmds.includes(x_watches[_x])) {
                    changed_x_cmds.push(x_watches[_x]);
                  }
                }
              } // search x (cmd) is within watched_vars_cache, search var keys: if value of varkey in cache if diff from actual value, erase cmd from cache


              if (watched_vars_cache && _x in watched_vars_cache && _x in watched_vars) {
                for (var varkey in watched_vars_cache[_x]) {
                  if (watched_vars[_x][varkey] != watched_vars_cache[_x][varkey]) {
                    _this4.x_console.outT({
                      prefix: 'cache,yellow',
                      message: "watched var value by ".concat(_x, " changed! requesting rebuild of its instances"),
                      color: 'brightYellow'
                    });

                    changed_x_cmds.push(_x);
                  }
                }
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
              var amount_cleaned = 0;

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
                    amount_cleaned += 1;
                  }
                }
              } //sleep a little depending on how much was clen...


              var sleep = function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
              };

              yield sleep(5 * amount_cleaned); //
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


          yield _this4.cache.setItem('watched_vars', watched_vars);
          yield _this4.cache.setItem('watched_vars_hash_now', watched_vars_hash_now);
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

          _objectSpread2({}, command_requires1);

          var command_defaults = _objectSpread2({}, command_requires1);

          var def_matched = setObjectKeys(keys, true);
          delete _this5.x_commands['constructor']; //4-jun-21 @todo double check this; maybe we should use a cloned var
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
                yield setImmediatePromise$1();
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

                yield setImmediatePromise$1();
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

                yield setImmediatePromise$1();
              }

              _this5.debug_timeEnd({
                id: "".concat(key, " x_not_text_contains")
              });
            } // test 5: x_empty (node keys that must be empty (undefined also means not empty))


            if (command_requires['x_empty'] != '' && allTrue(matched, keys)) {
              _this5.debug_time({
                id: "".concat(key, " x_empty")
              });

              for (var _key4 of command_requires['x_empty'].split(',')) {
                var _testpath = getVal(node, _key4);

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

                yield setImmediatePromise$1();
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

                for (var _key5 of command_requires['x_text_contains'].split('|')) {
                  if (node.text.indexOf(_key5) != -1) {
                    n_match = true;
                    break;
                  }
                }

                matched.x_text_contains = n_match;
              } else if (command_requires['x_text_contains'].indexOf(',') != -1) {
                // 'and' delimiter
                for (var _key6 of command_requires['x_text_contains'].split(',')) {
                  if (node.text.indexOf(_key6) == -1 || _key6 == '' && node.text.indexOf(',') == -1) {
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

              for (var _key7 of command_requires['x_or_isparent'].split(',')) {
                is_direct = yield _this5.isExactParentID(node.id, _key7);
                if (is_direct == true) break;
                yield setImmediatePromise$1();
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


            yield setImmediatePromise$1();
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
          var reply = {}; //this.debug('findValidCommand, before findCommand for node '+node.id);

          var commands_ = yield _this6.findCommand({
            node,
            justone: false,
            show_debug: show_debug
          }); //this.debug('findValidCommand, after findCommand for node '+node.id);
          // @TODO debug and test

          if (commands_.length == 0) {
            _this6.debug({
              message: 'findValidCommand: no command found.',
              color: 'red'
            });

            reply.error = true;
            reply.catch = 'no command found';
          } else if (commands_.length == 1 && commands_[0].x_id != 'constructor') {
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
                color: 'brightRed'
              });
              yield _this6.showLineError(test_err); // @TODO emit('internal_error','findValidCommand')

              reply.error = true;
              reply.valid = false;
              reply.catch = test_err; //throw new Error(`executing ${reply.x_id}:`+test_err); // @TODO we should throw an error, so our parents catch it (9-AGO-20)
            }
          } else {
            // more than one command found
            if (show_debug) _this6.debug({
              message: "findValidCommand: ".concat(commands_.length, " commands found: (nodeid:").concat(node.id, ")"),
              color: 'green'
            }); // test each command

            for (var qm_index in commands_) {
              var qm = commands_[qm_index];

              if (_this6.x_commands[qm.x_id]) {
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
                    color: 'red'
                  });
                  yield _this6.showLineError(test_err1);
                  reply.error = true;
                  reply.valid = false;
                  reply.catch = test_err1; // @TODO we should throw an error, so our parents catch it (9-AGO-20) and break the loop
                }
              }

              yield setImmediatePromise$1();
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

        if (!_this7.x_config.debug && !_this7.x_config.silent) {
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
                data.bar = data.funcs.colors.brightRed(data.bar);
                data.text = data.funcs.colors.brightRed('processing error'); //+' '+data.funcs.symbols.fail;

                if (data.screen) data.screen = data.funcs.colors.brightRed(data.screen);
                return data;
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
          if (!_this7.x_config.debug && !_this7.x_config.silent) {
            if (_this7.progress_last) _this7.progress_last.raw().stop();
            _this7.progress_multi[level2.text] = _this7.multibar.create(level2.nodes_raw.length - 1, {
              total_: '',
              screen: 'initializing..',
              error: false
            });

            _this7.progress_multi['_total_'].update(counter_, {
              total_: 'x',
              screen: level2.text,
              error: false
            });

            _this7.progress_last = _this7.progress_multi[level2.text];
            _this7.progress_last_screen = level2.text;
          } //cache: check if current node has any children that were modified since last time


          var main = yield _this7.cache.getItem(level2.hash_content); // remove await when in production (use Promise.all after loop then)

          if (!main) {
            var before_state = JSON.parse(JSON.stringify(_this7.x_state));
            main = yield _this7.process_main(level2, {});
            var state_to_save = obj_diff(before_state, _this7.x_state); //console.log('state_to_save',{ state_to_save });

            if (main.error && main.error == true) {
              //don't add main to cache if there was an error processing its inside.
              resp.nodes.push(main);
              break;
            } else {
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


          if (!_this7.x_config.debug && !_this7.x_config.silent) {
            if (main.error && main.error == true) {
              //this.progress_multi['_total_'].update(counter_, { screen:'ERROR', error:true });
              //break;
              _this7.progress_multi[level2.text].raw().stop();
            } else {
              _this7.progress_multi[level2.text].total(level2.nodes_raw.length - 1);

              _this7.progress_multi[level2.text].update(level2.nodes_raw.length - 1, {
                screen: level2.text,
                sub: '',
                total_: ''
              });
            }
          } // append to resp


          resp.nodes.push(main);
          yield setImmediatePromise$1();
          counter_ += 1;
        }

        if (!_this7.x_config.debug && !_this7.x_config.silent) {
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
            titleColor: 'brightRed',
            color: 'red'
          }); //await this.onErrors(errs);
          //this.debug_table('Amount of Time Per Command');

        } // some debug
        //this.debug('after nodes processing, resp says:',resp);
        //this.debug('app state says:',this.x_state);


        yield _this7.cache.setItem('last_compile_date', new Date()); //add meta cache to cache

        yield _this7.cache.setItem('meta_cache', meta_cache);
        yield _this7.onEnd();
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

          if (!_this8.x_config.debug && !_this8.x_config.silent) {
            _this8.progress_last.total(sub_nodes.length - 1); //this.progress_multi['_total_'].raw().updateETA();

          }

          for (var sublevel of sub_nodes) {
            xx += 1; //this.debug('sub_process before getNode sublevel.id:'+sublevel.id);

            var real = yield _this8.dsl_parser.getNode({
              id: sublevel.id,
              nodes_raw: true,
              recurse: false
            }); //this.debug('sub_process before findValidCommand node id:'+real.id);

            var real2 = yield _this8.findValidCommand({
              node: real,
              object: false,
              x_command_shared_state: new_state
            });

            if (!_this8.x_config.debug && !_this8.x_config.silent) {
              _this8.progress_last.update(xx, {
                screen: _this8.progress_last_screen,
                sub: real2.x_id,
                total_: ''
              });
            } //this.debug('sub_process after findValidCommand');
            //console.log('sub_process->findValidCommand node:'+real.text,real2);
            //if (nodei.state) new_state = {...new_state, ...nodei.state, ...real2.state}; // inherint state from last command if defined


            if (real2.state) new_state = _objectSpread2(_objectSpread2({}, new_state), real2.state); // inherint state from last command if defined

            if (real2 && real2.exec && real2.exec.valid == true) {
              //resp.children.push(real2.exec);
              if (real2.exec.state) new_state = _objectSpread2(_objectSpread2({}, new_state), real2.exec.state); //console.log('real2 dice:',real2);

              resp.init += real2.exec.init;
              resp.code += real2.exec.open;
              if (!resp.x_ids) resp.x_ids = [];
              resp.x_ids.push(real2.x_id); //this.debug('sub_process before new sub_process sublevel id:'+sublevel.id);

              resp = yield _this8.sub_process(resp, sublevel, new_state);
              resp.code += real2.exec.close;
            } else if (real2.error == true) {
              if (!_this8.x_config.debug && !_this8.x_config.silent) {
                _this8.progress_last.total(xx);

                _this8.progress_last.update(xx, {
                  screen: _this8.progress_last_screen,
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

            yield setImmediatePromise$1();
          }
        }

        return resp;
      })();
    }

    showLineError(error) {
      var _this9 = this;

      return _asyncToGenerator(function* () {
        var error_info = {
          line: -1,
          col: -1,
          message: error.toString()
        };
        var raw_tmp = error.stack;

        var print_code = require('print-code');

        if (typeof raw_tmp == 'string' && raw_tmp.includes('commands.js')) {
          var extract = require('extractjs')();

          var elements = extract("at {path}commands.js:{line}:{col}\n", raw_tmp);

          if (elements.path.includes(' (')) {
            elements = extract(" ({path}commands.js:{line}:{col}\n", raw_tmp);
          } //console.log('Pablo debug - showLine elements',elements);


          error_info.file = elements.path + 'commands.js';
          error_info.line = elements.line;
          error_info.col = elements.col;
        }

        if (error_info.file && (yield _this9.exists(error_info.file)) == true) {
          var fs = require('fs').promises;

          var colors = require('colors/safe'); //try {


          var cmds_code = yield fs.readFile(error_info.file, 'utf-8');
          var toshow = print_code(cmds_code).highlight(error_info.line, error_info.line).slice(error_info.line - 3, error_info.line + 4).max_columns(200).arrow_mark(error_info.line, error_info.col).get();

          _this9.x_console.out({
            message: 'An error ocurred on file:',
            color: 'red'
          });

          _this9.x_console.out({
            message: error_info.file,
            color: 'brightCyan'
          });

          _this9.x_console.out({
            message: error_info.message,
            color: 'brightYellow'
          });

          console.log(colors.bgBlack(colors.yellow(toshow))); //this.x_console.out({ message:'\n \n'+toshow, color:'dim' });
          //}
        } else {
          console.log('referenced file with error not found', raw_tmp);
        } //

      })();
    }

    process_main(node, custom_state) {
      var _this10 = this;

      return _asyncToGenerator(function* () {
        var resp = {
          state: custom_state,
          id: node.id,
          name: yield _this10.onDefineNodeName(node),
          file: yield _this10.onDefineFilename(node),
          init: '',
          title: yield _this10.onDefineTitle(node),
          attributes: node.attributes,
          code: '',
          open: '',
          close: '',
          x_ids: [],
          subnodes: node.nodes_raw.length
        };

        if (_this10.x_config.debug && !_this10.x_config.silent) {
          _this10.x_console.outT({
            prefix: 'process,yellow',
            message: "processing node ".concat(node.text, " .."),
            color: 'yellow'
          });
        } //
        //try {
        //console.log('process_main->findValidCommand node:'+node.text);


        var copy_state = _objectSpread2({}, custom_state);

        var test = yield _this10.findValidCommand({
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
            resp = yield _this10.sub_process(resp, node, copy_state);
          }

          resp.code += resp.close;
          resp.x_ids = resp.x_ids.join(',');
        } else if (test.error == true) {
          _this10.x_console.outT({
            message: "node text: ".concat(node.text),
            color: 'red'
          }); //this.x_console.outT({ message:`error: Executing func x_command:${test.x_id} for node: id:${node.id}, level ${node.level}, text: ${node.text}.`, data:{ id:node.id, level:node.level, text:node.text, catch:test.catch, x_command_state:test.state }});


          yield _this10.onErrors(["Error executing func for x_command:".concat(test.x_id, " for node id ").concat(node.id, ", text: ").concat(node.text, " ")]);

          if (!_this10.x_config.debug && !_this10.x_config.silent) {
            _this10.progress_last.total(2);

            _this10.progress_last.update(1, {
              screen: _this10.progress_last_screen + '\n',
              error: true
            });
          } // improved error logging


          yield _this10.showLineError(test.catch);
          resp.valid = false, resp.hasChildren = false, resp.error = true;
        } else {
          _this10.x_console.outT({
            message: 'error: FATAL, no method found for node processing.',
            data: {
              id: node.id,
              level: node.level,
              text: node.text
            }
          });

          yield _this10.onErrors(["No method found for given node id ".concat(node.id, ", text: ").concat(node.text, " ")]);
          resp.valid = false, resp.hasChildren = false, resp.error = true;
        } // closing level2 'on' calls


        resp = yield _this10.onAfterProcess(resp);
        resp = yield _this10.onCompleteCodeTemplate(resp); //

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

      if (this.x_config.debug && params.time && !this.x_config.silent) {
        this.x_console.outT(_objectSpread2(_objectSpread2({}, {
          prefix: 'debug,dim',
          color: 'dim'
        }), params));
      } else if (this.x_config.debug && !this.x_config.silent) {
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
          _this11 = this;

      return _asyncToGenerator(function* () {
        var compile_folder = _arguments3.length > 1 && _arguments3[1] !== undefined ? _arguments3[1] : _this11.x_state.central_config.apptitle;
        var output_dir = _arguments3.length > 2 ? _arguments3[2] : undefined;

        var fs = require('fs').promises;

        _this11.debug('_appFolders');

        var path = require('path');

        var dsl_folder = path.dirname(path.resolve(_this11.x_flags.dsl)) + path.sep;
        if (output_dir) dsl_folder = output_dir;
        var resp = {
          base: dsl_folder,
          src: dsl_folder + (compile_folder ? compile_folder : _this11.x_state.central_config.apptitle) + path.sep
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
          } else if (this.x_config.debug == true && !this.x_config.silent) {
            this.x_console.time(_objectSpread2({}, arguments[0]));
          }
        } else if (this.x_config.debug == true && !this.x_config.silent) {
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
    * Helper to test if a given file exists or not
    * @param {string} 		dir_or_file 	- full directory or file to test
    * @return {boolean}
    */


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
        } else if (this.x_config.debug == true && !this.x_config.silent) {
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
          _this12 = this;

      return _asyncToGenerator(function* () {
        var id = _arguments4.length > 0 && _arguments4[0] !== undefined ? _arguments4[0] : _this12.throwIfMissing('id-brotherID');
        var x_id = _arguments4.length > 1 && _arguments4[1] !== undefined ? _arguments4[1] : _this12.throwIfMissing('x_id');

        // @TODO test it after having 'real' commands on some parser 3-ago-20
        if (id + x_id in _this12.x_memory_cache.hasBrotherID) {
          return _this12.x_memory_cache.hasBrotherID[id + x_id];
        } else {
          var brother_ids = yield _this12.dsl_parser.getBrotherNodesIDs({
            id,
            before: true,
            after: true
          }).split(',');
          var brother_x_ids = [],
              resp = false;

          for (var q of brother_ids) {
            var node = yield _this12.dsl_parser.getNode({
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


          _this12.x_memory_cache.hasBrotherID[id + x_id] = resp;
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
          _this13 = this;

      return _asyncToGenerator(function* () {
        var id = _arguments5.length > 0 && _arguments5[0] !== undefined ? _arguments5[0] : _this13.throwIfMissing('id-brotherBefore');

        if (id in _this13.x_memory_cache.hasBrotherBefore) {
          return _this13.x_memory_cache.hasBrotherBefore[id];
        } else {
          var brother_ids = yield _this13.dsl_parser.getBrotherNodesIDs({
            id,
            before: true,
            after: false
          }).split(',');
          _this13.x_memory_cache.hasBrotherBefore[id] = brother_ids.includes(id);
          return _this13.x_memory_cache.hasBrotherBefore[id];
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
          _this14 = this;

      return _asyncToGenerator(function* () {
        var id = _arguments6.length > 0 && _arguments6[0] !== undefined ? _arguments6[0] : _this14.throwIfMissing('id - BrotherNext');

        if (id in _this14.x_memory_cache.hasBrotherNext) {
          return _this14.x_memory_cache.hasBrotherNext[id];
        } else {
          var brother_ids = yield _this14.dsl_parser.getBrotherNodesIDs({
            id,
            before: false,
            after: true
          }).split(',');
          _this14.x_memory_cache.hasBrotherNext[id] = brother_ids.includes(id);
          return _this14.x_memory_cache.hasBrotherNext[id];
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
          _this15 = this;

      return _asyncToGenerator(function* () {
        var id = _arguments7.length > 0 && _arguments7[0] !== undefined ? _arguments7[0] : _this15.throwIfMissing('id-ExactParent');
        var x_id = _arguments7.length > 1 && _arguments7[1] !== undefined ? _arguments7[1] : _this15.throwIfMissing('x_id');

        // @TODO test it after having 'real' commands on some parser 4-ago-20
        if (id + x_id in _this15.x_memory_cache.isExactParentID) {
          return _this15.x_memory_cache.isExactParentID[id + x_id];
        } else {
          var parent_node = yield _this15.dsl_parser.getParentNode({
            id
          });
          var parent_command = yield _this15.findValidCommand({
            node: parent_node,
            show_debug: false,
            object: true
          });

          if (parent_command && parent_command.x_id == x_id) {
            _this15.x_memory_cache.isExactParentID[id + x_id] = true;
            return true;
          }

          _this15.x_memory_cache.isExactParentID[id + x_id] = false;
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
          _this16 = this;

      return _asyncToGenerator(function* () {
        var id = _arguments8.length > 0 && _arguments8[0] !== undefined ? _arguments8[0] : _this16.throwIfMissing('id-ParentID');
        var x_id = _arguments8.length > 1 && _arguments8[1] !== undefined ? _arguments8[1] : _this16.throwIfMissing('x_id');
        var onlyTrueIfAll = _arguments8.length > 2 && _arguments8[2] !== undefined ? _arguments8[2] : false;
        // @TODO test it after having 'real' commands on some parser aug-4-20, fixed on aug-15-20
        var x_ids = x_id.split(',');
        var parents = yield _this16.dsl_parser.getParentNodesIDs({
          id,
          array: true
        });
        var tested_parents_x_ids = [];

        for (var parent_id of parents) {
          var node = yield _this16.dsl_parser.getNode({
            id: parent_id,
            recurse: false
          });
          var parentCommand = yield _this16.findValidCommand({
            node,
            show_debug: false,
            object: true
          });

          if (onlyTrueIfAll == false && x_ids.includes(parentCommand.x_id)) {
            return true;
          } else if (onlyTrueIfAll == false) ; else if (onlyTrueIfAll == true) {
            // onlyTrueIfAll==true
            tested_parents_x_ids.push(parentCommand.x_id);

            if (_this16.array_intersect(tested_parents_x_ids, x_ids).length == x_ids.length) {
              return true;
            }
          }
        } // test again if we are here


        if (_this16.array_intersect(tested_parents_x_ids, x_ids).length == x_ids.length) {
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
          _this17 = this;

      return _asyncToGenerator(function* () {
        var id = _arguments9.length > 0 && _arguments9[0] !== undefined ? _arguments9[0] : _this17.throwIfMissing('id-ParentIDs');
        var array = _arguments9.length > 1 && _arguments9[1] !== undefined ? _arguments9[1] : false;
        // @TODO test it after having 'real' commands on some parser 4-ago-20
        var parents = yield _this17.dsl_parser.getParentNodesIDs({
          id,
          array: true
        });
        var resp = [];

        for (var parent_id of parents) {
          var node = yield _this17.dsl_parser.getNode({
            id: parent_id,
            recurse: false
          });
          var command = yield _this17.findValidCommand({
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
          _this18 = this;

      return _asyncToGenerator(function* () {
        var id = _arguments10.length > 0 && _arguments10[0] !== undefined ? _arguments10[0] : _this18.throwIfMissing('id - ParentIDs2Array');
        return yield _this18.getParentIDs(id, true);
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
          _this19 = this;

      return _asyncToGenerator(function* () {
        var id = _arguments11.length > 0 && _arguments11[0] !== undefined ? _arguments11[0] : _this19.throwIfMissing('id - ParentIDs2ArrayWXID');
        // this is only used in ti.cfc: def_textonly (just for back-compatibility in case needed);
        // @deprecated 4-ago-2020
        var parents = yield _this19.getParentIDs(id, true);
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
      var struct = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.throwIfMissing('id - struct2params');
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

  function setImmediatePromise$1() {
    //for preventing freezing node thread within loops (fors)
    return new Promise(resolve => {
      setImmediate(() => resolve());
    });
  } // end: private helper methods

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
        var ci = require('ci-info');

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
          if (ci.isCI == false) {
            npm.build = yield spawn('npm', ['run', 'build'], {
              cwd: _this3.context.x_state.dirs.app
            });
          } else {
            npm.build = yield spawn('npm', ['run', 'build'], {
              cwd: _this3.context.x_state.dirs.app,
              stdio: 'inherit'
            });
          }

          spinner.succeed('Project built successfully');
        } catch (nb) {
          npm.build = nb;
          spinner.fail('Build failed');

          if (ci.isCI == false) {
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
          }

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

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
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

    base_build() {
      var _this = this;

      return _asyncToGenerator(function* () {
        // builds the project
        var ci = require('ci-info');

        var spawn = require('await-spawn'),
            path = require('path'),
            fs = require('fs').promises; //let ora = require('ora');


        var node_modules_final = path.join(_this.context.x_state.dirs.app, 'node_modules');
        var node_package = path.join(_this.context.x_state.dirs.app, 'package.json');
        var npm = {},
            errors = [];

        _this.context.x_console.outT({
          message: "Building project",
          color: 'cyan'
        });

        var spinner = _this.context.x_console.spinner({
          message: 'Building project'
        });

        var node_modules_exist = yield _this.exists(node_modules_final);
        var node_package_exist = yield _this.exists(node_package);

        if (node_modules_exist && node_package_exist) {
          //test if every package required is within node_modules
          spinner.start("Some npm packages where installed; checking ..");
          var pkg = JSON.parse(yield fs.readFile(node_package, 'utf-8'));
          var all_ok = true;

          for (var pk in pkg.dependencies) {
            var tst_dir = path.join(_this.context.x_state.dirs.app, 'node_modules', pk);
            var tst_exist = yield _this.exists(tst_dir);
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
              cwd: _this.context.x_state.dirs.app
            }); //, stdio:'inherit'

            spinner.succeed("npm install succesfully");
          } catch (n) {
            npm.install = n;
            spinner.fail('Error installing npm packages');
            errors.push(n);
          }
        } // issue npm run build (just docs; not working on CI 16-jun-21)


        if (ci.isCI == false) {
          spinner.start("Building NodeJS project");

          try {
            npm.build = yield spawn('npm', ['run', 'build'], {
              cwd: _this.context.x_state.dirs.app
            });
            spinner.succeed('Project built successfully');
          } catch (nb) {
            npm.build = nb;
            spinner.fail('Build failed');

            if (ci.isCI == false) {
              _this.context.x_console.out({
                message: "Building NodeJS again to show error in console",
                color: 'red'
              }); //build again with output redirected to console, to show it to user


              try {
                console.log('\n');
                npm.build = yield spawn('npm', ['run', 'dev'], {
                  cwd: _this.context.x_state.dirs.app,
                  stdio: 'inherit',
                  timeout: 15000
                });
              } catch (eg) {}
            }

            errors.push(nb);
          }
        }

        return errors;
      })();
    }

    deploy() {
      var _this2 = this;

      return _asyncToGenerator(function* () {
        var build = {};

        _this2.context.x_console.title({
          title: 'Deploying to Amazon AWS Elastic Bean',
          color: 'green'
        });

        yield _this2.logo(); // builds the app

        build.try_build = yield _this2.base_build();

        if (build.try_build.length > 0) {
          _this2.context.x_console.outT({
            message: "There was an error building the project.",
            color: 'red'
          });

          return false;
        } // deploys to aws


        build.deploy_aws_eb = yield _this2.run(); //test if results.length>0 (meaning there was an error)

        if (build.deploy_aws_eb.length > 0) {
          _this2.context.x_console.outT({
            message: "There was an error deploying to Amazon AWS.",
            color: 'red',
            data: build.deploy_aws_eb.toString()
          });

          return false;
        }

        return true;
      })();
    }

    _createEBx_configEB() {
      var _this3 = this;

      return _asyncToGenerator(function* () {
        // create config.yml content for defining EB instance
        var eb_full = _this3.context.x_state.central_config.deploy.replaceAll('eb:', '');

        var eb_appname = eb_full;
        var eb_instance = "".concat(eb_appname, "-dev");

        if (eb_full.includes(',')) {
          eb_appname = eb_full.split(',')[0];
          eb_instance = eb_full.split(',').splice(-1)[0];
        } // create YAML


        var yaml = require('yaml');

        var data = {
          'branch-defaults': {
            master: {
              environment: eb_instance,
              group_suffix: null
            }
          },
          global: {
            application_name: eb_appname,
            branch: null,
            default_ec2_keyname: 'aws-eb',
            default_platform: 'Node.js',
            default_region: 'us-east-1',
            include_git_submodules: true,
            instance_profile: null,
            platform_name: null,
            platform_version: null,
            profile: null,
            repository: null,
            sc: 'git',
            workspace_type: 'Application'
          }
        };

        if (_this3.context.x_state.config_node.aws.region) {
          data.global.default_region = _this3.context.x_state.config_node.aws.region;
        } //write


        var path = require('path');

        var eb_base = _this3.context.x_state.dirs.app;
        var eb_dir = path.join(eb_base, '.elasticbeanstalk');
        yield _this3.context.writeFile(path.join(eb_dir, 'config.yml'), yaml.stringify(data, {
          version: '1.1'
        }));
      })();
    }

    _createEBx_configNode() {
      var _this4 = this;

      return _asyncToGenerator(function* () {
        // create 01_confignode content for setting ENV vars within EB instance
        var yaml = require('yaml');

        var data = {
          option_settings: {
            'aws:elasticbeanstalk:application:environment': {
              APP_PORT: _this4.context.x_state.central_config.port,
              CLUSTER: 1,
              START_TYPE: 'production'
            }
          }
        }; //instancetype

        if (_this4.context.x_state.central_config.instance_type) {
          data.option_settings.container_commands = {
            'aws:autoscaling:launchconfiguration': {
              InstanceType: _this4.context.x_state.central_config.instance_type
            }
          };
        } //port


        if (_this4.context.x_state.central_config.port != 8081) {
          data.container_commands = {
            '00_remove_redirect_http': {
              command: 'sudo iptables -t nat -D PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080'
            },
            '01_add_redirect_http': {
              command: "sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port ".concat(_this4.context.x_state.central_config.port)
            }
          };
          data.option_settings['aws:elasticbeanstalk:environment'] = {
            EnvironmentType: 'SingleInstance'
          };
        } //stage & env_variables


        if (_this4.context.x_state.central_config.stage && _this4.context.x_state.central_config.stage != '') {
          data.option_settings['aws:elasticbeanstalk:application:environment'].STAGE = _this4.context.x_state.central_config.stage;

          if (_this4.context.x_state.central_config.stage != 'dev') {
            data.option_settings['aws:elasticbeanstalk:application:environment'].START_TYPE = _this4.context.x_state.central_config.stage;
          }
        }

        var _loop = function _loop(key) {
          // omit special config 'reserved' (aurora,vpc,aws) node keys
          if (!['copiar'].includes(key) && typeof _this4.context.x_state.config_node[key] === 'object') {
            Object.keys(_this4.context.x_state.config_node[key]).map(function (attr) {
              if (attr.charAt(0) != ':') data.option_settings['aws:elasticbeanstalk:application:environment'][key.toUpperCase() + '_' + attr.toUpperCase()] = this.context.x_state.config_node[key][attr];
            }.bind(_this4));
          }
        };

        for (var key in _this4.context.x_state.config_node) {
          _loop(key);
        } //write


        var path = require('path');

        var eb_base = _this4.context.x_state.dirs.app;
        var eb_dir = path.join(eb_base, '.ebextensions');
        yield _this4.context.writeFile(path.join(eb_dir, '01_confignode.config'), yaml.stringify(data, {
          version: '1.1'
        }));
      })();
    }

    _createEBx_timeout() {
      var _this5 = this;

      return _asyncToGenerator(function* () {
        // create 01_confignode content for setting ENV vars within EB instance
        if (_this5.context.x_state.central_config.timeout) {
          var yaml = require('yaml');

          var data = {
            container_commands: {
              extend_proxy_timeout: {
                command: "sed -i '/\\s*location \\/ {/c \\\n        client_max_body_size 500M; \\\n        location / { \\\n                proxy_connect_timeout       ".concat(_this5.context.x_state.central_config.timeout, ";\\\n                proxy_send_timeout          ").concat(_this5.context.x_state.central_config.timeout, ";\\\n                proxy_read_timeout          ").concat(_this5.context.x_state.central_config.timeout, ";\\\n                send_timeout                ").concat(_this5.context.x_state.central_config.timeout, ";\\\n        ' /tmp/deployment/config/#etc#nginx#conf.d#00_elastic_beanstalk_proxy.conf")
              }
            }
          }; //write

          var path = require('path');

          var eb_base = _this5.context.x_state.dirs.app;
          var eb_dir = path.join(eb_base, '.ebextensions');
          yield _this5.context.writeFile(path.join(eb_dir, 'extend-proxy-timeout.config'), yaml.stringify(data)); //, { version:'1.1' }
        }
      })();
    }

    _createEBx_sockets() {
      var _this6 = this;

      return _asyncToGenerator(function* () {
        // create enable-websockets.config
        var yaml = require('yaml');

        var data = {
          container_commands: {
            enable_websockets: {
              command: "sed -i '/s*proxy_set_headers*Connection/c         proxy_set_header Upgrade $http_upgrade;        proxy_set_header Connection \"\"upgrade\"\";        ' /tmp/deployment/config/#etc#nginx#conf.d#00_elastic_beanstalk_proxy.conf"
            }
          }
        }; //write

        var path = require('path');

        var eb_base = _this6.context.x_state.dirs.app;
        var eb_dir = path.join(eb_base, '.ebextensions');
        yield _this6.context.writeFile(path.join(eb_dir, 'enable-websockets.config'), yaml.stringify(data, {
          version: '1.1'
        }));
      })();
    }

    _createEBx_puppeteer() {
      var _this7 = this;

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

        var eb_base = _this7.context.x_state.dirs.app;
        var eb_dir = path.join(eb_base, '.ebextensions');
        yield _this7.context.writeFile(path.join(eb_dir, 'puppeteer.config'), yaml.stringify(data, {
          version: '1.1'
        }));
      })();
    }

    run() {
      var _this8 = this;

      return _asyncToGenerator(function* () {
        var spawn = require('await-spawn');

        var errors = []; //AWS EB deploy

        _this8.context.debug('AWS EB deploy');

        var eb_full = _this8.context.x_state.central_config.deploy.replaceAll('eb:', '');

        var eb_appname = eb_full;
        var eb_instance = "".concat(eb_appname, "-dev");

        if (eb_full.includes(',')) {
          eb_appname = eb_full.split(',')[0];
          eb_instance = eb_full.split(',').splice(-1)[0];
        }

        if (eb_appname != '') {
          var spinner = _this8.context.x_console.spinner({
            message: 'Creating config files'
          }); //this.x_console.outT({ message:`Creating EB config yml: ${eb_appname} in ${eb_instance}`, color:'yellow' });
          //create .ebextensions directory


          var path = require('path'),
              fs = require('fs').promises;

          var eb_base = _this8.context.x_state.dirs.app;
          var eb_dir_ext = path.join(eb_base, '.ebextensions');

          try {
            yield fs.mkdir(eb_dir_ext, {
              recursive: true
            });
          } catch (ef) {}

          var eb_dir = path.join(eb_base, '.elasticbeanstalk');

          try {
            yield fs.mkdir(eb_dir, {
              recursive: true
            });
          } catch (ef) {} //write .npmrc file


          yield _this8.context.writeFile(path.join(eb_base, '.npmrc'), 'unsafe-perm=true'); //write .ebextensions/config.yml

          yield _this8._createEBx_configEB(); //write .ebextensions/01_confignode.config

          yield _this8._createEBx_configNode(); //write .ebextensions/extend-proxy-timeout.config

          yield _this8._createEBx_timeout(); //enable websockets?

          if (_this8.context.x_state.central_config.rtc == true) {
            yield _this8._createEBx_sockets();
          }

          if (_this8.context.x_state.npm.puppeteer || _this8.context.x_state.npm['puppeteer-code']) {
            yield _this8._createEBx_puppeteer();
          } //create .ebignore file


          var eb_ig = "node_modules/\njspm_packages/\n.npm\n.node_repl_history\n*.tgz\n.yarn-integrity\n.editorconfig\n# Mac OSX\n.DS_Store\n# Elastic Beanstalk Files\n.elasticbeanstalk/*\n!.elasticbeanstalk/*.cfg.yml\n!.elasticbeanstalk/*.global.yml";
          yield _this8.context.writeFile(path.join(eb_base, '.ebignore'), eb_ig); //init git if not already

          spinner.succeed('EB config files created successfully');
          var results = {};
          var git_exists = yield _this8.context.exists(path.join(eb_base, '.git'));

          if (!git_exists) {
            //git directory doesn't exist
            //this.context.x_console.outT({ message:'CREATING .GIT DIRECTORY' });
            spinner.start('Initializing project git repository');
            spinner.text('Creating .gitignore file');
            var git_ignore = "# Mac System files\n.DS_Store\n.DS_Store?\n__MACOSX/\nThumbs.db\n# EB files\nnode_modules/";
            yield _this8.context.writeFile(path.join(eb_base, '.gitignore'), git_ignore);
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
            if (_this8.context.x_config.nodeploy && _this8.context.x_config.nodeploy == true) {
              spinner.succeed('EB ready to be deployed (nodeploy as requested)');

              _this8.context.x_console.outT({
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
                spinner.start('This looks like a new deployment: issuing eb create');

                try {
                  //console.log('eb create\n',['eb','create',eb_instance]);
                  yield _this8.launchTerminal('eb', ['create', eb_instance], eb_base);
                  yield _this8.sleep(1000);
                  spinner.succeed('EB created and deployed successfully'); //results.eb_create = await spawn('eb',['create',eb_instance],{ cwd:eb_base }); //, stdio:'inherit'
                  //console.log(results.eb_create);
                  //process.exit(6);
                } catch (ec) {
                  _this8.context.x_console.outT({
                    message: gi.stdout.toString(),
                    color: 'red'
                  });

                  spinner.fail('EB creation failed');
                  errors.push(gi);
                }
              }
            } else {
              _this8.context.x_console.outT({
                message: 'error: eb create (exitcode:' + gi.code + '):' + gi.toString(),
                color: 'red'
              });

              errors.push(gi);
            }
          } //if errors.length==0 && this.x_state.central_config.debug=='true'


          if (errors.length == 0 && _this8.context.x_state.central_config.debug == true && !_this8.context.x_config.nodeploy) {
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
      var _this9 = this;

      return _asyncToGenerator(function* () {
        var ci = require('ci-info'); //restores aws credentials if modified by onPrepare after deployment


        if (!_this9.context.x_state.central_config.componente && _this9.context.x_state.central_config.deploy && _this9.context.x_state.central_config.deploy.indexOf('eb:') != -1 && _this9.context.x_state.config_node.aws && ci.isCI == false) {
          // @TODO add this block to deploys/eb 'post' method and onPrepare to 'pre' 20-br-21
          // only execute after deploy and if user requested specific aws credentials on map
          var path = require('path'),
              copy = require('recursive-copy'),
              os = require('os');

          var aws_bak = path.join(_this9.context.x_state.dirs.base, 'aws_backup.ini');
          var aws_file = path.join(os.homedir(), '/.aws/') + 'credentials'; // try to copy aws_bak over aws_ini_file (if bak exists)

          var fs = require('fs');

          if (yield _this9.context.exists(aws_bak)) {
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
      var _this10 = this;

      return _asyncToGenerator(function* () {
        var ci = require('ci-info');

        if (!_this10.context.x_state.central_config.componente && _this10.context.x_state.central_config.deploy && _this10.context.x_state.central_config.deploy.indexOf('eb:') != -1 && ci.isCI == false) {
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


          if (_this10.context.x_state.config_node.aws) {
            // if DSL defines temporal AWS credentials for this app .. 
            // create backup of aws credentials, if existing previously
            if (aws_ini != '') {
              var aws_bak = path.join(_this10.context.x_state.dirs.base, 'aws_backup.ini');

              _this10.context.x_console.outT({
                message: "config:aws:creating .aws/credentials backup",
                color: 'yellow'
              });

              yield fs.writeFile(aws_bak, aws_ini, 'utf-8');
            } // debug


            _this10.context.x_console.outT({
              message: "config:aws:access ->".concat(_this10.context.x_state.config_node.aws.access)
            });

            _this10.context.x_console.outT({
              message: "config:aws:secret ->".concat(_this10.context.x_state.config_node.aws.secret)
            }); // transform config_node.aws keys into ini


            var to_ini = ini.stringify({
              aws_access_key_id: _this10.context.x_state.config_node.aws.access,
              aws_secret_access_key: _this10.context.x_state.config_node.aws.secret
            }, {
              section: 'default'
            });

            _this10.context.debug('Setting .aws/credentials from config node'); // save as .aws/credentials (ini file)


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
            if (parsed.default) _this10.context.debug('Using local system AWS credentials', parsed.default);
            _this10.context.x_state.config_node.aws = {
              access: '',
              secret: ''
            };
            if (parsed.default.aws_access_key_id) _this10.context.x_state.config_node.aws.access = parsed.default.aws_access_key_id;
            if (parsed.default.aws_secret_access_key) _this10.context.x_state.config_node.aws.secret = parsed.default.aws_secret_access_key;
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
      var _this11 = this;

      return _asyncToGenerator(function* () {
        //express = {models,routes}
        //returns array with records of lines of code
        var resp = []; //aws config requirements

        if (_this11.context.x_state.npm['aws-sdk']) {
          if (!_this11.context.x_state.config_node.aws) {
            _this11.context.x_state.npm['aws-get-credentials'] = '*';
            resp.push("const AWS = require('aws-sdk');\n                (async function() {\n                    const { getAWSCredentials } = require('aws-get-credentials');\n                    AWS.config.credentials = await getAWSCredentials();;\n                })();\n                const AWS_s3 = new AWS.S3();");
          } else {
            var aws_data = {
              accessKeyId: _this11.context.x_state.config_node.aws.access,
              secretAccessKey: _this11.context.x_state.config_node.aws.secret
            };

            if (_this11.context.x_state.config_node.aws.region) {
              aws_data.region = _this11.context.x_state.config_node.aws.region;
            }

            resp.push("const AWS = require('aws-sdk');\n                AWS.config.update(".concat(_this11.context.jsDump(aws_data), ");\n                const AWS_s3 = new AWS.S3();"));
          }
        }

        return resp;
      })();
    }

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
      // custom dsl_git version

      this.x_config.dsl_git = /*#__PURE__*/function () {
        var _ref = _asyncToGenerator(function* (content) {
          //save git version
          var tmp = {},
              fs = require('fs').promises,
              path = require('path'); //SECRETS


          this.x_state.config_node = yield this._readConfig(false);

          if (this.x_flags.dsl.includes('_git.dsl')) {
            // if file is x_git.dsl, expand secrets
            this.x_console.outT({
              message: 'we are the git!',
              color: 'green'
            });
            this.x_state.config_node = yield this._restoreSecrets(this.x_state.config_node);
            delete this.x_state.config_node[':id'];
            delete this.x_state.config_node[':secrets'];
            delete this.x_state.config_node['::secrets']; //search and erase config->:secrets node
            //this.x_console.out({ message:'config read on git',data:this.x_state.config_node });
          } else {
            // if file is x.dsl,
            // write x_git.dsl
            tmp.dsl_path = path.dirname(path.resolve(this.x_flags.dsl));
            tmp.dsl_git = path.join(tmp.dsl_path, path.basename(this.x_flags.dsl).replace('.dsl', '_git.dsl'));
            yield fs.writeFile(tmp.dsl_git, content, 'utf-8');
            this.debug("custom dsl_git file saved as: ".concat(tmp.dsl_git)); // export secret keys as :secrets node to eb_git.dsl

            yield this._secretsToGIT(this.x_state.config_node);
          } //

        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }().bind(this);
    } // SECRETS helpers


    _secretsToGIT(resp) {
      var _this = this;

      return _asyncToGenerator(function* () {
        var path = require('path'),
            fs = require('fs').promises;

        var encrypt = require('encrypt-with-password');

        var curr_dsl = path.basename(_this.x_flags.dsl); // secret nodes to _git.dsl file

        if (resp['::secrets'] && resp['::secrets'].length > 0 && !curr_dsl.includes('_git.')) {
          //encrypt existing secret (password) nodes and save them as config->:secrets within _git.dsl file version
          var password = '';
          if (_this.x_config.secrets_pass && _this.x_config.secrets_pass != '') password = _this.x_config.secrets_pass.trim();

          if (password == '') {
            //if a password was not given, invent a memorable one
            var gpass = require('password-generator');

            password = gpass();
            resp[':password'] = password; //inform a pass was created
          } //encrypt secrets object


          var to_secrets = encrypt.encryptJSON(resp['::secrets'], password); //create :secrets node within eb_git.dsl file

          var dsl_parser = require('dsl_parser');

          var dsl = new dsl_parser({
            file: _this.x_flags.dsl.replace('.dsl', '_git.dsl'),
            config: {
              cancelled: false,
              debug: false
            }
          });

          try {
            yield dsl.process();
          } catch (d_err) {
            _this.x_console.out({
              message: "error: file ".concat(_this.x_flags.dsl.replace('.dsl', '_git.dsl'), " does't exist!"),
              data: d_err
            });

            return;
          }

          var new_content = yield dsl.addNode({
            parent_id: resp[':id'],
            node: {
              text: ':secrets',
              icons: ['password'],
              text_note: to_secrets
            }
          });
          var tmp = {};
          tmp.dsl_git_path = path.dirname(path.resolve(_this.x_flags.dsl));
          var git_target = path.join(tmp.dsl_git_path, path.basename(_this.x_flags.dsl).replace('.dsl', '_git.dsl')); //,path.basename(this.x_flags.dsl)

          yield fs.writeFile(git_target, new_content, 'utf-8');

          _this.debug("dsl_git file saved as: ".concat(git_target));

          if (resp[':password']) {
            _this.x_console.outT({
              message: "Password generated for DSL GIT secrets ->".concat(password),
              color: 'brightGreen'
            });
          } //

        }

        return resp;
      })();
    } // restore :secrets node info if it exists and a password was given


    _restoreSecrets(resp) {
      var _this2 = this;

      return _asyncToGenerator(function* () {
        var path = require('path'),
            fs = require('fs').promises;

        var encrypt = require('encrypt-with-password');

        var curr_dsl = path.basename(_this2.x_flags.dsl);

        if (curr_dsl.includes('_git.') && resp[':secrets']) {
          _this2.x_console.outT({
            message: "Secrets node detected!",
            color: 'brightCyan'
          });

          if (_this2.x_config.secrets_pass && _this2.x_config.secrets_pass != '') {
            _this2.x_console.outT({
              message: 'Decrypting config->secrets',
              color: 'brightGreen'
            });

            try {
              var from_secrets = encrypt.decryptJSON(resp[':secrets'], _this2.x_config.secrets_pass); // read nodes into resp struct

              for (var xs of from_secrets) {
                resp = _objectSpread2(_objectSpread2({}, resp), _this2.configFromNode(resp, xs));
              }

              var tmp = {};
              tmp.dsl_git_path = path.dirname(path.resolve(_this2.x_flags.dsl));
              tmp.non_target = path.join(tmp.dsl_git_path, path.basename(_this2.x_flags.dsl).replace('_git.dsl', '.dsl'));
              tmp.exists_non = yield _this2.exists(tmp.non_target);

              if (true) {
                //!tmp.exists_non - always overwrite x.dsl
                _this2.x_console.outT({
                  message: 'Expanding secrets into ' + curr_dsl.replace('_git.dsl', '.dsl'),
                  color: 'cyan'
                }); // expand secret nodes into non _git.dsl version config key


                var dsl_parser = require('dsl_parser');

                var dsl = new dsl_parser({
                  file: _this2.x_flags.dsl,
                  config: {
                    cancelled: false,
                    debug: false
                  }
                });

                try {
                  yield dsl.process();
                } catch (d_err) {
                  _this2.x_console.out({
                    message: "error: file ".concat(_this2.x_flags.dsl, " does't exist!"),
                    data: d_err
                  });

                  return;
                } // remove config->:secrets node if it exists


                var $ = dsl.getParser();
                var search = $("node[TEXT=config] node[TEXT=:secrets]").toArray();
                search.map(function (elem) {
                  $(elem).remove();
                }); //

                var new_content = '';

                for (var sn of from_secrets) {
                  new_content = yield dsl.addNode({
                    parent_id: resp[':id'],
                    node: sn
                  });
                } // save expanded x.dsl file (only if it doesnt exist)


                yield fs.writeFile(tmp.non_target, new_content, 'utf-8');

                _this2.debug("recovered dsl file saved as: ".concat(tmp.non_target));
              } //

            } catch (invpass) {
              //console.log(invpass);
              _this2.x_console.outT({
                message: 'Invalid --secret-pass value for map (check your password)',
                color: 'brightRed'
              });

              _this2.x_console.outT({
                message: 'WARNING: The process may fail if keys are needed',
                color: 'red'
              });
            }
          } else {
            _this2.x_console.outT({
              message: 'WARNING: file contains secrets, but no --secrets-pass arg was given',
              color: 'brightRed'
            });

            _this2.x_console.outT({
              message: 'WARNING: The process may fail if keys are needed',
              color: 'red'
            });
          }
        }

        return resp;
      })();
    } //
    // **************************
    // methods to be auto-called
    // **************************
    //Called after init method finishes


    onInit() {
      var _this3 = this;

      return _asyncToGenerator(function* () {
        if (Object.keys(_this3.x_commands).length > 0) _this3.x_console.outT({
          message: "".concat(Object.keys(_this3.x_commands).length, " local x_commands loaded!"),
          color: "green"
        }); // init
        // set x_state defaults

        _this3.x_state = _objectSpread2(_objectSpread2({}, _this3.x_state), {
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
        });

        var ci = require('ci-info');

        _this3.isCI = ci.isCI;
        if (!_this3.x_state.config_node) _this3.x_state.config_node = yield _this3._readConfig(); //this.debug('config_node',this.x_state.config_node);

        _this3.x_state.central_config = yield _this3._readCentralConfig(); //if requested silence...

        if (_this3.x_config.silent) {
          _this3.x_console.outT({
            message: "silent mode requested",
            color: "dim"
          }); //this.x_console.setSilent(true);


          _this3.x_config.debug = false;
        } //this.debug('central_config',this.x_state.central_config);
        //this.x_state.assets = await this._readAssets();
        //this.debug('assets_node',this.x_state.assets);


        if (_this3.x_config.deploy && _this3.x_config.deploy.trim() != '') {
          _this3.x_console.outT({
            message: "(as requested) force changing deploy target to: ".concat(_this3.x_config.deploy.trim()),
            color: "brightYellow"
          });

          _this3.x_state.central_config.deploy = _this3.x_config.deploy;
        }

        var _folders = {
          'bin': 'bin/',
          'models': 'models/',
          'routes': 'routes/',
          'views': 'views/',
          'db_models': 'db_models/',
          'public': 'public/',
          'doc': 'doc/'
        };

        if (_this3.x_state.central_config.deploy && _this3.x_state.central_config.deploy.includes('sls:')) {
          _folders.secrets = 'secrets/';
        }

        _this3.x_state.dirs = yield _this3._appFolders(_folders); // read modelos node (Sequelize DB)

        _this3.x_state.models = yield _this3._readModelos(); //alias: database tables
        //console.log('PABLO debug models',this.x_state.models);
        //is local server running? if so, don't re-launch it

        _this3.x_state.express_is_running = yield _this3._isLocalServerRunning();

        _this3.debug('is Server Running: ' + _this3.x_state.express_is_running); // init terminal diagnostics


        if (_this3.atLeastNode('10') == false) {
          //this.debug('error: You need at least Node v10+ to use latest version!');
          throw new Error('You need to have at least Node v10+ to run these instances!');
        }

        _this3.x_state.es6 = true; // copy sub-directories if defined in node 'config.copiar' key

        if (_this3.x_state.config_node.copiar) {
          var _path = require('path');

          var copy = require('recursive-copy');

          _this3.x_console.outT({
            message: "copying config:copiar directories to 'root' target folder",
            color: "yellow"
          });

          yield Object.keys(_this3.x_state.config_node.copiar).map( /*#__PURE__*/function () {
            var _ref2 = _asyncToGenerator(function* (key) {
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

            return function (_x2) {
              return _ref2.apply(this, arguments);
            };
          }().bind(_this3));

          _this3.x_console.outT({
            message: "copying config:copiar directories ... READY",
            color: "yellow"
          });
        } // *********************************************
        // install requested modules within config node
        // *********************************************


        _this3.x_console.outT({
          message: "eb initialized() ->"
        }); // JSDoc


        _this3.x_state.dev_npm['jsdoc'] = '*';
        _this3.x_state.dev_npm['jsdoc-i18n-plugin'] = '*';
        _this3.x_state.dev_npm['@pixi/jsdoc-template'] = '*';
        _this3.x_state.dev_npm['lodash'] = '^4.17.11'; // undescore support

        _this3.x_state.npm['underscore'] = '*';
        _this3.x_state.npm['axios'] = '*'; // additional required dependencies

        _this3.x_state.npm['aws-sdk'] = '*';
        _this3.x_state.npm['file-type'] = '*';
        _this3.x_state.npm['async'] = '*';
        _this3.x_state.npm['body-parser'] = '*';
        _this3.x_state.npm['buffer'] = '*';
        _this3.x_state.npm['compare-lat-lon'] = '*';
        _this3.x_state.npm['connect-redis'] = '*';
        _this3.x_state.npm['cookie-parser'] = '*';
        _this3.x_state.npm['country-tz'] = '^1.0.0';
        _this3.x_state.npm['countryinfo'] = '^1.0.2';
        _this3.x_state.npm['debug'] = '*';
        _this3.x_state.npm['ejs'] = '*';
        _this3.x_state.npm['extract-string'] = '*'; // add express support

        _this3.x_state.npm['express'] = '*';
        _this3.x_state.npm['express-cluster'] = '*';
        _this3.x_state.npm['express-session'] = '*'; // express protection and related libraries

        _this3.x_state.npm['helmet'] = '*';
        _this3.x_state.npm['cors'] = '*';
        _this3.x_state.npm['http'] = '*';
        _this3.x_state.npm['http-proxy'] = '*';
        _this3.x_state.npm['compression'] = '*'; // other libraries

        _this3.x_state.npm['moment'] = '*';
        _this3.x_state.npm['moment-timezone'] = '*';
        _this3.x_state.npm['morgan'] = '*'; // log related

        _this3.x_state.npm['multer'] = '*'; // file upload support

        _this3.x_state.npm['mysql2'] = '*'; // sql support

        _this3.x_state.npm['sequelize'] = '*'; // db

        _this3.x_state.npm['node-geocoder'] = '*';
        _this3.x_state.npm['node-pushnotifications'] = '*';
        _this3.x_state.npm['node-schedule'] = '*';
        _this3.x_state.npm['nodemon'] = '*';
        _this3.x_state.npm['postman-request'] = '*';
        _this3.x_state.npm['request'] = '*';
        _this3.x_state.npm['wait.for'] = '*';
        _this3.x_state.npm['serve-favicon'] = '*'; // favicon support
        // FAVICON

        if (_this3.x_state.config_node.favicon) {
          // copy icon to static dir
          var _path2 = require('path');

          var source = _path2.join(_this3.x_state.dirs.base, _this3.x_state.config_node.favicon);

          var target = _this3.x_state.dirs.app + 'icon.png';

          _this3.debug({
            message: "ICON dump (copy icon)",
            color: "yellow",
            data: source
          });

          var fs = require('fs').promises;

          try {
            yield fs.copyFile(source, target);
          } catch (err_fs) {
            _this3.x_console.outT({
              message: "error: copying express icon",
              data: err_fs
            });
          }
        } // serialize 'secret' config keys as json files in app secrets sub-directory (if any)
        // extract 'secret's from config keys; 

        /* */


        _this3.debug('serializing secrets');

        _this3.x_state.secrets = {}; //await _extractSecrets(config_node)

        var path = require('path');

        for (var key in _this3.x_state.config_node) {
          if (typeof key === 'string' && key.includes(':') == false) {
            if (_this3.x_state.config_node[key][':secret']) {
              var new_obj = _objectSpread2({}, _this3.x_state.config_node[key]);

              delete new_obj[':secret'];
              if (new_obj[':link']) delete new_obj[':link']; // set object keys to uppercase

              _this3.x_state.secrets[key] = {};
              var obj_keys = Object.keys(new_obj);

              for (var x in obj_keys) {
                _this3.x_state.secrets[key][x.toUpperCase()] = new_obj[x];
              }

              if (_this3.x_state.dirs.secrets) {
                var _target = path.join(_this3.x_state.dirs.secrets, "".concat(key, ".json"));

                yield _this3.writeFile(_target, JSON.stringify(new_obj));
              }
            }
          }
        }

        _this3.debug('setting ENV variables'); // set config keys as ENV accesible variables (ex. $config.childnode.attributename)


        var _loop = function _loop(_key) {
          // omit special config 'reserved' (aurora,vpc,aws) node keys
          if (!['vpc', 'aws', 'copiar'].includes(_key) && typeof _this3.x_state.config_node[_key] === 'object') {
            Object.keys(_this3.x_state.config_node[_key]).map(function (attr) {
              this.x_state.envs["config.".concat(_key, ".").concat(attr)] = "process.env.".concat((_key + '_' + attr).toUpperCase());
            }.bind(_this3));
          }
        };

        for (var _key in _this3.x_state.config_node) {
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
      var _this4 = this;

      return _asyncToGenerator(function* () {
        var resp = node.text;
        Object.keys(node.attributes).map(function (i) {
          if (i == 'title' || i == 'titulo') {
            resp = node.attributes[i];
            return false;
          }
        }.bind(_this4));
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
      var _this5 = this;

      return _asyncToGenerator(function* () {
        if (Object.keys(_this5.x_commands).length > 0) _this5.x_console.outT({
          message: "".concat(Object.keys(_this5.x_commands).length, " x_commands loaded!"),
          color: "green"
        });
        _this5.deploy_module = {
          pre: () => {},
          post: () => {},
          deploy: () => true
        };
        var deploy = _this5.x_state.central_config.deploy;

        if (deploy) {
          deploy += '';

          if (deploy.includes('eb:')) {
            _this5.deploy_module = new eb({
              context: _this5
            });
          } else if (deploy == 'local') {
            _this5.deploy_module = new local({
              context: _this5
            }); //
          } else ;
        }

        yield _this5.deploy_module.pre();
      })();
    } //Executed when compiler founds an error processing nodes.


    onErrors(errors) {
      var _this6 = this;

      return _asyncToGenerator(function* () {
        _this6.errors_found = true;
      })();
    } //.gitignore helper


    createGitIgnore() {
      var _this7 = this;

      return _asyncToGenerator(function* () {
        _this7.debug('writing .gitignore files');

        var fs = require('fs').promises;

        _this7.debug({
          message: 'writing dsl /.gitignore file'
        });

        var git = "# Mac System files\n.DS_Store\n.DS_Store?\n_MACOSX/\nThumbs.db\n# NPM\npackage.json\npackage-lock.json\nnode_modules/\n# Concepto files\n.concepto/\naws_backup.ini\n.secrets-pass\neb.dsl\neb_*.dsl\nstore/\n".concat(_this7.x_state.dirs.compile_folder, "/");
        yield fs.writeFile("".concat(_this7.x_state.dirs.base, ".gitignore"), git, 'utf-8'); //.gitignore
      })();
    } // create /README.md file


    createReadme() {
      var _this8 = this;

      return _asyncToGenerator(function* () {
        var fs = require('fs').promises;

        if (_this8.x_state.central_config.readme != '') {
          yield* function* () {
            var set_envs = [];

            var _loop2 = function _loop2(key) {
              if (!['vpc', 'aws', 'copiar'].includes(key) && typeof _this8.x_state.config_node[key] === 'object') {
                Object.keys(_this8.x_state.config_node[key]).map(function (attr) {
                  if (key.charAt(0) != ':' && attr.charAt(0) != ':') {
                    set_envs.push("".concat(key.toUpperCase(), "_").concat(attr.toUpperCase()));
                  }
                }.bind(_this8));
              }
            };

            for (var key in _this8.x_state.config_node) {
              _loop2(key);
            }

            var content = "<b>".concat(_this8.x_state.central_config.readme, "</b><br/><br/>\n            APP_PORT (int)<br/>\n            CLUSTER (int)<br/>");

            if (set_envs.length > 0) {
              content += "Esta aplicacion requiere configurar las siguientes variables de entorno en la instancia de ElasticBean:<br/><br/>";
              content += set_envs.join('<br/>') + '\n';
            }

            yield fs.writeFile("".concat(_this8.x_state.dirs.app, "README.md"), content, 'utf-8');
          }();
        }
      })();
    }

    createErrorTemplate() {
      var _this9 = this;

      return _asyncToGenerator(function* () {
        var fs = require('fs').promises;

        var content = "<h1><%= message %></h1>\n        <h2><%= error.status %></h2>\n        <pre><%= error.stack %></pre>";
        yield fs.writeFile("".concat(_this9.x_state.dirs.views, "error.ejs"), content, 'utf-8');
      })();
    }

    createJSDoc() {
      var _this10 = this;

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
        yield _this10.writeFile("".concat(_this10.x_state.dirs.app, "jsdoc.json"), content);
      })();
    }

    createBinFile() {
      var _this11 = this;

      return _asyncToGenerator(function* () {
        var content = "#!/usr/bin/env node\nvar app = require('../app');\nvar debug = require('debug')('api:server');\nvar http = require('http');\nvar port = normalizePort(process.env.PORT || '8081');\napp.set('port',port);\nvar server = http.createServer(app);\n// methods\nfunction normalizePort(val) {\n\tvar port = parseInt(val, 10);\n\tif (isNaN(port)) {\n\t\treturn val;\n\t}\n\tif (port >= 0) {\n\t\treturn port;\n\t}\n\treturn false;\n}\n// error handler\nfunction onError(error) {\n  if (error.syscall !== 'listen') {\n    throw error;\n  }\n\n  var bind = typeof port === 'string'\n    ? 'Pipe ' + port\n    : 'Port ' + port;\n\n  // handle specific listen errors with friendly messages\n  switch (error.code) {\n    case 'EACCES':\n      console.error(bind + ' requires elevated privileges');\n      process.exit(1);\n      break;\n    case 'EADDRINUSE':\n      console.error(bind + ' is already in use');\n      process.exit(1);\n      break;\n    default:\n      throw error;\n  }\n}\n// listening event\nfunction onListening() {\n  var addr = server.address();\n  var bind = typeof addr === 'string'\n    ? 'pipe ' + addr\n    : 'port ' + addr.port;\n  debug('Listening on ' + bind);\n}";
        yield _this11.writeFile("".concat(_this11.x_state.dirs.bin, "www"), content);
      })();
    }

    createPackageJSON() {
      var _this12 = this;

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
          name: _this12.x_state.central_config.service_name.toLowerCase(),
          description: cleanLinesDoc(_this12.x_state.central_config[':description']),
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
        if (_this12.x_state.central_config[':version'] != 'auto') data.version = _this12.x_state.central_config[':version'];
        if (_this12.x_state.central_config[':author']) data.author = _this12.x_state.central_config[':author'];
        if (_this12.x_state.central_config[':license']) data.license = _this12.x_state.central_config[':license'];

        if (_this12.x_state.central_config[':git']) {
          data.repository = {
            type: 'git',
            url: "git+".concat(_this12.x_state.central_config[':git'], ".git")
          };
          data.bugs = {
            url: "".concat(_this12.x_state.central_config[':git'], "/issues")
          };
          data.homepage = _this12.x_state.central_config[':git'];
        }

        if (_this12.x_state.central_config[':keywords']) data.keywords = _this12.x_state.central_config[':keywords'].split(','); // set port and env variables to script dev

        var set_envs = ["APP_PORT=".concat(_this12.x_state.central_config.port), "CLUSTER=1"];

        var _loop3 = function _loop3(key) {
          if (!['vpc', 'aws', 'copiar'].includes(key) && typeof _this12.x_state.config_node[key] === 'object') {
            Object.keys(_this12.x_state.config_node[key]).map(function (attr) {
              if (key.charAt(0) != ':' && attr.charAt(0) != ':') {
                set_envs.push("".concat(key.toUpperCase(), "_").concat(attr.toUpperCase(), "=").concat(this.x_state.config_node[key][attr]));
              }
            }.bind(_this12));
          }
        };

        for (var key in _this12.x_state.config_node) {
          _loop3(key);
        } // omit stage as start_type; it seems its not needed
        // call hook for deploy_module (if needs to add env variables depending on deploy)


        if (_this12.deploy_module.setEnvs) {
          set_envs = yield _this12.deploy_module.setEnvs(set_envs);
        } // add to package script _dev


        data.scripts.dev = set_envs.join(' ') + ' ' + data.scripts.dev; //
        //add dependencies

        for (var pack in _this12.x_state.npm) {
          if (_this12.x_state.npm[pack].includes('http') && _this12.x_state.npm[pack].includes('github.com')) {
            data.dependencies[pack] = "git+".concat(_this12.x_state.npm[pack]);
          } else {
            data.dependencies[pack] = _this12.x_state.npm[pack];
          }
        } //add devDependencies


        for (var _pack in _this12.x_state.dev_npm) {
          if (_this12.x_state.dev_npm[_pack].includes('http') && _this12.x_state.dev_npm[_pack].includes('github.com')) {
            data.devDependencies[_pack] = "git+".concat(_this12.x_state.dev_npm[_pack]);
          } else {
            data.devDependencies[_pack] = _this12.x_state.dev_npm[_pack];
          }
        } //write to disk


        var path = require('path');

        var target = path.join(_this12.x_state.dirs.app, "package.json");
        var content = JSON.stringify(data);
        yield _this12.writeFile(target, content); //this.x_console.outT({ message:'future package.json', data:data});
      })();
    }

    createVSCodeHelpers() {
      var _this13 = this;

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

        var target = path.join(_this13.x_state.dirs.app, "jsconfig.json");
        var content = JSON.stringify(data);
        yield _this13.writeFile(target, content);
      })();
    }

    createServerlessYML() {
      var _this14 = this;

      return _asyncToGenerator(function* () {
        var yaml = require('yaml'),
            data = {};

        var deploy = _this14.x_state.central_config.deploy + '';

        if (deploy.includes('eb:') == false && deploy != false && deploy != 'local') {
          data.service = _this14.x_state.central_config.service_name;
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

          for (var secret in _this14.x_state.secrets) {
            data.custom[secret] = '${file(secrets/' + secret + '.json)}';
          } //domain info


          if (_this14.x_state.central_config.dominio) {
            data.custom.customDomain = {
              domainName: _this14.x_state.central_config.dominio
            };
            if (_this14.x_state.central_config.basepath) data.custom.customDomain.basePath = _this14.x_state.central_config.basepath;
            if (_this14.x_state.central_config.stage) data.custom.customDomain.stage = _this14.x_state.central_config.stage;
            data.custom.customDomain.createRoute53Record = true;
          } //nodejs env on aws


          data.provider = {
            name: 'aws',
            runtime: 'nodejs8.10',
            timeout: _this14.x_state.central_config.timeout
          };
          if (_this14.x_state.central_config.stage) data.provider.stage = _this14.x_state.central_config.stage; //env keys

          if (Object.keys(_this14.x_state.config_node) != '') {
            data.provider.enviroment = {};
            if (_this14.x_state.central_config.stage) data.provider.enviroment.STAGE = _this14.x_state.central_config.stage;

            if (_this14.x_state.config_node.vpc) {
              data.provider.vpc = {
                securityGroupIds: [_this14.x_state.config_node.vpc.security_group_id],
                subnetIDs: []
              };

              if (_this14.x_state.secrets.vpc) {
                data.provider.vpc.securityGroupIds = ['${self:custom.vpc.SECURITY_GROUP_ID}'];
              }

              if (_this14.x_state.config_node.vpc.subnet1_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET1_ID}');
              if (_this14.x_state.config_node.vpc.subnet2_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET2_ID}');
              if (_this14.x_state.config_node.vpc.subnet3_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET3_ID}');
              if (_this14.x_state.config_node.vpc.subnet4_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET4_ID}');
              if (_this14.x_state.config_node.vpc.subnet5_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET5_ID}');
              if (_this14.x_state.config_node.vpc.subnet6_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET6_ID}');
              if (_this14.x_state.config_node.vpc.subnet7_id) data.provider.vpc.subnetIDs.push('${self:custom.vpc.SUBNET7_ID}');
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

          if (_this14.x_state.central_config['keep-warm']) {
            data.functions.nuxt.events.push({
              schedule: 'rate(20 minutes)'
            });
          } //aws resources for s3 (x_state.aws_resources) (@TODO later - no commands use them - cfc:13017)
          //serverless plugins


          data.plugins = ['serverless-apigw-binary', 'serverless-offline', 'serverless-prune-plugin'];
          if (_this14.x_state.central_config.dominio) data.plugins.push('serverless-domain-manager'); //write yaml to disk

          var content = yaml.stringify(data);

          var path = require('path');

          var target = path.join(_this14.x_state.dirs.app, "serverless.yml");
          yield _this14.writeFile(target, content); //debug
          //this.debug('future serverless.yml', content);
        }
      })();
    }

    getExpressModels() {
      var _this15 = this;

      return _asyncToGenerator(function* () {
        var sort = function sort(obj) {
          return Object.entries(obj).sort((a, b) => a[0].length - b[0].length).map(el => el[0]);
        };

        var express_models = {}; // grouped functions by main path folder

        var routes = {
          raw: {},
          ordered: []
        };

        for (var key in _this15.x_state.functions) {
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
            express_models[file].functions[key] = _this15.x_state.functions[key];
          }

          express_models[file].ordered_functions = sort(express_models[file].functions); // merge function's imports into dad (e_model) imports

          for (var import_name in _this15.x_state.functions[key].imports) {
            express_models[file].imports[import_name] = import_name;
          } // add pathlen key for later struct sort


          if (typeof _this15.x_state.functions[key].path == 'string') {
            express_models[file].functions[key].pathlen = _this15.x_state.functions[key].path.length;
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
      var _this16 = this;

      return _asyncToGenerator(function* () {
        var path = require('path'); // create app_routes code


        var app_routes = [];

        for (var route_x in express.routes.ordered) {
          var route = express.routes.ordered[route_x];
          app_routes.push("app.use('".concat(route, "', require('./routes/").concat(express.routes.raw[route], "'));"));
        } // content


        var content = "var express = require('express');\n";

        if (_this16.x_state.central_config.rtc && _this16.x_state.central_config.rtc == true) {
          content += "var http = require('http'), socket = require('socket.io'), rtc = require('rtcmulticonnection-server');\n";
        }

        content += "var cors = require('cors'),\n                    session = require('express-session'),\n                    path = require('path'),\n                    favicon = require('serve-favicon'),\n                    logger = require('morgan'),\n                    cookieParser = require('cookie-parser'),\n                    bodyParser = require('body-parser'),\n                    // NodeGeocoder: es utilizado para realizar la geo decodificacion y codificacion de lat-lon o direccion.\n                    //NodeGeocoder = require('node-geocoder'),\n                    // Mysql: es la instancia de mysql global.\n                    mysql = require('mysql2'),\n                    helmet = require('helmet'),\n                    // Cluster: es para realizar un cluster de servidor conectados por express.\n                    cluster = require('express-cluster'),\n                    // schedule: es usado para crear crons.\n                    schedule = require('node-schedule'),\n                    // Request: es utilizado para realizar las llamadas get y post hacia otros servicios o servicios internos.\n                    request = require('request'),\n                    wait = require('wait.for'),\n                    compress = require('compression')();\n                // Define en las variables del enviroment el TimeZone a utc.\n                process.env.TZ = 'utc';\n                \n                cluster(function(worker) {\n                var app = express();\n                var port = process.env.APP_PORT;\n        ";

        if (_this16.x_state.central_config.rtc && _this16.x_state.central_config.rtc == true) {
          content += "var httpServer = http.createServer(app);\n            var io = socket(httpServer).on('connection', function(sock) {\n";

          if (_this16.x_state.central_config['rtc:admin'] != '') {
            content += "rtc.addSocket(sock, {\n                    \"socketURL\": \"/\",\n                    \"dirPath\": \"\",\n                    \"homePage\": \"/\",\n                    \"socketMessageEvent\": \"RTCMultiConnection-Message\",\n                    \"socketCustomEvent\": \"RTCMultiConnection-Custom-Message\",\n                    \"port\": port,\n                    \"enableLogs\": false,\n                    \"autoRebootServerOnFailure\": false,\n                    \"isUseHTTPs\": false,\n                    \"sslKey\": \"./fake-keys/privatekey.pem\",\n                    \"sslCert\": \"./fake-keys/certificate.pem\",\n                    \"sslCabundle\": \"\",\n                    \"enableAdmin\": true,\n                    \"adminUserName\": \"".concat(_this16.x_state.central_config["rtc:admin"].split(',')[0].trim(), "\",\n                    \"adminPassword\": \"").concat(_this16.x_state.central_config["rtc:admin"].split(',').pop().trim(), "\"\n                  });\n");
          } else {
            content += "rtc.addSocket(sock);\n";
          }

          content += "});\n";
        } // create cors origin options


        var cors_options = {};

        if (_this16.x_state.config_node.cors) {
          cors_options.origin = [];

          for (var x in _this16.x_state.config_node.cors) {
            cors_options.origin.push(_this16.x_state.config_node.cors[x]);
          }
        } //


        content += "app.enable('trust proxy');\n        app.options('*',cors());\n        app.use(cors(".concat(_this16.jsDump(cors_options), "));\n        app.use(compress);\n        app.use(helmet());\n        app.disable('x-powered-by');\n        app.use(session({\n          secret: 'c-r-34707$ee$$$10nBm_api',\n          resave: true,\n          saveUninitialized: true\n        }));\n        app.set('views', __dirname + '/views');\n        app.set('view engine', 'ejs');\n        //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));\n        app.use(logger('dev'));\n        app.use(bodyParser.urlencoded({ extended: false,limit: '2gb' }));\n        app.use(bodyParser.json({ extended: false,limit: '2gb' }));\n        app.use(cookieParser());\n        app.use(express.static(path.join(__dirname, 'public')));\n        app.use('/', require('./routes/index'));\n        ").concat(app_routes.join('\n'), "\n        // catch 404 and forward to error handler\n        app.use(function(req, res, next) {\n          var err = new Error('Not Found');\n          err.status = 404;\n          next(err);\n        });\n        // error handler\n        app.use(function(err, req, res, next) {\n          // set locals, only providing error in development\n          res.locals.message = err.message;\n          res.locals.error = process.env.START_TYPE === 'development' ? err : {};\n      \n          // render the error page\n          res.status(err.status || 500);\n          res.render('error');\n        });\n        process.env.UV_THREADPOOL_SIZE = 128;\n        // aqui van los schedules @TODO 1-6-19\n        // aqui creamos el servidor\n");

        if (_this16.x_state.central_config.rtc && _this16.x_state.central_config.rtc == true) {
          content += "return httpServer.listen(port, function () {\n                            console.log(`T: ${new Date().toLocaleString()} | EXPRESS (${process.env.START_TYPE}): server listening on port ${port}`);\n                            console.log(`SERVIDOR INICIADO CON RTC`);\n                        });\n";
        } else {
          content += "return app.listen(port, function () {\n                            console.log(`T: ${new Date().toLocaleString()} | EXPRESS (${process.env.START_TYPE}): server listening on port ${port}`);\n                            console.log(`SERVIDOR INICIADO`);\n                        });\n";
        }

        content += "// Al final creamos el cluster del servidor.\n                    }, {count: process.env.CLUSTER});\n"; //post-processing

        if (_this16.x_state.central_config.rtc && _this16.x_state.central_config.rtc == true) {
          _this16.x_state.npm['http'] = '*';
          _this16.x_state.npm = _objectSpread2(_objectSpread2({}, _this16.x_state.npm), {
            'http': '*',
            'socket.io': '*',
            'rtcmulticonnection-server': '*'
          });

          if (_this16.x_state.central_config['rtc:admin'] != '') {
            //copy rtcadmin from assets and unzip into public dir
            var anzip = require('anzip');

            var rtc_admin = path.join(__dirname, 'assets', 'rtc_admin.zip');
            yield anzip(rtc_admin, {
              outputPath: _this16.x_state.dirs.public
            }); //console.log('PABLO debug unzip',output);
          }
        } //write file


        var appjs = path.join(_this16.x_state.dirs.app, 'app.js');
        yield _this16.writeFile(appjs, content);
      })();
    }

    createIndex(express) {
      var _this17 = this;

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

        var target = path.join(_this17.x_state.dirs.routes, 'index.js');
        yield _this17.writeFile(target, content);
      })();
    }

    createRoutes(express) {
      var _this18 = this;

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

          var target = path.join(_this18.x_state.dirs.routes, file + '.js');
          yield _this18.writeFile(target, content);
        }
      })();
    }

    createModels(express) {
      var _this19 = this;

      return _asyncToGenerator(function* () {
        var path = require('path');

        for (var file in express.models) {
          var content = "//funciones para ruta ".concat(file, "\n");

          if (_this19.x_state.config_node.aurora) {
            content += "const connectToDatabase = require('../db'); // initialize connection\n";
          } //requires


          var requires = [];

          if (_this19.deploy_module.codeForModel) {
            var deploy_require = yield _this19.deploy_module.codeForModel(express.models[file]);
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

          var target = path.join(_this19.x_state.dirs.models, file + '.js');
          yield _this19.writeFile(target, content);
        }
      })();
    }

    onEnd() {
      var _this20 = this;

      return _asyncToGenerator(function* () {
        //execute deploy (npm install, etc) AFTER vue compilation (18-4-21: this is new)
        if (!_this20.errors_found) {
          if (!(yield _this20.deploy_module.deploy()) && !_this20.x_state.central_config.componente) {
            _this20.x_console.outT({
              message: 'Something went wrong deploying, check the console, fix it and run again.',
              color: 'red'
            });

            yield _this20.deploy_module.post(); // found errors deploying

            process.exit(100);
          } else {
            yield _this20.deploy_module.post();
          }
        } else {
          //found errors compiling
          process.exit(50);
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
          _this21 = this;

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
            _this21.debug("error: could not format the JS file; trying js-beautify");

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
            _this21.debug("warning: could not format the vue file; trying vue-beautify", ee);

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
      var _this22 = this;

      return _asyncToGenerator(function* () {
        require('fs').promises;
            var path = require('path'); //this.x_console.out({ message:'onCreateFiles', data:processedNodes });
        //this.x_console.out({ message:'x_state', data:this.x_state });


        yield _this22._writeModelos();
        yield _this22.createGitIgnore(); //write .npmrc file for ffmpeg support

        yield _this22.writeFile(path.join(_this22.x_state.dirs.app, '.npmrc'), "unsafe-perm=true");

        _this22.debug('processing nodes'); //console.log('PABLO debug x_state function general/login',this.x_state.functions.general_login);
        //console.log('PABLO debug create nodes',processedNodes);
        //group functions into express models (first folder is dad model)


        var express = yield _this22.getExpressModels(); //let express = { models:express_base.models, routes:express_base.routes }; // grouped functions by main path folder
        // add code to express models

        for (var thefile_num in processedNodes) {
          var thefile = processedNodes[thefile_num];

          if (express.models[thefile.file]) {
            express.models[thefile.file].code = thefile.code;
          }
        } //console.log('PABLO debug EXPRESS models',express.models);


        yield _this22.createAppJS(express);
        yield _this22.createIndex(express);
        yield _this22.createErrorTemplate();
        yield _this22.createJSDoc();
        yield _this22.createReadme();
        yield _this22.createBinFile();
        yield _this22.createRoutes(express);
        yield _this22.createModels(express); // *************************
        // Additional steps
        // *************************
        //create package.json

        yield _this22.createPackageJSON(); //create package.json
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
      var _this23 = this;

      return _asyncToGenerator(function* () {
        var is_reachable = require('is-port-reachable');

        var resp = yield is_reachable(_this23.x_state.central_config.port);
        return resp;
      })();
    }
    /*
     * Reads the node called modelos and creates tables definitions and managing code (alias:database).
     */


    _readModelos() {
      var _this24 = this;

      return _asyncToGenerator(function* () {
        // @IDEA this method could return the insert/update/delete/select 'function code generators'
        _this24.debug('_readModelos');

        _this24.debug_time({
          id: 'readModelos'
        });

        var modelos = yield _this24.dsl_parser.getNodes({
          text: 'modelos',
          level: 2,
          icon: 'desktop_new',
          recurse: true
        }); //nodes_raw:true	

        var tmp = {
          appname: _this24.x_state.config_node.name
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
          string: {
            value: 'STRING',
            alias: ['varchar', 'string']
          },
          text: {
            value: 'TEXT',
            alias: ['texto', 'largo']
          },
          smalltext: {
            value: "TEXT('tiny')",
            alias: ['textochico', 'textocorto', 'corto']
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

          var extract = require('extractjs')();

          for (var table of modelos[0].nodes) {
            var fields = _objectSpread2({}, table.attributes); //table.attributes.map(x=>{ fields={...fields,...x} }); //table attributes


            resp.tables[table.text] = {
              fields: {}
            }; //create table

            tmp.sql_fields = [];

            for (var field in fields) {
              //console.log('fields_map',{field,fields});
              if (fields[field].includes('(')) {
                var parts = extract("{type}({amount})", fields[field]);
                resp.tables[table.text].fields[field] = fields_map[parts.type] + "(".concat(parts.amount, ")"); //assign field with mapped value

                tmp.sql_fields.push(field + ' ' + fields_map[fields[field]]);
              } else if (field.charAt(0) != ':') {
                resp.tables[table.text].fields[field] = fields_map[fields[field]]; //assign field with mapped value

                tmp.sql_fields.push(field + ' ' + fields_map[fields[field]]);
              }
            }

            resp.tables[table.text].sql = "CREATE TABLE ".concat(table.text, "(").concat(tmp.sql_fields.join(','), ")"); // test special attrs

            if (fields[':dbname']) resp.tables[table.text].db = table[':dbname'];
            if (fields[':tipo']) resp.tables[table.text].type = table[':tipo'];
            if (fields[':type']) resp.tables[table.text].type = table[':type'];
            if (fields[':tipo']) resp.tables[table.text].type = table[':tipo'];

            if (fields[':index']) {
              if (!resp.tables[table.text].indexes) resp.tables[table.text].indexes = [];
              resp.tables[table.text].indexes.push({
                name: yield _this24.hash(table.text + '_' + table[':index']),
                unique: false,
                fields: fields[':index'].split(',')
              });
            }

            if (fields[':index_unique']) {
              if (!resp.tables[table.text].indexes) resp.tables[table.text].indexes = [];
              resp.tables[table.text].indexes.push({
                name: yield _this24.hash(table.text + '_' + table[':index_unique']),
                unique: true,
                fields: fields[':index_unique'].split(',')
              });
            } //


            yield _this24.setImmediatePromise(); //@improved
          }
        } // create virtual table 'if' central node 'log'='modelo


        if (_this24.x_state.central_config.log && _this24.x_state.central_config.log.includes('model')) {
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


        _this24.x_state.npm['sequelize'] = '*';

        _this24.debug_timeEnd({
          id: 'readModelos'
        }); // return 


        return resp;
      })();
    }

    _writeModelos() {
      var _this25 = this;

      return _asyncToGenerator(function* () {
        _this25.debug('_writeModelos');

        _this25.debug_time({
          id: 'writeModelos'
        });

        var path = require('path'),
            fs = require('fs').promises; // ******************************************************
        // create db_models sequelize schema files @todo
        // ******************************************************


        for (var table in _this25.x_state.models.tables) {
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

          var target = path.join(_this25.x_state.dirs.db_models, target_file.join('/')); // create target folder

          var jfolder = path.dirname(target);

          try {
            yield fs.mkdir(jfolder, {
              recursive: true
            });
          } catch (errdir) {} // content


          var fields = _this25.x_state.models.tables[table].fields;
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
            'TEXT': 'type.TEXT',
            'TEXT(\'tiny\')': "type.TEXT('tiny')",
            'FLOAT': 'type.FLOAT',
            'BOOLEAN': 'type.BOOLEAN',
            'DATEONLY': 'type.DATE',
            'DATETIME': 'type.DATE',
            'BLOB': 'type.BLOB'
          };

          var extract = require('extractjs')(); //console.log('pablo dump fields',{table,fields});


          for (var key in fields) {
            if (fields[key] in map) {
              model[key] = map[fields[key]];
            } else if (fields[key] && fields[key].includes('(')) {
              //example string(10)
              var elements = extract("{field}({amount})", fields[key]);

              if (elements.field in map) {
                model[key] = map[elements.field] + "(".concat(elements.amount, ")");
              }
            }
          } //add indexes


          var content = "";

          if (_this25.x_state.models.tables[table].indexes) {
            //write model with indexes
            var indexes = {
              indexes: _this25.x_state.models.tables[table].indexes
            };
            content = "module.exports = (sequelize, type) => {\n                    return sequelize.define('".concat(db_name, "', ").concat(_this25.jsDump(model, 'type.'), ", ").concat(_this25.jsDump(indexes), ");\n                }");
          } else {
            //write model without indexes
            content = "module.exports = (sequelize, type) => {\n                    return sequelize.define('".concat(db_name, "', ").concat(_this25.jsDump(model, 'type.'), ");\n                }");
          } // write file


          yield _this25.writeFile(target, content);
        } // ******************************************************
        // create db.js for 'aurora' if defined on config node
        // ******************************************************


        if (_this25.x_state.config_node.aurora) {
          _this25.x_state.npm['mysql2'] = '*';
          _this25.x_state.npm['sequelize'] = '*';
          var _content = "const Sequelize = require('sequelize');\n";

          for (var _table in _this25.x_state.models.tables) {
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
            logging: _this25.x_state.central_config.dblog,
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
          _content += "const sequelize = new Sequelize(\n                process.env.AURORA_NAME,\n                process.env.AURORA_USER,\n                process.env.AURORA_PASSWORD,\n                ".concat(_this25.jsDump(seq_config), "\n            );\n            // check if given database exists, or create it\n            sequelize.query(\"CREATE DATABASE IF NOT EXISTS \"+process.env.AURORA_NAME).then(function(){});\n");
          var models = [];

          for (var _table2 in _this25.x_state.models.tables) {
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

          var _target2 = path.join(_this25.x_state.dirs.app, 'db.js');

          yield _this25.writeFile(_target2, _content);
        }

        _this25.debug_timeEnd({
          id: 'writeModelos'
        });
      })();
    }
    /* 
     * Grabs central node configuration information
     */


    _readCentralConfig() {
      var _this26 = this;

      return _asyncToGenerator(function* () {
        _this26.debug('_readCentralConfig');

        var central = yield _this26.dsl_parser.getNodes({
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
          ':cache': _this26.x_config.cache,
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

        if (!resp[':cache']) _this26.x_config.cache = false; // disables cache when processing nodes (@todo)
        // return

        return resp;
      })();
    }
    /* helper for readConfig and secrets extraction */


    configFromNode(resp, key) {
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

          if (key.icons.includes('password')) {
            resp[config_key][':secret'] = true;
            if (!resp['::secrets']) resp['::secrets'] = [];
            resp['::secrets'].push(key); //add key as secret
          } // add link attribute if defined


          if (key.link != '') resp[config_key][':link'] = key.link;
        } else if (key.nodes.length > 0) {
          resp[key.text] = key.nodes[0].text;
        } else if (key.link != '') {
          resp[key.text] = key.link;
        } //


        if (key.text == ':secrets' && key.icons.includes('password')) {
          resp[':secrets'] = key.text_note.replaceAll('\n', '').trim();
        }
      }

      return resp;
    }
    /*
     * Grabs the configuration from node named 'config'
     */


    _readConfig() {
      var _arguments3 = arguments,
          _this27 = this;

      return _asyncToGenerator(function* () {
        var delete_secrets = _arguments3.length > 0 && _arguments3[0] !== undefined ? _arguments3[0] : true;

        _this27.debug('_readConfig');

        var path = require('path');
            require('fs').promises;

        var resp = {
          id: '',
          meta: [],
          seo: {}
        },
            config_node = {};
        var search = yield _this27.dsl_parser.getNodes({
          text: 'config',
          level: 2,
          icon: 'desktop_new',
          recurse: true
        }); //this.debug({ message:'search says',data:search, prefix:'_readConfig,dim' });
        //let secrets = []; // secret nodes for encrypted export
        //

        if (search.length > 0) {
          config_node = search[0]; // define default font_face

          if (!delete_secrets) resp[':id'] = config_node.id;
          resp.default_face = config_node.font.face;
          resp.default_size = config_node.font.size; // apply children nodes as keys/value for resp

          for (var key of config_node.nodes) {
            // apply keys as config keys (standard config node by content types)
            resp = _objectSpread2(_objectSpread2({}, resp), _this27.configFromNode(resp, key)); //console.log('dump:'+key.text,this.configFromNode(key));
            //
          }
        } // assign dsl file folder name+filename if node.name is not given


        if (!resp.name) {
          var dsl_folder = path.dirname(path.resolve(_this27.x_flags.dsl));
          var parent_folder = path.resolve(dsl_folder, '../');
          var folder = dsl_folder.replace(parent_folder, '');
          resp.name = folder.replace('/', '').replace('\\', '') + '_' + path.basename(_this27.x_flags.dsl, '.dsl'); //console.log('folder:',{folder,name:resp.name});
          //this.x_flags.dsl
        } // create id if not given


        if (!resp.id) resp.id = 'com.puntorigen.' + resp.name; // *********************************************

        if (delete_secrets == true) delete resp[':secrets'];
        return resp;
      })();
    }

    getParentNodes() {
      var _arguments4 = arguments,
          _this28 = this;

      return _asyncToGenerator(function* () {
        var id = _arguments4.length > 0 && _arguments4[0] !== undefined ? _arguments4[0] : _this28.throwIfMissing('id');
        var exec = _arguments4.length > 1 && _arguments4[1] !== undefined ? _arguments4[1] : false;
        var parents = yield _this28.dsl_parser.getParentNodesIDs({
          id,
          array: true
        });
        var resp = [];

        for (var parent_id of parents) {
          var node = yield _this28.dsl_parser.getNode({
            id: parent_id,
            recurse: false
          });
          var command = yield _this28.findValidCommand({
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
      var _this29 = this;

      return _asyncToGenerator(function* () {
        var resp = yield _this29.dsl_parser.hash(thing);
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
