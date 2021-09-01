import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Layout, Tabs, Button, message } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/components/MyComponent/Page';
import styles from './Contract.less';
import { loginCompany, loginOrg, getActiveKey } from '@/utils/LoginContext';
import ContractMessage from './ContractMessage';
import CostsSet from './CostsSet';
import { contractLocal } from './ContractLocal';
import ViewPageDetail from '@/pages/Component/Page/inner/ViewPageDetail';
import LevelOneMenu from './LevelOneMenu';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';

const { Content } = Layout;
const TabPane = Tabs.TabPane;
@connect(({ dispatchSerialArch, vehicleDispatching, loading }) => ({
  dispatchSerialArch,
  vehicleDispatching,
  loading: loading.models.dispatchSerialArch
}))
export default class ContractCreatePage extends Component {
  constructor(props){
    super(props);
    this.state = {
      title: contractLocal.title,
      selectedRowsNest:{},
      shipPlanBill:{},
      showCreatePage:false,
      storeModalVisible:false,
      vehicleModalVisible:false,
      driverNumber:'',
      vehicleNumber:''
    };
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

  onCancel = () => {
    this.props.dispatch({
      type: 'alcNtc/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }

  drawActionButtion() {
    return (
      <Fragment>
        <Button onClick={this.onCancel}>
          {commonLocale.backLocale}
        </Button>
        <Button onClick={this.onCancel}>
          {commonLocale.saveLocale}
        </Button>
      </Fragment>
      );
  }

  render() {
    const { showCreatePage, selectedRows,storeModalVisible, vehicleModalVisible, driverNumber, vehicleNumber,keyValue, driverDtl,vehicleDtl,vehicleList,driverList,pageFilter, viewData,shipPlanBill } = this.state;
    const viewTitleProps = {
      title: this.state.title,
      action: this.drawActionButtion()
    };
    return  <PageHeaderWrapper>
      <Page>
        <Content className={styles.contentWrapper}>
          <div style={{display:'flex', flexDirection:'row'}}>
            <div style={{flex:1}} className={styles.leftWrapper}>
              <Tabs defaultActiveKey='searchValue'>
                <TabPane tab={'合同信息'} key={'searchValue'}>
                  <div>
                    <ContractMessage
                      vehicleDtl={vehicleDtl}
                      driverDtl={driverDtl}
                      vehicleList={vehicleList}
                      driverList={driverList}
                      showDriverModal = {this.showDriverModal}
                      showVehicleModal = {this.showVehicleModal}
                    />
                  </div>
                </TabPane>
                <TabPane tab={'费用设置'} key={'result'}>
                  <div>
                    <CostsSet
                      onRef={this.onDataRef}
                      pageFilter={pageFilter}
                      refreshView = {this.refreshView}
                      refreshShipPlanBillPage = {()=>this.refreshShipPlanBillPage()}
                    />
                  </div>
                </TabPane>
              </Tabs>

            </div>
          </div>

        </Content>
      </Page>
    </PageHeaderWrapper>;
  }
}
