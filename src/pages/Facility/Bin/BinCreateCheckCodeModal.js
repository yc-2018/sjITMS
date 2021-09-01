import React, { PureComponent } from 'react';
import { Checkbox, Form, Input, Modal, Switch } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { checkCodeScope } from './BinContants.js';
import { notNullLocale } from '@/utils/CommonLocale';
import styles from './Bin.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const InputGroup = Input.Group;

/**
 * @param {boolean} createBinCheckCodeModalVisible: 是否弹出 Modal
 * @param {boolean} confirmLoading: loading
 * @param {string} code: 当前选中的code
 * @param {function} handleCreateBinCheckCodeModalVisible: 创建货位校验码 Modal
 * @param {function} handleSave: 生成
 * @param {function} handleCalcCheckCode: 设置货位校验码
 */
@Form.create()
export default class BinCreateCheckCodeModal extends PureComponent {

  handleCancel = () => {
    const { form, handleCreateBinCheckCodeModalVisible } = this.props;
    this.props.form.resetFields();
    handleCreateBinCheckCodeModalVisible();
  };

  handleAddShelf = (e) => {
    e.preventDefault();
    const { form, handleSave } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
      };

      handleSave(values);
    });
  };

  calcAndGenBinCheckCode = (e) => {
    e.preventDefault();
    const { form, handleCalcCheckCode } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        binScope: this.props.code,
      };

      handleCalcCheckCode(values);
    });
  };

  render() {
    const baseFormItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const { createBinCheckCodeModalVisible, confirmLoading, ModalTitle } = this.props;
    const { getFieldDecorator } = this.props.form;

    // TODO 获取当前的货位范围
    const checkboxs = [];
    Object.keys(checkCodeScope).forEach(function(key) {
      checkboxs.push(<Checkbox value={checkCodeScope[key].name}>
        {checkCodeScope[key].caption}
      </Checkbox>);
    });
    return (
      <Modal
        title={ModalTitle}
        onOk={this.calcAndGenBinCheckCode}
        visible={createBinCheckCodeModalVisible}
        onCancel={this.handleCancel}
        confirmLoading={confirmLoading}
        destroyOnClose={true}
      >
        <div style={{ maxHeight: '350px', overflow: 'auto', width: '95%' }}>
          <Form>
            {/* 校验码范围 */}
            <Form.Item
              {...baseFormItemLayout}
              key={'checkCodeScopes'}
              label={'货位校验码范围'}
              required={true}
              className={styles.formItemControl}
              style={{ display: 'inline-block', width: 'calc(95%)' }}
            >
              {getFieldDecorator('checkCodeScopes', {
                rules: [
                  {
                    required: true,
                    message: notNullLocale('货位校验码范围'),
                  },
                ],
              })(
                // <Input placeholder={placeholderLocale(BinLocale.startshelfScope)}/>
                <Checkbox.Group>
                  {checkboxs}
                </Checkbox.Group>,
              )}
            </Form.Item>
            <Form.Item {...baseFormItemLayout} label={'同一货架内校验码不重复'}>
              <Switch checked={true} disabled/>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    );
  }
}
