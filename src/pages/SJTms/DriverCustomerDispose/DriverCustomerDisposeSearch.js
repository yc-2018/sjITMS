import React from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class DriverCustomerDisposeSearch extends QuickFormSearchPage {
  state = { ...this.state, isRadio: true, departments: [] };

}
