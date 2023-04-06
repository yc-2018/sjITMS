/*
 * @Author: Liaorongchang
 * @Date: 2022-06-30 09:26:38
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-04-06 09:57:31
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from './DifAmountSearch';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import ExcelImport from '@/components/ExcelImport';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ImportForm extends QuickForm {
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
          title="粤通卡消费金额"
          templateType="ETCCOST"
          dispatch={this.props.dispatch}
          uploadType="etcCost/uploading"
          cancelCallback={this.onCancel}
        />
      );
      e.component = component;
    }
  };
}
