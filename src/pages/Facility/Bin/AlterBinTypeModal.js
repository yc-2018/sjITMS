import React, { PureComponent } from 'react';
import { Select, Form, Input, Modal, Tooltip, Icon } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import BinTypeSelect from '../../Component/Select/BinTypeSelect';
import { BIN_FACILITY } from '@/utils/constants';
import { commonLocale, notNullLocale, placeholderChooseLocale, placeholderLocale } from '@/utils/CommonLocale';
import { BinLocale } from './BinLocale';
import { binScopePattern } from '@/utils/PatternContants';
const { TextArea } = Input;

const FormItem = Form.Item;
@Form.create()
export default class AlterBinTypeModal extends PureComponent {
  state = {
    labeltext: ''
  }

  handleCancel = () => {
    const { form, handleAlterTypeModalVisible } = this.props;
    this.props.form.resetFields();
    handleAlterTypeModalVisible();
  };

  handleAlter = (e) => {
    e.preventDefault();
    const {
      form,
      handleSave,
      handleBacthSave,
      uuid,
      binFacilityType
    } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        uuid: uuid,
        type: binFacilityType
      };
      values['binType'] = JSON.parse(values['binType']);

      if(this.props.isBatchAlterType==true){
        let data = {
          binType:values.binType,
          binScope:values.binScope,
          binUsage:'',
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
    const { alterTypeModalVisible, confirmLoading, ModalTitle, uuid, code, binFacilityType,isBatchAlterType } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { labeltext } = this.state;

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
        visible={alterTypeModalVisible}
        onCancel={this.handleCancel}
        confirmLoading={confirmLoading}
        destroyOnClose={true}
      >
        <div style={{ maxHeight: '200px', overflow: 'auto' }}>
          <Form>
            {
              !isBatchAlterType
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
            <FormItem {...baseFormItemLayout} label={BinLocale.binType}>
              {
                getFieldDecorator('binType', {
                  rules: [{
                    required: true,
                    message: notNullLocale(BinLocale.binType),
                  }]
                })(
                  <BinTypeSelect onChange={this.onChange}
                                 placeholder={placeholderChooseLocale(BinLocale.binType)}
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
