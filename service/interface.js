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
        return _join(this.constPath(), './i.mri');
    }

    groupDir() {
        return _join(this.constPath(), './ii.mri');
    }

    tsc(file) {
        return [
            'tsc',
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

    /**
     * 遍历相应的文件夹，生成相应的declaration
     * @param cb
     */
    createDeclaration(cb) {

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

                if(files.length) {
                    const tscs = _.map(files, (file) => {
                        return this.tsc(_join(this.constPath(), file)).join(' ');
                    });

                    _shell.exec(`
                        ${tscs.join('\n')}
                    `);

                    cb && cb();
                }
            }
        });
    }

    /**
     * 集合 const.d.ts
     */
    groupDts(cb) {
        const groupDir = this.groupDir();
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
        const groupDir = this.groupDir();
        _fs.readdir(groupDir, (error, files) => {
            if(error) {
                return void 0;
            }

            if(files.length){
                _.each(files, (file) => {
                    let filePath = _join(this.groupDir(), file);
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
     */

    init() {
        this.createDeclaration(() => {
            this.groupDts(() => {
                this.d2i();
            })
        });
    }

}

module.exports = new $interface();