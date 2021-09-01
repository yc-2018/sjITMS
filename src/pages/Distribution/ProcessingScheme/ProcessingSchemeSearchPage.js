import { connect } from 'dva';
import { Fragment } from 'react';
import { Menu, Dropdown, Form, Button, message, Upload, Popover, Switch, Divider } from 'antd';
import ProcessingSchemeSearchForm from './ProcessingSchemeSearchForm';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import SearchPage from '@/pages/Component/Page/SearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { getSourceWayCaption } from '@/utils/SourceWay';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { WORK_RES } from './ProcessingSchemePermission';
import { processingSchemeLocal } from './ProcessingSchemeLocal';
import Empty from '@/pages/Component/Form/Empty';
import { colWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import OperateCol from '@/pages/Component/Form/OperateCol';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { OWNER_RES } from '@/pages/Basic/Owner/OwnerPermission';
import { routerRedux } from 'dva/router';
@connect(({ processingScheme, loading }) => ({
  processingScheme,
  loading: loading.models.processingScheme,
}))
export default class ProcessingSchemeSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: processingSchemeLocal.title,
      data: props.processingScheme.data,
      suspendLoading:false,
      key: 'processingScheme.search.table'
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    if (!this.state.pageFilter.searchKeyValues.state)
      this.state.pageFilter.searchKeyValues.state = '';
  }
  componentDidMount() {
    if(this.props.processingScheme.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.processingScheme.data
    });
  }
  /**
   * 刷新/重置
   */
  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    dispatch({
      type: 'processingScheme/query',
      payload: queryFilter,
    });
  };
  /**
   * 搜索
   */
  onSearch = (data) => {
    const {
      pageFilter
    } = this.state;
    pageFilter.page = 0;
    if (data) {
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        state: ''
      }
    }
    this.refreshTable();
  }
  /**
   * 显示新建/编辑界面
   */
  onCreate = (uuid) => {
    const payload = {
      showPage: 'create'
    }
    if (uuid != '') {
      payload.entityUuid = uuid;
    }
    this.props.dispatch({
      type: 'processingScheme/showPage',
      payload: {
        ...payload
      }
    });
  }
  /**
   * 批量启用
   */
  onBatchOnline = () => {
    this.setState({
      batchAction: basicState.ONLINE.caption
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }
  /**
   * 批量禁用
   */
  onBatchOffline = () => {
    this.setState({
      batchAction: basicState.OFFLINE.caption
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }
  /**
   * 批量删除
   */
  onBatchRemove = () => {
    this.setState({
      batchAction: commonLocale.deleteLocale
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }
  // 批量操作
  onBatchProcess = () => {
    this.setState({
      suspendLoading:true
    })
    const { selectedRows, batchAction } = this.state;
    const that = this;
    let bacth=(i)=>{
      if(i<selectedRows.length){
        if (batchAction === basicState.ONLINE.caption) {
          if (selectedRows[i].state === basicState.ONLINE.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i+1)
          } else {
            this.online(selectedRows[i], true).then(res=>{
              bacth(i+1)
            });
          }
        } else if(batchAction === commonLocale.deleteLocale) {
          this.onRemove(selectedRows[i], true).then(res=>{
            bacth(i+1)
          });
        } else {
          if (selectedRows[i].state === basicState.OFFLINE.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i+1)
          } else {
            that.offline(selectedRows[i], true).then(res=>{
              bacth(i+1)
            })
          }
        }
      } else {
        this.setState({
          suspendLoading:false
        })
      }
    }
    bacth(0);
  }
  /**
   * 单一启用
   */
  online = (record, batch) => {
    const { dispatch } = this.props;
    let that =this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'processingScheme/online',
        payload: {
          uuid: record.uuid,
          version: record.version
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.onlineSuccessLocale);
          }
        }
      });
    });
  }
  /**
   * 单一禁用
   */
  offline = (record, batch) => {
    const { dispatch } = this.props;
    let that =this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'processingScheme/offline',
        payload: {
          uuid: record.uuid,
          version: record.version
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.offlineSuccessLocale);
          }
        }
      });
    });
  }
  /**
   * 单一删除
   */
  onRemove = (record, batch) => {
    const { dispatch } = this.props;
    let that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'processingScheme/remove',
        payload: record,
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
    })
  }
  /**
   * 模态框显示/隐藏
   */
  handleModalVisible = (operate) => {
    if (operate) {
      this.setState({
        operate: operate
      })
    }
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }
  /**
   * 模态框确认操作
   */
  handleOk = () => {
    const { operate, record } = this.state;
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }
  /**
   * 查看详情
   */
  onView = (record) => {
    this.props.dispatch({
      type: 'processingScheme/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }
  /**
   * 修改状态
   */
  onChangeState = (record) => {
    if (record.state === basicState.ONLINE.name) {
      this.offline(record, false);
    } else {
      this.online(record, false);
    }
  }
  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }];
  }
  fetchOperatePropsTwo = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record),
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(WORK_RES.CREATE),
      onClick: this.onCreate.bind(this, record.uuid)
    }, {
      name: commonLocale.deleteLocale,
      disabled: !havePermission(WORK_RES.DELETE),
      confirm: true,
      confirmCaption: processingSchemeLocal.title,
      onClick: this.onRemove.bind(this, record, false)
    }];
  }
  /**
   * 表格列
   */
  columns = [
    {
      title: commonLocale.codeLocale,
      dataIndex: 'code',
      sorter: true,
      width: colWidth.codeColWidth,
      render: (val, record) => <a onClick={this.onView.bind(this, record)}>{val}</a>,
    },
    {
      title: commonLocale.nameLocale,
      dataIndex: 'name',
      sorter: true,
      width: colWidth.codeColWidth,
    },
    {
      title: commonLocale.ownerLocale,
      dataIndex: 'owner',
      sorter: true,
      width: colWidth.codeColWidth,
      render: val => <a onClick={this.onViewOwner.bind(this, val.uuid) }
                        disabled={!havePermission(OWNER_RES.VIEW)}><EllipsisCol colValue={convertCodeName(val)} /></a>
    },
    {
      title: commonLocale.stateLocale,
      dataIndex: 'state',
      sorter: true,
      width: colWidth.enumColWidth,
      render: (text, record) => {
        confirm = record.state == basicState.ONLINE.name ? commonLocale.offlineLocale :
          commonLocale.onlineLocale;
        return loginOrg().type === 'COMPANY' ?
          <div>
            <IPopconfirm onConfirm={this.onChangeState.bind(this, record)} operate={confirm}
                         object={processingSchemeLocal.title}>
              <Switch
                disabled={!havePermission(WORK_RES.ONLINE)}
                checked={record.state === basicState.ONLINE.name} size="small" />
            </IPopconfirm>
            &emsp; {getStateCaption(record.state)}
          </div> : <span>{getStateCaption(record.state)}</span>
      },
    },
    {
      title: commonLocale.noteLocale,
      dataIndex: 'note',
      sorter: true,
      width: colWidth.codeColWidth,
      render: (text, record) => {
        return (
          <span>{record.note ? record.note : <Empty />}</span>
        )
    }
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: record => (
        loginOrg().type === 'COMPANY' ?
          <OperateCol menus={this.fetchOperatePropsTwo(record)} />
          :
          <OperateCol menus={this.fetchOperatePropsOne(record)} />
      ),
    },
  ];
  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    return loginOrg().type === 'COMPANY' ?
      <Fragment>
        <Button
          disabled={!havePermission(WORK_RES.CREATE)}
          onClick={this.onCreate.bind(this, '')} type='primary' icon='plus'>
          {commonLocale.createLocale}
        </Button>
      </Fragment>
      : null
  }
  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel() {
    return loginOrg().type === 'COMPANY' ? [
      <Button
        disabled={!havePermission(WORK_RES.ONLINE)}
        key={commonLocale.batchOnlineLocale} onClick={() => this.onBatchOnline()}>
        {commonLocale.batchOnlineLocale}
      </Button>,
      <Button
        disabled={!havePermission(WORK_RES.ONLINE)}
        key={commonLocale.batchOfflineLocale} onClick={() => this.onBatchOffline()}>
        {commonLocale.batchOfflineLocale}
      </Button>,
      <Button
        disabled={!havePermission(WORK_RES.DELETE)}
        key={commonLocale.batchRemoveLocale} onClick={() => this.onBatchRemove()}>
        {commonLocale.batchRemoveLocale}
      </Button>
    ] : null;
  }
  /**
   * 绘制搜索表格
   */
  drawSearchPanel = () => {
    return (
      <div>
        <ProcessingSchemeSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} toggleCallback={this.toggleCallback} />
        <ConfirmModal
          visible={this.state.modalVisible}
          operate={this.state.operate}
          onOk={this.handleOk}
          onCancel={this.handleModalVisible}
        />
      </div>
    )}
}
