import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import ContainerBindBillSearchPage from './ContainerBindBillSearchPage';
import ContainerBindBillViewPage from './ContainerBindBillViewPage';

@connect(({ containerbind, loading }) => ({
    containerbind,
    loading: loading.models.containerbind,
}))
export default class ContainerBindBill extends Component {
    render() {
        if (this.props.containerbind.showPage === 'query') {
            return <ContainerBindBillSearchPage pathname={this.props.location.pathname}/>;
        } else if (this.props.containerbind.showPage === 'view') {
            return <ContainerBindBillViewPage pathname={this.props.location.pathname}/>;
        }
    }
}