import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

/**
* 拣货方案商品下拉框
*
* 支持单选和多选，传入属性single，表示单选，得到的值为商品ucn的json串
* 不传single属性时为多选模式，json串的数组
* hasAll：包含全部选项，可用于搜索条件;全部选项值为''，只用于single模式
* 
*/
@connect(({ pickSchema }) => ({
  pickSchema
}))
export default class PickSchemeArticleSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });

    if (this.props.value !== nextProps.value) {
      this.onSearch(nextProps.value);
    }
  }

  componentDidMount() {
    const { value } = this.state;
    if (value)
      this.onSearch(value);
  }

  buildOptions = () => {
    let options = [];
    if (this.props.hasAll && this.props.single) {
      options.push(<Select.Option key="all" value={undefined} > 全部 </Select.Option>);
    }

    let data = this.props.pickSchema.data.list;
    Array.isArray(data) && data.forEach(function (pickSchema) {
      options.push(
        <Select.Option key={pickSchema.uuid} value={JSON.stringify({
          uuid: pickSchema.article.uuid,
          code: pickSchema.article.code,
          name: pickSchema.article.name,
        })}> {'[' + pickSchema.article.code + ']' + pickSchema.article.name} </Select.Option>
      );
    });
    return options;
  }

  onSearch = (value) => {

    const searchKeyValues = {};
    searchKeyValues['companyUuid'] = loginCompany().uuid;
    searchKeyValues['dcUuid'] = loginOrg().uuid;
    searchKeyValues['articleCode'] = value;

    this.props.dispatch({
      type: 'pickSchema/query',
      payload: {
        page: 0,
        pageSize: 20,
        searchKeyValues: searchKeyValues,
        sortFields: {
          articleCode: false
        }
      }
    });
  }

  onChange = (selectValue) => {
    let value = '[' + JSON.parse(selectValue).code + ']' + JSON.parse(selectValue).name;
    this.setState({
      value: value,
    });

    // 用于form表单获取控件值
    if (this.props.onChange)
      this.props.onChange(selectValue);
  }

  render() {
    const { single } = this.props;
    const { value } = this.state;
    const selectProps = {
      showSearch: true,
      mode: single ? '' : 'multiple',
      onChange: this.onChange,
      onSearch: this.onSearch
    };

    if (value) {
      selectProps.value = value;
    }

    return (
      <Select {...selectProps} placeholder={this.props.placeholder}>
        {this.buildOptions()}
      </Select>
    );
  }
}