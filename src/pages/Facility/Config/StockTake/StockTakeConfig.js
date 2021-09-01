import React, { Component } from 'react';
import {
  Form, TimePicker, Button, Input, message, Select, InputNumber
} from 'antd';
import { connect } from 'dva';
import { commonLocale, placeholderLocale, placeholderChooseLocale} from '@/utils/CommonLocale';
import { DecincState, stockTakeLocale } from './StockTakeLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

@connect(({ stockTakeConfig }) => ({
  stockTakeConfig
}))
@Form.create()
export default class StockTakeConfig extends Component {

  state = {
    submitting: false,
  }

  refresh = ()=>{
    const{dispatch} = this.props;
    dispatch({
      type:  'stockTakeConfig/getByDcUuid',
    });
  }

  componentDidMount() {
    this.refresh();
  }
  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      let entity = this.props.stockTakeConfig.data.entity;
      this.setState({
        submitting: true,
      })

      const values = {
        ...fieldsValue,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        version: entity ?  entity.version : 0 ,
      };

      this.props.dispatch({
        type: 'stockTakeConfig/saveOrUpdate',
        payload: values,
        callback: response => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
            this.refresh();
          } else {
            message.error(response.message);
          }

          this.setState({
            submitting: false,
          })
        }
      })
    });
  }
  render() {
    const {
      stockTakeConfig: { data },
      loading,
    } = this.props;


    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
    };

    return (
      <Form {...formItemLayout} onSubmit={this.handleSubmit}>
        <Form.Item
          label={stockTakeLocale.maxBins}
        >
          {getFieldDecorator('maxBins', {
            initialValue: data.entity ? data.entity.maxBins : 0,
            rules: [{ required: true, message: placeholderLocale() }],
          })(
            <InputNumber min='0' style={{width:200}}/>
          )}
        </Form.Item>
        <Form.Item
          label={stockTakeLocale.decincState}
        >
          {getFieldDecorator('decincState', {
            initialValue: data.entity ? data.entity.decincState : placeholderChooseLocale(),
            rules: [{ required: true, message: placeholderChooseLocale() }],
          })
            (
              <Select style={{width:200}}>
                <Select.Option key='APPROVED' value="APPROVED">{DecincState['APPROVED']}</Select.Option>
                <Select.Option key='UNAPPROVED' value="UNAPPROVED">{DecincState['UNAPPROVED']}</Select.Option>
              </Select>
            )
          }
        </Form.Item>

        <Form.Item
          wrapperCol={{
            xs: { span: 24, offset: 0 },
            sm: { span: 16, offset: 4 },
          }}
        >
          <Button loading={this.state.submitting} type="primary" htmlType="submit">{commonLocale.saveLocale}</Button>
        </Form.Item>

      </Form>
    );
  }
}