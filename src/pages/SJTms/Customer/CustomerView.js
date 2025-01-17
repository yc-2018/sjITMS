/*
 * @Author: Liaorongchang
 * @Date: 2022-05-24 09:17:38
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-01-06 08:49:34
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickViewPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickViewPage';
import { message } from 'antd';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class CustomerView extends QuickViewPage {
  //编辑
  onEdit = () => {
    if (this.entity.v_sj_itms_customer_service[0].STATUS.indexOf('Finished') == -1) {
      this.props.switchTab('update', { entityUuid: this.state.entityUuid });
    } else {
      message.error('该客服工单已完结，不能修改');
    }
  };
}
