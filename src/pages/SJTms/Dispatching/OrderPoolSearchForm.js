/*
 * @Author: guankongjin
 * @Date: 2022-04-28 10:08:40
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-06-06 11:15:30
 * @Description: 订单池查询面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\OrderPoolSearchForm.js
 */
import React, { Component } from 'react';
import { Form, Input, Button, Row, Col } from 'antd';
import {
  SimpleTreeSelect,
  SimpleAutoComplete,
  SimpleSelect,
} from '@/pages/Component/RapidDevelopment/CommonComponent';
import { queryColumns } from '@/services/quick/Quick';
import AdvanceQuery from '@/pages/Component/RapidDevelopment/OnlReport/AdvancedQuery/AdvancedQuery';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { queryIdleAndThisPostionUseing } from '@/services/facility/Container';

@Form.create()
export default class OrderPoolSearchForm extends Component {
  state = { pageFilter: {}, advancedFields: [] };

  componentDidMount() {
    queryColumns({
      reportCode: 'sj_itms_dispatching_orderpool',
      sysCode: 'tms',
    }).then(response => {
      if (response.success) {
        this.setState({ advancedFields: response.result.columns.filter(data => data.isShow) });
      }
    });
  }
  onSearch = event => {
    const { form } = this.props;
    event.preventDefault();
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      let searchKeyValues = {};
      for (let param in fieldsValue) {
        let val = fieldsValue[param];
        if (val == undefined) {
          continue;
        }
        val = val.hasOwnProperty('value') ? val.value : val;
        if (val == null || val == undefined) {
          continue;
        }
        searchKeyValues[param] = val;
      }
      this.props.refresh(searchKeyValues);
    });
  };
  //高级查询
  onAdvanceSearch = async filter => {
    let { pageFilters } = this.state;
    pageFilters = {
      ...pageFilters,
      superQuery: {
        matchType: filter.matchType,
        queryParams: filter.queryParams,
      },
    };
    this.setState({ pageFilters });
    await this.props.refreshOrderPool(pageFilters);
  };
  //重置
  handleReset = () => {
    this.props.form.resetFields();
    this.props.refresh();
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        onSubmit={this.onSearch}
        autoComplete="off"
      >
        <Row justify="space-around">
          <Col span={10}>
            <Form.Item label="线路">
              {getFieldDecorator('lineCode', { initialValue: '' })(
                <SimpleTreeSelect
                  placeholder="请选择线路"
                  textField="[%CODE%]%NAME%"
                  valueField="CODE"
                  sonField="UUID"
                  parentField="PARENTUUID"
                  queryParams={{
                    tableName: 'v_sj_tms_line_system',
                    condition: {
                      params: [
                        { field: 'COMPANYUUID', rule: 'eq', val: [loginCompany().uuid] },
                        { field: 'DISPATCHCENTERUUID', rule: 'like', val: [loginOrg().uuid] },
                      ],
                    },
                  }}
                  showSearch
                  multiSave="PARENTUUID:UUID"
                />
              )}
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item label="单据类型">
              {getFieldDecorator('orderType', { initialValue: 'Delivery' })(
                <SimpleAutoComplete
                  placeholder="请选择单据类型"
                  dictCode="orderType"
                  noRecord
                  allowClear={true}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={4} style={{ paddingLeft: 12 }}>
            <AdvanceQuery
              searchFields={this.state.advancedFields}
              filterValue={this.state.pageFilter.searchKeyValues}
              refresh={this.onAdvanceSearch}
              reportCode="orderpool"
            />
            {/* <Button style={{ marginLeft: 12 }}>高级查询</Button> */}
          </Col>
        </Row>
        <Row justify="space-around">
          <Col span={10}>
            <Form.Item label="送货点">
              {getFieldDecorator('deliveryPointCode', {})(
                <SimpleAutoComplete
                  placeholder="请输入送货点编码"
                  textField="[%CODE%]%NAME%"
                  valueField="CODE"
                  searchField="CODE,NAME"
                  queryParams={{
                    tableName: 'v_sj_itms_ship_store',
                    condition: {
                      params: [
                        { field: 'COMPANYUUID', rule: 'eq', val: [loginCompany().uuid] },
                        { field: 'DISPATCHCENTERUUID', rule: 'like', val: [loginOrg().uuid] },
                      ],
                    },
                  }}
                  noRecord
                  autoComplete
                  allowClear={true}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item label="货主">
              {getFieldDecorator('ownerCode', {})(
                <SimpleAutoComplete
                  placeholder="请输入货主编码"
                  textField="[%CODE%]%NAME%"
                  label="CODE"
                  valueField="CODE"
                  searchField="CODE,NAME"
                  maxTagCount={2}
                  queryParams={{
                    tableName: 'sj_itms_owner',
                    condition: {
                      params: [
                        { field: 'COMPANYUUID', rule: 'eq', val: [loginCompany().uuid] },
                        { field: 'DISPATCHCENTERUUID', rule: 'like', val: [loginOrg().uuid] },
                      ],
                    },
                  }}
                  noRecord
                  mode="multiple"
                  multipleSplit=","
                  autoComplete
                  allowClear={true}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={4}>
            <Button
              type={'primary'}
              style={{ marginLeft: 12 }}
              loading={this.props.loading}
              htmlType="submit"
            >
              查询
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}
