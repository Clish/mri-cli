/**
 * theme <%=name%> config
 * @author ...
 */

import {BaseLayout} from 'src/common/layouts/base-layout';
import <%=upperName%>Const from 'src/common/const/<%=name%>.const';
import <%=upperName%>Services from 'src/common/services/<%=name%>.services';
import <%=upperName%>Routes from './<%=name%>-routes';

import SocialConst from '../../common/const/social.const';
import SocialServices from '../social/social-services';
import OneLorealConst from '../../common/const/one-loreal.const';
import OneLorealServices from '../../common/services/one-loreal.services';
import DbpiServices from '../../common/services/dbpi.services';
import CsiServices from 'src/common/services/csi.services';
import CsiConst from '../../common/const/csi.const';
import {Rm3Layout} from '../../common/layouts/rm3-layout';
import DbpiConst from '../../common/const/dbpi.const';

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
        DbpiConst,
        DbpiServices,
        CsiConst,
        CsiServices,
        OneLorealConst,
        OneLorealServices,
        SocialConst,
        SocialServices,
        <%=upperName%>Const,
        <%=upperName%>Services
    };
}

export default new <%=upperName%>ThemeConfig();
