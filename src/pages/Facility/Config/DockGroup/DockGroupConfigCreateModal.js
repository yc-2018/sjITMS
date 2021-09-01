import React, { PureComponent } from 'react';
import { Form, Modal, message, Input, Select } from 'antd';
import { formatMessage } from 'umi/locale';
import BinSelect from '@/pages/Component/Select/BinSelect';
import { commonLocale, placeholderChooseLocale, placeholderLocale } from '@/utils/CommonLocale';
import { dockGroupConfigLocale } from './DockGroupConfigLocale';
import { binUsage } from '@/utils/BinUsage';
import { binScopePattern } from '@/utils/PatternContants';
import DockGroupSelect from '@/pages/Component/Select/DockGroupSelect';
import PickareaSelect from '@/pages/Component/Select/PickareaSelect';
import { LogisticMode } from './DockGroupContants';
import DockGroupCollectBinSelect from '@/pages/Component/Select/DockGroupCollectBinSelect';

const logisticModeOptions = [];
Object.keys(LogisticMode).forEach(function (key) {
  logisticModeOptions.push(<Select.Option key={LogisticMode[key].name} value={LogisticMode[key].name}>{LogisticMode[key].caption}</Select.Option>);
});
@Form.create()
export default class DockGroupConfigCreateModal extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isUnify: true,
      isOnestepcross: true,
      isLikepcross: false,
    }
  }

  okHandle = () => {
    const { form } = this.props;

    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      this.props.handleSave(fieldsValue).then(response=>{
        if(response.success){
          this.setState({
            isUnify: true,
            isOnestepcross: true,
            isLikepcross: false,
          });
        }
      });
      
    });
  };

  handleCancel = () => {
    const { form, handleCreateModalVisible } = this.props;
    this.setState({
      isUnify: true,
      isOnestepcross: true,
      isLikepcross: false,
    });
    form.resetFields();
    handleCreateModalVisible();
  };

  toChooseLogisticsType = (type) => {
    if (type == LogisticMode.UNIFY.name) {
      this.setState({
        isUnify: true,
        isOnestepcross: true,
        isLikepcross: false,
      });
    } else {
      this.setState({
        isUnify: false,
        isLikepcross: false,
      });
      if (type == LogisticMode.ONESTEPCROSS.name) {
        this.setState({
          isOnestepcross: true,
          isLikepcross: false,
        });
      } else {
        this.setState({
          isOnestepcross: false,
          isLikepcross: false,
        });
      }
    }
  }

  render() {
    const {
      form,
      modalVisible,
      entity,
    } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };



    return (
      <Modal
        title={commonLocale.createLocale}
        visible={modalVisible}
        onOk={this.okHandle}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <Form {...formItemLayout}>
          <Form.Item label={dockGroupConfigLocale.dockGroup} >
            {getFieldDecorator('dockGroup', {
              initialValue: entity ? entity.dockGroup : null,
              rules: [{ required: true, message: placeholderChooseLocale(dockGroupConfigLocale.dockGroup) }],
            })(<DockGroupCollectBinSelect autoFocus placeholder={placeholderChooseLocale(dockGroupConfigLocale.dockGroup)} />)}
          </Form.Item>

          <Form.Item label={dockGroupConfigLocale.logisticsType} >
            {getFieldDecorator('logisticsType', {
              initialValue: LogisticMode.UNIFY.name,
              rules: [{ required: true, message: placeholderChooseLocale(dockGroupConfigLocale.logisticsType) }],
            })(<Select onChange={(e) => this.toChooseLogisticsType(e)}
              placeholder={placeholderChooseLocale(dockGroupConfigLocale.logisticsType)} >
              {logisticModeOptions}
            </Select>)}
          </Form.Item>

          {this.state.isUnify == true ? <Form.Item label={dockGroupConfigLocale.pickarea}>
            {getFieldDecorator('pickarea', {
              initialValue: entity ? entity.pickarea : null,
              rules: [{ required: true, message: placeholderChooseLocale(dockGroupConfigLocale.pickarea) }],
            })(<PickareaSelect placeholder={placeholderChooseLocale(dockGroupConfigLocale.pickarea)} multiple={true} />)}
          </Form.Item> : this.state.isOnestepcross ? <Form.Item label={dockGroupConfigLocale.sourceRange}>
            {getFieldDecorator('sourceRange', {
              initialValue: entity ? entity.sourceRange : null,
              rules: [{ required: true, message: placeholderLocale(dockGroupConfigLocale.onstep) },
              {
                pattern: binScopePattern.pattern,
                message: binScopePattern.message,
              }],
            })(<Input placeholder={placeholderLocale(dockGroupConfigLocale.onstep)} />)}
          </Form.Item> : <Form.Item label={dockGroupConfigLocale.sourceRange}>
                {getFieldDecorator('sourceRange', {
                  initialValue: entity ? entity.sourceRange : null,
                  rules: [{ required: true, message: placeholderLocale(dockGroupConfigLocale.twostep) },
                  {
                    pattern: binScopePattern.pattern,
                    message: binScopePattern.message,
                  }],
                })(<Input placeholder={placeholderLocale(dockGroupConfigLocale.twostep)} />)}
              </Form.Item>
          }
        </Form>
      </Modal>
    );
  }
};
