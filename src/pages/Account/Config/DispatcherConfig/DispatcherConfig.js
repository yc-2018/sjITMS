import React, { Component } from 'react';
import { Divider, Button, message, Popconfirm } from 'antd';
import { connect } from 'dva';
import { Fragment } from 'react';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import { dispatcherConfigLocale } from './DispatcherConfigLocale';
import DispatcherConfigCreateModal from './DispatcherConfigCreateModal';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import DispatcherConfigSearchForm from './DispatcherConfigSearchForm';
import { convertCodeName } from '@/utils/utils';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';

@connect(({ dispatcherconfig, loading }) => ({
    dispatcherconfig,
    loading: loading.models.dispatcherconfig,
}))
export default class DispatcherConfig extends ConfigSearchPage {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: dispatcherConfigLocale.title,
            data: this.props.dispatcherconfig.data,
            entity: {},
            createModalVisible: false,
            hideLogTab: true
        };
        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    }

    columns = [{
        title: dispatcherConfigLocale.dc,
        dataIndex: 'dc',
        render: (text, record) => record.dc ? convertCodeName(record.dc) : ''
    }, {
        title: dispatcherConfigLocale.dispatcher,
        dataIndex: 'dispatcher',
        render: (text, record) => record.dispatcher ? convertCodeName(record.dispatcher) : ''
    }, {
        title: commonLocale.operateLocale,
        render: record => (
            <Fragment>
                <IPopconfirm onConfirm={this.handleRemove.bind(this, record.uuid, false)} operate={commonLocale.deleteLocale} object={dispatcherConfigLocale.title}>
                    <a>
                        {commonLocale.deleteLocale}
                    </a>
                </IPopconfirm>
            </Fragment>
        ),
    }];

    componentDidMount = () => {
        this.refreshTable();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.dispatcherconfig.data
        });
    }

    refreshTable = (filter) => {
        const { dispatch } = this.props;
        const { pageFilter } = this.state;

        let queryFilter = { ...pageFilter };
        if (filter) {
            queryFilter = { ...pageFilter, ...filter };
        }

        dispatch({
            type: 'dispatcherconfig/query',
            payload: queryFilter,
        });
    };

    onSearch = (data) => {
        const { pageFilter } = this.state;
        if (data) {
            pageFilter.searchKeyValues = {
                ...pageFilter.searchKeyValues,
                ...data
            }
        } else {
            pageFilter.searchKeyValues = {
                companyUuid: loginCompany().uuid,
            }
        }
        this.refreshTable();
    }

    handleCreateModalVisible = (flag, uuid) => {
        this.setState({
            entity: {},
        })

        this.setState({
            createModalVisible: !!flag,
        })
    }

    handleSave = () => {
        const { entity } = this.state;

        let params = {
            ...entity,
            companyUuid: loginCompany().uuid,
        }

        let type = 'dispatcherconfig/add';
        this.props.dispatch({
            type: type,
            payload: params,
            callback: (response) => {
                if (response && response.success) {
                    if (type === 'dispatcherconfig/add') {
                        message.success(commonLocale.saveSuccessLocale);
                    } else if (type === 'dispatcherconfig/modify') {
                        message.success(commonLocale.modifySuccessLocale);
                    }
                    this.handleCreateModalVisible(false);
                    this.refreshTable();
                }
            },
        })
    }

    handleRemove = (uuid, callback) => {
        if (uuid) {
            this.props.dispatch({
                type: 'dispatcherconfig/remove',
                payload: uuid,
                callback: callback ? callback : (response) => {
                    if (response && response.success) {
                        this.refreshTable();
                        message.success(commonLocale.removeSuccessLocale);
                    }
                }
            })
        }
    }

    onBatchRemove = () => {
        this.setState({
            batchAction: commonLocale.deleteLocale,
        });
        this.handleBatchProcessConfirmModalVisible(true);
    }

    onBatchProcess = () => {
        const { selectedRows, batchAction } = this.state;

        const that = this;
        selectedRows.forEach(item => {
            if (batchAction === commonLocale.deleteLocale) {
                that.handleRemove(item.uuid, that.batchCallback);
            }
        });
    }

    drawCreateModal = () => {
        const {
            entity,
            selectedRows,
            createModalVisible,
        } = this.state;

        const createModalProps = {
            entity: entity,
            modalVisible: createModalVisible,
            handleCreateModalVisible: this.handleCreateModalVisible,
            handleSave: this.handleSave,
            loading: this.props.loading,
        }

        return <DispatcherConfigCreateModal {...createModalProps} />
    }

    drawSearchPanel = () => {
        const { pageFilter } = this.state;
        return (<DispatcherConfigSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} />);
    }

    drawActionButton() {
        return (
            <Fragment>
                <Button type='primary' icon="plus"
                    onClick={() => this.handleCreateModalVisible(true)}
                >
                    {commonLocale.createLocale}
                </Button>
            </Fragment>
        );
    }

    drawToolbarPanel() {
        return (
            <Fragment>
                <Button
                    onClick={() =>
                        this.onBatchRemove()
                    }
                >
                    {commonLocale.batchRemoveLocale}
                </Button>
            </Fragment>
        );
    }
}