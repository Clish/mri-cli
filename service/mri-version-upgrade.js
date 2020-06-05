/**
 * MRI 版本升级
 */

const _compareVersion = require('compare-versions');

const _shell = require('shelljs');
const _chalk = require('chalk');
const _path = require('path');
const _join = _path.join;

const $root = require('./root');
const $util = require('../lib/common/util');
const $log = require('../lib/common/log');
const $load = require('../lib/common/load');
const MC = require('../lib/common/constant');

class MriVersionUpgrade {
    // 根据package.json 取得当前的版本
    getCurrentVersion() {
        let path = _path.join(process.cwd(), './package.json');
        let pkg = $util.loadJSON(path);
        return pkg.version;
    }

    // 根据.mrirc.js 获得需要更新的版本
    getUpdateVersion() {
        let { version } = $load.mrirc() || {};
        return version || 0;
    }

    /**
     * MRI版本升级总程序
     */
    upgrade() {
        if (!$util.existPath(MC.PATH_MRIRC)) {
            return void 0;
        }

        let currentVersion = this.getCurrentVersion();
        let updateVersion = this.getUpdateVersion();

        if ($util.isDevBranch() && _compareVersion(updateVersion, currentVersion)) {
            $log.log([
                `-----------------------------------`,
                `- MRI 版本升级 v${currentVersion} -> v${updateVersion} `,
                `-----------------------------------`,
            ]);

            let upgradeJS = _join(__dirname, `../upgrade/v${updateVersion}.js`);
            if ($util.existPath(upgradeJS, true)) {
                require(upgradeJS)();
            }

            let updateBranch = '';

            if ($util.execSimple(`git branch -r | grep 'origin/release/mri/v${updateVersion}'`)) {
                updateBranch = `release/mri/v${updateVersion}`;
            } else if ($util.execSimple(`git branch -r | grep 'origin/hotfix/mri/v${updateVersion}'`)) {
                updateBranch = `hotfix/mri/v${updateVersion}`;
            } else {
                $log.errorWrap([
                    `- 升级到MRI@${updateVersion}失败`,
                    `- 没有找到相关资源`,
                    `- 请提交ISSUES (http://code.admaster.co/ipg/mri/issues)`,
                    `- 或尝试手动merge ${updateBranch}`,
                ]);

                return void 0;
            }

            if (!$util.isNothingCommit()) {
                _shell.exec(`
                     git add .
                     git commit -am 'ready update MRI@${updateVersion}'
                `);
            }

            let update = _shell.exec(`
                git fetch -u origin ${updateBranch}:${updateBranch}
                echo '升级当前MRI版本 -> ${updateBranch}'
                git merge --no-ff ${updateBranch}
            `);

            if (update.code !== 0) {
                $log.errorWrap([`- 升级到MRI@${updateVersion}失败`, `- 文件产生了冲突`, `- 请手动解决冲突`]);
                process.exit(0);
            } else {
                $util.execSilent(
                    `   
                        # 为什么这里要更新tag信息？
                        # git tag -l | xargs git tag -d 
                        # git remote update origin --prune 
                        
                        # 更新 mri-common 信息
                        git fetch -u origin mri-common:mri-common  
                        git checkout mri-common -- .mrirc.js 1>/dev/null 2>&1
                        npm version ${updateVersion} 
                        git add .
                        git commit -am 'upgrade mri ${currentVersion} -> v${updateVersion}'
                    `,
                );
            }
        }
    }
}

const $upgrade = new MriVersionUpgrade();
module.exports = $upgrade;
