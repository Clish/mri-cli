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
 * 该页用来创建 src/theme root 文件
 * 避免使用 require.expression (动态路径)，引入资源文件，导致所有的模块都被打包
 * @param theme
 * @param env
 */
module.exports = function initThemeRoot(theme, env) {
    // console.log(process.cwd());
    // console.log(_upperCamelCase('one-loreal'));

    /**
     * 创建 src/theme/index.ts 文件
     */

    let paths = [
        '../template/approot/.theme.ejs',
        '../template/approot/src/theme/config.mri.ts.ejs',
        '../template/approot/src/theme/route-guard.mri.ts.ejs',
        '../template/approot/src/theme/const-env.mri.ts.ejs',
        '../template/approot/src/theme/dva.mri.ts.ejs',
        '../template/approot/src/theme/preload.mri.ts.ejs',
        '../template/approot/src/theme/preset.mri.ts.ejs',
    ];

    _.each(paths, (path) => {
        let path_ = path.replace(/(\.ejs)$/, '').replace('../template/approot', '.');

        let temp = String(_fs.readFileSync(_path.join(__dirname, path), 'utf-8'));
        let path__ = _path.join(process.cwd(), path_);
        temp = _ejs.render(temp, {theme, env});
        _fse.outputFileSync(path__, temp);

        log(green('::: theme root 文件生成 =>'), path__);
    });

    log('---=> theme root 文件写入完成');
};