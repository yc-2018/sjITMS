/*
 * @Author: Liaorongchang
 * @Date: 2022-05-25 09:36:16
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-07-25 17:05:25
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import ShippingOrderSearchPage from './ShippingOrderSearchPage';
import ExcelImport from '@/components/ExcelImport';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class StoreForm extends QuickForm {
  onCancel = () => {
    this.switchTab('query');
  };

  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <ShippingOrderSearchPage {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'import') {
      const component = (
        <ExcelImport
          title="托运单"
          templateType="SHIPPINGORDER"
          dispatch={this.props.dispatch}
          uploadType="ShippingOrder/batchImport"
          cancelCallback={this.onCancel}
        />
      );
      e.component = component;
    }
  };
}
