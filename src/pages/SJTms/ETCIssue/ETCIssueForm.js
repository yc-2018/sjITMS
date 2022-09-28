/*
 * @Author: Liaorongchang
 * @Date: 2022-05-25 09:36:16
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-09-23 16:05:31
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import ETCSearchPage from './ETCSearchPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ETCIssueForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <ETCSearchPage {...e.props} />;
      e.component = component;
    }
  };
}
