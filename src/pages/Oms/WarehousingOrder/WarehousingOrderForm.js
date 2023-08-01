/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 10:48:58
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-07-27 17:20:09
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from './WarehousingOrderSearchPage';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import ExcelImport from '@/components/ExcelImport';
import WarehousingOrderCreatePage from './WarehousingOrderCreatePage';

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
    } else if (e.showPageNow == 'import') {
      const component = (
        <ExcelImport
          title="OMS入库订单"
          templateType="OMSWAREHOUSINGORDER"
          dispatch={this.props.dispatch}
          uploadType="warehousingOrder/uploading"
          cancelCallback={this.onCancel}
        />
      );
      e.component = component;
    } else if (e.showPageNow == 'create') {
      const component = <WarehousingOrderCreatePage {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'update') {
      const component = <WarehousingOrderCreatePage {...e.props} />;
      e.component = component;
    }
  };
}
