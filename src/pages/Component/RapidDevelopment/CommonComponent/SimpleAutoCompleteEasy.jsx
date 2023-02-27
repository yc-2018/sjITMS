import React, { Component } from 'react';
import { AutoComplete } from 'antd';
import { selectCoulumns } from '@/services/quick/Quick';
import moment from 'moment';

const { Option } = AutoComplete;

export default class SimpleAutoCompleteEasy extends Component {
  state = {
    result: [],
    value: '',
  };

  componentDidMount() {
    // this.initSearch();
  }

  componentWillReceiveProps(props) {
    if (props.isOrgQuery !== this.props.isOrgQuery) {
      this.initSearch(props.isOrgQuery);
    }
  }

  initSearch = async e => {
    let params = [];
    let isOrgQuery = e ? e : this.props.isOrgQuery;
    let jsonParam = this.props.searchField?.searchProperties
      ? JSON.parse(this.props.searchField?.searchProperties)
      : undefined;
    if (jsonParam) {
      let dateParam = jsonParam.dateParam;
      let textParam = jsonParam.textParam;
      //time
      if (dateParam) {
        const searchField = this.props.searchField;
        params.push({
          field: searchField.fieldName,
          type: searchField.fieldType,
          rule: 'like',
          val: '',
        });
        for (let key in dateParam) {
          let endDate = moment(new Date()).format('YYYY-MM-DD');
          let startDate = moment(new Date())
            .add(-dateParam[key], 'days')
            .format('YYYY-MM-DD');
          params.push({
            field: key,
            type: 'Date',
            rule: 'between',
            val: `${startDate}||${endDate}`,
          });
        }
      }
      if (isOrgQuery) {
        params = [...params, ...isOrgQuery];
      } else {
        params = [...params];
      }
      const payload = {
        superQuery: { queryParams: params },
        quickuuid: this.props.reportCode,
        pageSize: 9999,
      };
      const result = await selectCoulumns(payload);
      this.setState({ result: result.data });
    }
  };

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
    const children = result ? result.map(e => <Option key={e}>{e}</Option>) : [];
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
