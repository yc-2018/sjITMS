import { connect } from 'dva';
import React, { PureComponent } from 'react';
import { Select, Form, Input, Modal } from 'antd';
import AlcNtcBillNumberSelect from './AlcNtcBillNumberSelect';
import { formatMessage } from 'umi/locale';
import { containerState } from '@/utils/ContainerState';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';

const FormItem = Form.Item;
@Form.create()
@connect(({ alcNtc, pickup, loading }) => ({
  alcNtc, pickup,
  loading: loading.models.pickup,
}))
export default class AlcDtlBatchAdd extends PureComponent {
  handleCancel = () => {
    const { form, handleAlcModalVisible } = this.props;
    this.props.form.resetFields();
    const value = [];
    handleAlcModalVisible(value);
  };

  handleAlter = (e) => {
    console.log('选中值',e)
    e.preventDefault();
    const { form, handleRefreshAlc } = this.props;
    const { dataUp, dataDown } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue
      };
      handleRefreshAlc(values, dataUp, dataDown);
    });
  }

  getAlcNtcBill=(e, value)=>{
    this.props.dispatch({
      type: 'alcNtc/query',
      payload: {
        page: 0,
        pageSize: 10,
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid,
          billNumber: value && value.key ? value.key : '',
        }
      },
      callback: (response) => {
        if (response && response.success && response.data && response.data.records ) {
          let list = response.data.records[0];
          this.setState({
            dataUp: list
          })
          this.props.dispatch({
            type: 'pickup/pickupStockItem',
            payload: {
              uuid: list.uuid
            },
            callback: (response) => {
              if (response && response.success && response.data) {
                this.setState({
                  dataDown: response.data
                })
              }
            }
          });
        }
      }
    });
  }

  render() {
    const baseFormItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    const { alcModalVisible, ModalTitle } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal
        title={ModalTitle}
        onOk={this.handleAlter}
        visible={alcModalVisible}
        onCancel={this.handleCancel}
        destroyOnClose={true}
      >
        <div style={{ maxHeight: '200px', overflow: 'auto' }}>
          <Form>
            <FormItem {...baseFormItemLayout} label='配货通知单'>
              {
                getFieldDecorator('alcNtcBillNumberUuid', {
                  rules: [{
                    required: true,
                    message: '配货通知单不能为空',
                  }]
                })(
                  <AlcNtcBillNumberSelect
                    key="alcNtcBillNumberUuid"
                    label={'配货通知单'}
                    onChange = {this.getAlcNtcBill}
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
