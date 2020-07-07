const _fse = require('fs-extra');
const _ = require('lodash');
const _path = require('path');
const _fs = require('fs');
const _moment = require('moment');
const _chalk = require('chalk');
const _spawn = require('cross-spawn');
const _which = require('which');
const _shell = require('shelljs');
const _program = require('commander');
const _prettier = require('prettier');

const $util = require('./util');
const $log = require('./log');

class Mritemp {
    get path() {
        return _path.join(process.cwd(), './.mritemp');
    }

    read(key) {
        let info = {};
        if (_fs.existsSync(this.path)) {
            try {
                info = JSON.parse(_fs.readFileSync(this.path, 'utf-8') || '{}');
            } catch (e) {
                // $log.error([e]);
            }
        }

        return key ? _.get(info, key) : info;
    }

    write(value, key) {
        // todo mritemp
        // let info = this.read();
        // if (key) {
        //     info = _.set(info, key, value);
        // }
        // let content = JSON.stringify(info);
        // content = _prettier.format(content || '', { semi: false, parser: 'json' });
        // _fse.outputFileSync(this.path, content);
    }

    /**
     * 派生方法
     */
    branches(branch) {
        let branches = this.read('branches') || [];
        branches.unshift(branch);
        branches = _.uniq(branches);
        branches = branches.slice(0, 21);
        this.write(branches, 'branches');
    }
}

const $mritemp = new Mritemp();

module.exports = $mritemp;
