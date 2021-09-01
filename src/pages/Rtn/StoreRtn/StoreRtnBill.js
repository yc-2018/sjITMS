import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import StoreRtnBillSearchPage from './StoreRtnBillSearchPage';
import StoreRtnBillCreatePage from './StoreRtnBillCreatePage';
import StoreRtnBillViewPage from './StoreRtnBillViewPage';
import NoNtcStoreRtnBillCreatePage from './NoNtcStoreRtnBillCreatePage';
@connect(({ storeRtn, loading }) => ({
    storeRtn,
    loading: loading.models.storeRtn,
}))
export default class StoreRtnBill extends PureComponent {
    render() {
        let { location } = this.props.history;
        if (location && location.rtnNtcBillNumber) {
            this.props.dispatch({
                type: 'storeRtn/showCreatePage',
                payload: {
                    showPage: 'create',
                    entity: { rtnNtcBillNumber: location.rtnNtcBillNumber }
                }
            })
            location.rtnNtcBillNumber = null;
        }


        if (this.props.storeRtn.showPage === 'query') {
            return <StoreRtnBillSearchPage pathname={this.props.location.pathname} />;
        } else if (this.props.storeRtn.showPage === 'create') {
          return <StoreRtnBillCreatePage pathname={this.props.location.pathname}
                                         entityUuid={this.props.storeRtn.entityUuid} />
        } else if (this.props.storeRtn.showPage === 'createno') {
          return <NoNtcStoreRtnBillCreatePage pathname={this.props.location.pathname}
                                         entityUuid={this.props.storeRtn.entityUuid} />
        } else if (this.props.storeRtn.showPage === 'view') {
            return <StoreRtnBillViewPage pathname={this.props.location.pathname} />
        }
    }
}
