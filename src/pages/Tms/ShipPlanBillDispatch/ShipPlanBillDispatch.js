import { connect } from 'dva';
import React, { Component, Fragment } from 'react';
import ShipPlanBillDispatchSearchPage from './ShipPlanBillDispatchSearchPage';
import ShipPlanBillDispatchCreatePage from './ShipPlanBillDispatchCreatePage';
import ShipPlanBillDispatchViewPage from './ShipPlanBillDispatchViewPage';
@connect(({ shipPlanBillDispatch, loading }) => ({
  shipPlanBillDispatch,
  loading: loading.models.shipPlanBillDispatch,
}))
export default class ShipPlanBillDispatch extends Component {
  render() {
    const { showPage,entityUuid } = this.props.shipPlanBillDispatch;

    if (showPage === 'query') {
      return <ShipPlanBillDispatchSearchPage pathname={this.props.location.pathname}/>;
    }else if (showPage === 'view') {
      return <ShipPlanBillDispatchViewPage entityUuid={entityUuid} />;
    } else if (showPage === 'create') {
        return <ShipPlanBillDispatchCreatePage  pathname={this.props.location.pathname} entityUuid={entityUuid}/>;
    }
  }
}