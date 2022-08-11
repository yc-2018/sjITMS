/*
 * @Author: Liaorongchang
 * @Date: 2022-06-08 10:38:44
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-08-10 17:57:15
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import CompareSearch from './CompareSearch';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class CompareForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'query') {
      const { state } = this.props.location;
      const component = <CompareSearch {...e.props} param={state.param} />;
      e.component = component;
    }
  };
}
