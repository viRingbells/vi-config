import * as path from 'path';
import * as config from '../dist/main';
config.init({
    root: path.resolve(__dirname, 'config')
});

console.log(config.get('foo.bar') + ' ' + config.get('foo.baz')); // Got 'Hello World'
