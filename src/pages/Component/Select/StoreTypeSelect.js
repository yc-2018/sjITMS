import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany } from '@/utils/LoginContext';
import { PRETYPE } from '@/utils/constants';

/**
* 门店类型下拉选择控件
*
* 支持form表单initialValue设置初始值，也可通过属性value设置初始值；
*/
@connect(({ pretype }) => ({
  pretype
}))
export default class StoreTypeSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      typeNames: [],
    }
  }
  
  componentDidMount() {
    if (this.state.typeNames !== []) {
      this.props.dispatch({
        type: 'pretype/queryType',
        payload: PRETYPE['store']
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    let preType = nextProps.pretype;
    if (preType) {
      if(preType.queryType===PRETYPE['store'] && preType.names){
        let typeNames = [...preType.names];
        this.setState({
          typeNames: typeNames,
        })
      }
    }

    this.setState({
      value: nextProps.value
    });
  }

  buildOptions = () => {
    const {typeNames} = this.state;
    let options = [];

    Array.isArray(typeNames) &&
    typeNames.forEach(function (item, index) {
      options.push(
        <Select.Option key={index} value={item}>{item}</Select.Option>
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
    return (
      <Select style={{width: '100%'}} disabled={this.props.disabled} value={this.state.value} placeholder={this.props.placeholder} onChange={this.onChange}>
        {this.buildOptions()}
      </Select>
    );
  }
}