import React, { PureComponent } from 'react';
import { Select, Form, Input, Modal, Tooltip, Icon } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import BinUsageSelect from '../../Component/Select/BinUsageSelect';
import { BIN_FACILITY } from '@/utils/constants';
import { commonLocale, notNullLocale, placeholderChooseLocale, placeholderLocale } from '@/utils/CommonLocale';
import { BinLocale } from './BinLocale';
import { binScopePattern } from '@/utils/PatternContants';
const { TextArea } = Input;

const FormItem = Form.Item;
@Form.create()
export default class AlterBinUsageModal extends PureComponent {

  handleCancel = () => {
    const { form, handleAlterUsageModalVisible } = this.props;
    this.props.form.resetFields();
    handleAlterUsageModalVisible();
  };

  handleAlter = (e) => {
    e.preventDefault();
    const {
      form,
      handleSave,
      binFacilityType,handleBacthSave,
      uuid
    } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        uuid: uuid,
        type: binFacilityType
      };
      if(this.props.isBatchAlterUsage==true){
        let data = {
          binUsage:values.usage,
          binScope:values.binScope,
          binType:{}
        }
        handleBacthSave(data);
      }else{
        handleSave(values);

      }
    });
  }

  render() {
    const baseFormItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    const { alterUsageModalVisible, confirmLoading, ModalTitle, uuid, code, binFacilityType,isBatchAlterUsage } = this.props;
    const { getFieldDecorator } = this.props.form;

    const binFacilityTypeLocale = {
      'ZONE': '货区',
      'PATH': '货道',
      'SHELF': '货架',
      'BIN': '货位',
    }
    const textInfo = binFacilityTypeLocale[binFacilityType];

    return (
      <Modal
        title={ModalTitle}
        onOk={this.handleAlter}
        visible={alterUsageModalVisible}
        onCancel={this.handleCancel}
        confirmLoading={confirmLoading}
        destroyOnClose={true}
      >
        <div style={{ maxHeight: '200px', overflow: 'auto' }}>
          <Form>
            {
              !isBatchAlterUsage
                ?
                <FormItem {...baseFormItemLayout} label={textInfo}>
                  <span>{code}</span>
                </FormItem>:
                <FormItem {...baseFormItemLayout} label={(
                  <span>
                                  {'货位范围'}&nbsp;
                    <Tooltip title={binScopePattern.message}>
                                    <Icon type="info-circle" />
                                  </Tooltip>
                                </span>
                )}>
                  {
                    getFieldDecorator('binScope', {
                      // initialValue: entity.binScope,
                      rules: [
                        {
                          required: true,
                          message: notNullLocale('货位范围')
                        },
                        {
                          pattern: binScopePattern.pattern,
                          message: binScopePattern.message
                        }
                      ]
                    })(<TextArea rows={2} placeholder={placeholderLocale('货位范围')} />)
                  }
                </FormItem>
            }

            <FormItem {...baseFormItemLayout} label={BinLocale.binUasge}>
              {
                getFieldDecorator('usage', {
                  rules: [{
                    required: true,
                    message: notNullLocale(BinLocale.binUasge),
                  }]
                })(
                  <BinUsageSelect onChange={this.onChange}
                                  placeholder={placeholderChooseLocale(BinLocale.binUasge)} />
                )
              }
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
}
