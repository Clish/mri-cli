const _fs = require('fs');
const _ = require('lodash');
const _path = require('path');
const _chalk = require('chalk');
const _shell = require('shelljs');

const judges = {
    'node_modules': 1,
    'package.json': 1,
    '.mrirc.js': 1
};

class $root {
    judgeRoot(path) {
        let status = false;
        let files = _fs.readdirSync(path);

        if(files && files.length > 0) {
            let matchTime = 0;
            _.each(files, (name) => {
                if(judges[name]) {
                    matchTime++;
                }

                if(matchTime === _.size(judges)) {
                    status = true;
                    return false;
                }
            });
        }
        return status;
    }

    getRoot(path) {
        path = path || process.cwd();
        if(!this.judgeRoot(path)) {
            let path2 = _path.join(path, '..');
            if(path2 === path) {
                console.log(_chalk.red('当前路径错误'));
                return void 0;
            } else {
                return this.getRoot(path2);
            }
        } else {
            return path;
        }
    }

    getThemes(path, theme) {
        let themePath = _path.join(this.getRoot(path), './src/theme');
        let files = _fs.readdirSync(themePath);
        let themes = [];

        _.forEach(files, (filename) => {
            let filePath = _path.join(themePath, filename);
            let fsStats = _fs.statSync(filePath);

            if(fsStats.isDirectory()) {
                console.log(`   - ${filename}`);
                themes.push(themes);
            }
        });

        return themes;
    }

    inRoot(command) {
        let path = this.getRoot();
        path && _shell.exec(`
            cd ${path}
            ${command}
        `);
    }

}

module.exports = new $root();