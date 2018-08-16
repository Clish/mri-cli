const fs = require('fs-extra');
const {join} = require('path');
const chalk = require('chalk');

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

const getWaitPkgs = function(pkgs, defPkgPath) {
    let waits = [];

    _.each(pkgs, (version, name) => {
        let path = defPkgPath || join(process.cwd(), 'node_modules', name, 'package.json');
        if(fs.existsSync(path)) {
            let pkg = $util.loadJSON(path);
            let ver = pkg.version;
            version = _.trim(version);
            ver = _.trim(ver);

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
    globals = getWaitPkgs(globals, join(__dirname, '../package.json'));

    return [
        {pkgs: saves, params: '--save'},
        {pkgs: devs, params: '--save-dev'},
        {pkgs: globals, params: '-g'}
    ];
};

const globalInstaller = function(item) {
    let pkgs = item.pkgs.join(' ');
    shell.exec(`
        echo ready install ${pkgs}
        npm i ${pkgs} -g 2>> /dev/null
        
        if [ $? -ne 0 ]; then
            echo 使用sudo安装全局包，需要输入密码
            sudo npm i ${pkgs} -g
        fi
    `);
};

const upgrade = function(mrircPath) {
    let ppkgs = getPendingPackages(mrircPath);
    _.each(ppkgs, (item) => {
        if(item.pkgs.length > 0) {
            let pkgs = item.pkgs.join(' ');
            // $util.npmCmd(['i', pkgs, item.params]);
            if(item.params !== '-g') {
                shell.exec(`
                    echo ready install ${pkgs}
                    npm i ${pkgs} ${item.params}
                `);
            } else {
                globalInstaller(item);
            }
        }
    });
};

module.exports = upgrade;