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
    // const formItemLayout = {
    //     labelCol: { span: this.props.labelSpan?this.props.labelSpan:6 },
    //     wrapperCol: { span: this.props.wrapperSpan?this.props.wrapperSpan:18 },
    //     colon: true,
    //     required: this.props.required
    // };

    // TODO 兼容 CForm 的 span 参数控制布局
    return this.props.children;
    // return (
    //   <Col span={this.props.span ? this.props.span : 6} offset={this.props.offset}>
    //     <FormItem {...formItemLayout} label={this.props.label}>
    //       {this.props.children}
    //     </FormItem>
    //   </Col>
    // );
  }
}
