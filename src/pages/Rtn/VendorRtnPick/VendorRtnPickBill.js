import { PureComponent } from "react";
import { connect } from 'dva';
import VendorRtnPickBillSearchPage from './VendorRtnPickBillSearchPage';
import VendorRtnPickBillViewPage from './VendorRtnPickBillViewPage';
import VendorRtnPickBillAuditPage from './VendorRtnPickBillAuditPage';
import { vendorRtnPickLocale } from './VendorRtnPickBillLocale';


@connect(({ vendorRtnPick, loading }) => ({
    vendorRtnPick,
    loading: loading.models.vendorRtnPick,
}))
export default class VendorRtnPickBill extends PureComponent {

    render() {
        const { showPage, entityUuid } = this.props.vendorRtnPick;
        if (showPage === 'query') {
            return <VendorRtnPickBillSearchPage pathname={this.props.location.pathname} />;
        } else if (showPage === 'audit') {
            return <VendorRtnPickBillAuditPage pathname={this.props.location.pathname}
                entityUuid={entityUuid} />;
        } else {
            return <VendorRtnPickBillViewPage pathname={this.props.location.pathname}
                entityUuid={entityUuid} />;
        }
    }
}