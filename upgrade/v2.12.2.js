/**
 * mri 升级到 2.9.0 的升级脚本
 */

const _shell = require('shelljs');
const _ = require('lodash');

const $root = require('../service/root');
const $util = require('../lib/common/util');

const $log = require('../lib/common/log');

module.exports = function() {
    /**
     * 清理分支
     */
    $root.run(() => {
        // $log.debug(['. 删除无效的copy副本分支']);

        // 删除所有的 copy 分支
        $util.execSilent(`
            # git checkout master
            # git pull origin master
            # 删除所有的 copy-test 分支

            git branch --list | grep 'copy' | xargs git branch -D

            # 删除所有的远程不存在的release分支

            ## 删除本地记录中远程不存在的分支（远程分支同步）
            git remote prune origin
        `);

        // $log.debug(['... 删除无效文件，重置ignore文件缓存']);

        $util.execSimple(`
            rm -rf src/layout/index.ts
            git add . && git commit -am 'merge ignore'
            git rm -r --cache src/layout/index.ts 1>/dev/null 2>&1
        `);
    });
};
