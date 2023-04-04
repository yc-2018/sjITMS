/*
 * @Author: Liaorongchang
 * @Date: 2022-06-30 09:26:38
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-06-30 09:29:38
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from './DifAmountSearch';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ImportForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <QuickFormSearchPage {...e.props} />;
      e.component = component;
    }
  };
}
