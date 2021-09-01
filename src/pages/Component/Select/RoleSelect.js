import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
/**
 * 角色下拉框
 */
@connect(({ role }) => ({
  role
}))
export default class RoleSelect extends PureComponent {
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
  }

  componentDidMount() {
    let payload = {
      page: 0,
      pageSize: 100,
      searchKeyValues: {
        orgUuid: loginOrg().uuid,
      },
      sortFields: {
        code: false
      }
    }
    this.props.dispatch({
      type: 'role/query',
      payload: payload
    });
  }

  buildOptions = () => {
    let options = [];

    let data = this.props.role.data.list;
    Array.isArray(data) && data.forEach(function (role) {
      if (role.status =='online'){
        options.push(
        <Select.Option key={role.uuid} value={JSON.stringify({
          uuid: role.uuid,
          code: role.code,
          name: role.name
        })}> {convertCodeName(role)} </Select.Option>
      );
      }
    });
    return options;
  }

  onChange = (selectValue) => {
    this.setState({
      value: selectValue,
    });

    // 用于form表单获取控件值
    if (this.props.onChange)
      this.props.onChange(selectValue);
  }

  onDeselect = (selectValue) => {
    this.setState({
      value: selectValue,
    });

    // 用于form表单获取控件值
    if (this.props.onDeselect)
      this.props.onDeselect(selectValue);
  }

  render() {
    const { single, mode } = this.props;
    const selectProps = {
      mode: mode,
      onChange: this.onChange,
      onDeselect: this.onDeselect,
      defaultActiveFirstOption: false,
      filterOption: false,
      notFoundContent: null
    };

    if (this.state.value || this.state.value === '') {
      // if (defaultValue === 'true' && this.props.role.data.list.length > 0) {
      //   this.state.value = JSON.stringify({
      //     uuid: this.props.role.data.list[0].uuid,
      //     code: this.props.role.data.list[0].code,
      //     name: this.props.role.data.list[0].name
      //   })
      // }
      selectProps['value'] = this.state.value;
    }
    return (
      <Select {...selectProps} placeholder={this.props.placeholder}>
        {this.buildOptions()}
      </Select>
    );
  }
}
