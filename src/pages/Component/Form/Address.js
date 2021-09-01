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
    let cascaderValue, inputValue;
    if (props.value) {
      cascaderValue = [props.value.province, props.value.city, props.value.district];
      inputValue = props.value.street;
    }

    this.state = {
      cascaderValue: cascaderValue ? cascaderValue : undefined,
      inputValue: inputValue
    };
  }

  componentWillReceiveProps(nextProps) {
    let cascaderValue, inputValue;
    if (nextProps.value) {
      cascaderValue = [nextProps.value.province, nextProps.value.city, nextProps.value.district];
      inputValue = nextProps.value.street;
    }

    this.setState({
      cascaderValue: cascaderValue ? cascaderValue : undefined,
      inputValue: inputValue
    })
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
        addressValue.country = "中国";
        addressValue.province = casValue[0];
        addressValue.city = casValue[1];
        addressValue.district = casValue[2];
      } else {
        addressValue.country = "海外";
        addressValue.province = "海外";
        addressValue.city = "海外";
        addressValue.district = "海外";
      }
    }
    addressValue.street = inValue;
    if (onChange) {
      onChange(addressValue);
    }
  }

  render() {
    const { cascaderValue, inputValue } = this.state;
    return (
      <div>
        <Cascader options={city} placeholder={formatMessage({ id: 'common.addressSelected' })} value={cascaderValue}
                  onChange={this.onCascaderChange.bind(this)} style={{width:'35%'}} />
        <Input style={{width:'65%'}} placeholder={formatMessage({ id: 'common.addressDetail.notNull' })} value={inputValue} onChange={this.onInputChange.bind(this)} />
      </div>
    );
  }
}
