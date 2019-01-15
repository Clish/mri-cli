/**
 * mri 升级到 2.9.0 的升级脚本
 */

const _shell = require('shelljs');
const _ = require('lodash');

const $root = require('../service/root');
const $util = require('../service/util');

module.exports = function() {
    /**
     * 清理分支
     */

    // 删除所有的 copy-test 分支
    // 删除没有远程分支的'relese | hotfix'的本地分支

    $root.run(() => {
        $util.execSilent(`
            git checkout master

            git pull origin master

            # 删除所有的 copy-test 分支

            git branch --list | grep 'copy-test' | xargs git branch -D

            # 删除所有的远程不存在的release分支

            ## 删除本地记录中远程不存在的分支（远程分支同步）
            git remote prune origin
        `);

        // 获得本地的 release | hotfix 分支
        let localBranch = $util
            .execSimple(
                `
                git branch --list | grep -e '^\\s\\{0,\\}\\(release\\|hotfix\\).*'
            `,
            )
            .split('\n')
            .map((item) => _.trim(item));

        // 获得远程 release | hotfix 分支
        let remoteBranch = $util
            .execSimple(
                `
            git branch -r --list | grep -e '^\\s\\{0,\\}.*\\(release\\|hotfix\\).*'
        `,
            )
            .split('\n')
            .map((item) => _.trim(item.replace('origin/', '')));

        // 计算出远程删除，本地未删除分支
        let diff = _.difference(localBranch, remoteBranch);

        if(diff && diff.length) {
            _.each(diff, (branch) =>
                $util.execSilent(`
                echo 删除本地分支${branch}
                git branch -D ${branch}
            `),
            );
        }

    });

    return 'mri_v2.9.0 升级成功';
};
