/**
 * 基于业务的服务
 * 继承于 BaseService
 *
 * @author ...
 */

import * as moment from 'moment';
import * as _ from 'lodash';
import { MrServices } from 'masterrt';
import * as mu from 'mzmu';
import router from 'umi/router';
import { $utils } from 'src/services';
import { BaseService } from 'src/common/services/base.services';

class <%=upperName%>Services extends BaseService {
    constructor() {
        super();
    }
}

export default new <%=upperName%>Services();