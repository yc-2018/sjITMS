import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import InWrhBillSearchPage from './InWrhBillSearchPage';
import ReleaseContentPage from '@/pages/In/ReleaseContent/ReleaseContentPage';
import InWrhBillViewPage from './InWrhBillViewPage';
@connect(({ inwrh, dock, loading }) => ({
  inwrh,
  dock,
  loading: loading.models.inwrh,
}))
export default class InWrhBill extends Component {

  showQuery = () => {
    this.props.dispatch({
      type: 'inwrh/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  render() {
    if (this.props.inwrh.showPage === 'query') {
      return <InWrhBillSearchPage pathname={this.props.location.pathname} billNumber={this.props.inwrh.billNumber}/>;
    }
    if (this.props.inwrh.showPage === 'releasecontentconfig') {
      return <ReleaseContentPage
        backToBefore={this.showQuery}
      />;
    } 
    if (this.props.inwrh.showPage === 'view') {
      return <InWrhBillViewPage pathname={this.props.location.pathname} billNumber={this.props.inwrh.billNumber} />
    }
  }
}
