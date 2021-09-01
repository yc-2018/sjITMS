import { PureComponent } from "react";
import { connect } from 'dva';
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';
import StockLockBillCreatePage from './StockLockBillCreatePage';
import StockLockBillSearchPage from './StockLockBillSearchPage';
import StockLockBillViewPage from './StockLockBillViewPage';
import { stockLockBillLocale } from './StockLockBillLocale';


@connect(({ stocklock, loading }) => ({
    stocklock,
    loading: loading.models.stocklock,
}))
export default class StockLockBill extends PureComponent {

    render() {
        const { showPage, entityUuid } = this.props.stocklock;
        if (showPage === 'query') {
          return <StockLockBillSearchPage pathname={this.props.location.pathname}/>;
        }else if (showPage === 'create') {
          return <StockLockBillCreatePage entityUuid={entityUuid} pathname={this.props.location.pathname}/>;
        }else if (showPage === 'reasonView') {
          return <PreType 
              preType = {
                PRETYPE['stockLockBillReason']
              }
              title = {stockLockBillLocale.reasonTitle}
              backToBefore = {
                () => {
                  this.props.dispatch({
                    type: 'stocklock/onCancelReason',
                  })
                }
              }
              />
        }
        else {
          return (<StockLockBillViewPage entityUuid={entityUuid} pathname={this.props.location.pathname}/>);
        }
    }
}