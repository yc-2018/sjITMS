import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany } from '@/utils/LoginContext';

/**
 * 商品下拉框
 *
 * 支持单选和多选，传入属性single，表示单选，得到的值为商品ucn的json串
 * 不传single属性时为多选模式，json串的数组
 * hasAll：包含全部选项，可用于搜索条件;全部选项值为''，只用于single模式
 * 设置autoFocus属性,则会定位焦点
 */
@connect(({ store }) => ({
  store
}))
export default class StoreSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      ownerUuid: props.ownerUuid
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value,
      ownerUuid: nextProps.ownerUuid
    });
    if(nextProps.ownerUuid !== this.props.ownerUuid) {
      this.setState({
        data:[]
      })
    }
    if (nextProps.value&&this.props.value !== nextProps.value) {
      let storeCode = JSON.parse(nextProps.value).code;
      this.onSearch(storeCode);
    }
  }

  componentDidMount() {
    const { value } = this.state;
    if (value){
      this.onSearch(storeCode);
    }
  }

  buildOptions = () => {
    let options = [];
    // let data = this.props.store.data.list;
    let data = this.state.data ? this.state.data : [];
    const that = this;
    Array.isArray(data) && data.forEach(function (item) {
      options.push(
        <Select.Option key={item.uuid} value={JSON.stringify({
          uuid: item.uuid,
          code: item.code,
          name: item.name
        })}> {'[' + item.code + ']' + item.name} </Select.Option>
      );
    });
    return options;
  }

  onSearch = (value) => {
    const { state } = this.props;

    let searchKeyValues = {
      state: state,
      ownerUuid: this.state.ownerUuid,
      codeName: value,
      companyUuid: loginCompany().uuid
    }

    this.props.dispatch({
      type: 'store/query',
      payload: {
        page: 0,
        pageSize: 10,
        searchKeyValues: {
          ...searchKeyValues
        },
        sortFields: {
          code: false
        }
      },
      callback: response => {
        if (response && response.success && response.data && response.data.records) {
          this.setState({
            data : response.data.records
          })
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
      <Select {...selectProps} placeholder={this.props.placeholder} id='store'>
        {this.buildOptions()}
      </Select>
    );
  }
}
