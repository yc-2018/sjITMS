import React, { PureComponent } from 'react';
import { Table, Form ,Button, Input,InputNumber, Col,Select,Icon, Row,Modal, Popconfirm, message,Checkbox, Upload } from 'antd';

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
    otherFeeModalVisible:false,
    filelist:[],
    previewImage:"",

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
        <Input className = {e.record.ROW_ID+"DISPATCHMILEAGE"}  step={0.01} 
        style={{width:100}}
        onFocus={()=>{
          document.getElementsByClassName(e.record.ROW_ID+"DISPATCHMILEAGE")[0].select();
      }}
        onBlur= {this.onBlurs.bind(this,record,column.fieldName)}  min={0} max={10000} defaultValue={record.DISPATCHMILEAGE}/>
      );  
      e.component = component;
    }
     //回车里程
     if(fieldName=='RETURNMILEAGE'){
      const component =(
            <Input  className = {e.record.ROW_ID+"RETURNMILEAGE"}  onFocus={()=>{
              document.getElementsByClassName(e.record.ROW_ID+"RETURNMILEAGE")[0].select();
          }}  step={0.00} min={0} max={10000} defaultValue={record.RETURNMILEAGE} style={{width:100}}  onBlur= {this.onBlurs.bind(this,record,column.fieldName)}/>  
      );  
      e.component = component;
    }
    // if(fieldName=='TOTALMILEAGE'){
    //   const component =(
    //         <Input step={0.00}  disabled
    //         style={{width:100}}
    //          min={0}  value={record.TOTALMILEAGE} onBlur= {this.onBlurs.bind(this,record,column.fieldName)}/>
    //   );  
    //   e.component = component;
    // }
 
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
      const{data} = this.state;
      if(fieldName=='RETURNMILEAGE'){
        
        data.list.forEach(element => {
            if(element.ROW_ID == record.ROW_ID ){
                element.RETURNMILEAGE = e.target.value
                element.TOTALMILEAGE = e.target.value - record.DISPATCHMILEAGE
                this.setState({data})
                return ;
            }
          });
      }
      if(fieldName =='DISPATCHMILEAGE'){
        data.list.forEach(element => {
          if(element.ROW_ID == record.ROW_ID){
            element.DISPATCHMILEAGE = e.target.value
            element.TOTALMILEAGE =  record.RETURNMILEAGE - e.target.value
              this.setState({data})
              return ;
          }
        });
      }

  }
 
convertCodeName = ()=>{

}
  //该方法用于写最上层的按钮 多个按钮用<span>包裹
  drawTopButton = () => {
    
  };
  onPreview  = async(file)=>{
    let src = file.url ;
    if (!src) {
      src = await new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj );
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  }
  drawToolbarPanel = () => {
   
   
  return ( <span>
    <Popconfirm
     title="确定审核?"
     onConfirm={this.audits}
     okText="确定"
     cancelText="取消"
    >
  <Button type='primary'>保存审核</Button>
    </Popconfirm>
    <Popconfirm
     title="确定保存?"
     onConfirm={this.save}
     okText="确定"
     cancelText="取消"
    >
    <Button>保存</Button>
    </Popconfirm>
    <Upload name='file' beforeUpload = {()=>{return false}} listType= 'picture'
    defaultFileList=  {[...this.state.filelist]} className= 'upload-list-inline'
    onPreview = {this.onPreview}
    >
    <Button>
      <Icon type="upload" /> Click to Upload
    </Button>
    </Upload>
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
