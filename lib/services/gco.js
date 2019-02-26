const _program = require('commander');
const _shell = require('shelljs');
const _chalk = require('chalk');
const _path = require('path');
const _fs = require('fs');
const _fse = require('fs-extra');
const _ = require('lodash');

const $root = require('../../service/root');
const $util = require('../common/util');
const $log = require('../common/log');
const $git = require('../common/git');
const $mritemp = require('../common/mritemp');
const $template = require('../../service/template');

class GCO {
    /**
     * 获得分支名
     * @param inx_branch
     * @param branches
     */
    getBranch(inx_branch, branches = []) {
        if (/^[0-9]{1,}$/.test(inx_branch)) {
            inx_branch = branches[inx_branch];
            if (!inx_branch) {
                $log.error(['输入的branches index不存在']);
                process.exit(0);
                return void 0;
            }
        }

        return inx_branch;
    }

    /**
     * 验证分支所在位置
     * @param branch
     */
    whereBranch(branch) {
        // 查找分支所在位置
        // 若无此分支，则退出进程
        if ($util.execSimple(`git branch --list '${branch}'`)) {
            return 'local';
        } else if ($util.execSimple(`git branch -r --list 'origin/${branch}'`)) {
            return 'remote';
        } else {
            return void 0;
        }
    }

    /**
     * 记录在temp
     * @param branch
     * @param info
     * @return {*}
     */
    recordBranch(branch) {
        branch = branch || $git.getCurrentBranch();
        $mritemp.branches(branch);
    }

    /**
     * 展示分支 temp
     * @param info
     */
    showRecentBranches() {
        let branches = $mritemp.read('branches');
        $log.debug('\n最近打开过的分支: \n');
        _.each(branches, (branch, inx) => console.log(inx, branch));
        $log.log('');
    }

    /**
     * 切换分支
     * @param branch
     * @param where
     * @return {boolean}
     */

    // todo no commit 判断
    // bug，远程有分支 也是用 git checkout ${branch}
    // mri gco --stash, --commit
    checkout(branch) {
        if ($git.checkout(branch, true)) {
            // 记录当前的分支信息，存入最近打开的branch列表
            this.recordBranch(branch);
        } else {
            process.exit(0);
        }
    }

    // run branch
    run(inx_branch) {
        let branches = $mritemp.read('branches');

        if (!inx_branch) {
            $log.errorWrap([`- 请输入快速切换分支名称 或 索引值(branch index)`]);
            this.showRecentBranches();
            process.exit(0);
        }

        // 获得当前需要 checkout branch
        let branch = this.getBranch(inx_branch, branches);

        // 切换分支
        this.checkout(branch);

        // 显示最新的 branches 列表
        this.showRecentBranches();
    }
}

let $gco = new GCO();

module.exports = $gco;
