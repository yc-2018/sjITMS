import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import VendorDispatchsearchPage from './VendorDispatchsearchPage';
import VendorDispatchViewPage from './VendorDispatchViewPage';
@connect(({ vendorDispatch, loading }) => ({
    vendorDispatch,
    loading: loading.models.vendorDispatch,
}))
export default class VendorDispatch extends PureComponent {
    render() {
        if (this.props.vendorDispatch.showPage === 'query') {
            return <VendorDispatchsearchPage pathname={this.props.location.pathname} />;
        } else if (this.props.vendorDispatch.showPage === 'view') {
            return <VendorDispatchViewPage pathname={this.props.location.pathname} />
        }
    }
}