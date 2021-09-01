import { PureComponent } from "react";
import { Col, Form } from 'antd';

const FormItem = Form.Item;

/**
 * 搜索界面表单项标记
 */
export default class SFormForClose extends PureComponent {

  render() {
    return (
      <Col md={8} sm={24}>
        <FormItem label={this.props.label}>
          {this.props.children}
        </FormItem>
      </Col>
    );
  }
}
