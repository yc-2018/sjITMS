import React, { PureComponent } from 'react';
import { Table, Form ,Button, Input,InputNumber, Col,Select,Icon, Row,Modal, Popconfirm, message,Checkbox } from 'antd';

import { colWidth } from '@/utils/ColWidth';
import { ArraytoReplaceKeyLow } from '@/utils/utils';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
//import { convertCodeName } from '@/utils/utils';
import StoreModal from './StoreModal';
import OtherFeeModal from './OtherFeeModal';
import StandardTable from '@/components/StandardTable';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import OperateCol from '@/pages/Component/Form/OperateCol';
import FeeTypeForm from './FeeTypeForm'

@connect(({ quick,sjdispatchReturn, loading }) => ({
  quick,sjdispatchReturn,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class InAndOutInfoSearch extends QuickFormSearchPage {
  state = {
    ...this.state,
    storeItemConfirmModalVisible:false,
    storeModalVisible:false,
    scheduleBillTmsUuid:"",
    scheduleBillNumber:"",
    isShowStandardTable:false,
    feeTypeModalVisible:false,
    billData:{
      list:[]
    }, // 票据核对
    otherFeeModalVisible:false
  }
  
  /**
   * 该方法用于自定义扩展列
     e={
       column:column
     }
   */
  drawExColumns = e => {
    
  }
  
  drawActionButton = () => {
    const { storeModalVisible,scheduleBillTmsUuid ,scheduleBillNumber,otherFeeModalVisible} = this.state;
    console.log('scheduleBillNumber',scheduleBillNumber);
    return (
      <>
      <StoreModal
         visible = {storeModalVisible}
         shipBillTmsUuid = {scheduleBillTmsUuid}
         handleModal = {()=>this.setState({storeModalVisible:false})}
       />
        <OtherFeeModal
         visible = {otherFeeModalVisible}
         shipBillTmsUuid = {scheduleBillTmsUuid}
         scheduleBillNumber = {scheduleBillNumber}
         handleModal = {()=>this.setState({otherFeeModalVisible:false})}
       />
        {/* <Button onClick={()=>this.setState({feeTypeModalVisible:true})}>费用类型管理</Button>
        <Modal  width ={'auto'} height ={'auto'}
          footer={null}
          style={{overflow:'auto'}}
          visible={this.state.feeTypeModalVisible}
          onCancel={()=>this.setState({feeTypeModalVisible:false})}
          title={"费用类型管理"}>
          <FeeTypeForm quickuuid='sj_feeType' location={{pathname:window.location.pathname}}></FeeTypeForm>
        </Modal>  */}
      </>
         
    );
  };
  /**
   该方法用于修改table的render

   e的对象结构为{
      column   //对应的column
      record,  //对应的record
      component, //render渲染的组件
      val  //val值
   }  
   */
  drawcell = e => {
    const column = e.column;
    const record = e.record;
    const  fieldName = column.fieldName;
    if(fieldName=='UUID'){
      const component = (
      <a onClick={()=>this.showStore(record.UUID)}>查看编辑</a>
    );
    e.fixed =true
    e.component = component;
    }
    if(fieldName=='FVERSION'){
      const component = (
      <a onClick={()=>this.showOrderFee(record.BILLNUMBER,record.UUID)}>查看编辑</a>
    );
    e.fixed =true
    e.component = component;
    }
    //出车里程
    if(fieldName=='DISPATCHMILEAGE'){
      const component =(
        <InputNumber step={0.01} onBlur= {this.onBlurs.bind(this,record,column.fieldName)}  min={0} max={10000} defaultValue={record.DISPATCHMILEAGE}/>
      );  
      e.component = component;
    }
     //回车里程
     if(fieldName=='RETURNMILEAGE'){
      const component =(
            <InputNumber step={0.01} min={0} max={10000} defaultValue={record.RETURNMILEAGE} onBlur= {this.onBlurs.bind(this,record,column.fieldName)}/>
      );  
      e.component = component;
    }
    if(fieldName=='TOTALMILEAGE'){
      const component =(
            <InputNumber step={0.01}  min={0} max={10000} defaultValue={record.TOTALMILEAGE} onBlur= {this.onBlurs.bind(this,record,column.fieldName)}/>
      );  
      e.component = component;
    }
 
  };
  showOrderFee=(number,uuid)=>{
    console.log("number",number,uuid);
    if(uuid){
      this.setState({
        scheduleBillTmsUuid : uuid,
        scheduleBillNumber : number,
        otherFeeModalVisible:!this.state.otherFeeModalVisible
      });
    }
  }
  showStore = (uuid)=>{ 
    if(uuid){
      this.setState({
        scheduleBillTmsUuid : uuid,
        storeModalVisible:!this.state.storeModalVisible
      });
    }
    
  }
  onBlurs =(record,fieldName,e)=>{
  record[fieldName] = e.target.value;
  if(fieldName=='RETURNMILEAGE'){
    console.log("DISPATCHMILEAGE",record['DISPATCHMILEAGE']);
    if(e.target.value && record['DISPATCHMILEAGE']){
      record['TOTALMILEAGE'] = e.target.value-record['DISPATCHMILEAGE'];
      this.setState({});
      //this.refreshTable();
    }
  }

  }
 
convertCodeName = ()=>{

}
  //该方法用于写最上层的按钮 多个按钮用<span>包裹
  drawTopButton = () => {
    
  };
  drawToolbarPanel = () => {
   
   
  return ( <span>
    <Button onClick={this.audits}>审核</Button>
    <Button onClick={this.save}>保存</Button>
  
  </span>);
  };
  
  
 save= ()=>{
  const { selectedRows, batchAction } = this.state;
  if(selectedRows.length<1){
    message.warn("请至少选择一条记录");
    return;
  }
  this.props.dispatch({
    type: 'dispatchReturnStore/onConfirm',
    payload:selectedRows,
    callback:response=>{
      this.setState({selectedRows:[]});
      if(response&&response.success){
        this.refreshTable();
        message.success(commonLocale.saveSuccessLocale);
      }
    }
  });
}



audits =(name)=>{
  const { selectedRows, batchAction } = this.state;
  if(selectedRows.length<1){
    message.warn("请至少选择一条记录");
    return;
  }
  this.props.dispatch({
    type: 'dispatchReturnStore/onAudit',
    payload:selectedRows,
    callback:response=>{
      this.setState({selectedRows:[]});
      if(response&&response.success){
        this.refreshTable();
        message.success(commonLocale.saveSuccessLocale);
      }
    }
  });
}
test = (a, b) => {};




  
 
}
