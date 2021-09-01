import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import ShipPlanBillSearchPage from './ShipPlanBillSearchPage';
import ShipPlanBillViewPage from './ShipPlanBillViewPage';
import ShipPlanBillCreatePage from './ShipPlanBillCreatePage';
import router from 'umi/router';

@connect(({ shipplanbill, loading }) => ({
    shipplanbill,
    loading: loading.models.shipplanbill,
}))
export default class ShipPlanBill extends Component {

    render() {
        let { showPage, entityUuid } = this.props.shipplanbill;
        let { location } = this.props.history;
        if (location && location.items) {
            this.props.dispatch({
                type: 'shipplanbill/showCreatePage',
                payload: {
                    showPage: 'create',
                    entity: { items: location.items }
                }
            })
            location.items = null;
        }

      if (showPage === 'query') {
        return <ShipPlanBillSearchPage pathname={this.props.location.pathname} />;
      } else if (showPage === 'view') {
        return <ShipPlanBillViewPage entityUuid={entityUuid} pathname={this.props.location.pathname} />;
      } else if (showPage === 'create') {
        return <ShipPlanBillCreatePage pathname={this.props.location.pathname} />;
      }
    }
}
