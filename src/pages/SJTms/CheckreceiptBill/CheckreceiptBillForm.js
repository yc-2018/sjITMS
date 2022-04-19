/*
 * @Author: Liaorongchang
 * @Date: 2022-04-15 16:05:33
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-18 09:30:26
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import CheckreceiptBillSearch from './CheckreceiptbillSearch';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import PretypeSearch from './Pretype';
import Checkreceipt from './Checkreceipt';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class CheckreceiptBillForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'query') {
      e.props.quickuuid = 'sj_itms_checkreceiptbill';
      const component = <Checkreceipt {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'view') {
      e.props.quickuuid = 'sj_itms_pretype';
      const component = <PretypeSearch {...e.props} />;
      e.component = component;
    }
  };
}
