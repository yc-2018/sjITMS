import React, { PureComponent } from 'react';
import { Form, Input, Checkbox, Button, Row, Col, message, Icon } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import styles from './Login.less';
import { getCookie } from '@/utils/Cookies';
import { LOGIN_PAGE_KEY, CAPTCHA_KEY } from '@/utils/constants';
import homeUser from '@/assets/login/ic_homeuser.svg';
import passwordIcon from '@/assets/login/ic_mima.svg';
import verificationCode from '@/assets/login/ic_yanzhengma.svg';
import phone from '@/assets/login/ic_phone.svg';

@Form.create()
class AccountLogin extends PureComponent {

  componentDidMount() {
    this.loadImageCaptche();

    const cookies = document.cookie.split(';');
    let lastLoginCookie;
    if (cookies) {
      cookies.forEach(e => {
        if (e.indexOf("user_") >= 0) {
          lastLoginCookie = e;
        }
      });
    }

    if (lastLoginCookie) {
      while (lastLoginCookie.charAt(0) == ' ') lastLoginCookie = lastLoginCookie.substring(1);
      let nameAndValues = lastLoginCookie.split("=");
      if (nameAndValues) {
        let loginAccount = nameAndValues[0].substring(5);
        let password = getCookie(loginAccount);
        this.props.form.setFieldsValue({
          loginAccount: loginAccount,
          password: password
        });
      }
    }
  }

  okHandle = (e) => {
    e.preventDefault();
    const { form, handleSubmit, captcha } = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;

      const data = {
        ...fieldsValue,
        captchaKey: captcha.id,
      };
      handleSubmit(data);
    });
  };

  /**
   * 重置表单
   */
  resetForms = () => {
    this.props.form.resetFields();
  }

  loadImageCaptche = () => {
    const { getImageCaptcha } = this.props;
    getImageCaptcha();
  }

  onLoginAccountChange = (e) => {
    let password = getCookie(e.target.value);
    this.props.form.setFieldsValue({
      password: password
    });
  }

  /**
   * 绘制验证码部分
   */
  getCaptcha=()=>{
    const {
      captcha: captcha,
    } = this.props;
    if(captcha!='timeout'&&Object.keys(captcha).length != 0){
      return(
        <div>
        <img src={captcha.img}
          title={formatMessage({ id: 'app.login.change-captcha' })}
          onClick={this.loadImageCaptche} />
        <a href="#" onClick={this.loadImageCaptche}>
          {formatMessage({ id: 'app.login.change-captcha' })}
        </a>
      </div>
      )
    }else if(captcha!='timeout'&&Object.keys(captcha).length == 0){
      return <Icon type="loading" style={{ fontSize: '20px', color: '#08c' }} />
    }else if(captcha=='timeout'){
      return <Icon type="close" style={{ fontSize: '10px', color: 'red' }} />
    }
  }
  render() {
    const {
      form: { getFieldDecorator },
      handleSubmit,
      changeAutoLogin,
      showForgetPwd,
      autoLogin: autoLogin,
      submitting: submitting,
      switchPage: switchPage,
      getImageCaptcha: getImageCaptcha,
      captcha: captcha,
    } = this.props;
    
    return (
      <div>
        <div className={styles.form}>
          <Form onSubmit={this.okHandle} autoComplete="off">
            <Form.Item>
              {getFieldDecorator('loginAccount', {
                rules: [{ required: true, message: formatMessage({ id: 'validation.loginAccount.required' }) }],
              })(
                <Input onChange={this.onLoginAccountChange} placeholder={formatMessage({ id: 'app.login.userName' })}
                  prefix={<img className={styles.inputPrefixFixed} src={homeUser} />}
                />
              )}
            </Form.Item>

            <Form.Item>
              {getFieldDecorator('password', {
                rules: [{ required: true, message: formatMessage({ id: 'validation.password.required' }) }],
              })(
                <Input type='password' prefix={<img className={styles.inputPrefixFixed} src={passwordIcon} />}
                  placeholder={formatMessage({ id: 'app.login.password' })} />
              )}
            </Form.Item>

            <Form.Item>
              <Row gutter={10}>
                <Col span={17}>
                  {getFieldDecorator('imageCaptcha', {
                    rules: [
                      { required: true, message: formatMessage({ id: 'validation.verification-code.required' }) },
                      {
                        pattern: /^\w+$/,
                        message: '验证码只能包含数字和英文字母'
                      },
                    ],
                  })(
                    <Input placeholder={formatMessage({ id: 'form.verification-code.placeholder' })}
                      prefix={<img className={styles.inputPrefixFixed} src={verificationCode} />}
                    />
                  )}
                </Col>
                <Col span={7}>
                  <div className={styles.imageCaptcha}>
                    {this.getCaptcha()}
                  </div>
                </Col>
              </Row>
            </Form.Item>

            <div className={styles.operate}>
              <Checkbox checked={autoLogin} onChange={changeAutoLogin}>
                <FormattedMessage id="app.login.remember-me" />
              </Checkbox>
            </div>

            <Button type="primary" loading={submitting} htmlType="submit" className={styles.loginButton}>
              <FormattedMessage id="app.login.login" />
            </Button>
          </Form>
        </div>
      </div>
    );
  }
}
export default AccountLogin;
