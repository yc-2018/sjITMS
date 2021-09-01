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
import { vendorRtnBinConfigLocale } from './VendorRtnBinConfigLocale';
import VendorRtnBinConfigSearchForm from './VendorRtnBinConfigSearchForm';
import VendorRtnBinConfigCreateModal from './VendorRtnBinConfigCreateModal';
import { havePermission } from '@/utils/authority';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';
import { routerRedux } from 'dva/router';

@connect(({ vendorRtnBinConfig, loading }) => ({
    vendorRtnBinConfig,
    loading: loading.models.vendorRtnBinConfig,
}))
@Form.create()
export default class VendorRtnBinConfig extends ConfigSearchPage {
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: vendorRtnBinConfigLocale.vendorRtnBinConfigTitle,
            data: this.props.vendorRtnBinConfig.data,
            entity: {},
            createModalVisible: false,
            logCaption: 'VendorRtnBinConfig'
        };
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
            title: vendorRtnBinConfigLocale.vendorCode,
            dataIndex: 'vendor.code',
            key: 'vendorCode',
            sorter: true,
            width: colWidth.codeColWidth,
            render: (val, record) => <a onClick={this.onVendorView.bind(this, record.vendor)}
                disabled={!havePermission(VENDOR_RES.VIEW)}>{val}</a>
        },
        {
            title: vendorRtnBinConfigLocale.vendorName,
            dataIndex: 'vendor.name',
            key: 'vendorName',
            sorter: true,
            width: colWidth.codeColWidth,
        },
        {
            title: vendorRtnBinConfigLocale.binScope,
            dataIndex: 'binScope',
            sorter: true,
            width: colWidth.enumColWidth,
        },
        {
            title: vendorRtnBinConfigLocale.exclusive,
            dataIndex: 'exclusiveness',
            sorter: true,
            width: colWidth.enumColWidth,
            render: (text, record) => (record.exclusive ? '是' : '否')
        },
        {
            title: commonLocale.operateLocale,
            key: 'action',
            width: colWidth.operateColWidth,
            render: (text, record) => (
                <span>
                    <a href="javascript:;" onClick={this.handleCreateModalVisible.bind(this, true, record)}>
                      {commonLocale.editLocale}
                    </a>
                    <Divider type="vertical" />
                    <IPopconfirm onConfirm={() => this.handleRemove(record, null)}
                        operate={commonLocale.deleteLocale}
                        object={vendorRtnBinConfigLocale.vendorRtnBinConfigTitle}>
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
            data: nextProps.vendorRtnBinConfig.data
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
            type: 'vendorRtnBinConfig/query',
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

    handleCreateModalVisible = (flag, record) => {
        const { createModalVisible } = this.state;
        if (flag && record && record.uuid) {
          this.setState({
            entity: record
          })
        } else {
          this.setState({
            entity: {},
          })
        }
        this.setState({
            createModalVisible: !!flag,
        })
    }

    // fetchEntity = (uuid) => {
    //   this.props.dispatch({
    //     type: 'vendorRtnBinConfig/getByDCUuidAndVendor',
    //     payload: {
    //       vendorUuid:uuid,
    //       dcUuid:loginOrg().uuid
    //     },
    //     callback: response => {
    //       if (response && response.success) {
    //         let data = response.data;
    //         if (data) {
    //           this.setState({
    //             entity: data,
    //           })
    //         }
    //       }
    //     }
    //   });
    // }

    handleSave = (fieldsValue) => {
        const { entity } = this.state;
        let type = '';
        let params = {
            ...fieldsValue,
            companyUuid: loginCompany().uuid,
            dcUuid: loginOrg().uuid,
            vendor: JSON.parse(fieldsValue['vendor']),
        };
        if(entity.uuid) {
          params.uuid = entity.uuid;
          params.version = entity.version;
          type = 'vendorRtnBinConfig/modify'
        } else {
          type = 'vendorRtnBinConfig/save'
        }

        this.props.dispatch({
            type: type,
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
            type: 'vendorRtnBinConfig/remove',
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

        return <VendorRtnBinConfigCreateModal {...createModalProps} />
    }

    drawSearchPanel = () => {
        const { pageFilter } = this.state;
        return (<VendorRtnBinConfigSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} />);
    }

    drawActionButton() {
        return (
            <Fragment>
                <Button type='primary' icon="plus"
                    onClick={() => this.handleCreateModalVisible(true, null)}
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
