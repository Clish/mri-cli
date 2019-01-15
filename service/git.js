const fs       = require('fs-extra');
const { join } = require('path');
const chalk    = require('chalk');
const _        = require('lodash');
const shell    = require('shelljs');
const $util    = require('../lib/common/util');
const moment   = require('moment');

const funcs     = ['release', 'hotfix', 'feature', 'update'];
const actions   = ['start', 'finish', 'merge'];
const brNames   = { master: 'master', release: 'rel/' };
const gitAction = {
    new   : 'git checkout -b',
    push  : 'git push origin',
    del   : 'git branch -D',
    co    : 'git checkout',
    merge : 'git merge',
};

const isInside = (source, target) => !!~source.indexOf(target);
const echo     = (msg, color) => console.log(!color ? msg : chalk[color](msg));
const isExist  = branchName => {
    echo('查看分支列表: ');
    let brStr = _.trimEnd(shell.exec(`git branch | grep "${branchName}"`).toString(), ' \n');
    let brExist = _.trim(brStr) === branchName;
    !brExist && echo('请输入已存在的分支名称.', 'red');
    return brExist;
};
const cmds      = {
    release: {
        start  : (program, branchName) => {
            let relName = `${brNames.release}${branchName}/${moment().format('YYYY-MM-DD')}`;
            shell.exec(`${gitAction.new} ${relName} && ${gitAction.push} ${relName}`);
            echo(`创建release分支: '${relName}'.`, 'green');
        },
        finish : (program, branchName) => {
            shell.exec(`${gitAction.co} master && ${gitAction.del} ${branchName} && ${gitAction.push} :${branchName}`);
            echo(`删除release分支: '${branchName}'.`, 'green');
        }
    },
    hotfix: {
        start  : (program, branchName) => {
            shell.exec(`${gitAction.new} hotfix/${branchName}`);
            echo(`创建hotfix分支: 'hotfix/${branchName}'`, 'green');
        },
        finish : (program, branchName) => {
            shell.exec(`${gitAction.co} master && ${gitAction.merge} ${branchName} ${program.DELETE ? `&& ${gitAction.del} ${branchName} && ${gitAction.push} :${branchName}` : '' }`);
            echo(`合并hotfix分支到master.`, 'green');
        }
    },
    featrue: {
        start  : (program, branchName) => {
            shell.exec(`${gitAction.new} feature/${branchName}`);
            echo(`创建feature分支: 'featrue/${branchName}'`, 'green');
        },
        finish : (program, branchName) => {
            shell.exec(`${gitAction.merge} ${branchName} ${program.DELETE ? `&& ${gitAction.del} ${branchName} && ${gitAction.push} :${branchName}` : '' }`);
            echo(`合并feature分支: '${branchName}'.`, 'green');
        }
    },
    update: {
        merge  : (program, branchName) => {
            shell.exec(`${gitAction.merge} ${branchName}`);
            echo(`已同步分支: '${branchName}', 注意处理可能存在的冲突.`, 'green');
        }
    }
};

const checkBranch = (func, action) => {
    echo('当前分支: ');
    let branch = _.trimEnd(shell.exec(`git branch | grep "*" | cut -c 3-`).toString(), '\n');
    let errorMsg = '';
    if((func === 'release' && action === 'new') || (func === 'hotfix' && action === 'start')) {
        errorMsg = branch === brNames.master ? '' : '请切换到master分支进行操作. ';
    } else if(func === 'feature') {
        errorMsg = _.startsWith(branch, brNames.release) ? '' : '请切换到相应的release分支进行操作. ';
    }
    !!errorMsg && echo(errorMsg, 'red');
    return !!errorMsg;
};

const git = function(program) {
    let { args } = program;
    let func = args[0], action = args[1], branchName = args[2];
    // 格式输入检测
    if (!isInside(funcs, func) || !isInside(actions, action) || !branchName) {
        echo('请正确输入命令: ', 'red');
        echo('    mri git [feature|release|hotfix] [start|finish|merge] 分支名称', 'cyan');
        return void 0;
    }
    // 分支检测
    if (checkBranch(func, action)) return void 0;
    echo('Begin to run git command.');

    let cmd = cmds[func][action];

    if (action === 'finish') {
        isExist(branchName) && cmd(program, branchName);
    } else {
        cmd(program, branchName);
    }
};

/**
    mri git
        release
            start   从master切分支出来并推送远程, 根据项目名+日期生成分支名称
                    mri git release new releaseName
            finish  删除当前release分支
                    mri git release del releaseName
        feature:
            start   从当前release中切分支,不推送远程
                    mri git feature start featureName
            finish  将分支合并回release分支, 删除该分支添加 -d 参数
                    mri git feature finish (-d) featureName
        hotfix:
            start   从master切取分支, 不推送远程
                    mri git hotfix start hotfixName
            finish  将分支合并回master分支, 删除该分支添加 -d 参数
                    mri git hotfix finish (-d) hotfixName

        update
            megre   合并其他分支到当前分支
                    mri git update merge branchName
**/

/**
 * $ mri git release ${theme}
 *
 * 创建新的release
 *
 * R1. 若当前项目上有文件未提交到本地仓库
 *    - 报错，提醒提交
 *    - 或 使用 mri git release -m 'xxx' 提交到本地仓库，再创建release
 *    - 或 使用 mri git release -m 'xxx' --push 提交到本地仓库并推送到远程，再创建release
 *
 * 2. 创建release
 *    - release 只能基于 master
 *    - 方法一:
 *      * 先切换到master分支，git pull 获取最新代码
 *      * 再创建分支
 *    - 方法二:
 *      * git fetch 获取最新代码
 *      * git checkout -b 新分支名 master
 *
 * 3. release 名称
*     - rel/${theme}/${version}
 *    - version 从每个 theme下面的${theme}-umi.js 中获取 （若无 默认1.0.0）
 *    - 创建release后将 version 写回 ${theme}-umi.js, 避免同时存在多条 release
 *    - 执行命令 mri git release ${theme} 若 theme 不存在
 *      * 方案一: 提醒该 theme 不存在，确认是否创建, 用户选择是 -> 先创建分支, 版本默认 0.0.1；再创建 theme
 *      * 方案二: 提醒该 theme 不存在；若要创建新的theme, 使用 mri git release ${theme} -- force -> 先创建分支, 版本默认 0.0.1；再创建 theme
 *    - 创建release 成功后，推送到远程，并切换至分支；
 *
 * 4. 因为release 分支不可删，所以没有删除命令
 */

/**
 * $ mri git feature
 *
 * 创建新的feature
 *
 * 1. feature 不能在 master, test, common 三个分支中创建
 * 2. feature 读取当前所在的 release名称，生成新的分支名 feature/${theme}/${version}-beta.x
 *    - beta 也可以从${theme}.umi.js中读取
 *    - theme 从分支名解析而出
 * 3. feature 不推送远程
 * 4. 若当前代码未提交，逻辑同 R1
 *
 * $ mri git feature merge ${releaseBranchName?}
 *
 * release merge feature
 *
 * 0. 若当前代码未提交，逻辑同 R1
 * 1. release 选填，不填可根据当前 branch-name 分析出它所属 release
 * 2. merge 结束后，默认不删除 feature 分支
 *    - 若删除该分支使用 mri git feature merge --delete
*  3. merge 过程，先把 release merge 到 feature; merge 成功后 再切到 release分支，再把 feature merge 回 release
 *    - 多个feature 开发，因为在同一theme, 所以产生冲突的几率非常的大
 */

/**
 * $ mri git hotfix ${branchName}
 *
 * 创建hotfix
 *
 * 1. hotfix 只能基于master(同 release)
 * 2. hotfix 分支名 hotfix/${theme}/${version}.rc.x;
 *    - 创建hotfix， branchName 手写
*  3. hotfix 推送远程，用于 pr merge master
 * 4. 若当前代码未提交，逻辑同 R1
 */

/**
 * $ mri git merge test ${branchName?}
 *
 * 1. 只适用 release/hotfix 分支; 其他分支报错退出
 * 2. 若当前代码未提交，逻辑同 R1
 * 3. 若 branchName 为空，则默认选中当前分支
 * 4. 切到 test 分支，merge release/hotfix 分支
 * 5. 操作结束 返回 release/hotfix 分支，避免在test进行操作
 */

/**
 * $ mri git ampp -m 'xxxxx'
 *
 * 快速提交代码
 *
 * 1. 一组代码的合集
 *    - git add . && git commit -am 'xxxxx' && git pull && git push
 */

module.exports = git;
