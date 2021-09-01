
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import CheckInWrhCreatePage from './CheckInWrhCreatePage';

@connect(({ inwrh, loading }) => ({
  inwrh,
  loading: loading.models.inwrh,
}))
export default class CheckInWrh extends Component {
  render() {
    return <CheckInWrhCreatePage pathname={this.props.location.pathname}/>;
  }
}