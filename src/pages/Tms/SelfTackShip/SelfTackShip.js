import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import SelfTackShipSearchPage from './SelfTackShipSearchPage';
@connect(({ selfTackShip, loading }) => ({
  selfTackShip,
  loading: loading.models.selfTackShip,
}))
export default class SelfTackShip extends Component {
  render() {
    if (this.props.selfTackShip.showPage === 'query') {
      return <SelfTackShipSearchPage pathname={this.props.location.pathname}/>;
    }
  }
}
