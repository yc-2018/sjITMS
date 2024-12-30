/*
 * @Author: Liaorongchang
 * @Date: 2022-05-25 09:36:16
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-05-25 09:58:09
 * @version: 1.0
 */
import React from 'react';
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import StoreCreatePage from './StoreCreatePage';
import StoreSearchPage from './StoreSearchPage';
import StoreViewPage from '@/pages/SJTms/Store/StoreViewPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class StoreForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow === 'create') e.component = <StoreCreatePage {...e.props} />;
    if (e.showPageNow === 'update') e.component = <StoreCreatePage {...e.props} />;
    if (e.showPageNow === 'query') e.component = <StoreSearchPage {...e.props} />;
    if (e.showPageNow === 'view') e.component = <StoreViewPage {...e.props} />;
  };

}
