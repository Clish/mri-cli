const _chalk = require('chalk');
const _program = require('commander');
const _shell = require('shelljs');
const _loading = require('loading-cli');

const $util = require('./util');
const $log = require('./log');
const $install = require('./package-install');
const $upgrade = require('./mri-version-upgrade');

const load = _loading('').start();

class Run {
    /**
     * 在根目录下执行代码
     */
    root(func) {
        $log.notice(`:::-=> 正在检测执行路径`);

        if ($util.judgeRoot()) {

            $log.notice(`:::-=> 正在检测MRI配置`);

            // 避免超时
            let tid = setTimeout(() => {
                load.stop();
                func && func();
            }, 15 * 1000);

            let child = _shell.exec(
                `
                    git fetch -u origin mri-common:mri-common
                    git checkout mri-common -- .mrirc.js
                    git rm --cache  .mrirc.js > /dev/null
                `,
                {
                    async: true,
                },
            );

            child.on('close', () => {
                clearTimeout(tid);
                load.stop();
                func && func();
            });

        } else {
            $log.errorWrap([
                `当前不在根目录下，\n该命名只能在根目录下有效，\n请切换到项目根目录进行操作`,
                _chalk.white(`\n  cd ${$util.getRoot()}\n`),
            ]);
        }
    }

    /**
     * 包安装
     */
    package(func = _.noop) {
        $log.notice(`:::-=> 正在检测是否安装相关包`);
        let { noInstall } = _program;

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

    // 分支限制
    branch(type = 'all', func = _.noop) {
        switch (type) {
            case 'master':
                func();
                break;
            case 'test':
                func();
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
