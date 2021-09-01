import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Modal, Select, DatePicker } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import ConfirmLeave from '@/components/MyComponent/ConfirmLeave';
import { confirmLeaveFunc } from '@/utils/utils';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import operationPointLocal from './OperationPointLocal';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import PropTypes from 'prop-types';
import { Type } from '@/pages/Wcs/Dps/FacilitiesMaintenance/TagState';
import { Usage }from './TagUsage';
const FormItem = Form.Item;
const Option = Select.Option;
const tagOptions = [];
const usageOptions = [];
Object.keys(Type).forEach(function (key) {
  tagOptions.push(<Option value={Type[key].name}>{Type[key].caption}</Option>);
});
Object.keys(Usage).forEach(function (key) {
  usageOptions.push(<Option value={Usage[key].name}>{Usage[key].caption}</Option>);
});
@Form.create()
class NodeCreateModal extends PureComponent {
  static propTypes = {
    handleSaveNode: PropTypes.func,
    handleNodeModalVisible: PropTypes.func,
    NodeCreateModalVisible: PropTypes.bool,
    editNodeModal: PropTypes.object,
    confirmLoading: PropTypes.bool,
    parentUuid: PropTypes.string,
    controllerTagValue: PropTypes.array,
    addressList: PropTypes.array
  }

  state = {
    dataValue: {}
  }

  okHandle = () => {
    const { form, handleSaveNode, parentUuid } = this.props;
    const { data } = this.state;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      const upData = {
        ...fieldsValue
      };
      const endUpData = {
        facilityUuid: parentUuid,
        equipmentUuid: data.uuid,
        usage: upData.usage
      }
      handleSaveNode(endUpData);
    });
  };

  handleCancel = () => {
    const { form, handleNodeModalVisible } = this.props;

    handleNodeModalVisible(false, '');
    form.resetFields();
  };

  handleChange = (address) => {
    const { controllerTagValue } = this.props;
    if (Array.isArray(controllerTagValue)) {
      for (const item of controllerTagValue) {
        if (address === item.address) {
          const data = {
            address: address,
            code: item.controller.code,
            cls: item.cls,
            uuid: item.uuid,
            usage: ''
          }
          this.setState({
            data: data
          })

          break;
        }
      }
    }

  }

  render() {

    const {
      form,
      confirmLoading,
      editNodeModal,
      NodeCreateModalVisible,
      addressList
    } = this.props;
    const { data } = this.state;
    const title = editNodeModal && editNodeModal.usage? operationPointLocal.editBtn : operationPointLocal.createBtn;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    return (
      <Modal
        title={title}
        visible={NodeCreateModalVisible}
        onOk={this.okHandle}
        confirmLoading={confirmLoading}
        onCancel={() => this.handleCancel()}
        destroyOnClose
      >
        <div>
          <Form>
            {editNodeModal && editNodeModal.usage ?
              <FormItem {...formItemLayout} label={operationPointLocal.nodeAddress}>
                {form.getFieldDecorator('address', {})(<div>{ editNodeModal && editNodeModal.equipment ? editNodeModal.equipment.address : '' }</div>)}
              </FormItem> :
              <FormItem {...formItemLayout} label={operationPointLocal.nodeAddress}>
                {form.getFieldDecorator('address', {
                  rules: [
                    { required: true, message: notNullLocale(operationPointLocal.nodeAddress) }
                  ],
                  initialValue: editNodeModal && editNodeModal.equipment ? editNodeModal.equipment.address : null,
                })(<Select placeholder={placeholderChooseLocale(operationPointLocal.nodeAddress)} onChange={this.handleChange}>
                  {addressList}
                </Select>)}
              </FormItem>
            }
            {editNodeModal && editNodeModal.usage ?
              <FormItem {...formItemLayout} label={operationPointLocal.gatewayNum}>
                {form.getFieldDecorator('code', {})(<div>{ editNodeModal && editNodeModal.controller ? editNodeModal.controller.code : '' }</div>)}
              </FormItem> :
              <FormItem {...formItemLayout} label={operationPointLocal.gatewayNum}>
                {form.getFieldDecorator('code', {})(<div>{ data && data.code ? data.code : ''}</div>)}
              </FormItem>
            }
            {editNodeModal && editNodeModal.usage ?
              <FormItem {...formItemLayout} label={operationPointLocal.nodeType}>
                {form.getFieldDecorator('cls', {})(<div>{ editNodeModal && editNodeModal.equipment? Type[editNodeModal.equipment.cls].caption : '' }</div>)}
              </FormItem> :
              <FormItem {...formItemLayout} label={operationPointLocal.nodeType}>
                {form.getFieldDecorator('cls', {})(<div>{ data && data.cls ? Type[data.cls].caption : '' }</div>)}
              </FormItem>
            }
            <FormItem {...formItemLayout} label={operationPointLocal.nodeUsage}>
              {form.getFieldDecorator('usage', {
                rules: [
                  { required: true, message: notNullLocale(operationPointLocal.nodeUsage) }
                ],
                initialValue: editNodeModal ? editNodeModal.usage : null,
              })(<Select placeholder={placeholderChooseLocale(operationPointLocal.nodeUsage)}>
                {usageOptions}
              </Select>)}
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
};
export default NodeCreateModal;
