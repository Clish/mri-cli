/**
 * MRI 版本升级
 */

const _compareVersion = require('compare-versions');

const _shell = require('shelljs');
const _chalk = require('chalk');
const _path = require('path');

const $root = require('./root');
const $util = require('../lib/common/util');
const $log = require('../lib/common/log');

class MriVersionUpgrade {
    // 根据package.json 取得当前的版本
    getCurrentVersion() {
        let path = _path.join(process.cwd(), './package.json');
        let pkg = $util.loadJSON(path);
        return pkg.version;
    }

    // 根据.mrirc.js 获得需要更新的版本
    getUpdateVersion() {
        let { version } = $util.getMriRC() || {};
        return version || 0;
    }

    upgrade() {
        let currentVersion = this.getCurrentVersion();
        let updateVersion = this.getUpdateVersion();

        if ($util.isDevBranch() && _compareVersion(updateVersion, currentVersion)) {
            $log.log([
                `-----------------------------------`,
                `- MRI 版本升级 v${currentVersion} -> v${updateVersion} `,
                `-----------------------------------`,
            ]);

            let updateBranch = '';

            if ($util.execSimple(`git branch -r | grep 'origin/release/mri/v${updateVersion}'`)) {
                updateBranch = `release/mri/v${updateVersion}`;
            } else if ($util.execSimple(`git branch -r | grep 'origin/hotfix/mri/v${updateVersion}'`)) {
                updateBranch = `hotfix/mri/v${updateVersion}`;
            } else {
                $log.errorWrap([
                    `- 升级到MRI@${updateVersion}失败`,
                    `- 没有找到相关资源`,
                    `- 请提交ISSUES (http://code.admaster.co/ipg/mri/issues)`
                ]);
                return void 0;
            }

            if (!$util.isNothingCommit()) {
                _shell.exec(`
                     git add . && git commit -am 'ready update MRI@${updateVersion}'
                `);
            }

            let update = _shell.exec(`
                git fetch -u origin ${updateBranch}:${updateBranch}
                echo '升级当前MRI版本 -> ${updateBranch}'
                git merge --no-ff ${updateBranch}
            `);

            if (update.code !== 0) {
                $log.errorWrap([
                    `- 升级到MRI@${updateVersion}失败`,
                    `- 文件产生了冲突`,
                    `- 请手动解决冲突`
                ]);

                process.exit(0);

            } else {
                $util.execSilent(
                    `   
                        # 为什么这里要更新tag信息？
                        # git tag -l | xargs git tag -d 
                        # git remote update origin --prune 
                        
                        # 更新 mri-common 信息
                        git fetch -u origin mri-common:mri-common 
                        git checkout mri-common -- .mrirc.js
                        git rm --cache  .mrirc.js
                        npm version ${updateVersion} 
                        git add . && git commit -am 'upgrade mri ${currentVersion} -> v${updateVersion}'
                    `,
                );
            }
        }
    }
}

const $upgrade = new MriVersionUpgrade();
module.exports = $upgrade;