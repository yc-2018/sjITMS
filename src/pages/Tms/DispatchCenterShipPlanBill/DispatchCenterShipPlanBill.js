import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Layout, Tabs, Empty, message } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/components/MyComponent/Page';
import styles from './DispatchCenterShipPlanBill.less';
import { loginCompany, loginOrg, getActiveKey } from '@/utils/LoginContext';
import DispatchCenterShipPlanBillSearchPage from './DispatchCenterShipPlanBillSearchPage';
import DispatchCenterShipPlanBillSearchForm from './DispatchCenterShipPlanBillSearchForm';
import DispatchCenterShipPlanBillViewPage from './DispatchCenterShipPlanBillViewPage';
import emptySvg from '@/assets/common/img_empoty.svg';
import DriverSearchModal from './DriverSearchModal';
import VehicleSearchModal from './VehicleSearchModal';
import moment from 'moment';

const { Content } = Layout;
const TabPane = Tabs.TabPane;
@connect(({ dispatchSerialArch, vehicleDispatching, loading }) => ({
  dispatchSerialArch,
  vehicleDispatching,
  loading: loading.models.dispatchSerialArch
}))
export default class LineMaintenance extends PureComponent {
  constructor(props){
    super(props);
    this.state = {
      pageFilter:{
        page: 0,
        pageSize: 50,
        sortFields: {},
        searchKeyValues: {},
        likeKeyValues: {},
      },
      selectedRowsNest:{},
      shipPlanBill:{},
      showCreatePage:false,
      storeModalVisible:false,
      vehicleModalVisible:false,
      tabTrue: false,
      driverNumber:'',
      vehicleNumber:'',
      keyValue:'searchValue'
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dispatchCenterUuid = loginOrg().uuid;
  }

  /**
   * 获取数据
   */
  onDataRef = (ref)=>{
    this.shipBill=ref;
  }

  onShipPlanBillEditRef = (ref)=>{
    this.shipPlanBillEdit=ref;
  }

  changeTabValue = (key) => {
    // if(key === 'result') {
    //   this.onSearch();
    // }
    this.setState({
      keyValue: key,
      tabTrue: true
    })
  };

  handleVehicleModalVisible =(flag)=>{
    this.setState({
      vehicleModalVisible:flag
    })
  }

  handleDriverModalVisible =(flag)=>{
    this.setState({
      storeModalVisible:flag
    })
  }

  refreshShipPlanBill = (record)=>{
    this.setState({
      shipPlanBill:record,
    })
  }

  refreshShipPlanBillPage = ()=>{
    this.setState({
      selectedRows:[]
    });
    this.shipBill.refreshTable&&this.shipBill.refreshTable();
  }

  refreshView = (record, selectedRows)=>{
    if(!record && selectedRows && selectedRows.length>0) {
      this.setState({
        showCreatePage:true,
        selectedRows: selectedRows,
        viewData: null
      })
    } else if(record && !selectedRows){
      this.setState({
        showCreatePage:true,
        viewData: record,
        selectedRows:[]
      })
    } else {
      this.setState({
        showCreatePage:false
      })
    }
    this.setState({
      shipPlanBill:{}
    })
  }

  showDriverModal = () =>{
    this.setState({
      storeModalVisible: true
    })
  }

  showVehicleModal = () =>{
    this.setState({
      vehicleModalVisible: true
    })
  }

  onAddToDriverForm = (data) =>{
    this.setState({
      driverList:data,
      driverDtl:null,
      storeModalVisible:false
    })
  }

  onAddToVehicleForm = (data) =>{
    this.setState({
      vehicleList:data,
      vehicleDtl:null,
      vehicleModalVisible:false
    })
  }

  onSearch = (data) => {
    const {pageFilter, driverDtl,vehicleDtl,vehicleList,driverList} = this.state;
    pageFilter.page = 0;
    var beginCreateTime = '';
    var endCreateTime = '';
    if (data && data !== 'reset') {
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
      this.setState({
        keyValue: 'result'
      })
    }
    else if(data && data === 'reset') {
      this.setState({
        keyValue: 'searchValue'
      })
      if (driverDtl || driverList){
        this.setState({
          driverDtl:'',
          driverList:[]
        })
      }
      if (vehicleDtl || vehicleList){
        this.setState({
          vehicleDtl:'',
          vehicleList:[]
        })
      }
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dispatchCenterUuid: loginOrg().uuid
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dispatchCenterUuid: loginOrg().uuid
      }
      sessionStorage.setItem(getActiveKey(), JSON.stringify(pageFilter));
    }
    this.setState({
      selectedRows:[],
      showCreatePage:false,
      pageFilter:{ ...pageFilter}
    });
    // this.shipBill.refreshTable(pageFilter);
  }

  onFillVehiclePage = (record)=>{
    this.setState({
      vehicleDtl:record,
      vehicleList:[],
      vehicleModalVisible:false
    })
  };
  onFillDriverPage = (record)=>{
    this.setState({
      driverDtl:record,
      driverList:[],
      storeModalVisible:false
    })
  };

  render() {
    const { showCreatePage, selectedRows,storeModalVisible, vehicleModalVisible, driverNumber, vehicleNumber,keyValue, driverDtl,vehicleDtl,vehicleList,driverList,pageFilter, viewData,tabTrue } = this.state;
    return  <PageHeaderWrapper>
      <Page>
        <Content className={styles.contentWrapper}>
          <div style={{display:'flex', flexDirection:'row'}}>
            <div style={{flex:1}} className={styles.leftWrapper}>
              <Tabs defaultActiveKey="searchValue" activeKey= {keyValue} onChange={this.changeTabValue}>
                <TabPane tab={'查询条件'} key={'searchValue'}>
                  <div>
                    <DispatchCenterShipPlanBillSearchForm
                      filterValue={this.state.pageFilter.searchKeyValues}
                      refresh={this.onSearch}
                      vehicleDtl={vehicleDtl}
                      driverDtl={driverDtl}
                      vehicleList={vehicleList}
                      driverList={driverList}
                      showDriverModal = {this.showDriverModal}
                      showVehicleModal = {this.showVehicleModal}
                    />
                  </div>
                </TabPane>
                <TabPane tab={'结果'} key={'result'}>
                  <div>
                    <DispatchCenterShipPlanBillSearchPage
                      searchPageType="LINE"
                      onRef={this.onDataRef}
                      pageFilter={pageFilter}
                      tabTrue={tabTrue}
                      refreshView = {this.refreshView}
                      refreshShipPlanBillPage = {()=>this.refreshShipPlanBillPage()}
                      pathname={this.props.location.pathname}
                    />
                  </div>
                  <div>
                    {!showCreatePage ? <Empty
                      image={emptySvg}
                      description={
                        <span>
                        暂无数据,请先选择排车单
                      </span>
                      }
                    /> : <DispatchCenterShipPlanBillViewPage
                      onRef={this.onShipPlanBillEditRef}
                      selectedRows = {selectedRows}
                      viewData = {viewData}
                      refreshView = {()=>this.refreshView()}
                      refreshShipPlanBill={this.refreshShipPlanBill}
                    />
                    }
                  </div>
                </TabPane>

              </Tabs>

            </div>
          </div>
          {
            <div>
              <DriverSearchModal
                visible = {storeModalVisible}
                onCancel = {()=>this.handleDriverModalVisible(false)}
                onCreate = {this.onFillDriverPage}
                driverNumber={driverNumber}
                onAddToDriverForm = {this.onAddToDriverForm}
              />
              <VehicleSearchModal
                visible = {vehicleModalVisible}
                onCancel = {()=>this.handleVehicleModalVisible(false)}
                onCreate = {this.onFillVehiclePage}
                vehicleNumber={vehicleNumber}
                onAddToVehicleForm = {this.onAddToVehicleForm}
              />
            </div>
          }
        </Content>
      </Page>
    </PageHeaderWrapper>;
  }
}
