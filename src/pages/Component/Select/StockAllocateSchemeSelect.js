import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany,loginOrg } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';

/**
* 库存分配顺序方案下拉选择控件
*
* 支持form表单initialValue设置初始值，也可通过属性value设置初始值,形式为JSON.stringify(entity.stockAllocateOrder)
* 支持通过form表单获取控件值，获取到的为库存分配顺序方案字符串形式的ucn，可通过JSON.parse(fieldName)转换格式
* hasAll：包含全部选项，可用于搜索条件;全部选项值为''
* disabled：是否禁用；multiple：是否多选；onlyOnline：是否只查询启用状态的库存分配顺序方案
* 
*/
@connect(({ stockAllocateOrder }) => ({
  stockAllocateOrder
}))
export default class StockAllocateSchemeSelect extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      defSchemeUuid: '',
      defValue: undefined, // 展示默认值
      defStockScheme: props.defStockScheme, // from表单获取默认值

      schemeUuids: []
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'stockAllocateOrder/queryScheme',
      payload: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.value && !this.props.forModify) {
      this.setState({
        defSchemeUuid: nextProps.stockAllocateOrder.data.length>0 ? nextProps.stockAllocateOrder.data[0].uuid : null,
      });
    } else if (this.props.forModify) {
      this.setState({
        value: nextProps.value,
      });
    }else{
      this.setState({
        value: nextProps.value,
        defSchemeUuid: nextProps.stockAllocateOrder.data.length>0 ? nextProps.stockAllocateOrder.data[0].uuid : null,
      });
    }
    if (this.props.defScheme) {
      this.props.defScheme.uuid = nextProps.stockAllocateOrder.data.length>0 ? nextProps.stockAllocateOrder.data[0].uuid : ''
    }

    // 设置默认值
    if (nextProps.stockAllocateOrder.data) {
     nextProps.stockAllocateOrder.data.map(item => {
        if (item.def) {
          this.setState({
            defValue: JSON.stringify({
              uuid: item.uuid,
              code: item.code,
              name: item.name
            })
          })
        }
      })
    }
  }


  buildOptions = () => {
    let options = [];
    let data = this.props.stockAllocateOrder.data;
    if (this.props.hasAll) {
      options.push(<Select.Option key="all" value={undefined} > 全部 </Select.Option>);
    }
    var that = this;

    Array.isArray(data) && data.forEach(function (scheme) {
      that.state.schemeUuids.push(scheme.uuid);
      var value = ''
      if (that.props.defScheme) {
        value = scheme.uuid
      } else {
        value = JSON.stringify({
          uuid: scheme.uuid,
          code: scheme.code,
          name: scheme.name
        })
      }
      options.push(
        <Select.Option key={scheme.uuid} value={value}> {'[' + scheme.code + ']' + scheme.name} </Select.Option>
      );
    });
    if (this.state.value != '' && this.state.value != undefined &&
      this.state.schemeUuids.indexOf(JSON.parse(this.state.value).uuid) == -1) {
      this.setState({
        value: undefined
      })
    }
    return options;
  }

  onChange = (value) => {
    this.setState({ value: value });
    // 用于form表单获取控件值
    if (this.props.onChange){
      this.props.onChange(value);
    }
  }
  render() {
    if (this.state.value == undefined && this.state.defValue != undefined && this.state.defStockScheme) {
      this.state.defStockScheme.uuid = JSON.parse(this.state.defValue).uuid;
      this.state.defStockScheme.code = JSON.parse(this.state.defValue).code;
      this.state.defStockScheme.name = JSON.parse(this.state.defValue).name;
    }
    const { multiple } = this.props;
    const selectProps = {
      disabled: this.props.disabled,
      mode: multiple ? 'multiple' : '',
      onChange: this.onChange,
      placeholder: this.props.placeholder,
      value: this.props.defScheme && this.state.defSchemeUuid != '' 
      && this.state.value === undefined 
      ? this.state.defSchemeUuid : this.state.value,
	    className:this.props.className,    
    };
    if (selectProps.value == undefined) {
      selectProps.value = this.state.defValue;
    }
    return (
      <Select {...selectProps} allowClear>
        {this.buildOptions()}
      </Select>
    );
  }
}
