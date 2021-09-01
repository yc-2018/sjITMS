import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
/**
* 用户下拉框
*
* 支持单选和多选，传入属性single，表示单选，得到的值为商品ucn的json串
* 不传single属性时为多选模式，json串的数组
* 
*/
@connect(({ workType }) => ({
  workType
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

    if (this.props.value !== nextProps.value) {
      this.initialValue(nextProps.value);
    }
  }

  componentDidMount() {
    const { value } = this.state;
    if (value)
      this.initialValue(value);
  }

  initialValue = (value) => {
    if (value) {
      let user = JSON.parse(value);
      this.onSearch(user.code);
    }
  }

  buildOptions = () => {
    let options = [];

    // let data = this.props.workType.data.list;
    let data = [];
    let userUuids = [];
    for(let i = 0;i<this.props.workType.data.list.length;i++){
      let target = this.props.workType.data.list[i];
      if(userUuids.indexOf(target.userUuid)==-1){
        data.push(target);
        userUuids.push(target.userUuid)
      }
    }
    Array.isArray(data) && data.forEach(function (user) {
      if (user.companyUuid === loginCompany().uuid) {
        options.push(
          <Select.Option key={user.uuid} value={JSON.stringify({
            uuid: user.userUuid,
            code: user.userCode,
            name: user.userName
          })}> {'[' + user.userCode + ']' + user.userName} </Select.Option>
        );
      }
    });
    return options;
  }

  onSearch = (value) => {
    let payload = {
      page: 0,
      pageSize: 20,
      searchKeyValues: {
        companyUuid: loginCompany().uuid,
        dispatchCenterUuid:loginOrg().uuid
      },
    }
    if (value && value.length != 0) {
      payload.searchKeyValues.codeName = value
    }
    this.props.dispatch({
      type: 'workType/query',
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
      style: style ? style : undefined
    };
    // form表单置空 取消判断
    // if (this.state.value) {
    //   selectProps['value'] = this.state.value;
    // }
    selectProps['value'] = this.state.value;

    return (
      <Select {...selectProps} placeholder={this.props.placeholder} id='userforworktype' style={{width:'100%'}}>
        {this.buildOptions()}
      </Select>
    );
  }
}
