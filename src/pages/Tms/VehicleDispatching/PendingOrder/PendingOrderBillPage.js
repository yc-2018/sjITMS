import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, Modal, Divider, message, Menu, Dropdown, Tooltip, Icon, Col, Row } from 'antd';
import SearchPage from '../Utils/SearchPage';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import StandardTable from '@/components/StandardTable';
import { add, accAdd } from '@/utils/QpcStrUtil';
import { OrderBillPendingTag, OrderBillStat, OrderBillUrgencyLevel, OrderStat } from '../VehicleDispatchingContants';
import { vehicleDispatchingLocale } from '../VehicleDispatchingLocale';
import { orderBillType } from '../../TransportOrder/TransportOrderContants';
@connect(({ vehicleDispatching, loading }) => ({
  vehicleDispatching,
  loading: loading.models.vehicleDispatching,
}))
@Form.create()
export default class PendingOrderBillPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: '待定列表',
      // searchPageType:'PENDINGORDER',
      data:props.vehicleDispatching.pendingOrderData,
      selectedRows: [],
      selectedRowsNest:{},

      suspendLoading: false,
      expand: true,
      noFixed: true,
      nestRowSelect: true,
      scrollValue:{
        x:1950,
        y:props.vehicleDispatching.pendingOrderData.list.length>0?400:null
      },

      showCreatePage:props.showCreatePage,
      shipPlanBill:props.shipPlanBill, // target
      key:'vehicleDispatchingPendingOrder.search.page',
      pageFilter:{
        page: 0,
        pageSize: 20,
        sortFields: {},
        searchKeyValues: {},
        likeKeyValues: {}
      }
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dispatchCenterUuid= loginOrg().uuid;
    this.state.pageFilter.searchKeyValues.pendingTag= OrderBillPendingTag.Pending.name;
    this.state.pageFilter.searchKeyValues.storeOrders= [];
  }

  componentDidMount() {
    this.props.onRef && this.props.onRef(this)
    this.refreshTable(this.state.pageFilter);
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.vehicleDispatching.pendingOrderData!=this.props.vehicleDispatching.pendingOrderData){
      if(nextProps.vehicleDispatching.pendingOrderData.list.length>0){
        this.state.scrollValue.y = 400
      }else{
        this.state.scrollValue.y = null;
      }
      this.setState({
        data: nextProps.vehicleDispatching.pendingOrderData,
        scrollValue:{...this.state.scrollValue}
      });
    }
    if(nextProps.showCreatePage!=this.props.showCreatePage){
      this.setState({
        showCreatePage: nextProps.showCreatePage
      });
    }
    if(nextProps.shipPlanBill&&nextProps.shipPlanBill!=this.props.shipPlanBill){
      this.setState({
        shipPlanBill: nextProps.shipPlanBill
      });
    }
  }


  refreshTableUseState = ()=>{
    this.setState({
      selectedRows:[]
    })
    this.props.dispatch({
      type: 'vehicleDispatching/queryPendingOrder',
      payload: this.state.pageFilter,
    })
  }

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: [],
        reportParams: []
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
        deliveryPointCode:"",
        billNumber:"",
        sourceBillNumber:"",
        //shipGroupCode:''
      }
    }else{
      pageFilter.searchKeyValues = {
        companyUuid :loginCompany().uuid,
        dispatchCenterUuid : loginOrg().uuid,
        pendingTag: OrderBillPendingTag.Pending.name,
        storeOrders: [],
        ownerCode:'',
        classGroupCode:'',
        shipGroupCode:'',
      }
    }
    this.setState({
      pageFilter:pageFilter
    })
    dispatch({
      type: 'vehicleDispatching/queryPendingOrder',
      payload: pageFilter,
    });
  };

  handleToShip = ()=>{
    const { selectedRows,selectedRowsNest,showCreatePage,shipPlanBill } = this.state;
    let orderBillNumberList = [];
    if(selectedRows.length==0&&Object.keys(selectedRowsNest).length==0){
      message.warning('请先选择行！');
      return;
    }
    if(showCreatePage==false){
      message.warning('请先选择排车单！');
      return;
    }
    selectedRows.forEach(row=>{
      orderBillNumberList.push(...row.billNumbers);
    });
    for(let key in selectedRowsNest){
      selectedRowsNest[key].length>0&&selectedRowsNest[key].forEach(row=>{
        orderBillNumberList.push(row.billNumber);
      });
    }

    this.props.dispatch({
      type:'vehicleDispatching/addordertoschedule',
      payload: {
        orderBillNumberList:Array.from(new Set(orderBillNumberList)),
        scheduleUuid:shipPlanBill.uuid
      },
      callback:response=>{
        if(response&&response.success){
          this.setState({
            selectedRows:[]
          })
          this.refreshTableUseState();
          this.props.onReFreshView();
          this.props.refreshShipPlanBillPage();

        }
      }
    })
  }

  handlToNormal = ()=>{
    const { selectedRows,selectedRowsNest } = this.state;
    let orderBillNumberList = [];
    if(selectedRows.length==0&&Object.keys(selectedRowsNest).length==0){
      message.warning('请先选择行！');
      return;
    }

    selectedRows.forEach(row=>{
      orderBillNumberList.push(...row.billNumbers);
    });

    for(let key in selectedRowsNest){
      selectedRowsNest[key].length>0&&selectedRowsNest[key].forEach(row=>{
        orderBillNumberList.push(row.billNumber);
      });
    }

    this.props.dispatch({
      type:'vehicleDispatching/updateorderpendingtag',
      payload: {
        orderBillNumberList:Array.from(new Set(orderBillNumberList)),

        pendingTag:OrderBillPendingTag.Normal.name
      },
      callback:response=>{
        if(response&&response.success){
          this.refreshTableUseState();
          this.props.onReFreshNormal();
        }
      }
    })
  }

  columns = [
    {
      title:'线路',
      dataIndex:'archLineCode',
      width:120,
      render:(val,record)=>val?<EllipsisCol colValue={val}/>:<Empty/>,

      sorter: (a, b) =>{
        if ( a.archLineCode < b.archLineCode) {
          return -1;
        } else if (a.archLineCode > b.archLineCode) {
          return 1;
        } else {
          return 0;
        }
      } ,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: '送货点',
      dataIndex: 'deliveryPoint',
      width: 140,
      render:(val,record)=>{
        let data = {
          uuid:val.uuid,
          code:val.code,
          name:val.name,
        }
      return val?<EllipsisCol style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}} colValue={convertCodeName(data)}/>:<Empty style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}}/>
      }
    },
    {
      title:'待定人',
      dataIndex:'pendedName',
      width:160,
      render:(val,record)=>val?<EllipsisCol colValue={`[${record.pendedId}]${val}`}/>:<Empty />
    },
    {
      title:'待定时间',
      dataIndex:'pendedDate',
      width:160,
      render:val=>val?<EllipsisCol colValue={val}/>:<Empty />
    },
    {
      title: vehicleDispatchingLocale.cartonCount,
      dataIndex: 'cartonCount',
      width: 110,
      render:(val,record)=>val!=undefined?<span style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}}>{val}</span>:<Empty style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}}/>
    },
    {
      title: vehicleDispatchingLocale.realCartonCount,
      dataIndex: 'realCartonCount',
      width: 130,
      render:(val,record)=>val&&val!=0?val:(record.cartonCount!=undefined?record.cartonCount:<Empty/>)
    },
    {
      title: vehicleDispatchingLocale.scatteredCount,
      dataIndex: 'scatteredCount',
      width: 130,
      render:(val,record)=>val!=undefined?<span style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}}>{val}</span>:<Empty style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}}/>
    },
    {
      title: vehicleDispatchingLocale.realScatteredCount,
      dataIndex: 'realScatteredCount',
      width: 140,
      render:(val,record)=>val&&val!=0?val:(record.scatteredCount!=undefined?record.scatteredCount:<Empty/>)
    },
    {
      title: vehicleDispatchingLocale.volume,
      dataIndex: 'volume',
      width: 80,
      render:(val,record)=>val?<span style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}}>{val}</span>:<Empty style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}}/>
    },
    {
      title: vehicleDispatchingLocale.weight,
      dataIndex: 'weight',
      width: 80,
      render:(val,record)=>val?<span style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}}>{val}</span>:<Empty style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}}/>

    },
    {
      title: '送货地址',
      width: 150,
      render: (val,record) =>record ?<EllipsisCol style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}} colValue={record.deliveryPoint.address} /> : <Empty style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}}/>
    },
    {
      title: vehicleDispatchingLocale.containerCount,
      dataIndex: 'containerCount',
      width: 120,
      render:(val,record)=>val!=undefined?<span style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}}>{val}</span>:<Empty style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}}/>
    },
    {
      title: vehicleDispatchingLocale.realContainerCount,
      dataIndex: 'realContainerCount',
      width: 140,
      render:(val,record)=>val&&val!=0?val:(record.containerCount!=undefined?record.containerCount:<Empty/>)
    },
    {
      title: commonLocale.ownerLocale,
      dataIndex: 'owner',
      width: 140,
      render:(val,record)=> val?<EllipsisCol style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}} colValue={convertCodeName(val)}/>:<Empty style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}}/>
    },
    {
      title: '订单数',
      width: 100,
      render:(val,record)=> val?<span style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}}>{record.billNumbers?record.billNumbers.length:0}</span>:<Empty style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}}/>

    },
    {
      title: '班组',
      dataIndex: 'classGroupCode',
      width: 100,
      render:(val,record)=> val?<EllipsisCol style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}} colValue={val}/>:<Empty style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}}/>

    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      width: 100,
      render:(val,record)=> val?<span style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}}>{orderBillType[val].caption}</span>:<Empty style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}}/>
    },
    {
      title: '单号',
      dataIndex: 'billNumbers',
      width: 130,
      render:(val,record)=><EllipsisCol colValue={val.join('、')} style={{color:record.orderStat==OrderStat.Reschedule.name?'red':'rgba(0, 0, 0, 0.65)'}}/>
    }
  ];
  nestColumns = [
    {
      title: '单号',
      dataIndex: 'billNumber',
      width: 150,
      render:(val,record)=> val?val:<Empty/>
    },
    {
      title: vehicleDispatchingLocale.cartonCount,
      dataIndex: 'cartonCount',
      width: 120,
      render:(val,record)=>val!=undefined?<span  >{val}</span>:<Empty  />,
    },
    {
      title: vehicleDispatchingLocale.realCartonCount,
      dataIndex: 'realCartonCount',
      width: 140,
      render:(val,record)=>val&&val!=0?val:(record.cartonCount!=undefined?record.cartonCount:<Empty/>)
    },
    {
      title: vehicleDispatchingLocale.scatteredCount,
      dataIndex: 'scatteredCount',
      width: 140,
      render:(val,record)=>val!=undefined?<span  >{val}</span>:<Empty  />
    },
    {
      title: vehicleDispatchingLocale.realScatteredCount,
      dataIndex: 'realScatteredCount',
      width: 160,
      render:(val,record)=>val&&val!=0?val:(record.scatteredCount!=undefined?record.scatteredCount:<Empty/>)
    },
    {
      title: vehicleDispatchingLocale.volume,
      dataIndex: 'volume',
      width: 100,
      render:(val,record)=>val?<span  >{val}</span>:<Empty  />
    },
    {
      title: vehicleDispatchingLocale.weight,
      dataIndex: 'weight',
      width: 100,
      render:(val,record)=>val?<span  >{val}</span>:<Empty  />

    },
    {
      title: vehicleDispatchingLocale.containerCount,
      dataIndex: 'containerCount',
      width: 140,
      render:(val,record)=>val!=undefined?<span >{val}</span>:<Empty  />
    },
    {
      title: vehicleDispatchingLocale.realContainerCount,
      dataIndex: 'realContainerCount',
      width: 140,
      render:(val,record)=>val&&val!=0?val:(record.containerCount!=undefined?record.containerCount:<Empty/>)
    }
  ]

  drawOther = ()=>{
    return <div style={{marginBottom:'10px'}}>
      <Fragment>
        <Button onClick={()=>this.handleToShip()} style={{marginRight:'10px'}}>{'添加到排车单'}</Button>
        <Button onClick={()=>this.handlToNormal()}>{'删除'}</Button>
      </Fragment>
    </div>
  }
}
