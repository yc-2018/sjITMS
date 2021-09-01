import React, { PureComponent } from 'react';
import { Modal, message, Form, Input, Col } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import { qtyStrToQty } from '@/utils/QpcStrUtil';
import Empty from '@/pages/Component/Form/Empty';
const FormItem = Form.Item;
@Form.create()
/**
 * 修改明细弹出的编辑页面
 */
export default class EditDtlModal extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      editVisible: props.editVisible,
      orderDtl: props.orderDtl,
      previewDtl: props.previewDtl,
      editOrder: props.editOrder,
      editPreview: props.editPreview,
      modalLoading: false,
      qtyStr: props.qtyStr,
      qty: props.qty,
    }
  }
  componentWillReceiveProps(nextProps){

    if (nextProps.editVisible !== this.props.editVisible){
      this.setState({
        editVisible:nextProps.editVisible,
      })
    }
    if (nextProps.orderDtl !== this.props.orderDtl){
      this.setState({
        orderDtl: nextProps.orderDtl,
      })
    }
    if (nextProps.previewDtl !== this.props.previewDtl){
      this.setState({
        previewDtl: nextProps.previewDtl,
      })
    }
    this.setState({
      qtyStr: nextProps.qtyStr,
      qty: nextProps.qty,
    })
  }

  /**
   * 保存
   */
  handleOk() {
    let data = {}
    if (this.state.editOrder){
      data = this.state.orderDtl;
    }else if (this.state.editPreview){
      data = this.state.previewDtl;
    }
    this.props.handleQtyStrModified(data);
  }

  /**
   * 取消添加
   */
  handleCancel() {
    this.setState({
      editVisible: !this.state.editVisible,
      modalLoading: false
    });
    this.props.form.resetFields();
    this.props.onCancel();
  }

  handleQtyStrChange(e) {
    const { orderDtl, previewDtl, editOrder, editPreview } = this.state;
    if (editOrder){
      orderDtl.qtyStr = e.toString();
      orderDtl.qty = qtyStrToQty(e.toString(), orderDtl.qpcStr);
    }else if (editPreview){
      previewDtl.qtyStr = e.toString();
      previewDtl.qty = qtyStrToQty(e.toString(), previewDtl.qpcStr);
    }
    this.setState({
      orderDtl: { ...orderDtl },
      previewDtl: { ...previewDtl },
    })
  }

  render(){
    const baseFormItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };

    const { getFieldDecorator } = this.props.form;
    const { orderDtl, previewDtl, editOrder, editPreview, qtyStr, qty } = this.state;
    if (editOrder) {
      return (
        <Modal
          width="30%"
          title={'修改预检数量'}
          onOk={() => this.handleOk()}
          visible={this.state.editVisible}
          onCancel={() => this.handleCancel()}
          destroyOnClose={true}
          confirmLoading={this.state.modalLoading}
        >
          <Form>
            <FormItem
              {...baseFormItemLayout}
              label={commonLocale.orderBillNumberLocal}>
              {
                getFieldDecorator('orderBillNumber', {
                })(
                  <span>{orderDtl? orderDtl.orderBillNumber : <Empty/>}</span>
                )
              }
            </FormItem>
            <FormItem
              {...baseFormItemLayout}
              label={commonLocale.articleLocale}>
              {
                getFieldDecorator('article')(
                  <span>{orderDtl? convertCodeName(orderDtl.article) : <Empty/>}</span>
                )
              }
            </FormItem>
            <FormItem
              {...baseFormItemLayout}
              label={commonLocale.qpcLocale}>
              {
                getFieldDecorator('qpc')(
                  <span>{orderDtl? orderDtl.qpcStr : <Empty/>}</span>
                )
              }
            </FormItem>
            <FormItem
              {...baseFormItemLayout}
              label={commonLocale.caseQtyStrLocale}>
              {
                getFieldDecorator('qtyStr', {
                  initialValue: qtyStr,
                  rules: [
                    { required: true, message: notNullLocale(commonLocale.caseQtyStrLocale) }
                  ],
                })(
                  <QtyStrInput placeholder={placeholderLocale(commonLocale.caseQtyStrLocale)}
                               onChange={e => this.handleQtyStrChange(e)}/>
                )
              }
            </FormItem>
            <FormItem
              {...baseFormItemLayout}
              label={commonLocale.qtyLocale}>
              {
                getFieldDecorator('qty')(
                  <span>{qty}</span>
                )
              }
            </FormItem>
          </Form>
        </Modal>
      );
    }else if (editPreview){
      return (
        <Modal
          width="30%"
          title={'修改预检数量'}
          onOk={() => this.handleOk()}
          visible={this.state.editVisible}
          onCancel={() => this.handleCancel()}
          destroyOnClose={true}
          confirmLoading={this.state.modalLoading}
        >
          <Form>
            <FormItem
              {...baseFormItemLayout}
              label={commonLocale.billNumberLocal}>
              {
                getFieldDecorator('billNumber')(
                  <span> {previewDtl? previewDtl.billNumber : <Empty/>}</span>
                )
              }
            </FormItem>
            <FormItem
              {...baseFormItemLayout}
              label={commonLocale.articleLocale}>
              {
                getFieldDecorator('article')(
                  <span> {previewDtl ? convertCodeName(previewDtl.article) : <Empty/>}</span>
                )
              }
            </FormItem>
            <FormItem
              {...baseFormItemLayout}
              label={commonLocale.qpcStrLocale}>
              {
                getFieldDecorator('qpcStr')(
                  <span> {previewDtl ? previewDtl.qpcStr : <Empty/>}</span>
                )
              }
            </FormItem>
            <FormItem
              {...baseFormItemLayout}
              label={commonLocale.caseQtyStrLocale}
            >
              {
                getFieldDecorator('qtyStr', {
                  initialValue: qtyStr,
                  rules: [
                    { required: true, message: notNullLocale(commonLocale.caseQtyStrLocale) }
                  ],
                })(
                  <QtyStrInput placeholder={placeholderLocale(commonLocale.caseQtyStrLocale)}
                               onChange={e => this.handleQtyStrChange(e)}/>
                )
              }
            </FormItem>
            <FormItem
              {...baseFormItemLayout}
              label={commonLocale.qtyLocale}>
              {
                getFieldDecorator('qty')(
                  <span> {qty}</span>
                )
              }
            </FormItem>
          </Form>
        </Modal>
      );
    }
  }
}
