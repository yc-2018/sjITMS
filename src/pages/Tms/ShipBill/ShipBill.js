import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import ShipBillSearchPage from './ShipBillSearchPage';
import ShipBillViewPage from './ShipBillViewPage';
import ShipBillCreatePage from './ShipBillCreatePage';

@connect(({ shipbill, loading }) => ({
    shipbill,
    loading: loading.models.shipbill,
}))
export default class ShipBill extends Component {

    render() {
        const { showPage, entityUuid } = this.props.shipbill;
        let { location } = this.props.history;

        if (location && location.items) {
            let unShipItems = [];
            location.items.forEach(function (item) {
                let unShipItem = {
                    fromOrg: item.fromOrg,
                    store: item.toOrg
                }
                unShipItems.push(unShipItem);
            });

            this.props.dispatch({
                type: 'shipbill/onGenerateShipBill',
                payload: unShipItems
            })
            location.items = null;
        }


        if (location && location.shipPlanBillNumber) {
            this.props.dispatch({
                type: 'shipbill/showCreatePage',
                payload: {
                    showPage: 'create',
                    entity: { shipPlanBillNumber: location.shipPlanBillNumber }
                }
            })
            location.shipPlanBillNumber = null;
        }

        if (showPage === 'query') {
            return <ShipBillSearchPage />;
        } else if (showPage === 'view') {
          return <ShipBillViewPage entityUuid={entityUuid} pathname={this.props.location.pathname} />;
        } else if (showPage === 'create') {
          return <ShipBillCreatePage pathname={this.props.location.pathname}/>;
        }
    }
}
