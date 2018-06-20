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
        .usage('${theme} [options]')
        .description('运行MRI的开发环境')
        .description('更多的环境变量\n  参考 https://umijs.org/guide/env-variables.html\n  在src/theme/${theme}/${theme}-config.js 中进行配置')
        .version('0.0.8')
        .option('-hs, --HARD_SOURCE', '是否开启Hard Source模式')

        .option('-bc, --BABEL_CACHE', '是否使用BabelCache模式')
        .option('-pp, --PUBLIC_PATH', '二级目录')
        .option('-bu, --BASE_URL', 'route目录');

    if(env === 'dev') {
        _program
            .option('-p, --PORT [port]', 'server port')
            .option('-bs, --BROWSER', '是否默认打开浏览器');
    }

    _program.parse(process.argv);
};
