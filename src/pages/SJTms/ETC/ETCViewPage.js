/*
 * @Author: Liaorongchang
 * @Date: 2022-10-07 11:13:28
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-10-07 11:20:22
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickViewPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickViewPage';
import { message } from 'antd';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ETCViewPage extends QuickViewPage {
  /**
   * 编辑
   */
  onEdit = () => {
    console.log('state', this.entity);
    if (this.entity.sj_itms_pass_card[0].STATE == 'Using') {
      message.error('该粤通卡已发卡，不可编辑');
      return;
    }
    this.props.switchTab('update', { entityUuid: this.state.entityUuid });
  };
}
