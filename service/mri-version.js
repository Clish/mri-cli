/**
 * MRI version 判断
 */

const _compareVersion = require('compare-versions');

const _shell = require('shelljs');
const _chalk = require('chalk');

const $root = require('./root');
const $util = require('./util');

const rootPath = $root.getRoot();

class MriVersion {
    // 根据package.json 取得当前的版本
    getCurrentVersion() {
        let pkg = $util.loadJSON(`${rootPath}/package.json`);
        return pkg.version;
    }

    // 根据.mrirc.js 获得需要更新的版本
    getTargetVersion() {
        let mrirc = $util.loadjs(`${rootPath}/.mrirc.js`) || {};
        return mrirc.version || 0;
    }

    // 比较两次版本
    compareVersion(targetVersion, currentVersion) {
        return _compareVersion(targetVersion, currentVersion);
    }

    init(fn) {
        let currentVersion = this.getCurrentVersion();
        let targetVersion = this.getTargetVersion();
        let isUpdate = targetVersion && this.compareVersion(targetVersion, currentVersion);
        fn(isUpdate, targetVersion, currentVersion);
        return isUpdate;
    }


}

const $MriVersion = new MriVersion();
module.exports = $MriVersion;
