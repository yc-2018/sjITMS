import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Modal, message, Input, Select } from 'antd';
import { formatMessage } from 'umi/locale';
import BinSelect from '@/pages/Component/Select/BinSelect';
import { commonLocale, placeholderChooseLocale, placeholderLocale } from '@/utils/CommonLocale';
import { binScopePattern } from '@/utils/PatternContants';
import DockGroupSelect from '@/pages/Component/Select/DockGroupSelect';
import PickareaSelect from '@/pages/Component/Select/PickareaSelect';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import { PRETYPE } from '@/utils/constants';

@connect(({ alcNtcBillConfig, loading }) => ({
  alcNtcBillConfig,
  loading: loading.models.alcNtcBillConfig,
}))
@Form.create()
export default class AlcNtcBillConfigCreateModal extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isUnify: true,
      isOnestepcross: true,
    }
  }

  okHandle = () => {
    const { form } = this.props;

    form.validateFields((errors, fieldsValue) => {
      if (errors) return;

      let data = {
        ...fieldsValue,
        companyUuid:loginCompany().uuid,
        dcUuid:loginOrg().uuid,
      }
      this.props.dispatch({
        type:'alcNtcBillConfig/save',
        payload:data,
        callback:response=>{
          if(response&&response.success){
            this.props.handleCreateModalVisible();
            this.props.refreshTable();
          }
        }
      })
      
    });
  };

  handleCancel = () => {
    const { form, handleCreateModalVisible } = this.props;
    this.setState({
      isUnify: true,
      isOnestepcross: true,
    });
    form.resetFields();
    handleCreateModalVisible();
  };


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
          <Form.Item label={'配单类型'} >
            {getFieldDecorator('alcntcType', {
              initialValue: entity ? entity.alcntcType : null,
              rules: [{ required: true, message: placeholderChooseLocale('配单类型') }],
            })(
              <PreTypeSelect 
                placeholder={placeholderLocale('配单类型')}
                mode ={'single'}  
                preType={PRETYPE.alcNtcType}
                orgUuid={loginOrg().uuid}
            />
            )}
          </Form.Item>
         
        </Form>
      </Modal>
    );
  }
};
