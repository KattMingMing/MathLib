var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var MathLib;
(function (MathLib) {
    MathLib.version = '0.3.5';
    MathLib.apery = 1.2020569031595942;
    MathLib.e = Math.E;
    MathLib.epsilon = (Number).EPSILON || ((function () {
        var next, result;
        for(next = 1; 1 + next !== 1; next = next / 2) {
            result = next;
        }
        return result;
    })());
    MathLib.eulerMascheroni = 0.5772156649015329;
    MathLib.goldenRatio = 1.618033988749895;
    MathLib.pi = Math.PI;
    MathLib.isArrayLike = function (x) {
        return typeof x === 'object' && 'length' in x;
    };
    var prototypes = {
        array: Object.getPrototypeOf([]),
        func: Object.getPrototypeOf(function () {
        }),
        object: Object.getPrototypeOf({
        }),
        functn: function () {
        }
    }, proto = '__proto__', flatten = function (a) {
        var res = [];
        a.forEach(function (x) {
            if(Array.isArray(x)) {
                res = res.concat(flatten(x));
            } else {
                res.push(x);
            }
        });
        return res;
    }, extendObject = function (dest, src) {
        for(var prop in src) {
            if(typeof dest[prop] === 'object' && typeof src[prop] === 'object') {
                dest[prop] = extendObject(dest[prop], src[prop]);
            } else {
                dest[prop] = src[prop];
            }
        }
        return dest;
    }, to3js = function (x) {
        if(x.length === 2) {
            return new THREE.Vector2(x[0], x[1]);
        } else if(x.length === 3) {
            return new THREE.Vector3(x[0], x[1], x[2]);
        }
    };
    MathLib.prototypes = prototypes;
    MathLib.extend = function (obj, name, prop, options) {
        options = options || {
            enumerable: true
        };
        var o = MathLib[obj] || MathLib;
        Object.defineProperty(o, name, {
            value: prop,
            writable: options.writable,
            enumerable: options.enumerable,
            configurable: options.configurable
        });
    };
    MathLib.extendPrototype = function (obj, name, prop, options) {
        options = options || {
            enumerable: true
        };
        Object.defineProperty(prototypes[obj], name, {
            value: prop,
            writable: options.writable,
            enumerable: options.enumerable,
            configurable: options.configurable
        });
    };
    var MathML = (function () {
        function MathML(MathMLString) {
            this.type = 'MathML';
            var tokenizer = new DOMParser(), MathMLdoc, MathML;
            if(typeof MathMLString !== 'string') {
                MathMLString = MathMLString.toContentMathML();
            }
            MathMLString = MathMLString.replace(/\n/g, '');
            MathMLString = MathMLString.replace(/((?!cs)[^>]{2})>(\s)*</g, '$1><');
            MathMLString = MathMLString.replace(/&(\w*);/g, '#$1;');
            MathMLdoc = tokenizer.parseFromString(MathMLString, 'application/xml');
            var createToken, curToken = null, tokenStack = [];
            createToken = function (t) {
                var attributes = {
                }, i, ii;
                if(t.attributes) {
                    for(i = 0 , ii = t.attributes.length; i < ii; i++) {
                        attributes[t.attributes[i].name] = t.attributes[i].value;
                    }
                }
                var newToken = Object.create({
                }, {
                    attributes: {
                        value: attributes
                    },
                    nodeName: {
                        value: t.nodeName
                    },
                    parentNode: {
                        value: tokenStack[tokenStack.length - 1]
                    },
                    prevNode: {
                        value: curToken
                    }
                });
                if(curToken) {
                    curToken.nextNode = newToken;
                }
                curToken = newToken;
                tokenStack.push(newToken);
                newToken.childNodes = Array.prototype.slice.call(t.childNodes).map(createToken);
                tokenStack.pop();
                var attributesString = function (x) {
                    var str = '', attr;
                    for(attr in x.attributes) {
                        if(x.attributes.hasOwnProperty(attr)) {
                            str += ' ' + attr + '="' + x.attributes[attr] + '"';
                        }
                    }
                    return str;
                };
                if(newToken.childNodes.length !== 0) {
                    newToken.innerMathML = newToken.childNodes.reduce(function (prev, cur, index, array) {
                        return prev + cur.outerMathML;
                    }, '');
                } else {
                    newToken.innerMathML = '';
                }
                if(newToken.childNodes.length === 0) {
                    if(newToken.nodeName === '#text') {
                        newToken.outerMathML = t.textContent.replace(/#(\w*);/g, '&$1;');
                    } else {
                        newToken.outerMathML = '<' + newToken.nodeName + attributesString(newToken) + '/>';
                    }
                } else {
                    newToken.outerMathML = '<' + newToken.nodeName + attributesString(newToken) + '>' + newToken.innerMathML + '</' + newToken.nodeName + '>';
                }
                if(newToken.nodeName === 'lambda') {
                    newToken.bvars = [];
                    for(i = 0 , ii = newToken.childNodes.length; i < ii; i++) {
                        if(newToken.childNodes[i].nodeName === 'bvar') {
                            newToken.bvars.push(newToken.childNodes[i].childNodes[0].innerMathML);
                        } else if(newToken.childNodes[i].nodeName === 'domainofapplication') {
                            newToken.domainofapplication = newToken.childNodes[i];
                        } else if(newToken.childNodes[i].nodeName === 'apply') {
                            newToken.apply = newToken.childNodes[i];
                        }
                    }
                }
                return newToken;
            };
            MathML = createToken(MathMLdoc.childNodes[0]);
            this.attributes = MathML.attributes;
            this.childNodes = MathML.childNodes;
            this.innerMathML = MathML.innerMathML;
            this.outerMathML = MathML.outerMathML;
            this.nodeName = MathML.nodeName;
            this.nextNode = MathML.nextNode;
            this.parentNode = null;
            this.prevNode = null;
        }
        MathML.isSupported = function () {
            var hasMathML = false, ns, div, mfrac;
            if(document.createElementNS) {
                ns = 'http://www.w3.org/1998/Math/MathML';
                div = document.createElement('div');
                div.style.position = 'absolute';
                mfrac = div.appendChild(document.createElementNS(ns, 'math')).appendChild(document.createElementNS(ns, 'mfrac'));
                mfrac.appendChild(document.createElementNS(ns, 'mi')).appendChild(document.createTextNode('xx'));
                mfrac.appendChild(document.createElementNS(ns, 'mi')).appendChild(document.createTextNode('yy'));
                document.body.appendChild(div);
                hasMathML = div.offsetHeight > div.offsetWidth;
                document.body.removeChild(div);
            }
            return hasMathML;
        };
        MathML.prototype.loadMathJax = function (config) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'http://cdn.mathjax.org/mathjax/latest/MathJax.js';
            config = config || 'MathJax.Hub.Config({' + 'config: ["MMLorHTML.js"],' + 'jax: ["input/TeX","input/MathML","output/HTML-CSS","output/NativeMML"],' + 'extensions: ["tex2jax.js","mml2jax.js","MathMenu.js","MathZoom.js"],' + 'TeX: {' + 'extensions: ["AMSmath.js","AMSsymbols.js","noErrors.js","noUndefined.js"]' + '}' + '});';
            if((window).opera) {
                script.innerHTML = config;
            } else {
                script.text = config;
            }
            document.getElementsByTagName('head')[0].appendChild(script);
        };
        MathML.prototype.parse = function () {
            var handlers, apply, ci, cn, math, matrixrow, matrix, parser, set, vector, construct = false, bvars = [];
            handlers = {
                apply: function (node) {
                    var children = node.childNodes, func = children.shift(), funcName = func.nodeName, names = {
                        ident: 'identity',
                        power: 'pow',
                        rem: 'mod',
                        setdifference: 'without'
                    };
                    if(funcName in names) {
                        funcName = names[funcName];
                    }
                    if(construct) {
                        var innerFunc;
                        innerFunc = parser(children[0]);
                        if(innerFunc === undefined) {
                            return new MathLib.Functn(function (x) {
                                return MathLib[funcName](x);
                            }, {
                                contentMathMLString: '<math xmlns="http://www.w3.org/1998/Math/MathML"><lambda><bvar><ci>x</ci></bvar><domainofapplication><complexes/></domainofapplication>' + node.outerMathML + '</lambda></math>'
                            });
                        } else {
                            return new MathLib.Functn(function (x) {
                                return MathLib[funcName](innerFunc(x));
                            }, {
                                contentMathMLString: node.outerMathML
                            });
                        }
                    } else {
                        if(funcName in MathLib) {
                            if(children.length === 1) {
                                return MathLib[funcName](parser(children[0]));
                            } else {
                                return MathLib[funcName].apply(null, children.map(parser));
                            }
                        } else {
                            var child = parser(children.shift());
                            if(children.length === 1) {
                                return child[funcName](parser(children[0]));
                            } else {
                                return child[funcName](children.map(parser));
                            }
                        }
                    }
                },
                ci: function (node) {
                    if(bvars.indexOf(node.innerMathML) === -1) {
                        return MathLib.MathML.variables[node.innerMathML];
                    } else {
                        return new MathLib.Functn(function (x) {
                            return x;
                        }, {
                            contentMathMLString: '<math xmlns="http://www.w3.org/1998/Math/MathML"><lambda><bvar><ci>x</ci></bvar><domainofapplication><complexes/></domainofapplication><apply><ident/><ci>x</ci></apply></lambda></math>'
                        });
                    }
                },
                cn: function (node) {
                    var type = node.attributes.type ? node.attributes.type : 'number';
                    if(type === 'number') {
                        return +node.innerMathML;
                    } else if(type === 'complex-cartesian') {
                        return new MathLib.Complex(+node.childNodes[0].outerMathML, +node.childNodes[2].outerMathML);
                    } else if(type === 'complex-polar') {
                        return MathLib.Complex.polar(+node.childNodes[0].outerMathML, +node.childNodes[2].outerMathML);
                    }
                },
                cs: function (node) {
                    return node.innerMathML;
                },
                lambda: function (node) {
                    var domain, lambda, funcName, innerFunc, names;
                    bvars = bvars.concat(node.bvars);
                    domain = node.domainofapplication;
                    apply = node.apply;
                    funcName = apply.childNodes[0].nodeName;
                    construct = true;
                    names = {
                        ident: 'identity',
                        power: 'pow',
                        rem: 'mod',
                        setdifference: 'without'
                    };
                    if(funcName in names) {
                        funcName = names[funcName];
                    }
                    innerFunc = parser(apply.childNodes.slice(1));
                    if(innerFunc[0] === undefined) {
                        return new MathLib.Functn(function (x) {
                            return MathLib[funcName](x);
                        }, {
                            contentMathMLString: node.outerMathML,
                            domain: domain
                        });
                    } else {
                        return new MathLib.Functn(function (x) {
                            return MathLib[funcName].apply(null, innerFunc.map(function (f) {
                                return typeof f === 'function' ? f(x) : f;
                            }));
                        }, {
                            contentMathMLString: node.outerMathML,
                            domain: domain
                        });
                    }
                },
                math: function (node) {
                    return parser(node.childNodes[0]);
                },
                matrix: function (node) {
                    return new MathLib.Matrix(node.childNodes.map(handlers.matrixrow));
                },
                matrixrow: function (node) {
                    return node.childNodes.map(parser);
                },
                set: function (node) {
                    var type = node.attributes.type && node.attributes.type === 'multiset' ? true : false;
                    return new MathLib.Set(node.childNodes.map(parser), type);
                },
                'false': function () {
                    return false;
                },
                'true': function () {
                    return true;
                },
                exponentiale: function () {
                    return MathLib.e;
                },
                imaginaryi: function () {
                    return new MathLib.Complex(0, 1);
                },
                notanumber: function () {
                    return NaN;
                },
                pi: function () {
                    return MathLib.pi;
                },
                eulergamma: function () {
                    return MathLib.eulerMascheroni;
                },
                infinity: function () {
                    return Infinity;
                },
                vector: function (node) {
                    return new MathLib.Vector(node.childNodes.map(parser));
                }
            };
            parser = function (node) {
                if(Array.isArray(node)) {
                    return node.map(parser);
                }
                return handlers[node.nodeName](node);
            };
            return parser(this);
        };
        MathML.prototype.toMathMLString = function () {
            var handlers = {
                apply: function (n) {
                    var f = n.childNodes[0], args = n.childNodes.slice(1).map(function (x) {
                        return handlers[x.nodeName](x);
                    }), str = '';
                    if(f.nodeName === 'plus') {
                        str = '<mrow>' + args.join('<mo>+</mo>') + '</mrow>';
                    } else if(f.nodeName === 'times') {
                        str = '<mrow>' + args.join('<mo>*</mo>') + '</mrow>';
                    } else if(f.nodeName === 'power') {
                        str = '<msup>' + args[0] + args[1] + '</msup>';
                    } else {
                        str = '<mrow><mi>' + f.nodeName + '</mi><mo>&af;</mo><mfenced>' + args.join('') + '</mfenced></mrow>';
                    }
                    return str;
                },
                bvar: function () {
                    return '';
                },
                ci: function (n) {
                    return '<mi>' + n.innerMathML + '</mi>';
                },
                cn: function (n) {
                    return '<mn>' + n.innerMathML + '</mn>';
                },
                cs: function (n) {
                    return '<ms>' + n.innerMathML + '</ms>';
                },
                domainofapplication: function () {
                    return '';
                },
                lambda: function (n) {
                    return n.childNodes.reduce(function (old, cur) {
                        return old + handlers[cur.nodeName](cur);
                    }, '');
                },
                '#text': function (n) {
                    return n.innerMathML;
                }
            };
            return '<math xmlns="http://www.w3.org/1998/Math/MathML">' + handlers[this.childNodes[0].nodeName](this.childNodes[0]) + '</math>';
        };
        MathML.prototype.toString = function () {
            return this.outerMathML;
        };
        MathML.variables = {
        };
        MathML.write = function write(id, math) {
            var formula;
            document.getElementById(id).innerHTML = '<math>' + math + '</math>';
            if(typeof MathJax !== 'undefined') {
                formula = MathJax.Hub.getAllJax(id)[0];
                MathJax.Hub.Queue([
                    'Typeset', 
                    MathJax.Hub, 
                    id
                ]);
            }
        };
        return MathML;
    })();
    MathLib.MathML = MathML;    
    var functnPrototype = {
    };
    MathLib.Functn = function (f, options) {
        options = options || {
        };
        var functn = function (x) {
            if(typeof x === 'number') {
                return f.apply('', arguments);
            } else if(x.type === 'functn') {
                var outerVar = functn.contentMathML.childNodes[0].childNodes[0].childNodes[0].outerMathML, innerVar = x.contentMathML.childNodes[0].childNodes[0].childNodes[0].outerMathML, innerStr = x.contentMathML.childNodes[0].childNodes[2].outerMathML.replace('<bvar>' + innerVar + '</bvar>', ''), outerStr = functn.contentMathML.childNodes[0].childNodes[2].outerMathML.replace(outerVar, innerStr), res = '<math xmlns="http://www.w3.org/1998/Math/MathML"><lambda><bvar>' + innerVar + '</bvar><domainofapplication><complexes/></domainofapplication>' + outerStr + '</lambda></math>';
                return new MathLib.Functn(function (y) {
                    return f(x(y));
                }, {
                    contentMathMLString: res
                });
            } else if(typeof x === 'function') {
                return function (y) {
                    return f(x(y));
                };
            } else if(x.type === 'complex') {
                return x[options.name].apply(x, Array.prototype.slice.call(arguments, 1));
            } else {
                return x[options.name]();
            }
        };
        for(var name in functnPrototype) {
            functn[name] = functnPrototype[name];
        }
        functn.type = 'functn';
        functn.constructor = MathLib.Functn;
        var contentMathML = options.contentMathMLString || '';
        Object.defineProperties(functn, {
            id: {
                value: options.name
            },
            contentMathML: {
                value: new MathLib.MathML(contentMathML)
            }
        });
        return functn;
    };
    functnPrototype.diff = function (x, h) {
        if (typeof h === "undefined") { h = 1e-5; }
        return (this(x + h) - this(x - h)) / (2 * h);
    };
    functnPrototype.quad = function (a, b, options) {
        if (typeof options === "undefined") { options = {
        }; }
        var f = this, warnMessage = [
            'Calculation succeded', 
            'Minimum step size reached', 
            'Maximum function count exceeded', 
            'Infinite or NaN function value encountered'
        ], Q;
        options.calls = 3;
        options.warn = 0;
        if(a === -Infinity) {
            a = -Number.MAX_VALUE;
        }
        if(b === Infinity) {
            b = Number.MAX_VALUE;
        }
        if(!('minStep' in options)) {
            options.minStep = 1e-15;
        }
        if(!('maxCalls' in options)) {
            options.maxCalls = 10000;
        }
        if(!('tolerance' in options)) {
            options.tolerance = 1e-5;
        }
        Q = quadstep(f, a, b, f(a), f((a + b) / 2), f(b), options);
        options.warnMessage = warnMessage[options.warn];
        return Q;
    };
    var quadstep = function (f, a, b, fa, fc, fb, options) {
        var h = b - a, c = (a + b) / 2, fd = f((a + c) / 2), fe = f((c + b) / 2), Q1 = (h / 6) * (fa + 4 * fc + fb), Q2 = (h / 12) * (fa + 4 * fd + 2 * fc + 4 * fe + fb), Q = Q2 + (Q2 - Q1) / 15;
        options.calls = options.calls + 2;
        if(!MathLib.isFinite(Q)) {
            options.warn = Math.max(options.warn, 3);
            return Q;
        }
        if(options.calls > options.maxCalls) {
            options.warn = Math.max(options.warn, 2);
            return Q;
        }
        if(Math.abs(Q2 - Q) <= options.tolerance) {
            return Q;
        }
        if(Math.abs(h) < options.minStep || c == a || c == b) {
            options.warn = Math.max(options.warn, 1);
            return Q;
        }
        return quadstep(f, a, c, fa, fd, fc, options) + quadstep(f, c, b, fc, fe, fb, options);
    };
    functnPrototype.toContentMathML = function () {
        return this.contentMathML;
    };
    functnPrototype.toContentMathMLString = function (bvar) {
        if (typeof bvar === "undefined") { bvar = ''; }
        return this.contentMathML.outerMathML;
    };
    functnPrototype.toLaTeX = function (bvar) {
        if (typeof bvar === "undefined") { bvar = ''; }
        var handlers = {
            apply: function (n) {
                var f = n.childNodes[0], args = n.childNodes.slice(1).map(function (x) {
                    return handlers[x.nodeName](x);
                }), str = '';
                if(f.nodeName === 'plus') {
                    str = args.join('+');
                } else if(f.nodeName === 'times') {
                    str = args.join('*');
                } else if(f.nodeName === 'power') {
                    str = args[0] + '^{' + args[1] + '}';
                } else {
                    str = '\\' + f.nodeName + '(' + args.join(', ') + ')';
                }
                return str;
            },
            bvar: function () {
                return '';
            },
            ci: function (n) {
                return bvar || n.innerMathML;
            },
            cn: function (n) {
                return n.innerMathML;
            },
            cs: function (n) {
                return n.innerMathML;
            },
            domainofapplication: function () {
                return '';
            },
            lambda: function (n) {
                return n.childNodes.reduce(function (old, cur) {
                    return old + handlers[cur.nodeName](cur);
                }, '');
            },
            '#text': function (n) {
                return n.innerMathML;
            }
        };
        return handlers[this.contentMathML.childNodes[0].nodeName](this.contentMathML.childNodes[0]);
    };
    functnPrototype.toMathML = function () {
        return this.contentMathML.toMathML();
    };
    functnPrototype.toMathMLString = function () {
        return this.contentMathML.toMathMLString();
    };
    functnPrototype.toString = function (bvar) {
        if (typeof bvar === "undefined") { bvar = ''; }
        var handlers = {
            apply: function (n) {
                var f = n.childNodes[0], args = n.childNodes.slice(1).map(function (x) {
                    return handlers[x.nodeName](x);
                }), str = '';
                if(f.nodeName === 'plus') {
                    str = args.join('+');
                } else if(f.nodeName === 'times') {
                    str = args.join('*');
                } else if(f.nodeName === 'power') {
                    str = args[0] + '^' + args[1];
                } else {
                    str = f.nodeName + '(' + args.join(', ') + ')';
                }
                return str;
            },
            bvar: function () {
                return '';
            },
            ci: function (n) {
                return bvar || n.innerMathML;
            },
            cn: function (n) {
                return n.innerMathML;
            },
            cs: function (n) {
                return n.innerMathML;
            },
            domainofapplication: function () {
                return '';
            },
            lambda: function (n) {
                return n.childNodes.reduce(function (old, cur) {
                    return old + handlers[cur.nodeName](cur);
                }, '');
            },
            '#text': function (n) {
                return n.innerMathML;
            }
        };
        return handlers[this.contentMathML.childNodes[0].nodeName](this.contentMathML.childNodes[0]);
    };
    var mathStart = '<math xmlns="http://www.w3.org/1998/Math/MathML"><lambda><bvar><ci>x</ci></bvar><domainofapplication><complexes/></domainofapplication><apply><', mathEnd = '/><ci>x</ci></apply></lambda></math>';
    var functionList = {
        abs: Math.abs,
        arccos: Math.acos,
        arccot: function (x) {
            return 1.5707963267948966 - Math.atan(x);
        },
        arccsc: function (x) {
            return Math.asin(1 / x);
        },
        arcosh: (Math).acosh || function (x) {
            return Math.log(x + Math.sqrt(x * x - 1));
        },
        arcoth: function (x) {
            return 0.5 * Math.log((x + 1) / (x - 1));
        },
        arcsch: function (x) {
            return Math.log((1 + Math.sqrt(1 + x * x)) / (x));
        },
        arcsec: function (x) {
            return Math.acos(1 / x);
        },
        arcsin: Math.asin,
        arctan: Math.atan,
        arsech: function (x) {
            return Math.log((1 + Math.sqrt(1 - x * x)) / (x));
        },
        arsinh: (Math).asinh || function (x) {
            return Math.log(x + Math.sqrt(x * x + 1));
        },
        artanh: (Math).atanh || function (x) {
            return 0.5 * Math.log((1 + x) / (1 - x));
        },
        ceil: function (x) {
            if(x === 0) {
                return x;
            }
            return Math.ceil(x);
        },
        floor: Math.floor,
        cos: Math.cos,
        cosh: (Math).cosh || function (x) {
            return (Math.exp(x) + Math.exp(-x)) / 2;
        },
        cot: function (x) {
            if(x === 0) {
                return 1 / x;
            }
            return Math.tan(1.5707963267948966 - x);
        },
        coth: function (x) {
            return (Math.exp(x) + Math.exp(-x)) / (Math.exp(x) - Math.exp(-x));
        },
        csc: function (x) {
            return 1 / Math.sin(x);
        },
        csch: function (x) {
            return 2 / (Math.exp(x) - Math.exp(-x));
        },
        exp: function (x) {
            return Math.exp(x);
        },
        inverse: function (x) {
            return 1 / x;
        },
        sec: function (x) {
            return 1 / Math.cos(x);
        },
        sech: function (x) {
            return 2 / (Math.exp(x) + Math.exp(-x));
        },
        sin: Math.sin,
        sinh: (Math).sinh || function (x) {
            return (Math.exp(x) - Math.exp(-x)) / 2;
        },
        tan: Math.tan,
        tanh: (Math).tanh || function (x) {
            return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
        }
    };
    for(var elemfn in functionList) {
        if(functionList.hasOwnProperty(elemfn)) {
            MathLib.extend('', elemfn, new MathLib.Functn(functionList[elemfn], {
                name: elemfn,
                contentMathMLString: mathStart + elemfn + mathEnd
            }));
        }
    }
    MathLib.identity = new MathLib.Functn(function identity(x) {
        return x;
    }, {
        contentMathMLString: mathStart + 'ident' + mathEnd
    });
    var functionList1 = {
        arctan2: Math.atan2,
        binomial: function (n, k) {
            var res = 1, i;
            if(k < 0 || (n > 0 && k > n)) {
                return 0;
            }
            if(n < 0) {
                res = Math.pow(-1, k);
                n = k - n - 1;
            }
            if(k > n / 2) {
                k = n - k;
            }
            for(i = 1; i <= k; i++) {
                res *= (n + 1 - i) / i;
            }
            return res;
        },
        cbrt: function (x) {
            var a3, a3x, an, a;
            if(x === 0 || x !== x || x === Infinity || x === -Infinity) {
                return x;
            }
            a = MathLib.sign(x) * Math.pow(Math.abs(x), 1 / 3);
            while(true) {
                a3 = Math.pow(a, 3);
                a3x = a3 + x;
                an = a * (a3x + x) / (a3x + a3);
                if(MathLib.isZero(an - a)) {
                    break;
                }
                a = an;
            }
            return an;
        },
        conjugate: function (x) {
            return x;
        },
        copy: function (x) {
            return x;
        },
        degToRad: function (x) {
            return x * 0.017453292519943295;
        },
        digitsum: function (x) {
            var out = 0;
            while(x > 9) {
                out += x % 10;
                x = Math.floor(x / 10);
            }
            return out + x;
        },
        divide: function (a, b) {
            return MathLib.times(a, MathLib.inverse(b));
        },
        divisors: function (x) {
            var res = x === 1 ? [] : [
                1
            ], i, ii;
            for(i = 2 , ii = x / 2; i <= ii; i++) {
                if(x % i === 0) {
                    res.push(i);
                }
            }
            res.push(x);
            return MathLib.set(res);
        },
        factor: function (n) {
            var res = [], i;
            n = Math.abs(n);
            while(n % 2 === 0) {
                n = n / 2;
                res.push(2);
            }
            i = 3;
            while(n !== 1) {
                while(n % i === 0) {
                    n = n / i;
                    res.push(i);
                }
                i += 2;
            }
            return new MathLib.Set(res, true);
        },
        factorial: function (x) {
            var out = 1, i;
            for(i = 1; i <= x; i = i + 1) {
                out *= i;
            }
            return out;
        },
        fallingFactorial: function (n, m, s) {
            var res = 1, j;
            s = s || 1;
            for(j = 0; j < m; j++) {
                res *= (n - j * s);
            }
            return res;
        },
        fibonacci: function (n) {
            return Math.floor(Math.pow(MathLib.goldenRatio, n) / Math.sqrt(5));
        },
        hypot: function (a, b) {
            var args, x, y;
            if(arguments.length === 1) {
                return Math.abs(a);
            }
            if(arguments.length > 2) {
                args = Array.prototype.slice.call(arguments);
                args.shift();
                b = MathLib.hypot.apply(null, args);
            }
            a = MathLib.abs(a);
            b = MathLib.abs(b);
            if(a === Infinity || b === Infinity) {
                return Infinity;
            }
            if(a === 0 && b === 0) {
                return 0;
            }
            x = Math.max(a, b);
            y = Math.min(a, b);
            return x * Math.sqrt(1 + Math.pow(y / x, 2));
        },
        hypot2: function () {
            var args = Array.prototype.slice.call(arguments);
            if(args.some(function (x) {
                return x === Infinity || x === -Infinity;
            })) {
                return Infinity;
            }
            return args.reduce(function (old, cur) {
                return old + cur * cur;
            }, 0);
        },
        isFinite: function (x) {
            return Math.abs(x) < Infinity;
        },
        isInt: function (x) {
            return x % 1 === 0;
        },
        isNaN: function (x) {
            return x !== x;
        },
        isNegZero: function (x) {
            return 1 / x === -Infinity;
        },
        isOne: function (a) {
            return Math.abs(a - 1) < MathLib.epsilon;
        },
        isPosZero: function (x) {
            return 1 / x === Infinity;
        },
        isPrime: function (x) {
            var sqrt = Math.sqrt(x), i;
            if(x % 1 === 0 && x > 1) {
                if(x === 2) {
                    return true;
                }
                if(x % 2 === 0) {
                    return false;
                }
                for(i = 3; i <= sqrt; i += 2) {
                    if(x % i === 0) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        },
        isReal: function (a) {
            return true;
        },
        isZero: function (x) {
            return Math.abs(x) < MathLib.epsilon;
        },
        lg: function (x) {
            return Math.log(x) / Math.LN10;
        },
        ln: Math.log,
        log: function (base, x) {
            if(arguments.length === 1) {
                x = base;
                base = 10;
            }
            return Math.log(x) / Math.log(base);
        },
        minus: function (a, b) {
            return MathLib.plus(a, MathLib.negative(b));
        },
        mod: function (n, m) {
            var nm = n % m;
            return nm >= 0 ? nm : nm + m;
        },
        negative: function (x) {
            return -x;
        },
        pow: function (x, y) {
            if(x === 1 || (x === -1 && (y === Infinity || y === -Infinity))) {
                return 1;
            }
            return Math.pow(x, y);
        },
        radToDeg: function (x) {
            return x * 57.29577951308232;
        },
        random: Math.random,
        risingFactorial: function (n, m, s) {
            var res = 1, j;
            s = s || 1;
            for(j = 0; j < m; j++) {
                res *= (n + j * s);
            }
            return res;
        },
        round: function (x) {
            if(x === 0) {
                return x;
            }
            return Math.round(x);
        },
        root: function (x, root) {
            if(arguments.length === 1) {
                return Math.sqrt(x);
            }
            return Math.pow(x, 1 / root);
        },
        sign: function (x) {
            return x && (x < 0 ? -1 : 1);
        },
        sqrt: function (x) {
            if(x === 0) {
                return 0;
            }
            return Math.sqrt(x);
        },
        trunc: function (x, n) {
            return x.toFixed(n || 0);
        },
        toLaTeX: function (x, plus) {
            if(plus) {
                return (x < 0 ? '-' : '+') + Math.abs(x);
            } else {
                return (x < 0 ? '-' : '') + Math.abs(x);
            }
        },
        toMathMLString: function (x, plus) {
            if(plus) {
                return '<mo>' + (x < 0 ? '-' : '+') + '</mo><mn>' + Math.abs(x) + '</mn>';
            } else {
                return (x < 0 ? '<mo>-</mo>' : '') + '<mn>' + Math.abs(x) + '</mn>';
            }
        },
        toString: function (x, plus) {
            if(plus) {
                return (x < 0 ? '-' : '+') + Math.abs(x);
            } else {
                return (x < 0 ? '-' : '') + Math.abs(x);
            }
        }
    };
    MathLib.toContentMathMLString = function (x) {
        if(typeof x === 'number') {
            return '<cn>' + x + '</cn>';
        } else {
            return x.toContentMathML();
        }
    };
    MathLib.and = function () {
        return Array.prototype.slice.call(arguments).every(function (x) {
            return !!x;
        });
    };
    MathLib.or = function () {
        return Array.prototype.slice.call(arguments).some(function (x) {
            return !!x;
        });
    };
    MathLib.xor = function () {
        return Array.prototype.slice.call(arguments).reduce(function (x, y) {
            return x + y;
        }) % 2 !== 0;
    };
    MathLib.not = function (x) {
        return !x;
    };
    MathLib.compare = function (a, b) {
        if(MathLib.type(a) !== MathLib.type(b)) {
            return MathLib.sign(MathLib.type(a).localeCompare(MathLib.type(b)));
        } else if(typeof a === 'number') {
            return MathLib.sign(a - b);
        } else if(typeof a === 'string') {
            return a.localeCompare(b);
        }
        return a.compare(b);
    };
    MathLib.type = function (x) {
        if(x === null) {
            return 'null';
        }
        if(x === undefined) {
            return 'undefined';
        }
        return x.type ? x.type : (x.constructor.name || Object.prototype.toString.call(x).slice(8, -1)).toLowerCase();
    };
    MathLib.is = function (obj, type) {
        do {
            if(MathLib.type(obj) === type) {
                return true;
            }
            obj = Object.getPrototypeOf(Object(obj));
        }while(obj);
        return false;
    };
    var functionList3 = {
        arithMean: function (n) {
            return MathLib.plus(n) / n.length;
        },
        gcd: function (a) {
            var min, reduction = function (x) {
                return x !== min ? x % min : x;
            }, isntZero = function (x) {
                return x !== 0;
            };
            a = a.filter(isntZero).map(Math.abs);
            if(a.length === 0) {
                return 0;
            }
            while(a.length > 1) {
                min = MathLib.min(a);
                a = a.map(reduction).filter(isntZero);
            }
            return a[0] || min;
        },
        geoMean: function (n) {
            return MathLib.root(MathLib.times(n), n.length);
        },
        harmonicMean: function (n) {
            return n.length / MathLib.plus(n.map(MathLib.inverse));
        },
        lcm: function (n) {
            return MathLib.times(n) / MathLib.gcd(n);
        },
        max: function (n) {
            return Math.max.apply(null, n);
        },
        min: function (n) {
            return Math.min.apply(null, n);
        },
        plus: function (n) {
            if(n.length === 0) {
                return 0;
            }
            return n.reduce(function (a, b) {
                var f1, f2, astr, bstr;
                if(typeof a === 'number' && typeof b === 'number') {
                    return a + b;
                } else if(a.type === 'functn' || b.type === 'functn') {
                    astr = a.type === 'functn' ? a.contentMathML.childNodes[0].apply.outerMathML : MathLib.toContentMathMLString(a);
                    bstr = b.type === 'functn' ? b.contentMathML.childNodes[0].apply.outerMathML : MathLib.toContentMathMLString(b);
                    f1 = a;
                    f2 = b;
                    if(a.type !== 'functn') {
                        f1 = function () {
                            return a;
                        };
                    } else if(b.type !== 'functn') {
                        f2 = function () {
                            return b;
                        };
                    }
                    var MathML = '<math xmlns="http://www.w3.org/1998/Math/MathML"><lambda><bvar><ci>x</ci></bvar><domainofapplication><complexes/></domainofapplication><apply><plus/>' + astr + bstr + '</apply></lambda></math>';
                    return new MathLib.Functn(function (x) {
                        return MathLib.plus(f1(x), f2(x));
                    }, {
                        contentMathMLString: MathML
                    });
                } else if(typeof a === 'object') {
                    return a.plus(b);
                } else if(typeof b === 'object') {
                    return b.plus(a);
                }
            });
        },
        times: function (n) {
            if(n.length === 0) {
                return 1;
            }
            return n.reduce(function (a, b) {
                var f1, f2, astr, bstr;
                if(typeof a === 'number' && typeof b === 'number') {
                    return a * b;
                } else if(a.type === 'functn' || b.type === 'functn') {
                    astr = a.type === 'functn' ? a.contentMathML.childNodes[0].apply.outerMathML : MathLib.toContentMathMLString(a);
                    bstr = b.type === 'functn' ? b.contentMathML.childNodes[0].apply.outerMathML : MathLib.toContentMathMLString(b);
                    f1 = a;
                    f2 = b;
                    if(a.type !== 'functn') {
                        f1 = function () {
                            return a;
                        };
                    } else if(b.type !== 'functn') {
                        f2 = function () {
                            return b;
                        };
                    }
                    var MathML = '<math xmlns="http://www.w3.org/1998/Math/MathML"><lambda><bvar><ci>x</ci></bvar><domainofapplication><complexes/></domainofapplication><apply><times/>' + astr + bstr + '</apply></lambda></math>';
                    return new MathLib.Functn(function (x) {
                        return MathLib.times(f1(x), f2(x));
                    }, {
                        contentMathMLString: MathML
                    });
                } else if(typeof a === 'object') {
                    return a.times(b);
                } else if(typeof b === 'object') {
                    return b.times(a);
                }
            });
        }
    };
    MathLib.isEqual = function () {
        return flatten(Array.prototype.slice.apply(arguments)).every(function (a, i, arr) {
            if(a === arr[0]) {
                return true;
            } else if(typeof a === 'number' && typeof arr[0] === 'number') {
                return Math.abs(a - arr[0]) <= 3e-15;
            } else if(typeof a === 'object') {
                return a.isEqual(arr[0]);
            } else if(typeof arr[0] === 'object') {
                return arr[0].isEqual(a);
            }
            return false;
        });
    };
    var createFunction1 = function (f, name) {
        return function (x) {
            if(typeof x === 'number') {
                return f.apply('', arguments);
            } else if(typeof x === 'function') {
                return function (y) {
                    return f(x(y));
                };
            } else if(x.type === 'set') {
                return new MathLib.Set(x.map(f));
            } else if(x.type === 'complex') {
                return x[name].apply(x, Array.prototype.slice.call(arguments, 1));
            } else if(Array.isArray(x)) {
                return x.map(f);
            } else {
                return x[name]();
            }
        };
    };
    var createFunction3 = function (f, name) {
        return function (n) {
            if(MathLib.type(n) === 'set') {
                return f(n.slice());
            } else if(MathLib.type(n) !== 'array') {
                n = Array.prototype.slice.apply(arguments);
            }
            return f(n);
        };
    };
    var func, cur;
    for(func in functionList1) {
        if(functionList1.hasOwnProperty(func)) {
            cur = functionList1[func];
            Object.defineProperty(MathLib, func, {
                value: createFunction1(functionList1[func], func)
            });
        }
    }
    for(func in functionList3) {
        if(functionList3.hasOwnProperty(func)) {
            cur = functionList3[func];
            Object.defineProperty(MathLib, func, {
                value: createFunction3(functionList3[func], func)
            });
        }
    }
    var Screen = (function () {
        function Screen(id, options) {
            this.uuid = Date.now() + '';
            this.height = options.height || 500;
            this.width = options.width || 500;
            var container = document.getElementById(id), screen, innerHTML = [
                '<style scoped>', 
                '.MathLib_figure_' + this.uuid + '{margin: 1em auto; display: -webkit-flex; -webkit-flex-direction: column; -webkit-flex-wrap: nowrap; -webkit-justify-content: center; -webkit-align-content: center; -webkit-align-items: center;}', 
                '.MathLib_figcaption_' + this.uuid + ' {font-family: Helvetica, sans-serif; font-size: 1em; color: #444; text-align: center; margin: 1em}', 
                '.MathLib_wrapper_' + this.uuid + ' {width: ' + this.width + 'px; height: ' + this.height + 'px; position: relative;}', 
                '.MathLib_screen_' + this.uuid + ' {width: ' + this.width + 'px; height: ' + this.height + 'px; position: absolute;}', 
                '.MathLib_contextMenuOverlay_' + this.uuid + ' {display: none; position: fixed; top: 0; left: 0; z-index:100; width: 100vw; height: 100vh}', 
                '.MathLib_contextMenu_' + this.uuid + ' {', 
                'position: relative;', 
                'top: 200px;', 
                'left: 200px;', 
                'z-index:1001;', 
                'padding: 5px 0 5px 0;', 
                'width: 200px;', 
                'border: 1px solid #ccc;', 
                'border-radius: 5px;', 
                'background: #FFFFFF;', 
                'box-shadow: 0 10px 10px rgba(0, 0, 0, 0.5);', 
                'font-family: Helvetica;', 
                'list-style-type: none;', 
                '}', 
                '.MathLib_contextMenu_item_' + this.uuid + ' {', 
                'padding-left: 20px;', 
                'border-top: 1px solid transparent;', 
                'border-bottom: 1px solid transparent;', 
                '-webkit-user-select: none;', 
                '}', 
                '.MathLib_contextMenu_item_' + this.uuid + ':hover {', 
                'border-top: 1px solid #5b82e8;', 
                'border-bottom: 1px solid #4060a7;', 
                'background-color: #658bf1;', 
                'background-image:         linear-gradient(to bottom, #658bf1, #2a63ee);', 
                'color: white;', 
                '}', 
                '.MathLib_contextMenu_item_' + this.uuid + ' > .MathLib_contextMenu_' + this.uuid + ' {', 
                'display: none;', 
                'position: absolute;', 
                'left: 200px;', 
                'top: 19px;', 
                '}', 
                '.MathLib_contextMenu_item_' + this.uuid + ':hover > .MathLib_contextMenu_' + this.uuid + ' {', 
                'display: block;', 
                'color: #000000;', 
                '}', 
                '</style>', 
                '<figure class="MathLib_figure_' + this.uuid + '">', 
                '<div class="MathLib_wrapper_' + this.uuid + '"></div>', 
                options.figcaption ? '<figcaption class="MathLib_figcaption_' + this.uuid + '">' + options.figcaption + '</figcaption>' : '', 
                '</figure>', 
                '<div class="MathLib_contextMenuOverlay_' + this.uuid + '">', 
                '<ul class="MathLib_contextMenu_' + this.uuid + '">', 
                '<li class="MathLib_contextMenu_ite_' + this.uuid + 'm" id="MathLib_screenshot_item">Save screenshot</li>', 
                '<li class="MathLib_contextMenu_item_' + this.uuid + '">Options', 
                '<ul class="MathLib_contextMenu_' + this.uuid + '">', 
                '<li class="MathLib_contextMenu_item_' + this.uuid + '">Axis', 
                '<ul class="MathLib_contextMenu_' + this.uuid + '">', 
                '<li class="MathLib_contextMenu_item">Axis1</li>', 
                '<li class="MathLib_contextMenu_item">Axis2</li>', 
                '</ul>', 
                '</li>', 
                '<li class="MathLib_contextMenu_item">Grid', 
                '<ul class="MathLib_contextMenu">', 
                '<li class="MathLib_contextMenu_item">Grid1</li>', 
                '<li class="MathLib_contextMenu_item">Grid2</li>', 
                '</ul>', 
                '</li>', 
                '</li>', 
                '</ul>', 
                '</li>', 
                '<li class="MathLib_contextMenu_item" id="MathLib_fullscreen_item">Enter Fullscreen</li>', 
                '</ul>', 
                '</div>'
            ].join('');
            container.innerHTML = innerHTML;
            this.container = container;
            this.figure = container.getElementsByClassName('MathLib_figure_' + this.uuid)[0];
            this.wrapper = container.getElementsByClassName('MathLib_wrapper_' + this.uuid)[0];
            this.contextMenu = container.getElementsByClassName('MathLib_contextMenu_' + this.uuid)[0];
            this.contextMenuOverlay = container.getElementsByClassName('MathLib_contextMenuOverlay_' + this.uuid)[0];
        }
        return Screen;
    })();
    MathLib.Screen = Screen;    
    var Layer = (function () {
        function Layer(screen, id, zIndex) {
            var _this = this;
            this.screen = screen;
            this.id = id;
            this.zIndex = zIndex;
            this.stack = [];
            this.transformation = screen.transformation;
            var element;
            if(screen.renderer === 'Canvas') {
                element = document.createElement('canvas');
                element.classList.add('MathLib_screen_' + screen.uuid);
                element.width = screen.width;
                element.height = screen.height;
                screen.wrapper.appendChild(element);
                this.element = element;
                this.ctx = element.getContext('2d');
                this.applyTransformation = function () {
                    var m = _this.transformation;
                    _this.ctx.setTransform(m[0][0], m[1][0], m[0][1], m[1][1], m[0][2], m[1][2]);
                };
                this.applyTransformation();
                if(id === 'back') {
                    this.draw = function () {
                        var top = (-screen.translation.y) / screen.scale.y, bottom = (screen.height - screen.translation.y) / screen.scale.y, left = (-screen.translation.x) / screen.scale.x, right = (screen.width - screen.translation.x) / screen.scale.x;
                        this.ctx.fillStyle = colorConvert(screen.background);
                        this.ctx.fillRect(left, bottom, right - left, top - bottom);
                        canvas.draw.call(_this);
                    };
                } else if(id === 'grid') {
                    this.ctx.strokeStyle = colorConvert(screen.grid.color) || '#cccccc';
                    this.ctx.fillStyle = 'rgba(255,255,255,0)';
                    this.draw = function () {
                        _this.ctx.lineWidth = 4 / (screen.scale.x - screen.scale.y);
                        drawGrid.call(_this);
                    };
                } else if(id === 'axis') {
                    this.ctx.strokeStyle = colorConvert(screen.axis.color) || '#000000';
                    this.draw = function () {
                        _this.ctx.lineWidth = 4 / (screen.scale.x - screen.scale.y);
                        drawAxis.call(_this);
                    };
                } else {
                    this.ctx.strokeStyle = '#000000';
                    this.ctx.fillStyle = 'rgba(255,255,255,0)';
                    this.draw = function () {
                        _this.ctx.lineWidth = 4 / (screen.scale.x - screen.scale.y);
                        canvas.draw.call(_this);
                    };
                }
                this.circle = canvas.circle;
                this.line = canvas.line;
                this.path = canvas.path;
                this.pixel = canvas.pixel;
                this.text = canvas.text;
            } else if(screen.renderer === 'SVG') {
                var ctx = document.createElementNS('http://www.w3.org/2000/svg', 'g'), m = screen.transformation;
                ctx.setAttribute('transform', 'matrix(' + m[0][0] + ',' + m[1][0] + ',' + m[0][1] + ',' + m[1][1] + ',' + m[0][2] + ',' + m[1][2] + ')');
                screen.element.appendChild(ctx);
                this.ctx = ctx;
                if(id === 'back') {
                    this.draw = function () {
                        var top = (-screen.translation.y) / screen.scale.y, bottom = (screen.height - screen.translation.y) / screen.scale.y, left = (-screen.translation.x) / screen.scale.x, right = (screen.width - screen.translation.x) / screen.scale.x;
                        svg.draw.call(_this);
                    };
                } else if(id === 'grid') {
                    ctx.setAttribute('stroke', colorConvert(screen.grid.color) || '#cccccc');
                    this.draw = function () {
                        ctx.setAttribute('stroke-width', 4 / (screen.scale.x - screen.scale.y) + '');
                        drawGrid.call(_this);
                    };
                } else if(id === 'axis') {
                    ctx.setAttribute('stroke', colorConvert(screen.axis.color) || '#000000');
                    this.draw = function () {
                        ctx.setAttribute('stroke-width', 4 / (screen.scale.x - screen.scale.y) + '');
                        drawAxis.call(_this);
                    };
                } else {
                    this.draw = svg.draw;
                }
                this.circle = svg.circle;
                this.line = svg.line;
                this.path = svg.path;
                this.pixel = svg.pixel;
                this.text = svg.text;
            }
            screen.layer.splice(zIndex, 0, this);
        }
        return Layer;
    })();
    MathLib.Layer = Layer;    
    var drawAxis = function () {
        var screen = this.screen, options = {
            stroke: colorConvert(this.screen.axis.color),
            'stroke-width': -1 / screen.transformation[1][1]
        }, textOptions = {
            strokeStyle: colorConvert(this.screen.axis.textColor),
            fillStyle: colorConvert(this.screen.axis.textColor)
        }, top = (-screen.translation.y) / screen.scale.y, bottom = (screen.height - screen.translation.y) / screen.scale.y, left = (-screen.translation.x) / screen.scale.x, right = (screen.width - screen.translation.x) / screen.scale.x, lengthX = +10 / screen.transformation[0][0], lengthY = -10 / screen.transformation[1][1], yExp = 1 - Math.floor(Math.log(-screen.transformation[1][1]) / Math.LN10 - 0.3), xExp = 1 - Math.floor(Math.log(+screen.transformation[0][0]) / Math.LN10 - 0.3), yTick = Math.pow(10, yExp), xTick = Math.pow(10, xExp), i;
        this.line([
            [
                left, 
                0
            ], 
            [
                right, 
                0
            ]
        ], false, true);
        this.line([
            [
                0, 
                bottom
            ], 
            [
                0, 
                top
            ]
        ], false, true);
        if(screen.grid.tick) {
            for(i = -yTick; i >= left; i -= yTick) {
                this.line([
                    [
                        i, 
                        -lengthY
                    ], 
                    [
                        i, 
                        lengthY
                    ]
                ], false, true);
            }
            for(i = yTick; i <= right; i += yTick) {
                this.line([
                    [
                        i, 
                        -lengthY
                    ], 
                    [
                        i, 
                        lengthY
                    ]
                ], false, true);
            }
            for(i = -xTick; i >= bottom; i -= xTick) {
                this.line([
                    [
                        -lengthX, 
                        i
                    ], 
                    [
                        lengthX, 
                        i
                    ]
                ], false, true);
            }
            for(i = xTick; i <= top; i += xTick) {
                this.line([
                    [
                        -lengthX, 
                        i
                    ], 
                    [
                        lengthX, 
                        i
                    ]
                ], false, true);
            }
        }
        var xLen = Math.max(0, Math.min(20, -xExp)), yLen = Math.max(0, Math.min(20, -yExp));
        for(i = -yTick; i >= left; i -= yTick) {
            this.text(i.toFixed(yLen), i, -2 * lengthY, textOptions, true);
        }
        for(i = yTick; i <= right; i += yTick) {
            this.text(i.toFixed(yLen), i, -2 * lengthY, textOptions, true);
        }
        for(i = -xTick; i >= bottom; i -= xTick) {
            this.text(i.toFixed(xLen), -2 * lengthX, i, textOptions, true);
        }
        for(i = xTick; i <= top; i += xTick) {
            this.text(i.toFixed(xLen), -2 * lengthX, i, textOptions, true);
        }
        return this;
    };
    var drawGrid = function () {
        if(!this.screen.grid) {
            return this;
        }
        var screen = this.screen, top = (-screen.translation.y) / screen.scale.y, bottom = (screen.height - screen.translation.y) / screen.scale.y, left = (-screen.translation.x) / screen.scale.x, right = (screen.width - screen.translation.x) / screen.scale.x, yTick = Math.pow(10, 1 - Math.floor(Math.log(-screen.transformation[1][1]) / Math.LN10 - 0.3)), xTick = Math.pow(10, 1 - Math.floor(Math.log(+screen.transformation[0][0]) / Math.LN10 - 0.3)), i;
        if(screen.grid.type === 'cartesian') {
            for(i = bottom - (bottom % yTick); i <= top; i += yTick) {
                this.line([
                    [
                        left, 
                        i
                    ], 
                    [
                        right, 
                        i
                    ]
                ], false, true);
            }
            for(i = left - (left % xTick); i <= right; i += xTick) {
                this.line([
                    [
                        i, 
                        bottom
                    ], 
                    [
                        i, 
                        top
                    ]
                ], false, true);
            }
        } else if(screen.grid.type === 'polar') {
            for(i = 0; i < 2 * Math.PI; i += screen.grid.angle) {
                this.line([
                    [
                        0, 
                        0
                    ], 
                    [
                        50 * Math.cos(i), 
                        50 * Math.sin(i)
                    ]
                ], false, true);
            }
            var max = Math.sqrt(Math.max(top * top, bottom * bottom) + Math.max(left * left, right * right)), min = 0;
            for(i = min; i <= max; i += Math.min(xTick, yTick)) {
                this.circle(new MathLib.Circle([
                    0, 
                    0, 
                    1
                ], i), false, true);
            }
        }
        return this;
    };
    var colorConvert = function (n) {
        if(n === undefined) {
            return undefined;
        } else if(typeof n === 'string') {
            return n;
        }
        return '#' + ('00000' + n.toString(16)).slice(-6);
    };
    var canvas = {
        normalizeOptions: function (opt) {
            var res = {
            };
            if('fillColor' in opt) {
                res.fillStyle = opt.fillColor;
            } else if('color' in opt) {
                res.fillStyle = opt.color;
            }
            if('font' in opt) {
                res['font-family'] = opt.font;
            }
            if('fontSize' in opt) {
                res['font-size'] = opt.fontSize;
            }
            if('lineColor' in opt) {
                res.strokeStyle = opt.lineColor;
            } else if('color' in opt) {
                res.strokeStyle = opt.color;
            }
            return res;
        },
        applyTransformation: function () {
            var m = this.transformation;
            this.layer.forEach(function (l) {
                l.ctx.setTransform(m[0][0], m[1][0], m[0][1], m[1][1], m[0][2], m[1][2]);
            });
        },
        draw: function (x, options) {
            if (typeof options === "undefined") { options = {
            }; }
            var _this = this;
            if(arguments.length === 0) {
                this.stack.forEach(function (x, i) {
                    if(x.type === 'text') {
                        _this.text(x.object, x.x, x.y, x.options, true);
                    }
                    if(x.type === 'pixel') {
                        _this.pixel(x.object, x.t, x.r, x.b, x.l, x.options, true);
                    } else {
                        _this[x.type](x.object, x.options, true);
                    }
                });
            } else if(x.type === 'circle') {
                this.circle(x, options);
            } else if(x.type === 'line') {
                this.line(x, options);
            } else if(Array.isArray(x)) {
                x.forEach(function (y) {
                    _this[y.type](y, options);
                });
            }
        },
        circle: function (circle, options, redraw) {
            if (typeof redraw === "undefined") { redraw = false; }
            var screen = this.screen, ctx = this.ctx, prop, opts;
            ctx.save();
            ctx.lineWidth = (options.lineWidth || 4) / (screen.scale.x - screen.scale.y);
            if(options) {
                opts = canvas.normalizeOptions(options);
                for(prop in opts) {
                    if(opts.hasOwnProperty(prop)) {
                        ctx[prop] = opts[prop];
                    }
                }
                if('setLineDash' in ctx) {
                    ctx.setLineDash(('dash' in options ? options.dash : []));
                }
                if('lineDashOffset' in ctx) {
                    ctx.lineDashOffset = ('dashOffset' in options ? options.dashOffset : 0);
                }
            }
            ctx.beginPath();
            ctx.arc(circle.center[0], circle.center[1], circle.radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            if(!redraw) {
                this.stack.push({
                    type: 'circle',
                    object: circle,
                    options: options
                });
            }
            return this;
        },
        line: function (line, options, redraw) {
            if (typeof redraw === "undefined") { redraw = false; }
            var screen = this.screen, points = this.screen.getLineEndPoints(line), ctx = this.ctx, prop, opts;
            ctx.save();
            ctx.lineWidth = (options.lineWidth || 4) / (screen.scale.x - screen.scale.y);
            if(options) {
                opts = canvas.normalizeOptions(options);
                for(prop in opts) {
                    if(opts.hasOwnProperty(prop)) {
                        ctx[prop] = opts[prop];
                    }
                }
                if('setLineDash' in ctx) {
                    ctx.setLineDash(('dash' in options ? options.dash : []));
                }
                if('lineDashOffset' in ctx) {
                    ctx.lineDashOffset = ('dashOffset' in options ? options.dashOffset : 0);
                }
            }
            ctx.beginPath();
            ctx.moveTo(points[0][0], points[0][1]);
            ctx.lineTo(points[1][0], points[1][1]);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
            if(!redraw) {
                this.stack.push({
                    type: 'line',
                    object: line,
                    options: options
                });
            }
            return this;
        },
        path: function (curve, options, redraw) {
            if (typeof redraw === "undefined") { redraw = false; }
            var screen = this.screen, ctx = this.ctx, prop, opts, path, x, y, i, step = 2 / (screen.scale.x - screen.scale.y), from, to;
            from = ('from' in options ? options.from : (-screen.translation.x) / screen.scale.x) - step;
            to = ('to' in options ? options.to : (screen.width - screen.translation.x) / screen.scale.x) + step;
            ctx.save();
            ctx.lineWidth = (options.lineWidth || 4) / (screen.scale.x - screen.scale.y);
            if(options) {
                opts = canvas.normalizeOptions(options);
                for(prop in opts) {
                    if(opts.hasOwnProperty(prop)) {
                        ctx[prop] = opts[prop];
                    }
                }
                if('setLineDash' in ctx) {
                    ctx.setLineDash(('dash' in options ? options.dash : []));
                }
                if('lineDashOffset' in ctx) {
                    ctx.lineDashOffset = ('dashOffset' in options ? options.dashOffset : 0);
                }
            }
            if(typeof curve === 'function') {
                path = [];
                for(i = from; i <= to; i += step) {
                    path.push([
                        i, 
                        curve(i)
                    ]);
                }
            } else if(typeof curve[0] === 'function') {
                path = [];
                x = curve[0];
                y = curve[1];
                for(i = from; i <= to; i += step) {
                    path.push([
                        x(i), 
                        y(i)
                    ]);
                }
            } else {
                path = curve;
            }
            ctx.beginPath();
            ctx.moveTo(path[0][0], path[0][1]);
            path.forEach(function (x) {
                ctx.lineTo(x[0], x[1]);
            });
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
            if(!redraw) {
                this.stack.push({
                    type: 'path',
                    object: curve,
                    options: options
                });
            }
            return this;
        },
        pixel: function (f, t, r, b, l, options, redraw) {
            if (typeof redraw === "undefined") { redraw = false; }
            var screen = this.screen, top = (-screen.translation.y) / screen.scale.y, bottom = (screen.height - screen.translation.y) / screen.scale.y, left = (-screen.translation.x) / screen.scale.x, right = (screen.width - screen.translation.x) / screen.scale.x, ctx = this.ctx, prop, opts, path, x, y, i;
            t = Math.min(top, t);
            r = Math.min(right, r);
            b = Math.max(bottom, b);
            l = Math.max(left, l);
            var tPxl = Math.floor(-t * screen.scale.y), rPxl = Math.floor(r * screen.scale.x), bPxl = Math.floor(-b * screen.scale.y), lPxl = Math.floor(l * screen.scale.x), w = (rPxl - lPxl), h = (bPxl - tPxl), imgData = ctx.createImageData(w, h), pxl;
            for(y = tPxl , i = 0; y > bPxl; y--) {
                for(x = lPxl; x < rPxl; x++ , i++) {
                    pxl = f(x / screen.scale.x, y / screen.scale.y);
                    imgData.data[4 * i] = pxl[0];
                    imgData.data[4 * i + 1] = pxl[1];
                    imgData.data[4 * i + 2] = pxl[2];
                    imgData.data[4 * i + 3] = pxl[3];
                }
            }
            ctx.putImageData(imgData, (left - l) * screen.scale.x, (t - top) * screen.scale.y);
            if(!redraw) {
                this.stack.push({
                    type: 'pixel',
                    object: f,
                    t: t,
                    r: r,
                    b: b,
                    l: l,
                    options: options
                });
            }
            return this;
        },
        text: function (str, x, y, options, redraw) {
            if (typeof redraw === "undefined") { redraw = false; }
            var defaults = {
                font: 'Helvetica',
                fontSize: 10,
                fillColor: 'rgba(0, 0, 0, 1)',
                lineColor: 'rgba(0, 0, 0, 1)',
                lineWidth: 0.05
            }, ctx, prop, opts;
            ctx = this.ctx;
            if(!redraw) {
                opts = extendObject(defaults, options);
            } else {
                opts = options;
            }
            for(prop in opts) {
                if(opts.hasOwnProperty(prop)) {
                    ctx[prop] = opts[prop];
                }
            }
            ctx.font = (opts.fontSize * this.screen.range.x) + 'px ' + opts.font;
            ctx.font = '10px Helvetica';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            var tf = this.screen.transformation;
            ctx.save();
            ctx.transform(1 / tf[0][0], 0, 0, 1 / tf[1][1], 0, 0);
            ctx.fillText(str, tf[0][0] * x, tf[1][1] * y);
            ctx.restore();
            if(!redraw) {
                this.stack.push({
                    type: 'text',
                    object: str,
                    x: x,
                    y: y,
                    options: opts
                });
            }
            return this;
        }
    };
    var svg = {
        normalizeOptions: function (opt) {
            var res = {
            };
            if('fillColor' in opt) {
                res.fill = opt.fillColor;
            } else if('color' in opt) {
                res.fill = opt.color;
            }
            if('font' in opt) {
                res['font-family'] = opt.font;
            }
            if('fontSize' in opt) {
                res['font-size'] = opt.fontSize;
            }
            if('size' in opt) {
                res.size = opt.size;
            }
            if('lineColor' in opt) {
                res.stroke = opt.lineColor;
            } else if('color' in opt) {
                res.stroke = opt.color;
            }
            if('dash' in opt && opt.dash.length !== 0) {
                res['stroke-dasharray'] = opt.dash;
            }
            if('dashOffset' in opt && opt.dashOffset !== 0) {
                res['stroke-dashoffset'] = opt.dashOffset;
            }
            return res;
        },
        applyTransformation: function () {
            var m = this.transformation;
            this.layer.forEach(function (l) {
                l.ctx.setAttribute('transform', 'matrix(' + m[0][0] + ',' + m[1][0] + ',' + m[0][1] + ',' + m[1][1] + ',' + m[0][2] + ',' + m[1][2] + ')');
            });
        },
        draw: function (x, options) {
            if (typeof options === "undefined") { options = {
            }; }
            var _this = this;
            if(arguments.length === 0) {
                this.stack.forEach(function (x, i) {
                    if(x.type === 'text') {
                        _this.text(x.object, x.x, x.y, x.options, true);
                    }
                    if(x.type === 'pixel') {
                        _this.pixel(x.object, x.t, x.r, x.b, x.l, x.options, true);
                    } else {
                        _this[x.type](x.object, x.options, true);
                    }
                });
            } else if(x.type === 'circle') {
                this.circle(x, options);
            } else if(x.type === 'line') {
                this.line(x, options);
            } else if(Array.isArray(x)) {
                x.forEach(function (y) {
                    _this[y.type](y, options);
                });
            }
        },
        circle: function (circle, options, redraw) {
            var screen = this.screen, prop, opts, svgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            svgCircle.setAttribute('cx', circle.center[0]);
            svgCircle.setAttribute('cy', circle.center[1]);
            svgCircle.setAttribute('r', circle.radius);
            if(options) {
                svgCircle.setAttribute('stroke-width', (options.lineWidth || 4) / (screen.scale.x - screen.scale.y) + '');
                opts = svg.normalizeOptions(options);
                for(prop in opts) {
                    if(opts.hasOwnProperty(prop)) {
                        svgCircle.setAttribute(prop, opts[prop]);
                    }
                }
            }
            this.ctx.appendChild(svgCircle);
            if(!redraw) {
                this.stack.push({
                    type: 'circle',
                    object: circle,
                    options: options
                });
            }
            return this;
        },
        line: function (line, options, redraw) {
            var screen = this.screen, points = this.screen.getLineEndPoints(line), prop, opts, svgLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            svgLine.setAttribute('x1', points[0][0]);
            svgLine.setAttribute('y1', points[0][1]);
            svgLine.setAttribute('x2', points[1][0]);
            svgLine.setAttribute('y2', points[1][1]);
            if(options) {
                svgLine.setAttribute('stroke-width', (options.lineWidth || 4) / (screen.scale.x - screen.scale.y) + '');
                opts = svg.normalizeOptions(options);
                for(prop in opts) {
                    if(opts.hasOwnProperty(prop)) {
                        svgLine.setAttribute(prop, opts[prop]);
                    }
                }
            }
            this.ctx.appendChild(svgLine);
            if(!redraw) {
                this.stack.push({
                    type: 'line',
                    object: line,
                    options: options
                });
            }
            return this;
        },
        path: function (curve, options, redraw) {
            var screen = this.screen, svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path'), step = 2 / (screen.scale.x - screen.scale.y), pathString, from, to, prop, opts, x, y, i, path;
            from = ('from' in options ? options.from : (-screen.translation.x) / screen.scale.x) - step;
            to = ('to' in options ? options.to : (screen.width - screen.translation.x) / screen.scale.x) + step;
            if(typeof curve === 'function') {
                path = [];
                for(i = from; i <= to; i += step) {
                    path.push([
                        i, 
                        curve(i)
                    ]);
                }
            } else if(typeof curve[0] === 'function') {
                path = [];
                x = curve[0];
                y = curve[1];
                for(i = from; i <= to; i += step) {
                    path.push([
                        x(i), 
                        y(i)
                    ]);
                }
            } else {
                path = curve;
            }
            pathString = 'M' + path.reduce(function (prev, cur) {
                return prev + ' L' + cur.join(' ');
            });
            svgPath.setAttribute('d', pathString);
            svgPath.setAttribute('stroke-width', (options.lineWidth || 4) / (screen.scale.x - screen.scale.y) + '');
            if(options) {
                opts = svg.normalizeOptions(options);
                for(prop in opts) {
                    if(opts.hasOwnProperty(prop)) {
                        svgPath.setAttribute(prop, opts[prop]);
                    }
                }
            }
            this.ctx.appendChild(svgPath);
            if(!redraw) {
                this.stack.push({
                    type: 'path',
                    object: curve,
                    options: options
                });
            }
            return this;
        },
        pixel: function (f, t, r, b, l, options, redraw) {
            if (typeof redraw === "undefined") { redraw = false; }
            var screen = this.screen, top = (-screen.translation.y) / screen.scale.y, bottom = (screen.height - screen.translation.y) / screen.scale.y, left = (-screen.translation.x) / screen.scale.x, right = (screen.width - screen.translation.x) / screen.scale.x, ctx = this.ctx, canvas = document.createElement('canvas'), canvasCtx = canvas.getContext('2d'), svgImage = document.createElementNS('http://www.w3.org/2000/svg', 'image'), svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g'), dataURL, prop, opts, x, y, i, pxl, m = screen.transformation;
            canvas.width = screen.width;
            canvas.height = screen.height;
            canvasCtx.setTransform(m[0][0], m[1][0], m[0][1], m[1][1], m[0][2], m[1][2]);
            svgContainer.setAttribute('transform', 'matrix(' + 1 / m[0][0] + ',0,0,' + 1 / m[1][1] + ',-' + m[0][2] / m[0][0] + ',' + -m[1][2] / m[1][1] + ')');
            svgImage.setAttribute('width', screen.width + 'px');
            svgImage.setAttribute('height', screen.height + 'px');
            svgImage.setAttribute('x', '0');
            svgImage.setAttribute('y', '0');
            t = Math.min(top, t);
            r = Math.min(right, r);
            b = Math.max(bottom, b);
            l = Math.max(left, l);
            var tPxl = Math.floor(-t * screen.scale.y), rPxl = Math.floor(r * screen.scale.x), bPxl = Math.floor(-b * screen.scale.y), lPxl = Math.floor(l * screen.scale.x), w = (rPxl - lPxl), h = (tPxl - bPxl), imgData = canvasCtx.createImageData(w, h);
            for(y = tPxl , i = 0; y > bPxl; y--) {
                for(x = lPxl; x < rPxl; x++ , i++) {
                    pxl = f(x / screen.scale.x, y / screen.scale.y);
                    imgData.data[4 * i] = pxl[0];
                    imgData.data[4 * i + 1] = pxl[1];
                    imgData.data[4 * i + 2] = pxl[2];
                    imgData.data[4 * i + 3] = pxl[3];
                }
            }
            canvasCtx.putImageData(imgData, 0, 0);
            svgImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', canvas.toDataURL());
            svgContainer.appendChild(svgImage);
            this.ctx.appendChild(svgContainer);
            if(!redraw) {
                this.stack.push({
                    type: 'pixel',
                    object: f,
                    t: t,
                    r: r,
                    b: b,
                    l: l,
                    options: options
                });
            }
            return this;
        },
        text: function (str, x, y, options, redraw) {
            var screen = this.screen, svgText = document.createElementNS('http://www.w3.org/2000/svg', 'text'), ctx = this.ctx, prop, opts;
            svgText.textContent = str;
            svgText.setAttribute('x', x * screen.scale.x + '');
            svgText.setAttribute('y', y * screen.scale.y + '');
            svgText.setAttribute('transform', 'matrix(' + 1 / screen.scale.x + ' , 0, 0, ' + 1 / screen.scale.y + ', 0, 0)');
            svgText.setAttribute('fill', colorConvert(options.color) || '#000000');
            svgText.setAttribute('fill-opacity', '1');
            svgText.setAttribute('stroke', colorConvert(options.color) || '#000000');
            svgText.setAttribute('text-anchor', 'middle');
            svgText.setAttribute('alignment-baseline', 'middle');
            this.ctx.appendChild(svgText);
            if(!redraw) {
                this.stack.push({
                    type: 'text',
                    object: str,
                    x: x,
                    y: y,
                    options: options
                });
            }
            return this;
        }
    };
    var Screen2D = (function (_super) {
        __extends(Screen2D, _super);
        function Screen2D(id, options) {
            var _this = this;
                _super.call(this, id, options);
            var defaults = {
                axis: {
                    color: 0x000000,
                    textColor: 0x000000,
                    tick: {
                        x: 1,
                        y: 1
                    }
                },
                grid: {
                    angle: Math.PI / 8,
                    color: 0xcccccc,
                    type: 'cartesian',
                    tick: {
                        x: 1,
                        y: 1,
                        r: 1
                    }
                },
                interaction: {
                    allowPan: true,
                    allowZoom: true,
                    zoomSpeed: 1
                },
                background: 0xffffff,
                lookAt: {
                    x: 0,
                    y: 0
                },
                range: {
                    x: 1,
                    y: 1
                },
                figcaption: '',
                renderer: 'Canvas',
                transformation: new MathLib.Matrix([
                    [
                        Math.min(this.height, this.width) / 2, 
                        0, 
                        this.width / 2
                    ], 
                    [
                        0, 
                        -Math.min(this.height, this.width) / 2, 
                        this.height / 2
                    ], 
                    [
                        0, 
                        0, 
                        1
                    ]
                ])
            }, opts = extendObject(defaults, options), element, transformation = opts.transformation, _this = this;
            this.background = opts.background;
            this.renderer = opts.renderer;
            this.interaction = opts.interaction;
            this.axis = opts.axis;
            this.grid = opts.grid;
            this.applyTransformation = function () {
            };
            this.translation = {
            };
            this.scale = {
            };
            this.transformation = transformation;
            Object.defineProperty(this.translation, 'x', {
                get: function () {
                    return _this.transformation[0][2];
                },
                set: function (x) {
                    _this.transformation[0][2] = x;
                    _this.applyTransformation();
                }
            });
            Object.defineProperty(this.translation, 'y', {
                get: function () {
                    return _this.transformation[1][2];
                },
                set: function (y) {
                    _this.transformation[1][2] = y;
                    _this.applyTransformation();
                }
            });
            Object.defineProperty(this.scale, 'x', {
                get: function () {
                    return _this.transformation[0][0];
                },
                set: function (x) {
                    _this.transformation[0][0] = x;
                    _this.applyTransformation();
                }
            });
            Object.defineProperty(this.scale, 'y', {
                get: function () {
                    return _this.transformation[1][1];
                },
                set: function (y) {
                    _this.transformation[1][1] = y;
                    _this.applyTransformation();
                }
            });
            this.lookAt = {
            };
            this.range = {
            };
            Object.defineProperty(this.lookAt, 'x', {
                get: function () {
                    return (_this.width / 2 - _this.transformation[0][2]) / _this.transformation[0][0];
                },
                set: function (x) {
                    _this.transformation[0][2] = _this.width / 2 - x * _this.transformation[0][0];
                    _this.applyTransformation();
                }
            });
            Object.defineProperty(this.lookAt, 'y', {
                get: function () {
                    return (_this.height / 2 - _this.transformation[1][2]) / _this.transformation[1][1];
                },
                set: function (y) {
                    _this.transformation[1][2] = _this.height / 2 - y * _this.transformation[1][1];
                    _this.applyTransformation();
                }
            });
            Object.defineProperty(this.range, 'x', {
                get: function () {
                    return _this.width / (2 * _this.transformation[0][0]);
                },
                set: function (x) {
                    _this.transformation[0][0] = 0.5 * _this.width / x;
                    _this.applyTransformation();
                }
            });
            Object.defineProperty(this.range, 'y', {
                get: function () {
                    return -_this.height / (2 * _this.transformation[1][1]);
                },
                set: function (y) {
                    _this.transformation[1][1] = -0.5 * _this.height / y;
                    _this.applyTransformation();
                }
            });
            this.range.x = opts.range.x;
            this.range.y = opts.range.y;
            this.lookAt.x = opts.lookAt.x;
            this.lookAt.y = opts.lookAt.y;
            if(opts.renderer === 'SVG') {
                element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                element.classList.add('MathLib_screen_' + this.uuid);
                element.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                element.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
                element.setAttribute('height', this.height + 'px');
                element.setAttribute('width', this.width + 'px');
                element.setAttribute('version', '1.1');
                element.setAttribute('stroke', '#000000');
                element.setAttribute('stroke-opacity', '1');
                element.setAttribute('fill', '#ffffff');
                element.setAttribute('fill-opacity', '0');
                this.element = element;
                this.wrapper.appendChild(element);
                if('background' in options) {
                    var background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    background.setAttribute('x', '0px');
                    background.setAttribute('y', '0px');
                    background.setAttribute('width', this.width + 'px');
                    background.setAttribute('height', this.height + 'px');
                    background.setAttribute('fill', colorConvert(options.background));
                    background.setAttribute('fill-opacity', '1');
                    this.element.appendChild(background);
                }
            }
            this.layer = [];
            this.layer.back = new MathLib.Layer(this, 'back', 0);
            this.layer.grid = new MathLib.Layer(this, 'grid', 1);
            this.layer.axis = new MathLib.Layer(this, 'axis', 2);
            this.layer.main = new MathLib.Layer(this, 'main', 3);
            if(opts.renderer === 'Canvas') {
                this.layer.main.element.onmouseup = function (evt) {
                    return _this.onmouseup(evt);
                };
                this.layer.main.element.onmousedown = function (evt) {
                    return _this.onmousedown(evt);
                };
                this.layer.main.element.onmousemove = function (evt) {
                    return _this.onmousemove(evt);
                };
                this.layer.main.element.onmousewheel = function (evt) {
                    return _this.onmousewheel(evt);
                };
                this.layer.main.element.DOMMouseScroll = function (evt) {
                    return _this.onmousewheel(evt);
                };
            } else if(opts.renderer === 'SVG') {
                this.wrapper.onmouseup = function (evt) {
                    return _this.onmouseup(evt);
                };
                this.wrapper.onmousedown = function (evt) {
                    return _this.onmousedown(evt);
                };
                this.wrapper.onmousemove = function (evt) {
                    return _this.onmousemove(evt);
                };
                this.wrapper.onmousewheel = function (evt) {
                    return _this.onmousewheel(evt);
                };
                this.wrapper.DOMMouseScroll = function (evt) {
                    return _this.onmousewheel(evt);
                };
            }
            if(opts.renderer === 'Canvas') {
                this.applyTransformation = canvas.applyTransformation;
                this.draw = function (x, options) {
                    if (typeof options === "undefined") { options = {
                    }; }
                    var _this = this;
                    if(arguments.length === 0) {
                        var top = (-this.translation.y) / this.scale.y, bottom = (this.height - this.translation.y) / this.scale.y, left = (-this.translation.x) / this.scale.x, right = (this.width - this.translation.x) / this.scale.x;
                        this.layer.forEach(function (l) {
                            l.ctx.clearRect(left, top, right - left, bottom - top);
                        });
                        _this.layer.forEach(function (x) {
                            x.draw();
                        });
                    } else if(x.type === 'circle') {
                        this.circle(x, options);
                    } else if(x.type === 'line') {
                        this.line(x, options);
                    } else if(Array.isArray(x)) {
                        x.forEach(function (y) {
                            _this[y.type](y, options);
                        });
                    }
                };
                this.circle = function () {
                    canvas.circle.apply(_this.layer.main, arguments);
                };
                this.line = function () {
                    canvas.line.apply(_this.layer.main, arguments);
                };
                this.path = function () {
                    canvas.path.apply(_this.layer.main, arguments);
                };
                this.pixel = function () {
                    canvas.pixel.apply(_this.layer.main, arguments);
                };
                this.text = function () {
                    canvas.text.apply(_this.layer.main, arguments);
                };
            } else if(opts.renderer === 'SVG') {
                this.applyTransformation = svg.applyTransformation;
                this.draw = function (x, options) {
                    if (typeof options === "undefined") { options = {
                    }; }
                    var _this = this;
                    if(arguments.length === 0) {
                        this.layer.forEach(function (l) {
                            l.ctx.textContent = '';
                        });
                        _this.layer.forEach(function (x) {
                            x.draw();
                        });
                    } else if(x.type === 'circle') {
                        this.circle(x, options);
                    } else if(x.type === 'line') {
                        this.line(x, options);
                    } else if(Array.isArray(x)) {
                        x.forEach(function (y) {
                            _this[y.type](y, options);
                        });
                    }
                };
                this.circle = function () {
                    svg.circle.apply(_this.layer.main, arguments);
                };
                this.line = function () {
                    svg.line.apply(_this.layer.main, arguments);
                };
                this.path = function () {
                    svg.path.apply(_this.layer.main, arguments);
                };
                this.pixel = function () {
                    svg.pixel.apply(_this.layer.main, arguments);
                };
                this.text = function () {
                    svg.text.apply(_this.layer.main, arguments);
                };
            }
            this.draw();
        }
        Screen2D.prototype.getEventPoint = function (evt) {
            var x, y;
            if(evt.offsetX) {
                x = evt.offsetX;
                y = evt.offsetY;
            } else {
                x = evt.layerX;
                y = evt.layerY;
            }
            return new MathLib.Point([
                x, 
                y, 
                1
            ]);
        };
        Screen2D.prototype.getLineEndPoints = function (l) {
            if(l.type === 'line') {
                var top = (-this.translation.y) / this.scale.y, bottom = (this.height - this.translation.y) / this.scale.y, left = (-this.translation.x) / this.scale.x, right = (this.width - this.translation.x) / this.scale.x, lineRight = -(l[2] + l[0] * right) / l[1], lineTop = -(l[2] + l[1] * top) / l[0], lineLeft = -(l[2] + l[0] * left) / l[1], lineBottom = -(l[2] + l[1] * bottom) / l[0], res = [];
                if(lineRight < top && lineRight > bottom) {
                    res.push([
                        right, 
                        lineRight
                    ]);
                }
                if(lineLeft < top && lineLeft > bottom) {
                    res.push([
                        left, 
                        lineLeft
                    ]);
                }
                if(lineTop < right && lineTop > left) {
                    res.push([
                        lineTop, 
                        top
                    ]);
                }
                if(lineBottom < right && lineBottom > left) {
                    res.push([
                        lineBottom, 
                        bottom
                    ]);
                }
                return res;
            } else {
                return l;
            }
        };
        Screen2D.prototype.onmousedown = function (evt) {
            if(evt.button !== 0) {
                return;
            }
            if(evt.preventDefault) {
                evt.preventDefault();
            }
            evt.returnValue = false;
            if(this.interaction.allowPan) {
                this.interaction.type = 'pan';
                this.interaction.startPoint = this.getEventPoint(evt);
                this.interaction.startTransformation = this.transformation.copy();
            }
        };
        Screen2D.prototype.onmousemove = function (evt) {
            var p;
            if(evt.preventDefault) {
                evt.preventDefault();
            }
            evt.returnValue = false;
            if(this.interaction.type === 'pan') {
                p = this.getEventPoint(evt).minus(this.interaction.startPoint);
                this.translation.x = this.interaction.startTransformation[0][2] + p[0];
                this.translation.y = this.interaction.startTransformation[1][2] + p[1];
                this.draw();
            }
        };
        Screen2D.prototype.onmouseup = function (evt) {
            if(evt.preventDefault) {
                evt.preventDefault();
            }
            evt.returnValue = false;
            if(this.interaction.type === 'pan') {
                delete this.interaction.type;
                delete this.interaction.startPoint;
                delete this.interaction.startTransformation;
            }
        };
        Screen2D.prototype.onmousewheel = function (evt) {
            var delta, s, p, z;
            if(this.interaction.allowZoom) {
                if(evt.preventDefault) {
                    evt.preventDefault();
                }
                evt.returnValue = false;
                if(evt.wheelDelta) {
                    delta = evt.wheelDelta / 360;
                } else {
                    delta = evt.detail / -9;
                }
                z = Math.pow(1 + this.interaction.zoomSpeed, delta);
                p = this.transformation.inverse().times(this.getEventPoint(evt));
                s = new MathLib.Matrix([
                    [
                        z, 
                        0, 
                        p[0] - p[0] * z
                    ], 
                    [
                        0, 
                        z, 
                        p[1] - p[1] * z
                    ], 
                    [
                        0, 
                        0, 
                        1
                    ]
                ]);
                this.transformation = this.transformation.times(s);
                this.applyTransformation();
                this.draw();
            }
        };
        return Screen2D;
    })(Screen);
    MathLib.Screen2D = Screen2D;    
    var Screen3D = (function (_super) {
        __extends(Screen3D, _super);
        function Screen3D(id, options) {
                _super.call(this, id, options);
            var defaults = {
                anaglyphMode: false,
                axis: true,
                background: 0xffffff,
                camera: {
                    lookAt: [
                        0, 
                        0, 
                        0
                    ],
                    position: [
                        10, 
                        10, 
                        10
                    ]
                },
                controls: 'Trackball',
                height: 500,
                renderer: 'WebGL',
                width: 500
            }, opts = extendObject(defaults, options), scene = new THREE.Scene(), camera, renderer, controls, clock = new THREE.Clock();
            var viewAngle = 45, aspect = opts.width / opts.height, near = 0.1, far = 20000;
            camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
            camera.position = to3js(opts.camera.position);
            camera.lookAt(to3js(opts.camera.lookAt));
            camera.up = new THREE.Vector3(0, 0, 1);
            scene.add(camera);
            renderer = new THREE[opts.renderer + 'Renderer']({
                antialias: true,
                preserveDrawingBuffer: true
            });
            this.wrapper.appendChild(renderer.domElement);
            var origRenderer = renderer;
            if(opts.anaglyphMode) {
                renderer = new THREE.AnaglyphEffect(renderer);
            }
            renderer.setSize(opts.width, opts.height);
            if(opts.controls) {
                controls = new THREE[opts.controls + 'Controls'](camera, renderer.domElement);
            } else {
                controls = {
                    update: function () {
                    }
                };
            }
            var light1 = new THREE.PointLight(0xffffff);
            light1.position.set(0, 0, 200);
            scene.add(light1);
            var light2 = new THREE.PointLight(0xffffff);
            light2.position.set(0, 0, -200);
            scene.add(light2);
            renderer.setClearColorHex(opts.background, 1);
            renderer.clear();
            if(opts.axis) {
                var axis = new THREE.AxisHelper();
                scene.add(axis);
            }
function animate() {
                requestAnimationFrame(animate);
                render();
                update();
            }
function update() {
                var delta = clock.getDelta();
                controls.update();
            }
function render() {
                renderer.render(scene, camera);
            }
            animate();
            this.scene = scene;
        }
        Screen3D.prototype.parametricPlot3D = function (f, options) {
            var defaults = {
                closed: false,
                debug: false,
                min: 0,
                max: 1,
                pointNum: 1000,
                radius: 0.05,
                segmentsRadius: 6,
                material: {
                    type: 'MeshLambert'
                }
            }, opts = extendObject(defaults, options), curve = THREE.Curve.create(function () {
            }, function (t) {
                t = (opts.max - opts.min) * t + opts.min;
                var res = f(t);
                return new THREE.Vector3(res[0], res[1], res[2]);
            }), mesh = new THREE.Mesh(new THREE.TubeGeometry(new curve(), opts.pointNum, opts.radius, opts.segmentsRadius, opts.closed, opts.debug), new THREE[opts.material.type + 'Material'](opts.material));
            this.scene.add(mesh);
            return this;
        };
        Screen3D.prototype.plot3D = function (f, options) {
            return this.surfacePlot3D(function (u, v) {
                return [
                    u, 
                    v, 
                    f(u, v)
                ];
            }, options);
        };
        Screen3D.prototype.surfacePlot3D = function (f, options) {
            var defaults = {
                material: {
                    type: 'MeshLambert'
                },
                pointNumX: 100,
                pointNumY: 100,
                xmin: 0,
                xmax: 1,
                ymin: 0,
                ymax: 1
            }, opts = extendObject(defaults, options), map = function (u, v) {
                u = (opts.xmax - opts.xmin) * u + opts.xmin;
                v = (opts.ymax - opts.ymin) * v + opts.ymin;
                var res = f(u, v);
                return new THREE.Vector3(res[0], res[1], res[2]);
            }, mesh = new THREE.Mesh(new THREE.ParametricGeometry(map, opts.pointNumX, opts.pointNumY, false), new THREE[opts.material.type + 'Material'](opts.material));
            mesh.doubleSided = true;
            this.scene.add(mesh);
            return this;
        };
        return Screen3D;
    })(Screen);
    MathLib.Screen3D = Screen3D;    
    var Vector = (function () {
        function Vector(coords) {
            var _this = this;
            this.type = 'vector';
            coords.forEach(function (x, i) {
                _this[i] = x;
            });
            this.length = coords.length;
        }
        Vector.areLinearIndependent = function (v) {
            var n = v.length, m = v[0].length;
            if(n > m) {
                return false;
            }
            if(!v.every(function (x) {
                return x.length == m;
            })) {
                return undefined;
            }
            return (new MathLib.Matrix(v)).rank() === n;
        };
        Vector.prototype.every = function (f) {
            return Array.prototype.every.call(this, f);
        };
        Vector.prototype.forEach = function (f) {
            Array.prototype.forEach.call(this, f);
        };
        Vector.prototype.isEqual = function (v) {
            if(this.length !== v.length) {
                return false;
            }
            return this.every(function (x, i) {
                return MathLib.isEqual(x, v[i]);
            });
        };
        Vector.prototype.isZero = function () {
            return this.every(MathLib.isZero);
        };
        Vector.prototype.map = function (f) {
            return new this['constructor'](Array.prototype.map.call(this, f));
        };
        Vector.prototype.minus = function (v) {
            if(this.length === v.length) {
                return this.plus(v.negative());
            }
        };
        Vector.prototype.negative = function () {
            return this.map(MathLib.negative);
        };
        Vector.prototype.norm = function (p) {
            if (typeof p === "undefined") { p = 2; }
            if(p === 2) {
                return MathLib.hypot.apply(null, this.toArray());
            } else if(p === Infinity) {
                return Math.max.apply(null, this.map(Math.abs).toArray());
            } else {
                return MathLib.root(this.reduce(function (prev, curr) {
                    return prev + Math.pow(Math.abs(curr), p);
                }, 0), p);
            }
        };
        Vector.prototype.outerProduct = function (v) {
            return new MathLib.Matrix(this.map(function (x) {
                return v.map(function (y) {
                    return MathLib.times(x, y);
                });
            }));
        };
        Vector.prototype.plus = function (v) {
            if(this.length === v.length) {
                return new MathLib.Vector(this.map(function (x, i) {
                    return MathLib.plus(x, v[i]);
                }));
            }
        };
        Vector.prototype.reduce = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return Array.prototype.reduce.apply(this, args);
        };
        Vector.prototype.scalarProduct = function (v) {
            if(this.length === v.length) {
                return this.reduce(function (old, cur, i, w) {
                    return MathLib.plus(old, MathLib.times(w[i], v[i]));
                }, 0);
            }
        };
        Vector.prototype.slice = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return Array.prototype.slice.apply(this, args);
        };
        Vector.prototype.times = function (n) {
            var res = [], i, ii;
            if(n.type === 'rational') {
                n = n.toNumber();
            }
            if(typeof n === "number" || n.type === "complex") {
                return this.map(function (x) {
                    return MathLib.times(n, x);
                });
            }
            if(n.type === "matrix") {
                res = n.toColVectors();
                for(i = 0 , ii = res.length; i < ii; i++) {
                    res[i] = this.scalarProduct(res[i]);
                }
                return new MathLib.Vector(res);
            }
        };
        Vector.prototype.toArray = function () {
            return Array.prototype.slice.call(this);
        };
        Vector.prototype.toContentMathMLString = function () {
            return this.reduce(function (old, cur) {
                return old + MathLib.toContentMathMLString(cur);
            }, '<vector>') + '</vector>';
        };
        Vector.prototype.toLaTeX = function () {
            return '\\begin{pmatrix}\n\t' + this.reduce(function (old, cur) {
                return old + '\\\\\n\t' + MathLib.toLaTeX(cur);
            }) + '\n\\end{pmatrix}';
        };
        Vector.prototype.toMathMLString = function () {
            return this.reduce(function (old, cur) {
                return old + '<mtr><mtd>' + MathLib.toMathMLString(cur) + '</mtd></mtr>';
            }, '<mrow><mo>(</mo><mtable>') + '</mtable><mo>)</mo></mrow>';
        };
        Vector.prototype.toString = function () {
            return '(' + this.reduce(function (old, cur) {
                return old + ', ' + MathLib.toString(cur);
            }) + ')';
        };
        Vector.prototype.vectorProduct = function (v) {
            if(this.length === 3 && v.length === 3) {
                return new MathLib.Vector([
                    MathLib.minus(MathLib.times(this[1], v[2]), MathLib.times(this[2], v[1])), 
                    MathLib.minus(MathLib.times(this[2], v[0]), MathLib.times(this[0], v[2])), 
                    MathLib.minus(MathLib.times(this[0], v[1]), MathLib.times(this[1], v[0]))
                ]);
            }
        };
        Vector.zero = function (n) {
            var res = [], i;
            for(i = 0; i < n; i++) {
                res.push(0);
            }
            return new MathLib.Vector(res);
        };
        return Vector;
    })();
    MathLib.Vector = Vector;    
    var Circle = (function () {
        function Circle(center, radius) {
            this.type = 'circle';
            if(center.type === undefined) {
                center = new MathLib.Point(center.concat(1));
            }
            this.center = center;
            this.radius = radius;
        }
        Circle.prototype.area = function () {
            return this.radius * this.radius * Math.PI;
        };
        Circle.prototype.circumference = function () {
            return 2 * this.radius * Math.PI;
        };
        Circle.prototype.draw = function (screen, options) {
            if(Array.isArray(screen)) {
                var circle = this;
                screen.forEach(function (x) {
                    x.circle(circle, options);
                });
            } else {
                screen.circle(this, options);
            }
            return this;
        };
        Circle.prototype.isEqual = function (c) {
            return MathLib.isEqual(this.radius, c.radius) && this.center.isEqual(c.center);
        };
        Circle.prototype.positionOf = function (p) {
            var diff;
            if(p.type === 'point' && p.dim === 2) {
                diff = p.distanceTo(this.center) - this.radius;
                if(MathLib.isZero(diff)) {
                    return 'on';
                } else if(diff < 0) {
                    return 'in';
                } else {
                    return 'out';
                }
            }
        };
        Circle.prototype.reflectAt = function (a) {
            return new MathLib.Circle(this.center.reflectAt(a), this.radius);
        };
        Circle.prototype.toLaTeX = function () {
            return 'B_{' + MathLib.toLaTeX(this.radius) + '}\\left(' + this.center.toLaTeX() + '\\right)';
        };
        Circle.prototype.toMatrix = function () {
            var x = this.center[0] / this.center[2], y = this.center[1] / this.center[2], r = this.radius;
            return new MathLib.Matrix([
                [
                    1, 
                    0, 
                    -x
                ], 
                [
                    0, 
                    1, 
                    -y
                ], 
                [
                    -x, 
                    -y, 
                    x * x + y * y - r * r
                ]
            ]);
        };
        return Circle;
    })();
    MathLib.Circle = Circle;    
    var Complex = (function () {
        function Complex(re, im) {
            this.type = 'complex';
            this.re = re;
            this.im = im;
        }
        Complex.prototype.abs = function () {
            return MathLib.hypot(this.re, this.im);
        };
        Complex.prototype.arccos = function () {
            return MathLib.minus(Math.PI / 2, this.arcsin());
        };
        Complex.prototype.arccot = function () {
            return MathLib.minus(Math.PI / 2, this.arctan());
        };
        Complex.prototype.arccsc = function () {
            return MathLib.times(new MathLib.Complex(0, 1), MathLib.ln(MathLib.plus(MathLib.sqrt(MathLib.minus(1, MathLib.divide(1, MathLib.times(this, this)))), MathLib.divide(new MathLib.Complex(0, 1), this))));
        };
        Complex.prototype.arcsin = function () {
            var a = this.re, b = this.im;
            return new MathLib.Complex(MathLib.sign(a) / 2 * MathLib.arccos(Math.sqrt(Math.pow(a * a + b * b - 1, 2) + 4 * b * b) - (a * a + b * b)), MathLib.sign(b) / 2 * MathLib.arcosh(Math.sqrt(Math.pow(a * a + b * b - 1, 2) + 4 * b * b) + (a * a + b * b)));
        };
        Complex.prototype.arctan = function () {
            var iz = new MathLib.Complex(-this.im, this.re);
            return MathLib.times(new MathLib.Complex(0, 0.5), MathLib.ln(MathLib.divide(MathLib.plus(1, iz), MathLib.minus(1, iz))));
        };
        Complex.prototype.arg = function () {
            return Math.atan2(this.im, this.re);
        };
        Complex.prototype.artanh = function () {
            return MathLib.times(0.5, MathLib.minus(MathLib.ln(MathLib.plus(1, this)), MathLib.ln(MathLib.minus(1, this))));
        };
        Complex.prototype.compare = function (x) {
            var a = MathLib.sign(this.abs() - x.abs());
            return a ? a : MathLib.sign(this.arg() - x.arg());
        };
        Complex.prototype.conjugate = function () {
            return new MathLib.Complex(this.re, MathLib.negative(this.im));
        };
        Complex.prototype.copy = function () {
            return new MathLib.Complex(MathLib.copy(this.re), MathLib.copy(this.im));
        };
        Complex.prototype.cos = function () {
            return new MathLib.Complex(MathLib.cos(this.re) * MathLib.cosh(this.im), -MathLib.sin(this.re) * MathLib.sinh(this.im));
        };
        Complex.prototype.cosh = function () {
            return new MathLib.Complex(MathLib.cos(this.im) * MathLib.cosh(this.re), MathLib.sin(this.im) * MathLib.sinh(this.re));
        };
        Complex.prototype.divide = function (c) {
            return this.times(MathLib.inverse(c));
        };
        Complex.prototype.exp = function () {
            return new MathLib.Complex(MathLib.exp(this.re) * MathLib.cos(this.im), MathLib.exp(this.re) * MathLib.sin(this.im));
        };
        Complex.prototype.inverse = function () {
            return new MathLib.Complex(MathLib.divide(this.re, MathLib.plus(MathLib.pow(this.re, 2), MathLib.pow(this.im, 2))), MathLib.divide(MathLib.negative(this.im), MathLib.plus(MathLib.pow(this.re, 2), MathLib.pow(this.im, 2))));
        };
        Complex.prototype.isEqual = function (n) {
            if(typeof n === 'number') {
                return MathLib.isEqual(this.re, n) && MathLib.isZero(this.im);
            }
            if(n.type === 'complex') {
                return MathLib.isEqual(this.re, n.re) && MathLib.isEqual(this.im, n.im);
            }
            return false;
        };
        Complex.prototype.isFinite = function () {
            return MathLib.isFinite(this.re) && MathLib.isFinite(this.im);
        };
        Complex.prototype.isOne = function () {
            return MathLib.isOne(this.re) && MathLib.isZero(this.im);
        };
        Complex.prototype.isReal = function () {
            return MathLib.isZero(this.im);
        };
        Complex.prototype.isZero = function () {
            return MathLib.isZero(this.re) && MathLib.isZero(this.im);
        };
        Complex.prototype.ln = function () {
            return new MathLib.Complex(MathLib.ln(this.abs()), this.arg());
        };
        Complex.prototype.minus = function (c) {
            return this.plus(MathLib.negative(c));
        };
        Complex.prototype.mod = function (m) {
            return new MathLib.Complex(MathLib.mod(this.re, m), MathLib.mod(this.im, m));
        };
        Complex.prototype.negative = function () {
            return new MathLib.Complex(MathLib.negative(this.re), MathLib.negative(this.im));
        };
        Complex.one = new Complex(1, 0);
        Complex.prototype.plus = function (c) {
            if(c.type === 'complex') {
                return new MathLib.Complex(MathLib.plus(this.re, c.re), MathLib.plus(this.im, c.im));
            } else if(c.type === 'rational') {
                c = c.toNumber();
            }
            if(typeof c === 'number') {
                return new MathLib.Complex(MathLib.plus(this.re, c), this.im);
            }
        };
        Complex.polar = function (abs, arg) {
            return new MathLib.Complex(abs * Math.cos(arg), abs * Math.sin(arg));
        };
        Complex.prototype.pow = function (n) {
            return new MathLib.Complex(Math.pow(this.abs(), n), n * this.arg());
        };
        Complex.prototype.sign = function () {
            return MathLib.Complex.polar(1, this.arg());
        };
        Complex.prototype.sin = function () {
            return new MathLib.Complex(MathLib.sin(this.re) * MathLib.cosh(this.im), MathLib.cos(this.re) * MathLib.sinh(this.im));
        };
        Complex.prototype.sinh = function () {
            return new MathLib.Complex(MathLib.cos(this.im) * MathLib.sinh(this.re), MathLib.sin(this.im) * MathLib.cosh(this.re));
        };
        Complex.prototype.times = function (c) {
            if(c.type === 'complex') {
                return new MathLib.Complex(MathLib.minus(MathLib.times(this.re, c.re), MathLib.times(this.im, c.im)), MathLib.plus(MathLib.times(this.re, c.im), MathLib.times(this.im, c.re)));
            } else if(c.type === 'rational') {
                c = c.toNumber();
            }
            if(typeof c === 'number') {
                return new MathLib.Complex(MathLib.times(this.re, c), MathLib.times(this.im, c));
            }
        };
        Complex.prototype.toContentMathMLString = function () {
            return '<cn type="complex-cartesian">' + this.re + '<sep/>' + this.im + '</cn>';
        };
        Complex.prototype.toLaTeX = function () {
            var str = '', reFlag = false;
            if(!MathLib.isZero(this.re)) {
                str = MathLib.toLaTeX(this.re);
                reFlag = true;
            }
            if(!MathLib.isZero(this.im)) {
                str += MathLib.toLaTeX(this.im, reFlag) + 'i';
            }
            if(str.length === 0) {
                str = '0';
            }
            return str;
        };
        Complex.prototype.toMathMLString = function () {
            var str = '', reFlag = false;
            if(!MathLib.isZero(this.re)) {
                str = MathLib.toMathMLString(this.re);
                reFlag = true;
            }
            if(!MathLib.isZero(this.im)) {
                str += MathLib.toMathMLString(this.im, reFlag) + '<mo>&#x2062;</mo><mi>i</mi>';
            }
            if(str.length === 0) {
                str = '<mn>0</mn>';
            }
            return str;
        };
        Complex.prototype.toMatrix = function () {
            return new MathLib.Matrix([
                [
                    this.re, 
                    MathLib.negative(this.im)
                ], 
                [
                    this.im, 
                    this.re
                ]
            ]);
        };
        Complex.prototype.toPoint = function () {
            return new MathLib.Point(this.re, this.im);
        };
        Complex.prototype.toString = function () {
            var str = '';
            if(!MathLib.isZero(this.re)) {
                str = MathLib.toString(this.re);
            }
            if(!MathLib.isZero(this.im)) {
                str += (this.im > 0 ? (str.length ? '+' : '') : '-') + MathLib.toString(Math.abs(this.im)) + 'i';
            }
            if(str.length === 0) {
                str = '0';
            }
            return str;
        };
        Complex.zero = new Complex(0, 0);
        return Complex;
    })();
    MathLib.Complex = Complex;    
    var Line = (function (_super) {
        __extends(Line, _super);
        function Line(coords) {
                _super.call(this, coords);
            this.type = 'line';
            this.dim = 2;
        }
        Line.prototype.draw = function (screen, options) {
            if(Array.isArray(screen)) {
                var line = this;
                screen.forEach(function (x) {
                    x.line(line, options);
                });
            } else {
                screen.line(this, options);
            }
            return this;
        };
        Line.prototype.isEqual = function (q) {
            var p = this.normalize();
            q = q.normalize();
            if(this.length !== q.length) {
                return false;
            }
            return p.every(function (x, i) {
                return MathLib.isEqual(x, q[i]);
            });
        };
        Line.prototype.isFinite = function () {
            return !MathLib.isZero(this[this.length - 1]);
        };
        Line.prototype.isOrthogonalTo = function (l) {
            return MathLib.isEqual(new MathLib.Point([
                0, 
                0, 
                1
            ]).crossRatio(this.meet(new MathLib.Line([
                0, 
                0, 
                1
            ])), l.meet(new MathLib.Line([
                0, 
                0, 
                1
            ])), MathLib.Point.I, MathLib.Point.J), -1);
        };
        Line.prototype.isParallelTo = function (l) {
            return this.every(function (x, i) {
                return MathLib.isEqual(x, l[i]) || i === l.length - 1;
            });
        };
        Line.prototype.meet = function (l) {
            return new MathLib.Point([
                this[1] * l[2] - this[2] * l[1], 
                l[0] * this[2] - this[0] * l[2], 
                this[0] * l[1] - this[1] * l[0]
            ]);
        };
        Line.prototype.normalize = function () {
            var last = this[this.dim];
            return this.map(function (x) {
                return x / last;
            });
        };
        return Line;
    })(Vector);
    MathLib.Line = Line;    
    var Matrix = (function () {
        function Matrix(matrix) {
            var _this = this;
            this.type = 'matrix';
            if(typeof matrix === 'string') {
                if(matrix.indexOf('<') > -1) {
                    return new MathLib.MathML(matrix).parse();
                } else {
                    matrix = matrix.trim().replace(/;?\n/g, '],[');
                    matrix = JSON.parse('[[' + matrix + ']]');
                }
            }
            matrix.forEach(function (x, i) {
                _this[i] = x;
            });
            this.length = matrix.length;
            this.cols = matrix[0].length;
            this.rows = matrix.length;
        }
        Matrix.prototype.LU = function (dontSwapPivot) {
            var i, j, k, t, p, LU = this.toArray(), m = this.rows, n = this.cols, permutation = [];
            for(k = 0; k < n; k++) {
                if(!dontSwapPivot) {
                    p = k;
                    for(i = k + 1; i < m; i++) {
                        if(Math.abs(LU[i][k]) > Math.abs(LU[p][k])) {
                            p = i;
                        }
                    }
                    if(p !== k) {
                        permutation.unshift([
                            p, 
                            k
                        ]);
                        t = LU[p];
                        LU[p] = LU[k];
                        LU[k] = t;
                    }
                }
                if(LU[k][k] !== 0) {
                    for(i = k + 1; i < m; i++) {
                        LU[i][k] = MathLib.divide(LU[i][k], LU[k][k]);
                        for(j = k + 1; j < n; j++) {
                            LU[i][j] = MathLib.minus(LU[i][j], MathLib.times(LU[i][k], LU[k][j]));
                        }
                    }
                }
            }
            LU = new MathLib.Matrix(LU);
            this.LU = function () {
                return LU;
            };
            this.LUpermutation = new MathLib.Permutation(permutation);
            return LU;
        };
        Matrix.prototype.adjoint = function () {
            return this.map(MathLib.conjugate).transpose();
        };
        Matrix.prototype.adjugate = function () {
            return this.map(function (x, r, c, m) {
                return MathLib.times(m.remove(c, r).determinant(), 1 - ((r + c) % 2) * 2);
            });
        };
        Matrix.prototype.cholesky = function () {
            var r, rr, temp = [], k, kk, sum, c, cholesky;
            for(r = 0 , rr = this.rows; r < rr; r++) {
                temp.push([]);
            }
            for(r = 0 , rr = this.rows; r < rr; r++) {
                for(c = 0; c < r; c++) {
                    sum = 0;
                    for(k = 0 , kk = c; k < kk; k++) {
                        sum = MathLib.plus(sum, MathLib.times(temp[r][k], temp[c][k]));
                    }
                    temp[r][c] = (this[r][c] - sum) / temp[c][c];
                }
                sum = 0;
                for(k = 0 , kk = c; k < kk; k++) {
                    sum = MathLib.plus(sum, MathLib.times(temp[r][k], temp[r][k]));
                }
                temp[r][c] = Math.sqrt(this[c][c] - sum);
                for(c++; c < this.cols; c++) {
                    temp[r][c] = 0;
                }
            }
            cholesky = new MathLib.Matrix(temp);
            this.cholesky = function () {
                return cholesky;
            };
            return cholesky;
        };
        Matrix.prototype.copy = function () {
            return this.map(MathLib.copy);
        };
        Matrix.prototype.determinant = function () {
            if(this.isSquare()) {
                var arr, determinant;
                if(this.rank() < this.rows) {
                    determinant = 0;
                } else {
                    arr = this.LU();
                    determinant = MathLib.times(this.LUpermutation.sgn(), MathLib.times.apply(null, arr.diag()));
                }
                this.determinant = function () {
                    return determinant;
                };
                return determinant;
            }
        };
        Matrix.prototype.diag = function () {
            var arr = [], i, ii;
            for(i = 0 , ii = Math.min(this.rows, this.cols); i < ii; i++) {
                arr.push(this[i][i]);
            }
            return arr;
        };
        Matrix.prototype.divide = function (n) {
            return this.times(MathLib.inverse(n));
        };
        Matrix.prototype.every = function (f) {
            return Array.prototype.every.call(this, function (x, i) {
                return Array.prototype.every.call(x, function (y, j) {
                    return f(y, i, j, this);
                });
            });
        };
        Matrix.prototype.forEach = function (f) {
            Array.prototype.forEach.call(this, function (x, i) {
                return Array.prototype.forEach.call(x, function (y, j) {
                    return f(y, i, j, this);
                });
            });
        };
        Matrix.prototype.gershgorin = function () {
            var c = [], rc = [], rr = [], res = [], i, ii;
            for(i = 0 , ii = this.rows; i < ii; i++) {
                rc.push(0);
                rr.push(0);
            }
            this.forEach(function (x, i, j) {
                if(i === j) {
                    if(MathLib.is(x, 'complex')) {
                        c.push(x.toPoint());
                    } else {
                        c.push(new MathLib.Point([
                            x, 
                            0, 
                            1
                        ]));
                    }
                } else {
                    rc[j] += MathLib.abs(x);
                    rr[i] += MathLib.abs(x);
                }
            });
            for(i = 0 , ii = this.rows; i < ii; i++) {
                res.push(new MathLib.Circle(c[i], Math.min(rc[i], rr[i])));
            }
            return res;
        };
        Matrix.prototype.givens = function () {
            var rows = this.rows, cols = this.cols, R = this.copy(), Q = MathLib.Matrix.identity(rows), c, s, rho, i, j, k, ri, rj, qi, qj;
            for(i = 0; i < cols; i++) {
                for(j = i + 1; j < rows; j++) {
                    if(!MathLib.isZero(R[j][i])) {
                        rho = (R[i][i] < 0 ? -1 : 1) * MathLib.hypot(R[i][i], R[j][i]);
                        c = R[i][i] / rho;
                        s = R[j][i] / rho;
                        ri = [];
                        rj = [];
                        qi = [];
                        qj = [];
                        for(k = 0; k < cols; k++) {
                            ri.push(R[i][k]);
                            rj.push(R[j][k]);
                        }
                        for(k = 0; k < cols; k++) {
                            R[i][k] = rj[k] * s + ri[k] * c;
                            R[j][k] = rj[k] * c - ri[k] * s;
                        }
                        for(k = 0; k < rows; k++) {
                            qi.push(Q[k][i]);
                            qj.push(Q[k][j]);
                        }
                        for(k = 0; k < rows; k++) {
                            Q[k][i] = qi[k] * c + qj[k] * s;
                            Q[k][j] = -qi[k] * s + qj[k] * c;
                        }
                    }
                }
            }
            return [
                Q, 
                R
            ];
        };
        Matrix.givensMatrix = function (n, i, k, phi) {
            var givens = MathLib.Matrix.identity(n);
            givens[k][k] = givens[i][i] = Math.cos(phi);
            givens[i][k] = Math.sin(phi);
            givens[k][i] = -givens[i][k];
            return givens;
        };
        Matrix.identity = function (n) {
            var temp = [], arr = [], i, ii;
            n = n || 1;
            for(i = 0 , ii = n - 1; i < ii; i++) {
                temp.push(0);
            }
            temp.push(1);
            temp = temp.concat(temp);
            temp = temp.slice(0, -1);
            for(i = 0 , ii = n; i < ii; i++) {
                arr.push(temp.slice(n - i - 1, 2 * n - i - 1));
            }
            return new MathLib.Matrix(arr);
        };
        Matrix.prototype.inverse = function () {
            if(!this.isSquare() && this.determinant()) {
                return;
            }
            return this.adjugate().divide(this.determinant());
        };
        Matrix.prototype.isBandMatrix = function (l, u) {
            var i, j, ii, jj;
            if(arguments.length === 1) {
                u = l;
            }
            return this.every(function (x, i, j) {
                return (i - l <= j && i + u >= j) || MathLib.isZero(x);
            });
        };
        Matrix.prototype.isDiag = function () {
            var i, j, ii, jj;
            if((this.hasOwnProperty('isUpper') && this.isUpper()) + (+(this.hasOwnProperty('isLower') && this.isLower())) + (+(this.hasOwnProperty('isSymmetric') && this.isSymmetric())) > 1) {
                return true;
            }
            for(i = 0 , ii = this.rows; i < ii; i++) {
                for(j = 0 , jj = this.cols; j < jj; j++) {
                    if(i !== j && this[i][j] !== 0) {
                        return false;
                    }
                }
            }
            return true;
        };
        Matrix.prototype.isEqual = function (x) {
            var i, j, ii, jj;
            if(this === x) {
                return true;
            }
            if(this.rows === x.rows && this.cols === x.cols) {
                for(i = 0 , ii = this.rows; i < ii; i++) {
                    for(j = 0 , jj = this.cols; j < jj; j++) {
                        if(!MathLib.isEqual(this[i][j], x[i][j])) {
                            return false;
                        }
                    }
                }
                return true;
            }
            return false;
        };
        Matrix.prototype.isIdentity = function () {
            if(!this.isSquare()) {
                return false;
            }
            var isIdentity = this.every(function (x, r, c) {
                return r === c ? MathLib.isOne(x) : MathLib.isZero(x);
            });
            this.isIdentity = function () {
                return isIdentity;
            };
            return isIdentity;
        };
        Matrix.prototype.isInvertible = function () {
            return this.isSquare() && this.rank() === this.rows;
        };
        Matrix.prototype.isLower = function () {
            return this.slice(0, -1).every(function (x, i) {
                return x.slice(i + 1).every(MathLib.isZero);
            });
        };
        Matrix.prototype.isNegDefinite = function () {
            if(!this.isSquare()) {
                return;
            }
            if(this.rows === 1) {
                return this[0][0] < 0;
            }
            if(this.rows % 2 === 0) {
                return this.determinant() > 0 && this.remove(this.rows - 1, this.cols - 1).isNegDefinite();
            } else {
                return this.determinant() < 0 && this.remove(this.rows - 1, this.cols - 1).isNegDefinite();
            }
        };
        Matrix.prototype.isOrthogonal = function () {
            return this.transpose().times(this).isIdentity();
        };
        Matrix.prototype.isPermutation = function () {
            var rows = [], cols = [];
            return this.every(function (x, r, c) {
                if(MathLib.isOne(x)) {
                    if(rows[r] || cols[c]) {
                        return false;
                    } else {
                        rows[r] = true;
                        cols[c] = true;
                        return true;
                    }
                } else if(MathLib.isZero(x)) {
                    return true;
                }
                return false;
            }) && rows.length === this.rows && cols.length === this.cols;
        };
        Matrix.prototype.isPosDefinite = function () {
            if(!this.isSquare()) {
                return;
            }
            if(this.rows === 1) {
                return this[0][0] > 0;
            }
            return this.determinant() > 0 && this.remove(this.rows - 1, this.cols - 1).isPosDefinite();
        };
        Matrix.prototype.isReal = function () {
            return this.every(MathLib.isReal);
        };
        Matrix.prototype.isScalar = function () {
            var n = this.rows, diag = this.diag, i;
            if(this.hasOwnProperty('isIdentity') && this.hasOwnProperty('isZero')) {
                if(this.isIdentity() || this.isZero()) {
                    return true;
                } else {
                    return false;
                }
            }
            if(this.isDiag()) {
                for(i = 1; i < n; i++) {
                    if(!MathLib.isEqual(diag[0], diag[i])) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        };
        Matrix.prototype.isSquare = function () {
            return this.cols === this.rows;
        };
        Matrix.prototype.isSymmetric = function () {
            var i, j, bool = true;
            if(!this.isSquare()) {
                bool = false;
            } else {
                lp:
for(i = 0; i < this.rows; i++) {
                    for(j = i + 1; j < this.cols; j++) {
                        if(!MathLib.isEqual(this[i][j], this[j][i])) {
                            bool = false;
                            break lp;
                        }
                    }
                }
            }
            this.isSymmetric = function () {
                return bool;
            };
            return bool;
        };
        Matrix.prototype.isUpper = function () {
            return this.slice(1).every(function (x, i) {
                return x.slice(0, i + 1).every(MathLib.isZero);
            });
        };
        Matrix.prototype.isVector = function () {
            return (this.rows === 1) || (this.cols === 1);
        };
        Matrix.prototype.isZero = function () {
            var isZero = this.every(MathLib.isZero);
            this.isZero = function () {
                return isZero;
            };
            return isZero;
        };
        Matrix.prototype.map = function (f) {
            var m = this;
            return new MathLib.Matrix(Array.prototype.map.call(this, function (x, i) {
                return Array.prototype.map.call(x, function (y, j) {
                    return f(y, i, j, m);
                });
            }));
        };
        Matrix.prototype.minor = function (r, c) {
            return this.remove(r, c).determinant();
        };
        Matrix.prototype.minus = function (m) {
            return this.plus(m.negative());
        };
        Matrix.prototype.negative = function () {
            var res = [], i, ii;
            for(i = 0 , ii = this.rows; i < ii; i++) {
                res.push(this[i].map(MathLib.negative));
            }
            return new MathLib.Matrix(res);
        };
        Matrix.numbers = function (n, r, c) {
            var help = [], res = [], i, ii;
            for(i = 0 , ii = c || r || 1; i < ii; i++) {
                help.push(n);
            }
            for(i = 0 , ii = r || 1; i < ii; i++) {
                res.push(help.slice(0));
            }
            return new MathLib.Matrix(res);
        };
        Matrix.one = function (r, c) {
            r = r || 1;
            c = c || 1;
            return MathLib.Matrix.numbers(1, r, c);
        };
        Matrix.prototype.plus = function (m) {
            var res = [], r = this.rows, c = this.cols, i, j;
            for(i = 0; i < r; i++) {
                res[i] = [];
                for(j = 0; j < c; j++) {
                    res[i][j] = MathLib.plus(this[i][j], m[i][j]);
                }
            }
            return new MathLib.Matrix(res);
        };
        Matrix.random = function (r, c) {
            var temp, arr = [], i, j, ii, jj;
            for(i = 0 , ii = r || 1; i < ii; i++) {
                temp = [];
                for(j = 0 , jj = c || r || 1; j < jj; j++) {
                    temp.push(Math.random());
                }
                arr.push(temp);
            }
            return new MathLib.Matrix(arr);
        };
        Matrix.prototype.rank = function () {
            var rank = 0, mat, i, ii, j;
            mat = this.rref();
            label:
for(i = Math.min(this.rows, this.cols) - 1; i >= 0; i--) {
                for(j = this.cols - 1; j >= i; j--) {
                    if(!MathLib.isZero(mat[i][j])) {
                        rank = i + 1;
                        break label;
                    }
                }
            }
            this.rank = function () {
                return rank;
            };
            return rank;
        };
        Matrix.prototype.reduce = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return Array.prototype.reduce.apply(this, args);
        };
        Matrix.prototype.remove = function (row, col) {
            var res = this.toArray();
            if(row || row === 0) {
                if(typeof row === 'number') {
                    row = [
                        row
                    ];
                }
                res = res.filter(function (x, i, arr) {
                    return row.indexOf(i) === -1;
                });
            }
            if(col || col === 0) {
                if(typeof col === 'number') {
                    col = [
                        col
                    ];
                }
                col = col.sort().reverse();
                col.forEach(function (n) {
                    res = res.map(function (x) {
                        x.splice(n, 1);
                        return x;
                    });
                });
            }
            return new MathLib.Matrix(res);
        };
        Matrix.prototype.rref = function () {
            var lead = 0, rref = this.toArray(), i, j, r, temp, val;
            for(r = 0; r < this.rows; r++) {
                if(this.cols <= lead) {
                    return new MathLib.Matrix(rref);
                }
                i = r;
                while(rref[i][lead] === 0) {
                    i++;
                    if(this.rows === i) {
                        i = r;
                        lead++;
                        if(this.cols === lead) {
                            return new MathLib.Matrix(rref);
                        }
                    }
                }
                var tmp = rref[i];
                rref[i] = rref[r];
                rref[r] = tmp;
                val = rref[r][lead];
                for(j = 0; j < this.cols; j++) {
                    rref[r][j] /= val;
                }
                for(i = 0; i < this.rows; i++) {
                    if(i === r) {
                        continue;
                    }
                    val = rref[i][lead];
                    for(j = 0; j < this.cols; j++) {
                        rref[i][j] = MathLib.minus(rref[i][j], MathLib.times(val, rref[r][j]));
                    }
                }
                lead++;
            }
            return new MathLib.Matrix(rref);
        };
        Matrix.prototype.slice = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return Array.prototype.slice.apply(this, args);
        };
        Matrix.prototype.solve = function (b) {
            var LU = this.LU(), i, j, n = b.length, x = [], y = [];
            b = this.LUpermutation.applyTo(b);
            for(i = 0; i < n; i++) {
                y[i] = b[i];
                for(j = 0; j < i; j++) {
                    y[i] = MathLib.minus(y[i], MathLib.times(LU[i][j], y[j]));
                }
            }
            for(i = n - 1; i >= 0; i--) {
                x[i] = y[i];
                for(j = i + 1; j < n; j++) {
                    x[i] = MathLib.minus(x[i], MathLib.times(LU[i][j], x[j]));
                }
                x[i] = MathLib.divide(x[i], LU[i][i]);
            }
            return new b.constructor(x);
        };
        Matrix.prototype.some = function (f) {
            return Array.prototype.some.call(this, function (x, i) {
                return Array.prototype.some.call(x, function (y, j) {
                    return f(y, i, j, this);
                });
            });
        };
        Matrix.prototype.times = function (a) {
            var res = [], temp, i, j, k;
            if(a.type === 'rational') {
                a = a.toNumber();
            }
            if(typeof a === 'number' || a.type === 'complex') {
                return this.map(function (x) {
                    return MathLib.times(x, a);
                });
            } else if(a.type === 'matrix') {
                if(this.cols === a.rows) {
                    for(i = 0; i < this.rows; i++) {
                        res[i] = [];
                        for(j = 0; j < a.cols; j++) {
                            temp = 0;
                            for(k = 0; k < this.cols; k++) {
                                temp = MathLib.plus(temp, MathLib.times(this[i][k], a[k][j]));
                            }
                            res[i][j] = temp;
                        }
                    }
                    return new MathLib.Matrix(res);
                }
            } else if(a.type === 'point' || a.type === 'vector') {
                if(this.cols === a.length) {
                    for(j = 0; j < this.rows; j++) {
                        temp = 0;
                        for(k = 0; k < this.cols; k++) {
                            temp = MathLib.plus(temp, MathLib.times(this[j][k], a[k]));
                        }
                        res.push(temp);
                    }
                    return new a.constructor(res);
                }
            }
        };
        Matrix.prototype.toArray = function () {
            return Array.prototype.map.call(this, function (x) {
                return Array.prototype.map.call(x, function (y) {
                    return MathLib.copy(y);
                });
            });
        };
        Matrix.prototype.toColVectors = function () {
            return this.transpose().toRowVectors();
        };
        Matrix.prototype.toComplex = function () {
            if(this.rows !== 2 || this.cols !== 2 || this[0][0] !== this[1][1] || this[0][1] !== MathLib.negative(this[1][0])) {
                return;
            }
            return new MathLib.Complex(this[0][0], this[1][0]);
        };
        Matrix.prototype.toContentMathMLString = function () {
            return this.reduce(function (str, x) {
                return str + x.reduce(function (prev, cur) {
                    return prev + MathLib.toContentMathMLString(cur);
                }, '<matrixrow>') + '</matrixrow>';
            }, '<matrix>') + '</matrix>';
        };
        Matrix.prototype.toLaTeX = function () {
            return '\\begin{pmatrix}\n' + this.reduce(function (str, x) {
                return str + x.reduce(function (prev, cur) {
                    return prev + ' & ' + MathLib.toLaTeX(cur);
                }) + '\\\n';
            }, '').slice(0, -2) + '\n\\end{pmatrix}';
        };
        Matrix.prototype.toMathMLString = function () {
            return this.reduce(function (str, x) {
                return str + x.reduce(function (prev, cur) {
                    return prev + '<mtd>' + MathLib.toMathMLString(cur) + '</mtd>';
                }, '<mtr>') + '</mtr>';
            }, '<mrow><mo> ( </mo><mtable>') + '</mtable><mo> ) </mo></mrow>';
        };
        Matrix.prototype.toRowVectors = function () {
            return this.toArray().map(function (v) {
                return new MathLib.Vector(v);
            });
        };
        Matrix.prototype.toString = function () {
            return this.reduce(function (str, x) {
                return str + x.reduce(function (prev, cur) {
                    return prev + '\t' + MathLib.toString(cur);
                }) + '\n';
            }, '').slice(0, -1);
        };
        Matrix.prototype.trace = function () {
            var trace = MathLib.plus.apply(null, this.diag());
            this.trace = function () {
                return trace;
            };
            return trace;
        };
        Matrix.prototype.transpose = function () {
            var temp = [], transpose, help, i, j, ii, jj;
            for(i = 0 , ii = this.cols; i < ii; i++) {
                help = [];
                for(j = 0 , jj = this.rows; j < jj; j++) {
                    help.push(this[j][i]);
                }
                temp.push(help);
            }
            transpose = new MathLib.Matrix(temp);
            this.transpose = function () {
                return transpose;
            };
            return transpose;
        };
        Matrix.zero = function (r, c) {
            r = r || 1;
            c = c || 1;
            return MathLib.Matrix.numbers(0, r, c);
        };
        return Matrix;
    })();
    MathLib.Matrix = Matrix;    
    var Permutation = (function () {
        function Permutation(p) {
            var _this = this;
            this.type = 'permutation';
            var cycle, permutation;
            if(Array.isArray(p[0])) {
                cycle = p;
                permutation = Permutation.cycleToList(cycle);
            } else {
                permutation = p;
                cycle = Permutation.listToCycle(permutation);
            }
            permutation.forEach(function (x, i) {
                _this[i] = x;
            });
            this.length = permutation.length;
            this.cycle = cycle;
        }
        Permutation.prototype.applyTo = function (n) {
            var p, res;
            if(typeof n === 'number') {
                if(n >= this.length) {
                    return n;
                }
                return this[n];
            } else {
                p = this;
                res = n.map(function (x, i) {
                    return n[p.applyTo(i)];
                });
                return (n.type === undefined ? res : new n.constructor(res));
            }
        };
        Permutation.cycleToList = function cycleToList(cycle) {
            var index, res = [], cur, i, ii, j, jj, max;
            max = cycle.map(function (b) {
                return Math.max.apply(null, b);
            });
            max = Math.max.apply(null, max);
            for(i = 0 , ii = max; i <= ii; i++) {
                cur = i;
                for(j = 0 , jj = cycle.length; j < jj; j++) {
                    index = cycle[j].indexOf(cur);
                    if(++index) {
                        cur = cycle[j][index % cycle[j].length];
                    }
                }
                res.push(cur);
            }
            return res;
        };
        Permutation.id = new Permutation([
            []
        ]);
        Permutation.prototype.inverse = function () {
            var cycle = this.cycle.slice(0);
            cycle.reverse().forEach(function (e) {
                e.reverse();
            });
            return new MathLib.Permutation(cycle);
        };
        Permutation.listToCycle = function listToCycle(list) {
            var finished = [], cur, i, ii, temp, res = [];
            for(i = 0 , ii = list.length; i < ii; i++) {
                cur = i;
                temp = [];
                while(!finished[cur]) {
                    finished[cur] = true;
                    temp.push(cur);
                    cur = list[cur];
                }
                if(temp.length) {
                    res.push(temp);
                }
            }
            return res;
        };
        Permutation.prototype.map = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return new this['constructor'](Array.prototype.map.apply(this, args));
        };
        Permutation.prototype.sgn = function () {
            var count = 0, i;
            for(i = 0; i < this.cycle.length; i++) {
                count += this.cycle[i].length;
            }
            count += this.cycle.length;
            return -2 * (count % 2) + 1;
        };
        Permutation.prototype.times = function (p) {
            var a = this;
            return p.map(function (x) {
                return a[x];
            });
        };
        Permutation.prototype.toMatrix = function (n) {
            var arr = [], res = [], temp, i, ii;
            n = n || this.length;
            for(i = 0 , ii = n - 1; i < ii; i++) {
                arr.push(0);
            }
            arr = arr.concat([
                1
            ]).concat(arr);
            for(i = 0 , ii = n; i < ii; i++) {
                temp = n - this.applyTo(i) - 1;
                res.push(arr.slice(temp, temp + n));
            }
            return new MathLib.Matrix(res);
        };
        Permutation.prototype.toString = function () {
            var str = '';
            this.cycle.forEach(function (elem) {
                str += '(' + elem.toString() + ')';
            });
            return str;
        };
        return Permutation;
    })();
    MathLib.Permutation = Permutation;    
    var Point = (function (_super) {
        __extends(Point, _super);
        function Point(coords) {
                _super.call(this, arguments.length > 1 ? Array.prototype.slice.call(arguments).concat(1) : coords);
            this.dim = 2;
            this.type = 'point';
        }
        Point.I = new Point([
            new MathLib.Complex(0, -1), 
            0, 
            1
        ]);
        Point.J = new Point([
            new MathLib.Complex(0, 1), 
            0, 
            1
        ]);
        Point.prototype.crossRatio = function (m, n, o, p) {
            var x = this.toArray(), a = m.toArray(), b = n.toArray(), c = o.toArray(), d = p.toArray(), m1 = new MathLib.Matrix([
                x, 
                a, 
                c
            ]), m2 = new MathLib.Matrix([
                x, 
                b, 
                d
            ]), m3 = new MathLib.Matrix([
                x, 
                a, 
                d
            ]), m4 = new MathLib.Matrix([
                x, 
                b, 
                c
            ]);
            return (m1.det() * m2.det()) / (m3.det() * m4.det());
        };
        Point.prototype.distanceTo = function (point) {
            var res = 0, i;
            if(arguments.length === 0) {
                for(i = 0; i < this.dim; i++) {
                    res += Math.pow(this[i], 2);
                }
                return Math.sqrt(res);
            }
            if(point.type === 'point' && this.dim === point.dim) {
                for(i = 0; i < this.dim; i++) {
                    res += Math.pow(this[i] - point[i], 2);
                }
            }
            return Math.sqrt(res);
        };
        Point.prototype.draw = function (screen, options) {
            if(Array.isArray(screen)) {
                var point = this;
                screen.forEach(function (x) {
                    x.point(point, options);
                });
            } else {
                screen.point(this, options);
            }
            return this;
        };
        Point.prototype.isEqual = function (q) {
            var p = this.normalize();
            q = q.normalize();
            if(this.length !== q.length) {
                return false;
            }
            return p.every(function (x, i) {
                return MathLib.isEqual(x, q[i]);
            });
        };
        Point.prototype.isFinite = function () {
            return !MathLib.isZero(this[this.length - 1]);
        };
        Point.prototype.isInside = function (a) {
            if(a.type === 'circle') {
                return this.distanceTo(a.center) < a.radius;
            }
        };
        Point.prototype.isOn = function (a) {
            if(a.type === 'line') {
                return this.distanceTo(a.center) === a.radius;
            } else if(a.type === 'circle') {
                return this.distanceTo(a.center) === a.radius;
            }
        };
        Point.prototype.isOutside = function (a) {
            if(a.type === 'circle') {
                return this.distanceTo(a.center) > a.radius;
            }
        };
        Point.prototype.lineTo = function (q) {
            if(this.dim === 2 && q.dim === 2) {
                return new MathLib.Line(this, q);
            }
        };
        Point.prototype.normalize = function () {
            var last = this[this.dim];
            return this.map(function (x) {
                return x / last;
            });
        };
        Point.prototype.reflectAt = function (a) {
            if(a.type === 'point') {
                if(this.dim === a.dim) {
                    var arr = [], i, p = this.normalize();
                    a = a.normalize();
                    for(i = 0; i < this.dim; i++) {
                        arr.push(2 * a[i] - p[i]);
                    }
                    arr.push(1);
                    return new MathLib.Point(arr);
                }
            }
        };
        Point.prototype.toArray = function () {
            var res = [], i, ii;
            for(i = 0 , ii = this.dim; i <= ii; i++) {
                res.push(this[i]);
            }
            return res;
        };
        Point.prototype.toComplex = function () {
            if(this.dim === 2) {
                return new MathLib.Complex(this[0] / this[2], this[1] / this[2]);
            }
        };
        Point.prototype.toLaTeX = function (opt) {
            if (typeof opt === "undefined") { opt = false; }
            var p = opt ? this.toArray() : this.normalize().slice(0, -1);
            return '\\begin{pmatrix}' + p.reduce(function (old, cur) {
                return old + '\\\\' + MathLib.toLaTeX(cur);
            }) + '\\end{pmatrix}';
        };
        Point.prototype.toMathMLString = function (opt) {
            if (typeof opt === "undefined") { opt = false; }
            var p = opt ? this.toArray() : this.normalize().slice(0, -1);
            return p.reduce(function (old, cur) {
                return old + '<mtr><mtd>' + MathLib.toMathMLString(cur) + '</mtd></mtr>';
            }, '<mrow><mo>(</mo><mtable>') + '</mtable><mo>)</mo></mrow>';
        };
        Point.prototype.toString = function (opt) {
            if (typeof opt === "undefined") { opt = false; }
            var p = opt ? this.toArray() : this.normalize().slice(0, -1);
            return '(' + p.reduce(function (old, cur) {
                return old + ', ' + MathLib.toString(cur);
            }) + ')';
        };
        return Point;
    })(Vector);
    MathLib.Point = Point;    
    var Polynomial = (function () {
        function Polynomial(polynomial) {
            var _this = this;
            this.type = 'polynomial';
            var temp = [];
            if(polynomial === undefined || polynomial.length === 0) {
                polynomial = [
                    0
                ];
            } else if(typeof polynomial === 'number') {
                while(polynomial--) {
                    temp.push(0);
                }
                temp.push(1);
                polynomial = temp;
            }
            polynomial.forEach(function (x, i) {
                _this[i] = x;
            });
            this.length = polynomial.length;
            this.deg = polynomial.length - 1;
            this.subdeg = ((function (a) {
                var i = 0;
                if(a.length > 1 || a[0]) {
                    while(i < a.length && MathLib.isZero(a[i])) {
                        i++;
                    }
                    return i;
                }
                return Infinity;
            })(polynomial));
        }
        Polynomial.prototype.content = function () {
            return MathLib.gcd(this);
        };
        Polynomial.prototype.differentiate = function (n) {
            if (typeof n === "undefined") { n = 1; }
            var temparr = [], i;
            if(n === 0) {
                return this;
            }
            if(n < 0) {
                return this.integrate(-n);
            }
            for(i = 0; i <= this.deg - n; i++) {
                temparr[i] = MathLib.times(this[i + n], MathLib.fallingFactorial(i + n, n));
            }
            return new MathLib.Polynomial(temparr);
        };
        Polynomial.prototype.draw = function (screen, options) {
            var path = [], i, line = this;
            if(this.deg < 2) {
                if(Array.isArray(screen)) {
                    screen.forEach(function (x) {
                        x.line([
                            [
                                -50, 
                                line.valueAt(-50)
                            ], 
                            [
                                50, 
                                line.valueAt(50)
                            ]
                        ], options);
                    });
                } else {
                    screen.line([
                        [
                            -50, 
                            this.valueAt(-50)
                        ], 
                        [
                            50, 
                            this.valueAt(50)
                        ]
                    ], options);
                }
            } else {
                for(i = -50; i <= 50; i = Math.round((i + 0.01) * 100) / 100) {
                    path.push([
                        i, 
                        this.valueAt(i)
                    ]);
                }
                if(Array.isArray(screen)) {
                    screen.forEach(function (x) {
                        x.path(path, options);
                    });
                } else {
                    screen.path(path, options);
                }
            }
            return this;
        };
        Polynomial.prototype.every = function (f) {
            return Array.prototype.every.call(this, f);
        };
        Polynomial.prototype.forEach = function () {
            return Array.prototype.forEach.apply(this, arguments);
        };
        Polynomial.prototype.integrate = function (n) {
            if (typeof n === "undefined") { n = 1; }
            var temparr = [], i;
            if(MathLib.isZero(n)) {
                return this;
            }
            if(n < 0) {
                return this.differentiate(-n);
            }
            for(i = 0; i < n; i++) {
                temparr.push(0);
            }
            for(i = 0; i <= this.deg; i++) {
                temparr[i + n] = this[i] / MathLib.fallingFactorial(i + n, n);
            }
            return new MathLib.Polynomial(temparr);
        };
        Polynomial.prototype.interpolation = function (a, b) {
            var temp, res = new MathLib.Polynomial([
                0
            ]), n = a.length, i, j, x, y;
            if(arguments.length === 2) {
                a = a.map(function (x, i) {
                    return [
                        x, 
                        b[i]
                    ];
                });
            }
            for(i = 0; i < n; i++) {
                temp = new MathLib.Polynomial([
                    1
                ]);
                for(j = 0; j < n; j++) {
                    if(i !== j) {
                        temp = temp.times(new MathLib.Polynomial([
                            -a[j][0] / (a[i][0] - a[j][0]), 
                            1 / (a[i][0] - a[j][0])
                        ]));
                    }
                }
                res = res.plus(temp.times(a[i][1]));
            }
            return res;
        };
        Polynomial.prototype.isEqual = function (p) {
            var i, ii;
            if(this.deg !== p.deg || this.subdeg !== p.subdeg) {
                return false;
            }
            for(i = 0 , ii = this.deg; i <= ii; i++) {
                if(!MathLib.isEqual(this[i], p[i])) {
                    return false;
                }
            }
            return true;
        };
        Polynomial.prototype.isPrimitive = function () {
            return MathLib.gcd(this) === 1;
        };
        Polynomial.prototype.isReal = function () {
            return this.every(MathLib.isReal);
        };
        Polynomial.prototype.map = function (f) {
            return new MathLib.Polynomial(Array.prototype.map.call(this, f));
        };
        Polynomial.prototype.mod = function (m) {
            return this.map(function (x) {
                return MathLib.mod(x, m);
            });
        };
        Polynomial.prototype.negative = function () {
            return new MathLib.Polynomial(this.map(MathLib.negative));
        };
        Polynomial.one = new Polynomial([
            1
        ]);
        Polynomial.prototype.plus = function (a, all) {
            var temparr = [], i;
            if(typeof a === 'number') {
                if(all) {
                    return this.map(function (b) {
                        return MathLib.plus(a, b);
                    });
                } else {
                    temparr = this.slice();
                    temparr[0] = MathLib.plus(temparr[0], a);
                }
            } else if(a.type === 'polynomial') {
                for(i = 0; i <= Math.min(this.deg, a.deg); i++) {
                    temparr[i] = MathLib.plus(this[i], a[i]);
                }
                temparr = temparr.concat((this.deg > a.deg ? this : a).slice(i));
            }
            return new MathLib.Polynomial(temparr);
        };
        Polynomial.regression = function regression(x, y) {
            var length = x.length, xy = 0, xi = 0, yi = 0, x2 = 0, m, c, i;
            if(arguments.length === 2) {
                for(i = 0; i < length; i++) {
                    xy += x[i] * y[i];
                    xi += x[i];
                    yi += y[i];
                    x2 += x[i] * x[i];
                }
            } else {
                for(i = 0; i < length; i++) {
                    xy += x[i][0] * x[i][1];
                    xi += x[i][0];
                    yi += x[i][1];
                    x2 += x[i][0] * x[i][0];
                }
            }
            m = (length * xy - xi * yi) / (length * x2 - xi * xi);
            c = (yi * x2 - xy * xi) / (length * x2 - xi * xi);
            return new MathLib.Polynomial([
                c, 
                m
            ]);
        };
        Polynomial.roots = function roots(zeros) {
            var temp, coef = [], i, ii;
            if(MathLib.type(zeros) === 'array') {
                zeros = MathLib.set(zeros, true);
            }
            temp = zeros.powerset();
            for(i = 0 , ii = zeros.card; i < ii; i++) {
                coef[i] = 0;
            }
            temp.slice(1).forEach(function (x, i) {
                coef[ii - x.card] = MathLib.plus(coef[ii - x.card], x.times());
            });
            coef = coef.map(function (x, i) {
                if((ii - i) % 2) {
                    return MathLib.negative(x);
                }
                return x;
            });
            coef.push(1);
            return new MathLib.Polynomial(coef);
        };
        Polynomial.prototype.slice = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return Array.prototype.slice.apply(this, args);
        };
        Polynomial.prototype.tangent = function (p) {
            var value = this.valueAt(p), slope = this.differentiate().valueAt(p);
            return new MathLib.Polynomial([
                value - slope * p, 
                slope
            ]);
        };
        Polynomial.prototype.times = function (a) {
            var temparr = [], i, j;
            if(a.type === 'rational') {
                a = a.toNumber();
            }
            if(a.type === 'polynomial') {
                for(i = 0; i <= this.deg; i++) {
                    for(j = 0; j <= a.deg; j++) {
                        temparr[i + j] = MathLib.plus((temparr[i + j] ? temparr[i + j] : 0), MathLib.times(this[i], a[j]));
                    }
                }
            } else {
                temparr = this.map(function (b) {
                    return MathLib.times(a, b);
                });
            }
            return new MathLib.Polynomial(temparr);
        };
        Polynomial.prototype.toContentMathMLString = function (math) {
            var str = '<apply><plus/>', i;
            for(i = this.deg; i >= 0; i--) {
                if(!MathLib.isZero(this[i])) {
                    if(i === 0) {
                        str += MathLib.toContentMathMLString(this[i]);
                    } else {
                        str += '<apply><times/>' + MathLib.toContentMathMLString(this[i], true);
                    }
                    if(i > 1) {
                        str += '<apply><power/><ci>x</ci>' + MathLib.toContentMathMLString(i) + '</apply></apply>';
                    } else if(i === 1) {
                        str += '<ci>x</ci></apply>';
                    }
                }
            }
            str += '</apply>';
            if(math) {
                str = '<math xmlns="http://www.w3.org/1998/Math/MathML"><lambda><bvar><ci>x</ci></bvar><domainofapplication><complexes/></domainofapplication>' + str + '</lambda></math>';
            }
            return str;
        };
        Polynomial.prototype.toFunctn = function () {
            var str = '', i, ii;
            for(i = 0 , ii = this.deg; i <= ii; i++) {
                if(!MathLib.isZero(this[i])) {
                    if(i === 0) {
                        str += MathLib.toString(this[i]);
                    } else {
                        str += MathLib.toString(this[i], true);
                    }
                    if(i > 1) {
                        str += '* Math.pow(x,' + MathLib.toString(i) + ')';
                    } else if(i === 1) {
                        str += '*x';
                    }
                }
            }
            return new MathLib.Functn(new Function('x', 'return ' + str), {
                contentMathMLString: this.toContentMathMLString(true)
            });
        };
        Polynomial.prototype.toLaTeX = function () {
            var str = MathLib.toString(this[this.deg]) + '*x^{' + this.deg + '}', i;
            for(i = this.deg - 1; i >= 0; i--) {
                if(!MathLib.isZero(this[i])) {
                    str += MathLib.toLaTeX(this[i], true);
                    if(i > 1) {
                        str += 'x^{' + MathLib.toLaTeX(i) + '}';
                    } else if(i === 1) {
                        str += 'x';
                    }
                }
            }
            return str;
        };
        Polynomial.prototype.toMathMLString = function (math) {
            var str = '<mrow>' + MathLib.toMathMLString(this[this.deg], true) + '<mo>&#x2062;</mo><msup><mi>x</mi>' + MathLib.toMathMLString(this.deg) + '</msup>', i;
            for(i = this.deg - 1; i >= 0; i--) {
                if(!MathLib.isZero(this[i])) {
                    str += MathLib.toMathMLString(this[i], true);
                    if(i > 1) {
                        str += '<mo>&#x2062;</mo><msup><mi>x</mi>' + MathLib.toMathMLString(i) + '</msup>';
                    } else if(i === 1) {
                        str += '<mo>&#x2062;</mo><mi>x</mi>';
                    }
                }
            }
            str += '</mrow>';
            if(math) {
                str = '<math xmlns="http://www.w3.org/1998/Math/MathML">' + str + '</math>';
            }
            return str;
        };
        Polynomial.prototype.toString = function (opt) {
            var str = MathLib.toString(this[this.deg]) + '*x^' + this.deg, i;
            for(i = this.deg - 1; i >= 0; i--) {
                if(!MathLib.isZero(this[i])) {
                    str += MathLib.toString(this[i], true);
                    if(i > 1) {
                        str += '*x^' + MathLib.toString(i);
                    } else if(i === 1) {
                        str += '*x';
                    }
                }
            }
            return str;
        };
        Polynomial.prototype.valueAt = function (x) {
            var pot = MathLib.is(x, 'matrix') ? MathLib.Matrix.identity(x.rows, x.cols) : 1, res = MathLib.is(x, 'matrix') ? MathLib.Matrix.zero(x.rows, x.cols) : 0, i, ii;
            for(i = 0 , ii = this.deg; i <= ii; i++) {
                res = MathLib.plus(res, MathLib.times(this[i], pot));
                pot = MathLib.times(pot, x);
            }
            return res;
        };
        Polynomial.zero = new Polynomial([
            0
        ]);
        return Polynomial;
    })();
    MathLib.Polynomial = Polynomial;    
    var Rational = (function () {
        function Rational(numerator, denominator) {
            if (typeof denominator === "undefined") { denominator = 1; }
            this.type = 'rational';
            if(MathLib.isZero(denominator)) {
                throw 'The denominator cannot be zero.';
            }
            this.numerator = numerator;
            this.denominator = denominator;
        }
        Rational.prototype.divide = function (r) {
            if(r.type === 'rational') {
                return new MathLib.Rational(MathLib.times(this.numerator, r.denominator), MathLib.times(this.denominator, r.numerator));
            } else if(typeof r === 'number') {
                return new MathLib.Rational(this.numerator, MathLib.times(this.denominator, r));
            } else {
                return r.inverse().times(this);
            }
        };
        Rational.prototype.inverse = function () {
            if(!MathLib.isZero(this.numerator)) {
                return new MathLib.Rational(this.denominator, this.numerator);
            }
        };
        Rational.prototype.isEqual = function (r) {
            return MathLib.isEqual(MathLib.times(this.numerator, r.denominator), MathLib.times(this.denominator, r.numerator));
        };
        Rational.prototype.isZero = function () {
            return MathLib.isZero(this.numerator);
        };
        Rational.prototype.minus = function (r) {
            var n = this.numerator, d = this.denominator;
            if(r.type === 'rational') {
                return new MathLib.Rational(MathLib.minus(MathLib.times(n, r.denominator), MathLib.times(d, r.numerator)), MathLib.times(d, r.denominator));
            } else if(typeof r === 'number') {
                return new MathLib.Rational(MathLib.minus(n, MathLib.times(r, d)), d);
            } else {
                return r.minus(this).negative();
            }
        };
        Rational.prototype.negative = function () {
            return new MathLib.Rational(-this.numerator, this.denominator);
        };
        Rational.prototype.plus = function (r) {
            var n = this.numerator, d = this.denominator;
            if(r.type === 'rational') {
                return new MathLib.Rational(MathLib.plus(MathLib.times(d, r.numerator), MathLib.times(n, r.denominator)), MathLib.times(d, r.denominator));
            } else if(typeof r === 'number') {
                return new MathLib.Rational(MathLib.plus(n, MathLib.times(r, d)), d);
            } else {
                return r.plus(this);
            }
        };
        Rational.prototype.reduce = function () {
            var gcd = MathLib.sign(this.denominator) * MathLib.gcd([
                this.numerator, 
                this.denominator
            ]);
            return new MathLib.Rational(this.numerator / gcd, this.denominator / gcd);
        };
        Rational.prototype.times = function (r) {
            if(r.type === 'rational') {
                return new MathLib.Rational(MathLib.times(this.numerator, r.numerator), MathLib.times(this.denominator, r.denominator));
            } else if(typeof r === 'number') {
                return new MathLib.Rational(MathLib.times(this.numerator, r), this.denominator);
            } else {
                return r.times(this);
            }
        };
        Rational.prototype.toContentMathMLString = function () {
            return '<cn type="rational">' + this.numerator + '<sep/>' + this.denominator + '</cn>';
        };
        Rational.prototype.toLaTeX = function () {
            return '\\frac{' + MathLib.toLaTeX(this.numerator) + '}{' + MathLib.toLaTeX(this.denominator) + '}';
        };
        Rational.prototype.toMathMLString = function () {
            return '<mfrac>' + MathLib.toMathMLString(this.numerator) + MathLib.toMathMLString(this.denominator) + '</mfrac>';
        };
        Rational.prototype.toNumber = function () {
            return this.numerator / this.denominator;
        };
        Rational.prototype.toString = function () {
            return MathLib.toString(this.numerator) + '/' + MathLib.toString(this.denominator);
        };
        return Rational;
    })();
    MathLib.Rational = Rational;    
    var Set = (function () {
        function Set(elements) {
            var _this = this;
            this.type = 'set';
            this.union = Set.createSetOperation(true, true, true);
            this.intersect = Set.createSetOperation(false, true, false);
            this.without = Set.createSetOperation(true, false, false);
            this.xor = Set.createSetOperation(true, false, true);
            if(!elements) {
                elements = [];
            }
            elements = elements.sort(MathLib.compare);
            elements = elements.filter(function (x, i, a) {
                return x !== a[i + 1];
            });
            elements.forEach(function (x, i) {
                _this[i] = x;
            });
            this.length = elements.length;
            this.card = elements.length;
        }
        Set.prototype.compare = function (x) {
            if(this.card !== x.card) {
                return MathLib.sign(this.card - x.card);
            } else {
                var res = 0, stop = false;
                this.forEach(function (y, i) {
                    if(!stop) {
                        var a = MathLib.compare(y, x[i]);
                        if(a !== 0) {
                            res = a;
                            stop = true;
                        }
                    }
                });
                return res;
            }
        };
        Set.prototype.every = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return Array.prototype.every.apply(this, args);
        };
        Set.prototype.filter = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return new MathLib.Set(Array.prototype.filter.apply(this, args));
        };
        Set.prototype.forEach = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            Array.prototype.forEach.apply(this, args);
        };
        Set.fromTo = function (f, t, s) {
            if (typeof s === "undefined") { s = 1; }
            var i, arr = [];
            if(f <= t) {
                for(i = f; i <= t; i += s) {
                    arr.push(i);
                }
                return new MathLib.Set(arr);
            }
        };
        Set.prototype.indexOf = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return Array.prototype.indexOf.apply(this, args);
        };
        Set.prototype.insert = function (x) {
            var i = this.locate(x);
            if(this[i] !== x) {
                this.splice(i, 0, x);
                this.card++;
            }
            return this;
        };
        Set.prototype.isEmpty = function () {
            return this.card === 0;
        };
        Set.prototype.isEqual = function (x) {
            if(this.card !== x.card) {
                return false;
            } else {
                return this.every(function (y, i) {
                    return MathLib.isEqual(y, x[i]);
                });
            }
        };
        Set.prototype.isSubsetOf = function (a) {
            return this.every(function (x) {
                return a.indexOf(x) !== -1;
            });
        };
        Set.prototype.locate = function (x) {
            var left = 0, right = this.card - 1, middle, i = this.indexOf(x);
            if(i !== -1) {
                return i;
            }
            while(left <= right) {
                middle = left + Math.floor((right - left) / 2);
                if(this[middle] < x) {
                    left = middle + 1;
                } else if(this[middle] > x) {
                    right = middle - 1;
                } else {
                    return middle;
                }
            }
            return left;
        };
        Set.prototype.map = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return new MathLib.Set(Array.prototype.map.apply(this, args));
        };
        Set.prototype.plus = function (n) {
            var res = [];
            if(!arguments.length) {
                return MathLib.plus.apply(null, this.toArray());
            } else if(n.type === 'set') {
                this.forEach(function (x) {
                    n.forEach(function (y) {
                        res.push(MathLib.plus(x, y));
                    });
                });
                return new MathLib.Set(res);
            } else {
                return this.map(function (x) {
                    return MathLib.plus(x, n);
                });
            }
        };
        Set.prototype.powerset = function () {
            var res = [], arr, temp, i, ii, j, jj;
            for(i = 0 , ii = Math.pow(2, this.card); i < ii; i++) {
                arr = i.toString(2).split('').reverse();
                temp = [];
                for(j = 0 , jj = this.card; j < jj; j++) {
                    if(arr[j] === '1') {
                        temp.push(this[j]);
                    }
                }
                res.push(new MathLib.Set(temp));
            }
            return new MathLib.Set(res);
        };
        Set.prototype.reduce = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return Array.prototype.reduce.apply(this, arguments);
        };
        Set.prototype.remove = function (a) {
            var i = this.indexOf(a);
            if(i !== -1) {
                this.splice(i, 1);
                this.card--;
            }
            return this;
        };
        Set.createSetOperation = function (left, both, right) {
            return function (a) {
                var res = [], i = 0, j = 0, tl = this.card, al = a.card;
                while(i < tl && j < al) {
                    if(this[i] < a[j]) {
                        if(left) {
                            res.push(this[i]);
                        }
                        i++;
                        continue;
                    }
                    if(this[i] > a[j]) {
                        if(right) {
                            res.push(a[j]);
                        }
                        j++;
                        continue;
                    }
                    if(this[i] === a[j]) {
                        if(both) {
                            res.push(this[i]);
                        }
                        i++;
                        j++;
                        continue;
                    }
                }
                if(left && j === al) {
                    res = res.concat(this.slice(i));
                } else if(right && i === tl) {
                    res = res.concat(a.slice(j));
                }
                return new MathLib.Set(res);
            };
        };
        Set.prototype.slice = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return Array.prototype.slice.apply(this, args);
        };
        Set.prototype.splice = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return Array.prototype.splice.apply(this, args);
        };
        Set.prototype.times = function (n) {
            if(!arguments.length) {
                return MathLib.times.apply(null, this.toArray());
            } else {
                return this.map(function (x) {
                    return MathLib.times(x, n);
                });
            }
        };
        Set.prototype.toArray = function () {
            return Array.prototype.slice.call(this);
        };
        Set.prototype.toContentMathMLString = function () {
            if(this.isEmpty()) {
                return '<emptyset/>';
            } else {
                return this.reduce(function (old, cur) {
                    return old + MathLib.toContentMathMLString(cur);
                }, '<set>') + '</set>';
            }
        };
        Set.prototype.toLaTeX = function () {
            if(this.isEmpty()) {
                return '\\emptyset';
            } else {
                return this.reduce(function (old, cur) {
                    return old + MathLib.toLaTeX(cur) + ', ';
                }, '\\{').slice(0, -2) + '\\}';
            }
        };
        Set.prototype.toMathMLString = function () {
            if(this.isEmpty()) {
                return '<mi>&#x2205;</mi>';
            } else {
                return this.reduce(function (old, cur) {
                    return old + MathLib.toMathMLString(cur) + '<mo>,</mo>';
                }, '<mrow><mo>{</mo>').slice(0, -10) + '<mo>}</mo></mrow>';
            }
        };
        Set.prototype.toString = function () {
            if(this.isEmpty()) {
                return '∅';
            }
            return '(' + Array.prototype.join.call(this, ', ') + ')';
        };
        return Set;
    })();
    MathLib.Set = Set;    
})(MathLib || (MathLib = {}));
//@ sourceMappingURL=MathLib.js.map
