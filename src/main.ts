/**
 * An simple library to load configs in a directory.
 **/
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import {merge as _merge, get as _get} from 'lodash';

let postfix: string = null;
let configDirectory: string = 'config';
let loaderByExtname: any = {
    '.js': moduleLoader,
    '.es': moduleLoader,
    '.json': moduleLoader,
    '.node': moduleLoader,
    '.yaml': yamlLoader,
    '.yml': yamlLoader
};

export let config: any = null;

export function get(path: string): any {
    return _get(config, path);
}

export type configFileLoader = (filePath: string) => any; 

export interface Options {
    env?: string;
    loader?: {
        [propName: string]: configFileLoader;
    };
    root?: string;
};

export function init(options: Options = {}): void {
    if (options.env) {
        postfix = `.${options.env}`;
    }
    if (options.loader) {
        loaderByExtname = {
            ...loaderByExtname,
            ...options.loader,
        };
    }
    if (!path.isAbsolute(options.root)) {
        throw new Error(`Config root directory should be an absolute path, [${options.root}] given`);
    }
    config = loadConfig(options.root);
}

/**
 * Define and add default loaders here
 **/
function moduleLoader(filePath: string): any {
    return require(filePath);
}

function yamlLoader(filePath: string): any {
    const content: string = fs.readFileSync(filePath).toString();
    return yaml.safeLoad(content);
}

/**
 * Load config from directories
 **/
function loadConfig(directoryPath: string): any {
    const o: any = {};
    const files: string[] = [];
    const targetList: string[] = fs.readdirSync(directoryPath).filter((name: string) => !name.startsWith('.'));
    for (let targetName of targetList) {
        const targetPath = path.resolve(directoryPath, targetName);
        const stat = fs.statSync(targetPath);
        if (stat.isDirectory()) {
            o[targetName] = loadConfig(targetPath);
            continue;
        }
        const extname = path.extname(targetName);
        targetName = path.basename(targetName, extname);
        const loader = loaderByExtname[extname];
        if (!loader) {
            console.log(`Failed to load ${targetName} since no loader for [${extname}]`);
            continue;
        }
        try {
            o[targetName] = loader(targetPath);
        }
        catch (e) {
            console.log(`Loading config file [${targetPath}] error: ${e.message}]`);
        }
        files.push(targetName);
    }

    if (postfix) {
        for (let name in o) {
            if (!name.endsWith(postfix) || !o[name]) {
                continue;
            }
            const realName = name.slice(0, -postfix.length);
            o[realName] = o[realName] || {};
            _merge(o[realName], o[name]);
            delete o[name];
        }
    }

    return o;
}

