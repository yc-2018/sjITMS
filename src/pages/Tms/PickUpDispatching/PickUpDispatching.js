import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Layout, Button, Icon, Empty, message } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/components/MyComponent/Page';
import emptySvg from '@/assets/common/img_empoty.svg';
import styles from './PickUpDispatching.less';
import { loginCompany, loginOrg, getActiveKey } from '@/utils/LoginContext';
import OrderSearchPage from './Order/OrderSearchPage';
import ShipPlanBillSearchForm from '../ShipPlanBill/ShipPlanBillSearchForm';
import ShipPlanBillPage from './ShipPlanBill/ShipPlanBillPage';
import ShipPlanBillViewPage from './ShipPlanBill/ShipPlanBillViewPage';

const { Content, Sider,Header, Footer, } = Layout;

@connect(({ pickUpDispatching, loading }) => ({
  pickUpDispatching,
  loading: loading.models.pickUpDispatching,
}))
export default class PickUpDispatching extends PureComponent {
  constructor(props){
    super(props);

    this.state = {
      shipPlanBill:{}, // target 排车单
      showCreatePage:false,
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
  /**
   * 获取运输订单列表的具柄
   */
  onOrderBillRef = (ref)=>{
    this.orderBill=ref;
  }
  
  /**
   * 获取排车单列表的具柄
   */
  onShipPlanBillRef = (ref)=>{
    this.shipPlanBill=ref;
  }

  /**
   * 获取排车单编辑列表的具柄
   */
  onShipPlanBillEditRef = (ref)=>{
    this.shipPlanBillEdit=ref;
  }

  getShowCreatePage =()=>{
    return this.state.showCreatePage;
  }

  /**
   * 展示对应的信息详情
   */
  onCreateShipBillPage = (record)=>{
    this.setState({
      shipPlanBill:record,
      showCreatePage:true
    })
  }
  
  /**
   * 刷新排车单列表页
   */
  refreshShipPlanBillPage = ()=>{
    this.shipPlanBill.refreshTable&&this.shipPlanBill.refreshTable();
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

   /**
   * 搜索
   */
  onSearch = (data) => {

    if(data==undefined){
      this.state.pageFilter.searchKeyValues = {
        companyUuid:loginCompany().uuid,
        dispatchCenterUuid:loginOrg().uuid,
      }
      this.setState({
        pageFilter:this.state.pageFilter
      },()=>{
        let tableFilter = {
          selectedRows: this.state.selectedRows,
          pageFilter: this.state.pageFilter
        };
        sessionStorage.setItem(getActiveKey(), JSON.stringify(tableFilter));

      })

    }
    this.orderBill.refreshTable(data);
    this.shipPlanBill.refreshTable(data);

  }
  onReFreshNormal = ()=>{
    this.orderBill.refreshTable();
  }
  onReFreshView = ()=>{
    this.shipPlanBillEdit.refresh();
  }
  render() {
    const { shipPlanBill,showCreatePage} = this.state;
    return  <PageHeaderWrapper>
      <Page>
        <Content className={styles.contentWrapper}>
          <div className={styles.main}>
            <div className={styles.left}>
              <OrderSearchPage
                searchPageType="PICKUP_ORDER"
                onRef={this.onOrderBillRef}
                showCreatePage = {showCreatePage}
                shipPlanBill = {shipPlanBill}
                onReFreshView = {this.onReFreshView}
                refreshShipPlanBillPage = {()=>this.refreshShipPlanBillPage()} 
                pathname={this.props.location.pathname}
              />
            </div>
            <div className={styles.right}>
              <div>
                <ShipPlanBillPage 
                  searchPageType="PICKUP_SHIP"
                  onRef={this.onShipPlanBillRef}
                  onCreate = {this.onCreateShipBillPage}
                  refreshView = {this.refreshView}
                  onReFreshNormal = {()=>this.onReFreshNormal()} 
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
                    onReFreshNormal = {()=>this.onReFreshNormal()} 
                    refreshShipPlanBill = {this.refreshShipPlanBill} 
                    pathname={this.props.location.pathname}
                  />
                }
              </div>
            </div>
          </div>
        </Content>
      </Page>
    </PageHeaderWrapper>;
  }
}