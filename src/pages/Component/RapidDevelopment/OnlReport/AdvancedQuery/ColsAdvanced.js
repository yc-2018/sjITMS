import React, { Component } from 'react';
import { Form, Row, Col, Icon, Select, Button, Input, DatePicker, Checkbox } from 'antd';
import Address from '@/pages/Component/Form/Address';
import {
  SimpleTreeSelect,
  SimpleSelect,
  SimpleRadio,
  SimpleAutoComplete,
} from '@/pages/Component/RapidDevelopment/CommonComponent';

const { RangePicker } = DatePicker;
const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};
const mathRule = [
  { value: 'eq', name: '等于' },
  { value: 'like', name: '包含' },
  { value: 'likeRight', name: '以...开始' },
  { value: 'likeLeft', name: '以...结尾' },
  { value: 'between', name: '介于…之间' },
  { value: 'ne', name: '不等于' },
  { value: 'gt', name: '大于' },
  { value: 'ge', name: '大于等于' },
  { value: 'lt', name: '小于' },
  { value: 'le', name: '小于等于' },
  { value: 'in', name: '在...内' },
  { value: 'notIn', name: '不在...内' },
];
@Form.create()
export default class ColsAdvanced extends Component {
  constructor(props) {
    super(props);
    this.state = { queryKey: 0, searchParams: [], linkQuery: 0 };
  }

  getSearchParams = (params, linkQuery) => {
    this.setState({ queryKey: params.length + 1, searchParams: params, linkQuery });
  };

  componentDidMount() {
    this.props.onRef(this);
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
      searchField: undefined,
      searchCondition: 'like',
      defaultValue: undefined,
    });
    this.setState({ searchParams: nextSearchParams, queryKey: queryKey + 1 });
  };

  //重置
  onReset = () => {
    this.setState({
      searchParams: [
        {
          key: 0,
          searchField: undefined,
          searchCondition: 'like',
          defaultValue: undefined,
        },
      ],
      linkQuery: 0,
    });
    this.props.form.resetFields();
  };

  //提交表单查询
  handleSubmit = () => {
    const IQueryParam = {};
    const { matchType, linkQuery, field, rule, val } = this.props.form.getFieldsValue();
    const { searchFields } = this.props;
    IQueryParam.matchType = matchType;
    IQueryParam.linkQuery = linkQuery ? 1 : 0;
    IQueryParam.queryParams = [];
    if (field != undefined) {
      field.map((item, index) => {
        if (item != undefined && rule[index] != undefined) {
          const searchField = searchFields.find(x => x.fieldName === item);
          const data = {};
          data.field = item;
          data.type = searchField?.fieldType;
          data.rule = rule[index];
          //增加rule为like判断
          if (
            (searchField?.searchShowtype == 'auto_complete' ||
              searchField?.searchShowtype == 'sel_tree') &&
            rule[index] != 'like'
          ) {
            data.val = val[index].value;
          } else {
            data.val = val[index];
          }
          //多选更改入参
          if (
            (searchField.searchShowtype == 'list' || searchField.searchShowtype == 'sel_search') &&
            (rule[index] == 'in' || rule[index] == 'notIn')
          ) {
            data.val = val[index].join('||');
          }
          //日期格式化
          if (searchField.searchShowtype == 'datetime' && val instanceof Array) {
            data.val = val[index].map(x => x.format('YYYY-MM-DD HH:mm:ss')).join('||');
          }
          if (searchField.searchShowtype == 'date' && val instanceof Array) {
            data.val = val[index].map(x => x.format('YYYY-MM-DD')).join('||');
          }

          IQueryParam.queryParams.push(data);
        }
      });
      return IQueryParam;
    }
    return undefined;
  };

  //选择字段显示对应搜索控件
  onSelect = key => {
    return value => {
      const { searchParams } = this.state;
      const { searchFields } = this.props;
      const field = searchFields.find(x => x.fieldName == value);
      const newSearchParams = [...searchParams];
      const index = newSearchParams.findIndex(x => x.key == key);
      newSearchParams[index].searchField = value;
      newSearchParams[index].defaultValue = undefined;
      newSearchParams[index].searchCondition = field.searchCondition;
      this.setState({ searchParams: newSearchParams });
      this.props.form.resetFields([`val[${key}]`]);
    };
  };
  //查询条件选择
  onConditionSelect = key => {
    const { searchFields } = this.props;
    const { searchParams } = this.state;
    if (searchParams[key]) {
      let selectField = searchFields.find(item => item.fieldName == searchParams[key].searchField);
      if (selectField) {
        selectField.searchCondition = searchParams[key].searchCondition;
      }
    }

    return condition => {
      this.props.form.resetFields([`val[${key}]`, `rule[${key}]`]);
      const newSearchParams = [...searchParams];
      const index = newSearchParams.findIndex(x => x.key == key);
      newSearchParams[index].searchCondition = condition;
      this.setState({ searchParams: newSearchParams });
    };
  };

  //生成查询控件
  buildSearchItem = (searchField, condition) => {
    if (searchField == undefined) return <Input />;
    const searchProperties = searchField.searchProperties
      ? JSON.parse(searchField.searchProperties)
      : '';
    if (condition === 'like') return <Input placeholder={'请输入' + searchField.fieldTxt} />;
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
            setFieldsValues={param => {
              let { val, field } = this.props.form.getFieldsValue();
              const index = field.findIndex(x => x == searchField.fieldName);
              val[index] = param[searchField.fieldName];
              this.props.form.setFieldsValue({ val });
            }}
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
            reportCode={this.props.reportCode}
            searchField={searchField}
            isOrgQuery={this.props.isOrgQuery}
            setFieldsValues={param => {
              let { val, field } = this.props.form.getFieldsValue();
              const index = field.findIndex(x => x == searchField.fieldName);
              val[index] = param[searchField.fieldName];
              this.props.form.setFieldsValue({ val });
            }}
          />
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
    const { searchParams, linkQuery } = this.state;
    const { searchFields } = this.props;
    const formItems = searchParams.map(searchParam => (
      <Row gutter={16} key={searchParam.key}>
        <Col span={9}>
          <Form.Item key={[searchParam.key, 'field']}>
            {getFieldDecorator(`field[${searchParam.key}]`, {
              initialValue: searchParam.searchField,
            })(
              <Select
                showSearch
                placeholder="请选择查询字段"
                optionFilterProp="children"
                onSelect={this.onSelect(searchParam.key)}
                filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
              >
                {searchFields.map(column => {
                  return (
                    <Option value={column.fieldName} key={column.fieldName}>
                      {column.fieldTxt}
                    </Option>
                  );
                })}
              </Select>
            )}
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item key={[searchParam.key, 'rule']}>
            {getFieldDecorator(`rule[${searchParam.key}]`, {
              initialValue: searchParam.searchCondition,
            })(
              <Select onSelect={this.onConditionSelect(searchParam.key)}>
                {mathRule.map(rule => {
                  return (
                    <Option value={rule.value} key={rule.name}>
                      {rule.name}
                    </Option>
                  );
                })}
              </Select>
            )}
          </Form.Item>
        </Col>
        <Col span={9}>
          <Form.Item key={[searchParam.key, 'val']}>
            {getFieldDecorator(`val[${searchParam.key}]`, {
              initialValue: searchParam.defaultValue,
            })(
              this.buildSearchItem(
                searchFields.find(x => x.fieldName == searchParam.searchField),
                searchParam.searchCondition
              )
            )}
          </Form.Item>
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
      <Form onSubmit={this.handleSubmit}>
        <Row>
          <Col span={15}>
            <Form.Item {...formItemLayout} key={'matchType'} label={'过滤条件匹配'}>
              {getFieldDecorator('matchType', { initialValue: 'and' })(
                <Select>
                  <Option value="and">AND（所有条件都要求匹配）</Option>
                  <Option value="or">OR（条件中的任意一个匹配）</Option>
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={2} offset={1}>
            <Button type="dashed" onClick={this.add}>
              <Icon type="plus" /> 添加
            </Button>
          </Col>
          <Col span={4} offset={1}>
            <Form.Item key={'linkQuery'}>
              {getFieldDecorator('linkQuery', {
                valuePropName: 'checked',
                initialValue: linkQuery == 1,
              })(<Checkbox>联动查询</Checkbox>)}
            </Form.Item>
          </Col>
        </Row>

        {formItems}
      </Form>
    );
  }
}
