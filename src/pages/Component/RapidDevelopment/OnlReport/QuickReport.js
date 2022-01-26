import React, { Component, PureComponent } from 'react';
import { Table, Button, Input, Col, Row } from 'antd';
import { query, queryDate } from '@/services/quick/Quick';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import QuickReportSearch from './QuickReportSearch';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class QuickReport extends Component {
  state = {
    quickuuid: this.props.route.quickuuid,
  };

  render() {
    if (this.props.quick.showPage === 'query') {
      return (
        <QuickReportSearch
          quickuuid={this.state.quickuuid}
          pathname={this.props.location.pathname}
        />
      );
    }
  }
}
