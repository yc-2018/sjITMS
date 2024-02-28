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
export default class DriverCustomerView extends QuickViewPage {
  //编辑
  onEdit = () => {
    if (['Saved','Released','Rejected'].includes(this.entity.v_sj_itms_driver_customer[0].PROCESSINGSTATE))
      this.props.switchTab('update', { entity: this.entity.v_sj_itms_driver_customer[0] })
    else message.error('回复后不能再编辑了！');
  }

}
