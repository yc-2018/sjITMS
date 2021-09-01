import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';

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
export default class ContainerSelect extends PureComponent {

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
    if (nextProps.value !== undefined) {
      this.setState({
        value: nextProps.value
      });
    }
  }


  onSearch = (value) => {
    const { state, usage, dispatch } = this.props;
    this.setState({
      value: value
    })
    let searchKeyValues = {
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
    }

    if (state) {
      searchKeyValues['stateEquals'] = state;
    }

    if (usage) {
      searchKeyValues['binUsagesEquals'] = usage;
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
          ...searchKeyValues
        },
      }
    });
  }

  buildOptions = () => {
    let options = [];
    if (this.props.hasAll && this.props.single) {
      options.push(<Select.Option key="all" value={undefined} > 全部 </Select.Option>);
    }
    let arr = this.props.container.data?this.props.container.data:[];
    let data = arr.list;
    this.state.value && Array.isArray(data) && data.forEach(function (dg) {
      options.push(
        <Select.Option key={dg.uuid} value={dg.barcode}>
          {dg.barcode}
        </Select.Option>
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
      <Select {...selectProps}>
        {this.buildOptions()}
      </Select>
    );
  }
}
