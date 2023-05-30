/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 10:48:58
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-04-26 11:15:18
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from './OutboundOrderSearchPage';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import ExcelImport from '@/components/ExcelImport';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class OutboundOrderForm extends QuickForm {
  onCancel = () => {
    this.switchTab('query');
  };

  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <QuickFormSearchPage {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'import') {
      const component = (
        <ExcelImport
          title = "OMS出库订单"
          templateType = "OMSOUTBOUNDORDER"
          dispatch = {this.props.dispatch}
          uploadType = "outBoundOrder/uploading"
          cancelCallback={this.onCancel}
        />
      );
      e.component = component;
    }
  };
}
