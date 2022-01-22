import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';

/**
* 简易查询下拉选择控件
*
* 支持form表单initialValue设置初始值，也可通过属性value设置初始值,形式为JSON.stringify(entity.owner)
* 支持通过form表单获取控件值，获取到的为货主字符串形式的ucn，可通过JSON.parse(fieldName)转换格式
* hasAll：包含全部选项，可用于搜索条件;全部选项值为''
* disabled：是否禁用；multiple：是否多选；onlyOnline：是否只查询启用状态的货主
*/
export default class SimpleSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      selectData:[]
    }
  }

  buildOptions = () =>{
    const { selectData } = this.state
    let options = [];
    selectData.forEach(data=>{
      options.push(<Select.Option value={data}>{data}</Select.Option>)
    })
    return options;
  }

  onChange = (value) => {
    this.setState({ value });
    // 用于form表单获取控件值
    if (this.props.onChange)
      this.props.onChange(value);
  }

  onSearch = (value) => {
    const searchField = this.props.searchField
    let params = new Array();
    params.push({
      field: searchField.fieldName,
      type: searchField.fieldType,
      rule: 'like',
      val:value
    });
    this.getCoulumns({queryParams: params})
  }

  onFocus = (value) =>{
    if(!this.props.showSearch){
      console.log(this.props.searchField)
      const { dispatch } = this.props;
      dispatch({
        type:'quick/test',
        payload: this.props.searchField,
        callback: response => {
          if (response.data) this.initData(response.data);
        },
      })
    }
  }

  getCoulumns = pageFilters =>{
    const { dispatch } = this.props;
    dispatch({
      type: 'quick/selectCoulumns',
      payload: {
        superQuery:pageFilters,
        quickuuid:this.props.reportCode,
      },
      callback: response => {
        if (response.data) this.initData(response.data);
      },
    })
  }

  initData = data =>{
    this.setState({selectData:data})
  }

  render() {
    const selectProps = {
      showSearch: this.props.showSearch,
      onChange: this.onChange,
      onSearch: this.onSearch,
      onFocus: this.onFocus,
      value:this.props.value
    };

    return (
      <Select {...selectProps}>
        {this.buildOptions()}
      </Select>
    );
  }
}