import React, { Component } from 'react';
import { Button, message, Divider } from 'antd';
import { connect } from 'dva';
import { Fragment } from 'react';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import { basicState, getStateCaption } from '@/utils/BasicState';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import StoreAllocationConfigSearchForm from './StoreAllocationConfigSearchForm';
import StoreAllocationConfigCreateModal from './StoreAllocationConfigCreateModal';
import { storeAllocationLocale } from './StoreAllocationLocale';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth } from '@/utils/ColWidth';
import { havePermission } from '@/utils/authority';
import { STORE_RES } from '@/pages/Basic/Store/StorePermission';
import { routerRedux } from 'dva/router';

@connect(({ storeAllocateBinConfig, loading }) => ({
  storeAllocateBinConfig,
  loading: loading.models.storeAllocateBinConfig,
}))
export default class StoreAllocateBinConfig extends ConfigSearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: storeAllocationLocale.storeAllocationTitle,
      data: this.props.storeAllocateBinConfig.data,
      entity: {},
      createModalVisible: false,
      logCaption: 'StoreAllocateBinConfig',
      suspendLoading: false
    };
  }

  /**
  * 跳转到门店详情页面
  */
  onStoreView = (store) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/store',
      payload: {
        showPage: 'view',
        entityUuid:store?store.uuid:undefined
      }
    }));
  }


  columns = [
    {
      title: storeAllocationLocale.storeAllocationStore,
      dataIndex: 'store',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text) => (text == null ? <Empty /> : <a onClick={this.onStoreView.bind(this, text)}
        disabled={!havePermission(STORE_RES.VIEW)}><EllipsisCol colValue={'[' + text.code + ']' + text.name} /></a>),
    },
    {
      title: storeAllocationLocale.storeAllocationAllocation,
      dataIndex: 'binCode',
      sorter: true,
      key: 'binCode',
      width: colWidth.codeNameColWidth
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
          <IPopconfirm onConfirm={() => this.handleRemove(record.dcUuid, record.store.uuid, record.version)}
            operate={commonLocale.deleteLocale}
            object={storeAllocationLocale.storeAllocationTitle}>
            <a>{commonLocale.deleteLocale}</a>
          </IPopconfirm>
        </span>
      )
    }
  ];
  componentDidMount() {
    this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.storeAllocateBinConfig.data
    });
  }
  /**
   * 刷新主体页面
   */
  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    dispatch({
      type: 'storeAllocateBinConfig/query',
      payload: queryFilter,
    });
  };

  onSearch = (data) => {
    const { pageFilter } = this.state;
    if (data) {
      pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
      pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
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
  };
  reset = () => {
    const { pageFilter } = this.state;
    pageFilter.searchKeyValues = {
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid
    };
    this.refreshTable();
  };
  fetchEntity = entity => {
    const { dispatch } = this.props;
    const type = 'storeAllocateBinConfig/getConfigByStoreUuidAndDcUuid';
    dispatch({
      type: type,
      payload: {
        dcUuid: entity.dcUuid,
        storeUuid: entity.store.uuid
      },
      callback: response => {
        this.setState({
          entity: response.data
        });
      }
    });
  };
  handleCreateModalVisible = (flag, entity) => {
    if (flag && entity) {
      this.fetchEntity(entity);
    } else if (!entity) {
      this.setState({
        entity: {}
      })
    }

    this.setState({
      createModalVisible: !!flag,
    })
  };
  handleRemove = (dcUuid, storeUuid, version, batch, record) => {
    if (true) {
      let that = this;
      return new Promise(function (resolve, reject) {
        that.props.dispatch({
          type: 'storeAllocateBinConfig/remove',
          payload: {
            dcUuid: dcUuid,
            storeUuid: storeUuid,
            version: 0
          },
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
        })
      })
    }
  };

  onBatchRemove = () => {
    this.setState({
      batchAction: basicState.REMOVE.caption,
    });
    this.handleBatchProcessConfirmModalVisible(true);
  };

  onBatchProcess = () => {
    this.setState({
      suspendLoading: true
    })
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === basicState.REMOVE.caption) {
          that.handleRemove(selectedRows[i].dcUuid, selectedRows[i].store.uuid, selectedRows[i].version, true, selectedRows[i]).then(res => {
            bacth(i + 1);
          })
        }
      } else {
        this.setState({
          suspendLoading: false
        })
      }
    }
    bacth(0);
  };

  drawCreateModal = () => {
    const {
      entity,
      createModalVisible,
    } = this.state;
    const createModalProps = {
      entity: entity,
      modalVisible: createModalVisible,
      handleCreateModalVisible: this.handleCreateModalVisible,
      handleSaveOrModify: this.handleSaveOrModify
    };

    return <StoreAllocationConfigCreateModal {...createModalProps} />
  };
  drawSearchPanel = () => {
    const { pageFilter } = this.state;
    return (<StoreAllocationConfigSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} reset={this.reset} />);
  };
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
  handleSaveOrModify = (fieldsValue) => {
    let { entity } = this.state;
    let params = {
      ...fieldsValue,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      version: entity ? entity.version : 0,
    }
    params.binCode = params.binCode
    params.store = JSON.parse(params.store)
    let obj = {
      uuid: params.store.uuid,
      code: params.store.code,
      name: params.store.name
    }
    params.store = obj
    let type = 'storeAllocateBinConfig/save';
    if (entity && entity.uuid) { // 编辑
      type = 'storeAllocateBinConfig/modify';
      entity.binCode = params.binCode
      entity.store = params.store
    }
    this.props.dispatch({
      type: type,
      payload: (entity && entity.uuid) ? entity : params,
      callback: (response) => {
        if (response && response.success) {
          if (type === 'storeAllocateBinConfig/save') {
            message.success(commonLocale.saveSuccessLocale);
          } else if (type === 'storeAllocateBinConfig/modify') {
            message.success(commonLocale.modifySuccessLocale);
          }
          this.handleCreateModalVisible(false);
          this.refreshTable();
        }
      }
    })
  }
}
