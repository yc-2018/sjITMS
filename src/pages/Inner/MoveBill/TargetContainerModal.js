import React, { PureComponent } from 'react';
import { Select, Form, Input, Modal } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import ContainerSelect from '@/pages/Component/Select/ContainerSelect';
import { containerState } from '@/utils/ContainerState';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import BatchAddTargetContainerSelect from './BatchAddTargetContainerSelect';

const FormItem = Form.Item;
@Form.create()
export default class TargetContainerModal extends PureComponent {
  handleCancel = () => {
    const { form, handleContainerModalVisible } = this.props;
    this.props.form.resetFields();
    const value = [];
    handleContainerModalVisible(value);
  };

  handleAlter = (e) => {
    e.preventDefault();
    const { form, handleRefreshContainer } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
      };

      handleRefreshContainer(values);
    });
  }

  onFieldChange = (value, field) => {
    const { entity } = this.props;
    if (field === 'toContainerBarcode') {
      const toContainer = JSON.parse(value);
      entity.toContainerBarcode = toContainer.barcode;
    }
  }

  render() {
    const baseFormItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    const { containerModalVisible, ModalTitle, entity } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal
        title={ModalTitle}
        onOk={this.handleAlter}
        visible={containerModalVisible}
        onCancel={this.handleCancel}
        destroyOnClose={true}
      >
        <div style={{ maxHeight: '200px', overflow: 'auto' }}>
          <Form>
            <FormItem {...baseFormItemLayout} label='容器'>
              {
                getFieldDecorator('containerBarcode', {
                  rules: [{
                    required: true,
                    message: '容器不能为空',
                  }],
                  initialValue: entity.toContainerBarcode ? entity.toContainerBarcode : undefined
                })(
                  <BatchAddTargetContainerSelect
                    // value={entity.toContainerBarcode ? entity.toContainerBarcode : undefined}
                    binCode={entity.toBinCode ? entity.toBinCode : undefined}
                    fromContainerBarcode={entity.fromContainerBarcode ? entity.fromContainerBarcode : undefined}
                    showSearch={true}
                    onChange={e => this.onFieldChange(e, 'toContainerBarcode')}
                    placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)}
                  />
                )
              }
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
}
