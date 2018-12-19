const _program = require('commander');
const _shell = require('shelljs');
const _chalk = require('chalk');
const _path = require('path');
const _fs = require('fs');
const _fse = require('fs-extra');
const _ = require('lodash');

const $root = require('../service/root');
const $util = require('../service/util');
const $log = require('../service/log');
const $template = require('../service/template');

class GCO {
    /**
     * 获得分支名
     * @param inx_branch
     * @param branches
     */
    getBranch(inx_branch, branches) {
        if (/^[0-9]{1,}$/.test(inx_branch)) {
            inx_branch = branches[inx_branch];
            if (!inx_branch) {
                $log.error('输入的branches index不存在');
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
            process.exit(0);
            return void 0;
        }
    }

    record(branch, info) {
        info = info || $util.getThemeInfo();
        let { branches = [] } = info;
        branches.unshift(branch);
        branches = _.uniq(branches);
        branches.slice(0, 20);
        info.branches = branches;
        $util.setThemeInfo(info);
        return info;
    }

    showBranch(info) {
        let { branches = [] } = info || $util.getThemeInfo();
        $log.debug('\n最近打开过的分支: \n');
        _.each(branches, (branch, inx) => console.log(inx, branch));
        $log.log('');
    }

    // run branch
    run(inx_branch) {
        let info = $util.getThemeInfo();
        let { branches = [] } = info;

        // 打印 branches 列表
        inx_branch === void 0 && this.showBranch(info);

        // 获得当前需要 checkout branch
        let branch = this.getBranch(inx_branch, branches);

        // 获得该 branch 所在的位置
        let where = this.whereBranch(branch);

        $log.warn(`\n- 即将切换到分支: ${branch}\n`);

        // 根据不同的位置，执行不同的checkout命令
        if (where === 'local') {
            _shell.exec(`
                git checkout ${branch}
            `);
        } else if (where === 'remote') {
            _shell.exec(`
                git checkout -b ${branch}
            `);
        }

        // 记录当前的分支信息，存入最近打开的branch列表
        info = this.record(branch, info);

        // 显示最新的 branches 列表
        this.showBranch(info);
    }
}

let $gco = new GCO();
module.exports = $gco;
