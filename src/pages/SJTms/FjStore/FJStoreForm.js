/*
 * @Author: Liaorongchang
 * @Date: 2022-05-25 09:36:16
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-05-25 09:58:09
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import StoreCreatePage from './FJStoreCreatePage';
import StoreSearchPage from './FJStoreSearchPage'

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class FjStoreForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'create') {
      const component = <StoreCreatePage {...e.props} />;
      e.component = component;
    } else if (e.showPageNow === 'update') {
      const component = <StoreCreatePage {...e.props} />;
      e.component = component;
    }else if(e.showPageNow === 'query'){
      const component = <StoreSearchPage {...e.props} />;
      e.component = component;
    }
  };
  
}
