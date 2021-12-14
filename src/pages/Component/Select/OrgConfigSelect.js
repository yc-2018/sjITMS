import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { orgType, getOrgCaption } from '@/utils/OrgType';

/**
 * 组织下拉框
 *
 * 支持单选和多选，多选时传入mode，参照Select的mode选项
 * 支持自定义选项，属性传入customOptions数组，例如：[{key: 'allStore', caption: '所有门店'},{key: 'allCompany', caption: '所有企业'}]
 * 支持组织upperUuid、state、type精确查询，输入code或者name模糊查询
 * forItemTable:传入改参数，则为明细表格使用，无form表单 无初值
 * 设置autoFocus,则聚焦
 */
@connect(({ orgConfig }) => ({
  orgConfig
}))
export default class OrgConfigSelect extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      disabled: false
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value,
      disabled: nextProps.disabled
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
      const keys = [];
      this.props.customOptions && this.props.customOptions.forEach(function (key) {
        keys.push(key.key);
      })
      let uuids = [];
      if (Array.isArray(value)) {
        value.forEach(function (e) {
          if (keys.indexOf(e) === -1) {
            uuids.push(JSON.parse(e).uuid);
          }
        });
      } else {
        if (keys.indexOf(value) === -1) {
          uuids.push(value);
        }
      }

      if (uuids.length > 0) {
        this.props.dispatch({
          type: 'orgConfig/queryByUuids',
          payload: uuids
        });
      }
    }
  }

  buildOptions = () => {
    let options = [];
    const {type,types}=this.props;
    let key=type ? type : (types && types.length > 0 ? types[0] : 'org')
    if (this.props.hasAll) {
      options.push(<Select.Option key={key+'All'} value={undefined} > 全部 </Select.Option>);
    }
    if (this.props.customOptions) {
      this.props.customOptions.forEach(function (e) {
        options.push(<Select.Option key={e.key} value={e.key} title={e.caption}> {e.caption} </Select.Option>);
      });
    }
    let data = this.props.orgConfig.data;
    const that = this;
    Array.isArray(data) && data.forEach(function (org) {
      if ((!that.props.ownerUuid || that.props.ownerUuid === org.ownerUuid) &&
        (!that.props.upperUuid || that.props.upperUuid == org.upperUuid) &&
        (!that.props.type || org.type === that.props.type)) {
        let value = JSON.stringify({
          uuid: org.uuid,
          code: org.code,
          name: org.name,
          type: org.type
        });
        let caption = '[' + org.code + ']' + org.name;
        if (!that.props.type) {
          caption = caption + " " + getOrgCaption(org.type);
        }
        options.push(
          <Select.Option key={org.uuid} value={org.uuid+""} title={caption}> {caption} </Select.Option>
        );
      } else {
        that.setState({
          value: undefined
        })
      }
    });
    return options;
  }

  onSearch = (value) => {
    const { upperUuid, type, state, ownerUuid, types } = this.props;
    // if (ownerUuid == '') {
    //   return;
    // }

    let searchKeyValues = {
      upperUuid: upperUuid,
      state: state,
      type: type,
      ownerUuid: ownerUuid,
      codeName: value
    }
    if (types && types.length > 0) {
      searchKeyValues['types'] = types;
    }

    this.props.dispatch({
      type: 'orgConfig/query',
      payload: {
        page: 0,
        pageSize: 20,
        searchKeyValues: {
          ...searchKeyValues
        },
        sortFields: {
          code: false
        }
      }
    });
  }

  onChange = (selectValue) => {
    this.setState({
      value: selectValue,
    });
  console.log("selectValue",selectValue);
    console.log("this.props",this.props);
    // 用于form表单获取控件值
    if (this.props.onChange)
      this.props.onChange(selectValue);
    console.log("propssss",this.props);
  }

  render() {
    const { single } = this.props;
    const selectProps = {
      showSearch: true,
      onChange: this.onChange,
      onSearch: this.onSearch,
      disabled: this.props.disabled,
      placeholder: this.props.placeholder,
      autoFocus: this.props.autoFocus ? this.props.autoFocus : false,
      style: this.props.style? this.props.style : { width: '100%' },
      allowClear:true

    };

    if (this.state.value) {
      selectProps.value = this.state.value;
    } else if ((this.state.value == undefined || this.state.value === '') && this.props.forItemTable == undefined) {
      selectProps.value = this.state.value;
    }
    return (
      <Select {...selectProps} id={this.props.type ? this.props.type.toLowerCase() : 'org'}>
        {this.buildOptions()}
      </Select>
    );
  }
}
