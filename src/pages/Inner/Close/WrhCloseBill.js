import { PureComponent } from "react";
import { connect } from "dva";
import WrhCloseBillCreatePage from './WrhCloseBillCreatePage';
import WrhCloseBillSearchPage from './WrhCloseBillSearchPage';
import WrhCloseBillViewPage from './WrhCloseBillViewPage';
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';
import { closeLocale } from './WrhCloseBillLocale';

@connect(({ close, loading }) => ({
  close,
  loading: loading.models.dec,
}))
export default class WrhCloseBill extends PureComponent {
  showQuery = () => {
    this.props.dispatch({
      type: 'close/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  render() {
    const {
      showPage,
      entityUuid,
    } = this.props.close;

    if (showPage === 'query') {
      return <WrhCloseBillSearchPage pathname={this.props.location.pathname}/>;
    } else if (showPage === 'view') {
      return <WrhCloseBillViewPage pathname={this.props.location.pathname}/>
    } else if (showPage === 'closeReason') {
      return (<PreType
        preType={PRETYPE['closeReason']}
        title={closeLocale.closeReason}
        backToBefore={this.showQuery}
      />);
    } else if (showPage === 'create') {
      return <WrhCloseBillCreatePage entityUuid={entityUuid} pathname={this.props.location.pathname}/>;
    } 
  }
}

