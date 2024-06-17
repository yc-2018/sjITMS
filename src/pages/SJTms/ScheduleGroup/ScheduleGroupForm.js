/*
 * @Author: Liaorongchang
 * @Date: 2022-05-25 09:36:16
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2024-06-14 16:29:28
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import ScheduleGroupSearchPage from './ScheduleGroupSearchPage';
import ScheduleGroupCreatePage from './ScheduleGroupCreatePage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ScheduleGroupForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <ScheduleGroupSearchPage {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'create') {
      const component = <ScheduleGroupCreatePage {...e.props} />;
      e.component = component;
    }
  };
}
