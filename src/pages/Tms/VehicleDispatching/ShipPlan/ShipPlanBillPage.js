import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, Modal,message, Dropdown, Menu} from 'antd';
import Empty from '@/pages/Component/Form/Empty';
import { colWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { loginOrg, loginCompany, getActiveKey } from '@/utils/LoginContext';
import ShipPlanBillCreateModal from './ShipPlanBillCreateModal';
import { State, MemberType } from '../../ShipPlanBillDispatch/ShipPlanBillDispatchContants';
import SearchPage from '../Utils/SearchPage';
import { vehicleDispatchingLocale } from '../VehicleDispatchingLocale';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';

@connect(({ vehicleDispatching, loading }) => ({
  vehicleDispatching,
  loading: loading.models.vehicleDispatching,
}))
@Form.create()
export default class ShipPlanBillPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: vehicleDispatchingLocale.shipPlanBillListTitle,
      key:'vehicleDispatchingShipPlanBill.search.page',
      data:props.vehicleDispatching.shipPlanData,
      targetShipPlanBill:{},
      createModalVisible:false,
      selectedRows: [],
      suspendLoading: false,
      hasOnRow: true,
      width:"100%",
      // minHeight:"300px",
      scrollValue:{
        x:2000,
        y:props.vehicleDispatching.shipPlanData.list.length>0?"calc(50vh)":null
      },
      showViewPage:false,
      pageFilter:{
        page: 0,
        pageSize: 20,
        sortFields: {},
        searchKeyValues: {},
        likeKeyValues: {}
      }
    }
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dispatchCenterUuid = loginOrg().uuid;
  }

  componentDidMount() {
    this.props.onRef && this.props.onRef(this)
    this.props.dispatch({
      type: 'vehicleDispatching/queryShipPlan',
      payload: this.state.pageFilter,
    });
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.vehicleDispatching.shipPlanData!=this.props.vehicleDispatching.shipPlanData){
      if(nextProps.vehicleDispatching.shipPlanData.list.length>0){
        if(nextProps.vehicleDispatching.orderData.list.length>0){
          this.state.scrollValue.y = "calc(50vh)"
        }else{
          this.state.scrollValue.y = "calc(46vh)"
        }
      }else{
        this.state.scrollValue.y = null;
      }

      this.setState({
        data: nextProps.vehicleDispatching.shipPlanData,
        scrollValue:{...this.state.scrollValue}
      });
    }

    if(nextProps.vehicleDispatching.orderData!=this.props.vehicleDispatching.orderData){
      if(nextProps.vehicleDispatching.shipPlanData.list.length>0){
        if(nextProps.vehicleDispatching.orderData.list.length>0){
          this.state.scrollValue.y = "calc(50vh)"
        }else{
          this.state.scrollValue.y = "calc(46vh)"
        }
      }else{
        this.state.scrollValue.y = null;
      }

      this.setState({
        scrollValue:{...this.state.scrollValue}
      });
    }

  }

  refreshTableUseState = ()=>{
    this.setState({
      selectedRows:[]
    })
    this.props.dispatch({
      type: 'vehicleDispatching/queryShipPlan',
      payload: this.state.pageFilter,
    })
  }
  
  refreshTableForProgress = ()=>{
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    dispatch({
      type: 'vehicleDispatching/queryShipPlan',
      payload: pageFilter,
    });

    this.setState({
      targetShipPlanBill:{},
      selectedRows:[]
    },()=>{
      this.props.refreshView();
    })
  }

  /**
   * 刷新/重置
   */
  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: [],
      });
    }

    if (filter) {
      let ownerCode = '';
      let classGroupCode = '';
      if(filter.owner){
        ownerCode = JSON.parse(filter.owner).code
      }

      if(filter.classGroup){
        classGroupCode = JSON.parse(filter.classGroup).code
      }

      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...filter,
        ownerCode:ownerCode,
        classGroupCode:classGroupCode,
      }
    }else{
      pageFilter.searchKeyValues = {
        companyUuid :loginCompany().uuid,
        dispatchCenterUuid : loginOrg().uuid,
        ownerCode:'',
        classGroupCode:'',
        shipGroupCode:'',
      }
    }
    this.setState({
      pageFilter:pageFilter
    })
    dispatch({
      type: 'vehicleDispatching/queryShipPlan',
      payload: pageFilter,
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
    const { selectedRows, batchAction } = this.state;
    if(selectedRows.length==0){
      message.warning('请先选择行');
      return;
    }
    this.setState({
      batchAction: '批准',
      content: '排车单'
    },()=>{
      this.handleNotBatchProcessConfirmModalVisible(true)
    })

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
            that.props.refreshOrderBillTransportPage();
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

  onView = (record) => {
    this.props.onCreate(record);
  }

  changePage = (flag) =>{
    this.setState({
      showViewPage:flag
    })
  }
  
  onClickRow = (record)=>{
    this.changePage(true);
    this.props.onCreate(record);
  }

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

  columns = [
    {
      title: commonLocale.billNumberLocal,
      dataIndex: 'billNumber',
      sorter: true,
      key:'billNumber',
      width: 170,
      render:(val,record)=>{
        const menu = (
          <Menu>
            <Menu.Item key="modify" onClick={()=>this.onCreate(record)}>{vehicleDispatchingLocale.modifyButton}</Menu.Item>
          </Menu>
        );
        return <Dropdown overlay={menu} trigger={['contextMenu']}>
            <a onClick={()=>this.onView(record)}>{val}</a>
        </Dropdown>
      }
    },
    {
      title: vehicleDispatchingLocale.vehicleNum,
      dataIndex: 'vehicle',
      width: 100,
      render:(val,record)=>val?val.name:<Empty/>
    },
    {
      title:'驾驶员',
      width:170,
      render:(record)=>{
        let driver = undefined;
        if(record.memberDetails&&Array.isArray(record.memberDetails)){
          for(let m = 0;m<record.memberDetails.length;m++){
            if(record.memberDetails[m].memberType=== MemberType.DRIVER.name){
              driver = record.memberDetails[m].member;
              break;
            }
          }
        }

        return driver?<EllipsisCol colValue={convertCodeName(driver)}/>:<Empty/>
      }
    },
    {
      title: vehicleDispatchingLocale.totalCartonCount,
      dataIndex: 'cartonCount',
      width: 150,
    },
    {
      title: vehicleDispatchingLocale.totalRealCartonCount,
      dataIndex: 'realCartonCount',
      width: 160,
      render:(val,record)=>val&&val!=0?val:(record.cartonCount!=undefined?record.cartonCount:<Empty/>)
    },
    {
      title: vehicleDispatchingLocale.totalScatteredCount,
      dataIndex: 'scatteredCount',  
      width: 150,
    },
    {
      title: vehicleDispatchingLocale.totalRealScatteredCount,
      dataIndex: 'realScatteredCount',
      width: 160,
      render:(val,record)=>val&&val!=0?val:(record.scatteredCount!=undefined?record.scatteredCount:<Empty/>)
    },
    {
      title: vehicleDispatchingLocale.totalVolume,
      dataIndex: 'volume',
      width: 70,
      render:val=>val? <EllipsisCol colValue={val}/>:<Empty/>
    },
    {
      title: '门店数',
      dataIndex: 'deliveryPointCount',
      width: 70,
    },
    {
      title: '总数量',
      dataIndex: 'weight',
      width: 70,
      render:val=>val? <EllipsisCol colValue={val}/>:<Empty/>

    },
    {
      title: '限重',
      dataIndex: 'bearVolumeRate',
      width: 70,
      render:val=>val?val:<Empty/>
    },
    {
      title: '载重率(%)',
      dataIndex: 'loadingRate',
      width: 100,
      render:val=>val!=undefined?<EllipsisCol colValue={val}/>:<Empty/>
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
        return deliveryManList.length>2?<EllipsisCol colValue={convertCodeName(deliveryManList[2  ])}/>:<Empty/>
      }
    },
    // {
    //   title:'物流来源单号',
    //   dataIndex:'sourceWmsNum',
    //   width:140,
    //   render:val=>val?<span>{val}</span>:<Empty/>

    // },
    {
      title:'车型',
      dataIndex:'vehicleType',
      width:140,
      render:val=>val?<EllipsisCol colValue={convertCodeName(val)}/>:<Empty/>

    },
    {
      title: '排车单状态',
      dataIndex: 'stat',
      width: 100,
      render:(val,record)=>val?State[val].caption:<Empty/>
    },
    {
      title:'总订单数',
      dataIndex:'orderCount',
      width:80,
    },
    {
      title: vehicleDispatchingLocale.totalContainerCount,
      dataIndex: 'containerCount',
      width: 150,
    },
    {
      title: vehicleDispatchingLocale.totalRealContainerCount,
      dataIndex: 'realContainerCount',
      width: 170,
      render:(val,record)=>val&&val!=0?val:(record.containerCount!=undefined?record.containerCount:<Empty/>)
    },
    {
      title:'创建人',
      dataIndex:'createInfo',
      width:80,
      render:val=>val?<EllipsisCol colValue={val.operator.fullName}/>:<Empty/>

    },
    {
      title:'修改人',
      dataIndex:'lastModifyInfo',
      width:80,
      render:val=>val?<EllipsisCol colValue={val.operator.fullName}/>:<Empty/>

    },
  ];

  drawOther = ()=>{
    const { createModalVisible,targetShipPlanBill} = this.state;
    return <div>
      <div style={{marginBottom:'10px'}}>
        <Fragment>
          <Button onClick={()=>this.onCreate(false)} style={{marginRight:'10px'}}>{commonLocale.createLocale}</Button>
          <Button onClick={()=>this.onBatchRemove()} style={{marginRight:'10px'}}>{'删除'}</Button>
          <Button onClick={()=>this.onBatchApprove()}>{'批准'}</Button>
        </Fragment>
      </div>
      <div>
        <ShipPlanBillCreateModal
          visible = {createModalVisible}
          entityUuid = {targetShipPlanBill.uuid}
          onCancelModal = {this.onCancelModal}
          onView = {this.onView}
        />
      </div>
    </div>
  }
}
