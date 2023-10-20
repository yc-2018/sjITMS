import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Form, Icon, Input, Button, Checkbox } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import login from '@/assets/login/bmsCalc.jpg';
import { setCookie, clearCookie, getCookie } from '@/utils/Cookies';
import './bmsLogin.less';
@connect(({ login }) => ({ login }))
@Form.create()
export default class LoginPage extends PureComponent {
  state = {
    captcha: {},
    autoLogin: true,
  };
  componentDidMount() {
    this.getImageCaptcha();
    const cookies = document.cookie.split(';');
    let lastLoginCookie;
    if (cookies) {
      cookies.forEach(e => {
        if (e.indexOf('user_') >= 0) {
          lastLoginCookie = e;
        }
      });
    }

    if (lastLoginCookie) {
      while (lastLoginCookie.charAt(0) == ' ') lastLoginCookie = lastLoginCookie.substring(1);
      let nameAndValues = lastLoginCookie.split('=');
      if (nameAndValues) {
        let loginAccount = nameAndValues[0].substring(5);
        let password = getCookie(loginAccount);
        this.props.form.setFieldsValue({
          loginAccount: loginAccount,
          password: password,
        });
      }
    }
  }
  /**
   * 获取图形验证码
   */
  getImageCaptcha = () => {
    const { dispatch } = this.props;

    dispatch({
      type: 'captcha/getCaptcha',
      payload: {},
      callback: response => {
        if (response && response.success) {
          this.setState({ captcha: response.data });
        }
      },
    });
  };

  /**
   * 绘制验证码部分
   */
  getCaptcha = () => {
    const { captcha } = this.state;
    if (captcha != 'timeout' && Object.keys(captcha).length != 0) {
      return (
        <div>
          <img
            src={captcha.img}
            title={formatMessage({ id: 'app.login.change-captcha' })}
            onClick={this.getImageCaptcha}
          />
          <a href="#" onClick={this.getImageCaptcha}>
            {formatMessage({ id: 'app.login.change-captcha' })}
          </a>
        </div>
      );
    } else if (captcha != 'timeout' && Object.keys(captcha).length == 0) {
      return <Icon type="loading" style={{ fontSize: '20px', color: '#08c' }} />;
    } else if (captcha == 'timeout') {
      return <Icon type="close" style={{ fontSize: '10px', color: 'red' }} />;
    }
  };

  //登录点击事件
  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    const { captcha } = this.state;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;

      const data = {
        ...fieldsValue,
        captchaKey: captcha.id,
      };
      this.handleAccountSubmit(data);
    });
  };

  //登录
  handleAccountSubmit = values => {
    const { dispatch } = this.props;
    const { autoLogin } = this.state;

    // 验证图片验证码
    dispatch({
      type: 'captcha/verifyCaptcha',
      payload: values,
      callback: verifyResponse => {
        if (verifyResponse && verifyResponse.success) {
          // 登录
          dispatch({
            type: 'login/accountLogin',
            payload: { ...values },
            callback: response => {
              if (response && response.success) {
                clearCookie(values.loginAccount);
                if (autoLogin) {
                  setCookie(values.loginAccount, values.password, 30);
                }
              }
            },
          });
        }
      },
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Row
        style={{
          height: 600,
          position: 'relative',
          background: `url(${login}) no-repeat `,
          backgroundSize: 'cover',
        }}
      >
        <Col span={10} style={{ backgroundColor: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
          {/* <div
            style={{
              height: 100,
              marginTop: 50,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            111
          </div> */}
        </Col>
        <Col span={4} />

        <Col span={10} style={{ backgroundColor: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
          <div
            style={{
              height: 100,
              marginTop: 50,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontFamily: '华文中宋,PingFang SC',
                fontWeight: 'bold',
              }}
            >
              时捷费用管理
            </div>
            <div
              style={{
                fontSize: 18,
                userSelect: 'none',
                backgroundImage: 'linear-gradient(to right,#2857bd,#f5222d)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Billing Management System
            </div>
          </div>
          <Form onSubmit={this.handleSubmit} style={{ height: 360, margin: '40px 50px 0' }}>
            <Form.Item>
              {getFieldDecorator('loginAccount', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'validation.user.required' }),
                  },
                ],
              })(
                <Input
                  prefix={<Icon type="user" style={{ marginLeft: -5 }} />}
                  style={{ height: 40, fontSize: 18 }}
                  size="large"
                  placeholder={formatMessage({ id: 'app.login.user' })}
                />
              )}
            </Form.Item>
            <Form.Item style={{ marginTop: 10 }}>
              {getFieldDecorator('password', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'validation.password.required' }),
                  },
                ],
              })(
                <Input.Password
                  prefix={<Icon type="lock" style={{ marginLeft: -5 }} />}
                  style={{ height: 40, fontSize: 18 }}
                  size="large"
                  password
                  placeholder={formatMessage({ id: 'app.login.password' })}
                />
              )}
            </Form.Item>
            <Row gutter={10} style={{ marginTop: 10 }}>
              <Col span={17}>
                <Form.Item>
                  {getFieldDecorator('imageCaptcha', {
                    rules: [
                      {
                        required: true,
                        message: formatMessage({ id: 'validation.verification-code.required' }),
                      },
                    ],
                  })(
                    <Input
                      prefix={<Icon type="safety-certificate" style={{ marginLeft: -5 }} />}
                      style={{ height: 40, fontSize: 18 }}
                      size="large"
                      password
                      placeholder={formatMessage({ id: 'form.verification-code.placeholder' })}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={7}>{this.getCaptcha()}</Col>
            </Row>

            <Row type="flex" justify="space-between">
              <Col span={8}>
                <Form.Item>
                  {getFieldDecorator('remember', {
                    valuePropName: 'checked',
                    initialValue: true,
                  })(
                    <Checkbox>
                      <FormattedMessage id="app.login.remember-me" />
                    </Checkbox>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                {/* <a className="login-form-forgot" href="">
                  <FormattedMessage id="app.login.forgot-password" />
                </a> */}
              </Col>
            </Row>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                width: '100%',
                height: 40,
                marginTop: 10,
                backgroundColor: '#FF9224',
                borderColor: '#FF9224',
              }}
            >
              <FormattedMessage id="app.login.login" />
            </Button>
          </Form>
          <div
            style={{ height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            广东时捷物流有限公司 版权所有
          </div>
        </Col>
      </Row>
    );
  }
}
