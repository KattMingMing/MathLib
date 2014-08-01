
    'use strict';

    var MathLib = require('./meta.js');
    /**
    * MathLib.CoercionError is thrown if it is not possible to perform the coercion.
    *
    */
    module.exports = MathLib.CoercionError = function (message, options) {
        var tmp = Error.apply(this, arguments);
        tmp.name = this.name = 'CoercionError';

        this.stack = tmp.stack;
        this.message = tmp.message;
        this.method = options.method;
    };

    var CustomError = function () {
    };
    CustomError.prototype = Error.prototype;
    MathLib.CoercionError.prototype = new CustomError();

