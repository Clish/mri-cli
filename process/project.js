/**
 * 项目启动流程
 */
const _program = require('commander');
const _chalk = require('chalk');
const _shell = require('shelljs');
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

    /**
     * 所有的命令均要在在根目录上运行
     */

    const root = $Bus.inRoot();

    /**
     * 主题（项目）校验
     */
    const theme = _program.args[0];

    $Bus.theme(theme);

    /**
     * fetch 代码
     * 更新 .mrirc.js 文件
     */
    $Bus.fetch();

    /**
     * 判断是否要升级系统
     */
    $Bus.mriUpdate();

    /**
     * 校验是否要安装包
     */
    $Bus.install();

    /**
     * 生成umi约定式路由文件
     * src/pages
     */
    $Bus.pages(theme, MRIEnv);

    /**
     * 生成mri关联的手机
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
