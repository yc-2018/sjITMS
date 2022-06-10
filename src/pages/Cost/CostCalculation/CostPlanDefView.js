/*
 * @Author: Liaorongchang
 * @Date: 2022-06-10 09:30:40
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-06-10 11:24:51
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
export default class CostPlanDefView extends QuickViewPage {
  state = { ...this.state, noActionCol: false }; // noActionCol: false
  renderOperateCol = record => {
    return (
      <a
        onClick={() => {
          console.log('点击了111', record);
        }}
        style={{ color: '#3B77E3' }}
      >
        查看
      </a>
    );
  };
}
