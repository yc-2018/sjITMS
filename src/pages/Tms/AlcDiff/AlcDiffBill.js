import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import AlcDiffBillSearchPage from './AlcDiffBillSearchPage';
import AlcDiffBillCreatePage from './AlcDiffBillCreatePage';
import AlcDiffBillViewPage from './AlcDiffBillViewPage';
import AlcDiffBillApproveEditPage from './AlcDiffBillApproveEditPage';

@connect(({ alcDiff, loading }) => ({
    alcDiff,
    loading: loading.models.alcDiff,
}))
export default class AlcDiffBill extends PureComponent {
    render() {
        if (this.props.alcDiff.showPage === 'query') {
            return <AlcDiffBillSearchPage pathname={this.props.location.pathname} />;
        } else if (this.props.alcDiff.showPage === 'create') {
            return <AlcDiffBillCreatePage pathname={this.props.location.pathname}
                entityUuid={this.props.alcDiff.entityUuid} />
        } else if (this.props.alcDiff.showPage === 'view') {
            return <AlcDiffBillViewPage pathname={this.props.location.pathname} />
        } else if (this.props.alcDiff.showPage === 'edit') {
            return <AlcDiffBillApproveEditPage pathname={this.props.location.pathname}
                entityUuid={this.props.alcDiff.entityUuid} />
        }
    }
}