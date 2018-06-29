
const fs       = require('fs-extra');
const { join } = require('path');
const chalk    = require('chalk');

const MODULE_PATH = './test_modules';

function upgrade({ reinstall }) {
    if(reinstall) {
        let modulePath = join(process.cwd(), MODULE_PATH);
        fs.existsSync(modulePath) && fs.removeSync(modulePath);
    }
    console.log(chalk.cyan('Begin to install packages...'));

    // install

    console.log(chalk.green('Successfully upgrade all packages.'));
}

module.exports = upgrade;