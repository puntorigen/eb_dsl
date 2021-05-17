String.prototype.replaceAll = function(strReplace, strWith) {
    // See http://stackoverflow.com/a/3561711/556609
    var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    var reg = new RegExp(esc, 'ig');
    return this.replace(reg, strWith);
};

String.prototype.contains = function(test) {
    if (this.indexOf(test) != -1) {
        return true;
    } else {
        return false;
    }
};

export default async function(context) {
    // context.x_state; shareable var scope contents between commands and methods.
    let null_template = {
        hint: 'Allowed node type that must be ommited',
        func: async function(node, state) {
            return context.reply_template({
                hasChildren: false,
                state
            });
        }
    };
    const getTranslatedTextVar = function(text) {
        let vars = context.dsl_parser.findVariables({
            text,
            symbol: `**`,
            symbol_closing: `**`
        });
        let new_vars = context.dsl_parser.replaceVarsSymbol({
            text,
            from: {
                open: `**`,
                close: `**`
            },
            to: {
                open: '${',
                close: '}'
            }
        });
        if ('${' + vars + '}' == new_vars) {
            return vars;
        } else {
            return `\`${new_vars}\``;
        }
    };
    // process our own attributes_aliases to normalize node attributes
    const aliases2params = function(x_id, node) {
        let params = {
                refx: node.id
            },
            attr_map = {};
        // read x_id attributes aliases
        if ('attributes_aliases' in context.x_commands[x_id]) {
            let aliases = context.x_commands[x_id].attributes_aliases;
            Object.keys(aliases).map(function(key) {
                aliases[key].split(',').map(alternative_key => {
                    attr_map[alternative_key] = key
                });
            });
        }
        // process mapped attributes
        Object.keys(node.attributes).map(function(key) {
            let value = node.attributes[key];
            let key_use = key.trim().replace(':', '');
            let keytest = key_use.toLowerCase();
            let tvalue = value.toString().replaceAll('$variables.', '')
                .replaceAll('$vars.', '')
                .replaceAll('$params.', '')
                .replaceAll('$config.', 'process.env.')
                .replaceAll('$store.', '$store.state.').trim();
            //
            if (keytest == 'props') {
                value.split(',').map(x => {
                    params[x] = null
                });
            } else if (keytest in attr_map && value != tvalue) {
                // value contains a variable
                if (attr_map[keytest]=='v-model') {
                	params[attr_map[keytest]] = tvalue;
                } else {
                	params[`:${attr_map[keytest]}`] = tvalue;
            	}
            } else if (keytest in attr_map) {
                // literal value
                params[attr_map[keytest]] = tvalue;
            } else {
                // this is an attribute key that is not mapped
                if (value != tvalue) {
                    params[`:${key_use}`] = tvalue;
                } else {
                    params[key_use] = tvalue;
                }
            }
        });
        //
        return params;
    };
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
        'def_config': {...null_template,
            ... {
                x_icons: 'desktop_new',
                x_level: '2',
                x_text_contains: 'config'
            }
        },
        'def_modelos': {...null_template,
            ... {
                x_icons: 'desktop_new',
                x_level: '2',
                x_text_contains: 'modelos'
            }
        },
        'def_assets': {...null_template,
            ... {
                x_icons: 'desktop_new',
                x_level: '2',
                x_text_contains: 'assets'
            }
        },


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
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let params = {};
                // process attributes as variables
                // set vars
                if (typeof state.current_page !== 'undefined') {
                    if (typeof context.x_state.pages[state.current_page] === 'undefined') context.x_state.pages[state.current_page] = {};
                    if ('variables' in context.x_state.pages[state.current_page] === false) context.x_state.pages[state.current_page].variables = {};
                    if ('types' in context.x_state.pages[state.current_page] === false) context.x_state.pages[state.current_page].types = {};
                }
                return resp;
            }
        },

        'def_variables_field': {
            x_priority: 1,
            x_empty: 'icons',
            x_level: '>3',
            x_all_hasparent: 'def_variables',
            hint: 'Campo con nombre de variable observada y tipo',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let params = {},
                    tmp = {
                        type: 'string',
                        field: node.text.trim(),
                        level: node.level - 3
                    };
                //
                if ((tmp.field.contains('[') && tmp.field.contains(']')) ||
                    (tmp.field.contains('{') && tmp.field.contains('}'))) {
                    // this is a script node
                    tmp.type = 'script';
                    tmp.field = `script${node.id}`;

                } else if (tmp.field.contains(':')) {
                    tmp.type = tmp.field.split(':').pop().toLowerCase().trim(); //listlast
                    tmp.field = tmp.field.split(':')[0].trim();
                } else if (node.nodes_raw && node.nodes_raw.length > 0) {
                    // get children nodes, and test that they don't have a help icon.
                    let subnodes = await node.getNodes();
                    let has_event = false;
                    for (let i of subnodes) {
                        if (i.icons.includes('help')) {
                            has_event = true;
                        }
                    }
                    if (has_event == false) {
                        tmp.type = 'object';
                    }
                } else {
                    tmp.type = 'string';
                }
                // process attributes (and overwrite types if needed)
                Object.keys(node.attributes).map(function(keym) {
                    let keytest = keym.toLowerCase().trim();
                    let value = node.attributes[keym];
                    //console.log(`${tmp.field} attr key:${keytest}, value:${value}`);
                    if ('type,tipo,:type,:tipo'.split(',').includes(keytest)) {
                        tmp.type = value.toLowerCase().trim();
                    } else if ('valor,value,:valor,:value'.split(',').includes(keytest)) {
                        let t_value = value.replaceAll('$variables', 'this.')
                            .replaceAll('$vars.', 'this.')
                            .replaceAll('$params.', 'this.')
                            .replaceAll('$config.', 'process.env.')
                            .replaceAll('$store.', 'this.$store.state.');
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
                });
                // assign default value for type, if not defined
                if ('string,text,texto'.split(',').includes(tmp.type)) {
                    if ('value' in params === false) {
                        params.value = '';
                    } else {
                        params.value = params.value.toString();
                    }
                } else if ('script' == tmp.type) {
                    params.value = node.text.trim().replaceAll('&#xa;', '')
                        .replaceAll('&apos;', '"')
                        .replaceAll('&#xf1;', 'ñ');
                    if (params.value.charAt(0) != '[') {
                        params.value = '[' + params.value + ']';
                    }
                    let convertjs = require('safe-eval');
                    try {
                        params.value = convertjs(params.value);
                    } catch (cjerr) {
                        params.value = [{
                            error_in_script_var: cjerr
                        }];
                    }
                    //params.value = JSON.parse('['+params.value+']');

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
                }
                // check and prepare global state
                if (typeof state.current_page !== 'undefined') {
                    if (state.current_page in context.x_state.pages === false) context.x_state.pages[state.current_page] = {};
                    if ('variables' in context.x_state.pages[state.current_page] === false) context.x_state.pages[state.current_page].variables = {};
                    if ('var_types' in context.x_state.pages[state.current_page] === false) context.x_state.pages[state.current_page].var_types = {};
                }
                // assign var info to page state
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
                        let copy_dad = [...resp.state.vars_path];
                        copy_dad.pop();
                        //console.log('my dad path is '+copy_dad.join('.'));
                        let daddy = getVal(context.x_state.pages[state.current_page].variables, copy_dad.join('.'));
                        //console.log('daddy says:',daddy);
                        if (tmp.type == 'script') {
                            // if we are a script node, just push our values, and not ourselfs.
                            params.value.map(i => {
                                daddy.push(i);
                            });
                        } else if (tmp.field != params.value) {
                            // push as object (array of objects)
                            let tmpi = {};
                            tmpi[tmp.field] = params.value;
                            daddy.push(tmpi);
                        } else {
                            // push just the value (single value)
                            daddy.push(params.value);
                        }
                        // re-set daddy with new value
                        setToValue(context.x_state.pages[state.current_page].variables, daddy, copy_dad.join('.'));
                    }
                    resp.state.vars_types.push(tmp.type); // push new var type to vars_types
                    context.x_state.pages[state.current_page].var_types[resp.state.vars_path.join('.')] = tmp.type;
                    resp.state.vars_last_level = tmp.level;
                }
                return resp;
            }
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
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                if (node.text_note != '') resp.open = `//${node.text_note}\n`;
                let text = context.dsl_parser.findVariables({
                    text: node.text,
                    symbol: `"`,
                    symbol_closing: `"`
                });
                // tests return types
                if (text.contains('**') && node.icons.includes('bell')) {
                    let new_vars = getTranslatedTextVar(text);
                    resp.open += `return ${new_vars};\n`;
                } else if (text.contains('$')) {
                    text = text.replaceAll('$params', 'this.')
                        .replaceAll('$variables', 'this.');
                    resp.open += `return ${text};\n`;
                } else if (text.contains('assets:')) {
                    text = context.getAsset(text, 'js');
                    resp.open += `return ${text};\n`;
                } else if (text == '') {
                    resp.open += `return '';\n`;
                } else if (text.charAt(0) == '(' && text.slice(-1) == ')') {
                    text = text.slice(1).slice(0, -1);
                    resp.open += `return ${text};\n`;
                } else {
                    if (context.x_state.central_config.idiomas && context.x_state.central_config.idiomas.contains(',')) {
                        // @TODO add support for i18m
                    } else {
                        resp.open += `return '${text}';\n`;
                    }
                }
                return resp;
            }
        },

        'def_struct': {
            x_icons: 'desktop_new',
            x_text_contains: 'struct',
            x_not_text_contains: 'traducir',
            x_level: '>3',
            hint: 'Crea una variable de tipo Objeto, con los campos y valores definidos en sus atributos.',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let tmp = {};
                if (node.text.contains(',')) {
                    // parse output var
                    tmp.var = node.text.split(',').pop(); //last comma element
                    if (context.hasParentID(node.id, 'def_event_server')) {
                        tmp.var = tmp.var.replaceAll('$variables.', 'resp.')
                            .replaceAll('$vars.', 'resp.')
                            .replaceAll('$params.', 'resp.');
                        tmp.var = (tmp.var == 'resp.') ? 'resp' : tmp.var;
                        tmp.parent_server = true;
                    } else {
                        tmp.var = tmp.var.replaceAll('$variables.', 'this.')
                            .replaceAll('store.', 'this.$store.state.');
                        tmp.var = (tmp.var == 'this.') ? 'this' : tmp.var;
                    }
                    // process attributes
                    let attrs = {...node.attributes
                    };
                    Object.keys(node.attributes).map(function(key) {
                        let keytest = key.toLowerCase().trim();
                        let value = node.attributes[key].trim();
                        if (node.icons.includes('bell')) {
                            value = getTranslatedTextVar(value);
                        } else if (value.contains('assets:')) {
                            value = context.getAsset(value, 'jsfunc');
                        } else {
                            // normalize vue type vars
                            if (tmp.parent_server) {
                                value = value.replaceAll('$variables.', 'resp.')
                                    .replaceAll('$vars.', 'resp.')
                                    .replaceAll('$params.', 'resp.');
                            } else {
                                value = value.replaceAll('$variables.', 'this.')
                                    .replaceAll('$vars.', 'this.')
                                    .replaceAll('$params.', 'this.')
                                    .replaceAll('$store.', 'this.$store.state.');
                            }
                        }
                        // modify values to copy
                        attrs[key] = value;
                    });
                    // write output
                    if (node.text_note != '') resp.open = `// ${node.text_note}\n`;
                    resp.open += `var ${tmp.var.trim()} = ${JSON.stringify(attrs)};\n`;

                } else {
                    resp.valid = false;
                }
                return resp;
            }
        },

        //*def_responder (@todo i18n)
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
    }
};

//private helper methods
function setObjectKeys(obj, value) {
    let resp = obj;
    if (typeof resp === 'string') {
        resp = {};
        let keys = obj.split(',');
        for (let i in keys) {
            resp[keys[i]] = value;
        }
    } else {
        for (let i in resp) {
            resp[i] = value;
        }
    }
    return resp;
}

function setToValue(obj, value, path) {
    var i;
    path = path.split('.');
    for (i = 0; i < path.length - 1; i++)
        obj = obj[path[i]];

    obj[path[i]] = value;
}

function getVal(project, myPath) {
    return myPath.split('.').reduce((res, prop) => res[prop], project);
}