const _path = require('path');
const _join = _path.join;
const _ = require('lodash');
const _fs = require('fs');
const $root = require('../service/root');
const $util = require('../service/util');
const _chalk = require('chalk');
const _shell = require('shelljs');
const _relative = require('relative');


class $index {

    /**
     * 创建 index 文件
     * @param path
     * @param tempFn
     */
    createIndex(path, tempFn) {
        let indexPath = _join(path, './index.ts');

        _shell.rm('-rf', indexPath);

        _fs.readdir(path, (error, files) => {
            if(error) {
                return void 0;
            }

            if(files.length) {
                files = _.filter(files, (name) => {
                    const filePath = _join(path, name);
                    const stat = _fs.statSync(filePath);
                    return stat.isFile();
                });

                files = _.map(files, (file) => {
                    let relativeFile = file.replace(/\.(ts|tsx)$/gi, '');
                    let pascalName = $util.pascalNaming(relativeFile);
                    return tempFn(relativeFile, pascalName)
                });

                // 生成index.ts文件
                _fs.writeFileSync(indexPath, files.join('\n'), {encoding: 'utf-8'});
            }

        });
    }

    createSVGIndex(svgs, indexPath, tempFn) {
        _shell.rm('-rf', indexPath);

        let temp = _.map(svgs, (file) => {
            let relativeFile = _relative(indexPath, file.filedir);
            let pascalName = $util.pascalNaming(file.filename);
            return tempFn(relativeFile, pascalName)
        });

        // 生成index.ts文件
        _fs.writeFileSync(indexPath, temp.join('\n'), {encoding: 'utf-8'});

    }


}

module.exports = new $index();