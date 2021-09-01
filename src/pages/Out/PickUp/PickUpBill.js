import { PureComponent } from "react";
import { connect } from 'dva';
import PickUpBillSearchPage from './PickUpBillSearchPage';
import PickUpBillViewPage from './PickUpBillViewPage';
import PickUpBillAuditPage from './PickUpBillAuditPage';
import { pickUpBillLocale } from './PickUpBillLocale';
@connect(({ pickup, loading }) => ({
  pickup,
  loading: loading.models.pickup,
}))
export default class PickUpBill extends PureComponent {

  render() {
    const { showPage, entityUuid } = this.props.pickup;
    if (showPage === 'query') {
      return <PickUpBillSearchPage pathname={this.props.location.pathname} />;
    } else if (showPage === 'create') {
      return <PickUpBillAuditPage pathname={this.props.location.pathname} />
    }else {
      return (<PickUpBillViewPage pathname={this.props.location.pathname} entityUuid={entityUuid} />);
    }
  }
}
