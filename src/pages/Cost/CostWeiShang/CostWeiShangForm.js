/*
 * @Author: guankongjin
 * @Date: 2022-08-20 11:09:50
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-04-21 10:14:52
 * @Description: 唯尚费用
 * @FilePath: \iwms-web\src\pages\Cost\CostWeiShang\CostWeiShangForm.js
 */
import React from 'react';
import { connect } from 'dva';
import CostWeiShangCreate from './CostWeiShangCreate';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/QuickFormSearchPageDefault';
import QuickViewPage from '@/pages/Component/RapidDevelopment/OnlForm/QuickViewPageDefault';
import ExcelImport from '@/components/ExcelImport';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class CostWeiShangForm extends QuickForm {
  onCancel = () => {
    this.switchTab('query');
  };

  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <QuickFormSearchPage {...e.props} />;
      e.component = component;
    }
    if (e.showPageNow == 'create') {
      const component = <CostWeiShangCreate {...e.props} />;
      e.component = component;
    }
    if (e.showPageNow == 'update') {
      const component = <CostWeiShangCreate {...e.props} />;
      e.component = component;
    }
    if (e.showPageNow == 'view') {
      const component = <QuickViewPage {...e.props} />;
      e.component = component;
    }
    if (e.showPageNow == 'import') {
      const component = (
        <ExcelImport
          title="唯尚费用"
          templateType="WEISHANG"
          dispatch={this.props.dispatch}
          uploadType="WeiShang/batchImport"
          cancelCallback={this.onCancel}
        />
      );
      e.component = component;
    }
  };
}
