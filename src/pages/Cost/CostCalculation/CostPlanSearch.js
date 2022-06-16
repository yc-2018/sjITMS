/*
 * @Author: Liaorongchang
 * @Date: 2022-06-08 10:55:46
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-06-15 15:23:16
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Form, Button } from 'antd';
import { colWidth } from '@/utils/ColWidth';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { connect } from 'dva';
import CostPlanIndex from '@/pages/Cost/CostPlan/CostPlanIndex';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class CostPlanSearch extends CostPlanIndex {
  //需要操作列的显示 将noActionCol设置为false
  state = { ...this.state, title: '费用计算' }; // noActionCol: false
  drawButtion = () => {};

  onView = e => {
    this.props.switchTab('view', { entityUuid: e.UUID, e });
  };

  drawButton = e => {
    return (
      <div style={{ float: 'right' }}>
        <Button type="primary" style={{ marginRight: '10px' }} onClick={() => this.onView(e)}>
          核算
        </Button>
      </div>
    );
  };
}
