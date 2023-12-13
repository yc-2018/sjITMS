/*
 * @Author: Liaorongchang
 * @Date: 2022-05-25 09:36:16
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-09-13 11:19:45
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import CostPlanApplySearchPage from './CostPlanApplySearchPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class CostPlanApplyForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow === 'query') {
      const component = <CostPlanApplySearchPage {...e.props} />;
      e.component = component;
    }
  };
}
