import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import ContainerMergerBillSearchPage from './ContainerMergerBillSearchPage';
import ContainerMergerBillViewPage from './ContainerMergerBillViewPage';

@connect(({ containermerger, loading }) => ({
    containermerger,
  loading: loading.models.containermerger,
}))
export default class ContainerMergerBill extends Component {
  render() {
    if (this.props.containermerger.showPage === 'query') {
      return <ContainerMergerBillSearchPage pathname={this.props.location.pathname}/>;
    } else if(this.props.containermerger.showPage === 'view') {
      return <ContainerMergerBillViewPage pathname={this.props.location.pathname}/>;
    } 
  }
}