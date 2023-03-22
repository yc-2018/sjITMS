/*
 * @Author: guankongjin
 * @Date: 2022-10-25 10:25:16
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-11-23 17:11:06
 * @Description:地图排车查询面板
 * @FilePath: \iwms-web\src\pages\SJTms\MapDispatching\dispatching\SearchForm.js
 */

import React, { Component } from 'react';
import { Form, Input, Button, Row, Col, DatePicker, Skeleton } from 'antd';
import { notNullLocale } from '@/utils/CommonLocale';
import {
  SimpleTreeSelect,
  SimpleSelect,
  SimpleRadio,
  SimpleAutoComplete,
} from '@/pages/Component/RapidDevelopment/CommonComponent';
import { queryColumns } from '@/services/quick/Quick';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

const { RangePicker } = DatePicker;
const isOrgQuery = [
  { field: 'companyuuid', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
  { field: 'dispatchcenteruuid', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
];
@Form.create()
export default class SearchForm extends Component {
  state = {
    quickuuid: 'sj_itms_storesMap',
    loading: false,
    pageFilter: {},
    selectFields: [],
    advancedFields: [],
  };

  async componentDidMount() {
    this.setState({ loading: true });
    const response = await queryColumns({ reportCode: this.state.quickuuid, sysCode: 'tms' });
    const { form } = this.props;
    if (response.success) {
      let selectFields = response.result.columns.filter(data => data.isSearch);
      const field = response.result.columns.find(x => x.fieldName == 'DISPATCHCENTERUUID');
      const fieldProperties = field.searchProperties.searchParams
        ? field.searchProperties
        : JSON.parse(field.searchProperties);
      if (fieldProperties) {
        const search = fieldProperties.searchParams.find(x => x.dispatch == loginOrg().uuid);
        if (search) {
          selectFields = response.result.columns.filter(
            data => search.searchFields.indexOf(data.fieldName) != -1
          );
        }
      }
      this.setState(
        {
          loading: false,
          selectFields,
          advancedFields: response.result.columns.filter(data => data.isShow),
        },
        () => {
          // this.onSearch(form.getFieldsValue());
        }
      );
    }
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
    let storeParams = {};
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
        } else if (field.searchShowtype == 'auto_complete') {
          val = val.replace(',', '||');
        } else {
          field.searchCondition = 'like';
        }
      }

      if (val && field) {
        if (
          field.fieldName == 'LINEAREA' ||
          field.fieldName == 'SHIPAREA' ||
          field.fieldName == 'CONTACT' ||
          field.fieldName == 'DELIVERYPOINTCODE' ||
          field.fieldName == 'COLLECTAREA'
        ) {
          storeParams = { ...storeParams, [field.fieldName]: val };
        } else {
          params.push({
            field: field.fieldName,
            type: field.fieldType,
            rule: field.searchCondition || 'like',
            val,
          });
        }
      }
    }
    await this.props.refresh(params, null, storeParams);
  };
  //重置
  handleReset = () => {
    this.props.form.resetFields();
    // this.props.refresh();
    this.props.changePage('500', 're');
  };
  handLinkFields = searchProperties => {
    const { linkFields } = searchProperties;
    const { outField } = linkFields[0];
    const { form } = this.props;
    return (searchProperties = {
      ...searchProperties,
      onChange: data => {
        const filter = { field: outField, rule: 'like', val: [data] };
        form.setFieldsValue({ SHIPAREA: undefined });
        this.setState({ linkFilter: filter });
      },
    });
  };
  //生成查询控件
  buildSearchItem = searchField => {
    let searchProperties = searchField.searchProperties
      ? JSON.parse(searchField.searchProperties)
      : '';
    if (searchField.searchShowtype == 'auto_complete' && searchProperties.linkFields) {
      searchProperties = this.handLinkFields(searchProperties);
    }
    if (searchField.searchShowtype == 'auto_complete' && searchProperties.isLink) {
      const { linkFilter } = this.state;
      if (linkFilter != undefined) {
        searchProperties = {
          ...searchProperties,
          linkFilter: [linkFilter],
        };
      }
    }
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
    let { selectFields, loading } = this.state;
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
      <Skeleton active loading={loading} title={false} paragraph={{ rows: 1 }}>
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          onSubmit={this.onSubmit}
          autoComplete="off"
        >
          <Row justify="space-around">
            {newSelectFields.filter((_, index) => index < 3).map(searchField => {
              return (
                <Col span={4}>
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
            {newSelectFields.filter((_, index) => index > 2 && index < 6).map(searchField => {
              return (
                <Col span={3}>
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
            <Col span={1}>
              <Button
                type={'primary'}
                style={{ marginLeft: 15 }}
                loading={this.props.loading}
                htmlType="submit"
              >
                查询
              </Button>
            </Col>
            <Col span={1}>
              <Button
                // type={'primary'}
                style={{ marginLeft: 30 }}
                loading={this.props.loading}
                onClick={this.handleReset}
              >
                清空
              </Button>
            </Col>
          </Row>
        </Form>
      </Skeleton>
    );
  }
}
