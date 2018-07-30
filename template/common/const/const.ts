import EnvConst from 'src/theme/const-env.mri';

let ThemeConst = {
    // ... 各themeConst
    STORAGE_X_TOKEN: '<%=upperAll%>_X_TOKEN',
    STORAGE_LOCALE: '<%=upperAll%>_LOCALE',
    LOCALE: 'en',
    LOCALE_PATH: '/assets/<%=name%>/locale',
};

const <%=upperName%>Const = {...ThemeConst, ...EnvConst};

export default <%=upperName%>Const;
