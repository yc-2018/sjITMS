import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Form, Button, message, Tabs, Checkbox, Select, Icon,Layout,DatePicker,Input } from 'antd';
import Page from '@/pages/Component/Page/inner/NewStylePage';
import DeliveredConfirmSearch from './DeliveredConfirmSearch'
import DeliveredBillCheck from './DeliveredBillCheck'
import { notNullLocale } from '@/utils/CommonLocale';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import Address from '@/pages/Component/Form/Address';
import { connect } from 'dva';
import SearchPanel from '@/pages/Component/Page/inner/SearchPanel';
import {
  SimpleTreeSelect,
  SimpleSelect,
  SimpleRadio,
  SimpleAutoComplete,
} from '@/pages/Component/RapidDevelopment/CommonComponent';
import { LOGIN_COMPANY } from '@/utils/constants';
const { TabPane } = Tabs;
const { Content, Sider } = Layout;
@connect(({ quick, loading,deliveredConfirm }) => ({
    quick,
    deliveredConfirm,
    loading: loading.models.quick,
  }))
@Form.create()
export default class DeliveredConfirmPage extends SearchForm{
  static pagess = {matchType:'',queryParams:[]};
    constructor(props) {
        super(props);
        this.state = { 
          toggle: undefined ,
          pageFilters:{matchType:'',queryParams:[]},
          tableList:<DeliveredConfirmSearch   key={Date.now()} quickuuid= 'ITMS_SHIP_ORDER_STORE_CONFIRM' pageFilters = {[]}/>,
          tableList2:<DeliveredBillCheck quickuuid = 'sj_schedule_order_bill_check'></DeliveredBillCheck>
        };
      }
     
 
      drawCols = () => {
        const { form, filterValue, selectFields } = this.props;
        const { getFieldDecorator } = this.props.form;
        const { toggle } = this.state;
       // const showSelectFields = toggle ? selectFields : selectFields.slice(0, 3);
        let cols = new Array();
        
          cols.push(
            <SFormItem key={"SCHEDULEBILLNUMBER"}label={"排车单号"}>
              {getFieldDecorator('SCHEDULEBILLNUMBER', {
                initialValue: filterValue ? filterValue[searchField.fieldName] : undefined,
                rules: [
                  {
                    required: '',
                    message: '排车单必填',
                  },
                ],
              })(<Input placeholder="请填写排车单号"/>)}
            </SFormItem>
          );
          cols.push(
            <SFormItem key={"plateNumber"}label={"车辆"}>
              {getFieldDecorator('plateNumber', {
                initialValue: filterValue ? filterValue[searchField.fieldName] : undefined,
              })(<Input placeholder="请填写排车单号"/>)}
            </SFormItem>
          );
          cols.push(
            <SFormItem key={"CARRIERCODENAME"}label={"司机"}>
              {getFieldDecorator('CARRIERCODENAME', {
                initialValue: filterValue ? filterValue[searchField.fieldName] : undefined,
              
              })(<Input placeholder=""/>)}
            </SFormItem>
          );
        if (cols.length == 0) {
          cols.push(
            <SFormItem label="名字">
              <Input />
            </SFormItem>
          );
        }
        return cols;
      };
     
      onChangeBill =()=>{
        console.log("aaaa11");
        PubSub.subscribe("aaaa",(msg,obj)=>{
          debugger
          console.log("aaaa",obj);
            this.setState({pageFilters:obj})
        })
      }
     
      onSearch = (pageData)=>{
        const{pageFilters } = this.state;
        pageFilters.queryParams.length=0;
        console.log("onsearch");
        if(pageData['SCHEDULEBILLNUMBER']){
          pageFilters.queryParams.push(
            {
              field: 'SCHEDULEBILLNUMBER',
              type: 'VarChar',
              rule: 'eq',
              val: pageData['SCHEDULEBILLNUMBER'],
            }
          )
        }
        if(pageData['plateNumber']){
          pageFilters.queryParams.push(
            {
              field: 'plateNumber',
              type: 'VarChar',
              rule: 'eq',
              val: pageData['plateNumber'],
            }
          )
        }

        if(pageData['CARRIERCODENAME']){
          pageFilters.queryParams.push(
            {
              field: 'CARRIERCODENAME',
              type: 'VarChar',
              rule: 'eq',
              val: pageData['CARRIERCODENAME'],
            }
          )
        }
        const fdsafd =  JSON.parse(JSON.stringify(pageFilters.queryParams));
     
        this.setState({tableList:<DeliveredConfirmSearch   key={Date.now()} quickuuid= 'ITMS_SHIP_ORDER_STORE_CONFIRM' pageFilters = {fdsafd}/>
         ,tableList2:<DeliveredBillCheck quickuuid = 'sj_schedule_order_bill_check'></DeliveredBillCheck>
        });
      }
    render() {
        console.log("render",this.state.pageFilters);
       const pageFilters =  JSON.parse(JSON.stringify(this.state.pageFilters));
        return (
          <>
          <SearchPanel>
          <Form onSubmit={this.handlerSearch} autoComplete="off">
            {this.drawRows()}
          </Form>
        </SearchPanel>
        <Page>
          <Tabs defaultActiveKey="store" onChange={this.onChangeBill1}>
          <TabPane tab={"送货确认"} key="store">
              {this.state.tableList}
          </TabPane>
          <TabPane tab={"票据核对"} key="bill">
            {this.state.tableList2}
          </TabPane>
        </Tabs>
        </Page>
          </>
        );
      }

}