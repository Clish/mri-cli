/**
 * 读取各种文件信息
 */
const _fs = require('fs');
const _join = require('path').join;
const _chalk = require('chalk');
const _ = require('lodash');
const _fse = require('fs-extra');
const _shell = require('shelljs');
const _path = require('path');
const _program = require('commander');

const MC = require('./constant');
const $util = require('./util');
const $log = require('./log');
const $template = require('./template');

class Load {
    /**
     * 读取环境变量信息
     * ${project}.umi.js
     */
    env(task, project) {
        let umircPath = `${MC.PATH_PROJECTS}/${project}/${project}-umi.js`;

        $log.log([_chalk.grey(`! --> 从 ${umircPath} 获取配置信息`)]);

        let umirc = $util.loadjs(umircPath);
        let { mri } = umirc;

        let env = {
            PORT: 6000,
            BABEL_CACHE: 1,
            BROWSER: 1,
            // TSLINT: 'none',
            // ESLINT: 'none',
            MRI_DEVICE: 'pc',
            TS_CONFIG_PATHS_PLUGIN: 1,
            PROGRESS: 1,
            LAYOUT: 'ligation',
        };

        env = _.extend(env, mri);

        let { PROJECT } = env;

        if (PROJECT !== project) {
            $log.errorWrap([`- 项目匹配错误`, `- 当前待启动项目 ${project}`, `- 系统匹配项目 ${PROJECT}`]);
            process.exit(0);
        }

        if (_program['force']) {
            env.BABEL_CACHE = 1;
            env.BABEL_CACHE = 'none';
        }

        if (_program.noprogress) {
            env.PROGRESS = 'none';
        }

        // todo mri dev --options 判断

        let envArr = [];

        _.each(env, (value, name) => {
            if (!_.isNil(value)) {
                envArr.push(`${name}=${value}`);
            }
        });

        return {
            env: envArr.join(' '),
            config: env,
        };
    }

    /**
     * 读取MRI配置文件信息
     * 包管理
     */
    mrirc() {
        let path = MC.PATH_MRIRC;
        if ($util.existPath(path)) {
            return $util.loadjs(MC.PATH_MRIRC);
        }
        return {};
    }
}

let $load = new Load();

module.exports = $load;
