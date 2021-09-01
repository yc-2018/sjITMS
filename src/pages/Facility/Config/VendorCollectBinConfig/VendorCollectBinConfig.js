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
import { vendorCollectBinConfigLocale } from './VendorCollectBinConfigLocale';
import VendorCollectBinConfigSearchForm from './VendorCollectBinConfigSearchForm';
import VendorCollectBinConfigCreateModal from './VendorCollectBinConfigCreateModal';
import { havePermission } from '@/utils/authority';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';
import { routerRedux } from 'dva/router';

@connect(({ vendorCollectBinConfig, loading }) => ({
    vendorCollectBinConfig,
    loading: loading.models.vendorCollectBinConfig,
}))
@Form.create()
export default class VendorCollectBinConfig extends ConfigSearchPage {
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: vendorCollectBinConfigLocale.title,
            data: this.props.vendorCollectBinConfig.data,
            entity: {},
            createModalVisible: false,
            logCaption: 'VendorCollectBinConfig'
        };
        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
        this.state.pageFilter.sortFields = {};
    }

    /**
   * 跳转到供应商详情页面
   */
    onVendorView = (vendor) => {
        this.props.dispatch(routerRedux.push({
            pathname: '/basic/vendor',
            payload: {
                showPage: 'view',
                entityUuid: vendor ? vendor.uuid : undefined
            }
        }));
    }

    columns = [
        {
            title: vendorCollectBinConfigLocale.vendorCode,
            dataIndex: 'vendor.code',
            key: 'vendorCode',
            sorter: true,
            width: colWidth.codeColWidth,
            render: (val, record) => <a onClick={this.onVendorView.bind(this, record.vendor)}
                disabled={!havePermission(VENDOR_RES.VIEW)}>{val}</a>
        },
        {
            title: vendorCollectBinConfigLocale.vendorName,
            dataIndex: 'vendor.name',
            key: 'vendorName',
            sorter: true,
            width: colWidth.codeColWidth,
        },
        {
            title: vendorCollectBinConfigLocale.binScope,
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
                        object={vendorCollectBinConfigLocale.title}>
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
            data: nextProps.vendorCollectBinConfig.data
        });
    }

    refreshTable = (filter) => {
        const { dispatch } = this.props;
        const { pageFilter } = this.state;

        let queryFilter = { ...pageFilter };
        if (filter) {
            let sortFields = filter.sortFields;
            if (sortFields) {
                if (sortFields.hasOwnProperty('vendor.code')) {
                    filter.sortFields['vendorCode'] = sortFields['vendor.code'];
                    delete sortFields['vendor.code'];
                }
            }

            queryFilter = { ...pageFilter, ...filter };
        }

        dispatch({
            type: 'vendorCollectBinConfig/query',
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

        let params = {
            ...fieldsValue,
            companyUuid: loginCompany().uuid,
            dcUuid: loginOrg().uuid,
            vendor: JSON.parse(fieldsValue['vendor']),
        }

        this.props.dispatch({
            type: 'vendorCollectBinConfig/save',
            payload: params,
            callback: (response) => {
                if (response && response.success) {
                    this.setState({
                        createModalVisible: false
                    })

                    message.success(formatMessage({ id: 'common.message.success.operate' }));
                    this.refreshTable();
                }
            },
        })
    }

    handleRemove = (record, callback) => {
        this.props.dispatch({
            type: 'vendorCollectBinConfig/remove',
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
        }

        return <VendorCollectBinConfigCreateModal {...createModalProps} />
    }

    drawSearchPanel = () => {
        const { pageFilter } = this.state;
        return (<VendorCollectBinConfigSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} />);
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
