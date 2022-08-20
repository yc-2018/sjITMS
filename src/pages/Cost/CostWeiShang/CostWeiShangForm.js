/*
 * @Author: guankongjin
 * @Date: 2022-08-20 11:09:50
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-08-20 11:32:47
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\Cost\CostWeiShang\CostWeiShangForm.js
 */
import React from 'react';
import { connect } from 'dva';
import CostWeiShangCreate from './CostWeiShangCreate';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/QuickFormSearchPageDefault';
import QuickViewPage from '@/pages/Component/RapidDevelopment/OnlForm/QuickViewPageDefault';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class CostWeiShangForm extends QuickForm {
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
  };
}
