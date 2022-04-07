/*
 * @Author: Liaorongchang
 * @Date: 2022-04-01 10:45:42
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-01 16:09:07
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import QuickViewPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickViewPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//View界面扩展
export default class ChargeLoadingViewPage extends QuickViewPage {
  state = { ...this.state, viewStyle: { noTitle: true, card: true } };

  componentDidMount() {
    this.init();
    this.props.onRef(this);
  }
}
