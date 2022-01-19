import React, { Component, PureComponent } from 'react';
import { Table, Button, Input, Col, Row } from 'antd';
import { query, queryDate } from '@/services/quick/Quick';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import QuickSearch from './QuickSearch';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class Quick extends Component {
  state = {
    quickuuid: this.props.route.quickuuid,
  };

  render() {
    if (this.props.quick.showPage === 'query') {
      return (
        <QuickSearch quickuuid={this.state.quickuuid} pathname={this.props.location.pathname} />
      );
    }
  }
}
