import React, { PureComponent } from 'react';
import { Table, Button, Input, Col,Select,Icon, Row,Modal, Popconfirm, message,Checkbox } from 'antd';
import { colWidth } from '@/utils/ColWidth';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
//import { convertCodeName } from '@/utils/utils';
import StoreItemConfirmModal from './StoreItemConfirmModal';
import { loginOrg, loginCompany, loginUser } from '@/utils/LoginContext';
import { deliveredConfirmLocale } from './DeliveredConfirmLocale';
import StandardTable from '@/components/StandardTable';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import DeliveredBillCheck from './DeliveredBillCheck'
import PubSub from 'pubsub-js' 
import { TITLE_SEPARATION } from '@/utils/constants';
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
      console.log("dfsa",e.record);
      // const component = <p3 style={{ color: 'red' }}>{e.val}</p3>;
      const component = (
       <Select style={{width:100}} defaultValue={e.record.DELIVERED} onChange = {this.deliveredChage.bind(this, e.record,e.column)}>
        <Select.Option key={"Pending"} value={"Pending"}>{"待处理"}</Select.Option>
        <Select.Option key={"NotDelivered"} value={"NotDelivered"}>{"未送达"}</Select.Option>
        <Select.Option key={"Delivered"} value={"Delivered"}>{"已送达"}</Select.Option>
       </Select>
      );
      e.component = component;
    }
  };

  onUpdate =(e,val)=>{
    console.log("e",e,"val",val);
  }
  exSearchFilter = () => {
    console.log("fasdf",this.props.pageFilters);
     return this.props.pageFilters;
      // return [
      //   {
      //     field: 'driverCode',
      //     type: 'VarChar',
      //     rule: 'eq',
      //     val: this.props.pageFilters['driverCode'],
      //   }
      // ]
  };

          //该方法用于更改State
          // changeState = () => {
          //   this.setState({ title: '' });
          // };

 
// componentWillReceiveProps(nextProps){
//   console.log("propssdd",nextProps);
// }

  /**
   该方法用于修改table的render

   e的对象结构为{
      column   //对应的column
      record,  //对应的record
      component, //render渲染的组件
      val  //val值
   }  
   */
//   drawcell = e => {
//     //找到fieldName为CODE这一列 更改它的component
//     if (e.column.fieldName == 'DELIVERED') {
        
//       // const component = <p3 style={{ color: 'red' }}>{e.val}</p3>;
//       const component = (
//           <Select   onChange = {this.deliveredChage.bind(this, e.record,e.column)}defaultValue={e.record.DELIVERED} style={{width:'150px'}}>
//               <Option value='Pending'>待处理</Option>
//               <Option value='NotDelivered'>未送达</Option>
//               <Option value='Delivered'>已送达</Option>
//           </Select>
//         // <a onClick={this.onView.bind(this, e.record)} style={{ color: 'blue' }}>
//         //   {111}
//         // </a>
//       );
//       e.component = component;
//     }

//     if(e.column.fieldName=='STORECODENAME'){
//       const component = (
// <div onClick={()=>this.handleModal(e.record)}>
//       <Icon style={{color:'#3B77E3',marginTop:'2%'}} type="plus-circle" />
//       <a style={{marginLeft:'2%'}}>{e.record.STORECODENAME}</a>
//     </div>
//       )
//       e.component = component;
//     }
//   };
  handleModal = (record)=>{
   // console.log("tshisdaf",record);
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
    records[colum.fieldName] = e
  }
  //该方法用于写中间的功能按钮  <span>包裹
  drawToolsButton = () => {
    //console.log("drawToolsButton",this.state);
   
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
  // let list = [];
  // storeSelectedRows.forEach(row=>{
  //   let e = {
  //     line: row.line,
  //     shipBillUuid: row.shipBillUuid,
  //     version: row.version,
  //     SerialArchLine:row.SerialArchLine,
  //     orderNo:row.orderNo,
  //     store: row.store,
  //     storeAddress: row.storeAddress,
  //     scheduleBillNumber:row.scheduleBillNumber,
  //     confirmedOper: {
  //       uuid:loginUser().uuid,
  //       code:loginUser().code,
  //       name:loginUser().name,
  //     },
  //     confirmedTime: moment().format("YYYY-MM-DD HH:mm:ss"),
  //     delivered: row.delivered,
  //     confirmed:row.confirmed,

  //   }
  //   list.push(e);
  // })

  // data.confirms=list;

  // this.props.dispatch({
  //   type: 'deliveredConfirm/unDeliveredConfirmSchedule',
  //   payload: data,
  //   callback:response=>{
  //     if(response&&response.success){
  //       this.refreshTable();
  //       message.success(commonLocale.saveSuccessLocale);
  //     }
  //   }
  // })
 
}
handleOk =()=>{
  this.handleCancel();
}
handleCancel = ()=>{
  this.setState({isShowStandardTable:false})
}
//票据核对
chickOrder = ()=>{
  const{selectedRows} = this.state;
  if(selectedRows.length!=1){
    message.warn("请选择一条记录");
    return ;
  }
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
     console.log("selectedRows",selectedRows);
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
   width ={1200}
   >
  {/* <Button >保存票据</Button> */}
  {/* <StandardTable
      rowKey={storeUuid}
      comId={targetTabKey}
      selectedRows={billSelectedRows}
      loading={this.props.loading}
      data={billData ? billData : []}
      columns={this.billColumns ? this.billColumns : []}
      onSelectRow={this.handleBillSelectRows}
      onChange={this.handleStandardTableChange}
    /> */}
    <DeliveredBillCheck quickuuid = 'sj_schedule_order_bill_check' scheduleData ={selectedRows[0]} />
  </Modal>
  
    <Button onClick={this.saveDelivered}>保存门店送货</Button>
    <Button onClick={this.deliveredConfirmSchedule}>全部送达</Button>
    <Button  onClick={this.unDeliveredConfirmSchedule}>全部未送达</Button>
    {/* <Button onClick={this.chickOrder}>票据核对</Button> */}
  </span>
);
  };

  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {};

  // 该方法会覆盖所有的搜索查询
  drawSearchPanel=()=>{}

  drawOtherCom = () =>{
    //this.onSearch();
    console.log("drawOtherCom",this.state.storeItemConfirmModalVisible);
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
