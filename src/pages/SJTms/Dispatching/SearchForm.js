/*
 * @Author: guankongjin
 * @Date: 2022-04-28 10:08:40
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-02-21 15:31:57
 * @Description: 订单池查询面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\SearchForm.js
 */
import React, { Component } from 'react';
import { Form, Input, Button, Row, Col, DatePicker, Skeleton } from 'antd';
import { notNullLocale } from '@/utils/CommonLocale';
import Address from '@/pages/Component/Form/Address';
import {
  SimpleTreeSelect,
  SimpleSelect,
  SimpleRadio,
  SimpleAutoComplete,
  SimpleAutoCompleteEasy,
} from '@/pages/Component/RapidDevelopment/CommonComponent';
import { queryColumns } from '@/services/quick/Quick';
import AdvanceQuery from '@/pages/Component/RapidDevelopment/OnlReport/AdvancedQuery/AdvancedQuery';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import moment from 'moment';

const { RangePicker } = DatePicker;
const isOrgQuery = [
  { field: 'companyuuid', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
  { field: 'dispatchcenteruuid', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
];
@Form.create()
export default class SearchForm extends Component {
  state = {
    loading: false,
    pageFilter: {},
    selectFields: [],
    advancedFields: [],
    linkFilter: undefined,
    isOrgQuery: [{ field: 'companyuuid', type: 'VarChar', rule: 'eq', val: loginCompany().uuid }],
  };

  async componentDidMount() {
    this.setState({ loading: true });
    const response = await queryColumns({ reportCode: this.props.quickuuid, sysCode: 'tms' });
    const { form } = this.props;
    if (response.success) {
      let selectFields = response.result.columns.filter(data => data.isSearch);
      if (this.props.dispatchcenterSearch) {
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
    await this.props.refreshOrderPool(params);
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
    if (searchField.fieldName == 'CREATORID') {
      const creatorParam = {
        textField: '%name%',
        valueField: 'uuid',
        label: 'name',
        sourceData: this.props.users,
        searchField: 'code,name',
        mode: 'multiple',
        multipleSplit: ',',
        maxTagCount: 1,
      };
      searchProperties = {
        ...searchProperties,
        ...creatorParam,
      };
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
        if (searchField.searchCondition == 'in' || searchField.searchCondition == 'notIn') {
          return (
            <SimpleSelect
              showSearch
              allowClear
              placeholder={'请输入' + searchField.fieldTxt}
              reportCode={this.props.quickuuid}
              searchField={searchField}
              isOrgQuery={this.state.isOrgQuery}
            />
          );
        }
        return (
          <SimpleAutoCompleteEasy
            placeholder={'请输入' + searchField.fieldTxt}
            allowClear
            reportCode={this.props.quickuuid}
            searchField={searchField}
            isOrgQuery={this.state.isOrgQuery}
            {...searchProperties}
          />
        );
      case 'auto_complete':
        return (
          <SimpleAutoComplete
            placeholder={'请选择' + searchField.fieldTxt}
            searchField={searchField}
            allowClear
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
        return <Input allowClear placeholder={'请输入' + searchField.fieldTxt} />;
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    let { selectFields, loading } = this.state;
    const column = selectFields.length > 4 ? 3 : 2;
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
      if (item.fieldName == 'WAVENUM') {
        item.searchDefVal = moment(new Date()).format('YYMMDD') + '0001';
      }
      if (item.fieldName == 'CREATORID') {
        item.searchDefVal = loginUser().uuid;
      }
      return item;
    });
    return (
      <Skeleton active loading={loading} title={false} paragraph={{ rows: 2 }}>
        <Form
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onSubmit={this.onSubmit}
          autoComplete="off"
        >
          <Row justify="space-around">
            {newSelectFields.filter((_, index) => index < column * 1).map(searchField => {
              return (
                <Col span={column == 2 ? 10 : 7}>
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
            <Col span={3} style={{ paddingLeft: 5 }}>
              <AdvanceQuery
                reportCode={this.props.quickuuid}
                searchFields={this.state.advancedFields}
                isOrgQuery={isOrgQuery}
                refresh={this.onAdvanceSearch}
              />
            </Col>
          </Row>
          <Row justify="space-around">
            {newSelectFields
              .filter((_, index) => index > column * 1 - 1 && index < column * 2 + 1)
              .map(searchField => {
                return (
                  <Col span={column == 2 ? 10 : 7}>
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
            <Col span={3}>
              <Button
                type={'primary'}
                style={{ marginLeft: 5 }}
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
