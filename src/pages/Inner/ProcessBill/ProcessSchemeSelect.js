
import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';

/**
 * 加工方案下拉框
 *
 * 支持单选和多选，多选时传入mode，参照Select的mode选项
 * 输入code或者name模糊查询
 * forItemTable:传入改参数，则为明细表格使用，无form表单 无初值
 */
@connect(({ processingScheme }) => ({
  processingScheme
}))
export default class ProcessSchemeSelect extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      disabled: false,
      processingSchemeList: []
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value,
      disabled: nextProps.disabled
    });
    if (nextProps.processingScheme.data.list) {
      this.setState({
        processingSchemeList: [...nextProps.processingScheme.data.list]
      })
    }
    // if (this.props.value !== nextProps.value) {
    //   this.onSearch(nextProps.value.indexOf("code") != -1 ? JSON.parse(nextProps.value).code : nextProps.value);
    // }
  }

  componentDidMount() {
    const { value } = this.state;
    //if (value)
    this.onSearch(value);
  }

  buildOptions = () => {
    let options = [];
    let data = this.props.processingScheme.data.list;
    if (this.props.hasAll) {
      options.push(<Select.Option key="all" value='' > 全部 </Select.Option>);

      Array.isArray(data) && data.forEach(function (dg) {
        if (dg.companyUuid === loginCompany().uuid) {
          options.push(
            <Select.Option key={dg.uuid} value={JSON.stringify({
              uuid: dg.uuid,
              code: dg.code,
              name: dg.name
            })}> {'[' + dg.code + ']' + dg.name} </Select.Option>
          );
        }
      });
    } else {
      Array.isArray(data) && data.forEach(function (dg) {
        let off = false;
        if (dg.state === 'OFFLINE') {
          off = true;
        }
        if (dg.companyUuid === loginCompany().uuid) {
          options.push(
            <Select.Option key={dg.uuid} disabled={off} value={JSON.stringify({
              uuid: dg.uuid,
              code: dg.code,
              name: dg.name,
            })}> {'[' + dg.code + ']' + dg.name} </Select.Option>
          );
        }
      });
    }
    return options;
  }

  onSearch = (value) => {
    const { upperUuid, type, state, ownerUuid } = this.props;
    if (ownerUuid == '') {
      return;
    }
    this.props.dispatch({
      type: 'processingScheme/query',
      payload: {
        page: 0,
        pageSize: 20,
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          state: this.props.onlyOnline ? STATE.ONLINE : '',
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
    if (this.props.onChange) {
      let owner = {}
      let data = this.props.processingScheme.data.list
      selectValue != "" && data.forEach(e => {
        if (e.uuid === JSON.parse(selectValue).uuid) {
          owner = e.owner;
        }
      })
      this.props.onChange(selectValue, owner);
    }
  }

  render() {
    const { single } = this.props;
    const selectProps = {
      //showSearch: true,
      mode: this.props.mode,
      onChange: this.onChange,
      //onSearch: this.onSearch,
      placeholder: this.props.placeholder,
    };

    if (this.state.value) {
      selectProps.value = this.state.value;
    } else if ((this.state.value == undefined || this.state.value === '') && this.props.forItemTable == undefined) {
      selectProps.value = this.state.value;
    }
    return (
      <Select {...selectProps} style={{ width: '100%' }} disabled={this.state.disabled} id='processSchemeSelect'>
        {this.buildOptions()}
      </Select>
    );
  }
}
