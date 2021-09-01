import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';

/**
* 班组下拉选择控件
*
* 支持form表单initialValue设置初始值，也可通过属性value设置初始值,形式为JSON.stringify(entity.attachment)
* 支持通过form表单获取控件值，获取到的为货主字符串形式的ucn，可通过JSON.parse(fieldName)转换格式
* hasAll：包含全部选项，可用于搜索条件;全部选项值为''
* disabled：是否禁用；
* 
*/
@connect(({ team }) => ({
  team
}))
export default class TeamSelect extends PureComponent {


  constructor(props) {
    super(props);

    this.state = {
      value: props.value
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== undefined) {
      this.setState({
        value: nextProps.value
      });
    }
    if (nextProps.value&&this.props.value !== nextProps.value) {
      let teamCode = JSON.parse(nextProps.value).code;
      this.onSearch(teamCode);
    }
  }

  componentDidMount() {
    const { value } = this.state;
    if (value){
      let teamCode = JSON.parse(value).code;
      this.onSearch(teamCode);
    }
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
      type: 'team/query',
      payload: {
        page: 0,
        pageSize: 20,
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          orgUuid: loginOrg().uuid,
          state: "ONLINE",
          codeName:value
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
    let data = this.props.team.data.list;
    Array.isArray(data) && data.forEach(function (dg) {
      options.push(
        <Select.Option key={dg.uuid} value={JSON.stringify({
            uuid: dg.uuid,
            code: dg.code,
            name: dg.name
        })}> {'[' + dg.code + ']' + dg.name} </Select.Option>
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
      defaultValue: this.props.defaultValue
    };

    selectProps.value = this.props.value;

    return (
      <Select {...selectProps} style={{width:'100%'}}>
        {this.buildOptions()}
      </Select>
    );
  }
}