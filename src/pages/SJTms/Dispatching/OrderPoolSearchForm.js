/*
 * @Author: guankongjin
 * @Date: 2022-04-28 10:08:40
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-07-25 11:44:13
 * @Description: 订单池查询面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\OrderPoolSearchForm.js
 */
import React, { Component } from 'react';
import { Form, Button, Row, Col, DatePicker } from 'antd';
import { notNullLocale } from '@/utils/CommonLocale';
import Address from '@/pages/Component/Form/Address';
import {
  SimpleTreeSelect,
  SimpleSelect,
  SimpleRadio,
  SimpleAutoComplete,
} from '@/pages/Component/RapidDevelopment/CommonComponent';
import { queryColumns } from '@/services/quick/Quick';
import AdvanceQuery from '@/pages/Component/RapidDevelopment/OnlReport/AdvancedQuery/AdvancedQuery';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

const { RangePicker } = DatePicker;
const isOrgQuery = [
  { field: 'companyuuid', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
  { field: 'dispatchcenteruuid', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
];
@Form.create()
export default class OrderPoolSearchForm extends Component {
  state = {
    quickuuid: 'sj_itms_dispatching_orderpool',
    pageFilter: {},
    selectFields: [],
    advancedFields: [],
  };

  componentDidMount() {
    queryColumns({ reportCode: this.state.quickuuid, sysCode: 'tms' }).then(response => {
      if (response.success) {
        this.setState({
          selectFields: response.result.columns.filter(data => data.isSearch),
          advancedFields: response.result.columns.filter(data => data.isShow),
        });
      }
    });
  }
  onSubmit = event => {
    const { form } = this.props;
    event.preventDefault();
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      this.onSearch(fieldsValue);
    });
  };

  //查询
  onSearch = async searchParam => {
    let params = new Array();
    const { selectFields } = this.state;
    for (let param in searchParam) {
      const field = selectFields.find(x => x.fieldName == param);
      let val = searchParam[param];
      if (val == null || val == undefined) {
        continue;
      }
      if (field.searchShowtype == 'datetime' && val instanceof Array) {
        val = val.map(x => x.format('YYYY-MM-DD hh:mm')).join('||');
      }
      if (field.searchShowtype == 'date' && val instanceof Array) {
        val = val.map(x => x.format('YYYY-MM-DD')).join('||');
      }
      if (field.searchShowtype == 'sel_tree') {
        val = val.value;
      }
      //多选下拉框时修改入参,非下拉框暂时不支持in 改为like
      if (field.searchCondition == 'in' || field.searchCondition == 'notIn') {
        if (field.searchShowtype == 'list' || field.searchShowtype == 'sel_search') {
          val = val.join('||');
        } else {
          field.searchCondition = 'like';
        }
      }

      if (val && field) {
        params.push({
          field: field.fieldName,
          type: field.fieldType,
          rule: field.searchCondition || 'like',
          val,
        });
      }
    }
    await this.props.refreshOrderPool({ superQuery: { matchType: 'and', queryParams: params } });
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
    this.props.refreshOrderPool();
  };

  //生成查询控件
  buildSearchItem = searchField => {
    const searchProperties = searchField.searchProperties
      ? JSON.parse(searchField.searchProperties)
      : '';
    switch (searchField.searchShowtype) {
      case 'date':
        return <RangePicker style={{ width: '100%' }} />;
      case 'datetime':
        return <RangePicker style={{ width: '100%' }} showTime />;
      case 'time':
        return <RangePicker style={{ width: '100%' }} showTime />;
      case 'list':
        return (
          <SimpleSelect
            allowClear
            placeholder={'请选择' + searchField.fieldTxt}
            searchField={searchField}
            {...searchProperties}
          />
        );
      case 'radio':
        return <SimpleRadio {...searchProperties} />;
      case 'sel_search':
        return (
          <SimpleSelect
            showSearch
            allowClear
            placeholder={'请输入' + searchField.fieldTxt}
            searchField={searchField}
            reportCode={this.state.quickuuid}
            isOrgQuery={isOrgQuery}
          />
        );
      case 'auto_complete':
        return (
          <SimpleAutoComplete
            placeholder={'请选择' + searchField.fieldTxt}
            searchField={searchField}
            noRecord
            {...searchProperties}
          />
        );
      case 'cat_tree':
        return <RangePicker style={{ width: '100%' }} />;
      case 'popup':
        return <RangePicker style={{ width: '100%' }} />;
      case 'sel_depart':
        return <RangePicker style={{ width: '100%' }} />;
      case 'sel_user':
        return <RangePicker style={{ width: '100%' }} />;
      case 'pca':
        return <Address />;
      case 'sel_tree':
        return <SimpleTreeSelect {...searchProperties} />;
      default:
        return <Input placeholder={'请输入' + searchField.fieldTxt} />;
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    let { selectFields } = this.state;
    const newSelectFields = selectFields.map(item => {
      if (item.fieldType == 'Date') {
        let days = parseInt(item.searchDefVal);
        if (days != days) days = 0;
        let endDate = moment(new Date()).format('YYYY-MM-DD');
        let startDate = moment(new Date())
          .add(-item.searchDefVal, 'days')
          .format('YYYY-MM-DD');
        item.searchDefVal = `${startDate}||${endDate}`;
      }
      return item;
    });
    return (
      <Form
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        onSubmit={this.onSubmit}
        autoComplete="off"
      >
        <Row justify="space-around">
          {newSelectFields.filter((_, index) => index < 2).map(searchField => {
            return (
              <Col span={10}>
                <Form.Item key={searchField.id} label={searchField.fieldTxt}>
                  {getFieldDecorator(searchField.fieldName, {
                    initialValue: searchField.searchDefVal || undefined,
                    rules: [
                      {
                        required: searchField.searchRequire,
                        message: notNullLocale(searchField.fieldTxt),
                      },
                    ],
                  })(this.buildSearchItem(searchField))}
                </Form.Item>
              </Col>
            );
          })}
          <Col span={4} style={{ paddingLeft: 12 }}>
            <AdvanceQuery
              reportCode={this.state.quickuuid}
              searchFields={this.state.advancedFields}
              isOrgQuery={isOrgQuery}
              refresh={this.onAdvanceSearch}
            />
          </Col>
        </Row>
        <Row justify="space-around">
          {newSelectFields.filter((_, index) => index > 1).map(searchField => {
            return (
              <Col span={10}>
                <Form.Item key={searchField.id} label={searchField.fieldTxt}>
                  {getFieldDecorator(searchField.fieldName, {
                    initialValue: searchField.searchDefVal || undefined,
                    rules: [
                      {
                        required: searchField.searchRequire,
                        message: notNullLocale(searchField.fieldTxt),
                      },
                    ],
                  })(this.buildSearchItem(searchField))}
                </Form.Item>
              </Col>
            );
          })}
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
