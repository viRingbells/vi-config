"use strict";
exports.__esModule = true;
var path = require("path");
var config = require("../dist/main");
config.init({
    root: path.resolve(__dirname, 'config')
});
console.log(config.get('foo.bar') + ' ' + config.get('foo.baz')); // Got 'Hello World'
