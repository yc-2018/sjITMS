import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { STATE } from '@/utils/constants';
/**
 * 用户下拉框
 *
 * 支持单选和多选，传入属性single，表示单选，得到的值为商品ucn的json串
 * 不传single属性时为多选模式，json串的数组
 *
 */
@connect(({ user }) => ({
  user
}))
export default class UserSelect extends PureComponent {

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
    //
    // if (this.props.value !== nextProps.value) {
    //   this.initialValue(nextProps.value);
    // }
  }

  // componentDidMount() {
  //   const { value } = this.state;
  //   if (value)
  //     this.initialValue(value);
  // }

  initialValue = (value) => {
    if (value) {
      let user = JSON.parse(value);
      this.onSearch(user.code);
    }
  }

  buildOptions = () => {
    let options = [];

    let data = this.props.user.data.list;
    Array.isArray(data) && data.forEach(function (user) {
      if (user.companyUuid === loginCompany().uuid) {
        options.push(
          <Select.Option key={user.uuid} value={JSON.stringify({
            uuid: user.uuid,
            code: user.code,
            name: user.name
          })}> {convertCodeName(user)} </Select.Option>
        );
      }
    });
    return options;
  }

  onSearch = (value) => {
    const { orgUuids } = this.props;

    let orgList = [];
    if (orgUuids)
      orgList = orgUuids;
    else
      orgList.push(loginOrg().uuid);
    let payload = {
      page: 0,
      pageSize: 20,
      searchKeyValues: {
        orgUuid: orgList,
        state: this.props.onlyOnline ? true : undefined
      },
    }
    if (value && value.length != 0) {
      payload.searchKeyValues.codeName = value
    }
    this.props.dispatch({
      type: 'user/query',
      payload: payload
    });
  }

  onChange = (selectValue) => {
    this.setState({
      value: selectValue,
    });

    // 用于form表单获取控件值
    if (this.props.onChange)
      this.props.onChange(selectValue);
  }

  render() {
    const { single, style } = this.props;
    const selectProps = {
      showSearch: true,
      mode: single ? '' : 'multiple',
      onChange: this.onChange,
      onSearch: this.onSearch,
      defaultActiveFirstOption: false,
      filterOption: false,
      notFoundContent: null,
      autoFocus: this.props.autoFocus ? true : false,
      disabled: this.props.disabled ? true : false,
      style: style ? style : undefined,
    };
    // form表单置空 取消判断
    // if (this.state.value) {
    //   selectProps['value'] = this.state.value;
    // }
    selectProps['value'] = this.state.value;

    return (
      <Select {...selectProps} placeholder={this.props.placeholder} id='user' style={{width:'100%'}}>
        {this.buildOptions()}
      </Select>
    );
  }
}
