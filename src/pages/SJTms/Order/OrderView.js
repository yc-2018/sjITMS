/*
 * @Author: Liaorongchang
 * @Date: 2022-05-24 09:17:38
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-05-24 17:33:00
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import QuickViewPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickViewPage';
import { message } from 'antd';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//View界面扩展
export default class OrderView extends QuickViewPage {
  /**
   * 编辑
   */
  onEdit = () => {
    console.log('entity', this.entity.V_SJ_ITMS_ORDER[0].STAT);
    if (this.entity.V_SJ_ITMS_ORDER[0].STAT === 'Saved') {
      this.props.switchTab('update', { entityUuid: this.state.entityUuid });
    } else {
      message.error('运输订单不为保存状态，不能修改');
    }
  };
}
