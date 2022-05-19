
import React, { PureComponent, } from 'react';
import {Button, Form, message, Select,Modal,Popconfirm} from 'antd'
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import{confirmOrder} from '@/services/sjtms/DeliveredConfirm';
import Result from '@/components/Result';
import { res } from '@/pages/In/Move/PlaneMovePermission';
import { queryIdleAndThisPostionUseing } from '@/services/facility/Container';
import { loginOrg, loginCompany, loginUser } from '@/utils/LoginContext';
import NocheckForm from './NoCheckForm';
import {
    SimpleTreeSelect,
    SimpleSelect,
    SimpleRadio,
    SimpleAutoComplete,
  } from '@/pages/Component/RapidDevelopment/CommonComponent';
@connect(({ quick, deliveredConfirm ,loading }) => ({
    quick,
    deliveredConfirm,
    loading: loading.models.quick,
}))
@Form.create()
export default class DeliveredNoCheck extends QuickFormSearchPage {
    state = {
        ...this.state,
        isNotHd:true,
        pageData:[],
        reasonModalVisible:false,
        deliveredDutyMdodalVisible:false,
        nocheckInfoVisible:false
    }

    constructor(props){
        super(props)
       
    }

  
     drawTopButton = () => {
    
    }; 
    drawcell = e => {
      //找到fieldName为CODE这一列 更改它的component
     
      if (e.column.fieldName == 'UNDELIVEREDDUTY') {
        const component = (
          <Select style={{width:100}} defaultValue={e.record.UNDELIVEREDDUTY} onChange = {this.deliveredChage.bind(this, e.record,e.column)} >
        <Select.Option key={"Warehouse"} value={"Warehouse"}>{"仓库"}</Select.Option>
        <Select.Option key={"Driver"} value={"Driver"}>{"司机"}</Select.Option>
        <Select.Option key={"Store"} value={"Store"}>{"门店"}</Select.Option>
       </Select>

        );
        e.component = component;
      }
      if (e.column.fieldName == 'UNDELIVEREDTYPE') {
        const component = (
          <Select style={{width:100}} defaultValue={e.record.UNDELIVEREDTYPE} onChange = {this.deliveredChage.bind(this, e.record,e.column)} >
        <Select.Option key={"ReSend"} value={"ReSend"}>{"重送"}</Select.Option>
        <Select.Option key={"Reject"} value={"Reject"}>{"拒收"}</Select.Option>
       </Select>
        );
        e.component = component;
      }
      if (e.column.fieldName == 'UNDELIVEREDREASON') {
        const component = (
          <Select style={{width:100}} defaultValue={e.record.UNDELIVEREDREASON}  onChange = {this.deliveredChage.bind(this, e.record,e.column)}>
        <Select.Option key={"车辆故障"} value={"车辆故障"}>{"车辆故障"}</Select.Option>
        <Select.Option key={"拒收"} value={"拒收"}>{"拒收"}</Select.Option>
        <Select.Option key={"关店"} value={"关店"}>{"关店"}</Select.Option>
       </Select>
        );
        e.component = component;
      }
    };
      //该方法用于写中间的功能按钮  <span>包裹
  drawToolsButton = () => {
    //console.log("drawToolsButton",this.state);
    return (<><Button onClick={this.checkAndSave}>核对并保存单据</Button></>)
   
  };

  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {
   // return (<><Button onClick={this.checkAndSave}>核对并保存单据</Button></>)
  };
  //该方法会覆盖所有的上层按钮
  drawActionButton = () => {
    return (<>
    {this.CreateFormReason()}
    {this.CreateUnDeliveredDuty(0)}
    <Button onClick={this.checkNoReason}>未送达原因管理</Button>
    {this.nocheckInfo()}
    </>)
  };
 // 该方法会覆盖所有的搜索查询
 // drawSearchPanel=()=>{}
  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {
    return (
      <>
      <Popconfirm
      title="确定重送?"
      onConfirm={this.checkResend}
      okText="确定"
      cancelText="取消"
      > 
      <Button >批量重送</Button>
      </Popconfirm>
      <Popconfirm
      title="确定拒收?"
      onConfirm={this.checkRejection}
      okText="确定"
      cancelText="取消"
      > 
       <Button>批量拒收</Button>
      </Popconfirm>
      
    <Button onClick={this.checkReason}>批量设置原因</Button>
    <Button onClick={this.checkAttribution}>批量设置责任归属</Button>
    <Popconfirm
      title="确定保存?"
      onConfirm={this.checkSave}
      okText="确定"
      cancelText="取消"
      > 
      <Button>批量保存</Button>
      </Popconfirm>
    
    </>)
  };
  //未送达原因管理
  checkNoReason =()=>{
     this.setState({nocheckInfoVisible:true})

  }
  //重送
  checkResend =()=>{
    const{selectedRows} = this.state;
    if(selectedRows.length==0){
        message.warn("请选择记录")
    }
    let rows = selectedRows.map(row=>{
      return {
        UNDELIVEREDTYPE:'ReSend',
        UUID:row["UUID"]
      }
      
    });
  this.props.dispatch({
      type: 'deliveredConfirm1/updateNoDelivered',
      payload: rows,
      callback:response=>{
          console.log("response",response);
        if(response&&response.success){
          this.refreshTable();
          message.success("更新成功");
        }
      }
    })
  }
   //拒收
   checkRejection =()=>{
    const{selectedRows} = this.state;
    if(selectedRows.length==0){
        message.warn("请选择记录")
    }
    let rows = selectedRows.map(row=>{
        return {
          UNDELIVEREDTYPE:'Reject',
          UUID:row["UUID"]
        }
      });
    this.props.dispatch({
        type: 'deliveredConfirm1/updateNoDelivered',
        payload:rows,
        callback:response=>{
            console.log("response",response);
          if(response&&response.success){
            this.refreshTable();
            message.success("更新成功");
          }
        }
      })
}

  //批量设置原因
  checkReason =()=>{
    const{selectedRows} = this.state;
    if(selectedRows.length==0){
        message.warn("请选择记录")
    }
    this.setState({reasonModalVisible:true})
}

//批量未送达类型
checkAttribution =()=>{
    const{selectedRows} = this.state;
    if(selectedRows.length==0){
        message.warn("请选择记录")
    }
    this.setState({deliveredDutyMdodalVisible:true})
}
deliveredChage = (records,colum,e)=>{
  records[colum.fieldName] = e
}
  CreateFormReason =()=>{
    const formItemLayout = {
        labelCol: {
          xs: { span: 48 },
          sm: { span:8 },
        },
        wrapperCol: {
          xs: { span: 48 },
          sm: { span: 10 },
        },
      };
     
  
      const CreateFormReason = Form.create()(props => {
        const { dispatch,form} = props;
        const { getFieldDecorator } = form;
        const handleSubmitReason = ()=>{
          const { selectedRows,data } = this.state
          form.validateFields((errors, fieldsValue) => {
            console.log("errors",fieldsValue);
          if (errors&&errors.UnDeliveredDuty) return;
          let rows = selectedRows.map(row=>{
            return {
              UNDELIVEREDREASON:fieldsValue.UNDELIVEREDREASON.record.VALUE,
              UUID:row["UUID"]
            }
          });
        
          this.props.dispatch({
              type: 'deliveredConfirm1/updateNoDelivered',
              payload: rows,
              callback:response=>{
                  console.log("response",response);
                if(response&&response.success){
                  this.refreshTable();
                  message.success("更新成功");
                  this.setState({
                    reasonModalVisible:!this.state.reasonModalVisible
                    })
                }
              }
            })
        });
        }
        return <Modal
          visible={this.state.reasonModalVisible}
          onCancel={()=>this.onBatchSetReasonVisible(false)}
          onOk={handleSubmitReason}
          title={"批量设置原因"}
        >
          <Form {...formItemLayout}>
            <Form.Item label={"未送达原因"}>
              { getFieldDecorator('UNDELIVEREDREASON', {
                initialValue: undefined,
                rules: [
                  { required: true, message: "未送达原因不能为空" },
                ],
              })(
              <SimpleAutoComplete dictCode ="UndeliveredReason" valueField="VALUE" textField="NAME" ></SimpleAutoComplete>
              )}
            </Form.Item>
          </Form>
        </Modal> ;
      });
  
      return <CreateFormReason />;
}
nocheckInfo =()=>{
  return <Modal  width ={'auto'} height ={'auto'}
  footer={null}
  style={{overflow:'auto'}}
  visible={this.state.nocheckInfoVisible}
  onCancel={()=>this.setState({nocheckInfoVisible:false})}
  title={"未送达原因管理"}>
 <NocheckForm quickuuid='sj_pretype' location={{pathname:window.location.pathname}}></NocheckForm>
</Modal> ;
}
//批量设置责任归属
CreateUnDeliveredDuty =()=>{
    const formItemLayout = {
        labelCol: {
          xs: { span: 48 },
          sm: { span:8 },
        },
        wrapperCol: {
          xs: { span: 48 },
          sm: { span: 10 },
        },
      };
  
      const CreateFormReason = Form.create()(props => {
        const { dispatch,form} = props;
        const { getFieldDecorator } = form;
        const handleSubmitReason = ()=>{
          const { selectedRows} = this.state
          form.validateFields((errors, fieldsValue) => {
              console.log("errors",fieldsValue);
            if (errors&&errors.UnDeliveredDuty) return;
            let rows = selectedRows.map(row=>{
              return {
                UNDELIVEREDDUTY:fieldsValue.UnDeliveredDuty.record.VALUE,
                UUID:row["UUID"]
              }
            });
           
            this.props.dispatch({
                type: 'deliveredConfirm1/updateNoDelivered',
                payload: rows,
                callback:response=>{
                    console.log("response",response);
                  if(response&&response.success){
                    this.refreshTable();
                    message.success("更新成功");
                    this.setState({
                        deliveredDutyMdodalVisible:!this.state.deliveredDutyMdodalVisible
                      })
                  }
                }
              })
          });
        }
        return <Modal
          visible={this.state.deliveredDutyMdodalVisible}
          onCancel={()=>this.onBatchSetReasonVisible(false)}
          onOk={handleSubmitReason}
          title={"批量设置责任归属"}
        >
          <Form {...formItemLayout}>
            <Form.Item label={"责任归属"}>
              { getFieldDecorator('UnDeliveredDuty', {
                initialValue: undefined,
                rules: [
                  { required: true, message: "责任归属不能为空" },
                ],
              })(
              <SimpleAutoComplete dictCode ="UnDeliveredDuty" valueField="VALUE" textField="NAME" ></SimpleAutoComplete>
              )}
            </Form.Item>
          </Form>
        </Modal> ;
      });
  
      return <CreateFormReason />;
}

onBatchSetReasonVisible = ()=>{
    this.setState({reasonModalVisible:false});
    this.setState({deliveredDutyMdodalVisible:false});
}

//保存
checkSave =()=>{
    const{selectedRows} = this.state;
    if(selectedRows.length==0){
        message.warn("请选择记录")
    }
    this.props.dispatch({
        type: 'deliveredConfirm1/updateNoDelivered',
        payload: this.state.selectedRows,
        callback:response=>{
            console.log("response",response);
          if(response&&response.success){
            this.refreshTable();
            message.success("更新成功");
          }
        }
      })
}
  checkAndSave = async ()=>{
    const{selectedRows} = this.state;
    selectedRows.forEach(e=>{
      e.companyUuid = loginCompany().uuid;
      e.dispatchCenterUuid = loginOrg().uuid;
    })
    await confirmOrder(selectedRows).then(result=>{
      if(result && result.success){
        this.refreshTable();
        message.success("保存成功");

      }
    })
  }
  // 该方法会覆盖所有的搜索查询
  // drawSearchPanel=()=>{}

    
}