import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, Modal,message} from 'antd';
import Empty from '@/pages/Component/Form/Empty';
import { colWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { loginOrg, loginCompany, getActiveKey } from '@/utils/LoginContext';
import ShipPlanBillSearchForm from './ShipPlanBillSearchForm';
import VehicleModal from './VehicleModal';
import ShipPlanBillCreateModal from '../../VehicleDispatching/ShipPlan/ShipPlanBillCreateModal';
import { vehicleDispatchingLocale } from '../../VehicleDispatching/VehicleDispatchingLocale';
import { State, MemberType } from '../../ShipPlanBillDispatch/ShipPlanBillDispatchContants';
import SearchPage from '../../VehicleDispatching/Utils/SearchPage';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';

@connect(({ vehicleDispatching,shipPlanBillDispatch, loading }) => ({
  vehicleDispatching,shipPlanBillDispatch,
  loading: loading.models.vehicleDispatching,
}))
@Form.create()
export default class ShipPlanBillPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: vehicleDispatchingLocale.shipPlanBillListTitle,
      key:'shipPlanBill.search.table',

      searchPageType:'SHIP',
      data:{
        list:[]
      },
      targetShipPlanBill:{},
      createModalVisible:false,
      vehicleModalVisible:false,
      selectedRows: [],
      suspendLoading: false,
      hasOnRow: true,

      width:"100%",
      minHeight:"300px",
      scrollValue:{
        x:1600,
        y:null
      },
    }
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dispatchCenterUuid = loginOrg().uuid;
   
  }

  componentDidMount() {
    this.props.onRef && this.props.onRef(this)
    this.refreshTable(this.state.pageFilter)

  }

  refreshTableForProgress = ()=>{
    const { dispatch } = this.props;
    const { pageFilter,data } = this.state;
    this.props.onReFreshNormal();
    dispatch({
      type: 'shipPlanBillDispatch/queryScheduleBill',
      payload: pageFilter,
      callback:response=>{
        if(response&&response.success){
          data.list = response.data?response.data:[]
          this.state.scrollValue.y = response.data&&response.data.length>0?"calc(25vh)":null;
          this.setState({
            data:{...this.state.data},
            scrollValue:{...this.state.scrollValue}
          })
        }
      }
    });

    this.setState({
      targetShipPlanBill:{}
    },()=>{
      this.props.refreshView();
    })
  }

  /**
   * 刷新/重置
   */
  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter,data } = this.state;

    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: [],
      });
    }

    dispatch({
      type: 'shipPlanBillDispatch/queryScheduleBill',
      payload: filter?filter:pageFilter,
      callback:response=>{
        if(response&&response.success){
          data.list = response.data?response.data:[]
          this.state.scrollValue.y = response.data&&response.data.length>0?"calc(25vh)":null;

          this.setState({
            data:{...this.state.data},
            scrollValue:{...this.state.scrollValue}

          })
        }
      }
    });
  };

  onBatchRemove = () => {
    this.setState({
      batchAction: '删除',
      content: '排车单'
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchApprove = () => {
    this.setState({
      batchAction: '批准',
      content: '排车单'
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchProcess = () => {
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === '删除') {
          if (selectedRows[i].stat == State.Saved.name) {
            this.onRemove(selectedRows[i], true).then(res => {
              bacth(i + 1)
            });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        }else if(batchAction === '批准'){
          if (selectedRows[i].stat == State.Saved.name) {
            this.onApprove(selectedRows[i], true).then(res => {
              bacth(i + 1)
            });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        }
      }
    }

    bacth(0);
  }

  onRemove =(record,callback)=>{
    const { dispatch } = this.props;
    const that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'vehicleDispatching/onRemove',
        payload: record,
        callback: (response) => {
          if (callback) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable(that.state.pageFilter);
            message.success(commonLocale.auditSuccessLocale);
          }
        }
      });
    })
  }

  onApprove =(record,callback)=>{
    const { dispatch } = this.props;
    const that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'shipPlanBillDispatch/onApprove',
        payload: {
          billUuid:record.uuid,
          version:record.version,
        },
        callback: (response) => {
          if (callback) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable(that.state.pageFilter);
            message.success(commonLocale.auditSuccessLocale);
          }
        }
      });
    })
  }

  /**
   * 查看详情
   */
  onView = (record) => {
    this.props.onCreate(record);
  }
  onClickRow = (record)=>{
    this.props.onCreate(record);
  }
  /**
   * 编辑
   */
  onCreate = (record)=>{
    // if(!JSON.parse(sessionStorage.getItem(getActiveKey()))||!JSON.parse(sessionStorage.getItem(getActiveKey())).pageFilter.searchKeyValues.shipGroupCode){
    //   message.warning('请先根据排车组号查询')
    //   return;
    // }
    this.setState({
      createModalVisible:true,
      targetShipPlanBill:record?record:{}
    })
  }

  onCancelModal = ()=>{
    this.setState({
      createModalVisible:false,
      targetShipPlanBill:{}
    });
    this.refreshTable(this.state.pageFilter)
  }

  onSearch = (data)=>{
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    if (data) {
      let classGroupCode = '';
     
      if(data.classGroup){
        classGroupCode = JSON.parse(data.classGroup).code
      }

      pageFilter.searchKeyValues = {
          ...pageFilter.searchKeyValues,
          ...data,
          classGroupCode:classGroupCode,
      }
    }else{
      pageFilter.searchKeyValues = {
        companyUuid :loginCompany().uuid,
        dispatchCenterUuid : loginOrg().uuid,
      }
    }
    this.setState({
      pageFilter:pageFilter
    })
    this.refreshTable(pageFilter);

  }
  handleVehicleVisible = (flag)=>{
    this.setState({
      vehicleModalVisible:flag
    });
  }
  onVehicleOk = (data)=>{
    this.state.pageFilter.searchKeyValues.vehicleCode = data.code;
    this.state.pageFilter.searchKeyValues.vehicleUuid = data.uuid;
    this.handleVehicleVisible(false);
  }
  columns = [
    {
      title: commonLocale.operateLocale,
      width: 50,
      fixed:"left",
      render:record=>{
        return <a onClick={()=>this.onCreate(record)}>{vehicleDispatchingLocale.modifyButton}</a>
      }
    },
    {
      title: commonLocale.billNumberLocal,
      dataIndex: 'billNumber',
      width: colWidth.billNumberColWidth-50,
      render:(val,record)=>{
        return <a onClick={()=>this.onView(record)}>{val}</a>
      }
    },
    {
      title: vehicleDispatchingLocale.vehicleNum,
      dataIndex: 'vehicle',
      width: 80,
      render:(val,record)=>val?val.name:<Empty/>

    },
    {
      title: vehicleDispatchingLocale.deliveryPointCount,
      dataIndex: 'deliveryPointCount',
      width: 90,
    },
    {
      title: '总订单数',
      dataIndex: 'orderCount',
      width: 80,
    },
    {
      title: '载重率(%)',
      dataIndex: 'loadingRate',
      width: 80,
      render:val=>val?val:<Empty/>
    },
    {
      title:'送货员',
      width:170,
      render:(record)=>{
        let deliveryManList = [];
        if(record.memberDetails&&Array.isArray(record.memberDetails)){
          for(let m = 0;m<record.memberDetails.length;m++){
            if(record.memberDetails[m].memberType=== MemberType.DELIVERYMAN.name){
              deliveryManList.push(record.memberDetails[m].member)
            }
          }
        }
        return deliveryManList.length>0?<EllipsisCol colValue={convertCodeName(deliveryManList[0])}/>:<Empty/>
      }
    },
    {
      title:'送货员2',
      width:170,
      render:(record)=>{
        let deliveryManList = [];
        if(record.memberDetails&&Array.isArray(record.memberDetails)){
          for(let m = 0;m<record.memberDetails.length;m++){
            if(record.memberDetails[m].memberType=== MemberType.DELIVERYMAN.name){
              deliveryManList.push(record.memberDetails[m].member)
            }
          }
        }
        return deliveryManList.length>1?<EllipsisCol colValue={convertCodeName(deliveryManList[1])}/>:<Empty/>
      }
    },
    {
      title:'送货员3',
      width:170,
      render:(record)=>{
        let deliveryManList = [];
        if(record.memberDetails&&Array.isArray(record.memberDetails)){
          for(let m = 0;m<record.memberDetails.length;m++){
            if(record.memberDetails[m].memberType=== MemberType.DELIVERYMAN.name){
              deliveryManList.push(record.memberDetails[m].member)
            }
          }
        }
        return deliveryManList.length>2?<EllipsisCol colValue={convertCodeName(deliveryManList[2])}/>:<Empty/>
      }
    },
   
    {
      title: vehicleDispatchingLocale.stat,
      dataIndex: 'stat',
      width: 60,
      render:(val,record)=>val?State[val].caption:<Empty/>
    },
    {
      title: '车型',
      dataIndex: 'vehicleType',
      width: 140,
      render:val=>val?convertCodeName(val):<Empty/>
    },
    
  ];

  drawBussiness = ()=>{
    return  <div style={{marginBottom:'10px',marginRight:'50px'}}>
      <Button style={{marginRight:'12px'}} onClick={()=>this.onCreate(false)}>{commonLocale.createLocale}</Button>
      <Button style={{marginRight:'12px'}} onClick={()=>this.onBatchRemove()}>{'删除'}</Button>
      <Button onClick={()=>this.onBatchApprove()}>{'批准'}</Button>
    </div>
  }

  drawOther = ()=>{
    const { createModalVisible,targetShipPlanBill,vehicleModalVisible } = this.state;
    return <div>
      <ShipPlanBillCreateModal
        visible = {createModalVisible}
        entityUuid = {targetShipPlanBill.uuid}
        onCancelModal = {this.onCancelModal}
        onView = {this.onView}
        noShipGroup = {true}
      />
      <VehicleModal 
        visible = {vehicleModalVisible}
        onCancel = {()=>this.handleVehicleVisible(false)}
        onOk = {this.onVehicleOk}
      />
      </div>
  }
   /**
  * 绘制搜索表格
  */
 drawSearchPanel = () => {
  const {
    form: { getFieldDecorator },
  } = this.props;
  return (
    <ShipPlanBillSearchForm filterValue={this.state.pageFilter.searchKeyValues}
      onClickVehicle={()=>this.handleVehicleVisible(true)}
      refresh={this.onSearch}/>
  );
}
}
