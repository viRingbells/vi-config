"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var yaml = __importStar(require("js-yaml"));
var lodash_1 = require("lodash");
var postfix = null;
var configDirectory = 'config';
var loaderByExtname = {
    '.js': moduleLoader,
    '.es': moduleLoader,
    '.json': moduleLoader,
    '.node': moduleLoader,
    '.yaml': yamlLoader,
    '.yml': yamlLoader
};
exports.config = null;
function get(path) {
    return lodash_1.get(exports.config, path);
}
exports.get = get;
;
function init(options) {
    if (options === void 0) { options = {}; }
    if (options.env) {
        postfix = "." + options.env;
    }
    if (options.loader) {
        loaderByExtname = __assign({}, loaderByExtname, options.loader);
    }
    if (!path.isAbsolute(options.root)) {
        throw new Error("Config root directory should be an absolute path, [" + options.root + "] given");
    }
    exports.config = loadConfig(options.root);
}
exports.init = init;
function moduleLoader(filePath) {
    return require(filePath);
}
function yamlLoader(filePath) {
    var content = fs.readFileSync(filePath).toString();
    return yaml.safeLoad(content);
}
function loadConfig(directoryPath) {
    var o = {};
    var files = [];
    var targetList = fs.readdirSync(directoryPath).filter(function (name) { return !name.startsWith('.'); });
    for (var _i = 0, targetList_1 = targetList; _i < targetList_1.length; _i++) {
        var targetName = targetList_1[_i];
        var targetPath = path.resolve(directoryPath, targetName);
        var stat = fs.statSync(targetPath);
        if (stat.isDirectory()) {
            o[targetName] = loadConfig(targetPath);
            continue;
        }
        var extname = path.extname(targetName);
        targetName = path.basename(targetName, extname);
        var loader = loaderByExtname[extname];
        if (!loader) {
            console.log("Failed to load " + targetName + " since no loader for [" + extname + "]");
            continue;
        }
        try {
            o[targetName] = loader(targetPath);
        }
        catch (e) {
            console.log("Loading config file [" + targetPath + "] error: " + e.message + "]");
        }
        files.push(targetName);
    }
    if (postfix) {
        for (var name_1 in o) {
            if (!name_1.endsWith(postfix) || !o[name_1]) {
                continue;
            }
            var realName = name_1.slice(0, -postfix.length);
            o[realName] = o[realName] || {};
            lodash_1.merge(o[realName], o[name_1]);
            delete o[name_1];
        }
    }
    return o;
}
