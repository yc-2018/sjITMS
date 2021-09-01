import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { stockAdjBillLocale } from './StockAdjBillLocale';
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';
import StockAdjBillSearchPage from './StockAdjBillSearchPage';
import StockAdjBillViewPage from './StockAdjBillViewPage';
import StockAdjBillCreatePage from './StockAdjBillCreatePage';

@connect(({ stockadj, loading }) => ({
  stockadj,
  loading: loading.models.stockadj,
}))
export default class StockAdjBill extends Component {
  render() {
    if (this.props.stockadj.showPage === 'query') {
      return <StockAdjBillSearchPage pathname={this.props.location.pathname} />;
    } else if (this.props.stockadj.showPage === 'view') {
      return <StockAdjBillViewPage pathname={this.props.location.pathname} />;
    } else if (this.props.stockadj.showPage === 'create') {
      return <StockAdjBillCreatePage entityUuid={this.props.stockadj.entityUuid} pathname={this.props.location.pathname} />;
    } else if (this.props.stockadj.showPage === 'reasonView') {
      return <PreType
        preType={
          PRETYPE['stockAdjReason']
        }
        title={stockAdjBillLocale.reasonTitle}
        backToBefore={
          () => {
            this.props.dispatch({
              type: 'stockadj/onCancelReason',
            })
          }
        }
      />
    }
  }
}