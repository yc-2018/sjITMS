import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Popconfirm, Icon, Divider, message } from 'antd';
import { formatMessage } from 'umi/locale';
import StandardTable from '@/components/StandardTable';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import SearchPanel from '@/components/MyComponent/SearchPanel';
import Page from '@/components/MyComponent/Page';
import NavigatorPanel from '@/components/MyComponent/NavigatorPanel';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { colWidth } from '@/utils/ColWidth';
import { vendorPickerConfigLocale } from './VendorPickerConfigLocale';
import VendorPickerConfigSearchForm from './VendorPickerConfigSearchForm';
import VendorPickerConfigCreateModal from './VendorPickerConfigCreateModal';
import { convertCodeName } from '@/utils/utils';

@connect(({ vendorPickerConfig, loading }) => ({
    vendorPickerConfig,
    loading: loading.models.vendorPickerConfig,
}))
@Form.create()
export default class VendorPickerConfig extends ConfigSearchPage {
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: vendorPickerConfigLocale.title,
            data: this.props.vendorPickerConfig.data,
            entity: {},
            createModalVisible: false,
            confirmLoading: false,
            logCaption: 'VendorPickerConfig'
        };

        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
        this.state.pageFilter.sortFields = {};
    }

    columns = [
        {
            title: vendorPickerConfigLocale.picker,
            dataIndex: 'picker',
            key: 'picker',
            sorter: true,
            width: colWidth.codeNameColWidth,
            render: (text, record) => convertCodeName(record.picker)
        },
        {
            title: vendorPickerConfigLocale.binScope,
            dataIndex: 'binScope',
            sorter: true,
            width: colWidth.enumColWidth,
        },
        {
            title: commonLocale.operateLocale,
            key: 'action',
            width: colWidth.operateColWidth,
            render: (text, record) => (
                <span>
                    <IPopconfirm onConfirm={() => this.handleRemove(record, null)}
                        operate={commonLocale.deleteLocale}
                        object={vendorPickerConfigLocale.title}>
                        <a> {commonLocale.deleteLocale} </a>
                    </IPopconfirm>
                </span>
            ),
        }];

    componentDidMount = () => {
        this.refreshTable();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.vendorPickerConfig.data
        });
    }

    refreshTable = (filter) => {
        const { dispatch } = this.props;
        const { pageFilter } = this.state;

        let queryFilter = { ...pageFilter };
        if (filter) {
            let sortFields = filter.sortFields;
            if (sortFields) {
                if (sortFields.hasOwnProperty('picker.code')) {
                    filter.sortFields['pickerCode'] = sortFields['picker.code'];
                    delete sortFields['picker.code'];
                }
            }

            queryFilter = { ...pageFilter, ...filter };
        }

        dispatch({
            type: 'vendorPickerConfig/query',
            payload: queryFilter,
        });
    };

    onSearch = (data) => {
        const { pageFilter } = this.state;
        if (data) {
            if (data.pickerUuid)
                data.pickerUuid = JSON.parse(data.pickerUuid).uuid;

            pageFilter.searchKeyValues = {
                ...pageFilter.searchKeyValues,
                ...data
            }
        } else {
            pageFilter.searchKeyValues = {
                companyUuid: loginCompany().uuid,
                dcUuid: loginOrg().uuid,
            }
        }
        this.refreshTable();
    }

    handleCreateModalVisible = () => {
        const { createModalVisible } = this.state;
        this.setState({
            entity: {},
            createModalVisible: !createModalVisible,
        })
    }

    handleSave = (fieldsValue) => {
        const { entity } = this.state;

        this.setState({
            confirmLoading: !this.state.confirmLoading
        })

        let params = {
            ...fieldsValue,
            companyUuid: loginCompany().uuid,
            dcUuid: loginOrg().uuid,
            picker: JSON.parse(fieldsValue['picker']),
        }

        this.props.dispatch({
            type: 'vendorPickerConfig/save',
            payload: params,
            callback: (response) => {
                if (response && response.success) {
                    message.success(formatMessage({ id: 'common.message.success.operate' }));
                    this.refreshTable();

                    this.setState({
                        createModalVisible: false
                    })
                }

                this.setState({
                    confirmLoading: false
                })
            },
        })
    }

    handleRemove = (record, callback) => {
        this.props.dispatch({
            type: 'vendorPickerConfig/remove',
            payload: {
                uuid: record.uuid,
                version: record.version
            },
            callback: callback ? callback : (response) => {
                if (response && response.success) {
                    this.refreshTable();
                    message.success(commonLocale.removeSuccessLocale);
                }
            }
        })

    }

    onBatchRemove = () => {
        this.setState({
            batchAction: basicState.REMOVE.caption,
        });
        this.handleBatchProcessConfirmModalVisible(true);
    }

    onBatchProcess = () => {
        const { selectedRows, batchAction } = this.state;

        const that = this;
        selectedRows.forEach(item => {
            if (batchAction === basicState.REMOVE.caption) {
                that.handleRemove(item, that.batchCallback);
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
            confirmLoading: this.state.confirmLoading
        }

        return <VendorPickerConfigCreateModal {...createModalProps} />
    }

    drawSearchPanel = () => {
        const { pageFilter } = this.state;
        return (<VendorPickerConfigSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} />);
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
