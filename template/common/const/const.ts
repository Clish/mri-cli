import EnvConst from 'src/theme/const-env.mri';

let ThemeConst = {
    // ... 各themeConst
};

const <%=upperName%>Const = {...ThemeConst, ...EnvConst};

export default <%=upperName%>Const;
