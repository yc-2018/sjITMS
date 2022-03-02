/*
 * @Author: Liaorongchang
 * @Date: 2022-03-02 11:37:22
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-03-02 15:59:06
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Cascader, Input } from 'antd';
import city from '@/utils/city';
import { formatMessage } from 'umi/locale';
/**
 * 地址控件
 */
export default class Address extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      cascaderValue: undefined,
      inputValue: undefined
    };
  }

  onCascaderChange = (e) => {
    this.setState({
      cascaderValue: e
    });

    this.triggerChange(e);
  }

  onInputChange = (e) => {
    this.setState({
      inputValue: e.target.value
    });

    this.triggerChange(undefined, e.target.value);
  }

  triggerChange = (casValue, inValue) => {
    const onChange = this.props.onChange;
    let { cascaderValue, inputValue } = this.state;
    if (casValue === undefined) {
      casValue = cascaderValue;
    }
    if (inValue === undefined) {
      inValue = inputValue;
    }
    let addressValue = {};
    if (casValue.length > 0) {
      if (casValue[0] !== "海外") {
        addressValue = "中国"+casValue[0]+casValue[1]+casValue[2]+inValue;
      } else {
        addressValue = "海外"+inValue;
      }
    }
    
    if (onChange) {
        this.props.onChange(addressValue);
    }
  }

  render() {
    const { cascaderValue, inputValue } = this.state;
    return (
      <div>
        <Cascader {...this.props} options={city} value = {cascaderValue} placeholder={formatMessage({ id: 'common.addressSelected' })}
                  onChange={this.onCascaderChange.bind(this)} 
                  style={{width:'35%'}} />
        <Input style={{width:'65%'}} placeholder={formatMessage({ id: 'common.addressDetail.notNull' })} 
        onChange={this.onInputChange.bind(this)} 
        />
      </div>
    );
  }
}