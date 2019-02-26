const _chalk = require('chalk');
const _ = require('lodash');

const $util = require('./util');

class Log {
    title(msg) {
        console.log(_chalk.magenta(`-ooO ${msg} Ooo-`));
    }

    log(msg) {
        msg = $util.upArray(msg);
        console.log(_chalk.green(msg.join('\n')));
    }

    logWrap(msg) {
        msg = $util.upArray(msg);
        console.log('----------------------------------------------');
        _.each(msg, (message) => console.log(message));
        console.log('----------------------------------------------');
    }

    error(msg) {
        console.log(_chalk.red(msg.join('\n')));
    }

    errorWrap(msg) {
        msg = $util.upArray(msg);
        console.error(_chalk.red('----------------------------------------------'));
        _.each(msg, (message) => console.error(message));
        console.error(_chalk.red('----------------------------------------------'));
    }

    warn(msg) {
        msg = $util.upArray(msg);
        console.log(_chalk.yellow(msg.join('\n')));
    }

    warnWrap(msg) {
        msg = $util.upArray(msg);
        console.error(_chalk.yellow('----------------------------------------------'));
        _.each(msg, (message) => console.warn(message));
        console.error(_chalk.yellow('----------------------------------------------'));
    }

    notice(msg) {
        msg = $util.upArray(msg);
        console.log(_chalk.green(msg.join('\n')));
    }

    noticeWrap(msg) {
        msg = $util.upArray(msg);
        console.log(_chalk.green('----------------------------------------------'));
        _.each(msg, (message) => console.log(message));
        console.log(_chalk.green('----------------------------------------------'));
    }

    debug(msg) {
        msg = $util.upArray(msg);
        console.log(_chalk.cyan(msg.join('\n')));
    }

    template(params = {}, templatePath, color = 'cyan') {
        const $template = require('../../service/template');
        let txt = $template.render(params, templatePath);
        console.log(_chalk[color](txt));
    }
}

const $log = new Log();

module.exports = $log;
