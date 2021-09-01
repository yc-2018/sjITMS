import { PureComponent } from "react";
import { connect } from "dva";
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';
import AdjBillSearchPage from './AdjBillSearchPage';
import AdjBillViewPage from './AdjBillViewPage';
import AdjBilCreatePage from './AdjBillCreatePage';

@connect(({ adjBill, loading }) => ({
  adjBill,
  loading: loading.models.adjBill,
}))
export default class AdjBill extends PureComponent {

  render() {
    const {
      showPage,
      entityUuid,
      billNumber
    } = this.props.adjBill;

    if (showPage === 'query') {
      return <AdjBillSearchPage pathname={this.props.location.pathname} billNumber={this.props.adjBill.billNumber}/>;
    } else if (showPage === 'view') {
      return <AdjBillViewPage billNumber={billNumber} entityUuid={this.props.adjBill.entityUuid} pathname={this.props.location.pathname}/>
    } else if (showPage === 'adjReason') {
      return <PreType
        preType={
          PRETYPE['adjReason']
        }
        title='修正原因'
        backToBefore={
          () => {
            this.props.dispatch({
              type: 'adjBill/onCancelReason',
            })
          }
        }
      />
    } else if (showPage === 'create') {
      return <AdjBilCreatePage entityUuid={this.props.adjBill.entityUuid} pathname={this.props.location.pathname} billNumber={this.props.adjBill.billNumber}/>;
    }
  }
}
