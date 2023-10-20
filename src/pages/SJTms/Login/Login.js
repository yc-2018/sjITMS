/*
 * @Author: guankongjin
 * @Date: 2022-06-23 11:40:41
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-10-19 11:35:07
 * @Description: 登录页
 * @FilePath: \iwms-web\src\pages\SJTms\Login\Login.js
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Form, Icon, Input, Button, Tabs, Checkbox } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import login from '@/assets/login/login.png';
import { setCookie, clearCookie, getCookie } from '@/utils/Cookies';
import DingTalkRqCodeLogin from './DingTalkRqCodeLogin'
import styles from './Login.less';

const { TabPane } = Tabs;

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
        className={styles.loginCell}
        style={{
          position: 'relative',
          background: `url(${login}) no-repeat `,
          backgroundSize: 'cover',
        }}
      >
        <Col span={14} />
        <Col span={10} style={{ backgroundColor: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
          <div className={styles.loginHeaderCell}>
            <div className={styles.loginHeaderCn}>时捷运输管理系统</div>
            <div className={styles.loginHeaderUs}>Transport Management System</div>
          </div>
          <Tabs defaultActiveKey="1">
            <TabPane tab="账号登录" key="1">
              <Form onSubmit={this.handleSubmit} className={styles.loginForm}>
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
                  style={{ width: '100%', height: 40, marginTop: 10 }}
                >
                  <FormattedMessage id="app.login.login" />
                </Button>
              </Form>
            </TabPane>
            <TabPane tab="钉钉登录" key="2">
              {DingTalkRqCodeLogin(this.props.dispatch)}
            </TabPane>
          </Tabs>
          <div className={styles.copyRight}>广东时捷物流有限公司 版权所有</div>
        </Col>
      </Row>
    );
  }
}
