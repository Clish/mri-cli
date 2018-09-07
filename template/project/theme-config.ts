/**
 * theme <%=name%> config
 * @author ...
 */

import {BaseLayout} from 'src/common/layouts/base-layout';
import <%=upperName%>Const from 'src/common/const/<%=name%>.const';
import <%=upperName%>Services from 'src/common/services/<%=name%>.services';
import <%=upperName%>Routes from './<%=name%>-routes';
import EnvConst from 'src/theme/const-env.mri';



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
    layout = BaseLayout;

    /**
     * routes config
     * 路由配置
     */
    routes = <%=upperName%>Routes;

    /**
     * providers
     */
    providers = {
        <%=upperName%>Const: {...<%=upperName%>Const, ...EnvConst},
        <%=upperName%>Services
    }
}

export default new <%=upperName%>ThemeConfig();
