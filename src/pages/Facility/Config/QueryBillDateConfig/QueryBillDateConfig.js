import { PureComponent } from "react";
import { connect } from 'dva';
import QueryBillDateConfigSearchPage from './QueryBillDateConfigSearchPage';
import PreType from './PreType';
import { PRETYPE } from '@/utils/constants';

@connect(({ queryBillDateConfig, loading }) => ({
  queryBillDateConfig,
  loading: loading.models.queryBillDateConfig,
}))
export default class QueryBillDateConfig extends PureComponent {

  showQuery = () => {
    this.props.dispatch({
      type: 'queryBillDateConfig/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  render() {
    const {
      showPage
    } = this.props.queryBillDateConfig;

    if (showPage === 'query')
      return (<QueryBillDateConfigSearchPage />);
    else if (showPage === 'dateLimit')
      return (<PreType
        preType={PRETYPE['dateLimit']}
        title={'管理查询天数范围'}
        backToBefore={this.showQuery}
      />);
  }
}
