/*
 * @Author: Liaorongchang
 * @Date: 2022-04-15 16:05:33
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-10-20 14:32:23
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import HighWayAreaSearchPage from './HighWayAreaSearchPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class HighWayAreaForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <HighWayAreaSearchPage {...e.props} />;
      e.component = component;
    }
  };
}
