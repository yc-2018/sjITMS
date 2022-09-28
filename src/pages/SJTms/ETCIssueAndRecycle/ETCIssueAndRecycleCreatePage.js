/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 11:29:14
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-09-27 17:43:22
 * @version: 1.0
 */
import { connect } from 'dva';
import { Form, Input } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class ETCCreatePage extends QuickCreatePage {
  state = {
    ...this.state,
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.params.entityUuid !== nextProps.params.entityUuid) {
      this.init();
    }
    if (nextProps.passCard != this.props.passCard) {
      this.recommendCard(nextProps.passCard);
    }
  }

  recommendCard = passCard => {
    this.setFieldsValue('v_sj_itms_etc_issueandrecycle', 'ETCCODE', passCard.innerno, 0);
    this.setFieldsValue('v_sj_itms_etc_issueandrecycle', 'CARDNO', passCard.cardno, 0);
  };

  getEntity = () => {
    return this.entity;
  };
}
