const _chalk = require('chalk');
const _program = require('commander');

const $util = require('./util');
const $log = require('./log');
const $install = require('./package-install');
const $upgrade = require('./mri-version-upgrade');

class Run {
    /**
     * 在根目录下执行代码
     */
    root(func) {
        $log.notice(`:::-=> 正在检测执行路径`);
        if ($util.judgeRoot()) {
            func && func();
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

        if(noInstall) {
            return func();
        }

        $install.install(func);
    }

    // 版本更新
    upgrade(func) {
        $log.notice(`:::-=> 正在检测MRI版本更新`);
        $upgrade.upgrade(func);
    }

    // 分支限制
    branch(type, func) {

    }
}

const $run = new Run();

module.exports = $run;
