module.exports = async function(context) {
	// context.x_state; shareable var scope contents between commands and methods.
    String.prototype.replaceAll = function(strReplace, strWith) {
        // See http://stackoverflow.com/a/3561711/556609
        var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        var reg = new RegExp(esc, 'ig');
        return this.replace(reg, strWith);
    };
    
    String.prototype.cleanLines = function() {
        var esc = '\n'.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        var reg = new RegExp(esc, 'ig');
        return this.replace(reg, '').trim();
    };
    
    String.prototype.contains = function(test) {
        if (typeof this === 'string' && this.indexOf(test) != -1) {
            return true;
        } else {
            return false;
        }
    };
    
    String.prototype.right = function(chars) {
        return this.substr(this.length-chars);
    };
    
    function setImmediatePromise() {
        //for preventing freezing node thread within loops (fors)
        return new Promise((resolve) => {
          setImmediate(() => resolve());
        });
    }
    //
    let null_template = {
        hint: 'Allowed node type that must be ommited',
        func: async function(node, state) {
            return context.reply_template({
                hasChildren: false,
                state
            });
        }
    };
    const parseInputOutput = async function(node,state) {
        //get vars and attrs
        let tmp = { var:'', original:'' };
        if (node.text.includes(',')) tmp.var = node.text.split(',').pop().trim();
        //prepare new var
        if (tmp.var.includes('$')) {
            if (state.from_server) {
                tmp.var = tmp.var.replaceAll('$variables.', 'resp.')
                                .replaceAll('$vars.', 'resp.')
                                .replaceAll('$params.', 'resp.');
            } else {
                tmp.var = tmp.var.replaceAll('$variables.', 'this.')
                                .replaceAll('$vars.', 'this.')
                                .replaceAll('$params.', 'this.')
                                .replaceAll('$config.', 'process.env.')
                                .replaceAll('$store.', 'this.$store.state.');
                if (tmp.var=='this.') tmp.var='this';
            }
        }
        //prepare original var
        tmp.original = context.dsl_parser.findVariables({
            text: node.text,
            symbol: `"`,
            symbol_closing: `"`
        });
        if (tmp.original.includes('**') && node.icons.includes('bell')) {
            tmp.original = getTranslatedTextVar(tmp.original);
        } else if (tmp.original.includes('$')) {
            if (state.from_server) {
                tmp.original = tmp.original.replaceAll('$variables.', 'resp.')
                                            .replaceAll('$vars.', 'resp.')
                                            .replaceAll('$params.', 'resp.');
            } else {
                tmp.original = tmp.original.replaceAll('$variables.', 'this.')
                                            .replaceAll('$vars.', 'this.')
                                            .replaceAll('$params.', 'this.')
                                            .replaceAll('$config.', 'process.env.')
                                            .replaceAll('$store.', 'this.$store.state.');
                if (tmp.original=='this.') tmp.original='this';
            }
        }
        return { input:tmp.original, output:tmp.var };
    };

    const getTranslatedTextVar = function(text,keep_if_same=false) {
        let vars = context.dsl_parser.findVariables({
            text,
            symbol: `**`,
            symbol_closing: `**`
        });
        //console.log('translated text:'+text,vars);
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
        //console.log('translated new_vars text:'+text,new_vars);
        if ('${' + vars + '}' == new_vars) {
            if (keep_if_same==true) return text;
            return vars;
        } else {
            return `\`${new_vars}\``;
        }
    };
    // process our own attributes_aliases to normalize node attributes
    const aliases2params = function(x_id, node, escape_vars, variables_to='') {
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
            let key_use = key.trim();
            if (key_use.charAt(0)==':') key_use = key_use.right(key_use.length-1);
            let keytest = key_use.toLowerCase();
            let tvalue = value.toString().replaceAll('$variables.', variables_to)
                .replaceAll('$vars.', variables_to)
                .replaceAll('$params.', variables_to)
                .replaceAll('$config.', 'process.env.')
                .replaceAll('$store.', variables_to+'$store.state.').trim();
            if (tvalue.charAt(0)=='$' && tvalue.includes('$store')==false) {
                tvalue = tvalue.right(tvalue.length-1);
            }
            //
            //tvalue = getTranslatedTextVar(tvalue);
            if (keytest == 'props') {
                value.split(' ').map(x => {
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
                if (value != tvalue || value[0]=="$" || value[0]=="!" || key.charAt(0)==':' ) {
                    if (escape_vars && escape_vars==true) {
                        tvalue = tvalue.replaceAll('{{','').replaceAll('}}','');
                    }
                    if (keytest!='v-model') {
                        params[`:${key_use}`] = tvalue;
                    } else {
                        params[key_use] = tvalue;
                    }
                } else {
                    params[key_use] = tvalue;
                }
            }
        });
        //
        return params;
    };
    
    return {
        //'cancel': {...null_template,...{ x_icons:'button_cancel'} },
        'meta': {...null_template, ...{
                name: 'AWS EB / NodeJS Express',
                version: '0.0.2',
                x_level: '2000',
            }
        },
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


        // ********************
        //  Express Methods
        // ********************

        'def_path': {
            x_icons: 'list',
            x_level: '>1',
            x_icons: 'list',
            x_not_icons: 'button_cancel,desktop_new,help',
            hint: 'Carpeta para ubicacion de funcion de servidor',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                //console.log('def_server_path DEBUG',node);
                if (node.icons.includes('password')) {
                    resp.state.public_access = false;
                }
                let test1 = await context.isExactParentID(node.id, 'def_path');
                if (node.level == 2) {
                    //state.current_folder = node.text;
                    resp.state.current_folder = node.text;
                } else if (node.level == 3 && test1==true) {
                    let parent_node = await context.dsl_parser.getParentNode({
                        id: node.id
                    });
                    //state.current_folder = `${parent_node.text}/${node.id}`;
                    resp.state.current_folder = `${parent_node.text}/${node.text}`;
                } else {
                    resp.valid = false;
                }
                return resp;
            }
        },
        'def_function': { //@TODO finish incomplete
            x_empty: 'icons',
            x_level: '>2',
            x_or_hasparent: 'def_path',
            hint: 'Corresponde a la declaracion de una funcion de servidor',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                resp.state.current_func = node.text;
                if (node.level != 2) {
                    let new_name = resp.state.current_folder?resp.state.current_folder.split('/'):[];
                    resp.state.current_func = [...new_name,node.text].join('_');
                    //console.log('@TODO! def_server_func: new_name',new_name);
                }
                // set function defaults
                if (!context.x_state.functions[resp.state.current_func]) {
                    context.x_state.functions[resp.state.current_func] = {
                        tipo: 'web',
                        acceso: '*',
                        params: '',
                        param_doc: {},
                        doc: node.text_note,
                        method: 'get',
                        return: '',
                        visible: (resp.state.public_access)?resp.state.public_access:true,
                        path: '/' + (resp.state.current_folder?resp.state.current_folder+'/':'') + node.text,
                        imports: {},
                        used_models: {}
                    };
                }
                // process attributes
                Object.keys(node.attributes).map(function(keym) {
                    let key = keym.toLowerCase();
                    if ([':type', 'type', 'tipo', ':tipo',':method','method'].includes(key)) {
                        context.x_state.functions[resp.state.current_func].method = node.attributes[key];
                    } else if (['schedule',':schedule'].includes(key)) {
                        //auto-called method
                        //@todo create this (ref:321 cfc)
                    } else if (['schedule:params','schedule:query',':schedule:params',':schedule:query'].includes(key)) {
                        //auto-called method params
                        let value = node.attributes[key];
                        if (value.includes('&') && value.includes(',')==false) {
                            value = value.replaceAll('&',',');
                        }
                        context.x_state.functions[resp.state.current_func]['schedule:params']=value;

                    } else if (['visible',':visible'].includes(key)) {
                        context.x_state.functions[resp.state.current_func].visible = node.attributes[key];
                    } else {
                        if (key.includes(':')) {
                            context.x_state.functions[resp.state.current_func].param_doc[key.split(':')[0]] = { type:key.split(':')[1], desc:node.attributes[key] };
                        } else {
                            context.x_state.functions[resp.state.current_func][key.toLowerCase().trim()] = node.attributes[key];
                        }
                    }
                    //
                });
                // write tag code
                resp.open += `self.${resp.state.current_func} = async (req, res, asfunc) => {\n`;
                if (context.x_state.functions[resp.state.current_func].method=='get') {
                    resp.open += `let params = req.params;\n`;
                } else {
                    resp.open += `let params = req.body;\n`;
                }
                resp.open += `{ ${resp.state.current_func}_init }\n`; //placeholder for used (to be defined later) db connections
                if (context.x_state.functions[resp.state.current_func].return!='') {
                    resp.open +=   `if (asfunc) {
                                        return ${context.x_state.functions[resp.state.current_func].return};\n
                                    } else {
                                        res.send(${context.x_state.functions[resp.state.current_func].return});
                                    }\n`;
                }
                resp.close = `}\n`;
                context.x_state.functions[resp.state.current_func].code=resp;
                /*
                resp.open = context.tagParams('func_code', {
                    name: resp.state.current_func,
                    method: context.x_state.functions[resp.state.current_func].method,
                    path: context.x_state.functions[resp.state.current_func].path
                }, false) + '\n';
                resp.close = '</func_code>';
                *///
                return resp;
            }
        },

        //*def_page

        'def_page': {
            x_level: 2,
            x_not_icons: 'button_cancel,desktop_new,list,help',
            x_not_text_contains: 'componente:,layout:',
            hint: 'Archivo vue',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                resp.state.current_page = node.text;
                // set global page defaults for current page
                if (!context.x_state.pages[resp.state.current_page]) {
                    context.x_state.pages[resp.state.current_page] = {
                        tipo: 'page',
                        acceso: '*',
                        params: '',
                        layout: '',
                        defaults: {},
                        imports: {},
                        components: {},
                        directives: {},
                        variables: {},
                        seo: {},
                        meta: {},
                        head: {
                            script: [],
                            meta: [],
                            seo: {}
                        },
                        var_types: {},
                        proxies: '',
                        return: '',
                        styles: {},
                        script: {},
                        mixins: {},
                        track_events: {},
                        path: '/' + resp.state.current_page
                    };
                }
                if (resp.state.from_def_layout) context.x_state.pages[resp.state.current_page].tipo = 'layout';
                if (resp.state.from_def_componente) context.x_state.pages[resp.state.current_page].tipo = 'componente';
                // is this a 'home' page ?
                if (node.icons.includes('gohome')) context.x_state.pages[resp.state.current_page].path = '/';
                // attributes overwrite anything
                let params = {};
                Object.keys(node.attributes).map(function(key) {
                    let value = node.attributes[key];
                    // preprocess value
                    value = value.replaceAll('$variables.', '')
                        .replaceAll('$vars.', '')
                        .replaceAll('$params.', '')
                        .replaceAll('$config.', 'process.env');
                    // query attributes
                    if (['proxy'].includes(key.toLowerCase())) {
                        context.x_state.pages[resp.state.current_page].proxies = value;

                    } else if (['acceso', 'method'].includes(key.toLowerCase())) {
                        context.x_state.pages[resp.state.current_page].acceso = value;

                    } else if (['path', 'url', 'ruta'].includes(key.toLowerCase())) {
                        context.x_state.pages[resp.state.current_page].path = value;

                    } else if (['layout'].includes(key.toLowerCase())) {
                        context.x_state.pages[resp.state.current_page].layout = value;

                    } else if (['meta:title', 'meta:titulo'].includes(key.toLowerCase())) {
                        context.x_state.pages[resp.state.current_page].xtitle = value;

                    } else {
                        if (key.charAt(0) != ':' && value != node.attributes[key]) {
                            params[':' + key] = value;
                        } else {
                            params[key] = value;
                        }
                        //context.x_state.pages[resp.state.current_page].xtitle = value;
                        
                    }
                    if (resp.state.from_def_layout || resp.state.from_def_componente) {
                        if (key=='params') {
                            context.x_state.pages[resp.state.current_page].params=value;
                        } else if (key.includes('params:') || key.includes('param:')) {
                            let tmpo = key.replaceAll('params:','').replaceAll('param:','').trim();
                            context.x_state.pages[resp.state.current_page].defaults[tmpo] = value;
                        }
                        //console.log('PABLO COMPONENTE!! o LAYOUT!!',{ key, value });
                    }
                }.bind(this));
                // has comments ?
                if (node.text_note != '') {
                    resp.open = `<!-- ${node.text_note.cleanLines()} -->\n`;
                }
                // set code
                resp.open += `<template>\n`;
                if ('from_def_componente' in resp.state === false) {
                    if (context.x_state.pages[resp.state.current_page]['layout'] == '') {
                        resp.open += '\t' + context.tagParams('v-app', params, false) + '\n';
                        resp.close += '\t</v-app>\n';
                    }
                }
                resp.close += `</template>\n`;
                // return
                return resp;
            }
        },

        //condicion_view gets called by condicion_script, but we prevent its detection intentionally
        'def_condicion': {
            x_icons: 'help',
            x_level: '>2',
            x_text_contains: 'condicion si',
            x_text_pattern: [
            `condicion si "*" +(es|no es|es menor a|es menor o igual a|es mayor a|es mayor o igual a|es menor que|es menor o igual que|es mayor que|es mayor o igual que|esta entre|contiene registro|contiene|contiene item) "*"`,
            `condicion si "*" es +(objeto|array|struct|string|texto)`,
            `condicion si "*" es +(numero|entero|int|booleano|boleano|boolean|fecha|date|email)`,
            `condicion si "*" no es +(numero|entero|int|booleano|boleano|boolean|fecha|date|email)`,
            `condicion si "*" +(esta vacia|esta vacio|is empty|existe|exists|no es indefinido|no es indefinida|esta definida|no esta vacio|existe|esta definida|no es nula|no es nulo|es nula|not empty)`,
            `condicion si "*" +(no contiene registros|contiene registros)`,
            `condicion si "*" esta entre "*" inclusive`,
            `condicion si falta parametro "*"`,
            ],
            hint:   `Declara que los hijo/s deben cumplir la condicion indicada para ser ejecutados.`,
            func: async function(node, state) {
                let resp = context.reply_template({
                    state,
                    hasChildren: true
                });
                let isNumeric = function(n) {
                    return !isNaN(parseFloat(n)) && isFinite(n);
                };
                //if (resp.state.from_script && resp.state.from_script==true) return {...resp,...{ valid:false }};
                // detect which pattern did the match.
                let match = require('minimatch');
                let which = -1;
                let text_trim = node.text.trim();
                for (let x of context.x_commands['def_condicion'].x_text_pattern) {
                    which+=1;
                    let test = match(text_trim,x);
                    if (test==true) break;
                    await setImmediatePromise(); //@improved
                };

                // extract the values
                let extract = require('extractjs')();
                let defaults = { variable:'', operator:'es', value:'' };
                let patterns = [
                    `condicion si "{variable}" {operator} "{value}"`,
                    `condicion si "{variable}" {operator}`,
                    `condicion si "{variable}" {operator}`,
                    `condicion si "{variable}" {operator}`,
                    `condicion si "{variable}" {operator}`,
                    `condicion si "{variable}" {operator}`,
                    `condicion si "{variable} esta entre "{value}" inclusive`,
                    `condicion si {operator} "{value}"`,
                ];
                
                let elements = {...defaults,...extract(patterns[which],text_trim)};
                // pre-process elements
                if (typeof elements.variable === 'string' && elements.variable.includes('**') && node.icons.includes('bell')) elements.variable = getTranslatedTextVar(elements.variable);
                if (typeof elements.value === 'string' && elements.value.includes('**') && node.icons.includes('bell')) elements.value = getTranslatedTextVar(elements.value);
                if (typeof elements.variable === 'string' && (elements.variable.includes('$variables.') || 
                    elements.variable.includes('$vars.') ||
                    elements.variable.includes('$params.') ||
                    elements.variable.includes('$store.') ||
                    elements.variable.includes('$route.'))
                    ) {
                } else if (typeof elements.variable === 'string' && elements.variable.charAt(0)=='$') {
                    elements.variable = elements.variable.right(elements.variable.length-1);
                }
                // test for siblings conditions
                elements.type = 'v-if';
                let before_me = await context.dsl_parser.getBrotherNodesIDs({ id:node.id, before:true, after:false, array:true });
                if (before_me.length>0) {
                    if (before_me[0].TEXT && before_me[0].TEXT.includes('condicion si')) {
                        elements.type = 'v-else-if'
                    }
                }
                let escape_value = function(value2) {
                    //@todo apply below 13may21
                    let value = value2;
                    if (typeof value !== 'undefined') {
                        if ((typeof value === 'string' && isNumeric(value) && value.charAt(0)!='0') ||
                            !isNaN(value) || 
                            (typeof value === 'string' && (value=='true' || value=='false')) ||
                            (typeof value === 'string' && (value.charAt(0)=='$') || value.includes('this.'))
                            ) {
                            //value = value;
                        } else {
                            value = `'${value}'`;
                        }
                    }
                    return value;
                };
                // tag params
                let params = aliases2params('def_condicion',node);
                params = {...params, ...{
                    target: 'template',
                    tipo: elements.type,
                    operador: elements.operator,
                    valor: elements.value
                }};
                let sons = await node.getNodes();
                if (sons.length==1) params.target=sons[0].id; //.id
                if (params.individual && (params.individual==true || params.individual=='true')) {
                    params.tipo = 'v-if'; elements.type = 'v-if';
                    delete params.individual;
                }
                // get full expression, depending on operator
                if (elements.operator=='idioma es') {
                    params.expresion = `this.$i18n && this.$i18n.locale=='${elements.variable}'`;
                } else if (['es','=','eq'].includes(elements.operator)) {
                    if (elements.value==true && elements.value!=1) {
                        params.expresion = elements.variable;
                    } else if (elements.value==false && elements.value!=0) {
                        params.expresion = '!'+elements.variable;
                    } else if (typeof elements.value === 'string' && (
                        elements.value.includes('$variables.') || 
                        elements.value.includes('$vars.') ||
                        elements.value.includes('$params.') ||
                        elements.value.includes('$store.') ||
                        elements.value.includes('this.')
                    )) {
                        params.expresion = `${elements.variable} == ${elements.value}`;
                    } else if (typeof elements.value === 'number') {
                        params.expresion = `${elements.variable} == ${elements.value}`;
                    } else if (typeof elements.value === 'string' &&
                                elements.value.charAt(0)=='(' && elements.value.right(1)==')') {
                        let temp = elements.value.substr(1,elements.value.length-2);
                        params.expresion = `${elements.variable} == ${temp}`;
                    } else if (typeof elements.value === 'string' &&
                        elements.value.charAt(0)=='$' && elements.value.includes(`$t('`)==false) {
                        let temp = elements.value.right(elements.value.length-1);
                        params.expresion = `${elements.variable} == ${temp}`;
                    } else if (typeof elements.value === 'string' && (elements.value=='true' || elements.value=='false' || isNumeric(elements.value))) {
                        params.expresion = `${elements.variable} == ${elements.value}`;
                    } else {
                        params.expresion = `${elements.variable} == ${escape_value(elements.value)}`;
                    }

                } else if ('es string,es texto,string,texto'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isString(${elements.variable})`;

                } else if ('falta parametro'.split(',').includes(elements.operator)) {
                    if (elements.value=='*') {
                        let func_params = context.x_state.functions[resp.state.current_func].params.split(',');
                        let each_test = [];
                        for (let param of func_params) {
                            if (param.right(1)=='*') {
                                let without_star = param.replaceAll('*','');
                                each_test.push(`(!_.has(params,'${without_star}') || 
                                                  _.isUndefined(params.${without_star}) || 
                                                  _.isNull(params.${without_star})
                                                )`);
                            }
                        }
                        params.expresion = `${each_test.join(' && ')}`;
                        //console.log('PABLO debug falta parametros',func_params);
                    } else {
                        let test = 'params';
                        if (context.x_state.functions[resp.state.current_func].method!='get') {
                            test = 'body';
                        }
                        params.expresion = `(!_.has(req.${test},'${elements.value}') ||
                                            _.isUndefined(req.${test}.${elements.value}) ||
                                            _.isNull(req.${test}.${elements.value})
                                            )`;
                    }

                } else if ('es numero,es int,numero,int'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isNumber(${elements.variable})`;

                } else if ('es boolean,es boleano,es booleano,booleano,boleano,boolean'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isBoolean(${elements.variable})`;
                
                } else if ('es fecha,es date,fecha,date'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isDate(${elements.variable})`;
                
                } else if ('es entero,es int,entero,int'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isFinite(${elements.variable})`;
                
                } else if ('es array,array'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isArray(${elements.variable})`;

                } else if ('es struct,struct'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isObject(${elements.variable}) && !_.isArray(${elements.variable}) && !_.isFunction(${elements.variable})`;

                } else if ('es objeto,objeto'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isObject(${elements.variable})`;
                
                } else if ('es correo,es email,email,correo'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isString(${elements.variable}) && /\\S+@\\S+\\.\\S+/.test(${elements.variable})`;

                } else if ('no es correo,no es email'.split(',').includes(elements.operator)) {
                    params.expresion = `!(_.isString(${elements.variable}) && /\\S+@\\S+\\.\\S+/.test(${elements.variable}))`;

                //numeric testings
                } else if ('es menor o igual a,es menor o igual que'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isNumber(${elements.variable}) && _.isNumber(${elements.value}) && ${elements.variable} <= ${elements.value}`;
                
                } else if ('es menor a,es menor que'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isNumber(${elements.variable}) && _.isNumber(${elements.value}) && ${elements.variable} < ${elements.value}`;

                } else if ('es mayor o igual a,es mayor o igual que'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isNumber(${elements.variable}) && _.isNumber(${elements.value}) && ${elements.variable} >= ${elements.value}`;

                } else if ('es mayor a,es mayor que'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isNumber(${elements.variable}) && _.isNumber(${elements.value}) && ${elements.variable} > ${elements.value}`;

                } else if ('esta entre'==elements.operator && elements.value.includes(',')) {
                    let from = elements.value.split(',')[0];
                    let until = elements.value.split(',').pop();
                    params.expresion = `${elements.variable} >= ${from} && ${elements.variable} <= ${until}`;

                // strings
                } else if ('no esta vacio,not empty'.split(',').includes(elements.operator)) {
                    params.expresion = `(_.isObject(${elements.variable}) || (_.isString(${elements.variable})) &&  !_.isEmpty(${elements.variable})) || _.isNumber(${elements.variable}) || _.isBoolean(${elements.variable})`;

                } else if ('esta vacio,is empty,esta vacia'.split(',').includes(elements.operator)) {
                    params.expresion = `(_.isObject(${elements.variable}) ||_.isString(${elements.variable})) &&  _.isEmpty(${elements.variable})`;

                // other types
                } else if ('existe,exists,no es indefinido,no es indefinida,esta definida'.split(',').includes(elements.operator)) {
                    params.expresion = `!_.isUndefined(${elements.variable})`;

                } else if ('no existe,doesnt exists,es indefinido,es indefinida,no esta definida'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isUndefined(${elements.variable})`;

                } else if ('no es nula,no es nulo'.split(',').includes(elements.operator)) {
                    params.expresion = `!_.isNull(${elements.variable})`;

                } else if ('es nula,es nulo'.split(',').includes(elements.operator)) {
                    params.expresion = `_.isNull(${elements.variable})`;

                } else if ('no es,!=,neq'.split(',').includes(elements.operator)) {
                    params.expresion = `${elements.variable}!=${escape_value(elements.value)}`;

                // records
                } else if ('no contiene registros,contains no records'.split(',').includes(elements.operator)) {
                    params.expresion = `${elements.variable} && ${elements.variable}.length==0`;

                } else if ('contiene registros,contains records'.split(',').includes(elements.operator)) {
                    params.expresion = `${elements.variable} && ${elements.variable}.length`; //@todo check if this needs to be .length>0

                } else if ('contiene registro,contiene item'.split(',').includes(elements.operator)) {
                    params.expresion = `_.contains(${elements.variable},${escape_value(elements.value)})`;

                } else if ('contiene,contains'.split(',').includes(elements.operator)) {
                    params.expresion = `${elements.variable}.toLowerCase().indexOf(${escape_value(elements.value)}.toLowerCase())!=-1`;

                } else {
                    //operator not defined
                    context.x_console.outT({ message:`Operator (${elements.operator}) not defined in 'condicion si' x_command`, color:'red', data:{elements,params,which} });
                    throw `Operator ${elements.operator} not defined in '${node.text}'`;
                    //params.expresion = `(AQUI VAMOS: ${node.text})`;
                }

                //comments?
                if (node.text_note != '') resp.open += `<!-- ${node.text_note.cleanLines()} -->\n`;
                // prepare expressions
                let expresion_js = params.expresion. replaceAll('$variables.','this.')
                                                    .replaceAll('$vars.','this.')                                   
                                                    .replaceAll('$params.','this.');
                let expresion_view = params.expresion.   replaceAll('$variables.','')
                                                        .replaceAll('$vars.','')
                                                        .replaceAll('$params.','');
                if (state.current_proxy) {
                    expresion_js = expresion_js.replaceAll('$store.','store.state.');
                    expresion_view = expresion_view.replaceAll('$store.','store.state.');
                } else {
                    expresion_js = expresion_js.replaceAll('$store.','this.$store.state.');
                    expresion_view = expresion_view.replaceAll('$store.','$store.state.');
                }
                //resp.state.meta = { if_js:expresion_js, if_view:expresion_view, params, elements };
                //code
                if (node.text_note != '') resp.open = `/* ${node.text_note.cleanLines()} */\n`;
                if (params.tipo=='v-if') {
                    resp.open += `if (${expresion_js}) {\n`;
                } else {
                    resp.open += `else if (${expresion_js}) {\n`;
                }
                resp.close = `}\n`;

                // prepare virtual vars for underscore support
                if (params.expresion && params.expresion.includes('_.')) {
                    context.x_state.functions[resp.state.current_func].imports['underscore'] = '_';
                }
                return resp;
            }
        },

        'def_otra_condicion': {
            x_icons: 'help',
            x_level: '>2',
            x_text_exact: 'otra condicion',
            hint:   `Ejecuta sus hijos en caso de no cumplirse la condicion anterior.`,
            func: async function(node, state) {
                let resp = context.reply_template({
                    state,
                    hasChildren: true
                });
                //if (!resp.state.from_script || (resp.state.from_script && resp.state.from_script==false)) return {...resp,...{ valid:false }};
                //code
                if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                resp.open += `else {\n`;
                resp.close = `}\n`;
                return resp;
            }
        },

        //*def_condicion_view
        //*def_otra_condicion_view
        //*def_condicion (def_script_condicion)
        //*def_otra_condicion (def_script_otra_condicion)

        // *************************
        //  Scriptable definitions
        // *************************

        //..scripts..
        'def_responder': {
            x_icons: 'desktop_new',
            //x_text_pattern: `responder "*"`,
            x_text_contains: `responder "`,
            x_or_hasparent: 'def_variables,def_event_element,def_event_method',
            x_level: '>3',
            hint: 'Emite una respuesta para la variable de tipo funcion o evento :rules',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                let text = context.dsl_parser.findVariables({
                    text: node.text,
                    symbol: `"`,
                    symbol_closing: `"`
                });
                // tests return types
                if (text.includes('**') && node.icons.includes('bell')) {
                    let new_vars = getTranslatedTextVar(text);
                    resp.open += `return ${new_vars};\n`;
                } else if (text.includes('$')) {
                    text = text.replaceAll('$params.', 'this.')
                        .replaceAll('$variables.', 'this.');
                    resp.open += `return ${text};\n`;
                } else if (text.includes('assets:')) {
                    text = context.getAsset(text, 'js');
                    resp.open += `return ${text};\n`;
                } else if (text == '') {
                    resp.open += `return '';\n`;
                } else if (text.charAt(0) == '(' && text.slice(-1) == ')') {
                    text = text.slice(1).slice(0, -1);
                    resp.open += `return ${text};\n`;
                } else {
                    if (context.x_state.central_config.idiomas && context.x_state.central_config.idiomas.includes(',')) {
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
            x_text_contains: 'struct,,',
            x_not_text_contains: 'traducir',
            x_level: '>3',
            hint: 'Crea una variable de tipo Objeto, con los campos y valores definidos en sus atributos.',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let tmp = {};
                // parse output var
                tmp.var = node.text.split(',').pop().trim(); //last comma element
                if (resp.state.from_server) { // if (context.hasParentID(node.id, 'def_event_server')==true) {
                    tmp.var = tmp.var.replaceAll('$variables.', 'resp.')
                        .replaceAll('$vars.', 'resp.')
                        .replaceAll('$params.', 'resp.');
                    tmp.var = (tmp.var == 'resp.') ? 'resp' : tmp.var;
                    tmp.parent_server = true;
                } else {
                    tmp.var = tmp.var.replaceAll('$variables.', 'this.');
                    tmp.var = (tmp.var == 'this.') ? 'this' : tmp.var;
                }
                // process attributes
                let attrs = {...node.attributes
                };
                Object.keys(node.attributes).map(function(key) {
                    let keytest = key.toLowerCase().trim();
                    let value = node.attributes[key].trim();
                    if (node.icons.includes('bell') && value.includes('**')) {
                        value = getTranslatedTextVar(value,true);
                    } else {
                        // normalize vue type vars
                        if (tmp.parent_server==true) {
                            value = value.replaceAll('$variables.', 'resp.')
                                .replaceAll('$vars.', 'resp.')
                                .replaceAll('$params.', 'resp.');
                        } else {
                            value = value.replaceAll('$variables.', 'this.')
                                .replaceAll('$config.', 'process.env.');
                        }
                    }
                    attrs[key] = value; //.replaceAll('{now}','new Date()');
                });
                // write output
                if (resp.state.as_object) {
                    resp.state.object = attrs;
                    resp.open = context.jsDump(attrs).replaceAll("'`","`").replaceAll("`'","`");
                    delete resp.state.as_object;
                } else {
                    if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                    resp.open += `let ${tmp.var.trim()} = ${context.jsDump(attrs).replaceAll("'`","`").replaceAll("`'","`")};\n`;
                }
                return resp;
            }
        },

        'def_extender': {
            x_level: '>3',
            x_text_contains: `extender "`,
            x_icons: 'desktop_new',
            hint: 'Extiende los atributos de un objeto con los datos dados en los atributos.',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                // create obj from current node as js obj
                let obj = await context.x_commands['def_struct'].func(node, { ...state, ...{
                    as_object:true
                }});
                // get var name
                let tmp = {};
                tmp.var = context.dsl_parser.findVariables({
                    text: node.text,
                    symbol: '"',
                    symbol_closing: '"'
                }).trim();
                // clean given varname $variables, etc.
                if ((await context.hasParentID(node.id, 'def_event_server'))==true) { //@todo change after checking (revision) concepto inherited states; if (resp.state.from_server) {
                    tmp.var = tmp.var.replaceAll('$variables.', 'resp.')
                                     .replaceAll('$vars.', 'resp.').replaceAll('$params.', 'resp.');
                    tmp.var = (tmp.var == 'resp.') ? 'resp' : tmp.var;
                } else {
                    tmp.var = tmp.var.replaceAll('$variables.', 'this.').replaceAll('store.', 'this.$store.state.');
                    tmp.var = (tmp.var == 'this.') ? 'this' : tmp.var;
                }
                // extend given var with 'extend_node' content
                // support attr = !attr - 13may21
                for (let x in obj.state.object) {
                    if (obj.state.object[x].charAt(0)=='!' &&
                        obj.state.object[x].includes('this.')==false) {
                            obj.state.object[x] = obj.state.object[x].replaceAll('!',`!${tmp.var}.`);
                    }
                }
                tmp.nobj = context.jsDump(obj.state.object);
                //underscore
                /* @todo add to npm 
                if (state.current_page) {
                    context.x_state.pages[resp.state.current_page].imports['underscore'] = '_';
                } else if (state.current_proxy) {
                    context.x_state.proxies[resp.state.current_proxy].imports['underscore'] = '_';
                } else if (state.current_store) {
                    context.x_state.stores[resp.state.current_store].imports['underscore'] = '_';
                }*/
                if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                //resp.open = `${tmp.var} = {...${tmp.var},...${tmp.nobj}};\n`;
                resp.open += `${tmp.var} = _.extend(${tmp.var}, ${tmp.nobj});\n`;
                return resp;
            }
        },

        'def_literal_js': {
            x_icons: 'penguin',
            x_not_text_contains: 'por cada registro en',
            x_level: '>1',
            hint: 'Nodo JS literal; solo traduce $variables y referencias de refrescos a metodos async.',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let tmp = { text:node.text };
                tmp.text = tmp.text .replaceAll('$variables.','this.')
                                    .replaceAll('$config.','process.env.');
                //code
                if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                resp.open += tmp.text;
                if (resp.open.right(1)!=';') resp.open += ';';
                resp.open += '\n';
                return resp;
            }
        },

        'def_console': {
            x_icons: 'clanbomber',
            x_not_icons: 'desktop_new',
            x_level: '>1',
            hint: 'Emite su texto a la consola. Soporta mostrar los datos/variables de sus atributos.',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let tmp = { text:node.text };
                if (node.icons.includes('bell')) {
                    tmp.text = getTranslatedTextVar(tmp.text);
                } else {
                    tmp.text = `'${tmp.text}'`;
                }
                //attr
                // process attributes
                let attrs = {...node.attributes
                };
                Object.keys(node.attributes).map(function(key) {
                    let keytest = key.toLowerCase().trim();
                    let value = node.attributes[key].trim();
                    let valuet = getTranslatedTextVar(value);
                    // normalize vue type vars                        
                    value = value.replaceAll('$variables.', 'this.');
                    //bell
                    if (node.icons.includes('bell') && value.replaceAll('**','')!=valuet) { // && value!=`**${valuet}**`) {
                        value = getTranslatedTextVar(value);
                    } else if (!node.icons.includes('bell') && value.includes('**')) {
                        value = `'${value}'`;
                    }
                    // modify values to copy
                    attrs[key] = value;
                });
                //code
                if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                resp.open += `console.log(${tmp.text},${context.jsDump(attrs)});\n`;
                return resp;
            }
        },

        'def_npm_instalar': {
            x_icons: 'desktop_new',
            x_text_pattern: [`npm:+(install|instalar) "*"`,`npm:+(install|instalar) "*",*`],
            x_level: '>2',
            hint: 'Instala el paquete npm indicado entrecomillas y lo instancia en la página (import:true) o función actual, o lo asigna a la variable indicada luego de la coma.',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let defaults = { text:node.text, tipo:'import', tipo_:'', version:'*', git:'', init:'' };
                let attr = aliases2params('def_npm_instalar', node);  
                attr = {...defaults, ...attr};
                if (attr.import && attr.import!='true') attr.tipo_ = attr.import;
                attr.text = context.dsl_parser.findVariables({
                    text: node.text,
                    symbol: '"',
                    symbol_closing: '"'
                }).trim();
                attr.var = attr.tipo_ = node.text.split(',').pop();
                //code
                context.x_state.npm[attr.text] = attr.version;
                if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                if (!attr.require) {
                    if ('current_func' in resp.state) {
                        context.x_state.functions[resp.state.current_func].imports[attr.text] = attr.tipo_;
                    } else {
                        context.x_state.pages[resp.state.current_page].imports[attr.text] = attr.tipo_;
                    }
                } else {
                    resp.open += `let ${attr.var} = require('${attr.text}');\n`;
                }
                return resp;
            }
        },

        'def_crear_id_unico': {
            x_icons: 'desktop_new',
            x_text_contains: 'crear id unico,,', //,,=requires comma
            x_level: '>2',
            hint: 'Obtiene un id unico (en 103 trillones) y lo asigna a la variable luego de la coma.',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let tmp = { var:node.text.split(',').pop() };
                //code
                if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                context.x_state.npm['nanoid']='2.1.1';
                resp.open += `let ${tmp.var} = require('nanoid')();\n`;
                return resp;
            }
        },

        'def_aftertime': {
            x_icons: 'desktop_new',
            x_text_pattern: `ejecutar en "*" +(segundos|minutos|horas)`,
            x_level: '>2',
            hint: 'Ejecuta su contenido desfasado en los segundos especificados.',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let time = context.dsl_parser.findVariables({
                    text: node.text,
                    symbol: `"`,
                    symbol_closing: `"`
                }).trim();
                //code
                let amount = node.text.split(' ').pop();
                if (amount=='minutos') time += `*60`;
                if (amount=='horas') time += `*60*60`;
                if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                resp.open += `setTimeout(function q() {\n`;
                resp.close = `}.bind(this), 1000*${time});\n`;
                return resp;
            }
        },

        'def_probar': {
            x_icons: 'broken-line',
            x_text_exact: 'probar',
            x_level: '>2',
            hint: 'Encapsula sus hijos en un try/catch.',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                //test if there is an error node child
                let subnodes = await node.getNodes();
                let has_error = false;
                subnodes.map(async function(item) {
                    if (item.text=='error' && item.icons.includes('help')) has_error=true;
                }.bind(this));
                //code
                if (node.text_note != '') resp.open = `// ${node.text_note.cleanLines()}\n`;
                resp.open += 'try {\n';
                if (has_error==false) {
                    resp.close += `} catch(e${node.id}) {\n console.log('error en comando probar: recuerda usar evento ?error como hijo para controlarlo.');\n`;
                }
                resp.close += '}';
                return resp;
            }
        },

        'def_probar_error': {
            x_icons: 'help',
            x_text_exact: 'error',
            x_all_hasparent: 'def_probar',
            x_level: '>2',
            hint: 'Ejecuta sus hijos si ocurre un error en el nodo padre.',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                //code
                resp.open += `} catch(e${node.id}) {\n`;
                resp.open += `let error = e${node.id};\n`;
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                return resp;
            }
        },

        'def_insertar_modelo': {
            x_icons: 'desktop_new',
            x_text_pattern: [`insertar modelo "*"`,`insertar modelo "*",*`],
            x_level: '>2',
            hint:  `Inserta los atributos (campos) y sus valores en el modelo indicado entrecomillas. 
                    Si especifica una variable luego de la coma, asigna el resultado de la nueva insercion en esa variable.`,
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let tmp = { var:node.id, data:{}, model:'' };
                if (node.text.includes(',')) tmp.var=node.text.split(',').splice(-1)[0].trim();
                tmp.model = context.dsl_parser.findVariables({
                    text: node.text,
                    symbol: `"`,
                    symbol_closing: `"`
                }).trim();
                //get attributes and values as struct
                tmp.data = (await context.x_commands['def_struct'].func(node, { ...state, ...{
                    as_object:true
                }})).open;
                //code
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                resp.open += `this.alasql('INSERT INTO ${tmp.model} VALUES ?', [${tmp.data}]);\n`;
                return resp;
            }
        },

        'def_consultar_modelo': {
            x_icons: 'desktop_new',
            x_text_contains: `consultar modelo "`,
            x_level: '>2',
            hint:  `Realiza una consulta a una base de datos virtual (en memoria).
                    Sus atributos corresponden a los campos y datos a filtrar.
                    Se asigna el resultado a la variable luego de la coma.`,
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let tmp = { var:node.id+'_', data:{}, model:'' };
                if (node.text.includes(',')) tmp.var=node.text.split(',').splice(-1)[0].trim();
                tmp.model = context.dsl_parser.findVariables({
                    text: node.text,
                    symbol: `"`,
                    symbol_closing: `"`
                }).trim();
                //get attributes and values as struct
                tmp.data = (await context.x_commands['def_struct'].func(node, { ...state, ...{
                    as_object:true
                }}));
                //code
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                if (tmp.data.state.object && Object.keys(tmp.data.state.object)!='') {
                    resp.open += `let ${node.id} = { keys:[], vals:[], where:${tmp.data.open} };
                    for (let ${node.id}_k in ${node.id}.where) {
                        ${node.id}.keys.push(${node.id}_k + '=?');
                        ${node.id}.vals.push(${node.id}.where[${node.id}_k]);
                    }
                    let ${tmp.var} = this.alasql(\`SELECT * FROM ${tmp.model} WHERE \${${node.id}.keys.join(' AND ')}\`,${node.id}.vals);\n`;
                } else {
                    resp.open += `let ${tmp.var} = this.alasql('SELECT * FROM ${tmp.model}', []);\n`;
                    resp.open += `let ${node.id} = { where:{} };`;
                }
                return resp;
            }
        },

        'def_modificar_modelo': {
            x_icons: 'desktop_new',
            x_text_exact: `modificar modelo`,
            x_not_empty: 'link',
            x_level: '>2',
            hint:  `Modifica los datos de la consulta de modelo enlazada, aplicando los datos definidos en sus atributos.`,
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let tmp = { data:{}, model:'' };
                //if (node.link=='') return {...resp,...{ valid:false }};
                //get target node
                let link_node = await context.dsl_parser.getNode({ id:node.link, recurse:false });
                if (link_node && link_node.valid==true) {
                    if (link_node.text.includes('consultar modelo')==false) {
                        throw 'modificar modelo requires an arrow pointing to a consultar modelo node'
                    } else {
                        //get linked info
                        tmp.model = context.dsl_parser.findVariables({
                            text: link_node.text,
                            symbol: `"`,
                            symbol_closing: `"`
                        }).trim();
                        tmp.model_where = link_node.id + '.where';
                        //get attributes and new values as struct
                        tmp.data = (await context.x_commands['def_struct'].func(node, { ...state, ...{
                            as_object:true
                        }})).open;
                        //code
                        if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                        //write update statement
                        resp.open += `let ${node.id} = { keys:[], vals:[], from:[], data:${tmp.data} };\n`;
                        resp.open += `for (let ${node.id}_k in ${node.id}.data) {
                            ${node.id}.keys.push(${node.id}_k+'=?');
                            ${node.id}.vals.push(${node.id}.data[${node.id}_k]);
                        }\n`;
                        //write where requirements
                        resp.open += `for (let ${node.id}_k in ${tmp.model_where}) {
                            ${node.id}.from.push(${node.id}_k+'=?');
                            ${node.id}.vals.push(${tmp.model_where}[${node.id}_k]);
                        }\n`;
                        //statement
                        resp.open += `this.alasql(\`UPDATE ${tmp.model} SET \${${node.id}.keys.join(',')} WHERE \${${node.id}.from.join(' AND ')}\`,${node.id}.vals);\n`;
                    }
                } else {
                    throw 'modificar modelo requires an arrow pointing to an active consultar modelo node (cannot be cancelled)'
                }            
                //
                return resp;
            }
        },

        'def_eliminar_modelo': {
            x_icons: 'desktop_new',
            x_text_exact: `eliminar modelo`,
            x_not_empty: 'link',
            x_level: '>2',
            hint:  `Elimina los datos de la consulta de modelo enlazada.`,
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                let tmp = { model:'' };
                //if (node.link=='') return {...resp,...{ valid:false }};
                //get target node
                let link_node = await context.dsl_parser.getNode({ id:node.link, recurse:false });
                if (link_node && link_node.valid==true) {
                    if (link_node.text.includes('consultar modelo')==false) {
                        throw 'eliminar modelo requires an arrow pointing to a consultar modelo node; link points to node ('+node.link+'): '+link_node.text;
                    } else {
                        //get linked info
                        tmp.model = context.dsl_parser.findVariables({
                            text: link_node.text,
                            symbol: `"`,
                            symbol_closing: `"`
                        }).trim();
                        tmp.model_where = link_node.id + '.where';
                        //code
                        if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                        resp.open += `let ${node.id} = { keys:[], vals:[] };\n`;
                        resp.open += `for (let ${node.id}_k in ${tmp.model_where}) {
                            ${node.id}.keys.push(${node.id}_k+'=?');
                            ${node.id}.vals.push(${tmp.model_where}[${node.id}_k]);
                        }\n`;
                        resp.open += `if (${node.id}.keys.length>0) {
                            this.alasql(\`DELETE FROM ${tmp.model} WHERE \${${node.id}.keys.join(' AND ')}\`,${node.id}.vals);
                        } else {
                            this.alasql(\`DELETE FROM ${tmp.model}\`,[]);
                        }\n`;
                    }
                } else {
                    throw 'eliminar modelo requires an arrow pointing to an active consultar modelo node (cannot be cancelled)'
                }            
                //
                return resp;
            }
        },

        //def_consultar_web
        'def_consultar_web': {
            x_icons: 'desktop_new',
            x_text_contains: 'consultar web,,',
            x_level: '>3',
            attributes_aliases: {
                'method':       '_method,:metodo,:method,_metodo',
                'response':     'responsetype,response,:responsetype,:response'
            },
            hint: 'Realiza una llamada a la url indicada enviando los datos definidos en sus atributos. Entrega resultados en variable definida luego de coma.',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                if (!state.from_script) return {...resp,...{ valid:false }};
                //prepare
                let isProxySon = ('current_proxy' in resp.state)?true:false;
                let isServerSon = ('current_func' in resp.state)?true:false;
                let tmp = {
                    var:node.id,
                    meta:false,
                    simple:true,
                    proxy:isProxySon,
                    progress:true,
                    axios_call:(isProxySon==true)?'$axios':'this.$axios',
                    config: {
                        method:'get',
                        url:'',
                        data:{},
                        headers:{},
                        auth: {},
                        timeout:0,
                        response:'json',
                        maxContentLength:5000000
                    }
                };
                if (isServerSon) tmp.axios_call='axios';
                if (node.text.includes(',')) tmp.var=node.text.split(',').splice(-1)[0].trim();
                //attributes
                let attrs = aliases2params('def_consultar_web', node, false, 'this.');
                //prepare attrs
                for (let x in attrs) {
                    if (x.charAt(0)==':') {
                        if (typeof attrs[x] === 'string') {
                            if (x!=':progress' && x!=':method' && attrs[x].includes('.')==false) {
                                attrs[x.right(x.length-1)] = '**'+attrs[x]+'**';
                            } else if (attrs[x].includes('$store.') || attrs[x].includes('this.') || attrs[x].includes('process.env.')) {
                                if (state.current_proxy) {
                                    attrs[x.right(x.length-1)] = '**'+attrs[x].replaceAll('this.$store.','store.')+'**';
                                } else {
                                    attrs[x.right(x.length-1)] = '**'+attrs[x]+'**';
                                }
                            } else {
                                attrs[x.right(x.length-1)] = attrs[x];
                            }
                        } else {
                            attrs[x.right(x.length-1)] = attrs[x];
                        }
                        delete attrs[x];
                    }
                }
                //
                delete attrs.refx;
                if (node.link!='') tmp.config.url = node.link.trim();
                if (attrs.progress) tmp.progress=attrs.progress; delete attrs.progress;
                if (attrs.meta) tmp.meta=true; delete attrs.meta;
                if (attrs.url) tmp.config.url = attrs.url; delete attrs.url; 
                for (let test of 'method,username,password,encoding,maxlength,redirects,timeout,response'.split(',')) {
                    if (attrs[test]) {
                        tmp.simple=false;
                        if (test=='username' || test=='password') {
                            tmp.config.auth[test] = attrs[test];
                        } else if (test=='encoding') {
                            tmp.config.responseEncoding = attrs[test];
                        } else {
                            tmp.config[test] = attrs[test];
                        }
                        delete attrs[test];
                    }
                }
                //extract headers from attrs (and keep data)
                for (let x in attrs) {
                    if (x.length>2 && x.substr(0,3)=='x-:') {
                        tmp.config.headers[x.right(x.length-3)] = attrs[x];
                        delete attrs[x];
                    } else if (x.length>2 && x.substr(0,2)=='x-') {
                        tmp.config.headers[x] = attrs[x];
                        delete attrs[x];
                    }
                }
                tmp.config.data = {...attrs};
                if (tmp.config.method=='get') {
                    tmp.config.data = { params:tmp.config.data };
                } else if (tmp.config.method=='postjson') {
                    tmp.config.method = 'post';
                    tmp.config.data = { params:tmp.config.data };
                }
                //simple or advanced?
                if (tmp.simple) {
                    //add comment
                    if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                    if (tmp.meta) {
                        resp.open += `const ${tmp.var} = await ${tmp.axios_call}.${tmp.config.method}(${tmp.config.url}, ${context.jsDump(tmp.config.data)}, { progress:${tmp.progress} });\n`;
                    } else {
                        resp.open += `const ${tmp.var} = (await ${tmp.axios_call}.${tmp.config.method}(${tmp.config.url}, ${context.jsDump(tmp.config.data)}, { progress:${tmp.progress} })).data;\n`;
                    }
                } else {
                    //advanced?
                    if (tmp.config.response && tmp.config.response!='json') {
                        tmp.config.responseType = tmp.config.response;
                    }
                    delete tmp.config.response;
                    //write data on close to support download/upload child events to config object
                    resp.state.from_consultar_web = node.id + '_config';
                    //add comment
                    if (node.text_note != '') resp.close += `// ${node.text_note.cleanLines()}\n`;
                    resp.close += `let ${node.id}_config = ${context.jsDump(tmp.config)};\n`;
                    //
                    if (tmp.meta) {
                        resp.close += `const ${tmp.var} = await ${tmp.axios_call}.request(${node.id}_config, { progress:${tmp.progress} });\n`;
                    } else {
                        resp.close += `
                        const ${tmp.var}_ = await ${tmp.axios_call}.request(${node.id}_config, { progress:${tmp.progress} });
                        const ${tmp.var} = ${tmp.var}_.data;\n`;
                    }
                }
                //return
                return resp;
            }
        },

        'def_consultar_web_upload': {
            x_icons: 'help',
            x_text_exact: 'upload',
            x_all_hasparent: 'def_consultar_web',
            x_level: '>2',
            hint: 'Evento para ver el progreso del upload de un consultar web padre (axios).',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                if (!state.from_consultar_web) return {...resp,...{ valid:false }};
                if (!state.from_script) return {...resp,...{ valid:false }};
                //code
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                resp.open += `${state.from_consultar_web}.onUploadProgress = function(evento) {\n`;
                resp.close += `};\n`;
                return resp;
            }
        },

        'def_consultar_web_download': {
            x_icons: 'help',
            x_text_exact: 'download',
            x_all_hasparent: 'def_consultar_web',
            x_level: '>2',
            hint: 'Evento para ver el progreso del download de un consultar web padre (axios).',
            func: async function(node, state) {
                let resp = context.reply_template({
                    state
                });
                if (!state.from_consultar_web) return {...resp,...{ valid:false }};
                if (!state.from_script) return {...resp,...{ valid:false }};
                //code
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                resp.open += `${state.from_consultar_web}.onDownloadProgress = function(evento) {\n`;
                resp.close += `};\n`;
                return resp;
            }
        },

        'def_xcada_registro': {
            x_icons: 'penguin',
            x_text_contains: `por cada registro en`,
            x_level: '>2',
            attributes_aliases: {
                'use_index':        'index',
                'unique':           'unique,id',
                'target':           'template,target'
            },
            hint:  `Repite sus hijos por cada elemento entrecomillas, dejando el item en curso en la variable luego de la coma.`,
            func: async function(node, state) {
                let resp = context.reply_template({ state });
                let tmp = { key:'', has_await:false, query:node.text, target:'' };
                if (!state.from_script && !state.get_params) {
                    resp.valid=false;
                    return resp;
                }
                if (tmp.query.includes('$store.')) tmp.query = tmp.query.replaceAll('$store.','$store.state.');
                if (tmp.query.includes(',')) tmp.key=tmp.query.split(',').splice(-1)[0].trim();
                tmp.iterator = context.dsl_parser.findVariables({
                    text: tmp.query,
                    symbol: `"`,
                    symbol_closing: `"`
                }).trim();
                if (tmp.iterator.charAt(0)=='$' &&
                    !tmp.iterator.includes('$variables.') &&
                    !tmp.iterator.includes('$vars.') &&
                    !tmp.iterator.includes('$store.') &&
                    !tmp.iterator.includes('$params.') &&
                    !tmp.iterator.includes('$route.')) {
                    tmp.iterator = tmp.iterator.right(tmp.iterator.length-1);
                }
                let sons = await node.getNodes();
                if (sons.length==1) {
                    tmp.target = sons[0].id;
                } else if (sons.length>1) {
                    tmp.target = 'template';
                }
                let attrs = aliases2params('def_xcada_registro',node);
                let params = { unique:0, key:0, target:tmp.target, tipo:'v-for', iterator:tmp.iterator, item:tmp.key, use_index:`${tmp.key}_index` };
                if (params[':template']) {
                    params.target = 'template';
                    delete params[':template']; delete params['template'];
                }
                params = {...params,...attrs};
                if (params.unique==0) params.unique = params.use_index;
                if (state.get_params) {
                    resp.state.params = params;
                    delete resp.state.get_params;
                    return resp;
                }
                //code (only from scripting)
                if (node.icons.includes('bell') && params.iterator.includes('**')) {
                    params.iterator = getTranslatedTextVar(params.iterator);
                }
                params.iterator = params.iterator   .replaceAll('$variables.','this.')
                                                    .replaceAll('$vars.','this.')
                                                    .replaceAll('$params.','this.')
                                                    .replaceAll('$store.','this.$store.state.');
                context.x_state.pages[state.current_page].imports['underscore'] = '_';
                //search consultar web nodes
                if (!params[':each'] && sons.length>0) {
                    for (let x of sons) {
                        if (x.text.includes('consultar web')) {
                            tmp.has_await = true;
                            break;
                        }
                        await setImmediatePromise(); //@improved
                    }
                }
                //write code
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                if (tmp.has_await==true) {
                    resp.open += `_.each(${params.iterator}, async function(${params.item},${params.use_index}) {`;
                    resp.close = `}, this);`;
                } else {
                    resp.open += `for (let ${params.use_index}=0;${params.use_index}<${params.iterator}.length;${params.use_index}++) {`;
                    resp.open += `let ${params.item} = ${params.iterator}[${params.use_index}];\n`;
                    resp.close = `}\n`;
                }
                //
                return resp;
            }
        },

        //*def_responder (@todo i18n)
        //**def_insertar_modelo (@todo test it after adding support for events)
        //**def_consultar_modelo
        //**def_modificar_modelo
        //**def_eliminar_modelo
        //**def_consultar_web
        //**def_consultar_web_upload
        //**def_consultar_web_download
        //*def_aftertime
        //*def_struct
        //*def_extender
        //*def_npm_instalar
        //*def_probar
        //*def_probar_error (ex.def_event_try)
        //*def_literal_js
        //*def_console
        //**def_xcada_registro
        //*def_crear_id_unico

        'def_guardar_nota': {
        	x_level: '>2',
        	x_icons: 'desktop_new',
            x_text_contains: 'guardar nota|capturar nota|note:save|save note',
            attributes_aliases: {
                'strip':      'text,strip,limpio',
                'asis':       'asis,as_it_was'
            },
            meta_type: 'script',
            hint: 'Crea una variable con el contenido HTML indicado en la nota del nodo.',
        	func: async function(node, state) {
                let resp = context.reply_template({ state });
                if (!state.from_script) return {...resp,...{ valid:false }};
                // attrs
                let attrs = {...{ html:true, asis:false },...aliases2params('def_guardar_nota', node, false, 'this.')};
                delete attrs.refx;
                if (attrs[':html']) attrs.html=true;
                if (attrs[':strip']) attrs.html=false;
                //prepare
                let tmp = { content:node.text_note };
                tmp.var = node.text.split(',').pop().trim();
                if (attrs.html) {
                    tmp.content = node.text_rich; //this has inner of body already
                    //parse content
                    if (!attrs[':asis'] && !attrs.asis) {
                        //transform tags 'p' style:text-align:center to <center>x</center>
                        //transform <p>x</p> to x<br/>
                        let cheerio = require('cheerio');
                        let sub = cheerio.load(tmp.content, { ignoreWhitespace: false, xmlMode:true, decodeEntities:false });
                        let paragraphs = sub('p').toArray();
                        paragraphs.map(function(elem) {
                            let cur = $(elem);
                            let style = cur.attr('style');
                            if (style && style.includes('text-align:center')) {
                                //transform tags 'p' style:text-align:center to <center>x</center>
                                cur.replaceWith(`<center>${cur.html()}</center>`);
                            } else {
                                cur.replaceWith(`${cur.html()}<br/>`);
                            }
                        });
                        tmp.content = sub.html();
                    }
                }
                //escape variables
                if (node.icons.includes('bell')) {
                    tmp.content = getTranslatedTextVar(tmp.content);
                }
                //code
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                resp.open += `let ${tmp.var} = ${tmp.content};\n`;
                return resp;
            }
        },

        'def_agregar_campos': {
        	x_level: '>2',
        	x_icons: 'desktop_new',
            x_text_contains: 'agregar campos a',
            meta_type: 'script',
            hint: `Agrega los campos definidos en sus atributos (y valores) a cada uno de los registros de la variable de entrada (array de objetos).\n
                   Si hay una variable definida, se crea una nueva instancia del array con los campos nuevos, en caso contrario se modifican los valores de la variable original.`,
        	func: async function(node, state) {
                let resp = context.reply_template({ state });
                if (!state.from_script) return {...resp,...{ valid:false }};
                //get vars and attrs
                let tmp = { var:'' };
                if (node.text.includes(',')) tmp.var = node.text.split(',').pop().trim();
                tmp.original = context.dsl_parser.findVariables({
                    text: node.text,
                    symbol: `"`,
                    symbol_closing: `"`
                });
                if (state.from_server) {
                    tmp.var = tmp.var.replaceAll('$variables.','resp.')
                                     .replaceAll('$vars.','resp.')
                                     .replaceAll('$params.','resp.');
                    tmp.original = tmp.original.replaceAll('$variables.','resp.')
                                     .replaceAll('$vars.','resp.')
                                     .replaceAll('$params.','resp.');
                } else if (tmp.var!='') {
                    tmp.var = tmp.var.replaceAll('$variables.','this.')
                                     .replaceAll('$vars.','this.')
                                     .replaceAll('$params.','this.')
                                     .replaceAll('$store.','this.$store.state.');pon
                    tmp.original = tmp.original.replaceAll('$variables.','this.')
                                               .replaceAll('$vars.','this.')
                                               .replaceAll('$params.','this.')
                                               .replaceAll('$store.','this.$store.state.');
                }
                if (tmp.original.includes('**') && node.icons.includes('bell')) {
                    tmp.original = getTranslatedTextVar(tmp.original);
                }
                // create obj from current node as js obj
                tmp.attr = await context.x_commands['def_struct'].func(node, { ...state, ...{
                    as_object:true
                }});
                delete tmp.attr.refx;
                //change this to resp if parent is server
                if (state.from_server) tmp.attr.open = tmp.attr.open.replaceAll('this.','resp.');
                //add underscore
                if (state.current_page) {
                    context.x_state.pages[state.current_page].imports['underscore'] = '_';
                } else if (state.current_proxy) {
                    context.x_state.proxies[state.current_proxy].imports['underscore'] = '_';
                } else if (state.current_store) {
                    context.x_state.stores[state.current_store].imports['underscore'] = '_';
                }
                //code
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                if (tmp.var.includes('this')) {
                    resp.open += `${tmp.var} = _.map(${tmp.original}, function(element) {
                        element = Object.assign(element,${tmp.attr.open});
                        return _.extend({},element,${tmp.attr.open});
                    });`;
                } else if (tmp.var!='') {
                    resp.open += `let ${tmp.var} = _.map(${tmp.original}, function(element) {
                        element = Object.assign(element,${tmp.attr.open});
                        return _.extend({},element,${tmp.attr.open});
                    });`;
                } else {
                    resp.open += `${tmp.original} = _.each(${tmp.original}, function(element) {
                        element = Object.assign(element,${tmp.attr.open});
                    });`;
                }
                return resp;
            }
        },

        'def_preguntar': {
        	x_level: '>2',
        	x_icons: 'desktop_new',
            x_text_contains: 'preguntar|dialogo:confirm',
            attributes_aliases: {
                'title':                 'titulo,title',
                'message':               'mensaje,contenido,message',
                'buttonTrueText':        'true,aceptar,boton:aceptar',
                'buttonFalseText':       'false,cancel,boton:cancelar',
                'width':                 'ancho,width',
                'icon':                  'icon,icono',
                'persistent':            'persistent,obligatorio,persistente'
            },
            /*x_test_func: function(node) {
                //return true if its a valid match
            },*/
            hint: `Abre un dialogo preguntando lo indicado en sus atributos, respondiendo true o false en la variable indicada luego de la coma.`,
        	func: async function(node, state) {
                let resp = context.reply_template({ state });
                if (!state.from_script) return {...resp,...{ valid:false }};
                //get vars and attrs
                let tmp = { var:'', text:'' };
                if (node.text.includes(',')) tmp.var = node.text.split(',').pop().trim();
                //add plugin
                context.x_state.plugins['vuetify-confirm'] = {
                    global:true,
                    mode: 'client',
                    npm: { 'vuetify-confirm':'*' },
                    extra_imports: ['vuetify'],
                    config: '{ vuetify }'
                };
                //attrs
                let params = aliases2params('def_preguntar', node, false, 'this.');
                delete params.refx;
                //process message attribute
                if (params.message) {
                    /* ex.= 'Estas seguro que deseas borrar {{ x }} ?'
                    'Estas seguro que deseas borrar '+x+' ?'
                    */
                    tmp.text = params.message;
                    let new_val = '';
                    let vars = context.dsl_parser.findVariables({
                        text: params.message,
                        symbol: `{{`,
                        symbol_closing: `}}`,
                        array:true
                    });
                    for (let vr in vars) {
                        if (vars[vr].includes('|')) {
                            //add filter support: 'Estas seguro que deseas agregar {{ monto | numeral('0,0') }} ?'
                            let clean = vars[vr].replaceAll('{{','').replaceAll('}}','');
                            let the_var = clean.split('|')[0].trim();
                            let the_filter = clean.split('|').pop().trim();
                            the_filter = the_filter.replace('(',`(${the_var},`);
                            tmp.text = tmp.text.replace(vars[vr],`'+this.$nuxt.$options.filters.${the_filter}+'`);
                        } else {
                            let n_var = vars[vr].replaceAll('{{',`'+`).replaceAll('}}',`+'`);
                            tmp.text = tmp.text.replace(vars[vr],n_var);
                        }
                    }
                    //
                    tmp.text = `'${tmp.text}'`;
                    delete params.message;
                }
                //code
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                if (tmp.text && Object.keys(params)==0) {
                    if (tmp.var.includes('this.')) {
                        resp.open += `${tmp.var} = await this.$confirm(${tmp.text});\n`;
                    } else {
                        resp.open += `let ${tmp.var} = await this.$confirm(${tmp.text});\n`;
                    }
                } else {
                    if (tmp.var.includes('this.')) {
                        resp.open += `${tmp.var} = await this.$confirm(${tmp.text},${context.jsDump(params)});\n`;
                    } else {
                        resp.open += `let ${tmp.var} = await this.$confirm(${tmp.text},${context.jsDump(params)});\n`;
                    }
                }
                return resp;
            }
        },

        'def_var_clonar': {
        	x_level: '>2',
        	x_icons: 'desktop_new',
            x_text_contains: 'clonar variable|copiar variable|variable:clonar|variable:copiar',
            attributes_aliases: {},
            hint: `Crea una copia de la variable indicada, en la variable luego de la coma.`,
        	func: async function(node, state) {
                let resp = context.reply_template({ state });
                if (!state.from_script) return {...resp,...{ valid:false }};
                //get vars and attrs
                let tmp = { var:'', original:'' };
                if (node.text.includes(',')) tmp.var = node.text.split(',').pop().trim();
                //prepare new var
                if (tmp.var.includes('$')) {
                    if (state.from_server) {
                        tmp.var = tmp.var.replaceAll('$variables.', 'resp.')
                                        .replaceAll('$vars.', 'resp.')
                                        .replaceAll('$params.', 'resp.');
                    } else {
                        tmp.var = tmp.var.replaceAll('$variables.', 'this.')
                                        .replaceAll('$vars.', 'this.')
                                        .replaceAll('$params.', 'this.')
                                        .replaceAll('$config.', 'process.env.')
                                        .replaceAll('$store.', 'this.$store.state.');
                        if (tmp.var=='this.') tmp.var='this';
                    }
                }
                //prepare original var
                tmp.original = context.dsl_parser.findVariables({
                    text: node.text,
                    symbol: `"`,
                    symbol_closing: `"`
                });
                if (tmp.original.includes('**') && node.icons.includes('bell')) {
                    tmp.original = getTranslatedTextVar(tmp.original);
                } else if (tmp.original.includes('$')) {
                    if (state.from_server) {
                        tmp.original = tmp.original.replaceAll('$variables.', 'resp.')
                                                    .replaceAll('$vars.', 'resp.')
                                                    .replaceAll('$params.', 'resp.');
                    } else {
                        tmp.original = tmp.original.replaceAll('$variables.', 'this.')
                                                    .replaceAll('$vars.', 'this.')
                                                    .replaceAll('$params.', 'this.')
                                                    .replaceAll('$config.', 'process.env.')
                                                    .replaceAll('$store.', 'this.$store.state.');
                        if (tmp.original=='this.') tmp.original='this';
                    }
                }
                //code
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                if (tmp.var.includes('this.')) {
                    resp.open += `${tmp.var} = JSON.parse(JSON.stringify(${tmp.original}));\n`;
                } else {
                    resp.open += `let ${tmp.var} = JSON.parse(JSON.stringify(${tmp.original}));\n`;
                }
                return resp;
            }
        },

        'def_enviarpantalla': {
        	x_level: '>2',
        	x_icons: 'desktop_new',
            x_text_contains: 'enviar a pantalla',
            x_not_empty: 'link',
            attributes_aliases: {
                'event_label':      'tag,tipo,etiqueta,event_label'
            },
            meta_type: 'script',
            hint: 'Envia al usuario a la pantalla enlazada.',
        	func: async function(node, state) {
                let resp = context.reply_template({ state });
                if (!state.from_script) return {...resp,...{ valid:false }};
                if (node.link.includes('ID_')==false) return {...resp,...{ valid:false }};
                // prepare
                let tmp = { link:node.link, target:'' };
                let link_node = await context.dsl_parser.getNode({ id:node.link, recurse:false });
                if (link_node && link_node.valid==true) {
                    tmp.target = `{vuepath:${link_node.text}}`;
                } else {
                    context.x_console.outT({ message:`enviar a pantalla, invalid linked node`, color:'red', data:link_node });
                    throw `Invalid 'enviar a pantalla' linked node`;
                }
                //code
                //if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                let isProxySon = ('current_proxy' in resp.state)?true:false;
                if (isProxySon==true) {
                    resp.open += `return redirect('${tmp.target}');\n`;
                } else {
                    // params
                    let params = aliases2params('def_enviarpantalla', node, false, 'this.');
                    delete params.refx;
                    if (Object.keys(params)!='') {
                        if (tmp.target.charAt(0)=='/') tmp.target = tmp.target.right(tmp.target.length-1);
                        if (params[':query']) {
                            resp.open += `this.$router.push({ path:'${tmp.target}', query:${context.jsDump(params)} });\n`;
                        } else {
                            resp.open += `this.$router.push({ name:'${tmp.target}', params:${context.jsDump(params)} });\n`;
                        }    
                    } else {
                        resp.open += `this.$router.push('${tmp.target}');\n`;
                    }
                }
                return resp;
                
            }
        },

        'def_procesar_imagen': {
        	x_level: '>2',
        	x_icons: 'desktop_new',
            x_text_contains: 'procesar imagen|transformar imagen|ajustar imagen|imagen:transform',
            attributes_aliases: {
                'grey':      'greyscale,gris,grises,grey',
                'maxkb':     'maxkb,compress',
                'format':    'format,format,mimetype'
            },
            meta_type: 'script',
            hint: 'Aplica las modificaciones indicadas en sus atributos a la imagen (dataurl) indicada como variables. Retorna un dataurl de la imagen modificada.',
        	func: async function(node, state) {
                let resp = context.reply_template({ state });
                if (!state.from_script) return {...resp,...{ valid:false }};
                // get: cmd 'input', output / prepare params
                let tmp = await parseInputOutput(node,state);
                let params = (await context.x_commands['def_struct'].func(node, { ...state, ...{
                    as_object:true
                }})).state.object;
                //code
                context.x_state.npm['image-js'] = '*';
                if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                resp.open += `let { Image } = require('image-js');
                let ${node.id} = ${tmp.input};\n`;
                if (params.maxkb) {
                    //compress first
                    context.x_state.npm['browser-image-compression'] = '*';
                    context.x_state.pages[resp.state.current_page].imports['browser-image-compression'] = 'imageCompression';
                    resp.open += `let ${node.id}_f = await imageCompression.getFilefromDataUrl(${tmp.input});
                    let ${node.id}_c = await imageCompression(${node.id}_f, { maxSizeMB: ${params.maxkb}/1000 });
                    ${node.id} = await imageCompression.getDataUrlFromFile(${node.id}_c);\n`;
                }
                //scale and fxs
                resp.open += `let ${tmp.output}_ = await Image.load(${node.id});\n`;
                if (tmp.output.includes('this.')==false) resp.open += `let `;
                resp.open += `${tmp.output} = ${tmp.output}_`;
                // params
                if (params.anchomax) resp.open += `.resize({ width:(${tmp.output}_.width>${params.anchomax})?${params.anchomax}:${tmp.output}_.width })`;
                if (params.altomax) resp.open += `.resize({ height:(${tmp.output}_.height>${params.altomax})?${params.altomax}:${tmp.output}_.height })`;
                if (params.resmax) resp.open += `.resize({ width:(${tmp.output}_.width>${params.resmax})?${params.resmax}:${tmp.output}_.width, height:(${tmp.output}_.height>${params.resmax})?${params.resmax}:${tmp.output}_.height })`;
                if (params.resize && params.resize.includes('x')) {
                    resp.open += `.resize({ width:${params.resize.split('x')[0]}, height:${params.resize.split('x').pop().trim()} })`;
                } else {
                    resp.open += `.resize({ width:${params.resize}, height:${params.resize} })`;
                }
                if (params.grey || params.greyscale || params.gris || params.grises) resp.open += `.grey()`;
                if (params.format || params.formato || params.mimetype) {
                    if (params.formato) params.format = params.formato;
                    if (params.mimetype) params.format = params.mimetype;
                    if (params.format.includes('/')) {
                        resp.open += `.toDataURL('${params.format.replaceAll("'","")}')`;
                    } else {
                        resp.open += `.toDataURL('image/${params.format.replaceAll("'","")}')`;
                    }
                }
                resp.open += `;\n`;
                //
                return resp;
            }
        },

        //**def_guardar_nota
        //**def_agregar_campos
        //**def_preguntar
        //def_array_transformar (pending)
        //def_procesar_imagen
        //def_imagen_exif
        //**def_var_clonar
        //--def_modificar (invalid node for vue)
        //**def_enviarpantalla (todo test)

        'def_analytics_evento': {
        	x_level: '>2',
        	x_icons: 'desktop_new',
            x_text_contains: 'analytics:event',
            x_or_hasparent: 'def_page,def_componente,def_layout',
            attributes_aliases: {
                'event_label':      'tag,tipo,etiqueta,event_label'
            },
            meta_type: 'script',
            hint: 'Envia el evento indicado al Google Analytics configurado.',
        	func: async function(node, state) {
                let resp = context.reply_template({ state });
                if (!state.from_script) return {...resp,...{ valid:false }};
                //if (!context.x_state.config_node['google:analytics']) return {...resp,...{ valid:false }};
                // params
                let params = aliases2params('def_analytics_evento', node, false, 'this.');
                delete params.refx;
                let details = {...{
                    event_category:state.current_page
                },...params};
                //event name
                let event = context.dsl_parser.findVariables({
                    text: node.text,
                    symbol: `"`,
                    symbol_closing: `"`
                });
                if (event.includes('**') && node.icons.includes('bell')) {
                    event = getTranslatedTextVar(event);
                } else if (event.includes('$')) {
                    event = event.replaceAll('$variables.', 'this.')
                                 .replaceAll('$vars.', 'this.')
                                 .replaceAll('$params.', 'this.')
                                 .replaceAll('$config.', 'process.env.')
                                 .replaceAll('$store.', 'this.$store.state.');
                    event = `'${event}'`;
                } else if (event.charAt(0) == '(' && event.slice(-1) == ')') {
                    event = event.slice(1).slice(0, -1);
                } else {
                    event = `'${event}'`;
                }
                //code
                if ('google:analytics' in context.x_state.config_node) {
                    if (node.text_note != '') resp.open += `// ${node.text_note.cleanLines()}\n`;
                    resp.open += `this.$gtag('event', ${event}, ${context.jsDump(details)});\n`;
                    return resp;
                } else {
                    throw 'analytics:event requires config->google:analytics key!'
                }
            }
        },
    
        //**def_analytics_evento - @todo test
        //def_medianet_ad - @todo think about the script2 code issue with cheerio

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