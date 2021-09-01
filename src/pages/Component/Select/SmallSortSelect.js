import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany } from '@/utils/LoginContext';

/**
 * 小类下拉框
 *
 * 支持单选和多选，传入属性single，表示单选，得到的值为小类ucn的json串
 * 不传single属性时为多选模式，json串的数组
 * hasAll：包含全部选项，可用于搜索条件;全部选项值为''，只用于single模式
 * 设置autoFocus属性,则会定位焦点
 * 需传入大类uuid:bigSortUuid
 */
@connect(({ billSort }) => ({
    billSort
}))
export default class SmallSortSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      bigSortUuid: props.bigSortUuid
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value,
      bigSortUuid: nextProps.bigSortUuid
    });

    // if (nextProps.value&&this.props.value !== nextProps.value) {
    //   let sortCode = JSON.parse(nextProps.value).code;
    //   this.onSearch();
    // }
  }

  componentDidMount() {
    // const { value } = this.state;
    // if (value){
      this.onSearch();
    // }
  }

  buildOptions = () => {
    let options = [];
    let data = this.props.billSort.smallSorts;

    const that = this;
    Array.isArray(data) && data.forEach(function (item) {
      options.push(
        <Select.Option key={item.uuid} value={item.uuid}> {'[' + item.code + ']' + item.name} </Select.Option>
      );
    });
    return options;
  }

  onSearch = (value) => {
    const { state } = this.props;

    let searchKeyValues = {
      state: state,
      bigSortUuid : this.state.bigSortUuid,
      codeName: value,
      companyUuid: loginCompany().uuid
    }
    if(this.state.bigSortUuid)
    this.props.dispatch({
      type: 'billSort/smallSortpage',
      payload: {
        uuid : this.state.bigSortUuid,
        // searchKeyValues: {
        //   ...searchKeyValues
        // },
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
      disabled: this.props.disabled,
      showSearch: true,
      mode: single ? '' : 'multiple',
      onChange: this.onChange,
      onSearch: this.onSearch,
      value: this.state.value,
      autoFocus:this.props.autoFocus?true:false,
      filterOption:false
    };

    return (
      <Select {...selectProps} placeholder={this.props.placeholder} id='smallSort'>
        {this.buildOptions()}
      </Select>
    );
  }
}
