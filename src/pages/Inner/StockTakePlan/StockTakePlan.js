import { PureComponent } from 'react';
import { connect } from 'dva';
import StockTakePlanSearchPage from './StockTakePlanSearchPage';
import StockTakePlanViewPage from './StockTakePlanViewPage';
import StockTakePlanCreatePage from './StockTakePlanCreate';

@connect(({ stockTakePlanBill, loading }) => ({
  stockTakePlanBill,
  loading: loading.models.stockTakePlanBill,
}))
export default class StockTakePlan extends PureComponent {

  render() {
    if (this.props.stockTakePlanBill.showPage === 'query') {
      return <StockTakePlanSearchPage pathname={this.props.location.pathname} />;
    } else if (this.props.stockTakePlanBill.showPage === 'view') {
      return <StockTakePlanViewPage pathname={this.props.location.pathname} />;
    } else if (this.props.stockTakePlanBill.showPage === 'create') {
      return <StockTakePlanCreatePage pathname={this.props.location.pathname} />;
    }
  }
}