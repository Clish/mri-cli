/**
 * const 的补充
 * 根据不同环境，值有所不同
 */

const envConst =  {

    'ENV': 'test',

    // 是否打开debug模式
    'DEBUG': true,

    // 当前开发环境的 origin
    'X-ORIGIN': '<%=xOrigin%>'

};

export default envConst;
