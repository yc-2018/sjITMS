import React, { PureComponent } from 'react';
import { Table, Button, Input, Col, Row } from 'antd';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import Create from './QuickDemoCreate';
//import Create from "@/pages/Component/Page/QuickPage/QuickCreatePage/QuickCreatePage"
import QuickDemoSearch from './QuickDemoSearch';
import QuickDemoView from './QuickDemoView';
const { Search } = Input;

@connect(({ quick, zztest, loading }) => ({
  quick,
  zztest,
  loading: loading.models.quick,
}))
export default class QuickDemo extends PureComponent {
  state = {
    quickuuid: this.props.route.quickuuid,
  };

  render() {
    if (this.props.zztest.showPage === 'create') {
      return <Create />;
    } else if (this.props.zztest.showPage === 'query') {
      return (
        <QuickDemoSearch quickuuid={this.state.quickuuid} pathname={this.props.location.pathname} />
      );
    } else if (this.props.zztest.showPage === 'view') {
      return <QuickDemoView pathname={this.props.location.pathname} />;
    }
  }
}
