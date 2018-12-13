import BaseConst from './base.const';

const <%=upperName%>Const = {

    ...BaseConst,

    // 环境常量（默认值，prod）
    'ENV': 'dev',
    'DEBUG': true,
    'X-ORIGIN': '<%=xOrigin%>',

    // 常规常量
    STORAGE_X_TOKEN: '<%=upperAll%>_X_TOKEN',
    STORAGE_LOCALE: '<%=upperAll%>_LOCALE',
    LOCALE: 'en',
    LOCALE_PATH: '/assets/<%=name%>/locale',
};

export default <%=upperName%>Const;
