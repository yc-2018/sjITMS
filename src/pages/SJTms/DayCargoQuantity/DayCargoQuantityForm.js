/*
 * @Author: Liaorongchang
 * @Date: 2022-04-15 16:05:33
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-20 11:31:34
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import DayCargoQuantitySearch from './DayCargoQuantitySearch';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class DayCargoQuantityForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'query') {
      e.props.quickuuid = 'v_itms_cargovolume_day_yd';
      const component = <DayCargoQuantitySearch {...e.props} />;
      e.component = component;
    } 
  };
}
