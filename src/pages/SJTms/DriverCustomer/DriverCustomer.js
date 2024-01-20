import React from 'react';
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import DriverCustomerCreate from '@/pages/SJTms/DriverCustomer/DriverCustomerCreate';
import DriverCustomerView from '@/pages/SJTms/DriverCustomer/DriverCustomerView';
import DriverCustomerSearch from '@/pages/SJTms/DriverCustomer/DriverCustomerSearch';
import DriverCustomerLessBuy from '@/pages/SJTms/DriverCustomer/DriverCustomerLessBuy';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class DriverCustomer extends QuickForm {
  onCancel = () => {
    this.switchTab('query');
  };

  drawTab = e => {
    if (e.showPageNow == 'create') {
      const component = <DriverCustomerCreate{...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'update') {
      const component = <DriverCustomerCreate{...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'view') {
      const component = <DriverCustomerView {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'query') {
      const component = <DriverCustomerSearch {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'lessbuy') {
      const component = <DriverCustomerLessBuy {...e.props} quickuuid="sj_driver_customer_lessbuy" />;
      e.component = component;
    }
  };
}
