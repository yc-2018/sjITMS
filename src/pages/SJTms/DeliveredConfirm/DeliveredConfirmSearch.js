import React, { PureComponent } from 'react';
import { Table, Button, Input, Col,Select,Icon, Row,Modal, Popconfirm, message,Checkbox } from 'antd';
import { colWidth } from '@/utils/ColWidth';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import StoreItemConfirmModal from './StoreItemConfirmModal';
import DeliveredNoCheck from './DeliveredNoCheck'
import { loginOrg, loginCompany, loginUser } from '@/utils/LoginContext';
import { deliveredConfirmLocale } from './DeliveredConfirmLocale';
import StandardTable from '@/components/StandardTable';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import DeliveredBillCheck from './DeliveredBillCheck'
import { TITLE_SEPARATION } from '@/utils/constants';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
@connect(({ quick, deliveredConfirm,loading, }) => ({
  quick,
  deliveredConfirm,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class DeliveredConfirmSearch extends QuickFormSearchPage {
  state = {
    ...this.state,
    storeItemConfirmModalVisible:false,
    isShowStandardTable:false,
    billData:{
      list:[]
    }, // 票据核对
    isNotHd:true
  }
 
  /**
   * 该方法用于自定义扩展列
     e={
       column:column
     }
   */
   
  drawExColumns = e => {
   
  };

  drawcell = e => {
    //找到fieldName为CODE这一列 更改它的component
    if (e.column.fieldName == 'DELIVERED') {
      const component = (
        <SimpleAutoComplete  style={{width:100}} dictCode={"delivered"} value={e.record.DELIVERED} onChange = {this.deliveredChage.bind(this, e.record,e.column)} ></SimpleAutoComplete>
      );
      e.component = component;
    }
  };

  onUpdate =(e,val)=>{
    console.log("e",e,"val",val);
  }
  exSearchFilter = () => {
     return this.props.pageFilters;
      
  };

          //该方法用于更改State
          // changeState = () => {
          //   this.setState({ title: '' });
          // };

 


 
  handleModal = (record)=>{
    if(record){
      this.setState({
        storeUuid : record.DELIVERYPOINTUUID,  
        storeCode : record.STORECODE,
        storeName : record.DELIVERYPOINTNAME,
        storeAddress: record.DELIVERYPOINTADDRESS,
        scheduleBillNumber:record.SHIPPLANBILLNUMBER
      });
    }else{
      this.refreshTable()
    }
    this.setState({
      storeItemConfirmModalVisible:!this.state.storeItemConfirmModalVisible
    });
  }
convertCodeName = ()=>{

}
  //该方法用于写最上层的按钮 多个按钮用<span>包裹
  drawTopButton = () => {
    
  };

  deliveredChage = (records,colum,e)=>{
    records[colum.fieldName] = e.value
  }
  //该方法用于写中间的功能按钮  <span>包裹
  drawToolsButton = () => {
};
  
//保存门店送货
saveDelivered = ()=>{
  this.props.dispatch({
    type: 'deliveredConfirm1/deliveredConfirmSchedule',
    payload: this.state.selectedRows,
    callback:response=>{
      if(response&&response.success){
        this.refreshTable();
        message.success(commonLocale.saveSuccessLocale);
      }
    }
  })
}
// 全部送达
deliveredConfirmSchedule = ()=>{
  const { selectedRows } = this.state
  console.log("selectRow",selectedRows);
  selectedRows.forEach(e=>{
    e.DELIVERED ='Delivered';
    e.companyUuid = loginCompany().uuid;
    e.dispatchCenterUuid = loginOrg().uuid;
  })
  //data.confirms=list;
  this.props.dispatch({
    type: 'deliveredConfirm1/deliveredConfirmSchedule',
    payload: selectedRows,
    callback:response=>{
      if(response&&response.success){
        this.refreshTable();
        message.success(commonLocale.saveSuccessLocale);
      }
    }
  })
}
// 全部未送达
unDeliveredConfirmSchedule = ()=>{
  const { selectedRows } = this.state
    selectedRows.forEach(e=>{
      e.DELIVERED ='NotDelivered';
      e.companyUuid = loginCompany().uuid;
      e.dispatchCenterUuid = loginOrg().uuid;
    })
    this.props.dispatch({
      type: 'deliveredConfirm1/deliveredConfirmSchedule',
      payload: selectedRows,
      callback:response=>{
        if(response&&response.success){
          this.refreshTable();
          message.success(commonLocale.saveSuccessLocale);
        }
      }
    })
  
    
 
}
handleOk =()=>{
  this.handleCancel();
}
handleCancel = ()=>{
  this.setState({isShowStandardTable:false})
}
//票据核对
showNoDelivered = ()=>{
 this.setState({isShowStandardTable:true});
}
  //该方法会覆盖所有的上层按钮
  drawActionButton = () => {
    const { storeSelectedRows,
      billSelectedRows,
      billData,
      storeData,
      targetTabKey,
      storeItemConfirmModalVisible,
      storeUuid,storeCode,
      storeName,storeAddress,
      scheduleBillNumber ,
      selectedRows
     } = this.state;
return (
  <span>
     <StoreItemConfirmModal
  visible = {storeItemConfirmModalVisible}
  storeUuid = {storeUuid}
  storeCode = {storeCode}
  storeName = {storeName}
  storeAddress = {storeAddress}
  scheduleBillNumber = {scheduleBillNumber}
  handleModal = {this.handleModal}
></StoreItemConfirmModal>
  <Modal 
    visible={this.state.isShowStandardTable}
   onOk={this.handleOk} 
   onCancel={this.handleCancel} 
   width ={1400}
   height={500}
   style={{overflow:'auto'}}
   >
  
    <DeliveredNoCheck quickuuid = 'sj_schedule_order_no_check'/>
  </Modal>
  <Button onClick={this.showNoDelivered}>回车未送达确认</Button>
    <Button onClick={this.saveDelivered}>保存门店送货</Button>
    <Button onClick={this.deliveredConfirmSchedule}>全部送达</Button>
    <Button  onClick={this.unDeliveredConfirmSchedule}>全部未送达</Button>
  </span>
);
  };

  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {};

  // 该方法会覆盖所有的搜索查询
  drawSearchPanel=()=>{}

  drawOtherCom = () =>{
    const { storeSelectedRows,billSelectedRows,billData,storeData,targetTabKey,storeItemConfirmModalVisible,storeUuid,storeCode,storeName,storeAddress,scheduleBillNumber } = this.state;
       <StoreItemConfirmModal
        visible = {true}
        storeUuid = {storeUuid}
        storeCode = {storeCode}
        storeName = {storeName}
        storeAddress = {storeAddress}
        scheduleBillNumber = {scheduleBillNumber}
        handleModal = {this.handleModal}
      ></StoreItemConfirmModal>
  }
 
}
