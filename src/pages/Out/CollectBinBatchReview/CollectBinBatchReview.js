import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import CollectBinBatchReviewSearchPage from './CollectBinBatchReviewSearchPage';

@connect(({ collectBinBatchReview, loading }) => ({
    collectBinBatchReview,
    loading: loading.models.collectBinBatchReview,
}))
export default class CollectBinBatchReview extends Component {
    render() {
        if (this.props.collectBinBatchReview.showPage === 'query') {
            return <CollectBinBatchReviewSearchPage pathname={this.props.location.pathname}/>;
        }
    }
}