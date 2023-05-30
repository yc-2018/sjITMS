/*
 * @Author: Liaorongchang
 * @Date: 2022-05-25 09:36:16
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-04-20 17:41:07
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import OwnerSearchPage from './OwnerSearchPage';
import OwnerCreatePage from './OwnerCreatePage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class OwnerForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <OwnerSearchPage {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'create') {
      const component = <OwnerCreatePage {...e.props} />;
      e.component = component;
    } else if (e.showPageNow === 'update') {
      const component = <OwnerCreatePage {...e.props} />;
      e.component = component;
    }
  };
}
