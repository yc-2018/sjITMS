/*
 * @Author: Liaorongchang
 * @Date: 2022-05-25 09:36:16
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-09-30 09:32:53
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import ETCApplyRecordSearchPage from './ETCApplyRecordSearchPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class StoreForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <ETCApplyRecordSearchPage {...e.props} />;
      e.component = component;
    }
  };
}
