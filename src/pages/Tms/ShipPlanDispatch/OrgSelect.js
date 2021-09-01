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
 */
@connect(({ org }) => ({
  org
}))
export default class OrgSelect extends PureComponent {

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
          uuids.push(JSON.parse(value).uuid);
        }
      }

      if (uuids.length > 0) {
        this.props.dispatch({
          type: 'org/queryByUuids',
          payload: uuids
        });
      }
    }
  }

  buildOptions = () => {
    let options = [];
    if (this.props.hasAll) {
      options.push(<Select.Option key="all" value={undefined} > 全部 </Select.Option>);
    }
    if (this.props.customOptions) {
      this.props.customOptions.forEach(function (e) {
        options.push(<Select.Option key={e.key} value={e.key}> {e.caption} </Select.Option>);
      });
    }
    let data = this.props.org.data;
    const that = this;
    Array.isArray(data) && data.forEach(function (org) {
      if ((!that.props.ownerUuid || that.props.ownerUuid === org.ownerUuid) &&
        (!that.props.upperUuid || that.props.upperUuid == org.upperUuid)) {
        let value = JSON.stringify({
          uuid: org.uuid,
          code: org.code,
          name: org.name,
        });
        let caption = '[' + org.code + ']' + org.name;
        options.push(
          <Select.Option key={org.uuid} value={value}> {caption} </Select.Option>
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
    const { upperUuid, state, ownerUuid } = this.props;
    if (ownerUuid == '') {
      return;
    }
    this.props.dispatch({
      type: 'org/query',
      payload: {
        page: 0,
        pageSize: 20,
        searchKeyValues: {
          upperUuid: upperUuid,
          state: state,
          ownerUuid: ownerUuid,
          codeName: value
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

    // 用于form表单获取控件值
    if (this.props.onChange)
      this.props.onChange(selectValue);
  }

  render() {
    const { single } = this.props;
    const selectProps = {
      showSearch: true,
      mode: this.props.mode,
      onChange: this.onChange,
      onSearch: this.onSearch,
      placeholder: this.props.placeholder,
    };

    if (this.state.value) {
      selectProps.value = this.state.value;
    } else if ((this.state.value == undefined || this.state.value === '') && this.props.forItemTable == undefined) {
      selectProps.value = this.state.value;
    }
    return (
      <Select {...selectProps} style={{ width: '100%' }} disabled={this.state.disabled}>
        {this.buildOptions()}
      </Select>
    );
  }
}
