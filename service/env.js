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

module.exports = function env(theme, mri_env) {

    let path = `./src/theme/${theme}/${theme}-umi.js`;

    // 默认配置
    let def = {
        PORT: 6000,
        HARD_SOURCE: 1,
        BABEL_CACHE: 1,
        BROWSER: 'none',
        PUBLIC_PATH: void 0,
        BASE_URL: void 0,
        TSLINT: 'none',
        ESLINT: 'none',
        MRI_DEVICE: 'pc'
    };

    let mri;

    if(_fs.existsSync(path)) {
        log(`${grey(`!!! 从 ${path} 读取环境变量 `)}`);
        let info = _fs.readFileSync(path, 'utf-8');
        info = eval(info) || {};
        mri = info.mri || {};
        let envConfig = _.pick(mri, ['test', 'prod']);
        mri = _.omit(mri, ['test', 'prod']);
        mri = Object.assign(mri, envConfig[mri_env] || {});
    }

    let {PORT, HARD_SOURCE, BROWSER, BABEL_CACHE, PUBLIC_PATH, BASE_URL, TSLINT, ESLINT} = _program;

    let self = {PORT, HARD_SOURCE, BROWSER, BABEL_CACHE, PUBLIC_PATH, BASE_URL, TSLINT, ESLINT};

    self = _.omitBy(self, _.isNil);
    def = _.omitBy(def, _.isNil);
    mri = _.omitBy(mri, _.isNil);

    let config = Object.assign(def, mri, self);

    if(theme !== config.theme) {
        error(red('主题信息错误'), theme, config.theme);
        return void 0;
    }

    // log(`\n\n---=> 读取环境变量`);

    log(`${('::: 运行环境 => ')} ${mri_env} (不可更改)`);
    log(`${('::: 主题 => ')} ${config.theme}`);

    log(config);

    let env_ = [];
    _.each(config, (value, key) => {
        if(key !== 'theme' && value !== 'default') {
            env_.push(`${key}=${value}`);
        }
    });

    let env = `THEME=${theme} TS_CONFIG_PATHS_PLUGIN=1 ${env_.join(' ')}`;

    return {
        env,
        config
    };
};
