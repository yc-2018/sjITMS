/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 10:48:58
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-03-29 17:29:57
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import ChargeLoadingSearch from './ChargeLoadingSearch';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ChargeLoading extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <ChargeLoadingSearch {...e.props} />;
      e.component = component;
    }
  };
}
