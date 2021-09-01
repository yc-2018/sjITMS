import React, { PureComponent } from 'react';
import { Select } from 'antd';
import { connect } from 'dva';
import { loginCompany } from '@/utils/LoginContext';

/**
* 打印模板下拉选择控件
*
* 支持form表单initialValue设置初始值，也可通过属性value设置初始值；
*/
@connect(({ template }) => ({
  template
}))
export default class PrintTemplateSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      templateList: [],
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'template/queryByTypeAndOrgUuid',
      payload: {
        printType: this.props.templateType,
        orgUuid: loginCompany().uuid
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    let templateList = nextProps.template.menuList;
    if (templateList && templateList.length > 0 && nextProps.template.menuList[0].type === this.props.templateType) {
      this.setState({
        templateList: [...templateList],
      })
    }
  }

  buildOptions = () => {
    const { templateList, value } = this.state;
    let options = [];
    let defaultValue = undefined;
    Array.isArray(templateList) &&
      templateList.forEach(function (item, index) {
        if (item.def) {
          defaultValue = JSON.stringify({
            uuid: item.uuid,
            name: item.name,
            path: item.path
          });
        }
        options.push(
          <Select.Option key={item.uuid} value={JSON.stringify({
            uuid: item.uuid,
            name: item.name,
            path: item.path
          })}>{item.name}</Select.Option>
        );
      });

    if (!value && defaultValue) {
      this.onChange(defaultValue);
    }
    return options;
  }

  onChange = (value) => {
    this.setState({ value: value });
    // 用于form表单获取控件值
    if (this.props.onChange)
      this.props.onChange(value);
  }

  render() {
    const selectProps = {
      onChange: this.onChange,
      placeholder: '请选择打印模板',
      value: this.state.value,
    };
    return (
      <Select {...selectProps}>
        {this.buildOptions()}
      </Select>
    );
  }
}