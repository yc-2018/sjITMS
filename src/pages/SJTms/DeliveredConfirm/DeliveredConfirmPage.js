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
import { dynamicQuery } from '@/services/quick/Quick';
import CommonStore from '@/map/script/modules/common/stores/commonStore';
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
                    required: true,
                    message: '排车单必填',
                  },
                ],
              })(<Select 
                showSearch = {true}
                autoComplete ={true}
                onSearch={this.handleSearch}
                allowClear
              >
                {this.state.option}
              </Select>)}
            </SFormItem>
          );
          cols.push(
            <SFormItem key={"VEHICLECODENAME"}label={"车辆"}>
              {getFieldDecorator('VEHICLECODENAME', {
                initialValue: filterValue ? filterValue[searchField.fieldName] : undefined,
              })(<Select 
                showSearch = {true}
                autoComplete ={true}
                onSearch={this.vehicleHandleSearch}
                allowClear
              >
                {this.state.vehicleOption}
              </Select>)}
            </SFormItem>
          );
          cols.push(
            <SFormItem key={"CARRIERCODENAME"}label={"司机"}>
              {getFieldDecorator('CARRIERCODENAME', {
                initialValue: filterValue ? filterValue[searchField.fieldName] : undefined,
              
              })(<Select 
                showSearch = {true}
                autoComplete ={true}
                onSearch={this.carrperOption}
                allowClear
              >
                {this.state.carrierOption}
              </Select>)}
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
     
      handleSearch =async(value)=>{
        let queryParamsJson = {
          tableName: "V_SJ_ORDER_BILL_CHECK_UNION", condition: {
            params: [{ field: "SCHEDULEBILLNUMBER", rule: "like", val: [value] }],
          }
        }
        await dynamicQuery(queryParamsJson).then(result =>{
          console.log(result.result)
             if(result.success && result.result.records!='false'){
               let data = result.result.records;
               data = data.map(m=>m.SCHEDULEBILLNUMBER)
               data = data.filter((item,index)=>{
               return data.indexOf(item)==index;
               });
              this.setState({option:data.map(m => <Option key={m}>{m}</Option>)})
              }
          })
      }
      vehicleHandleSearch = async(value) => {
        let queryParamsJson = {
          tableName: "V_SJ_ORDER_BILL_CHECK_UNION", condition: {
            params: [{ field: "VEHICLECODENAME", rule: "like", val: [value] }],
          }
        }
        await dynamicQuery(queryParamsJson).then(result =>{
          console.log(result.result)
             if(result.success && result.result.records!='false'){
               let data = result.result.records;
               data = data.map(m=>m.VEHICLECODENAME)
               data = data.filter((item,index)=>{
               return data.indexOf(item)==index;
               });
              this.setState({vehicleOption:data.map(m => <Option key={m}>{m}</Option>)})
              }
          })
      }
      carrperOption = async (value) =>{
        let queryParamsJson = {
          tableName: "V_SJ_ORDER_BILL_CHECK_UNION", condition: {
            params: [{ field: "CARRIERCODENAME", rule: "like", val: [value] }],
          }
        }
        await dynamicQuery(queryParamsJson).then(result =>{
             if(result.success && result.result.records!='false'){
               let data = result.result.records;
               data = data.map(m=>m.CARRIERCODENAME)
               data = data.filter((item,index)=>{
               return data.indexOf(item)==index;
               });
              this.setState({carrierOption:data.map(m => <Option key={m}>{m}</Option>)})
             }
          
      })}
      onSearch = (pageData)=>{
        const{pageFilters } = this.state;
        pageFilters.queryParams.length=0;
        console.log("onsearch");
        if(pageData['SCHEDULEBILLNUMBER']){
          pageFilters.queryParams.push(
            {//SCHEDULEBILLNUMBER
              field: 'SCHEDULEBILLNUMBER',
              type: 'VarChar',
              rule: 'eq',
              val: pageData['SCHEDULEBILLNUMBER'],
            }
          )
        }
        if(pageData['VEHICLECODENAME']){
          pageFilters.queryParams.push(
            {
              field: 'VEHICLECODENAME',
              type: 'VarChar',
              rule: 'eq',
              val: pageData['VEHICLECODENAME'],
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
        const params =  JSON.parse(JSON.stringify(pageFilters.queryParams));
     
        this.setState({tableList:<DeliveredConfirmSearch   key={Date.now()} quickuuid= 'ITMS_SHIP_ORDER_STORE_CONFIRM' pageFilters = {params} />
         ,tableList2:<DeliveredBillCheck quickuuid = 'sj_schedule_order_bill_check'  key={Date.now()} pageFilters = {params} ></DeliveredBillCheck>
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
          <Tabs defaultActiveKey="store">
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