/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 10:48:58
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-03-19 14:46:12
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import QuickFormSearchPage from './OrderSearch';
import QuickCreatePage from './OrderCreatePage';
import ExcelImport from '@/components/ExcelImport';
// import TestView from './TestView';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class OrderForm extends QuickForm {
  onCancel = () => {
    this.switchTab('query');
  };

  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <QuickFormSearchPage {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'create') {
      const component = <QuickCreatePage {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'import') {
      const component = (
        <ExcelImport
          title="运输订单"
          templateType="TMSORDERBILL"
          dispatch={this.props.dispatch}
          uploadType="cctest/batchImport"
          cancelCallback={this.onCancel}
        />
      );
      e.component = component;
    } else if (e.showPageNow == 'update') {
      const component = <QuickCreatePage {...e.props} />;
      e.component = component;
    }
  };
}