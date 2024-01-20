import React from 'react';
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import DriverCustomerDisposeSearch from '@/pages/SJTms/DriverCustomerDispose/DriverCustomerDisposeSearch';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class Customer extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <DriverCustomerDisposeSearch {...e.props} />;
      e.component = component;
    }
  };
}
