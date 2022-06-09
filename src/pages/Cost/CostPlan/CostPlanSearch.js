import React, { PureComponent } from 'react';
import { Table,Form, Button, Input, Col,Select,Icon, Row,Modal, Popconfirm, message,Checkbox} from 'antd';
import { colWidth } from '@/utils/ColWidth';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { loginOrg, loginCompany, loginUser } from '@/utils/LoginContext';
import StandardTable from '@/components/StandardTable';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { TITLE_SEPARATION } from '@/utils/constants';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import { dynamicQuery } from '@/services/quick/Quick';
@connect(({ quick, deliveredConfirm,loading, }) => ({
  quick,
  deliveredConfirm,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
@Form.create()
export default class CostPlanSearch extends QuickFormSearchPage {
  constructor(props){
    super(props);
    props.onRef && props.onRef(this);
  }
  state = {
    ...this.state,
    isNotHd:true,
    visible :false,
    itemValue :"",
    itemValues:[],
    canDragTable: true,
    scrollValue: {
      y: 'calc(400vh)',
    },
  }
  clieckItem = ()=>{
    this.setState({visible:true})
  }
  delItem = ()=>{
   const{selectedRows,data}  = this.state;
  if(selectedRows.length==0){
    message.info("请选择数据");
  }
  data.list.forEach((element,index) => {
    selectedRows.forEach(e=>{
      if(e.UUID == element.UUID){
        data.list.splice(index,1);
      }
    })
  });
  this.setState({data})
  }
  drawTopButton = () => {
    return <></>
  };
  handleOks = async ()=>{

  console.log("state",this.state);
   const params = {
    tableName:"COST_PROJECT",
    condition:{
      params:[
        {field: 'UUID', rule: 'eq', val: [this.state.itemValue] },
      ]
    }
  }
  let  result =  await dynamicQuery(params);
  console.log("res",result);
   let {data} = this.state;
   result = result.result?.records[0];
   if(data.list==undefined || data.list.length==0){
    result.CALC_SORT = 1
    data.list = [result]
   }else{
    let  flag = false
    data.list.forEach(e=>{
      if(e.UUID == result.UUID){
        flag = true;
        return;
      }
    })
    if(flag){
      message.error("项目已经存在");
      return ;
    }
     let list = data.list.map(e=>{
       return e.CALC_SORT
     })
     list =  list.sort().reverse()[0]
     result.CALC_SORT = list+1;
    data.list.push(result)
   }
  this.setState({data,visible:false})
   
  }

  drapTableChange =(e)=>{
    let {data} = this.state;
    let i = 1;
    e.forEach(itme=>{
      itme.CALC_SORT = i++;
    })
    data.list = e;
    this.setState({data});
    
  }
  //扩展最上层按钮
  //该方法会覆盖所有的上层按钮
  drawActionButton = () => {
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
    return <Modal
    title="添加项目"
    visible={this.state.visible}
    onOk={this.handleOks}
    onCancel={()=>this.setState({visible:false})}
  >
    <Form>
      <Form.Item>
          {getFieldDecorator('UUID', {})(
            <SimpleAutoComplete
            placeholder=""
            textField="%ITEM_NAME%"
            valueField="UUID"
            searchField="ITEM_NAME"
            queryParams={{
              tableName: 'COST_PROJECT',
              condition: {
                params: [
                  { field: 'COMPANYUUID', rule: 'eq', val: [loginCompany().uuid] },
                  { field: 'DISPATCHCENTERUUID', rule: 'like', val: [loginOrg().uuid] },
                ],
              },
            }
          }
          onChange = {(e)=>this.setState({itemValue:e})}
            noRecord
            autoComplete
            allowClear={true}

          />
          )}
        </Form.Item>
      </Form>
  </Modal>

  };
  
  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {
    return <>
    <Button onClick = {()=>this.clieckItem()}>添加项目</Button>
    <Button onClick = {()=>this.delItem()}>删除</Button>
    </>
  };

   该方法会覆盖所有的搜索查询
   drawSearchPanel=()=>{return <></>}

   exSearchFilter=()=>{
    return [
      {
        field: 'PLAN_UUID',
        type: 'VarChar',
        rule: 'eq',
        val: this.props.PLAN_UUID,
      },
    ];
   }
 
}
