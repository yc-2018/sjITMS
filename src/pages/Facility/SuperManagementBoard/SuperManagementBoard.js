import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import SuperManagementBoardSearchPage from './SuperManagementBoardSearchPage'

@connect(({ supermanagement, loading }) => ({
  supermanagement,
  loading: loading.models.supermanagement,
}))
export default class SuperManagementBoard extends Component {
  render() {
    return <SuperManagementBoardSearchPage pathname={this.props.location.pathname}/>;
  }
}