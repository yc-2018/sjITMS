import { Fragment } from 'react'
import { connect } from 'dva'
import moment from 'moment'
import { Form, Button, message, } from 'antd'
import SearchPage from '@/pages/Component/Page/SearchPage'
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm'
import BadgeUtil from '@/pages/Component/BadgeUtil'
import OperateCol from '@/pages/Component/Form/OperateCol';
import { colWidth } from '@/utils/ColWidth'
import { commonLocale } from '@/utils/CommonLocale'
import { havePermission } from '@/utils/authority'
import { convertCodeName } from '@/utils/utils'
import { loginOrg, loginCompany } from '@/utils/LoginContext'
import ShipPlanBillDispatchSearchForm from './ShipPlanBillDispatchSearchForm';
import Empty from '@/pages/Component/Form/Empty';
import { State, Type } from './ShipPlanBillDispatchContants'
import { shipPlanBillDispatchLocale } from './ShipPlanBillDispatchLocale'
import PrintButton from '@/pages/Component/Printer/PrintButton'

@connect(({ shipPlanBillDispatch, loading }) => ({
  shipPlanBillDispatch,
  loading: loading.models.shipPlanBillDispatch
}))
@Form.create()
export default class ShipPlanBillDispatchSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: shipPlanBillDispatchLocale.title,
      data: props.shipPlanBillDispatch.data,
      selectedRows: [],
      suspendLoading: false,
      reportParams: []

    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dispatchCenterUuid = loginOrg().uuid;
  }

  componentDidMount() {
    this.refreshTable();
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.shipPlanBillDispatch.data
    });
  }

  changeSelectedRows = (selectedRows) => {
    let param = [];
    for (let i = 0; i < selectedRows.length; i++) {
      param.push({
        billNumber: selectedRows[i].billNumber
      })
    }
    this.setState({
      reportParams: param
    }, () => { })
  }

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: [],
      });
    }
    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    dispatch({
      type: 'shipPlanBillDispatch/query',
      payload: queryFilter,
    });
  };

  onSearch = (data) => {
    const {pageFilter} = this.state;
    pageFilter.page = 0;
    var beginCreateTime = '';
    var endCreateTime = '';
    if (data) {
      if (data.createTime) {
        beginCreateTime = moment(data.createTime[0]).format('YYYY-MM-DD')+' 00:00:00';
        endCreateTime = moment(data.createTime[1]).format('YYYY-MM-DD')+' 23:59:59';
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        carrierUuid: data.carrier ? JSON.parse(data.carrier).uuid : '',
        beginCreateTime: beginCreateTime,
        endCreateTime: endCreateTime,
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dispatchCenterUuid: loginOrg().uuid
      }
    }
    this.refreshTable();
  }

  onView = (record)=>{
    this.props.dispatch({
      type: 'shipPlanBillDispatch/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  onCreate = (record)=>{
    this.props.dispatch({
      type: 'shipPlanBillDispatch/showPage',
      payload: {
        showPage: 'create',
        entityUuid: record.uuid
      }
    });
  }

  onApprove = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'shipPlanBillDispatch/onApprove',
        payload: {
          billUuid: record.uuid,
          version: record.version,
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.approveSuccessLocale)
          }
        }
      })
    })
  }
  onAbort = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'shipPlanBillDispatch/onAbort',
        payload: {
          billUuid: record.uuid,
          version: record.version,
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.abortSuccessLocale)
          }
        }
      })
    })
  }

  onRollBack  = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'shipPlanBillDispatch/onRollBack',
        payload: {
          billUuid: record.uuid,
          version: record.version,
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success('回滚成功')
          }
        }
      })
    })
  }

  /**
   * 批量作废
   */
  onBatchAbort = () => {
    this.setState({
      batchAction: commonLocale.abortLocale
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

   /**
   * 批量回滚
   */
  onBatchRollBack = () => {
    this.setState({
      batchAction: shipPlanBillDispatchLocale.rollBack
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

   /**
   * 批量批准
   */
  onBatchApprove = () => {
    this.setState({
      batchAction: commonLocale.approveLocale
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  // 批量操作
  onBatchProcess = () => {
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === commonLocale.abortLocale) {
          if (selectedRows[i].stat == State.Approved.name||selectedRows[i].stat == State.Delivering.name
            ||selectedRows[i].stat == State.Shiped.name  ||selectedRows[i].stat == State.Returned.name
          ) {
            this.onAbort(selectedRows[i], true).then(res => {
              bacth(i + 1)
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        }else if(batchAction === shipPlanBillDispatchLocale.rollBack){
          if (selectedRows[i].stat == State.Approved.name) {
            this.onRollBack(selectedRows[i], true).then(res => {
              bacth(i + 1)
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        }else if(batchAction === commonLocale.approveLocale){
          if (selectedRows[i].stat == State.Saved.name) {
            this.onApprove(selectedRows[i], true).then(res => {
              bacth(i + 1)
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
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

  renderOperateCol = (record) => {
    return <OperateCol menus={this.fetchOperatePropsCommon(record)} />
  }

  fetchOperatePropsCommon = (record) => {
    if(record.stat === State.Approved.name){
      return [{
        name: commonLocale.viewLocale,
        onClick: this.onView.bind(this, record)
      },{
        name: commonLocale.editLocale,
        onClick: this.onCreate.bind(this, record)
      },{
        name: commonLocale.abortLocale,
        onClick: this.onAbort.bind(this, record,false)
      },{
        name: shipPlanBillDispatchLocale.rollBack,
        onClick: this.onRollBack.bind(this, record,false)
      }]
    }else if(record.stat === State.Saved.name){
      return [{
        name: commonLocale.viewLocale,
        onClick: this.onView.bind(this, record)
      },{
        name: commonLocale.editLocale,
        onClick: this.onCreate.bind(this, record)
      },{
        name: commonLocale.approveLocale,
        onClick: this.onApprove.bind(this, record,false)
      }]
    }else if(record.stat === State.Shiped.name){
      return [{
        name: commonLocale.viewLocale,
        onClick: this.onView.bind(this, record)
      },{
        name: commonLocale.abortLocale,
        onClick: this.onAbort.bind(this, record,false)
      }]
    }else if(record.stat === State.Delivering.name){
      return [{
        name: commonLocale.viewLocale,
        onClick: this.onView.bind(this, record)
      },{
        name: commonLocale.abortLocale,
        onClick: this.onAbort.bind(this, record,false)
      }]
    }else if(record.stat === State.Returned.name){
      return [{
        name: commonLocale.viewLocale,
        onClick: this.onView.bind(this, record)
      },{
        name: commonLocale.abortLocale,
        onClick: this.onAbort.bind(this, record,false)
      }]
    }else{
      return [{
        name: commonLocale.viewLocale,
        onClick: this.onView.bind(this, record)
      }]
    }
  }

  columns = [
    {
      title: commonLocale.billNumberLocal,
      dataIndex: 'billNumber',
      width: colWidth.billNumberColWidth-50,
      sorter: true,
      render: (val, record) =>
        <a onClick={this.onView.bind(this, record)}>{record.billNumber}</a>
    },
    {
      title: '排车组号',
      dataIndex: 'shipGroupCode',
      key: 'shipGroupCode',
      width: colWidth.billNumberColWidth-50,
      render: val => val?val:<Empty/>
    },
    {
      title: shipPlanBillDispatchLocale.type,
      dataIndex: 'type',
      width: 100,
      render:val=>val?Type[val].caption:<Empty/>
    },
    {
      title: shipPlanBillDispatchLocale.carrier,
      dataIndex: 'carrier',
      width: 100,
      render:val=>val?convertCodeName(val):<Empty/>
    },
    {
      title: shipPlanBillDispatchLocale.vehicleNum,
      dataIndex: 'vehicle',
      width: 100,
      render:val=>val?val.name:<Empty/>

    },
    {
      title: shipPlanBillDispatchLocale.vehicleType,
      dataIndex: 'vehicleType',
      width: 100,
      render:val=>val?convertCodeName(val):<Empty/>
    },
    {
      title: shipPlanBillDispatchLocale.stat,
      width: 100,
      render: record => record.stat?<BadgeUtil value={record.stat.toUpperCase()} />:<Empty/>
    },
    {
      title: '原排车单号',
      dataIndex: 'oldBillNumber',
      key: 'oldBillNumber',
      width: colWidth.billNumberColWidth-50,
      render: val => val?val:<Empty/>
    },
    {
      title: shipPlanBillDispatchLocale.relationPlanBillNum,
      dataIndex: 'relationPlanBillNum',
      width: colWidth.billNumberColWidth-50,
      render:val=>val?val:<Empty/>
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: record => (
        this.renderOperateCol(record)
      ),
    },
  ];

  drawToolbarPanel() {
    return [
      <Button key={1} onClick={() => this.onBatchApprove()}>
        {commonLocale.batchApproveLocale}
      </Button>,
      <Button key={2} onClick={() => this.onBatchAbort()}>
        {commonLocale.batchAbortLocale}
      </Button>,
      <Button key={3} onClick={() => this.onBatchRollBack()}>
        {shipPlanBillDispatchLocale.batchRollBack}
      </Button>,
      <PrintButton
        key='printButton'
        reportParams={this.state.reportParams}
        moduleId={'SHIPPLANBILL'} />
    ];
  }

  drawSearchPanel = () => {
    return <ShipPlanBillDispatchSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} toggleCallback={this.toggleCallback}/>;
  }
}
