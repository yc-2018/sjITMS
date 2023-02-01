/*
 * @Author: Liaorongchang
 * @Date: 2022-04-15 16:05:33
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-02-01 11:36:26
 * @version: 1.0
 */
import React from 'react';
import { connect } from 'dva';
import CustomerCreate from './CustomerCreate';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import CustomerSearch from './CustomerSearch';
import CustomerView from './CustomerView';
import ExcelImport from '@/components/ExcelImport';
import { havePermission } from '@/utils/authority';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class Customer extends QuickForm {
  onCancel = () => {
    this.switchTab('query');
  };

  drawTab = e => {
    if (e.showPageNow == 'create') {
      const component = <CustomerCreate {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'update') {
      const component = <CustomerCreate {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'view') {
      const component = <CustomerView {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'query') {
      const component = <CustomerSearch {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'import') {
      const component = (
        <ExcelImport
          title="客服工单"
          templateType="CUSTOMERSERVICESBILL"
          dispatch={this.props.dispatch}
          uploadType="Customer/batchImport"
          uploadParams={{ isManager: !havePermission(this.state.authority + '.norm') }}
          cancelCallback={this.onCancel}
        />
      );
      e.component = component;
    }
  };
}
