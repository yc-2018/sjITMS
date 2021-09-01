import { PureComponent } from 'react';
import { connect } from 'dva';
import HighLowStockSearchPage from './HighLowStockSearchPage';

@connect(({ highLowStock, loading }) => ({
  highLowStock,
  loading: loading.models.highLowStock,
}))
export default class HighLowStock extends PureComponent {
  render() {
    if (this.props.highLowStock.showPage === 'query') {
      return <HighLowStockSearchPage pathname={this.props.location.pathname}/>;
    }
  }
}