const _chalk = require('chalk');
const _ = require('lodash');

const $util = require('../lib/common/util');

class Log {
    log(msg) {
        msg = $util.upArray(msg);
        console.log(msg.join('\n'));
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

    notice(msg) {
        msg = $util.upArray(msg);
        console.log(_chalk.green(msg.join('\n')));
    }

    debug(msg) {
        msg = $util.upArray(msg);
        console.log(_chalk.cyan(msg.join('\n')));
    }

    template(params = {}, templatePath, color = 'cyan') {
        const $template = require('./template');
        let txt = $template.render(params, templatePath);
        console.log(_chalk[color](txt));
    }
}

const $log = new Log();

module.exports = $log;
