import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import DispatchCenterShipBillSearchPage from './DispatchCenterShipBillSearchPage';
import DispatchCenterShipBillViewPage from './DispatchCenterShipBillViewPage';

@connect(({ dispatchCenterShipBill, loading }) => ({
  dispatchCenterShipBill,
  loading: loading.models.dispatchCenterShipBill,
}))
export default class DispatchCenterShipBill extends Component {

  render() {
    const { showPage, entityUuid } = this.props.dispatchCenterShipBill;
    if (showPage === 'query') {
      return <DispatchCenterShipBillSearchPage pathname={this.props.location.pathname}/>;
    } else if (showPage === 'view') {
      return <DispatchCenterShipBillViewPage entityUuid={entityUuid} pathname={this.props.location.pathname}/>;
    }
  }
}
