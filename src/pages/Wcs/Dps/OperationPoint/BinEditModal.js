import React, { PureComponent } from 'react';
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
import styles from './operationPoint.less';
import { Usage }from './TagUsage';
import { Type } from '@/pages/Wcs/Dps/FacilitiesMaintenance/TagState';

const FormItem = Form.Item;
const Option = Select.Option;
const usageOptions = [];
Object.keys(Usage).forEach(function (key) {
  usageOptions.push(<Option value={Usage[key].name}>{Usage[key].caption}</Option>);
});

@Form.create()
class BinEditModal extends PureComponent {

  static propTypes = {
    handleEditBin: PropTypes.func,
    handleSaveNode: PropTypes.func,
    handleBinEditModalVisible: PropTypes.func,
    BinEditModalVisible: PropTypes.bool,
    confirmLoading: PropTypes.bool,
    editBinModal: PropTypes.object,
    parentUuid: PropTypes.string,
    controllerTagValue: PropTypes.array,
    addressList: PropTypes.array
  }

  state = {
    dataList: {}
  }

  okHandle = () => {
    const { form, handleEditBin, editBinModal, handleSaveNode, parentUuid } = this.props;
    const { dataList } = this.state;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      const data = {
        ...fieldsValue,
        uuid: editBinModal && editBinModal.bin ? editBinModal.bin.uuid : null,
      };
      let tagData = [];
      if ( data.address === dataList.address) {
        tagData = [{
          facilityUuid: editBinModal && editBinModal.bin ? editBinModal.bin.uuid : null,
          equipmentUuid: dataList.uuid,
          usage: data.usage
        }];
      } else {
        tagData = [{
          facilityUuid: editBinModal && editBinModal.bin ? editBinModal.bin.uuid : null,
          equipmentUuid: null,
          usage: data.usage
        }];
      }

      const binData = {
        code: data.code,
        name: editBinModal && editBinModal.bin ? editBinModal.bin.code : null,
        facilityOrder: data.facilityOrder,
        uuid: editBinModal && editBinModal.bin ? editBinModal.bin.uuid : null,
        equipments: tagData
      };
      handleEditBin(binData);
    });
  };

  handleCancel = () => {
    const { form, handleBinEditModalVisible } = this.props;

    handleBinEditModalVisible();
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
            dataList: data
          })

          break;
        }
      }
    }

  }

  render() {

    const {
      form,
      BinEditModalVisible,
      confirmLoading,
      editBinModal,
      addressList
    } = this.props;
    const title = operationPointLocal.editBtn;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };

    return (
      <Modal
        title={title}
        visible={BinEditModalVisible}
        onOk={this.okHandle}
        confirmLoading={confirmLoading}
        onCancel={() => this.handleCancel()}
        destroyOnClose
      >
        <div>
          <Form>
            <FormItem {...formItemLayout} label={operationPointLocal.binNum}>
              <Form.Item
                className={styles.formItemControl}>
                {form.getFieldDecorator('code', {
                  rules: [
                    { required: true, message: notNullLocale(operationPointLocal.binNum) },
                    {
                      pattern: /^[0-9]{8}$/,
                      message: formatMessage({ id: 'bin.validate.bin.address' })
                    }
                  ],
                  initialValue: editBinModal && editBinModal.bin ? editBinModal.bin.code : null,
                 })(<Input placeholder={placeholderLocale(operationPointLocal.binNum)} />)}
              </Form.Item>
            </FormItem>
            <FormItem {...formItemLayout} label={operationPointLocal.binOrder}>
              {form.getFieldDecorator('facilityOrder', {
                rules: [
                  { required: true, message: notNullLocale(operationPointLocal.binOrder) },
                  {
                    pattern: /^[0-9]*$/,
                    message: formatMessage({ id: 'basic.data.order' })
                  }
                ],
                initialValue: editBinModal && editBinModal.bin ? editBinModal.bin.facilityOrder : null,
              })(<Input placeholder={placeholderLocale(operationPointLocal.binOrder)} />)}
            </FormItem>

            <FormItem {...formItemLayout} label={operationPointLocal.nodeAddress}>
              {form.getFieldDecorator('address', {
                rules: [
                  { required: true, message: notNullLocale(operationPointLocal.nodeAddress) }
                ],
                initialValue: editBinModal && editBinModal.facilityEquipmentEntity && editBinModal.facilityEquipmentEntity.equipment ? editBinModal && editBinModal.facilityEquipmentEntity && editBinModal.facilityEquipmentEntity.equipment.address : null,
              })(<Select placeholder={placeholderChooseLocale(operationPointLocal.nodeAddress)} onChange={this.handleChange}>
                {addressList}
              </Select>)}
            </FormItem>

            {editBinModal && editBinModal.facilityEquipmentEntity && editBinModal.facilityEquipmentEntity.equipment ?
              <FormItem {...formItemLayout} label={operationPointLocal.nodeType}>
                {form.getFieldDecorator('cls', {})(<div>{ editBinModal && editBinModal.facilityEquipmentEntity && editBinModal.facilityEquipmentEntity.equipment ? Type[editBinModal.facilityEquipmentEntity.equipment.cls].caption : '' }</div>)}
              </FormItem> :
              <FormItem {...formItemLayout} label={operationPointLocal.nodeType}>
                {form.getFieldDecorator('cls', {})(<div>{ this.state.dataList && this.state.dataList.cls ? Type[this.state.dataList.cls].caption : '' }</div>)}
              </FormItem>
            }

            <FormItem {...formItemLayout} label={operationPointLocal.nodeUsage}>
              {form.getFieldDecorator('usage', {
                rules: [
                  { required: true, message: notNullLocale(operationPointLocal.nodeUsage) }
                ],
                initialValue: editBinModal && editBinModal.facilityEquipmentEntity ? editBinModal.facilityEquipmentEntity.usage : null,
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
export default BinEditModal;
