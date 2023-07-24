import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Icon } from 'antd';
import { loginUser } from '@/utils/LoginContext';
import { formatMessage } from 'umi/locale';
const FormItem = Form.Item;

@connect(state => ({
  login: state.login,
}))
@Form.create()
export default class ModifyPasswd extends Component {
  state = {
    ...this.props,
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields({ force: true },
      (err, values) => {
        if (!err) {
          this.props.modifyPasswd({
            ...values,
            userUuid: loginUser().uuid
          });
        }
      }
    );
  }

  checkPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('newPassword')) {
      callback(formatMessage({ id: 'user.modify.twice.pwd.not.same' }));
    } else {
      callback();
    }
  }

  handledCancle = () => {
    this.props.form.resetFields();
    this.props.hideModifyModal();
  }

  componentWillReceiveProps(nextProps) {
    this.setState(
      { modifyPasswdModalVisible: nextProps.modifyPasswdModalVisible }
    )
  }

  render() {
    const { modifyPasswdModalVisible } = this.state;
    const { form, confirmLoading, compel } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 15 },
    };
    return (
      <Modal
        title={formatMessage({ id: compel ? 'menu.account.modify.compel' : 'menu.account.modify' })}
        visible={modifyPasswdModalVisible}
        onOk={this.handleSubmit}
        onCancel={() => this.handledCancle()}
        destroyOnClose={!compel}
        maskClosable={!compel}
        closable={!compel}
        keyboard={!compel}
        cancelButtonProps={{ disabled: !!compel }}
        confirmLoading={confirmLoading}
      >
        <div>
          <Form>
            <FormItem
              {...formItemLayout}
              label={formatMessage({ id: 'user.modify.old.password.label' })}>
              {getFieldDecorator('oldPassword', {
                initialValue: '',
                rules: [{
                  required: true, message: formatMessage({ id: 'user.modify.old.password' }),
                }, {
                  // pattern: /^[\x21-\x7E]{5,16}$/, message: formatMessage({ id: 'user.modify.ckeckPassword' }),
                }],
              })(
                <Input
                  prefix={<Icon type="lock" />}
                  type="password"
                  placeholder={formatMessage({ id: 'user.modify.old.password' })}
                />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={formatMessage({ id: 'user.modify.new.password.label' })}>
              {getFieldDecorator('newPassword', {
                initialValue: '',
                rules: [{
                  required: true, message: formatMessage({ id: 'user.modify.new.password' }),
                }, {
                  pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}$/, message: formatMessage({ id: 'user.modify.ckeckPassword' }),
                }]
              })(
                <Input
                  prefix={<Icon type="lock" />}
                  type="password"
                  placeholder={formatMessage({ id: 'user.modify.new.password' })}
                />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={formatMessage({ id: 'form.confirm-password.placeholder' })}>
              {getFieldDecorator('confirmPassword', {
                initialValue: '',
                rules: [{
                  required: true, message: formatMessage({ id: 'user.modify.new.password.sure' }),
                }, {
                  validator: this.checkPassword
                }],
              })(
                <Input
                  prefix={<Icon type="lock" />}
                  type="password"
                  placeholder={formatMessage({ id: 'user.modify.new.password.sure' })}
                />
              )}
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
}