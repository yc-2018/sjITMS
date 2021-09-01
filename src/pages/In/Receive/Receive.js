import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import ReceiveSearchPage from './ReceiveSearchPage';
import ReceiveCreatePage from './ReceiveBillCreatePage';
import ReceiveViewPage from './ReceiveViewPage';
@connect(({ receive, loading }) => ({
  receive,
  loading: loading.models.receive,
}))
export default class Receive extends PureComponent {
  render() {
    if (this.props.receive.showPage === 'query') {
      return <ReceiveSearchPage pathname={this.props.location.pathname} billNumber={this.props.receive.billNumber}/>;
    } else if (this.props.receive.showPage === 'create') {
      return <ReceiveCreatePage pathname={this.props.location.pathname} billNumber={this.props.receive.billNumber} entityUuid={this.props.receive.entityUuid} />
    } else if (this.props.receive.showPage === 'view') {
      return <ReceiveViewPage pathname={this.props.location.pathname}  entityUuid={this.props.receive.entityUuid} billNumber={this.props.receive.billNumber}/>
    }
  }
}
