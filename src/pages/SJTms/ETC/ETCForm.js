/*
 * @Author: Liaorongchang
 * @Date: 2022-05-25 09:36:16
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-10-07 11:20:54
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import ETC from './ETC';
import ETCViewPage from './ETCViewPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ETCForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <ETC {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'view') {
      const component = <ETCViewPage {...e.props} />;
      e.component = component;
    }
  };
}
