import React, { Component, Fragment } from 'react';
import { Form, Input, Row, Col, Select, TreeSelect, Icon, Button } from 'antd';
import SFormItem from '@/pages/Component/Form/SFormItem';
import {
  SimpleTreeSelect,
  SimpleSelect,
  SimpleRadio,
  SimpleAutoComplete,
} from '@/pages/Component/RapidDevelopment/CommonComponent';

const formItemLayout = {
  labelCol: { xs: { span: 24 }, sm: { span: 4 } },
  wrapperCol: { xs: { span: 24 }, sm: { span: 20 } },
};
const formItemLayoutWithOutLabel = {
  wrapperCol: { xs: { span: 24, offset: 0 }, sm: { span: 20, offset: 4 } },
};
const mathRule = [
  { value: 'eq', name: '等于' },
  { value: 'like', name: '包含' },
  { value: 'likeRight', name: '以...开始' },
  { value: 'likeLeft', name: '以...结尾' },
  { value: 'between', name: '在...中' },
  { value: 'ne', name: '不等于' },
  { value: 'gt', name: '大于' },
  { value: 'ge', name: '大于等于' },
  { value: 'lt', name: '小于' },
  { value: 'le', name: '小于等于' },
];
@Form.create()
export default class ColsAdvanced extends Component {
  constructor(props) {
    super(props);
    this.state = { queryKey: 0, searchParams: [] };
  }

  componentDidMount() {
    this.add();
  }

  //删除条件
  remove = key => {
    const { searchParams } = this.state;
    this.setState({ searchParams: searchParams.filter(x => x.key !== key) });
  };

  //添加
  add = () => {
    const { searchParams, queryKey } = this.state;
    const nextSearchParams = searchParams.concat({
      key: queryKey,
      searchField: '',
      searchCondition: 'like',
    });
    this.setState({ searchParams: nextSearchParams, queryKey: queryKey + 1 });
  };

  //重置
  onReset = () => {
    this.setState({
      searchParams: [
        {
          key: 1,
          searchField: '',
          searchCondition: 'like',
        },
      ],
    });
    this.props.form.resetFields();
  };

  //提交表单查询
  handleSubmit = () => {
    const IQueryParam = {};
    const { matchType, field, rule, val } = this.props.form.getFieldsValue();
    const { searchFields } = this.props;
    IQueryParam.matchType = matchType;
    IQueryParam.queryParams = [];
    if (field != undefined) {
      field.map((item, index) => {
        if (item != undefined && rule[index] != undefined) {
          const data = {};
          data.type = searchFields.find(x => x.fieldName === item)?.fieldType;
          data.field = item;
          data.rule = rule[index];
          data.val = val[index];
          IQueryParam.queryParams.push(data);
        }
      });
      return IQueryParam;
    }
    return undefined;
  };

  onSelect = key => {
    return value => {
      const { searchParams } = this.state;
      const { searchFields } = this.props;
      const field = searchFields.find(x => x.fieldName == value);
      const newSearchParams = [...searchParams];
      const index = newSearchParams.findIndex(x => x.key == key);
      newSearchParams[index].searchField = value;
      newSearchParams[index].searchCondition = field.searchCondition;
      this.setState({ searchParams: newSearchParams });
    };
  };

  //生成查询控件
  buildSearchItem = searchField => {
    if (searchField == undefined) return <Input />;
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
        return <SimpleSelect searchField={searchField} {...searchProperties} />;
      case 'radio':
        return <SimpleRadio {...searchProperties} />;
      case 'sel_search':
        return (
          <SimpleSelect reportCode={this.props.reportCode} searchField={searchField} showSearch />
        );
      case 'auto_complete':
        return (
          <SimpleAutoComplete
            placeholder={'请选择' + searchField.fieldTxt}
            searchField={searchField}
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
    const { searchParams } = this.state;
    const { filterValue, searchFields } = this.props;

    const formItems = searchParams.map(searchParam => (
      <Row gutter={16} key={searchParam.key} style={{ marginBottom: '5px' }}>
        <Col span={9}>
          <SFormItem key={[searchParam.key, 'field']} label={''}>
            {getFieldDecorator(`field[${searchParam.key}]`, {})(
              <Select
                showSearch
                placeholder="请选择查询字段"
                optionFilterProp="children"
                onSelect={this.onSelect(searchParam.key)}
                filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
              >
                {searchFields.map(column => {
                  return <Option value={column.fieldName}>{column.fieldTxt}</Option>;
                })}
              </Select>
            )}
          </SFormItem>
        </Col>
        <Col span={4}>
          <SFormItem key={[searchParam.key, 'rule']} label={''}>
            {getFieldDecorator(`rule[${searchParam.key}]`, {
              initialValue: searchParam.searchCondition,
            })(
              <Select>
                {mathRule.map(rule => {
                  return <Option value={rule.value}>{rule.name}</Option>;
                })}
              </Select>
            )}
          </SFormItem>
        </Col>
        <Col span={9}>
          <SFormItem key={[searchParam.key, 'val']} label={''}>
            {getFieldDecorator(`val[${searchParam.key}]`, { initialValue: '' })(
              this.buildSearchItem(searchFields.find(x => x.fieldName == searchParam.searchField))
            )}
          </SFormItem>
        </Col>
        <Col span={1}>
          {searchParams.length > 1 ? (
            <Icon
              className="dynamic-delete-button"
              type="minus-circle-o"
              onClick={() => this.remove(searchParam.key)}
            />
          ) : null}
        </Col>
      </Row>
    ));
    return (
      <Form {...this.props.layout} onSubmit={this.handleSubmit}>
        <div style={{ width: '50%' }}>
          <span>过滤条件匹配:</span>
          <SFormItem key="matchType">
            {getFieldDecorator('matchType', { initialValue: 'and' })(
              <Select>
                <Option value="and">AND（所有条件都要求匹配）</Option>
                <Option value="or">OR（条件中的任意一个匹配）</Option>
              </Select>
            )}
          </SFormItem>
        </div>
        <br />

        {formItems}

        <Form.Item {...formItemLayoutWithOutLabel}>
          <Button type="dashed" onClick={this.add} style={{ width: '60%' }}>
            <Icon type="plus" /> 添加
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
