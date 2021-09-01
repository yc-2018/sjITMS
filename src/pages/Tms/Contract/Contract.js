import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import ContractSearchPage from './ContractSearchPage';
import ContractCreatePage from './ContractCreatePage';

@connect(({ alcNtc, loading }) => ({
  alcNtc,
  loading: loading.models.alcNtc,
}))
export default class AlcDiffBill extends PureComponent {
  render() {
    if (this.props.alcNtc.showPage === 'query') {
      return <ContractSearchPage pathname={this.props.location.pathname} />;
    } else if (this.props.alcNtc.showPage === 'create') {
      return <ContractCreatePage pathname={this.props.location.pathname}
                                    entityUuid={this.props.alcNtc.entityUuid} />
    }
  }
}
