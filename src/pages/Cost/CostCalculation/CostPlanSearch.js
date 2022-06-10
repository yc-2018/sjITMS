/*
 * @Author: Liaorongchang
 * @Date: 2022-06-08 10:55:46
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-06-09 11:19:52
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Table, Button, Input, Col, Row, Popconfirm, message, Modal, List } from 'antd';
import { colWidth } from '@/utils/ColWidth';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import StandardTable from '@/components/StandardTable';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class CostPlanSearch extends QuickFormSearchPage {
  //需要操作列的显示 将noActionCol设置为false
  state = { ...this.state, noActionCol: false, downloads: [] }; // noActionCol: false

  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {};

  renderOperateCol = record => {
    return (
      <a onClick={this.onView.bind(this, record)} style={{ color: '#3B77E3' }}>
        核算
      </a>
    );
  };
}
