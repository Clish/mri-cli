const _program = require('commander');
const _shell = require('shelljs');
const _chalk = require('chalk');
const _path = require('path');
const _fs = require('fs');
const _fse = require('fs-extra');
const _ = require('lodash');

const $util = require('../common/util');
const $log = require('../common/log');
const $run = require('../common/run');
const $git = require('../common/git');
const $mritemp = require('../common/mritemp');
const $template = require('../common/template');
const $project = require('./project/project');

class Branch {
    /**
     * patch 项目版本信息
     * @param model: 'release' | 'hotfix' | 'feature'
     * @param func
     */
    getPatch(project, model, func) {
        let taskMap = {
            release: _program.xVersion ? 'x' : 'y',
            hotfix: 'z',
        };

        let projectVersion = _program.args[0];
        let { force } = _program;
        let project_, targetVersion;

        if (projectVersion) {
            [project_, targetVersion] = projectVersion.split('::');
        }

        project = project_ || project;

        if (!project) {
            project = $git.getProjectWithBranch();
        }

        if (!project) {
            $log.errorWrap([
                `- project name 项目名称为空`,
                `- project name 请使用下面命令生成 release`,
                `- mri git ${model} {:project}::{:version}`,
                ``,
                `如：mri git ${model} social::1.0.1`,
            ]);

            $project.showProjects();

            process.exit(0);
        }

        if (!($project.existProject(project) || force)) {
            $log.errorWrap([
                `- project::${project} 未创建 `,
                `- 若需要创建该项目的分支，请使用force模式`,
                ``,
                `如：mri git ${model} ${project}::0.1.0 --force`,
            ]);

            $project.showProjects();

            process.exit(0);
        }

        let version = $git.getProjectPatchVersion(project, taskMap[model], targetVersion);

        if (!version.target) {
            $log.errorWrap([
                `- 待建项目${project}_v${targetVersion} 版本太低, 当前版本 v${version.current}`,
                `- 或命名规则错误`,
                `- 请遵从x.y.z版本创建规范`,
            ]);
            process.exit(0);
        }

        func && func(model, project, version);
    }

    /**
     * 创建分支
     * @param model
     * @param project
     * @param version
     */
    create(model, project, version) {
        let branch = `${model}/${project}/v${version}`;
        let stdio = _shell.exec(`
            git checkout master 1>/dev/null 2>&1
            git pull origin master 1>/dev/null 2>&1
            git checkout -b ${branch}
            git push origin ${branch}
            git branch --set-upstream-to=origin/${branch} ${branch}
        `);

        $mritemp.branches(branch);

        if (!stdio.code) {
            $log.logWrap([`- ${branch} 已创建完毕`, `- 注：该分支从master检出创建`]);
        } else {
            $log.errorWrap([`- 创建${model}分支失败, 请检查`]);
        }
    }

    /**
     * 创建拷贝分支
     */
    createCopyBranch(force = false, target = 'test') {
        /**
         * 获得当前分支
         * 判断分支所对应的环境为 dev
         * 切换至欲解决冲突的分支（master, test）
         * 生成解决冲突的分支
         * merge 源分支
         * 提醒用户解决分支
         */
        let branch = $git.getCurrentBranch();
        let info = $git.analyzerBranch(branch);

        let { env, model, project, version } = info;

        if (env !== 'dev') {
            $log.errorWrap([
                `- 当前分支 ooO ${branch} Ooo 不是命令 mri git conflict 的工作分支`,
                `- 请切换分支模式为 release 或 hotfix 下进行操作`,
            ]);
            process.exit(0);
        }

        let copyBranch = `copy-${target}/${model}/${project}/v${version}`;

        if ($git.hasBranch(copyBranch, 'all')) {
            if (!force) {
                $log.errorWrap([
                    `- 当前分支副本 ooO ${copyBranch} Ooo 已存在`,
                    `- 若远程分支未删除，请通知管理员删除`,
                    `- 或使用强力模式重建副本 mri git conflict --force`,
                ]);
                process.exit(0);
            }

            this.removeCopyBranch(copyBranch, target);
        }

        $run.gco(target, () => {
            $log.noticeWrap([
                `解决冲突conflict的基本步骤如下：`,
                `- 基于${target}分支的最新代码创建临时副本 checkout -b ${copyBranch}`,
                `- 在临时副本${copyBranch}中 merge 分支 ${branch}`,
                `- 在临时副本${copyBranch}中, 产生的冲突，请手动解决`,
                `- 解决冲突的临时副本${copyBranch}，提交到远程origin`,
                `- 在远程代码库 merge request ${copyBranch} 到 ${branch}`,
                `- 成功merge代码后，请删除临时副本分支`,
                _chalk.green`* - 千万别将 copy test 分支 merge 到 master`,
            ]);

            $util.execSilent(`
                git checkout -b ${copyBranch}
                git push origin ${copyBranch}:${copyBranch}
                git branch --set-upstream-to=origin/${copyBranch} ${copyBranch}
            `);

            _shell.exec(`git merge ${branch}`);
        });
    }

    /**
     * 删除副本
     */
    removeCopyBranch(branch, target = 'master') {
        branch = branch || $git.getCurrentBranch();
        let info = $git.analyzerBranch(branch);
        let { env, model, project, version } = info;

        console.debug(info);

        if (env !== 'copy') {
            $log.errorWrap([
                `- 当前分支 ooO ${branch} Ooo 不是副本分支(copy)`,
                `- mri git conflict --remove 命令失效`
            ]);
            process.exit(0);
        }

        $run.gco(target, () => {
            if ($git.hasBranch(branch, 'local')) {
                _shell.exec(`
                    git branch -D ${branch}
                `);
            }

            if ($git.hasBranch(branch, 'remote')) {
                _shell.exec(`
                    git push origin :${branch}
                `);
            }
        });
    }
}

let $branch = new Branch();

module.exports = $branch;
