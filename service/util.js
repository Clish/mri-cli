
const _fse   = require('fs-extra');
const _      = require('lodash');
const _path  = require('path');
const _fs    = require('fs');
const moment = require('moment');
const ejs    = require('ejs');

const replaceTempVars = (temp, vars, value) => {
    let obj = _.isObject(vars) ? vars : {[vars]: value || ''};
    _.forEach(obj, (val, key) => {
        let regex = new RegExp(_.escapeRegExp(`$_{${key}}`), 'ig');
        temp = temp.replace(regex, val);
    });
    return temp;
}

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
            let  rexStr = `${str} = `;
            let  regex  = new RegExp(rexStr + '.*');
            obj[str] = regex.exec(gitConfig) ? regex.exec(gitConfig)[0].replace(rexStr, '') : '';
        });

        return ejs.render(commentFile, { ...options, ...obj });
    }
};
