/**
 * theme <%=name%> config
 * @author ...
 */

import <%=upperName%>Layout from './layout/<%=name%>-layout';
import <%=upperName%>Const from 'src/common/const/<%=name%>.const';
import EnvConst from 'src/theme/const-env.mri';
import <%=upperName%>RoutesTs from './<%=name%>-routes.ts';
import <%=upperName%>Services from './<%=name%>-services.ts';

class <%=upperName%>ThemeConfig {
    /**
     * theme name
     * 主题名称
     * @type {string}
     */
    name = '<%=name%>';

    /**
     * website name
     * 网站名称
     */
    website = '<%=upperName%>';

    /**
     * base layout
     * 基本布局
     */
    layout = <%=upperName%>Layout;

    /**
     * routes config
     * 路由配置
     */
    routes = <%=upperName%>Routes;

    /**
     * providers
     */
    providers = {
        <%=upperName%>Const: { ...<%=upperName%>Const, ...EnvConst },
        <%=upperName%>Services
    };
}

export default new <%=upperName%>ThemeConfig();
