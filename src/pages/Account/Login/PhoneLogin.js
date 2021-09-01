import React, { PureComponent } from 'react';
import { Form, Input, Checkbox, Button, Row, Col, message, } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import styles from './Login.less';
import { LOGIN_PAGE_KEY } from '@/utils/constants';
import verificationCode from '@/assets/login/ic_yanzhengma.svg';
import phone from '@/assets/login/ic_phone.svg';

const maxWaitSecond = 120;

@Form.create()
class PhoneLogin extends PureComponent {

  state = {
    captcheDisable: false,
    captcheText: formatMessage({ id: 'form.get-captcha' }),
    currentWaitSecond: maxWaitSecond,
  };

  okHandle = (e) => {
    e.preventDefault();
    const { form, handleSubmit } = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;

      handleSubmit(fieldsValue);
    });
  };

  handleGetCaptche = () => {
    const { form, checkUser } = this.props;

    form.validateFields(['phone'], {}, (err, values) => {
      if (err) return;
      // 校验用户是否存在
      checkUser(values.phone)
        .then(result => {
          if (result.success) {
            this.sendCaptcha(values.phone)
          }
        })
        .catch(reason => console.error(reason));

    });
  }

  /**
   * 发送验证码
   */
  sendCaptcha = (phone) => {
    const { onGetCaptcha } = this.props;
    const { currentWaitSecond, captcheDisable } = this.state;

    // 获取验证码
    onGetCaptcha(phone);

    this.setState({
      captcheDisable: true,
      captcheText: currentWaitSecond + formatMessage({ id: 'form.captcha.second' }),
    });

    this.interval = setInterval(() => {
      const { currentWaitSecond, captcheDisable } = this.state;
      if (currentWaitSecond == 0) {
        this.setState({
          captcheDisable: false,
          currentWaitSecond: maxWaitSecond,
          captcheText: formatMessage({ id: 'form.get-captcha' }),
        })
        clearInterval(this.interval);
      } else {
        let count = currentWaitSecond;
        count -= 1;
        this.setState({
          currentWaitSecond: count,
          captcheText: count + formatMessage({ id: 'form.captcha.second' }),
        })
      }
    }, 1000);
  }

  /**
   * 重置表单
   */
  resetForms = () => {
    this.props.form.resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator },
      handleSubmit,
      submitting: submitting,
      switchPage: switchPage,
      onGetCaptcha: onGetCaptcha,
    } = this.props;

    const {
      captcheText,
      captcheDisable,
    } = this.state;

    return (
      <div>
        <div className={styles.form}>
          <Form onSubmit={this.okHandle}>
            <Form.Item>
              {getFieldDecorator('phone', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'validation.phone-number.required' }),
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: formatMessage({ id: 'validation.phone-number.wrong-format' }),
                  },
                ],
              })(
                <Input placeholder={formatMessage({ id: 'form.phone-number.placeholder' })}
                  prefix={<img className={styles.inputPrefixFixed} src={phone} />}
                />
              )}
            </Form.Item>

            <Form.Item>
              <Row gutter={10}>
                <Col span={17}>
                  {getFieldDecorator('captcha', {
                    rules: [{ required: true, message: formatMessage({ id: 'validation.verification-code.required' }) }],
                  })(
                    <Input placeholder={formatMessage({ id: 'form.verification-code.placeholder' })}
                      prefix={<img className={styles.inputPrefixFixed} src={verificationCode} />}
                    />
                  )}
                </Col>
                <Col span={7}>
                  <Button disabled={captcheDisable} onClick={this.handleGetCaptche}>{captcheText}</Button>
                </Col>
              </Row>
            </Form.Item>

            <Button type="primary" loading={submitting} htmlType="submit" className={styles.loginButton}>
              <FormattedMessage id="app.login.login" />
            </Button>
          </Form>
        </div>
      </div>
    );
  }
}
export default PhoneLogin;
