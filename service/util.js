
const _fse   = require('fs-extra');
const _      = require('lodash');
const _path  = require('path');
const _fs    = require('fs');
const moment = require('moment');

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
        let obj = { time: moment().format('YYYY/MM/DD HH:mm:ss') };
        let commentFile = _fs.readFileSync(_path.join(__dirname, '../template/comments'), { encoding: 'utf8' });
        let gitConfig = _fs.readFileSync(_path.join(process.cwd(), '.git/config'), { encoding: 'utf8' });
        _.forEach(['name', 'email'], str => {
            let regex = new RegExp(`${str}\\s*=\\s*(\\S.*)`);
            obj[str] = gitConfig.match(regex)[1] || '';
        });

        return _.template(commentFile)({ ...options, ...obj });
    }
};
