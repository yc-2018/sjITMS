import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import ContainerReviewBillSearchPage from './ContainerReviewBillSearchPage';
import ContainerReviewBillViewPage from './ContainerReviewBillViewPage';

@connect(({ containerreview, loading }) => ({
  containerreview,
  loading: loading.models.containerreview,
}))
export default class ContainerReviewBill extends Component {
  render() {
    if (this.props.containerreview.showPage === 'query') {
      return <ContainerReviewBillSearchPage pathname={this.props.location.pathname} />;
    } else if (this.props.containerreview.showPage === 'view') {
      return <ContainerReviewBillViewPage pathname={this.props.location.pathname} />;
    }
  }
}