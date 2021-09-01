import React, { Component } from 'react';
import { Divider, Button, message, Popconfirm } from 'antd';
import { connect } from 'dva';
import { Fragment } from 'react';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { colWidth } from '@/utils/ColWidth';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import Empty from '@/pages/Component/Form/Empty';
import { wholeContainerTypeConfigLocale } from './WholeContainerTypeConfigLocale';
import WholeContainerTypeConfigCreateModal from './WholeContainerTypeConfigCreateModal';
import WholeContainerTypeConfigSearchForm from './WholeContainerTypeConfigSearchForm';

@connect(({ wholecontainertypeconfig, loading }) => ({
    wholecontainertypeconfig,
    loading: loading.models.wholecontainertypeconfig,
}))
export default class WholeContainerTypeConfig extends ConfigSearchPage {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: wholeContainerTypeConfigLocale.title,
            data: this.props.wholecontainertypeconfig.data,
            entity: {},
            createModalVisible: false,
            logCaption: 'WholeContainerTypeConfig',
            suspendLoading: false
        };
        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
        this.state.pageFilter.sortFields = {};
        this.state.logCaption = 'WholeContainerTypeConfig';
    }

    columns = [{
        title: wholeContainerTypeConfigLocale.containerTypeCode,
        key: 'code',
        dataIndex:'code',
        width: colWidth.codeColWidth,
        sorter: true,
        render: (text, record) => {
            return record.containerTye ? record.containerTye.code : <Empty />;
        }
    }, {
        title: wholeContainerTypeConfigLocale.containerTypeName,
        key: 'name',
        dataIndex: 'name',
        sorter: true,
        width: colWidth.codeColWidth,
        render: (text, record) => {
            return record.containerTye ? record.containerTye.name : <Empty />;
        }
    }, {
        title: commonLocale.operateLocale,
        width: colWidth.operateColWidth,
        render: record => (
            <IPopconfirm onConfirm={() => this.handleRemove(record, null)}
                operate={commonLocale.deleteLocale}
                object={wholeContainerTypeConfigLocale.title}>
               <a>{commonLocale.deleteLocale}</a>
            </IPopconfirm>
        ),
    }];

    componentDidMount = () => {
        this.refreshTable();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.wholecontainertypeconfig.data
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
            type: 'wholecontainertypeconfig/query',
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
                entity: {},
            })
        }

        this.setState({
            createModalVisible: !!flag,
        })
    }


    handleSaveOrModify = (containerTyes) => {
        let params = [];
        containerTyes.forEach(function (item) {
            params.push(
                {
                    containerTye: item,
                    companyUuid: loginCompany().uuid,
                    dcUuid: loginOrg().uuid
                }
            );
        });

        let type = 'wholecontainertypeconfig/add';
        this.props.dispatch({
            type: type,
            payload: params,
            callback: (response) => {
                if (response && response.success) {
                    message.success(commonLocale.saveSuccessLocale);
                    this.handleCreateModalVisible(false);
                    this.refreshTable();
                }
            },
        })
    }

    handleRemove = (record, batch) => {
        const that = this;
        return new Promise(function (resolve, reject) {
            that.props.dispatch({
                type: 'wholecontainertypeconfig/remove',
                payload: record.uuid,
                callback: (response) => {
                    if (batch) {
                        that.batchCallback(response, record);
                        resolve({ success: response.success });
                        return;
                    }
                    if (response && response.success) {
                        that.refreshTable();
                        message.success(commonLocale.removeSuccessLocale)
                    }
                }
            })
        })
    }

    onBatchRemove = () => {
        this.setState({
            batchAction: commonLocale.batchRemoveLocale,
        });
        this.handleBatchProcessConfirmModalVisible(true);
    }

    onBatchProcess = () => {
        this.setState({
            suspendLoading: true
        })
        const { selectedRows, batchAction } = this.state;

        const that = this;
        let bacth = (i) => {
            if (i < selectedRows.length) {
                if (batchAction === commonLocale.batchRemoveLocale) {
                    if ("-" != selectedRows[i].containerTye.uuid) {
                        that.handleRemove(selectedRows[i], true).then(res => {
                            bacth(i + 1);
                        })
                    } else {
                        that.refs.batchHandle.calculateTaskSkipped();
                        bacth(i + 1);
                    }
                }
            } else {
                this.setState({
                    suspendLoading: false
                })
            }
        }
        bacth(0);
    }

    drawCreateModal = () => {
        const {
            entity,
            selectedRows,
            createModalVisible,
        } = this.state;

        const createModalProps = {
            modalVisible: createModalVisible,
            handleCreateModalVisible: this.handleCreateModalVisible,
            handleSaveOrModify: this.handleSaveOrModify,
            loading: this.props.loading,
        }

        return <WholeContainerTypeConfigCreateModal {...createModalProps} />
    }

    drawSearchPanel = () => {
        return (<WholeContainerTypeConfigSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} />);
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
