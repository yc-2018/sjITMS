import React, { Component } from 'react';
import { AutoComplete } from 'antd';
import { selectCoulumns } from '@/services/quick/Quick';

const { Option } = AutoComplete;

export default class SimpleAutoCompleteEasy extends Component {
  state = {
    result: [],
    value: '',
  };

  componentDidMount() {}

  //查询数据
  handleSearch = async value => {
    let params = new Array();
    if (this.props.isOrgQuery) {
      const searchField = this.props.searchField;
      params.push({
        field: searchField.fieldName,
        type: searchField.fieldType,
        rule: 'like',
        val: value,
      });
      params = [...params, ...this.props.isOrgQuery];
    } else {
      params = [...params];
    }
    const payload = { superQuery: { queryParams: params }, quickuuid: this.props.reportCode };
    const result = await selectCoulumns(payload);
    this.setState({ result: result.data });
  };

  onSelect = value => {
    this.setState({ value });
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  };

  onChange = value => {
    this.setState({ value });
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  };

  render() {
    const { result } = this.state;
    const children = result?.map(e => <Option key={e}>{e}</Option>);
    return (
      <AutoComplete
        // style={{ width: 200 }}
        onSearch={this.handleSearch}
        placeholder={this.props.placeholder ? this.props.placeholder : '请输入'}
        onSelect={this.onSelect}
        onChange={this.onChange}
        value={this.state.value}
        {...this.props}
      >
        {children}
      </AutoComplete>
    );
  }
}
