import { PureComponent } from "react";
import { Col, Form } from 'antd';

const FormItem = Form.Item;

/**
 * 搜索界面表单项标记
 */
export default class SFormItem extends PureComponent {

  render() {
    // return (
    //     // <Col span={6}>
    //     //     <FormItem label={this.props.label}>
    //             {this.props.children}
    //         {/* </FormItem>
    //     </Col> */}
    // );
    return this.props.children;
  }
}
