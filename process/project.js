/**
 * 项目启动流程
 */
const _program = require('commander');
const _chalk = require('chalk');
const _shell = require('shelljs');
const _loading =  require('loading-cli');
const { log, error, debug } = console;
const { green, red, yellow, grey } = _chalk;

const $command = require('../service/command');
const $Bus = require('../service/bus');

module.exports = (MRIEnv) => {
    let startMap = {
        dev: 'dev',
        test: 'build',
        prod: 'build',
    };

    let start = startMap[MRIEnv] || 'dev';

    /**
     * 配置command
     */
    $command(MRIEnv);

    let theme = _program.args[0];

    let { service } = _program;

    /**
     * 主题（项目）校验
     * - 判断 theme 是否存在
     * - 判断 version 是否存在
     *  |- {tag}_{version}
     *  |- release/theme/v{version} 是否创建
     */
    theme = $Bus.theme(theme, MRIEnv);

    /**
     * 生成umi约定式路由文件
     * src/pages
     */
    $Bus.pages(theme, MRIEnv);

    /**
     * 生成mri关联的文件
     */
    $Bus.mrifile(theme, MRIEnv);

    /**
     * 获得环境变量
     */
    let env = $Bus.env(theme, MRIEnv);

    log(`\n\n---=> 正在启动主题 => ${green(theme)}`);

    _shell.exec(`
        _cross=./node_modules/.bin/cross-env
        _umi=./node_modules/.bin/umi
        echo develop env ${MRIEnv}
        echo "umi environment variable ::=> ${env}"
        $_cross MRI_ENV=${MRIEnv} ${env} $_umi ${start} 
    `);
};
