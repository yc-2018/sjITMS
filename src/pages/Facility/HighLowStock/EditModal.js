import React, { PureComponent } from 'react';
import { Form, Input, InputNumber, Modal, Select, Row, Col, message } from 'antd';
import moment from 'moment';
import { highLowStockLocale } from './HighLowStockLocale';
import { commonLocale, notNullLocale, placeholderLocale } from '@/utils/CommonLocale';
import { qtyStrToQty,toQtyStr} from '@/utils/QpcStrUtil';
const FormItem = Form.Item;
@Form.create()
class EditModal extends PureComponent {
  okHandle = () => {
    const { form, entity } = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      if (fieldsValue.lowStockQtyStr > fieldsValue.highStockQtyStr) {
        message.error('最低库存应小于最高库存');
        return;
      }
      let params = {
        uuid: entity.uuid,
        dcUuid: entity.dcUuid,
        articleUuid: entity.article.uuid,
        binCode: entity.binCode,
        qpcStr: this.props.qpcStr ? this.props.qpcStr : this.props.entity.qpcStr,
        highStockQtyStr: fieldsValue.highStockQtyStr,
        lowStockQtyStr: fieldsValue.lowStockQtyStr,
      }
      this.props.dispatch({
        type: 'highLowStock/update',
        payload: params,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.modifySuccessLocale);
            this.props.handleEditModalVisible();
          }
        },
      })
    });
  };

  onChange = (value, name) => {
    let str = this.props.qpcStr ? this.props.qpcStr : this.props.entity.qpcStr;
    if (value != null) {
      let qty = qtyStrToQty(value.toString(), str);
      if (name === 'lowStockQty') {
        this.props.entity.lowStockQty = qty;
      } else {
        this.props.entity.highStockQty = qty;
      }
    }
  }

  handleCancel = () => {
    const { form, handleEditModalVisible } = this.props;
    form.resetFields();
    handleEditModalVisible();
  };

  render() {
    const {
      form,
      editModalVisible,
      entity,
      plateAdvice,
      qpcStr
    } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    if(qpcStr && entity){
      entity.lowStockQtyStr=toQtyStr(entity.lowStockQty,qpcStr);
      entity.highStockQtyStr=toQtyStr(entity.highStockQty,qpcStr);
    }
    return (
      <Modal
        title={highLowStockLocale.title}
        visible={editModalVisible}
        onOk={this.okHandle}
        onCancel={this.handleCancel}
        destroyOnClose={true}
        centered={true}
      >
        <Form >
          <FormItem {...formItemLayout}
            label={highLowStockLocale.article}
            style={{ height: '20px' }}
          >
            {form.getFieldDecorator('article')(
              <Col>{entity ? `[${entity.article.code}]${entity.article.name}` : null}</Col>
            )}
          </FormItem>
          <FormItem {...formItemLayout}
            label={highLowStockLocale.binCode}
            style={{ height: '20px' }}
          >
            {form.getFieldDecorator('binCode')(
              <Col>{entity ? entity.binCode : null}</Col>
            )}
          </FormItem>
          <FormItem {...formItemLayout}
            label={highLowStockLocale.qpcStr}
            style={{ height: '20px' }}
          >
            {form.getFieldDecorator('qpcStr')(
              <Col>{qpcStr ? qpcStr : (entity ? entity.qpcStr : null)}</Col>
            )}
          </FormItem>
          <FormItem {...formItemLayout}
            label='装盘建议'
            style={{ height: '20px' }}
          >
            {form.getFieldDecorator('plateAdvice')(
              <Col>{plateAdvice ? plateAdvice : null}</Col>
            )}
          </FormItem>
          <FormItem {...formItemLayout}
            label={highLowStockLocale.lowStockQtyStr}
            style={{ height: '20px' }}
          >
            {form.getFieldDecorator('lowStockQtyStr',
              {
                rules: [
                  { required: true, message: notNullLocale(highLowStockLocale.lowStockQtyStr) },
                ],
                initialValue: entity ? entity.lowStockQtyStr : null,
              })(
                <InputNumber max={10000} onChange={(value) => this.onChange(value, 'lowStockQty')} style={{ width: '90%' }} min={0} precision={0} decimalSeparator={null}
                  placeholder={placeholderLocale(highLowStockLocale.lowStockQtyStr)} />
              )}
          </FormItem>
          <FormItem {...formItemLayout}
            label={highLowStockLocale.lowStockQty}
            style={{ height: '20px' }}
          >
            <span><center>{entity ? entity.lowStockQty : 0}</center></span>
          </FormItem>
          <FormItem {...formItemLayout}
            label={highLowStockLocale.highStockQtyStr}
            style={{ height: '20px' }}
          >
            {form.getFieldDecorator('highStockQtyStr',
              {
                rules: [
                  { required: true, message: notNullLocale(highLowStockLocale.highStockQtyStr) },
                ],
                initialValue: entity ? entity.highStockQtyStr : null,
              })(
                <InputNumber max={10000} onChange={(value) => this.onChange(value, 'highStockQty')} style={{ width: '90%' }} min={0} precision={0} decimalSeparator={null}
                  placeholder={placeholderLocale(highLowStockLocale.highStockQtyStr)} />
              )}
          </FormItem>
          <FormItem {...formItemLayout}
            label={highLowStockLocale.highStockQty}
            style={{ height: '20px' }}
          >
            <span><center>{entity ? entity.highStockQty : 0}</center></span>
          </FormItem>
        </Form>
      </Modal>
    );
  }
};
export default EditModal;
