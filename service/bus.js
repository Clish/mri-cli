const _ = require('lodash');
const _shell = require('shelljs');
const _chalk = require('chalk');
const _path = require('path');
const _fs = require('fs');
const _program = require('commander');
const _loading =  require('loading-cli');
const _spawn = require('cross-spawn');

const $MriVersion = require('./mri-version-upgrade');
const $root = require('./root');
const $pages = require('./pages');
const $initThemeRoot = require('./theme-root');
const $env = require('./env');
const $util = require('./util');
const $Upgrade = require('./package-install');
const $log = require('./log');
const $gco = require('../process/gco');

class Bus {
    get root() {
        return $root.getRoot();
    }

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

            const rootPath = this.root;

            console.log(`
                cd ${rootPath}
            `);

            process.exit(0);
        }
    }

    setBranch() {
        let branch = $util.getBranch();
        $gco.record(branch);
    }

    /**
     * 自动fetch代码
     * - 覆盖当前配置
     * - 自动执行部分代码
     */
    fetch() {
        console.log(_chalk.green`:::-=> 正在获取MRI配置文件 --`);
        let loaded = _loading('abcd').start();
        console.debug('o)o', 0);
        _shell.exec(`
            git fetch -u origin mri-common:mri-common
            git checkout mri-common -- .mrirc.js
            git rm --cache  .mrirc.js > /dev/null
        `);
        console.debug('o)o', 1);
        loaded.stop();
    }

    /**
     * 主题（项目）校验
     * - 判断 theme 是否存在
     * - 判断 version 是否存在
     *  |- {tag}_{version}
     *  |- release/theme/v{version} 是否创建
     */
    theme(theme, env) {
        if (!theme) {
            let branch = $util.getBranch();
            let themes = $util.getThemes();
            let ins = _.intersection(themes, branch.split('/'));
            if (ins && ins.length === 1) {
                [theme] = ins;
            }
        }

        let status = true;

        if (!theme) {
            status = false;
        } else {
            let themePath = _path.join(process.cwd(), `./src/theme/${theme}`);
            status = _fs.existsSync(themePath);
        }

        if (!status) {
            $log.error([
                `- 当前输入的theme -=> ${theme || ''}, 错误或未创建`,
                `- 请检查`,
                `- 或输入, 下列命令，创建theme \n`,
                _chalk.white(`  mri theme ${theme || 'themeName'} \n`),
            ]);

            $root.printThemes();
            process.exit(0);
        } else {
            $log.log([
                '----------------------------------',
                `- theme start -=> ${theme}`,
                `- theme env -=> ${env}`,
                `----------------------------------`]
            );
            return theme;
        }
    }

    /**
     * 生成UMI约定式路由文件
     */
    pages(theme, env) {
        if (!$pages(theme, env)) {
            console.error(red(`\n    路由文件写入失败 \n    请查看src/theme/${theme}/${theme}-routes.ts文件是否正确`));
            process.exit(0);
        }

        // 写入HTML模板文件 document.ejs
        let htmlTemplatePath = _path.join(__dirname, '../template/project/pages/document.ejs');
        _shell.exec(`cp ${htmlTemplatePath} ${this.root}/src/pages`);
    }

    /**
     * 生成MRI系统需要的相关文件
     */
    mrifile(theme, env) {
        _spawn($util.mri(), ['interface', '-i']);
        _spawn($util.mri(), ['index']);
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
                lsof -i :${config.PORT}|grep node|awk '{print $2}'| grep -v PID | xargs kill -9
            `);

            env = env.replace('BABEL_CACHE=1', 'BABEL_CACHE=none');
        }

        return env;
    }
}

module.exports = new Bus();
