/**
 * 合并多方的环境变量信息
 * 最终生成该项目的环境变量信息
 *
 * 默认 < config.js 配置 < 启动命令设置的环境变量
 */

const _util = require('./util');
const _fs = require('fs');
const _fse = require('fs-extra');
const _ = require('lodash');
const _chalk = require('chalk');
const _path = require('path');
const _program = require('commander');
const {log, error, debug} = console;
const {green, red, yellow, grey} = _chalk;

module.exports = function command(env) {
    _program
        .usage('theme [options]')
        .description('运行MRI的开发环境')
        .version('0.0.1')
        .option('-hs, --HARD_SOURCE', '是否开启Hard Source模式')

        .option('-bc, --BABEL_CACHE', '是否使用BabelCache模式')
        .option('-pb, --PUBLIC', '二级目录 (若需要更复杂的配置，直接在 ${theme}/mri.js中配置)');

    if(env === 'dev') {
        _program.option('-p, --PORT [port]', 'server port')
            .option('-bs, --BROWSER', '是否默认打开浏览器');
    }

    _program.parse(process.argv);
};
