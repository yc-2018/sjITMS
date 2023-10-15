/*
 * @Author: Liaorongchang
 * @Date: 2022-05-25 09:36:16
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-09-26 15:50:31
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import GpsDeviceSearch from './GpsDeviceSearch';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class GpsDeviceForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <GpsDeviceSearch {...e.props} />;
      e.component = component;
    }
  };
}
