import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import ContainerRecycleSearchPage from './ContainerRecycleSearchPage';
import ContainerRecycleViewPage from './ContainerRecycleViewPage';

@connect(({ containerRecycle, loading }) => ({
    containerRecycle,
    loading: loading.models.containerRecycle,
}))
export default class ContainerRecycle extends PureComponent {
    render() {
        if (this.props.containerRecycle.showPage === 'query') {
            return <ContainerRecycleSearchPage pathname={this.props.location.pathname} />;
        } else if (this.props.containerRecycle.showPage === 'view') {
            return <ContainerRecycleViewPage pathname={this.props.location.pathname} />
        }
    }
}