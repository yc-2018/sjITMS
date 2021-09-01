import { PureComponent } from "react";
import { connect } from 'dva';
import CrossPickUpBillSearchPage from './CrossPickUpBillSearchPage';
import CrossPickUpBillViewPage from './CrossPickUpBillViewPage';
import CrossPickUpBillAuditPage from './CrossPickUpBillAuditPage';
import { CrossPickUpBillLocale } from './CrossPickUpBillLocale';
@connect(({ crossPickUp, loading }) => ({
  crossPickUp,
  loading: loading.models.crossPickUp,
}))
export default class ArrayCrossPickUpBill extends PureComponent {

  render() {
    const { showPage, entityUuid } = this.props.crossPickUp;
    if (showPage === 'query') {
      return <CrossPickUpBillSearchPage pathname={this.props.location.pathname} />;
    } else if (showPage === 'create') {
      return <CrossPickUpBillAuditPage pathname={this.props.location.pathname} />
    }else {
      return (<CrossPickUpBillViewPage pathname={this.props.location.pathname} entityUuid={entityUuid} />);
    }
  }
}
