import { PureComponent } from "react";
import { connect } from "dva";
import DecInvBillCreatePage from './DecInvBillCreatePage';
import DecinvBillSearchPage from './DecinvBillSearchPage';
import DecinvBillViewPage from './DecinvBillViewPage';
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';
import { decLocale } from './DecInvBillLocale';
import DecInvBillAuditPage from './DecInvBillAuditPage';
import DecInvAuditBillCreatePage from './DecInvAuditBillCreatePage';

@connect(({ dec, loading }) => ({
  dec,
  loading: loading.models.dec,
}))
export default class DecInvBill extends PureComponent {
  showQuery = () => {
    this.props.dispatch({
      type: 'dec/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  render() {
    const {
      showPage,
      entityUuid,
    } = this.props.dec;

    if (showPage === 'query') {
      return <DecinvBillSearchPage pathname={this.props.location.pathname}/>;
    } else if (showPage === 'view') {
      return <DecinvBillViewPage pathname={this.props.location.pathname}/>
    } else if (showPage === 'decinvType') {
      return (<PreType
        preType={PRETYPE['decinvType']}
        title={decLocale.type}
        backToBefore={this.showQuery}
      />);
    } else if (showPage === 'create') {
      return <DecInvBillCreatePage entityUuid={this.props.dec.entityUuid} pathname={this.props.location.pathname}/>;
    } else if (showPage === 'createAudit') {
      return <DecInvAuditBillCreatePage entityUuid={this.props.dec.entityUuid} pathname={this.props.location.pathname}/>;
    } else if (showPage === 'audit') {
      return <DecInvBillAuditPage pathname={this.props.location.pathname}/>
    }
  }
}
