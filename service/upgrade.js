
const fs       = require('fs-extra');
const { join } = require('path');
const chalk    = require('chalk');
const spawn    = require('cross-spawn');
const which    = require('which');
const _        = require('lodash');

const MODULE_PATH = './node_modules';

function runCmd(cmd, args = [], fn) {
    let runner = spawn(cmd, args, { stdio: "inherit" });
    runner.on('close', function (code) {
        fn && fn(code);
    });
}

function upgrade({ reinstall, args, onInstalled }) {
    if(reinstall) {
        let modulePath = join(process.cwd(), MODULE_PATH);
        fs.existsSync(modulePath) && fs.removeSync(modulePath);
    }

    if(_.isNull(args)) {
        onInstalled && onInstalled();
        return void 0;
    }

    console.log(chalk.cyan('Begin to install packages...'));

    let npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    runCmd(which.sync(npm), _.concat('install', args), () => {
        console.log(chalk.green('Successfully upgrade all packages.'));
        onInstalled && onInstalled();
    });

}

module.exports = upgrade;