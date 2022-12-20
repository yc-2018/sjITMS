/*
 * @Author: Liaorongchang
 * @Date: 2022-04-15 16:05:33
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-12-20 08:57:56
 * @version: 1.0
 */
import React from 'react';
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import CustomerSearch from './CustomerSearch';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageDefault';
import QuickViewPage from '@/pages/Component/RapidDevelopment/OnlForm/QuickViewPageDefault';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class Customer extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'create') {
      const component = <QuickCreatePage {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'update') {
      const component = <QuickCreatePage {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'view') {
      const component = <QuickViewPage {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'query') {
      const component = <CustomerSearch {...e.props} />;
      e.component = component;
    }
  };
}
