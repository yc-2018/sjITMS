/*
 * @Author: Liaorongchang
 * @Date: 2022-05-25 09:36:16
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-11-11 10:00:28
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import VehicleWeightSearchPage from './VehicleWeightSearchPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class VehicleWeightForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <VehicleWeightSearchPage {...e.props} />;
      e.component = component;
    }
  };
}
