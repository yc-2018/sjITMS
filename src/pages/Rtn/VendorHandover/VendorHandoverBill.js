import { connect } from 'dva';
import React, { PureComponent } from 'react';
import VendorHandoverBillCreatePage from './VendorHandoverBillCreatePage';
import VendorHandoverBillSearchPage from './VendorHandoverBillSearchPage';
import VendorHandoverBillViewPage from './VendorHandoverBillViewPage';
@connect(({ vendorHandover, loading }) => ({
    vendorHandover,
    loading: loading.models.vendorHandover,
}))
export default class VendorHandoverBill extends PureComponent {
    render() {
        if (this.props.vendorHandover.showPage === 'query') {
            return <VendorHandoverBillSearchPage pathname={this.props.location.pathname} />;
        } else if (this.props.vendorHandover.showPage === 'create') {
            return <VendorHandoverBillCreatePage pathname={this.props.location.pathname}
                entityUuid={this.props.vendorHandover.entityUuid} />
        } else if (this.props.vendorHandover.showPage === 'view') {
            return <VendorHandoverBillViewPage pathname={this.props.location.pathname} />
        }
    }
}