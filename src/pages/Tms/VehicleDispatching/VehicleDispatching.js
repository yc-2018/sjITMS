import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Layout, Button, Icon, Empty, message, Row, Col,Space, Card } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/components/MyComponent/Page';
import emptySvg from '@/assets/common/img_empoty.svg';
import { State } from '../ShipPlanBillDispatch/ShipPlanBillDispatchContants';
import styles from './VehicleDispatching.less';
import { OrderBillPendingTag } from './VehicleDispatchingContants';
import OrderBillTransportPage from './Order/OrderBillTransportPage';
import ShipPlanBillPage from './ShipPlan/ShipPlanBillPage';
import ShipPlanBillViewPage from './ShipPlan/ShipPlanBillViewPage';
import PendingOrderBillPage  from './PendingOrder/PendingOrderBillPage';
import VehicleDispatchSearchForm  from './VehicleDispatchSearchForm';
import { loginCompany, loginOrg, getActiveKey } from '@/utils/LoginContext';
import { vehicleDispatchingLocale } from './VehicleDispatchingLocale';
import { add, accAdd } from '@/utils/QpcStrUtil';
const { Content, Sider,Header, Footer, } = Layout;
@connect(({ vehicleDispatching, loading }) => ({
  vehicleDispatching,
  loading: loading.models.vehicleDispatching,
}))
export default class VehicleDispatching extends PureComponent {
  constructor(props){
    super(props);
    this.state = {
      shipPlanBill:{}, // target 排车单
      showCreatePage:false,
      selectedRows:[],//订单选择的行,
      selectedRowsNest:{},//子表格选择的行,
      selectedRowKeysForNest:[],
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
    // if(JSON.parse(sessionStorage.getItem(getActiveKey()))){
    //   console.log('===============甩锅大侠',sessionStorage.getItem(getActiveKey()))
    //   this.state.pageFilter.searchKeyValues = JSON.parse(sessionStorage.getItem(getActiveKey())).pageFilter.searchKeyValues;
    // }
  }
  onOrderBillRef = (ref)=>{
    this.orderBill=ref;
  }
  onPendingOrderBillRef = (ref)=>{
    this.pendingOrderBill=ref;
  }
  onShipPlanBillRef = (ref)=>{
    this.shipPlanBill=ref;
  }
  onShipPlanBillEditRef = (ref)=>{
    this.shipPlanBillEdit=ref;
  }
  getShowCreatePage =()=>{
    return this.state.showCreatePage;
  }
  onCreateShipBillPage = (record)=>{
    console.log(record);
    this.setState({
      shipPlanBill:record,
      showCreatePage:true
    })
  }

  refreshShipPlanBillPage = ()=>{
    this.setState({
      selectedRows:[],
      selectedRowKeysForNest:[],
      selectedRowsNest:{},
    })
    this.shipPlanBill.refreshTableUseState&&this.shipPlanBill.refreshTableUseState();
  }
  refreshOrderBillTransportPage = ()=>{
    this.setState({
      selectedRows:[],
      selectedRowKeysForNest:[],
      selectedRowsNest:{},
    })
    this.orderBill.refreshTableUseState&&this.orderBill.refreshTableUseState();
  }
  refreshShipPlanBill = (record)=>{
    this.setState({
      shipPlanBill:record,
    })
  }
  refreshView = ()=>{
    this.setState({
      shipPlanBill:{},
      showCreatePage:false
    })
  }
  onSearch = (data) => {
    const { selectedRowsNest } = this.state;
    this.setState({
      selectedRows:[],
      selectedRowKeysForNest:[],
      selectedRowsNest:{},
      showCreatePage:false,
    })
    if(selectedRowsNest) {
      for(let key in selectedRowsNest){
        if(selectedRowsNest[key] && selectedRowsNest[key].length>0){
          delete selectedRowsNest[key]
        }
      }
      this.setState({
        selectedRowsNest:{...selectedRowsNest}
      })
    }
    if(data==undefined){
      this.state.pageFilter.searchKeyValues = {
        companyUuid:loginCompany().uuid,
        dispatchCenterUuid:loginOrg().uuid,
      }
      this.setState({
        pageFilter:this.state.pageFilter,
        shipPlanBill:{},
      },()=>{
        let tableFilter = {
          selectedRows: this.state.selectedRows,
          pageFilter: this.state.pageFilter
        };
        sessionStorage.setItem(getActiveKey(), JSON.stringify(tableFilter));
      })
    }
    this.orderBill.refreshTable(data);
    this.pendingOrderBill.refreshTable(data);
    this.shipPlanBill.refreshTable(data);
    this.shipPlanBill.changePage(false);
  }
  onReFreshPending = ()=>{
    this.setState({
      selectedRows:[]
    })
    this.pendingOrderBill.refreshTableUseState();
  }
  onReFreshNormal = ()=>{
    this.setState({
      selectedRows:[],
      selectedRowKeysForNest:[],
      selectedRowsNest:{},
    })
    this.orderBill.refreshTableUseState();
  }
  onReFreshView = ()=>{
    this.setState({
      selectedRows:[]
    })
    this.shipPlanBillEdit.refresh();
  }
  changeSelectedRows = (rows)=>{
    this.setState({
      selectedRows:[...rows]
    })
  }
  changeSelectedRowsNest = (rowsMap, keys)=>{
    this.setState({
      selectedRowsNest:{...rowsMap},
      selectedRowKeysForNest: keys ? [...keys] : []
    })
  }
  render() {
    const { shipPlanBill,showCreatePage,selectedRows,selectedRowsNest} = this.state;
    let newTotalRows = [];
    let newTotalRowsKeys = [];
    // if(selectedRows.length === 0 && selectedRowsNest && selectedRowsNest.length>0) {
    //   for(let i=0;i<selectedRowsNest.length;i++){
    //     newTotalRows.push(selectedRowsNest[i]);
    //   }
    // } else if(selectedRows.length > 0 && selectedRowsNest.length>0) {
    //   for(let i =0;i<selectedRows.length;i++){
    //     if(selectedRows[i].items && selectedRows[i].items.length >0) {
    //       for(let j =0;j<selectedRows[i].items.length;j++) {
    //         newTotalRows.push(selectedRows[i].items[j])
    //       }
    //     }
    //   }
    //   for(let x =0;x<selectedRowsNest.length;x++){
    //     if(newTotalRows.length>0) {
    //       for(let y =0;y<newTotalRows.length;y++){
    //         if(newTotalRows[y].uuid !== selectedRowsNest[x].uuid) {
    //           newTotalRows.push(selectedRowsNest[x])
    //         }
    //       }
    //     }
    //   }
    // } else if(selectedRows.length > 0 && selectedRowsNest.length === 0) {
    //   for(let i =0;i<selectedRows.length;i++){
    //     if(selectedRows[i].items && selectedRows[i].items.length >0) {
    //       for(let j =0;j<selectedRows[i].items.length;j++) {
    //         newTotalRows.push(selectedRows[i].items[j])
    //       }
    //     }
    //   }
    // }
    // newTotalRows.push(...selectedRows);
    selectedRows.forEach(row=>{
      newTotalRowsKeys.push(row.orderUuid)
    })
    for(let key in selectedRowsNest){
      if(newTotalRowsKeys.indexOf(key)==-1){
        newTotalRows.push(...selectedRowsNest[key]);
      }
    }
    newTotalRows = Array.from(new Set(newTotalRows));
    let placeList = [];
    let pushplaceCount=0,cartonCount=0,containerCount=0,scatteredCount=0,volume=0,weight=0,orderCount=0;
    newTotalRows.forEach(row=>{
      if(row.deliveryPoint&&placeList.indexOf(row.deliveryPoint.uuid)=='-1'){
        placeList.push(row.deliveryPoint.uuid)
      }
      if(cartonCount==0){
        cartonCount  = row.cartonCount
      }else{
        cartonCount = add(cartonCount,row.cartonCount);
      }
      // cartonCount = add(cartonCount,row.cartonCount);
      if(scatteredCount==0){
        scatteredCount  = row.scatteredCount
      }else{
        scatteredCount = add(scatteredCount,row.scatteredCount);
      }
      if(orderCount==0){
        orderCount  = row.billNumbers?row.billNumbers.length:1
      }else{
        orderCount = add(orderCount,row.billNumbers?row.billNumbers.length:1);
      }
      containerCount = accAdd(containerCount,row.containerCount)
      volume = accAdd(volume,row.volume);
      weight = accAdd(weight,row.weight);
    });
    return  <PageHeaderWrapper>
      <Page>
        <Content className={styles.contentWrapper}>
          <Header className={styles.headWrapper}>
            <div style={{marginTop:'24px'}}>
              <VehicleDispatchSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch}/>
            </div>
            <div style={{fontWeight:700,fontSize:'14px',marginTop:'5px',marginBottom:'5px'}}>
              <Row   className={styles.headRow}justify="space-between">
                <Col span={2} offset={1}>{vehicleDispatchingLocale.deliveryPointCount}</Col>
                <Col span={1}>{placeList.length}</Col>
                <Col span={2}>{vehicleDispatchingLocale.totalCartonCount}</Col>
                <Col span={1}>{cartonCount}</Col>
                <Col span={2}>{vehicleDispatchingLocale.totalScatteredCount}</Col>
                <Col span={1}>{scatteredCount}</Col>
                <Col span={2}>{vehicleDispatchingLocale.totalContainerCount}</Col>
                <Col span={1}>{containerCount}</Col>
                <Col span={2}>{vehicleDispatchingLocale.orderBillCount}</Col>
                <Col span={1}>{orderCount}</Col>
                <Col span={2}>{vehicleDispatchingLocale.totalVolume}</Col>
                <Col span={1}>{volume}</Col>
                <Col span={2}>{vehicleDispatchingLocale.weight}</Col>
                <Col span={1}>{weight}</Col>
              </Row>
            </div>
          </Header>
          <div className={styles.main}>
            <div>
              <OrderBillTransportPage
                onRef={this.onOrderBillRef}
                onReFreshPending={this.onReFreshPending}
                refreshShipPlanBillPage = {()=>this.refreshShipPlanBillPage()}
                showCreatePage = {showCreatePage}
                shipPlanBill = {shipPlanBill}
                onReFreshView = {this.onReFreshView}
                pathname={this.props.location.pathname}
                changeSelectedRows = {this.changeSelectedRows}
                changeSelectedRowsNest = {this.changeSelectedRowsNest}

              />
            </div>

            <div>
              <ShipPlanBillPage
                onRef={this.onShipPlanBillRef}
                onCreate = {this.onCreateShipBillPage}
                refreshView = {this.refreshView}
                refreshShipPlanBillPage = {()=>this.refreshShipPlanBillPage()}
                refreshOrderBillTransportPage = {this.refreshOrderBillTransportPage}
                pathname={this.props.location.pathname}
              />
            </div>

            <div>
              <PendingOrderBillPage
                onRef={this.onPendingOrderBillRef}
                onReFreshNormal={this.onReFreshNormal}
                refreshShipPlanBillPage = {()=>this.refreshShipPlanBillPage()}
                showCreatePage = {showCreatePage}
                shipPlanBill = {shipPlanBill}
                onReFreshView = {this.onReFreshView}
                pathname={this.props.location.pathname}
              />
            </div>
            <div>
              {!showCreatePage?<Empty
                image={emptySvg}
                description={
                  <span>
                        暂无数据,请先选择排车单
                      </span>
                }
              />:<ShipPlanBillViewPage
                onRef={this.onShipPlanBillEditRef}
                shipPlanBill = {shipPlanBill}
                refreshShipPlanBillPage = {()=>this.refreshShipPlanBillPage()}
                onReFreshPending = {()=>this.onReFreshPending()}
                onReFreshNormal = {()=>this.onReFreshNormal()}
                refreshShipPlanBill = {this.refreshShipPlanBill}
              />
              }
            </div>
          </div>
        </Content>
      </Page>
    </PageHeaderWrapper>;
  }
}
