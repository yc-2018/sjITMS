import React, { Component } from 'react';
import { Divider, Button, message, Popconfirm } from 'antd';
import { connect } from 'dva';
import { Fragment } from 'react';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import { colWidth } from '@/utils/ColWidth';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import AttachmentConfigSearchForm from './AttachmentConfigSearchForm';
import { attachmentConfigLocale } from './AttachmentConfigLocale';
import AttachmentConfigCreateModal from './AttachmentConfigCreateModal';
@connect(({ attachmentconfig, loading }) => ({
    attachmentconfig,
    loading: loading.models.attachmentconfig,
}))
export default class AttachmentConfig extends ConfigSearchPage {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: attachmentConfigLocale.title,
            data: this.props.attachmentconfig.data,
            entity: {},
            createModalVisible: false,
            logCaption: 'AttachmentConfig'
        };
        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
        this.state.pageFilter.sortFields = {};
    }

    columns = [{
        title: commonLocale.codeLocale,
        dataIndex: 'code',
        sorter:true,
        width: colWidth.codeColWidth
    }, {
        title: commonLocale.nameLocale,
        dataIndex: 'name',
        sorter:true,
        width: colWidth.codeColWidth
    }, {
        title: attachmentConfigLocale.review,
        key: 'review',
        dataIndex: 'review',
        sorter:true,
        width: colWidth.enumColWidth,
        render: (text, record) => record.review ? '是' : '否'
    }, {
        title: attachmentConfigLocale.ship,
        key: 'ship',
        dataIndex: 'ship',
        sorter:true,
        width: colWidth.enumColWidth,
        render: (text, record) => record.ship ? '是' : '否'
    }, {
        title: attachmentConfigLocale.returned,
        key: 'returned',
        dataIndex: 'returned',
        sorter:true,
        width: colWidth.enumColWidth,
        render: (text, record) => record.returned ? '是' : '否'
    },{
        title: commonLocale.operateLocale,
        width: colWidth.operateColWidth,
        render: record => (
            <Fragment>
                <a onClick={() => this.handleCreateModalVisible(true, record.uuid)}>
                    {commonLocale.editLocale}
                </a>
                <Divider type="vertical" />
                <IPopconfirm onConfirm={() => this.handleRemove(record.uuid, null)}
                    operate={commonLocale.deleteLocale}
                    object={attachmentConfigLocale.title}>
                    <a>{commonLocale.deleteLocale}</a>
                </IPopconfirm>
            </Fragment>
        ),
    }];

    componentDidMount = () => {
        this.refreshTable();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.attachmentconfig.data
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
            type: 'attachmentconfig/query',
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
                dcUuid: loginOrg().uuid
            }
        }
        this.refreshTable();
    }

    handleCreateModalVisible = (flag, uuid) => {
        if (flag && uuid) {
            this.fetchEntity(uuid);
        } else if (!uuid) {
            this.setState({
                entity: {
                    ship: false,
                    review: false
                },
            })
        }

        this.setState({
            createModalVisible: !!flag,
        })
    }

    fetchEntity = (uuid) => {
        this.props.dispatch({
            type: 'attachmentconfig/get',
            payload: uuid,
            callback: response => {
                if (response && response.success) {
                    let data = response.data;
                    if (data) {
                        this.setState({
                            entity: data,
                        })
                    }
                }
            }
        });
    }

    handleSaveOrModify = (fieldsValue) => {
        const { entity } = this.state;

        let params = {
            ...fieldsValue,
            companyUuid: loginCompany().uuid,
            dcUuid: loginOrg().uuid
        }

        //delete params['dockGroup'];

        let type = 'attachmentconfig/add';
        if (entity.uuid) {
            type = 'attachmentconfig/modify';
            params['uuid'] = entity.uuid;
            params['version'] = entity.version;
        }

        this.props.dispatch({
            type: type,
            payload: params,
            callback: (response) => {
                if (response && response.success) {
                    if (type === 'attachmentconfig/add') {
                        message.success(commonLocale.saveSuccessLocale);
                    } else if (type === 'attachmentconfig/modify') {
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
                type: 'attachmentconfig/remove',
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
            batchAction: commonLocale.batchRemoveLocale,
        });
        this.handleBatchProcessConfirmModalVisible(true);
    }

    onBatchProcess = () => {
        const { selectedRows, batchAction } = this.state;

        const that = this;
        selectedRows.forEach(item => {
            if (batchAction === commonLocale.batchRemoveLocale) {
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
            handleSaveOrModify: this.handleSaveOrModify,
            loading: this.props.loading,
        }

        return <AttachmentConfigCreateModal {...createModalProps} />
    }

    drawSearchPanel = () => {
        const { pageFilter } = this.state;
        return (<AttachmentConfigSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} />);
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
