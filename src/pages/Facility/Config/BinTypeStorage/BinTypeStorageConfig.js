import React, { Component } from 'react';
import { Divider, Button, message } from 'antd';
import { connect } from 'dva';
import { Fragment } from 'react';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import { basicState, getStateCaption } from '@/utils/BasicState';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import BinTypeStorageSearchForm from './BinTypeStorageSearchForm';
import BinTypeStorageConfigCreateModal from './BinTypeStorageConfigCreateModal';
import { binTypeStorageLocale } from './BinTypeStorageLocale';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth } from '@/utils/ColWidth';
import { havePermission } from '@/utils/authority';
import {configLocale} from '@/pages/Facility/Config/ConfigLocale';
import { CONFIG_RES } from '../ConfigPermission';
@connect(({ binTypeStorageConfig, loading }) => ({
  binTypeStorageConfig,
  loading: loading.models.binTypeStorageConfig,
}))
export default class BinTypeStorageConfig extends ConfigSearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: '货位类型存储配置',
      data: this.props.binTypeStorageConfig.data,
      suspendLoading:false,
      entity: {},
      createModalVisible: false,
      logCaption: 'BinTypeStorageConfig',
      key: 'binTypeStorageConfig.search.table',
      auditPermission:true,
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
  }

  columns = [
    {
      title: binTypeStorageLocale.binTypeStorageBinType,
      dataIndex: 'binType',
      key: 'binType',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text) => (text == null ? <Empty /> : <EllipsisCol colValue={'[' + text.code + ']' + text.name} />),
    },
    {
      title: binTypeStorageLocale.binTypeStorageStorageBinType,
      dataIndex: 'storageBinType',
      key: 'storageBinType',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text) => (text == null ? <Empty /> : <EllipsisCol colValue={'[' + text.code + ']' + text.name} />),
    }
  ];
  componentDidMount() {
    this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.binTypeStorageConfig.data
    });
  }
  /**
   * 刷新主体页面
   */
  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: []
      });
    }
    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    dispatch({
      type: 'binTypeStorageConfig/query',
      payload: queryFilter,
    });
  };

  onSearch = (data) => {
    const { pageFilter } = this.state;
    pageFilter.page = 0;
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
    if (!uuid) {
      this.setState({
        entity: {},
      })
    }

    this.setState({
      createModalVisible: !!flag,
    })
  }
  handleRemove = (uuid, batch, record) => {
    const { dispatch } = this.props;
    let that =this;
    if (uuid) {
      return new Promise(function (resolve, reject) {
        dispatch({
          type: 'binTypeStorageConfig/remove',
          payload: { uuid },
          callback: response => {
            if (batch) {
              that.batchCallback(response, record);
              resolve({ success: response.success });
              return;
            }

            if (response && response.success) {
              that.refreshTable();
              message.success(commonLocale.removeSuccessLocale);
            }
          }
        });
      });
    }
  }

  onBatchRemove = () => {
    this.setState({
      batchAction: basicState.REMOVE.caption,
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchProcess = () => {
    this.setState({
      suspendLoading:true
    })
    const { selectedRows, batchAction } = this.state;
    const that = this;
    let bacth=(i)=>{
      if(i<selectedRows.length){
        if (batchAction === basicState.REMOVE.caption) {
          that.handleRemove(selectedRows[i].uuid, true, selectedRows[i]).then(res=>{
            bacth(i+1)
          });
        }
      }else{
        this.setState({
          suspendLoading:false
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
      entity: entity,
      modalVisible: createModalVisible,
      handleCreateModalVisible: this.handleCreateModalVisible,
      handleSave: this.handleSave,
    }

    return <BinTypeStorageConfigCreateModal {...createModalProps} />
  }
  drawSearchPanel = () => {
    const { pageFilter } = this.state;
    return (<BinTypeStorageSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} />);
  }
  drawActionButton() {
    return (
      <Fragment>
        <Button type='primary' icon="plus"
                //disabled={!havePermission(CONFIG_RES.BINTYPESTORAGECONFIGEDIT)}
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
          // disabled={!havePermission(CONFIG_RES.BINTYPESTORAGECONFIGEDIT)} # 权限不知，以后再说
        >
          {commonLocale.batchRemoveLocale}
        </Button>
      </Fragment>
    );
  }
  handleSave = (fieldsValue) => {
    const { entity } = this.state;

    let storageBinTypeList = []
    fieldsValue['storageBinTypeList'].map(item => {
      storageBinTypeList.push(JSON.parse(item))
    })

    let params = {
      ...fieldsValue,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      binType: JSON.parse(fieldsValue['binType']),
      storageBinTypeList: storageBinTypeList
    }
    let type = 'binTypeStorageConfig/save';
    this.props.dispatch({
      type: type,
      payload: params,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.handleCreateModalVisible(false);
          this.refreshTable();
        }
        // else {
        //   message.error(response.message);
        // }
      },
    })
  }
}
