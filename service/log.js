const _chalk = require('chalk');

class Log {
    log(msg) {
        let args = typeof msg === 'string' ? [...arguments] : [...msg];
        console.log(args.join('\n'));
    }

    error(msg) {
        let args = typeof msg === 'string' ? [...arguments] : [...msg];
        console.log(_chalk.red(args.join('\n')));
    }

    warn(msg) {
        let args = typeof msg === 'string' ? [...arguments] : [...msg];
        console.log(_chalk.yellow(args.join('\n')));
    }

    notice(msg) {
        let args = typeof msg === 'string' ? [...arguments] : [...msg];
        console.log(_chalk.green(args.join('\n')));
    }

    debug(msg) {
        let args = typeof msg === 'string' ? [...arguments] : [...msg];
        console.log(_chalk.cyan(args.join('\n')));
    }

    template(params = {}, templatePath, color = 'cyan') {
        const $template = require('./template');
        let txt = $template.render(params, templatePath);
        console.log(_chalk[color](txt));
    }
}

const $log = new Log();

module.exports = $log;
