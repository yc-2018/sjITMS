import { Fragment } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, message, Input, InputNumber } from 'antd';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { colWidth } from '@/utils/ColWidth';
import { loginCompany, loginOrg,getActiveKey } from '@/utils/LoginContext';
import { commonLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from './BadgeUtil';
import moment from 'moment';
import { formatDate } from '@/utils/utils';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { ORDER_RES } from '@/pages/In/Order/OrderPermission';
import { WAVEBILL_RES } from '@/pages/Out/Wave/WaveBillPermission';
import { STORE_RES } from '@/pages/Basic/Store/StorePermission';
import { alcNtcLocale } from './TransportOrderLocale';
import { State, orderBillType, urgencyLevel } from './TransportOrderContants';
import TransportOrderSearchForm from './TransportOrderSearchForm';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { orgType } from '@/utils/OrgType';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
import { getQueryBillDays } from '@/utils/LoginContext';
@connect(({ transportOrder, loading }) => ({
  transportOrder,
  loading: loading.models.transportOrder,
}))
export default class TransportOrderSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: alcNtcLocale.title,
      key:'transportOrder.search.page',
      data: props.transportOrder.data,
      rowClassName: null,
      suspendLoading: false,
      scrollValue:{
        x:5020
      }
    };
    this.state.pageFilter.searchKeyValues.dataSourceBeginTime = '';
    this.state.pageFilter.searchKeyValues.dataSourceEndTime = '';
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues['dispatchCenterUuid'] = loginOrg().uuid;
  }

  componentDidMount() {
    if(this.props.transportOrder.fromView) {
      return;
    } else {
      this.refreshTable();
    }
    let totalWidth = 0;
    this.columns.forEach(e => {
      if (e.width) {
        totalWidth = totalWidth + e.width;
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.transportOrder.data
    });
  }

  toggleCallback = () => {
    if(this.state.toggle) {
      this.setState({
        toggle: !this.state.toggle,
        tableHeight : 920,
      });
    } else {
      this.setState({
        toggle: !this.state.toggle,
        tableHeight : 520,
      });
    }

  };
   /**
   * 批量导入
   */
  handleShowExcelImportPage = () => {
    this.props.dispatch({
      type: 'transportOrder/showPage',
      payload: {
        showPage: 'import',
      }
    });
  }

  drawActionButton = () => {
    const menus = [];
    menus.push({
      name: commonLocale.importLocale,
      onClick: this.handleShowExcelImportPage
    });
    menus.push({
      name: '导出配置',
      onClick: this.export.bind(this, '')
    });
    return  <Fragment>
      <Button type="primary" icon="plus"
              onClick={this.onCreate.bind(this, '')}>
        {commonLocale.createLocale}
      </Button>
      <SearchMoreAction menus={menus}/>
    </Fragment>
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
      type: 'transportOrder/showPage',
      payload: {
        ...payload
      }
    });
  }

  onSplit = (uuid) => {
    const payload = {
      showPage: 'split'
    }
    payload.entityUuid = uuid;
    this.props.dispatch({
      type: 'transportOrder/showPage',
      payload: {
        ...payload
      }
    });
  };

  onChangeType = (record) => {
    this.props.dispatch({
      type: 'transportOrder/changeOrderType',
      payload: {
        billNumber: record.billNumber,
        dispatchCenterUuid: loginOrg().uuid
      },
      callback: response => {
        if (response && response.success) {
          this.refreshTable();
          message.success('订单类型转换成功')
        }
      }
    });
  };

  onCartonCountSplit = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'transportOrder/splitOrder',
        payload: {
          orderUuid: record.uuid,
          cartonCount: record.cartonCountSplit
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success('拆单成功')
          }
        }
      })
    })
  }

  onCancel = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'transportOrder/cancel',
        payload: {
          billNumber: record.billNumber,
          dispatchCenterUuid: loginOrg().uuid
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success('取消成功')
          }
        }
      })
    })
  }

  onReturnCancel = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'transportOrder/returnCancel',
        payload: {
          billNumber: record.billNumber,
          dispatchCenterUuid: loginOrg().uuid
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success('撤销取消成功')
          }
        }
      })
    })
  }

  onInitial = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'transportOrder/initial',
        payload: {
          billNumber: record.billNumber,
          dispatchCenterUuid: loginOrg().uuid
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success('审核成功')
          }
        }
      })
    })
  }

  /**
   * 单一删除
   */
  onRemove = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'transportOrder/delete',
        payload: {
          uuid: record.uuid
        },
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

  export = () => {
    const payload = {
      showPage: 'exportCreate',
      companyUuid: loginCompany().uuid,
      dispatchCenterUuid: loginOrg().uuid
    };
    this.props.dispatch({
      type: 'transportOrder/showPage',
      payload: {
        ...payload
      }
    });
  }

  handleFieldChange = (e, fieldName, line) => {
    const { data } = this.state;
    const target = data.list[line];
    if (fieldName === 'pickUpPoint.specificAddress') {
      target.pickUpPoint.specificAddress = e.target.value;
    }
    if (fieldName === 'deliveryPoint.specificAddress') {
      target.deliveryPoint.specificAddress = e.target.value;
    }
    if (fieldName === 'appointmentTime') {
      target.appointmentTime = e.target.value;
    }
    if (fieldName === 'cartonCountSplit') {
      target.cartonCountSplit = e;
      this.setState({
        selectedRows: []
      })
    }
    this.setState({
      data: {...data}

    })
  }

  onBatchSplit = () => {
    this.setState({
      batchAction: '拆单',
      content: undefined
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchCancelSplit = () => {
    this.setState({
      batchAction: '取消拆单',
      content: undefined
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchCancel = () => {
    this.setState({
      batchAction: '取消',
      content: undefined
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchInitial = () => {
    this.setState({
      batchAction: commonLocale.auditLocale,
      content: undefined
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  /**
   * 批量删除
   */
  onBatchRemove = () => {
    this.setState({
      batchAction: commonLocale.deleteLocale,
      content: undefined
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  /**
   * 保存
   */
  onSave = () => {
    const { selectedRows } = this.state;
    if(selectedRows.length==0){
      message.warning('请先勾选行！');
      return;
    }
    let params = [];
    selectedRows.forEach((item,index)=>{
      params.push({
        companyUuid: loginCompany().uuid,
        dispatchCenterUuid: loginOrg().uuid,
        billNumber: item.billNumber,
        appointment: item.appointmentTime,
        pickUpPointSpecificAddress: item.pickUpPoint.specificAddress,
        deliveryPointSpecificAddress: item.deliveryPoint.specificAddress
      })
    });
    this.props.dispatch({
      type: 'transportOrder/batchSave',
      payload:params,
      callback:response=>{
        if(response&&response.success){
          this.refreshTable();
          message.success(commonLocale.saveSuccessLocale);
        }
      }
    })
  };

  onExport = () => {
    const { selectedRows } = this.state;
    if(selectedRows.length==0){
      message.warning('请先勾选行！');
      return;
    }
    let params = [];
    selectedRows.forEach((item,index)=>{
      params.push(item.uuid)
    });
    this.props.dispatch({
      type: 'transportOrder/batchExportAndDownload',
      payload:{
        companyUuid: loginCompany().uuid,
        dispatchCenterUuid: loginOrg().uuid,
        uuids: params
      },
      callback:response=>{
        if(response&&response.success){
          if(response.data && response.data.ossUrl) {
            const link = document.createElement("a");
            link.style.display = "none";
            link.href = response.data.ossUrl;
            link.click();
            message.success('导出成功');
            this.refreshTable();
          }
        }
      }
    })
  };

  // 批量操作
  onBatchProcess = () => {
    this.setState({
      suspendLoading: true
    })
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === '取消') {
          if ((selectedRows[i].stat === State.Initial.name || selectedRows[i].stat === State.Scheduled.name)) {
            that.onCancel(selectedRows[i], true).then(res => {
              bacth(i + 1);
            });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          }
        } else if (batchAction === commonLocale.auditLocale){
          if (selectedRows[i].stat === State.Saved.name) {
            that.onInitial(selectedRows[i], true).then(res => {
              bacth(i + 1);
            });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          }
        }else if (batchAction === commonLocale.deleteLocale) {
          if (selectedRows[i].stat === State.Saved.name) {
            that.onRemove(selectedRows[i], true).then(res => {
              bacth(i + 1);
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          }
        } else if (batchAction === '拆单') {
          if (selectedRows[i].stat === State.Initial.name) {
            that.onCartonCountSplit(selectedRows[i], true).then(res => {
              bacth(i + 1);
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          }
        } else if (batchAction === '取消拆单') {
          if (selectedRows[i].sourceOrderBillTms) {
            that.onCancel(selectedRows[i], true).then(res => {
              bacth(i + 1);
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          }
        } else {
          this.setState({
            suspendLoading: false
          })
        }
      }
    }
    bacth(0);
  }

  drawSearchPanel = () => {
    return (
      <div>
        <TransportOrderSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} toggleCallback={this.toggleCallback}/>
      </div>

    );
  }

  drawToolbarPanel = () => {
    const { selectedRows } = this.state;

    const batchPrintParams = [];
    selectedRows.forEach(function (e) {
      batchPrintParams.push({
        billNumber: e.billNumber
      })
    });
    return loginOrg().type == orgType.store.name ? [] : [
      <Button key='onCancel'
              onClick={() => this.onBatchCancel()}
      >
        {commonLocale.batchCancelLocale}
      </Button>,
      <Button key='onInitial'
              onClick={() => this.onBatchInitial()}
      >
        {commonLocale.batchAuditLocale}
      </Button>,
      <Button key={'onRemove'} onClick={() => this.onBatchRemove()}>
        {commonLocale.batchRemoveLocale}
      </Button>,
      <Button onClick={this.onSave}>
        {commonLocale.saveLocale}
      </Button>,
      <Button onClick={this.onBatchSplit}>
        {'批量拆单'}
      </Button>,
      <Button onClick={this.onBatchCancelSplit}>
        {'批量取消拆单'}
      </Button>,
      <Button onClick={this.onExport}>
        {'导出'}
      </Button>
    ];
  }

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.editLocale,
      onClick: this.onCreate.bind(this, record.uuid)
    }, {
      name: '取消',
      confirm: true,
      confirmCaption: alcNtcLocale.title,
      onClick: this.onCancel.bind(this, record, false)
    }, {
      name: '拆单',
      onClick: this.onSplit.bind(this, record.uuid)
    }];
  }

  fetchOperatePropsTwo = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.editLocale,
      onClick: this.onCreate.bind(this, record.uuid)
    }, {
      name: commonLocale.auditLocale,
      confirm: true,
      confirmCaption: alcNtcLocale.title,
      onClick: this.onInitial.bind(this, record, false)
    }, {
      name: commonLocale.deleteLocale,
      confirm: true,
      confirmCaption: alcNtcLocale.title,
      onClick: this.onRemove.bind(this, record, false)
    }];
  }

  fetchOperatePropsThree = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }];
  }

  fetchOperatePropsNine = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.editLocale,
      onClick: this.onCreate.bind(this, record.uuid)
    }];
  }

  fetchOperatePropsFour = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.editLocale,
      onClick: this.onCreate.bind(this, record.uuid)
    }, {
      name: '取消',
      confirm: true,
      confirmCaption: alcNtcLocale.title,
      onClick: this.onCancel.bind(this, record, false)
    }];
  }

  fetchOperatePropsSix = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.editLocale,
      onClick: this.onCreate.bind(this, record.uuid)
    }, {
      name: '取消',
      confirm: true,
      confirmCaption: alcNtcLocale.title,
      onClick: this.onCancel.bind(this, record, false)
    },
      {
        name: '调度类型转换',
        confirm: true,
        confirmCaption: alcNtcLocale.title,
        onClick: this.onChangeType.bind(this, record, false)
      }];
  }

  fetchOperatePropsEight = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    },
      {
        name: '调度类型转换',
        confirm: true,
        confirmCaption: alcNtcLocale.title,
        onClick: this.onChangeType.bind(this, record, false)
      }];
  }

  fetchOperatePropsFive = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: '撤销取消',
      confirm: true,
      confirmCaption: alcNtcLocale.title,
      onClick: this.onReturnCancel.bind(this, record, false)
    }];
  }

  fetchOperatePropsSeven = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.editLocale,
      onClick: this.onCreate.bind(this, record.uuid)
    }, {
      name: '取消',
      confirm: true,
      confirmCaption: alcNtcLocale.title,
      onClick: this.onCancel.bind(this, record, false)
    }, {
      name: '拆单',
      onClick: this.onSplit.bind(this, record.uuid)
    }, {
      name: '调度类型转换',
      confirm: true,
      confirmCaption: alcNtcLocale.title,
      onClick: this.onChangeType.bind(this, record, false)
    }];
  }

  renderOperateCol = (record) => {
    if (State[record.stat].name == 'Initial') {
      if(record.sourceOrderBillTms) {
        if(record.orderType === 'Delivery' && !record.selfhandover) {
          return <OperateCol menus={this.fetchOperatePropsSix(record)} />
        } else {
          return <OperateCol menus={this.fetchOperatePropsFour(record)} />
        }
      } else {
        if(record.orderType === 'Delivery' && !record.selfhandover) {
          return <OperateCol menus={this.fetchOperatePropsSeven(record)} />
        } else {
          return <OperateCol menus={this.fetchOperatePropsOne(record)} />
        }
      }
    } else if(State[record.stat].name === 'Saved') {
      return <OperateCol menus={this.fetchOperatePropsTwo(record)} />
    } else if(State[record.stat].name === 'Canceled') {
      return <OperateCol menus={this.fetchOperatePropsFive(record)} />
    } else if(State[record.stat].name === 'Finished') {
        if(record.selfhandover) {
          return <OperateCol menus={this.fetchOperatePropsEight(record)} />
        } else {
          return <OperateCol menus={this.fetchOperatePropsThree(record)} />
        }
    } else if(State[record.stat].name === 'Scheduled' || State[record.stat].name === 'Shiped'){
      return <OperateCol menus={this.fetchOperatePropsNine(record)} />
    } else {
      return <OperateCol menus={this.fetchOperatePropsThree(record)} />
    }
  }
  getTotalWidth = (columns) => {
    let totalWidth = 0;
    columns.forEach(e => {
      if (e.width) {
        totalWidth = totalWidth + e.width;
      }
    });

    return totalWidth;
  }

  columns = [
    {
      title: commonLocale.billNumberLocal,
      dataIndex: 'billNumber',
      sorter: true,
      fixed: 'left',
      width: 180,
      render: (val, record) =>{
        return val?<span onClick={this.onView.bind(this, record)}>{val}</span>:<Empty />
      }
    },
    {
      title: '物流单号',
      dataIndex:'wmsNum',
      sorter: true,
      width: 180,
      render:(val)=>{
        return val?<span>{val}</span>:<Empty />
      }
    },
    {
      title: '物流来源单号',
      dataIndex:'sourceNum',
      sorter: true,
      width: 180,
      render:(val)=>{
        return val?<span>{val}</span>:<Empty />
      }
    },
    {
      title: alcNtcLocale.sourceBill,
      dataIndex:'sourceOrderBillTms',
      sorter: true,
      width: 180,
      render:(val)=>{
        return val?<span>{val}</span>:<Empty />
      }
    },
    {
      title: '波次号',
      dataIndex:'waveNum',
      sorter: true,
      width: 180,
      render:(val)=>{
        return val?<span>{val}</span>:<Empty />
      }
    },
    {
      title: '整箱数(估)',
      dataIndex: 'cartonCount',
      sorter: true,
      width: 120,
      render:(val)=>{
        return val?<span>{val}</span>:<Empty />
      }
    },
    {
      title: '拆分整箱数',
      dataIndex: 'cartonCountSplit',
      width: 120,
      render:(val,record, index)=>{
        return (
          <InputNumber
            value = {val}
            min={0}
            max={record.realCartonCount ? record.realCartonCount : record.cartonCount}
            precision={0}
            disabled={record.sourceOrderBillTms || record.stat !=='Initial'}
            onChange={
              e => this.handleFieldChange(e, 'cartonCountSplit', index)
            }
          />

        )
      }
    },
    {
      title: '零散数(估)',
      dataIndex: 'scatteredCount',
      sorter: true,
      width: 120,
      render:(val)=>{
        return val?<span>{val ? val : 0}</span>:<Empty />
      }
    },
    {
      title: '周转箱数(估)',
      dataIndex: 'containerCount',
      sorter: true,
      width: 120,
      render:(val)=>{
        return val?<span>{val}</span>:<Empty />
      }
    },
    {
      title: alcNtcLocale.weight,
      dataIndex:'weight',
      sorter: true,
      width: 80,
      render:(val)=>{
        return val?<span>{val}</span>:<Empty />
      }
    },
    {
      title: alcNtcLocale.volume,
      dataIndex:'volume',
      sorter: true,
      width: 80,
      render:(val)=>{
        return val?<span>{val}</span>:<Empty />
      }
    },
    {
      title: alcNtcLocale.shipplanbill,
      dataIndex:'scheduleNum',
      sorter: true,
      width: 180,
      render:(val)=>{
        return val?<span>{val}</span>:<Empty/>
      }
    },
    {
      title: '整箱数(复核)',
      dataIndex: 'realCartonCount',
      sorter: true,
      width: 120,
      render:(val)=>{
        return val?<span>{val}</span>:<Empty />
      }
    },
    {
      title: '零散数(复核)',
      dataIndex: 'realScatteredCount',
      sorter: true,
      width: 120,
      render:(val)=>{
        return val?<span>{val ? val : 0}</span>:<Empty />
      }
    },
    {
      title: '周转箱数(复核)',
      dataIndex: 'realContainerCount',
      sorter: true,
      width: 120,
      render:(val)=>{
        return val?<span>{val}</span>:<Empty />
      }
    },
    {
      title: commonLocale.inOwnerLocale,
      dataIndex: 'owner',
      sorter: true,
      width: 80,
      render:(val)=>{
        return val?<span>{convertCodeName(val)}</span>:<Empty />
      }
    },
    {
      title: alcNtcLocale.orderType,
      dataIndex:'orderType',
      sorter: true,
      width: 80,
      render:(val,record)=>{
        return val?<span>{orderBillType[record.orderType].caption}</span>:<Empty />
      }
    },
    {
      title: alcNtcLocale.urgencyLevel,
      dataIndex:'urgencyLevel',
      sorter: true,
      width: 80,
      render:(val)=>{
        return val?<span>{val ? '是' : '否'}</span>:<Empty />
      }
    },
    {
      title: '取货点具体位置',
      dataIndex: 'pickUpPoint.specificAddress',
      sorter: true,
      width: 200,
      // render:(val,record)=>{
      //   return val?<span><EllipsisCol colValue={record.pickUpPoint.specificAddress}/></span>:<Empty />
      // }
      render:(val,record, index)=>{
        return (
          <Input
            disabled={record.stat !=='Saved' && record.stat !=='Initial'}
            value={record.pickUpPoint.specificAddress}
            onChange={
              e => this.handleFieldChange(e, 'pickUpPoint.specificAddress', index)
            }
          />
        )
      }
    },
    {
      title: '送货点代码',
      dataIndex: 'deliveryPoint.code',
      sorter: true,
      width: 100,
    },
    {
      title: '送货点名称',
      dataIndex: 'deliveryPoint.name',
      sorter: true,
      width: 150,
    },
    {
      title: '送货点地址',
      dataIndex: 'deliveryPoint.address',
      sorter: true,
      width: 200,
    },
    {
      title: '送货点具体位置',
      dataIndex: 'deliveryPoint.specificAddress',
      sorter: true,
      width: 200,
      // render:(val,record)=>{
      //   return val?<span><EllipsisCol colValue={record.deliveryPoint.specificAddress}/></span>:<Empty />
      // }
      render:(val,record, index)=>{
        return (
          <Input
            disabled={record.stat !=='Saved' && record.stat !=='Initial'}
            value={record.deliveryPoint.specificAddress}
            onChange={
              e => this.handleFieldChange(e, 'deliveryPoint.specificAddress', index)
            }
          />
        )
      }
    },
    {
      title: '送货点联系人',
      dataIndex: 'deliveryPoint.contacter',
      sorter: true,
      width: 150,
    },
    {
      title: '送货点联系电话',
      dataIndex: 'deliveryPoint.contactNumber',
      sorter: true,
      width: 180,
    },
    {
      title: '最终点代码',
      dataIndex: 'finalPoint.code',
      sorter: true,
      width: 100,
    },
    {
      title: '最终点名称',
      dataIndex: 'finalPoint.name',
      sorter: true,
      width: 150,
    },
    {
      title: '最终点地址',
      dataIndex: 'finalPoint.address',
      sorter: true,
      width: 200,
    },
    {
      title: '最终点具体位置',
      dataIndex: 'finalPoint.specificAddress',
      sorter: true,
      width: 200,
      render:(val,record)=>{
        return val?<span><EllipsisCol colValue={record.finalPoint.specificAddress}/></span>:<Empty />
      }
    },
    {
      title: '最终点联系人',
      dataIndex: 'finalPoint.contacter',
      sorter: true,
      width: 150,
    },
    {
      title: '最终点联系电话',
      dataIndex: 'finalPoint.contactNumber',
      sorter: true,
      width: 180,
    },
    // {
    //   title: alcNtcLocale.deliveryPoint,
    //   dataIndex: 'deliveryPoint',
    //   width: colWidth.codeNameColWidth,
    //   render:(val)=>{
    //     return val?<span>{convertCodeName(val)}</span>:<Empty />
    //   }
    // },
    {
      title: commonLocale.stateLocale,
      dataIndex:'stat',
      sorter: true,
      width: 150,
      render:(val,record)=>{
        return val?<span><BadgeUtil value={record.stat} /></span>:<Empty />
      }
    },
    {
      title: '预约时间',
      dataIndex:'appointmentTime',
      sorter: true,
      width: 180,
      // render:(val,record)=>{
      //   return val?<span>{moment(record.appointment).format('YYYY-MM-DD')}</span>:<Empty />
      // }
      render:(val,record, index)=>{
        return (
          <Input
            disabled={record.stat !=='Saved' && record.stat !=='Initial'}
            value={record.appointmentTime ? record.appointmentTime : ''}
            onChange={
              e => this.handleFieldChange(e, 'appointmentTime', index)
            }
          />
        )
      }
    },
    {
      title: '备注',
      dataIndex:'note',
      width: 200,
      sorter: true,
      render:(val)=>{
        return val?<span>{val}</span>:<Empty />
      }
    },
    {
      title: '下单日期',
      dataIndex:'orderTime',
      width: 180,
      sorter: true,
      render:(val,record)=>{
        return val?<span>{moment(record.orderTime).format('YYYY-MM-DD')}</span>:<Empty />
      }
    },
    {
      title: commonLocale.operateLocale,
      width: 150,
      render: record => (
        this.renderOperateCol(record)
      ),
    },
  ];

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: []
      });
      if(pageFilter.searchKeyValues && !pageFilter.searchKeyValues.days) {
        pageFilter.searchKeyValues.days = getQueryBillDays()
      }
    }

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    dispatch({
      type: 'transportOrder/query',
      payload: queryFilter,
    });

  };

  onSearch = (data) => {
    const { pageFilter } = this.state;
    pageFilter.page = 0;
    if (data) {
      let storeUuid = undefined;
      let ownerUuid = undefined;
      let wrhUuid = undefined;
      let dcUuid = undefined;
      let beginCreateTime = '';
      let endCreateTime = '';
      var days = '';
      if (data.store) {
        storeUuid = JSON.parse(data.store).uuid;
      } else if (loginOrg().type == orgType.store.name) {
        storeUuid = loginOrg().uuid;
      }
      if (data.dc) {
        dcUuid = JSON.parse(data.dc).uuid
      }
      if (data.owner) {
        ownerUuid = JSON.parse(data.owner).uuid
      }
      if (data.wrh) {
        wrhUuid = JSON.parse(data.wrh).uuid
      }
      if (data.dataSourceTime) {
        beginCreateTime = moment(data.dataSourceTime[0]).format('YYYY-MM-DD HH:mm:ss');
        endCreateTime = moment(data.dataSourceTime[1]).format('YYYY-MM-DD HH:mm:ss');
      }
      if (data.days) {
        days = data.days
      }
      pageFilter.searchKeyValues = {
        dcUuid: loginOrg().type == orgType.store.name ? dcUuid : undefined,
        ...pageFilter.searchKeyValues,
        ...data,
        storeUuid: storeUuid,
        ownerUuid: ownerUuid,
        wrhUuid: wrhUuid,
        dataSourceBeginTime: beginCreateTime,
        dataSourceEndTime: endCreateTime,
        days: days
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        days: getQueryBillDays()
      }
      pageFilter.searchKeyValues['dispatchCenterUuid'] = loginOrg().uuid;
      this.state.pageFilter.searchKeyValues.dataSourceBeginTime = '';
      this.state.pageFilter.searchKeyValues.dataSourceEndTime = '';
    }
    this.refreshTable();
  }

  /**
   * 跳转到详情页面
   */
  onView = (record) => {
    this.props.dispatch({
      type: 'transportOrder/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  /**
   * 跳转到订单详情页面
   */
  onOrderView = (record) => {
    this.props.dispatch({
      type: 'transportOrder/getByBillNumberAndDcUuid',
      payload: {
        dispatchCenterUuid: loginOrg().uuid,
        billNumber: record.billNumber
      },
      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/in/order',
            payload: {
              showPage: 'view',
              entityUuid: response.data ? response.data.uuid : undefined
            }
          }));
        }
      }
    });
  }

}
