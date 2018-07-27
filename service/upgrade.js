const fs = require('fs-extra');
const {join} = require('path');
const chalk = require('chalk');
const spawn = require('cross-spawn');
const which = require('which');
const _ = require('lodash');
const shell = require('shelljs');
const $util = require('../service/util');

/**
 *
 * @type {string}
 */

/**
 * mri dev $theme -u
 * @type {string}
 */

const getWaitPkgs = function(pkgs, pkg) {
    let waits = [];

    _.each(pkgs, (version, name) => {
        let path = pkg || join(process.cwd(), 'node_modules', name, 'package.json');
        if(fs.existsSync(path)) {
            let pkg = $util.loadJSON(path);
            let ver = pkg.version;
            version = $util.getVersion(_.trim(version));
            ver = $util.getVersion(_.trim(ver));

            // 只要本地版本与mri提供版本不一样
            // 本地包就必须重装
            if(version !== ver) {
                waits.push(`${name}@${version}`);
            }
        } else {
            waits.push(`${name}@${version}`);
        }
    });

    return waits;
};

const getPendingPackages = function(mrircPath) {
    let config = $util.loadjs(mrircPath);
    let {saves, devs, globals} = config;

    saves = getWaitPkgs(saves);
    devs = getWaitPkgs(devs);
    globals = getWaitPkgs(globals, join(__dirname, 'package.json'));

    return [
        {pkgs: saves, params: '--save'},
        {pkgs: devs, params: '--save-dev'},
        {pkgs: globals, params: '-g'}
    ];
};

const upgrade = function(mrircPath) {

    let penddings = getPendingPackages(mrircPath);

    _.each(penddings, (item) => {
        if(item.pkgs.length > 0) {
            let pkgs = item.pkgs.join(' ');
            shell.exec(`
                echo ${pkgs}
                npm i ${pkgs} ${item.params}
            `);
        }
    });
};

module.exports = upgrade;