import { PureComponent } from 'react';
import { connect } from 'dva';
import StoreCashCollRecordsSearchPage from './StoreCashCollRecordsSearchPage';
import { PRETYPE } from '@/utils/constants';

@connect(({ store, loading }) => ({
  store,
  loading: loading.models.store,
}))
export default class Store extends PureComponent {

  handleExcelImportCallback = () => {
    this.props.dispatch({
      type: 'store/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  render() {
    if (this.props.store.showPage === 'query') {
      return <StoreCashCollRecordsSearchPage pathname={this.props.location.pathname} />;
    }
  }
}
