/*
 * @Author: Liaorongchang
 * @Date: 2022-05-25 09:36:16
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-11-14 10:26:35
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import ScheduleCustomerSearchPage from './ScheduleCustomerSearchPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ScheduleCustomerForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <ScheduleCustomerSearchPage {...e.props} />;
      e.component = component;
    }
  };
}
