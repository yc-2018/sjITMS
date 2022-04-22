
import React, { PureComponent, } from 'react';
import {Button, message} from 'antd'
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import{confirmOrder} from '@/services/sjtms/DeliveredConfirm';
import Result from '@/components/Result';
import { res } from '@/pages/In/Move/PlaneMovePermission';
import PubSub from 'pubsub-js' 
import { queryIdleAndThisPostionUseing } from '@/services/facility/Container';
@connect(({ quick, loading }) => ({
    quick,
    loading: loading.models.quick,
}))
export default class DeliveredBillCheck extends QuickFormSearchPage {
    state = {
        ...this.state,
        isNotHd:true,
        pageData:[]
    }

    constructor(props){
        super(props)
       
    }

   exSearchFilter = () => {
        return this.props.pageFilters;
         
     };
     drawTopButton = () => {
    
    }; 
      //该方法用于写中间的功能按钮  <span>包裹
  drawToolsButton = () => {
    //console.log("drawToolsButton",this.state);
   
  };

  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {};
  //该方法会覆盖所有的上层按钮
  drawActionButton = () => {

  };
 // 该方法会覆盖所有的搜索查询
  drawSearchPanel=()=>{}
  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {
    return (<><Button onClick={this.checkAndSave}>核对并保存单据</Button></>)
  };
  checkAndSave = async ()=>{
    const{selectedRows} = this.state;
    let ids = [];
    selectedRows.forEach(e=>{
      ids.push(e.UUID);
    })
    console.log(ids);
    await confirmOrder(ids).then(result=>{
      if(result && result.success){
        this.refreshTable();
        message.success("保存成功");

      }
    })
  }
  // 该方法会覆盖所有的搜索查询
  // drawSearchPanel=()=>{}

    
}