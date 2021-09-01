import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import RplSearchPage from './RplSearchPage';
import RplViewPage from './RplViewPage';
import RplAuditPage from './RplAuditPage';
@connect(({ rpl, loading }) => ({
  rpl,
  loading: loading.models.rpl,
}))
export default class Rpl extends PureComponent {
  render() {
    if (this.props.rpl.showPage === 'query') {
      return <RplSearchPage pathname={this.props.location.pathname}/>;
    } else if (this.props.rpl.showPage === 'view') {
      return <RplViewPage pathname={this.props.location.pathname}/>
    } else if (this.props.rpl.showPage === 'create') {
      return <RplAuditPage pathname={this.props.location.pathname}/>
    }
  }
}
