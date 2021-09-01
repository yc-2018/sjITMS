import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Popconfirm, Icon, message, Switch, Modal } from 'antd';
import { formatMessage } from 'umi/locale';
import SearchPanel from '@/components/MyComponent/SearchPanel';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { colWidth } from '@/utils/ColWidth';
import { allowVendorRtnConfigLocale } from './AllowVendorRtnConfigLocale';
import { havePermission } from '@/utils/authority';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';
import { routerRedux } from 'dva/router';
import PanelItemBatchAdd from '@/pages/Component/Form/PanelItemBatchAdd';
import BatchSearchForm from './SearchFormItemBatchAdd';
import AllowVendorRtnConfigSearchForm from './AllowVendorRtnConfigSearchForm';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';

@connect(({ allowVendorRtnConfig, vendor, loading }) => ({
  allowVendorRtnConfig,
  vendor,
  loading: loading.models.allowVendorRtnConfig,
}))
@Form.create()
export default class AllowVendorRtnConfig extends ConfigSearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: allowVendorRtnConfigLocale.title,
      data: this.props.allowVendorRtnConfig.data,
      entity: {},
      logCaption: 'AllowVendorRtnConfig',
      batchAddVisible: false,
      hideTable: true, // 允许全部供应商隐藏表格
      searchedVendorList: [],
      vendorPageFilter: {
        page: 0,
        pageSize: 10,
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          codeName: '',
          state: basicState.ONLINE.name,
        }
      }
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
      title: commonLocale.vendorCodeLocale,
      dataIndex: 'vendor.code',
      key: 'vendorCode',
      sorter: true,
      width: colWidth.codeColWidth,
      render: (val, record) => <a onClick={this.onVendorView.bind(this, record.vendor)}
        disabled={!havePermission(VENDOR_RES.VIEW)}>{val}</a>
    },
    {
      title: commonLocale.vendorNameLocale,
      dataIndex: 'vendor.name',
      key: 'vendorName',
      width: colWidth.codeColWidth,
    },
  ];

  vendorColumns = [
    {
      title: commonLocale.vendorCodeLocale,
      dataIndex: 'code',
      key: 'vendorCode',
      sorter: true,
      width: colWidth.codeColWidth,
      render: (val, record) => <a onClick={this.onVendorView.bind(this, record)}
        disabled={!havePermission(VENDOR_RES.VIEW)}>{val}</a>
    },
    {
      title: commonLocale.vendorNameLocale,
      dataIndex: 'name',
      key: 'vendorName',
      width: colWidth.codeColWidth,
    },
  ];

  componentDidMount = () => {
    this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {
    let data = nextProps.allowVendorRtnConfig.data;
    let hideTable = false;

    if (Array.isArray(data.list)) {
      if (data.list.length == 0) {
        hideTable = false;
      } else {
        for (let item of data.list) {
          if (item.vendor && item.vendor.code === '-') {
            hideTable = true;
            break;
          }
        }
      }
    } else {
      hideTable = false;
    }

    this.setState({
      data: nextProps.allowVendorRtnConfig.data,
      searchedVendorList: nextProps.vendor.data,
      hideTable: hideTable,
      selectedRows: [], 
      hideBusTabe: hideTable
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

    queryFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    queryFilter.searchKeyValues.dcUuid = loginOrg().uuid;

    dispatch({
      type: 'allowVendorRtnConfig/query',
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

  onBatchRemove = () => {
    const { selectedRows } = this.state;

    if (Array.isArray(selectedRows) && selectedRows.length > 0) {
      let that = this;
      Modal.confirm({
        title: '确认删除选中的明细？',
        icon: <Icon type="question-circle-o" />,
        onOk() {
          that.handleReomve(selectedRows);
        },
        onCancel() { },
      });
    } else {
      message.warn("请勾选，再进行批量操作")
    }
  }

  handleReomve = () => {
    const { selectedRows } = this.state;

    return new Promise((resolve, reject) => {
      let vendorUuids = [];
      selectedRows.forEach(item => {
        vendorUuids.push(item.vendor.uuid);
      })

      this.props.dispatch({
        type: 'allowVendorRtnConfig/batchRemove',
        payload: {
          vendorUuids: vendorUuids,
          dcUuid: loginOrg().uuid
        },
        callback: (response) => {
          if (response && response.success) {
            this.refreshTable();
            message.success(commonLocale.removeSuccessLocale);
          }

          resolve({})
        }
      })
    })
  }

  onBatchAdd = () => {
    this.setState({
      batchAddVisible: !this.state.batchAddVisible
    })
  }

  /** */
  onAllVendorChange = () => {
    const { hideTable } = this.state;

    let type;
    if (!hideTable) {
      type = 'allowVendorRtnConfig/allowAll';
    } else {
      type = 'allowVendorRtnConfig/forbidAll';
    }

    this.props.dispatch({
      type: type,
      payload: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      },
      callback: (response) => {
        if (response && response.success) {
          this.refreshTable();
          message.success(commonLocale.saveSuccessLocale);
        }
      }
    })
  }

  /** 批量添加相关 **/

  /**
   * 批量添加搜索
   */
  onSearchVendor = (data) => {
    const { vendorPageFilter } = this.state;

    if (data) {
      vendorPageFilter.searchKeyValues = {
        ...vendorPageFilter.searchKeyValues,
        ...data
      }
    } else {
      vendorPageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
      }
    }

    this.setState({
      vendorPageFilter: vendorPageFilter
    })

    this.refreshVendorTable();
  }

  /**
   * 刷新批量添加表格
   */
  refreshVendorTable = () => {
    const { vendorPageFilter } = this.state;

    vendorPageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    vendorPageFilter.searchKeyValues.dcUuid = loginOrg().uuid;

    this.props.dispatch({
      type: 'vendor/query',
      payload: vendorPageFilter
    })
  }

  /**
   * 获取批量添加表格选中的明细
   */
  getItemList = (data) => {
    if (Array.isArray(data) && data.length > 0) {
      let vendors = [];
      data.forEach(item => {
        vendors.push({
          uuid: item.uuid,
          code: item.code,
          name: item.name
        });
      })

      this.props.dispatch({
        type: 'allowVendorRtnConfig/batchSave',
        payload: {
          vendors: vendors,
          dcUuid: loginOrg().uuid,
          companyUuid: loginCompany().uuid
        },
        callback: (response) => {
          if (response && response.success) {
            this.refreshTable();
            message.success(commonLocale.saveSuccessLocale);
          }
        }
      })
    }

  }

  /**
   * 批量添加表格改变
   */
  vendorTableChange = (pagination, filtersArg, sorter) => {
    const { vendorPageFilter } = this.state;

    vendorPageFilter.page = pagination.current - 1;
    vendorPageFilter.pageSize = pagination.pageSize;

    // 判断是否有过滤信息
    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    if (sorter.field) {
      // 如果有排序字段，则需要将原来的清空
      vendorPageFilter.sortFields = {};
      var sortField = `${sorter.field}`;
      var sortType = sorter.order === 'descend' ? true : false;
      vendorPageFilter.sortFields[sortField] = sortType;
    }

    this.refreshVendorTable();
  }

  drawCreateModal = () => {
    const {
      batchAddVisible,
      searchedVendorList
    } = this.state;

    return <PanelItemBatchAdd
      searchPanel={<BatchSearchForm refresh={this.onSearchVendor} fieldsValue={''} />}
      visible={batchAddVisible}
      columns={this.vendorColumns}
      data={searchedVendorList}
      handlebatchAddVisible={this.onBatchAdd}
      getSeletedItems={this.getItemList}
      noPagination={false}
      onChange={this.vendorTableChange}
    />
  }

  drawSearchPanel = () => {
    const { pageFilter, hideTable } = this.state;
    return (!hideTable && <AllowVendorRtnConfigSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} />);
  }

  drawToolbarPanel() {
    const { hideTable } = this.state;

    return !hideTable && (
      <Fragment>
        <Button
          onClick={() =>
            this.onBatchRemove()
          }
        >
          {commonLocale.batchRemoveLocale}
        </Button>

        <Button
          onClick={() =>
            this.onBatchAdd()
          }
        >
          {commonLocale.batchAddLocale}
        </Button>
      </Fragment>
    );
  }

  drawActionButton() {
    const { hideTable, showAllowAllVendor } = this.state;

    let confirmTips = hideTable ? "禁止" : "允许"

    return (
      <Fragment>
        <div>
          <IPopconfirm onConfirm={this.onAllVendorChange.bind(this)}
              operate={confirmTips}
              object='全部供应商'
            >
            <Switch loading={this.props.loading} checked={hideTable} />
          </IPopconfirm>
          
          <strong>&nbsp;&nbsp;&nbsp;全部供应商</strong>
        </div>
      </Fragment>
    );
  }
}