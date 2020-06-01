const _fs = require('fs');
const _join = require('path').join;
const _chalk = require('chalk');
const _ = require('lodash');
const _fse = require('fs-extra');
const _shell = require('shelljs');
const _path = require('path');
const _program = require('commander');
const _compareVersion = require('compare-versions');

const MC = require('./constant');
const $util = require('./util');
const $log = require('./log');
const $template = require('./template');

/**
 * 对 git 的一些操作
 */
class Git {
    /**
     * 从branch获得各种信息
     * @param branch
     */
    analyzerBranch(branch) {
        /**
         * mri git-branch 组成
         *
         * {:copy}{/:model}{/:project}{/:version}
         *
         * model: 分支模型（master | test | release | hotfix）
         * project: mri 项目名称
         * version: project version
         * env: 分支所对应的环境
         */

        let copy, model, project, version;

        let infos = branch.split('/');

        switch (infos.length) {
            case 1:
                [model] = infos;
                break;
            case 2:
                [copy, project] = infos;
                break;
            case 3:
                [model, project, version] = infos;
                break;
            case 4:
                [copy, model, project, version] = infos;
                break;
        }

        if (version) {
            version = version.replace(/^v/, '');
        }

        let isCopy = !!copy;

        let env = model === 'master' ? 'prod' : model === 'test' ? 'test' : isCopy ? 'copy' : 'dev';

        return {
            model,
            project,
            version,
            env,
            copy: isCopy,
        };
    }

    checkout(branch, pushRemote = true, setting = _program) {
        let status = this.statusChanges();

        if (!status) {
            return false;
        }

        if ($git.getCurrentBranch() === branch) {
            return true;
        }

        $log.warn(`\n- 即将切换到分支: ${branch}\n`);

        let { local, remote, all } = this.hasBranch(branch);
        let { force } = setting;

        if (local && remote) {
            _shell.exec(`
                git checkout ${branch}
                git pull origin ${branch}
            `);
        } else if (remote && !local) {
            _shell.exec(`
                git checkout ${branch}
                git branch --set-upstream-to=origin/${branch} ${branch}
                git pull origin ${branch}
            `);
        } else if (!remote && local) {
            _shell.exec(`
                git checkout ${branch}
                ${pushRemote ? 'git push origin ${branch}' : ''}
                ${pushRemote ? 'git branch --set-upstream-to=origin/${branch} ${branch}' : ''}
            `);
        } else if (force) {
            _shell.exec(`
                git checkout -b ${branch}
                ${pushRemote ? 'git push --set-upstream origin ${branch}' : ''}
            `);
        } else {
            // todo 提醒是否在当前分支下 checkout 新的分支
            $log.errorWrap([`- 待切换分支oOO ${branch} OOo不存在`, `- 使用下面命令创建分支`, `- mri gco ${branch} --force`]);
            return false;
        }

        return true;
    }

    /**
     * 判断branch是否创建
     * @param branch
     * @param where branch 所在位置
     */
    hasBranch(branch, where) {
        let status = (command) => {
            return !$util.execSilent(command).code;
        };

        let commandMap = {
            local: `git branch -l | grep -e '^[\\* ]\\s*\\(remotes/origin/\\)\\{0,1\\}${branch}$'`,
            remote: `git branch -r | grep -e '^\\s*\\(origin/\\)\\{0,1\\}${branch}$'`,
            all: `git branch -a | grep -e '^[\\* ]\\s*\\(remotes/origin/\\)\\{0,1\\}${branch}$'`,
        };
        return where
            ? status(commandMap[where])
            : {
                  local: status(commandMap['local']),
                  remote: status(commandMap['remote']),
                  all: status(commandMap['all']),
              };
    }

    /**
     * 获取当前所在分支
     */
    getCurrentBranch() {
        let currentBranch = _shell.exec(`git branch | grep "*" | cut -c 3-`, { silent: true });
        currentBranch = currentBranch.replace('\n', '');
        currentBranch = _.trim(currentBranch);
        return currentBranch;
    }

    /**
     * 从 branch 获得当前的 project name
     * @implements this.getCurrentBranch
     */
    getProjectWithBranch() {
        let branch = this.getCurrentBranch();
        let [task, project, version] = branch.split('/');
        project = _.trim(project);
        return project;
    }

    /**
     * 获得当前项目的 tag 最近的一次版本号
     * @param project
     * @return {string}
     */
    getProjectVersionWithTag(project) {
        this.prune();

        let result =
            $util.execSilent(`
                
                git tag --list | grep -e '^\\s\\{0,\\}${project}_v'
            `) || '';

        let version = result.split('\n');

        version = _.map(version, (tag) => {
            tag = _.trim(tag);
            tag = tag.replace(new RegExp(`^${project}_v(.*)$`, 'g'), '$1');

            tag = tag.replace(/^([0-9.]+?)[^0-9.].*/g, '$1');

            tag = tag || '0.0.1';
            return tag;
        });

        version.sort((a, b) => {
            return -_compareVersion(a, b);
        });

        return version[0];
    }

    /**
     * 获得最新的branch中所设定的版本号
     * @param project
     * @return {any}
     */
    getProjectVersionWithBranch(project) {
        this.prune();

        let result =
            $util.execSilent(`
                git branch -a | grep -e '^.*/${project}/'
            `) || '';

        let branches = result.split('\n');

        let versions = _.map(branches, (branch) => {
            branch = _.trim(branch);
            let version = branch.replace(new RegExp(`^.*/${project}/v(.*)$`, 'g'), '$1');
            version = version || '0.0.1';
            if (!/^\d{1,}\.\d{1,}\.\d{1,}$/.test(version)) {
                version = '0.0.1';
            }
            return version;
        });

        versions.sort((a, b) => {
            return -_compareVersion(a, b);
        });

        return versions[0];
    }

    /**
     * 获得当前项目的版本号
     * @param project
     * @return {*}
     */
    getProjectVersion(project) {
        let tagVersion = this.getProjectVersionWithTag(project) || '0.0.0';
        let branchVersion = this.getProjectVersionWithBranch(project) || '0.0.0';
        return _compareVersion(tagVersion, branchVersion) > -1 ? tagVersion : branchVersion;
    }

    /**
     * 根据不同规则，获得项目的下个版本号
     * @param project
     * @param versionType
     * @return {string}
     */
    getProjectPatchVersion(project, versionType, targetVersion) {
        let version = this.getProjectVersion(project);
        if (targetVersion) {
            // 验证 targetVersion 是否合法
            // targetVersion > version
            // targetVersion 符合 versionType 规则
            let vaild = true;
            if (_compareVersion(targetVersion, version) > 0) {
                let [x, y, z] = targetVersion.split('.');
                x = parseInt(x);
                y = parseInt(y);
                z = parseInt(z);

                switch (versionType) {
                    case 'x':
                        vaild = y === 0 && z === 0;
                        break;
                    case 'y':
                        vaild = y !== 0 && z === 0;
                        break;
                    case 'z':
                        vaild = z !== 0;
                        break;
                }
            } else {
                vaild = false;
            }
            return {
                current: version,
                target: vaild ? targetVersion : false,
            };
        } else {
            return {
                current: version,
                target: this.patchVersion(version, versionType),
            };
        }
    }

    /**
     * 获取版本的patch version
     * @param version
     * @param versionType
     * @return {string}
     */
    patchVersion(version, versionType) {
        let [x, y, z] = version.split('.');

        x = parseInt(x);
        y = parseInt(y);
        z = parseInt(z);

        switch (versionType) {
            case 'x':
                x = x + 1;
                y = 0;
                z = 0;
                break;
            case 'y':
                y += 1;
                z = 0;
                break;
            case 'z':
                z += 1;
                break;
        }

        return [x, y, z].join('.');
    }

    /**
     * 获得git最新信息
     * 同步 git tag 以及 branch
     */
    prune() {
        _shell.exec(`
            git remote update origin --prune 1>/dev/null 2>&1
        `);
    }

    /**
     *
     */
    statusChanges(evt = _program) {
        // 隐藏通知
        let { stash, commit, push, message, hideNotice } = evt;
        let branch = $git.getCurrentBranch();

        if (push) {
            stash = commit = false;
        }

        if (commit) {
            stash = false;
        }

        $util.execSilent(`git pull 1>/dev/null 2>&1`);

        let stat = $util.execSilent(`
            git status | grep 'Changes to be committed'
        `);

        let stat2 = $util.execSilent(`
            git status | grep 'Untracked files'
        `);

        if (!stat.code || !stat2) {
            if (push) {
                _shell.exec(`
                    git add .
                    git commit -am '${this.trueTxt(message, `switch branch to ${branch}`)}'
                    git push
                `);
            } else if (commit) {
                _shell.exec(`
                    git add .
                    git commit -am '${this.trueTxt(message, `switch branch to ${branch}`)}'
                `);
            } else {
                $log.errorWrap([
                    `- 本地有文件未提交(commit)`,
                    hideNotice || `- 配置参数提交或推送文件`,
                    hideNotice || `- --commit [commit comment] 将文件提交到本地(local)`,
                    hideNotice || `- --push [commit comment] 将文件推送到远程(remote)`,
                ]);

                _shell.exec('git status');

                return false;
            }
        }

        stat = $util.execSilent(`
            git status | grep 'Changes not staged for commit'
        `);

        if (!stat.code) {
            if (push) {
                _shell.exec(`
                    git add . 
                    git commit -am '${this.trueTxt(message, `switch branch to ${branch}`)}'
                    git push
                `);
            } else if (commit) {
                _shell.exec(`
                    git add .
                    git commit -am '${this.trueTxt(message, `switch branch to ${branch}`)}'
                `);
            } else if (stash) {
                _shell.exec(`
                    git stash save '${this.trueTxt(message, `switch branch to ${branch}`)}'
                `);
            } else {
                $log.errorWrap([
                    `- 本地有文件未提交(commit) 或 未暂存(stash)`,
                    hideNotice || `- 配置参数提交或推送文件`,
                    hideNotice || `- --commit [commit comment] 将文件提交到本地(local)`,
                    hideNotice || `- --push [commit comment] 将文件推送到远程(remote)`,
                    hideNotice || `- --stash [stash comment] 暂存文件(stash)`,
                ]);

                _shell.exec('git status');

                return false;
            }
        }

        stat = $util.execSilent(`
            git status | grep 'fix conflicts'
        `);

        if (!stat.code) {
            $log.errorWrap([`- 本地文件有冲突(conflict)或冲突未解决`]);

            _shell.exec('git status');

            return false;
        }

        return true;
    }

    trueTxt(bool, txt) {
        return bool || txt;
    }

    allBranches() {
        this.prune();
        let result =
            $util.execSilent(`
                git branch -a | grep -e '^.*/v\\d.*[^/]'
            `) || '';

        let branches = _.trim(result).split('\n');
        branches = _.map(branches, (branch) => {
            branch = branch.replace(/^[\s*]*(remotes\/origin\/){0,1}(.*)/g, '$2');
            return branch;
        });

        return _.uniq(branches);
    }

    allTags() {
        this.prune();
        let result =
            $util.execSilent(`
                git tag | grep -e '^.*_v\\d.*'
            `) || '';
        return _.trim(result).split('\n');
    }
}

let $git = new Git();

module.exports = $git;
