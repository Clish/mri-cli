const _path = require('path');
const _join = _path.join;
const _ = require('lodash');
const _fs = require('fs');
const $root = require('../service/root');
const _chalk = require('chalk');
const _shell = require('shelljs');

class $interface {

    rootPath() {
        return $root.getRoot();
    }

    constPath() {
        return _join(this.rootPath(), './src/common/const');
    }

    outDir() {
        return _join(this.constPath(), './ts-mri');
    }

    interfaceDir() {
        return _join(this.constPath(), './interface-mri');
    }

    tsc(file) {
        return [
            _join(this.rootPath(), './node_modules/.bin/tsc'),
            '--baseUrl',
            this.rootPath(),
            '--declaration',
            '--keyofStringsOnly',
            '--removeComments true',
            '--outDir',
            this.outDir(),
            // '--declarationDir ./ii',
            file
        ];
    }

    upperName(str) {
        return _.flow([_.camelCase, _.upperFirst])(str);
    }

    createIndex(cb, path) {
        let constPath = path || this.constPath();
        let indexPath = _join(constPath, './index.ts');

        _shell.rm('-rf', indexPath);

        _fs.readdir(this.constPath(), (error, files) => {
            if(error) {
                return void 0;
            }

            if(files.length) {
                files = _.filter(files, (name) => {
                    const filePath = _join(this.constPath(), name);
                    const stat = _fs.statSync(filePath);
                    return stat.isFile();
                });

                files = _.map(files, (file) => {
                    let relativeFile = file.replace(/\.(ts|tsx)$/gi, '');
                    let upperCase = this.upperName(relativeFile);
                    return `export {default as ${upperCase}} from './${relativeFile}';`
                });

                // 生成index.ts文件
                _fs.writeFileSync(indexPath, files.join('\n'), {encoding: 'utf-8'});

                cb && cb(indexPath)
            }

        });

    }

    /**
     * 遍历相应的文件夹，生成相应的declaration
     * @param cb
     */
    createDeclaration(cb) {

        // 编译index文件，加快编译速度
        this.createIndex((indexPath) => {
            _shell.exec(`
                ${this.tsc(indexPath).join(' ')}
            `);

             cb && cb();
        });

        // 旧的方法，编译每个ts文件
        // _fs.readdir(this.constPath(), (error, files) => {
        //
        //     if(error) {
        //         return void 0;
        //     }
        //
        //     if(files.length) {
        //         files = _.filter(files, (name) => {
        //             const filePath = _join(this.constPath(), name);
        //             const stat = _fs.statSync(filePath);
        //             return stat.isFile();
        //         });
        //
        //         if(files.length) {
        //             const tscs = _.map(files, (file) => {
        //                 return this.tsc(_join(this.constPath(), file)).join(' ');
        //             });
        //
        //             _shell.exec(`
        //                 ${tscs.join('\n')}
        //             `);
        //
        //             cb && cb();
        //         }
        //     }
        // });
    }

    /**
     * 集合 const.d.ts
     */
    groupDts(cb) {
        const groupDir = this.interfaceDir();
        const outDir = this.outDir();
        _shell.exec(`
            mkdir ${groupDir}
            
            for i in $(find ${outDir} -iname *[.-]const.d.ts)
            do
                mv $i ${groupDir}
            done
            
            rm -rf ${outDir}
        `);

        cb && cb();
    }

    /**
     * 将 declaration 改为 interface
     */
    d2i() {
        const groupDir = this.interfaceDir();
        _fs.readdir(groupDir, (error, files) => {
            if(error) {
                return void 0;
            }

            if(files.length){
                _.each(files, (file) => {
                    let filePath = _join(this.interfaceDir(), file);
                    let info = String(_fs.readFileSync(filePath, 'utf-8'));
                    info = info.replace(/declare const\s(.*?):/gi, 'interface I$1');
                    info = info.replace(/export.*?;/gi, '');
                    info = info.replace(/};\s*$/gi, '}');
                    _fs.writeFileSync(filePath, info, {encoding: 'utf-8'});
                });
            }
        });
    }

    /**
     * 修改d.ts 文件
     * 转成 interface
     * @param isForce 默认当检测到有interface所在的文件夹存在，则不再生成interface
     */
    init(isForce) {
        const interfaceDir = this.interfaceDir();
        let isExist = _fs.existsSync(interfaceDir);
        let isRun = isForce || !isExist;

        if(isRun) {

            isExist && _shell.rm('-rf', interfaceDir);

            this.createDeclaration(() => {
                this.groupDts(() => {
                    this.d2i();
                })
            });
        }
    }

}

module.exports = new $interface();