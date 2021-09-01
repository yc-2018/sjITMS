import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';

/**
 * 货位下拉选择控件
 *
 * 支持form表单initialValue设置初始值，也可通过属性value设置初始值,形式为JSON.stringify(entity.bin)
 * 支持通过form表单获取控件值，获取到的为货主字符串形式的ucn，可通过JSON.parse(fieldName)转换格式
 * hasAll：包含全部选项，可用于搜索条件;全部选项值为''
 * disabled：是否禁用；
 * multiple：是否多选；
 * usage: 货位用途，
 * state：货位状态
 *
 */
@connect(({ bin }) => ({
  bin
}))
export default class BinSelect extends PureComponent {

  static propTypes = {
    usage: PropTypes.string || PropTypes.Array,
    state: PropTypes.string || PropTypes.Array,
  }

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      binList: []
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.bin.bin.list != nextProps.bin.bin.list) {
      this.setState({
        binList: nextProps.bin.bin.list
      })
    }
    this.setState({
      value: nextProps.value
    });
    if (this.props.value !== nextProps.value) {
      if (nextProps.value) {
        this.onSearch(nextProps.value.indexOf("code") != -1 ? JSON.parse(nextProps.value).code : nextProps.value);
      }
    }
  }

  componentDidMount() {
    const { value } = this.state;
    if (value)
      this.onSearch(value);
  }

  onSearch = (value) => {
    const { state, usage, usages, dispatch } = this.props;

    let searchKeyValues = {
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
    }

    if (usage) {
      searchKeyValues['binUsage'] = usage;
    }

    if (usages && usages.length > 0) {
      searchKeyValues['binUsages'] = usages;
    }

    if (state) {
      searchKeyValues['binState'] = state;
    }

    if (value) {
      searchKeyValues['code'] = value;
    }

    dispatch({
      type: 'bin/queryBin',
      payload: {
        page: 0,
        pageSize: 20,
        searchKeyValues: {
          ...searchKeyValues
        }
      }
    });
  }

  buildOptions = () => {
    let options = [];
    if (this.props.hasAll && this.props.single) {
      options.push(<Select.Option key="all" value={undefined} > 全部 </Select.Option>);
    }
    let data = this.state.binList;
    const { state, usage, usages } = this.props;
    Array.isArray(data) && data.forEach(function (dg) {
      if ((!state || dg.state === state) && (!usage || dg.usage === usage) && (!usages || usages.indexOf(dg.usage) > -1)) {
        options.push(
          <Select.Option key={dg.uuid} value={dg.code}>
            {dg.code}
          </Select.Option>
        );
      }
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
      onSearch: this.onSearch,
      placeholder: this.props.placeholder,
      defaultValue: this.props.defaultValue
    };

    selectProps.value = this.props.value;

    return (
      <Select {...selectProps}>
        {this.buildOptions()}
      </Select>
    );
  }
}
