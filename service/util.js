const _ = require('lodash');
const _fse = require('fs-extra');
const _path = require('path');
const _fs = require('fs');

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
    }
};
