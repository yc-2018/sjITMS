/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 10:48:58
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-06-27 16:44:37
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from './AddressReportSearch';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import { log } from 'lodash-decorators/utils';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class AddressReportForm extends QuickForm {
  onCancel = () => {
    this.switchTab('query');
  };

  drawTab = e => {
    if (e.showPageNow == 'query') {
      
      const component = <QuickFormSearchPage {...e.props} />;
      e.component = component;
    } 
  };
}
