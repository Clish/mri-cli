const _ = require('lodash');
const _shell = require('shelljs');
const _chalk = require('chalk');
const _path = require('path');
const _fs = require('fs');
const _program = require('commander');
const _spawn = require('cross-spawn');

const $MriVersion = require('./mri-version');
const $root = require('./root');
const $pages = require('./pages');
const $initThemeRoot = require('./theme-root');
const $env = require('./env');
const $util = require('./util');
const $Upgrade = require('./upgrade');

class Bus {
    /**
     * 判断当前目录在不在根目录下
     * - 绝大部分命令需要在根目录下运行
     * - 减少程序的复杂性
     */
    inRoot() {
        console.log(_chalk.green`:::-=> 判断当前是否在根目录`);

        if (!$root.judgeRoot()) {
            console.log(_chalk.red`
    当前目录不是MRI项目的根目录
    请切换到根目录后重新执行命令`);

            const rootPath = $root.getRoot();

            console.log(`
                cd ${rootPath}
            `);

            process.exit(0);
        }
    }

    /**
     * 自动fetch代码
     * - 覆盖当前配置
     * - 自动执行部分代码
     */
    fetch() {
        console.log(_chalk.green`:::-=> 正在获取MRI配置文件`);
        _shell.exec(`
            git fetch -u origin mri-common:mri-common
            git checkout mri-common -- .mrirc.js
            git rm --cache  .mrirc.js > /dev/null
        `);
    }

    /**
     * theme是否存在
     * - 是否输入
     * - 是否存在
     */
    theme(theme) {
        console.log(_chalk.green`:::-=> 正在检测theme`);
        let status = true;

        if (!theme) {
            status = false;
        } else {
            let themePath = _path.join(process.cwd(), `./src/theme/${theme}`);
            status = _fs.existsSync(themePath);
        }

        if (!status) {
            console.log(
                _chalk.red(
                    `
    当前输入的theme(${theme})不存在
    请检查重新输入`,
                    _chalk.white(`\n\n    或输入\n    mri theme ${theme || 'themeName'} \n    创建theme`),
                ),
            );

            $root.printThemes();

            process.exit(0);
        }
    }

    /**
     * 升级MRI version
     */
    mriUpdate() {
        // todo
        // 判断分支， test, master 分支不升级version
        // test, master 应该通过 merge request 来升级版本

        console.log(_chalk.green`:::-=> 正在检测是否升级MRI版本`);

        $MriVersion.init((isUpdate, updateVersion) => {
            if (isUpdate) {
                let updateBranch = `release/mri/v${updateVersion}`;

                let update = _shell.exec(`
                    git add . && git commit -am 'ready update MRI@${updateVersion}'
                    echo '升级当前MRI版本 -> ${updateBranch}'
                    git merge ${updateBranch}
                `);

                if (update.code !== 0) {

                    $util.mri('index');

                    _shell.exit(1);

                    console.log(_chalk.red`
                        升级到MRI@${updateVersion}失败
                        -----------------------------
                        请手动解决冲突
                    `);

                    process.exit(0);
                }
            }
        });
    }

    /**
     * 判断是否安装包
     */
    install() {
        console.log(_chalk.green`:::-=> 正在检测是否安装相关包`);
        const _program = require('commander');
        const rcPath = _path.join(process.cwd(), './.mrirc.js');
        if (_program['notInstall'] || !_fs.existsSync(rcPath)) {
            return void 0;
        }

        $Upgrade.install(rcPath);
    }

    /**
     * 生成UMI约定式路由文件
     */
    pages(theme, env) {
        if (!$pages(theme, env)) {
            console.error(red(`\n    路由文件写入失败 \n    请查看src/theme/${theme}/${theme}-routes.ts文件是否正确`));
            process.exit(0);
        }
    }

    /**
     * 生成MRI系统需要的相关文件
     */
    mrifile(theme, env) {
        $util.mri(['interface', '-i'], 'async');
        $util.mri(['index'], 'async');
        $initThemeRoot(theme, env);
    }

    /**
     * 环境变量的计算和配置
     */
    env(theme, ENV) {
        let { env, config } = $env(theme, ENV);

        if (_.isNil(env)) {
            return void 0;
        }

        if (_program['force']) {
            _shell.exec(`
                rm -rf node_modules/.cache
                lsof -i :${config.PORT}|grep node|awk '{print $2}'|grep -v PID|xargs kill -9
            `);

            env = env.replace('BABEL_CACHE=1', 'BABEL_CACHE=none');
        }

        return env;
    }
}

module.exports = new Bus();