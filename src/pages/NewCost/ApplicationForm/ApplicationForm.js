/*
 * @Author: Liaorongchang
 * @Date: 2022-05-25 09:36:16
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-07-18 14:47:07
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import ApplicationFormCreatePage from './ApplicationFormCreatePage';
import ApplicationFormSearchPage from './ApplicationFormSearchPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class StoreForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'create') {
      const component = <ApplicationFormCreatePage {...e.props} />;
      e.component = component;
    } else if (e.showPageNow === 'update') {
      const component = <ApplicationFormCreatePage {...e.props} />;
      e.component = component;
    } else if (e.showPageNow === 'query') {
      const component = <ApplicationFormSearchPage {...e.props} />;
      e.component = component;
    }
  };
}
