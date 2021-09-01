import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import StockTakeBillSerchPage from './StockTakeBillSerchPage';
import StockTakeBillCreatePage from './StockTakeBillCreatePage';
import StockTakeBillViewPage from './StockTakeBillViewPage';

@connect(({ stockTakeBill, loading }) => ({
  stockTakeBill,
  loading: loading.models.stockTakeBill,
}))
export default class StockTakeBill extends Component {
  render() {
    if (this.props.stockTakeBill.showPage === 'query') {
      return <StockTakeBillSerchPage pathname={this.props.location.pathname} />;
    }
    else if (this.props.stockTakeBill.showPage === 'create') {
      return <StockTakeBillCreatePage pathname={this.props.location.pathname}
        entityUuid={this.props.stockTakeBill.entityUuid} />
    }
    else {
      return (<StockTakeBillViewPage pathname={this.props.location.pathname}
        entityUuid={this.props.stockTakeBill.entityUuid} />);
    }
  }
}