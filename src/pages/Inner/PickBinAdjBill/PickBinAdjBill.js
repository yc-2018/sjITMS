import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import PickBinAdjBillSearchPage from './PickBinAdjBillSearchPage';
import PickBinAdjBillCeatePage from './PickBinAdjBillCeatePage';
import PickBinAdjBillViewPage from './PickBinAdjBillViewPage';

@connect(({ pickBinAdjBill, loading }) => ({
  pickBinAdjBill,
  loading: loading.models.pickBinAdjBill,
}))
export default class PickBinAdjBill extends Component {
  render() {
    if (this.props.pickBinAdjBill.showPage === 'query') {
      return <PickBinAdjBillSearchPage pathname={this.props.location.pathname} />;
    }
    else if (this.props.pickBinAdjBill.showPage === 'create') {
      return <PickBinAdjBillCeatePage pathname={this.props.location.pathname} />
    }
    else {
      return (<PickBinAdjBillViewPage pathname={this.props.location.pathname}
        entityUuid={this.props.pickBinAdjBill.entityUuid} />);
    }
  }
}