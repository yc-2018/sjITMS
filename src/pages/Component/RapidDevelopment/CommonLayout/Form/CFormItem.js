import React, { PureComponent } from 'react';
import { Col, Form } from 'antd';

const FormItem = Form.Item;

/**
 * 创建页面表单项标记
 * span 列占比
 * labelSpan 文本占比
 * wrapperSpan 输入框占比
 */
export default class CFormItem extends PureComponent {
  render() {
    return this.props.children;
  }
}
