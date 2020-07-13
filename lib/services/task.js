const _fs = require('fs');
const _join = require('path').join;
const _chalk = require('chalk');
const _ = require('lodash');
const _fse = require('fs-extra');
const _shell = require('shelljs');
const _path = require('path');
const _program = require('commander');

const MC = require('../common/constant');
const $util = require('../common/util');
const $load = require('../common/load');
const $git = require('../common/git');
const $log = require('../common/log');
const $$tuning = require('../services/tuning/tuning');
const $$project = require('../services/project/project');

class Task {
    /**
     * reproject
     * 重计算project, 验证其合法性以及名称
     * @param project
     * @param type
     * @return {boolean}
     */
    reproject(project, type) {
        // 获取project名称
        project = project || $git.getProjectWithBranch();

        let { extPrefix } = $load.getMriRC();

        if (extPrefix) {
            project = project.replace(new RegExp(`^${extPrefix}`), '');
        }

        // 判断project是否存在
        return $$project.existProject(project, type) ? project : false;
    }

    /**
     * 根据umi或其他启动包规则，准备项目
     * 生成符合环境的pages 等
     * @param task
     * @param project
     */
    ready(task, project) {
        /**
         * index.ts 文件和 interface 接口
         */
        $$tuning.createServiceIndex();

        // 占时关闭解析
        $$tuning.createConstIndex();

        /**
         * 按照 umi 的规则配置
         */
        $$tuning.umi(task, project);

        /**
         * 按照 mri 规则配置
         */
        $$tuning.mri(task, project);
    }

    /**
     * 环境变量配置
     * @param task
     * @param project
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
     * 执行
     */
    start(task, project) {
        let taskMap = {
            dev: 'dev',
            test: 'build',
            prod: 'build',
        };

        let { env, config } = this.env(task, project);

        if (_program['force']) {
            $util.execSilent(`
                rm -rf ./node_modules/.cache
                lsof -i :${config.PORT}|grep node|awk '{print $2}'| grep -v PID | xargs kill -9
            `);
        }

        $log.noticeWrap([`- 正在启动项目 ${project}`, `- 当前环境 ${task}`, `- 环境变量 ${env}`]);

        _shell.exec(`
            _cross=./node_modules/.bin/cross-env
            _umi=./node_modules/.bin/umi
            $_cross MRI_ENV=${task} ${env} $_umi ${taskMap[task]} 
        `);
    }

    /**
     * 执行task命令
     * @param tsak
     */
    run(task, project) {
        // 重计算project
        let proj = this.reproject(project, 'pure');

        if (!proj) {
            $log.errorWrap([
                project && `- 当前项目${project}不存在`,
                project && `- 或使用命令新建项目 mri project ${project}`,
                !project && `- 在非项目分支中, 需使用 mri ${task} <project> 来运行项目`,
                !project && `- 请使用命令运行项目 mri ${task} <project>`,
            ]);

            $$project.showProjects();

            process.exit(0);
        }

        // 依据umi规则，准备项目，生成pages等文件
        this.ready(task, proj);

        // 启动命令
        this.start(task, proj);
    }
}

let $task = new Task();

module.exports = $task;
