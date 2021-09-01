import React, { PureComponent } from 'react';
import { Modal, message, Form, Input, Col, Radio } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import { qtyStrToQty } from '@/utils/QpcStrUtil';
import Empty from '@/pages/Component/Form/Empty';
import RadioGroup from 'antd/es/radio/group';

const FormItem = Form.Item;
@Form.create()
/**
 * 选择装车单
 */
export default class EditDtlModal extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      editVisible: props.editVisible,
      billNumbers: [],
      modalLoading: false,
    };
  }

  componentWillReceiveProps(nextProps) {

    if (nextProps.editVisible !== this.state.editVisible) {
      this.setState({
        editVisible: nextProps.editVisible,
      });
    }
    if (nextProps.billNumbers !== this.state.billNumbers) {
      this.setState({
        billNumbers: nextProps.billNumbers,
      });
    }
  }

  /**
   * 保存
   */
  handleOk() {
    this.props.handleBillNumberSelected(this.state.value);
    this.props.onOK();
  }

  /**
   * 取消添加
   */
  handleCancel() {
    this.setState({
      editVisible: !this.state.editVisible,
      modalLoading: false,
    });
    this.props.form.resetFields();
    this.props.onCancel();
  }

  onChange = (e) => {
    this.setState({
      value: e.target.value,
    });
  }

  render() {
    const baseFormItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };

    const { getFieldDecorator } = this.props.form;
    const { billNumbers } = this.state;
    let radios = [];
    Array.isArray(billNumbers) && billNumbers.forEach(function(billNumber) {
      radios.push(
        <Radio value={billNumber}>{billNumber}</Radio>
      )
    })
    let defaultValue = '';
    if (billNumbers){
      defaultValue = billNumbers[0];
      if (!this.state.value) {
        this.setState({
          value: defaultValue,
        })
      }    
    }
      
    return (
      <Modal
        width="20%"
        title={'选择装车单'}
        onOk={() => this.handleOk()}
        visible={this.state.editVisible}
        onCancel={() => this.handleCancel()}
        destroyOnClose={true}
        confirmLoading={this.state.modalLoading}
      >
        <Form {...baseFormItemLayout}>
          <FormItem>
            <RadioGroup onChange={this.onChange} defaultValue={defaultValue}>
              {radios}
            </RadioGroup>
          </FormItem>
        </Form>

      </Modal>
    );
  }
}
