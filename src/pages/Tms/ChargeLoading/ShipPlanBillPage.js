import React, { Component, Fragment } from 'react';
import {
  Form, Button, Input, message, Tabs, Select
} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { binViewPattern } from '@/utils/PatternContants';
import { configLocale } from '@/pages/Facility/Config/ConfigLocale';
import { commonLocale, notNullLocale, placeholderLocale,placeholderChooseLocale } from '@/utils/CommonLocale';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import { binUsage, getUsageCaption } from '@/utils/BinUsage';
import { binState, getStateCaption } from '@/utils/BinState';
import { STATE } from '@/utils/constants';

const { TabPane } = Tabs;

@connect(({ packageConfig, loading }) => ({
  packageConfig,
  loading: loading.models.packageConfig,
}))
@Form.create()
export default class PackageConfig extends Component {
  state = {
    submitting: false,
    entity: {},
  }

  componentDidMount = () => {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
  }
  refresh = () => {
    this.props.dispatch({
      type: 'packageConfig/get',
      payload: {
        dcUuid: loginOrg().uuid
      },
      callback: response => {
        if (response && response.success) {
          this.setState({
            entity: response.data ? response.data : null
          })
        }
      }
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { entity } = this.state;
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      this.setState({
        submitting: true,
      });
      let type = '';
      let values = null;
      if( entity && entity.uuid ) {
        type = 'packageConfig/modify';
        values = {
          dimension: fieldsValue.dimension,
          wrh: JSON.parse(fieldsValue.wrh),
          store: JSON.parse(fieldsValue.store),
          collectBinCode: JSON.parse(fieldsValue.collectBinCode).code,
          containerType: JSON.parse(fieldsValue.containerType),
          mixedLoad: fieldsValue.mixedLoad,
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid,
          uuid: entity.uuid
        };
      }  else {
        type = 'packageConfig/save';
        values = {
          dimension: fieldsValue.dimension,
          mixedLoad: fieldsValue.mixedLoad,
          wrh: JSON.parse(fieldsValue.wrh),
          store: JSON.parse(fieldsValue.store),
          collectBinCode: JSON.parse(fieldsValue.collectBinCode).code,
          containerType: JSON.parse(fieldsValue.containerType),
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        };
      }
      this.props.dispatch({
        type: type,
        payload: values,
        callback: response => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
            this.refresh();
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
      entity, responseError, responseMsg
    } = this.state;

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
      <div>
        <Tabs>
          <TabPane tab={'排车单信息'} key="1">
            <div>
              <Form {...formItemLayout}>
                <Form.Item
                  label={'刷卡人'}
                >
                  {getFieldDecorator('wrh', {
                    initialValue: entity && entity.wrh ? JSON.stringify(entity.wrh) : undefined,
                    rules: [
                      { required: true, message: notNullLocale('刷卡人') }
                    ],
                  })(
                    <Input style={{'width':'30%'}} onPressEnter={this.onSubmit} placeholder={placeholderLocale("输入员工代码")}/>
                  )}
                </Form.Item>
                <Form.Item
                  label={'刷卡提示:'}
                >
                  {getFieldDecorator('dimension', {
                    initialValue: entity && entity.dimension ? entity.dimension : ''
                  })(
                    <Input.TextArea style={responseError ? { color: '#F5222D',width:'30%' } : {width:'30%'}} value={responseMsg}  rows={2}/>
                  )}
                </Form.Item>
                <Form.Item
                  label={'刷卡人'}
                >
                  {getFieldDecorator('wrh', {
                    initialValue: entity && entity.wrh ? JSON.stringify(entity.wrh) : undefined
                  })(
                    <Input style={{'width':'30%'}} onPressEnter={this.onSubmit} placeholder={placeholderLocale("输入员工代码")}/>
                  )}
                </Form.Item>
                <Form.Item
                  label={'刷卡提示:'}
                >
                  {getFieldDecorator('dimension', {
                    initialValue: entity && entity.dimension ? entity.dimension : '',
                  })(
                    <Input.TextArea style={responseError ? { color: '#F5222D',width:'30%' } : {width:'30%'}} value={responseMsg}  rows={2}/>
                  )}
                </Form.Item>
                <Form.Item
                  label={'刷卡人'}
                >
                  {getFieldDecorator('wrh', {
                    initialValue: entity && entity.wrh ? JSON.stringify(entity.wrh) : undefined,
                    rules: [
                      { required: true, message: notNullLocale('刷卡人') }
                    ],
                  })(
                    <Input style={{'width':'30%'}} onPressEnter={this.onSubmit} placeholder={placeholderLocale("输入员工代码")}/>
                  )}
                </Form.Item>
                <Form.Item
                  label={'刷卡提示:'}
                >
                  {getFieldDecorator('dimension', {
                    initialValue: entity && entity.dimension ? entity.dimension : '',
                  })(
                    <Input.TextArea style={responseError ? { color: '#F5222D',width:'30%' } : {width:'30%'}} value={responseMsg}  rows={2}/>
                  )}
                </Form.Item>
                <Form.Item
                  label={'刷卡人'}
                >
                  {getFieldDecorator('wrh', {
                    initialValue: entity && entity.wrh ? JSON.stringify(entity.wrh) : undefined,
                    rules: [
                      { required: true, message: notNullLocale('刷卡人') }
                    ],
                  })(
                    <Input style={{'width':'30%'}} onPressEnter={this.onSubmit} placeholder={placeholderLocale("输入员工代码")}/>
                  )}
                </Form.Item>
                <Form.Item
                  label={'刷卡提示:'}
                >
                  {getFieldDecorator('dimension', {
                    initialValue: entity && entity.dimension ? entity.dimension : '',
                  })(
                    <Input.TextArea style={responseError ? { color: '#F5222D',width:'30%' } : {width:'30%'}} value={responseMsg}  rows={2}/>
                  )}
                </Form.Item>
                <Form.Item
                  label={'刷卡人'}
                >
                  {getFieldDecorator('wrh', {
                    initialValue: entity && entity.wrh ? JSON.stringify(entity.wrh) : undefined,
                    rules: [
                      { required: true, message: notNullLocale('刷卡人') }
                    ],
                  })(
                    <Input style={{'width':'30%'}} onPressEnter={this.onSubmit} placeholder={placeholderLocale("输入员工代码")}/>
                  )}
                </Form.Item>
                <Form.Item
                  label={'刷卡提示:'}
                >
                  {getFieldDecorator('dimension', {
                    initialValue: entity && entity.dimension ? entity.dimension : '',
                  })(
                    <Input.TextArea style={responseError ? { color: '#F5222D',width:'30%' } : {width:'30%'}} value={responseMsg}  rows={2}/>
                  )}
                </Form.Item>
              </Form>
            </div>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}
