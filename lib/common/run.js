const _chalk = require('chalk');
const _program = require('commander');
const _shell = require('shelljs');
const _loading = require('loading-cli');

const $util = require('./util');
const $log = require('./log');
const $git = require('./git');
const $install = require('../../service/package-install');
const $upgrade = require('../../service/mri-version-upgrade');
const $gco = require('../services/gco');
const $tuning = require('../services/tuning/tuning');
const $load = require('./load');

class Run {
    /**
     * 在根目录下执行代码
     */
    root(func = _.noop) {
        // $log.notice(`:::-=> 正在检测执行路径`);
        if ($util.judgeRoot()) {
            func();
        } else {
            const path = $util.getRoot();
            $log.errorWrap([
                `MRI命令只能在MRI项目的根目录下有效`,
                `请切换到项目根目录进行操作`,
                path ? _chalk.white(`\n  cd ${path}\n`) : '',
                `或确认当前项目是否为MRI项目`,
                `判断MRI项目依据有项目的根目录下拥有.mrirc.js文件`,
            ]);

            process.exit(1);
        }
    }

    /**
     * mri dev/build 初始化配置
     * @param func
     */
    init(func = _.noop) {
        /**
         * package.json.ejs 文件的管理
         */
        $tuning.pkg();
        func();
    }

    /**
     * 更新mri配置信息
     * @param func
     */
    mri(func = _.noop) {
        $log.notice(`:::-=> 正在检测MRI配置`);

        let config = $load.getMriRC();

        if (config.model === 'single') {
            func && func();
            return false;
        }

        func && func();

        // @update 移除预载读取mriadmin.js
        // const load = _loading('').start();
        //
        // // 避免超时
        // let tid = setTimeout(() => {
        //     load.stop();
        //     func && func();
        // }, 15 * 1000);
        //
        // let child = _shell.exec(
        //     `
        //         git fetch -u origin mri-common:mri-common 1>/dev/null 2>&1
        //         git checkout mri-common -- mriadmin.js 1>/dev/null 2>&1
        //         rm -rf .mriadmin.js 1>/dev/null 2>&1
        //         mv mriadmin.js .mriadmin.js 1>/dev/null 2>&1
        //         git rm --cache mriadmin.js 1>/dev/null 2>&1
        //     `,
        //     {
        //         async: true,
        //     },
        // );
        //
        // child.on('close', () => {
        //     clearTimeout(tid);
        //     load.stop();
        //     func && func();
        // });
    }

    /**
     * 包安装
     */
    package(func = _.noop) {
        $log.notice(`:::-=> 正在检测是否安装相关包`);
        let { noInstall } = _program;

        // 生成 package.json.ejs
        $tuning.pkg();

        if (noInstall) {
            return func();
        }

        $install.install();

        func();
    }

    // 版本更新
    upgrade(func = _.noop) {
        $log.notice(`:::-=> 正在检测MRI版本更新`);
        $upgrade.upgrade();
        func();
    }

    // 切换分支
    gco(branch, func = _.noop) {
        $gco.checkout(branch);
        func();
    }

    // 分支限制
    branch(type = 'all', func = _.noop) {
        let branch = $util.getBranch();
        let project = $git.getProjectWithBranch();

        let { service } = _program;

        switch (type) {
            case 'master':
                // 切换到master分支
                this.gco('master', () => func(project));
                break;
            case 'test':
                this.gco('test', () => func(project));
                break;
            case 'dev':
                func();
                break;
            case 'all':
                func();
                break;
        }
    }
}

const $run = new Run();

module.exports = $run;
