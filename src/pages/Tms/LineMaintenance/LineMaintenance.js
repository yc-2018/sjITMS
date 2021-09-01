import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Layout, Empty, message } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/components/MyComponent/Page';
import styles from './LineMaintenance.less';
import { loginCompany, loginOrg, getActiveKey } from '@/utils/LoginContext';
import LineSearchPage from './Line/LineSearchPage';
import StoreLineSearchPage from './StoreLine/StoreLineSearchPage';
import StoreSearchPage from './Store/StoreSearchPage';
import ExcelImport from '@/components/ExcelImport';
import { ImportTemplateType } from '@/pages/Account/ImTemplate/ImTemplateContants';
const { Content } = Layout;
@connect(({ dispatchSerialArch, loading }) => ({
  dispatchSerialArch,
  loading: loading.models.dispatchSerialArch
}))
export default class LineMaintenance extends PureComponent {
  constructor(props){
    super(props);
    this.state = {
      showImport: false
    }
  }
  /**
   * 获取线路
   */
  onLineRef = (ref)=>{
    this.lineBill=ref;
  }
  /**
   * 获取门店线路
   */
  onStoreLineRef = (ref)=>{
    this.storelineBill=ref;
  }
  /**
   * 获取门店
   */
  onStoreRef = (ref)=>{
    this.storeBill=ref;
  }
  /**
   * 刷新线路列表页
   */
  refreshLineBillPage = (showImport, serialArch)=>{
    if(showImport && serialArch) {
      this.setState({
        showImport: showImport,
        serialArch: serialArch
      })
    } else {
      this.lineBill.getData&&this.lineBill.getData();
    }
  }
  /**
   * 刷新门店线路列表页
   */
  refreshStoreLineBillPage = (leftList)=>{
    // console.log('左边值', leftList);
    if(leftList) {
      this.setState({
        leftList: leftList
      })
    }
    this.storelineBill.getData&&this.storelineBill.getData('', leftList);
  }
  /**
   * 刷新门店列表页
   */
  refreshStoreBillPage = ()=>{
    this.storeBill.getData&&this.storeBill.getData();
  }
  handleExcelImportCallback = () => {
    this.setState({
      showImport: false
    })
  }
  render() {
    const { leftList, showImport, serialArch } = this.state;
    const uploadParams = {
      serialArchUuid: serialArch && serialArch.uuid ? serialArch.uuid : '',
      dispatchCenterUuid: loginOrg().uuid,
      companyUuid: loginCompany().uuid
    }
    return  showImport ? <ExcelImport
      title={ImportTemplateType.SERIALARCHLINESTORE.caption}
      templateType={ImportTemplateType.SERIALARCHLINESTORE.name}
      uploadParams={uploadParams}
      uploadType='dispatchSerialArch/batchImport'
      cancelCallback={this.handleExcelImportCallback}
      dispatch={this.props.dispatch}
    /> : <PageHeaderWrapper>
      <Page>
        <Content className={styles.contentWrapper}>
          <div style={{display:'flex', flexDirection:'row'}}>
            <div style={{flex:1}} className={styles.leftWrapper}>
              <LineSearchPage
                searchPageType="LINE"
                onRef={this.onLineRef}
                showImport = {showImport}
                refreshLineBillPage = {this.refreshLineBillPage}
                refreshStoreLineBillPage = {this.refreshStoreLineBillPage}
                pathname={this.props.location.pathname}
              />
            </div>
            <div style={{flex:1}} className={styles.leftWrapper}>
              <StoreLineSearchPage
                searchPageType="STORE_LINE"
                onRef={this.onStoreLineRef}
                refreshStoreLineBillPage = {()=>this.refreshStoreLineBillPage()}
                refreshLineBillPage={this.refreshLineBillPage}
                refreshStoreBillPage = {this.refreshStoreBillPage}
                pathname={this.props.location.pathname}
              />
            </div>
            <div style={{flex:1}} className={styles.leftWrapper}>
              <StoreSearchPage
                searchPageType="STORE"
                onRef={this.onStoreRef}
                leftList = {leftList}
                refreshStoreBillPage = {()=>this.refreshStoreBillPage()}
                refreshStoreLineBillPage = {this.refreshStoreLineBillPage}
                refreshLineBillPage={this.refreshLineBillPage}
                pathname={this.props.location.pathname}
              />
            </div>
          </div>
        </Content>
      </Page>
    </PageHeaderWrapper>;
  }
}
