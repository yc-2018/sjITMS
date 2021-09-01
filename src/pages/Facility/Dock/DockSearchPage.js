import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, message, Modal, Form, Input, InputNumber, Switch, Popconfirm } from 'antd';
import { formatMessage } from 'umi/locale';
import SearchPage from '@/pages/Component/Page/SearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import DockSearchForm from './DockSearchForm';
import { dockLocale, DockState } from './DockLocale';
import { DOCK_RES, DOCKGROUP_RES } from './DockPermission';
import OperateCol from '@/pages/Component/Form/OperateCol';
import DockUtil from '@/pages/Component/DockUtil';
import DockStateModal from './DockStateModal';
const FormItem = Form.Item;
@connect(({ dock, loading }) => ({
  dock,
  loading: loading.models.dock,
}))
@Form.create()
export default class DockSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: dockLocale.title,
      data: props.dock.data,
      modifyModalVisible: false,
      modifyValue:undefined,
      key: 'dock.search.table',
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    if (!this.state.pageFilter.likeKeyValues.codeNameLike)
      this.state.pageFilter.likeKeyValues.codeNameLike = null;
    if (!this.state.pageFilter.searchKeyValues.stateEquals)
      this.state.pageFilter.searchKeyValues.stateEquals = '';
  }
  componentDidMount() {
    // if(this.props.dock.fromView) {
    //   return;
    // } else {
    //   this.refreshTable();
    // }
     this.refreshTable();
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.dock.data,
      entity: {}
    });
  }
  onViewDockGroupSearchPage = () => {
    this.props.dispatch({
      type: 'dock/showPage',
      payload: {
        showPage: 'queryDockGroup'
      }
    });
  }
  onCreate = (uuid) => {
    const payload = {
      showPage: 'create'
    }
    if (uuid != '') {
      payload.entityUuid = uuid;
    }
    this.props.dispatch({
      type: 'dock/showPage',
      payload: { ...payload }
    });
  }
  onView = (record) => {
    this.props.dispatch({
      type: 'dock/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }
  handleOnlineOrOffline = (record) => {
    if (record.state === "FREE") {
      this.onDisEnable(record);
    } else if (record.state === "DISENABLED") {
      this.onEnable(record);
    }
  };
  onEnable = (record, callback) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'dock/online',
      payload: record,
      callback: callback ? callback : (response) => {
        if (response && response.success) {
          this.refreshTable();
          message.success(commonLocale.onlineSuccessLocale);
        }
      }
    });
  }
  onDisEnable = (record, callback) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'dock/offline',
      payload: record,
      callback: callback ? callback : (response) => {
        if (response && response.success) {
          this.refreshTable();
          message.success(commonLocale.offlineSuccessLocale);
        }
      }
    });
  }
  onModifyState = (record,state,batch) => {
    const { dispatch } = this.props;
    const that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'dock/stateModify',
        payload: {
          state: state,
          uuid: record.uuid,
          version: record.version
        },
        callback: response  => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            this.state.selectedRows = [];
            this.onBatchModifyState(false);
            message.success('批量修改状态成功')
            that.refreshTable();
          }
          // if (response && response.success) {
          //   this.state.selectedRows = [];
          //   this.refreshTable();
          //   this.onBatchModifyState(false);
          //   message.success('批量修改状态成功');
          // }
        }
      });
    });
  }
  onSearch = (data) => {
    const { pageFilter } = this.state;
    if (data) {
      pageFilter.likeKeyValues = {
        ...pageFilter.likeKeyValues,
        codeNameLike: data.codeNameLike
      },
        pageFilter.searchKeyValues = {
          ...pageFilter.searchKeyValues,
          stateEquals: data.stateEquals,
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        stateEquals: null
      },
        pageFilter.likeKeyValues = {
          codeNameLike: ''
        }
    }
    this.refreshTable();
  }
  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    dispatch({
      type: 'dock/query',
      payload: queryFilter,
    });
  };
  drawActionButton = () => {
    return (
      <Fragment>
        <Button type="primary" onClick={() => this.onViewDockGroupSearchPage()}>
          {dockLocale.dockGroup}
        </Button>
        <Button disabled={!havePermission(DOCK_RES.CREATE)} icon="plus" type="primary" onClick={() => this.onCreate()}>
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    );
  }
  drawToolbarPanel = () => {
    return [
      // <Button key='onLine' disabled={!havePermission(DOCK_RES.ONLINE)} onClick={() => this.onBatchEnable()}>
      //     {commonLocale.batchOnlineLocale}
      // </Button>,
      // <Button key='offLine' disabled={!havePermission(DOCK_RES.ONLINE)} onClick={() => this.onBatchDisEnable()}>
      //     {commonLocale.batchOfflineLocale}
      // </Button>
      <Button key='batchModifyState' onClick={() => this.onBatchModifyState(true )}>
        {commonLocale.batchModifyStateLocal}
      </Button>
    ];
  }
  onBatchEnable = () => {
    this.setState({
      batchAction: dockLocale.enable
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }
  onBatchDisEnable = () => {
    this.setState({
      batchAction: dockLocale.disEnable
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }
  onBatchModifyState = (flag) => {
    this.setState({
      batchAction: dockLocale.batchModifyState,
      modifyModalVisible: !!flag
    });
  }
  onModify= (flag) => {
    this.setState({
      selectedRows: [],
      modifyModalVisible: !!flag
    });
  }

   /**
   * 批量修改
   */
  onBatchModifyStatePross = (value) => {
    this.setState({
      batchAction: '修改状态',
      modifyValue:value.state,
      modifyModalVisible: false
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }
  onBatchProcess = value => {
    const { selectedRows, batchAction,modifyValue } = this.state;
    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        that.onModifyState(selectedRows[i],modifyValue, true).then(res => {
          bacth(i + 1);
        });
      }
    }
    bacth(0);
    // const selectedUuids = [];
    // const selectedVersions = [];
    // selectedRows.forEach(function (e) {
    //   selectedUuids.push(e.uuid);
    //   selectedVersions.push(e.version);
    //   // this.setState({
    //   //   uuids: selectedUuids,
    //   //   versions: selectedVersions
    //   // })
    //   that.onModifyState(e, value.state);
    // });
  }
  drawOtherCom = () => {
    const { modifyModalVisible, uuids, startAlcNumObj, versions,
    } = this.state;
    const startParentMethods = {
      uuids: uuids,
      versions: versions,
      handleSave: this.onBatchModifyStatePross,
      onBatchModifyState: this.onBatchModifyState,
      onModify: this.onModify
    };
    return (
      <div>
        <DockStateModal
          {...startParentMethods}
          modifyModalVisible={modifyModalVisible}
          confirmLoading={this.props.loading}
        />
        <div>
          {this.drawProgress()}
        </div>
      </div>
    );
  }
  drawSearchPanel = () => {
    return <DockSearchForm filterEqualsValue={this.state.pageFilter.searchKeyValues}
                           filterLikeValue={this.state.pageFilter.likeKeyValues}
                           refresh={this.onSearch} />;
  }
  fetchOperateProps = (record) => {
    let operateProps = [];
    operateProps.push(
      {
        name: commonLocale.viewLocale,
        onClick: this.onView.bind(this, record)
      }
    );
    if (record.state === 'DISENABLED') {
      operateProps.push(
        {
          name: commonLocale.editLocale,
          disabled: !havePermission(DOCK_RES.EDIT),
          onClick: this.onCreate.bind(this, record.uuid)
        }
      );
    }
    return operateProps;
  }
  columns = [
    {
      title: commonLocale.codeLocale,
      dataIndex: 'code',
      sorter: true,
      width: 300,
      render: (text, record) => {
        return (
          <a onClick={() => this.onView(record)}>
            {text}
          </a>
        );
      }
    },
    {
      title: commonLocale.nameLocale,
      dataIndex: 'name',
      sorter: true,
      width: 300,
    },
    {
      title: dockLocale.dockGroup,
      dataIndex: 'dockGroup',
      sorter: true,
      width: 300,
      render: val => (
        <EllipsisCol colValue={convertCodeName(val)} />
      )
    },
    {
      title: commonLocale.stateLocale,
      width: colWidth.enumColWidth,
      dataIndex: 'state',
      // render: (text, record) => {
      //     confirm = record.state == 'FREE' ? commonLocale.offlineLocale : commonLocale.onlineLocale;
      //     return (
      //         <div>
      //             <IPopconfirm onConfirm={this.handleOnlineOrOffline.bind(this, record)}
      //                 operate={confirm}
      //                 object={dockLocale.title}
      //             >
      //                 <Switch
      //                     disabled={record.state == 'USING' || !havePermission(DOCK_RES.ONLINE) ? true : false}
      //                     checked={record.state == 'DISENABLED' ? false : true}
      //                     size="small" />
      //                 &emsp;{DockState[record.state]}
      //             </IPopconfirm>
      //         </div>
      //     );
      // },
      sorter: true,
      render: val => <DockUtil value={val} />
    },
    {
      key: 'operate',
      title: commonLocale.operateLocale,
      width: 300,
      render: record => {
        return <OperateCol menus={this.fetchOperateProps(record)} />
      }
    }
  ];
}
