const _util = require('./util');
const _fs = require('fs');
const _fse = require('fs-extra');
const _ = require('lodash');
const _chalk = require('chalk');
const _path = require('path');
const _ejs = require('ejs');
const _upperCamelCase = require('simple-uppercamelcase');
const _program = require('commander');
const {log, error, debug} = console;
const {green, red, yellow, grey} = _chalk;

/**
 * 该页用来创建 theme/index.ts 文件
 * 避免使用 require.expression (动态路径)，引入资源文件，导致所有的模块都被打包
 * @param theme
 */
module.exports = function insertThemeIndex(theme) {
    // console.log(process.cwd());
    // console.log(_upperCamelCase('one-loreal'));

    let temp = String(_fs.readFileSync(_path.join(__dirname, '../template/theme-index.ejs'), 'utf-8'));
    let path = _path.join(process.cwd(), 'src/theme/index.ts');
    temp = _ejs.render(temp, {theme});
    _fse.outputFileSync(path, temp);
};