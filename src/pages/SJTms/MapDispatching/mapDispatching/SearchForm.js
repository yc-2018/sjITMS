/*
 * @Author: guankongjin
 * @Date: 2022-10-25 10:25:16
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2024-06-11 16:34:22
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
import moment from 'moment';
import { getInitDataByQuick } from '@/services/quick/Quick';

function isJSON(str) {
  if (typeof str == 'string') {
    try {
      var obj = JSON.parse(str);
      if (typeof obj == 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
}
const { RangePicker } = DatePicker;
const isOrgQuery = [
  { field: 'companyuuid', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
  { field: 'dispatchcenteruuid', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
];
@Form.create()
export default class SearchForm extends Component {
  state = {
    quickuuid: 'sj_itms_dispatching_orderpool',
    loading: false,
    pageFilter: {},
    selectFields: [],
    advancedFields: [],
  };

  async componentDidMount() {
    this.props.onRef && this.props.onRef(this);
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
        const search = fieldProperties.mapParams.find(x => x.dispatch == loginOrg().uuid);
        if (search) {
          selectFields = response.result.columns.filter(
            data => search.searchFields.indexOf(data.fieldName) != -1
          );
        }
      }
      for (let item of selectFields) {
        if (item.searchDefVal) {
          if (isJSON(item.searchDefVal)) {
            let initJson = JSON.parse(item.searchDefVal);
            let res = await getInitDataByQuick(initJson);
            if (res?.success) {
              item.searchDefVal = res?.data ? res.data : '';
              if (item.searchCondition == 'in' || item.searchCondition == 'notIn') {
                item.searchDefVal = [item.searchDefVal];
              }
              let initForm = form.getFieldsValue();
              initForm[item.fieldName] = item.searchDefVal;
              form.setFieldsValue({ initForm });
            }
          }
        }
      }
      this.setState(
        {
          loading: false,
          selectFields,
          advancedFields: response.result.columns.filter(data => data.isShow),
        },
        () => {
          this.onSearch(form.getFieldsValue());
        }
      );
    }
  }

  onSubmit = event => {
    const { form } = this.props;
    event?.preventDefault();
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
        } else if (field.searchShowtype == 'auto_complete') {
          val = val.replace(',', '||');
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
    await this.props.refresh(params);
  };
  //重置
  handleReset = () => {
    this.props.form.resetFields();
    this.props.refresh();
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
    if (searchProperties.isOrgSearch) {
      const orgFields = searchProperties.isOrgSearch.split(',');
      let loginOrgType = loginOrg().type.replace('_', '');
      let loginParmas = [];
      if (orgFields.indexOf('Company') != -1) {
        loginParmas.push({ field: 'COMPANYUUID', rule: 'eq', val: [loginCompany().uuid] });
      }
      if (orgFields.indexOf('Org') != -1) {
        loginParmas.push({ field: loginOrgType + 'UUID', rule: 'like', val: [loginOrg().uuid] });
      }
      if (searchProperties.queryParams.condition) {
        const params = [...searchProperties.queryParams.condition.params];
        searchProperties.queryParams.condition.params = [...params, ...loginParmas];
      } else {
        searchProperties.queryParams = {
          ...searchProperties.queryParams,
          condition: { params: loginParmas },
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
        searchField.fieldWidth = 6;
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
      // if (item.fieldName == 'WAVENUM') {
      //   item.searchDefVal = [moment(new Date()).format('YYMMDD') + '0001'];
      // }
      return item;
    });
    return (
      <Skeleton active loading={loading} title={false} paragraph={{ rows: 1 }}>
        <Form
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onSubmit={this.onSubmit}
          autoComplete="off"
        >
          <Row justify="space-around">
            {newSelectFields.filter((_, index) => index < 4).map(searchField => {
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
            {newSelectFields.filter((_, index) => index >= 4 && index < 6).map(searchField => {
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
                style={{ marginLeft: 12 }}
                loading={this.props.loading}
                htmlType="submit"
              >
                查询
              </Button>
            </Col>
          </Row>
        </Form>
      </Skeleton>
    );
  }
}
