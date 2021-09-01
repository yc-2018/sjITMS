import React, { PureComponent } from 'react';
import { Form, Input, Modal, Col,Select } from 'antd';
import { commonLocale, notNullLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import StockAllocateSchemeSelect from '@/pages/Component/Select/StockAllocateSchemeSelect';
import { rplLocale } from './RplLocale';
import { RplMode} from '@/pages/Facility/PickArea/PickAreaContants';
const FormItem = Form.Item;
const Option=Select.Option;
@Form.create()
class RplModifyModal extends PureComponent {
  okHandle = () => {
    const { form } = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      const data = {
        ...fieldsValue
      };
      this.props.BatchEditMode(data);
    });
  };

  handleCancel = () => {
    const { form, handleModal } = this.props;
    handleModal();
  };

  render() {
    const {
      form,
      visible,
      record,
    } = this.props;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    let rplModeOptions = [];
    let mode=record ? record.rplMode :null;
    Object.keys(RplMode).forEach(function (key) {
      if(key!==mode){
        rplModeOptions.push(<Option value={RplMode[key].name} key={RplMode[key].name}>{RplMode[key].caption}</Option>);
      }   
    });
    return (
      <Modal
        title={record && record.billNumber  ? (rplLocale.title + "：" + record.billNumber) : '批量修改操作方式'}
        visible={visible}
        onOk={() => this.okHandle()}
        onCancel={() => this.handleCancel()}
      >
        <Form>
          {record && record.rplMode && <FormItem
            {...formItemLayout}
            label={rplLocale.currentMode}>
            <Col>{RplMode[record.rplMode].caption}</Col>
          </FormItem>}
          <FormItem
            {...formItemLayout}
            label={rplLocale.targetMode}>
            {form.getFieldDecorator('rplMode', {
              rules: [{
                required: true, message: notNullLocale(rplLocale.targetMode),
              }],
            })(
              <Select placeholder={placeholderChooseLocale(rplLocale.targetMode)}>{rplModeOptions}</Select>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
};
export default RplModifyModal;