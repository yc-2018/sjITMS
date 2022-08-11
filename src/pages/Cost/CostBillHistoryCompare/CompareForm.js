/*
 * @Author: Liaorongchang
 * @Date: 2022-06-08 10:38:44
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-08-11 17:10:36
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
      let param;
      if (state?.param == undefined) {
        param = { compareNum: '', billNumber: '' };
      } else {
        param = state.param;
      }
      const component = <CompareSearch {...e.props} param={param} />;
      e.component = component;
    }
  };
}
