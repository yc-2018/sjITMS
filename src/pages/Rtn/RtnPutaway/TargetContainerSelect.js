import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';
import { containerState, getStateCaption } from '@/utils/ContainerState';
import { binUsage } from '@/utils/BinUsage';

/**
* 容器下拉选择控件
*
* 支持form表单initialValue设置初始值，也可通过属性value设置初始值,形式为JSON.stringify(entity.container)
* 支持通过form表单获取控件值，获取到的为货主字符串形式的ucn，可通过JSON.parse(fieldName)转换格式
* hasAll：包含全部选项，可用于搜索条件;全部选项值为''
* disabled：是否禁用；
* multiple：是否多选；
* usage: 用途，
* state：容器状态
* 
*/
@connect(({ container }) => ({
  container
}))
export default class TargetContainerSelect extends PureComponent {

  static propTypes = {
    usage: PropTypes.string || PropTypes.Array,
    state: PropTypes.string || PropTypes.Array,
  }

  constructor(props) {
    super(props);

    this.state = {
      value: props.value
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      if (nextProps.value) {
        this.onSearch(nextProps.value);
      }
    }
  }

  componentDidMount() {
    const { value } = this.state;
    if (value) {
      this.onSearch(value);
    }
  }

  onSearch = (value) => {
    const { dispatch, binCode } = this.props;
    if (!binCode || !value)
      return;
    this.setState({
      value: value
    })
    let searchKeyValues = {
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
    }

    if (value) {
      searchKeyValues['barcodeLike'] = value;
    }

    dispatch({
      type: 'container/query',
      payload: {
        page: 0,
        pageSize: 20,
        searchKeyValues: {
          ...searchKeyValues,
          states: [containerState.IDLE.name, containerState.USEING.name]
        },
      }
    });
  }

  buildOptions = () => {
    const { binCode } = this.props;

    let options = [];
    if (!binCode)
      return options;
    let data = this.props.container.data.list;
    this.state.value && Array.isArray(data) && data.forEach(function (dg) {
      if (containerState.IDLE.name === dg.state
        || (binCode === dg.position && containerState.USEING.name === dg.state)) {
        options.push(
          <Select.Option key={dg.uuid} value={dg.barcode}>
            {dg.barcode + '[' + containerState[dg.state].caption + ']'}
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
      onSelect: this.onChange,
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