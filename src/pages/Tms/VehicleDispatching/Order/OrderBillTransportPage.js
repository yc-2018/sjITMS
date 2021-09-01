import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, Modal, Divider, message, Menu, Dropdown, Tooltip, Icon, Row, Col } from 'antd';
import SearchPage from '../Utils/SearchPage';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import StandardTable from '@/components/StandardTable';
import { add, accAdd } from '@/utils/QpcStrUtil';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName, addressToStr } from '@/utils/utils';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { OrderBillStat, OrderBillUrgencyLevel, OrderBillPendingTag, OrderStat } from '../VehicleDispatchingContants';
import { vehicleDispatchingLocale } from '../VehicleDispatchingLocale';
import { orderBillType } from '../../TransportOrder/TransportOrderContants';
import ReSendModal from './ReSendModal';
import ReShipModal from './ReShipModal';

@connect(({ vehicleDispatching, loading }) => ({
  vehicleDispatching,
  loading: loading.models.vehicleDispatching,
}))
@Form.create()
export default class OrderBillTransportPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      key:'vehicleDispatchingOrder.search.page',
      nestKey:'vehicleDispatchingOrderNest.search.page',
      title: vehicleDispatchingLocale.orderBillTransportTitle,
      data:props.vehicleDispatching.orderData,
      selectedRows: [],
      selectedRowsNest:{},
      selectedRowKeysForNest:[],
      suspendLoading: false,
      expand: true,
      noFixed: true,
      selected: true,
      nestRowSelect: true,
      // searchPageType:'ORDER',
      showCreatePage:props.showCreatePage,
      shipPlanBill:props.shipPlanBill, // target
      scrollValue:{
        x:1950,
        y:props.vehicleDispatching.orderData.list.length>0?"calc(50vh)":null

      },
      reSendModalVisible:false,
      reShipModalVisible:false,
      groupNumber:'',//target
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
    this.state.pageFilter.searchKeyValues.pendingTag= OrderBillPendingTag.Normal.name;
    this.state.pageFilter.searchKeyValues.storeOrders= [];

  }

  componentDidMount() {
    this.setState({
      selectedRows:[],
      selectedRowsNest:{},
      selectedRowKeysForNest:[],
    })
    this.props.onRef && this.props.onRef(this)
    this.refreshTableUseState();
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.vehicleDispatching.orderData!=this.props.vehicleDispatching.orderData){
      if(nextProps.vehicleDispatching.orderData.list.length>0){
        if(nextProps.vehicleDispatching.shipPlanData.list.length>0){
          this.state.scrollValue.y = "calc(50vh)"
        }else{
          this.state.scrollValue.y = "calc(45vh)";

        }
      }else{
        this.state.scrollValue.y = null;
      }
      this.setState({
        data: nextProps.vehicleDispatching.orderData,
        scrollValue:{...this.state.scrollValue}
      });
    }

    if(nextProps.vehicleDispatching.shipPlanData!=this.props.vehicleDispatching.shipPlanData){
      if(nextProps.vehicleDispatching.orderData.list.length>0){
        if(nextProps.vehicleDispatching.shipPlanData.list.length>0){
          this.state.scrollValue.y = "calc(50vh)"
        }else{
          this.state.scrollValue.y = "calc(45vh)";

        }
      }else{
        this.state.scrollValue.y = null;
      }
      this.setState({
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
      selectedRows:[],
      selectedRowsNest:{},
      selectedRowKeysForNest:[],
    })
    this.props.dispatch({
      type: 'vehicleDispatching/queryOrder',
      payload: this.state.pageFilter,
    })

  }

  changeSelectedRows = (rows)=>{
    this.props.changeSelectedRows(rows);
  }
  changeSelectedRowsNest= (rowsMap, keys)=>{
    this.props.changeSelectedRowsNest(rowsMap,keys);
  }

  /**
   * 刷新/重置
   */
  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows:[],
        selectedRowsNest:{},
        selectedRowKeysForNest:[],
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
          storeOrders: [],

      }
    }else{
      pageFilter.searchKeyValues = {
          companyUuid :loginCompany().uuid,
          dispatchCenterUuid : loginOrg().uuid,
          pendingTag: OrderBillPendingTag.Normal.name,
          storeOrders: [],
          ownerCode:'',
          classGroupCode:'',
          shipGroupCode:'',

      }
    }
    dispatch({
      type: 'vehicleDispatching/queryOrder',
      payload: pageFilter,
    });
  };

  onAddToOrder = (data) =>{
    this.state.pageFilter.searchKeyValues.storeOrders = [
      ...this.state.pageFilter.searchKeyValues.storeOrders,
      ...data
    ]
    this.props.dispatch({
      type:'vehicleDispatching/queryOrder',
      payload:this.state.pageFilter
    })
    this.handleReSendModalVisible(false);
    this.handleReShipModalVisible(false);
  }

  handleReSendModalVisible =(flag)=>{
    this.setState({
      reSendModalVisible:flag
    })
  }

  handleReShipModalVisible =(flag)=>{
    if(flag==true){
      this.setState({
        groupNumber:this.state.pageFilter.searchKeyValues.shipGroupCode
      })
      if(this.state.pageFilter.searchKeyValues.shipGroupCode==undefined||this.state.pageFilter.searchKeyValues.shipGroupCode==''){
        message.warning('请先根据排车作业组查询');
        return;
      }
    }
    this.setState({
      reShipModalVisible:flag
    })
  }

  handleToPending = ()=>{
    const { selectedRows,selectedRowsNest,showCreatePage } = this.state;
    let orderBillNumberList = [];
    if(selectedRows.length==0&&Object.keys(selectedRowsNest).length==0){
      message.warning('请先选择行！');
      return;
    }
    if(Array.isArray(selectedRows)) {
      for (let i = 0; i < selectedRows.length; i++) {
        if(selectedRows[i].orderStat && (selectedRows[i].orderStat === OrderStat.Reschedule.name || selectedRows[i].orderStat === OrderStat.Resend.name)) {
          message.warning('提示：再排单和重送单都不允许加入到待定列表');
          return;
        } else {
          orderBillNumberList.push(...selectedRows[i].billNumbers);
        }
      }
    }

    for(let key in selectedRowsNest){
      if(selectedRowsNest[key].length>0) {
        let row = selectedRowsNest[key];
        for (let i = 0; i < row.length; i++) {
          if(row[i].orderStat && (row[i].orderStat === OrderStat.Reschedule.name || row[i].orderStat === OrderStat.Resend.name)) {
            message.warning('提示：再排单和重送单都不允许加入到待定列表');
            return;
          } else {
            orderBillNumberList.push(row[i].billNumber);
          }
        }
      }
    }

    // selectedRows.some(row=>{
    //   if(row.orderStat && (row.orderStat === OrderStat.Reschedule.name || row.orderStat === OrderStat.Resend.name)) {
    //     message.warning('提示：再排单和重送单都不允许加入到待定列表！');
    //     return true;
    //   } else {
    //     orderBillNumberList.push(...row.billNumbers);
    //   }
    //
    // });

    // for(let key in selectedRowsNest){
    //   selectedRowsNest[key].length>0&&selectedRowsNest[key].map(row=>{
    //     if(row.orderStat && (row.orderStat == OrderStat.Reschedule.name || row.orderStat == OrderStat.Resend.name)) {
    //       message.warning('提示：再排单和重送单都不允许加入到待定列表！');
    //       return;
    //     } else {
    //       orderBillNumberList.push(row.billNumber);
    //     }
    //     // orderBillNumberList.push(row.billNumber);
    //   });
    // }

    this.props.dispatch({
      type:'vehicleDispatching/updateorderpendingtag',
      payload: {
        orderBillNumberList:Array.from(new Set(orderBillNumberList)),
        pendingTag:OrderBillPendingTag.Pending.name
      },
      callback:response=>{
        if(response&&response.success){
          this.refreshTableUseState();
          this.props.onReFreshPending();
          this.setState({
            selectedRows:[],
            selectedRowsNest:{},
            selectedRowKeysForNest:[],
          })

        }
      }
    })
  }

  handleToShip = ()=>{
    const { selectedRows,selectedRowsNest,showCreatePage,shipPlanBill } = this.state;
    let orderBillNumberList = [];
    let arr = [];
    if(selectedRows.length==0&&Object.keys(selectedRowsNest).length==0){
      message.warning('请先选择行！');
      return;
    }
    if(showCreatePage==false){
      message.warning('请先选择排车单！');
      return;
    }
    
    selectedRows.length>0&&selectedRows.forEach(row=>{
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
          this.props.dispatch({
            type: 'vehicleDispatching/queryOrder',
            payload: this.state.pageFilter,
          });
          this.props.onReFreshView();
          this.props.refreshShipPlanBillPage();
          this.setState({
            selectedRows:[],
            selectedRowsNest:{},
            selectedRowKeysForNest:[],
          })

        }
      }
    })
  }

  onMapView = (record)=>{
    this.props.dispatch({
      type:'store/getByCompanyUuidAndUuid',
      payload:record.deliveryPoint.uuid,
      callback:response=>{
        if(response&&response.success){
          if(response.data.latlng){
            let arr = response.data.latlng.split(';')
            let lng = Number(arr[1]?arr[1]:0);
            let lat = Number(arr[0]?arr[0]:0);
            
            let url = `http://api.map.baidu.com/marker?location=${lat},${lng}&title=${'['+response.data.code+']'+response.data.name}&content=${addressToStr(response.data.address)}&output=html`
            window.open(url,'_blank')
          }
        }
      }
    })
  }

  /**
   * 表格列
   */
  columns = [
    {
      title:'状态',
      dataIndex:'orderStat',
      width:50,
      // fixed:true,
      render:(val,record)=>val?<span>{OrderStat[val].caption}</span>:<Empty />
    },
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
      title:'线路名称',
      dataIndex:'archLineName',
      width:140,
      render:val=>val?<EllipsisCol colValue={val}/>:<Empty/>,
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
        const menu = (
          <Menu>
            <Menu.Item key="map" onClick={()=>this.onMapView(record)}>{'查看门店具体位置'}</Menu.Item>
          </Menu>
        );
        return val?<Dropdown overlay={menu} trigger={['contextMenu']}>
          <div>
            <EllipsisCol colValue={convertCodeName(data)}/>
          </div>
        </Dropdown>:<Empty/>
      }
    },
    {
      title: '送货地址',
      width: 150,
      render: (val,record) =>record.deliveryPoint&&record.deliveryPoint.address?<EllipsisCol   colValue={record.deliveryPoint.address} /> : <Empty  />
    },
    {
      title: '区域',
      width: 150,
      render: (val,record) =>record&&record.area?<EllipsisCol   colValue={record.area} /> : <Empty  />
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
      title: commonLocale.ownerLocale,
      dataIndex: 'owner',
      width: 140,
      render:(val,record)=> val?<EllipsisCol   colValue={convertCodeName(val)}/>:<Empty  />
    },
    {
      title: '订单数',
      width: 100,
      render:(val,record)=> val?<span  >{record.billNumbers?record.billNumbers.length:0}</span>:<Empty  />
    },
    {
      title: '班组',
      dataIndex: 'classGroupCode',
      width: 100,
      render:(val,record)=> val?<EllipsisCol   colValue={val}/>:<Empty  />
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      width: 100,
      render:(val,record)=> val?<span  >{orderBillType[val].caption}</span>:<Empty  />
    },
    {
      title: '单号',
      dataIndex: 'billNumbers',
      width: 130,
      render:(val,record)=><EllipsisCol colValue={val.join('、')}  />
    }
  ];
  
  nestColumns = [
    {
      title: '来源单号',
      dataIndex: 'sourceNum',
      width: 130,
      render:(val,record)=> val?val:<Empty/>
    },
    {
      title: '运输单号',
      dataIndex: 'billNumber',
      width: 130,
      render:(val,record)=> val?val:<Empty/>
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
      render:(val,record)=>val&&val!=0?val:(record.realCartonCount!=undefined?record.realCartonCount:<Empty/>)
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
      render:(val,record)=>val&&val!=0?val:(record.realScatteredCount!=undefined?record.realScatteredCount:<Empty/>)
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
  ]

  // drawActionButton = ()=>{
  //   return <Fragment>
  //     <Button onClick={()=>this.handleToShip()}>{'添加到排车单'}</Button>
  //     <Button onClick={()=>this.handleToPending()}>{'添加到待定池'}</Button>
  //     <Button onClick={()=>this.handleReSendModalVisible(true)}>{'重送单'}</Button>
  //     <Button onClick={()=>this.handleReShipModalVisible(true)}>{'再排单'}</Button>
  //   </Fragment>
  // }
  drawOther = ()=>{
    const { reSendModalVisible,reShipModalVisible,groupNumber } = this.state;
    return <div>
      <div style={{marginBottom:'10px'}}>
        <Fragment>
          <Button onClick={()=>this.handleToShip()} style={{marginRight:'10px'}}>{'添加到排车单'}</Button>
          <Button onClick={()=>this.handleToPending()} style={{marginRight:'10px'}}>{'添加到待定池'}</Button>
          <Button onClick={()=>this.handleReSendModalVisible(true)} style={{marginRight:'10px'}}>{'重送单'}</Button>
          <Button onClick={()=>this.handleReShipModalVisible(true)}>{'再排单'}</Button>
        </Fragment>
      </div>
      <div>
        <ReSendModal
          visible = {reSendModalVisible}
          onCancel = {()=>this.handleReSendModalVisible(false)}
          onAddToOrder = {this.onAddToOrder}
        />
        <ReShipModal
          visible = {reShipModalVisible}
          onCancel = {()=>this.handleReShipModalVisible(false)}
          onOk = {this.getReShipBill}
          groupNumber={groupNumber}
          onAddToOrder = {this.onAddToOrder}
        />
      </div>
    </div>
  }
}
