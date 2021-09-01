import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import CollectBinReviewBillSearchPage from './CollectBinReviewBillSearchPage';
import CollectBinReviewBillViewPage from './CollectBinReviewBillViewPage';

@connect(({ collectbinreview, loading }) => ({
    collectbinreview,
    loading: loading.models.collectbinreview,
}))
export default class CollectBinReviewBill extends Component {
    render() {
        if (this.props.collectbinreview.showPage === 'query') {
            return <CollectBinReviewBillSearchPage pathname={this.props.location.pathname}/>;
        } else if (this.props.collectbinreview.showPage === 'view') {
            return <CollectBinReviewBillViewPage pathname={this.props.location.pathname}/>;
        }
    }
}