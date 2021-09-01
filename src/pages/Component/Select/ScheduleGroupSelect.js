
import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';

/**
* 排车组下拉选择控件
*
* 支持form表单initialValue设置初始值，也可通过属性value设置初始值,
* hasAll：包含全部选项，可用于搜索条件;全部选项值为''
* disabled：是否禁用；
* 
*/
@connect(({ scheduleGroup }) => ({
  scheduleGroup
}))
export default class ScheduleGroupSelect extends PureComponent {


  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      scheduleGroupList:[]
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== undefined) {
      this.setState({
        value: nextProps.value
      });
    }

    if (this.props.value !== nextProps.value) {
      if (nextProps.value) {
        this.onSearch(nextProps.value);
      }
    }
  }

  componentDidMount() {
    const { value } = this.state;
    if (value)
      this.onSearch();
  }

  onSearch = (value) => {
    const { state, usage, dispatch } = this.props;
    this.setState({
      value: value
    })
    let searchKeyValues = {
      companyUuid: loginCompany().uuid,
    }

    const { pageFilter } = this.state;

    let queryFilter = { ...pageFilter };

    dispatch({
      type: 'scheduleGroup/query',
      callback:response=>{
        if(response&&response.success){
          this.setState({
            scheduleGroupList:response.data?response.data:[],
          });
        }
      }
    });
  }

  buildOptions = () => {
    let options = [];
    let that = this;
    if (this.props.hasAll && this.props.single) {
      options.push(<Select.Option key="all" value={undefined} > 全部 </Select.Option>);
    }
    let data = this.state.scheduleGroupList;
    Array.isArray(data) && data.forEach(function (dg) {
      options.push(
        <Select.Option key={dg.uuid} value={dg.scheduleGroupNum}> {dg.scheduleGroupNum} </Select.Option>
      );
    });
    return options;
  }

  onChange = (value) => {
    this.setState({ value: value });
    // 用于form表单获取控件值
    if (this.props.onChange)
      this.props.onChange(value);
  }

  render() {
    const { multiple } = this.props;
    const selectProps = {
      disabled: this.props.disabled,
      showSearch: true,
      mode: multiple ? 'multiple' : '',
      onChange: this.onChange,
      onSelect: this.onChange,
      onSearch: this.onSearch,
      placeholder: this.props.placeholder,
      defaultValue: this.props.defaultValue,
      style: this.props.style
    };

    selectProps.value = this.props.value;

    return (
      <Select {...selectProps}>
        {this.buildOptions()}
      </Select>
    );
  }
}
