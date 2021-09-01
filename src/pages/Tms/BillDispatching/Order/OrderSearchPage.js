import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, Modal, Divider, message, Menu, Dropdown, Tooltip, Icon, Row, Col } from 'antd';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import StandardTable from '@/components/StandardTable';
import { add, accAdd, accMul, accDiv } from '@/utils/QpcStrUtil';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import OrderSearchForm from './OrderSearchForm'
import { vehicleDispatchingLocale } from '../../VehicleDispatching/VehicleDispatchingLocale';
import SearchPage from '../../VehicleDispatching/Utils/SearchPage';
import { OrderBillPendingTag } from '../../VehicleDispatching/VehicleDispatchingContants';
import { State } from '../../TransportOrder/TransportOrderContants';

@connect(({ billDispatching,transportOrder, loading }) => ({
  billDispatching,transportOrder,
  loading: loading.models.billDispatching,
}))
@Form.create()
export default class OrderSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: '订单列表',
      key:'billDispatchingOrder.search.table',
      data:{
        list:[]
      },
      selectedRows: [],
      suspendLoading: false,
      searchPageType:'BILL_ORDER',
      showCreatePage:props.showCreatePage,
      shipPlanBill:props.shipPlanBill, // target
      scrollValue:{
        x:2200,
        y:null

      },
      reSendModalVisible:false,
      reShipModalVisible:false,
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dispatchCenterUuid = loginOrg().uuid;
    
  }

  componentDidMount() {
    this.props.onRef && this.props.onRef(this)
    this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {
  
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

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: [],
        reportParams: []
      });
    }

    dispatch({
      type: 'transportOrder/getByOrderBillDispatch',
      payload: filter?filter:pageFilter,
      callback:response=>{
        if(response&&response.success){
          this.state.data.list = response.data?response.data:[]
          this.state.scrollValue.y = response.data&&response.data.length>0?500:null;

          this.setState({
            data:{...this.state.data},
            scrollValue:{...this.state.scrollValue}
          })
        }
      }
    });
  };
  
  onSearch = (data) => {
    const { pageFilter } = this.state;
  
    if (data) {
      let classGroupCode = '';
      let selfhandover = '';
      let startDate = '';
      let endDate = '';
      let storeUuids = [];

      if(data.store){
        storeUuids.push(JSON.parse(data.store).uuid)
      }

      if(data.selfhandover){
        selfhandover = data.selfhandover
      }

      if(data.classGroup){
        classGroupCode = JSON.parse(data.classGroup).code
      }

      if (data.date) {
        startDate = moment(data.date[0]).format('YYYY-MM-DD')
        endDate = moment(data.date[1]).format('YYYY-MM-DD')
      }
      pageFilter.searchKeyValues = {
          ...pageFilter.searchKeyValues,
          ...data,
          classGroupCode:classGroupCode,
          startDate: startDate,
          endDate: endDate,
          selfhandover:selfhandover,
          storeUuids:storeUuids
      }
    } else {
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

  handleDownToSchedule = ()=>{
    const { selectedRows,showCreatePage,shipPlanBill } = this.state;
    let orderBillList = [];
    let filter = JSON.parse(sessionStorage.getItem('BILL_ORDER')).pageFilter.searchKeyValues;
    if(Object.getOwnPropertyNames(filter).length!=2){
      if(selectedRows.length==0){
        message.warning('请先选择行！');
        return;
      }
    }

    if(showCreatePage==false){
      message.warning('请先选择排车单！');
      return;
    }
    selectedRows.forEach(row=>{
      orderBillList.push(row.uuid);
    });

    this.props.dispatch({
      type:'billDispatching/downtoschedule',
      payload: {
        orderBillList:orderBillList,
        scheduleUuid:shipPlanBill.uuid
      },
      callback:response=>{
        if(response&&response.success){
          message.success('添加成功')
          this.refreshTable()
          this.props.onReFreshView();
          this.props.refreshShipPlanBillPage();
        
          this.setState({
            selectedRows:[]
          })
        }
      }
    })
  }

  handleToShipPlan = ()=>{
    const { selectedRows,showCreatePage,shipPlanBill } = this.state;
    let orderBillNumberList = [];
    if(selectedRows.length==0){
      message.warning('请先选择行！');
      return;
    }
    if(showCreatePage==false){
      message.warning('请先选择排车单！');
      return;
    }
    selectedRows.forEach(row=>{
      orderBillNumberList.push(row.billNumber);
    });

    this.props.dispatch({
      type:'billDispatching/addonlyordertoschedule',
      payload: {
        orderBillNumberList:orderBillNumberList,
        scheduleUuid:shipPlanBill.uuid
      },
      callback:response=>{
        if(response&&response.success){
          message.success('添加成功')
          this.refreshTable()
          this.props.onReFreshView();
          this.props.refreshShipPlanBillPage();
        
          this.setState({
            selectedRows:[]
          })
        }
      }
    })
  }
 
  columns = [
    {
      title:'线路',
      dataIndex:'archLineCode',
      width:130,
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
      title:'门店',
      dataIndex:'deliveryPoint',
      width:160,
      render:(val,record)=>{
        if(val){
          let data = {
            uuid:val.uuid,
            code:val.code,
            name:val.name,
          }
          return <EllipsisCol colValue={convertCodeName(data)}/>
        }else{
          return <Empty/>
        }
      }

    },
    {
      title:'客户单号',
      dataIndex:'sourceNum',
      width:170,
      render:val=>val? <EllipsisCol colValue={val}/>:<Empty/>
    },
    {
      title: vehicleDispatchingLocale.cartonCount,
      dataIndex: 'cartonCount',
      width: 110,
      render:(val,record)=>val!=undefined?<span  >{val}</span>:<Empty  />,
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
      render:(val,record)=>val!=undefined?<span  >{val}</span>:<Empty  />
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
      render:(val,record)=>val?<span  >{val}</span>:<Empty  />
    },
    {
      title: vehicleDispatchingLocale.weight,
      dataIndex: 'weight',
      width: 80,
      render:(val,record)=>val?<span  >{val}</span>:<Empty  />
      
    },
    {
      title: vehicleDispatchingLocale.containerCount,
      dataIndex: 'containerCount',
      width: 120,
      render:(val,record)=>val!=undefined?<span >{val}</span>:<Empty  />
    },
    {
      title: vehicleDispatchingLocale.realContainerCount,
      dataIndex: 'realContainerCount',
      width: 140,
      render:(val,record)=>val&&val!=0?val:(record.containerCount!=undefined?record.containerCount:<Empty/>)
    },
    {
      title:'订单状态',
      dataIndex:'stat',
      width:100,
      render:val=>val?State[val].caption:<Empty/>
    },
    {
      title:'下单日期',
      dataIndex:'orderTime',
      width:130,
      render: val => <span>{val ? moment(val).format('YYYY-MM-DD') : <Empty />}</span>,

    },
    {
      title:'是否自提',
      dataIndex:'selfhandover',
      width:100,
      render:(val,record)=>val?'是':'否'
    },
    {
      title:'门店地址',
      width:160,
      render:record=>{
        if(record.deliveryPoint){
          return <EllipsisCol colValue={record.deliveryPoint.address}/>
        }else{
          return <Empty/>
        }
      }

    },
    {
      title:'配货作业号',
      dataIndex:'wmsNum',
      width:160,
    },
    {
      title:'排车作业组号',
      dataIndex:'scheduleGroupNum',
      width:160,
    },
    {
      title:'订单号',
      dataIndex:'billNumber',
      width:160,
    },
    {
      title:'上次配送司机',
      dataIndex:'lastDriver',
      width:200,
      render:(val,record)=>val?<EllipsisCol colValue={convertCodeName(val)}/>:<Empty/>,

    },
  ];

  drawSearchPanel = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <OrderSearchForm filterValue={this.state.pageFilter.searchKeyValues}
      refresh={this.onSearch}/>
    );
  }
  
  drawOther = ()=>{
    return <div style={{marginBottom:'10px',marginRight:'50px'}}>
      <Button onClick={()=>this.handleToShipPlan()} style={{marginRight:'12px'}}>添加到排车单</Button>
      <Button onClick={()=>this.handleDownToSchedule()}>下挂</Button>
    </div>
  }


}
