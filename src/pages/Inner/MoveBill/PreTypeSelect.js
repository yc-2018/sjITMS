import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany } from '@/utils/LoginContext';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { PRETYPE } from '@/utils/constants';

/**
 * 预定义类型下拉选择控件
 *
 * 支持form表单initialValue设置初始值，也可通过属性value设置初始值；
 */
@connect(({ pretype }) => ({
  pretype
}))
export default class PreTypeSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      typeNames: [],
    }
  }

  componentDidMount() {
    if (this.state.typeNames !== []) {
      let payload ={preType:this.props.preType}
      if(this.props.orgUuid){
        payload={
          preType:this.props.preType,
          orgUuid:this.props.orgUuid,
        }
      }
      this.props.dispatch({
        type: 'pretype/queryType',
        payload: payload
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    let preType = nextProps.pretype;
    if (preType) {
      if (preType.queryType === this.props.preType && preType.names) {
        let typeNames = [...preType.names];
        if(typeNames.length > 0) {
          for(let i=0;i<typeNames.length;i++) {
            if(typeNames[i] === '点数移库') {
              typeNames.splice(i, 1)
            }
          }
        }
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
    const { typeNames } = this.state;
    let options = [];
    if (this.props.hasAll) {
      options.push(<Select.Option key={this.props.pretype+'All'} value=' '> 全部 </Select.Option>);
    }
    if (this.props.hasRtnWrh){
      options.push(<Select.Option key={'rtnWrh'} value='好退'> 好退 </Select.Option>);
    }
    Array.isArray(typeNames) &&
    typeNames.forEach(function (item, index) {
      options.push(
        <Select.Option key={index} value={item}>
          <EllipsisCol colValue={item} />
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
      mode: this.props.mode,
      onChange: this.onChange,
      placeholder: this.props.placeholder,
      defaultValue: this.props.defaultValue,
      value: this.state.value
    };
    return (
      <Select style={{ width: '100%' }} {...selectProps} id='preType'>
        {this.buildOptions()}
      </Select>
    );
  }
}
