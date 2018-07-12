const _fse = require('fs-extra');
const _ = require('lodash');
const _path = require('path');
const _fs = require('fs');
const _moment = require('moment');
const _chalk = require('chalk');

const {log, error, debug} = console;
const {green, red, yellow, grey} = _chalk;

module.exports = {
    ifnvl(src, target) {
        return _.isNil(src) ? target : src;
    },

    /**
     * 批量创建文件
     * @param arr
     * @param path
     * @return {*}
     */
    createDir(arr, path) {
        _.forEach(arr, (dir) => {
            path = _path.join(path, './' + dir);
            if(!_fs.existsSync(path)) {
                _fse.mkdirsSync(path);
            }
        });
        return path;
    },

    createComments(options) {
        let obj = {
            time: _moment()
                .format('YYYY/MM/DD HH:mm:ss')
        };
        let commentFile = _fs.readFileSync(_path.join(__dirname, '../template/comments'), {encoding: 'utf8'});
        let gitConfig = _fs.readFileSync(_path.join(process.cwd(), '.git/config'), {encoding: 'utf8'});

        _.forEach(['name', 'email'], (str) => {
            let regex = new RegExp(`${str}\\s*=\\s*(\\S.*)`);

            let matcher = gitConfig.match(regex);

            if(_.isNil(matcher) && str === 'name') {

                log(red('git中未设置个人信息'));

                log('根据下面命令配置信息');

                log(green('git config user.name uname'));

                log(green('git config user.email uemail'));

                return void 0;
            } else {
                matcher = matcher || [];
            }

            obj[str] = matcher[1] || '';
        });

        return _.template(commentFile)({...options, ...obj});
    }
};
