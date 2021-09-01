import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany } from '@/utils/LoginContext';

/**
* 商品类别下拉框
*
* 支持单选和多选，传入属性single，表示单选，得到的值为类别ucn的json串
* 不传single属性时为多选模式，获取的值为类别ucn的数组
* hasAll：包含全部选项，可用于搜索条件;全部选项值为''，只用于single模式
* 设置autoFocus属性,则会定位焦点
*/
@connect(({ category }) => ({
  category
}))
export default class CategorySelect extends PureComponent {

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

    if (nextProps.value && this.props.value !== nextProps.value) {
      this.initialValue(nextProps);
    }
  }

  initialValue = (props) => {
    if (!props.value) {
      return;
    }
    let value = JSON.parse(props.value).code;
    if (props.ownerUuid === '') {
      return;
    }
    let searchKeyValues = {
      companyUuid: loginCompany().uuid,
      state: props.onlyOnline ? 'ONLINE' : '',
      codeName: value,
      ownerUuid: props.ownerUuid
    };
    this.props.dispatch({
      type: 'category/query',
      payload: {
        page: 0,
        pageSize: 20,
        searchKeyValues: searchKeyValues,
        sortFields: {
          code: false
        }
      }
    });
  }

  buildOptions = () => {
    let options = [];
    if (this.props.hasAll && this.props.single) {
      options.push(<Select.Option key="all" value={undefined} > 全部 </Select.Option>);
    }

    let data = this.props.category.data.list;
    const that = this;
    Array.isArray(data) && data.forEach(function (category) {
      if (!that.props.ownerUuid || that.props.ownerUuid === category.owner.uuid) {
        options.push(
          <Select.Option key={category.uuid} value={JSON.stringify({
            uuid: category.uuid,
            code: category.code,
            name: category.name
          })}> {'[' + category.code + ']' + category.name} </Select.Option>
        );
      }else{
        that.setState({
          value:undefined
        })
      }
    });
    return options;
  }

  onSearch = (value) => {
    if (this.props.ownerUuid === '') {
      return;
    }
    let searchKeyValues = {
      companyUuid: loginCompany().uuid,
      state: this.props.onlyOnline ? 'ONLINE' : '',
      codeName: value,
      ownerUuid: this.props.ownerUuid
    };
    this.props.dispatch({
      type: 'category/query',
      payload: {
        page: 0,
        pageSize: 20,
        searchKeyValues: searchKeyValues,
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
      mode: single ? '' : 'multiple',
      onChange: this.onChange,
      onSearch: this.onSearch,
      placeholder: this.props.placeholder,
      value:this.state.value,
      autoFocus:this.props.autoFocus?true:false
    };
    return (
      <Select {...selectProps} id='category'>
        {this.buildOptions()}
      </Select>
    );
  }
}