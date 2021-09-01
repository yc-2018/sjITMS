import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import StoreHandoverBillSearchPage from './StoreHandoverBillSearchPage';
import StoreHandoverBillConfirmPage from './StoreHandoverBillConfirmPage';
import StoreHandoverBillViewPage from './StoreHandoverBillViewPage';
@connect(({ storeHandover, loading }) => ({
    storeHandover,
    loading: loading.models.storeHandover,
}))
export default class StoreHandoverBill extends PureComponent {
    render() {
        if (this.props.storeHandover.showPage === 'query') {
            return <StoreHandoverBillSearchPage pathname={this.props.location.pathname}/>;
        } else if (this.props.storeHandover.showPage === 'create') {
            return <StoreHandoverBillConfirmPage pathname={this.props.location.pathname}/>
        } else if (this.props.storeHandover.showPage === 'view') {
            return <StoreHandoverBillViewPage pathname={this.props.location.pathname}/>
        }
    }
}