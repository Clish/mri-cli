/**
 * dva.ts
 * 项目启动，配置全局设置以及预加载
 * 其他详见 https://dvajs.com/guide/getting-started.html#connect-%E8%B5%B7%E6%9D%A5
 *
 * @author ...
 */

import $theme from 'src/theme';
import { MrServices } from 'masterrt';
import * as mu from 'mzmu';
import { $pool, $utils, $intl } from 'src/services';

export default function config() {
    let <%=upperName%>Const = $theme.getProviders('<%=upperName%>Const');

    console.debug('init::-> dva <%=name%>');

    MrServices.setHeaders({
        'X-TOKEN': () => mu.storage(<%=upperName%>Const.STORAGE_X_TOKEN) || '',
        'X-LANG': () => mu.storage(<%=upperName%>Const.STORAGE_LOCALE) || <%=upperName%>Const.LOCALE,
        'X-ORIGIN': <%=upperName%>Const['X-ORIGIN']
    });

    MrServices.setResourcePool($pool);

    return {
        onError(err) {
            // message.error(err.message);
            err.preventDefault();
        },

        initialState: {
            global: {
                text: 'hi mri'
            }
        }
    };
}
