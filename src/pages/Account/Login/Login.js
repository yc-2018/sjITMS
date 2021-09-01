import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import Link from 'umi/link';
import { Checkbox, Alert, Icon, Input, Button, Form, Row, Col, message } from 'antd';
import Login from '@/components/Login';
import styles from './Login.less';
import AccountLogin from './AccountLogin';
import PhoneLogin from './PhoneLogin';
import { LOGIN_PAGE_KEY, CAPTCHA_KEY } from '@/utils/constants';
import configs from '@/utils/config';
import logo from '@/assets/logo.svg';
import loginSvg from '@/assets/login/login_bg.svg';
import { setCookie, clearCookie, getCookie } from '@/utils/Cookies';
import { } from '@/utils/CommonLocale';
import {isLogin, iterateAllData, getMenuLayout} from '@/utils/LoginContext';

@connect(({ login }) => ({
  login,
}))
@Form.create()
class LoginPage extends Component {
  state = {
    type: 'account',
    autoLogin: true,
    showAccountLogin: true,
    showPhoneLogin: false,
    captcha: {},
    loginErrorMsg: '',
    verifyCaptchaStatus: true,
  };

  componentDidMount() {
    iterateAllData(() => {
      if (isLogin()) {
        this.props.dispatch(routerRedux.push({
          pathname: '/',
        }));
      }
    });
  }

  onTabChange = type => {
    this.setState({ type });
  };

  /**
   * 获取手机验证码
   */
  onGetCaptcha = (phone) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'sms/sendLoginCaptcha',
      payload: phone,
    })
  }

  /**
   * 处理账户登录
   */
  handleAccountSubmit = (values) => {
    const { dispatch } = this.props;
    const { autoLogin } = this.state;

    // 验证图片验证码
    dispatch({
      type: 'captcha/verifyCaptcha',
      payload: values,
      callback: response => {
        if (response && response.success) {
          // 登录
          dispatch({
            type: 'login/accountLogin',
            payload: {
              ...values,
            },
            callback: (response) => {
              if (response && response.success) {
                if (autoLogin) {
                  clearCookie(values.loginAccount);
                  setCookie(values.loginAccount, values.password, 30);
                } else {
                  clearCookie(values.loginAccount);
                }
              }
            }
          });
        } else {
          this.setState({
            verifyCaptchaStatus: false,
          })
          this.updateAccountErrorMsg(response.message);
        }
      }
    });
  };

  /**
   * 处理手机登录
   */
  handlePhoneSubmit = (values) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'login/phoneLogin',
      payload: {
        ...values,
      }
    });
  }

  changeAutoLogin = e => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };

  /**
   * 切换页面
   */
  switchPage = (key) => {
    switch (key) {
      case LOGIN_PAGE_KEY['phoneLogin']:
        this.setState({
          showPhoneLogin: true,
          showAccountLogin: false,
          showForgetPwd: false,
          loginErrorMsg: '',
        });
        this.onTabChange('mobile');
        break;
      case LOGIN_PAGE_KEY['accountLogin']:
        this.setState({
          showPhoneLogin: false,
          showAccountLogin: true,
          showForgetPwd: false,
          loginErrorMsg: '',
        });
        this.onTabChange('account');
        break;
      default:
        console.error('错误的key');
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
          if (response.data) {
            this.setState({
              captcha: response.data,
            })
            this.updateAccountErrorMsg('');
          }
        } else {
          this.updateAccountErrorMsg(response.message);
        }
      }
    });
  }

  /**
   * 检测phone是否存在
   */
  checkUser = (phone) => {
    const { dispatch } = this.props;

    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'user/checkByPhone',
        payload: phone,
        callback: response => {
          if (response && response.success) {
            if (response.data) {
              resolve({
                success: true,
              });
            } else {
              message.error(formatMessage({ id: 'app.login.user.not.exist' }));
              resolve({
                success: false,
              });
            }
          } else {
            resolve({
              success: false
            });
          }
        }
      })
    });
  }

  /**
   * 更新登录错误信息
   */
  updateAccountErrorMsg = (msg) => {
    this.setState({
      loginErrorMsg: msg,
    })
  }

  renderMessage = content => (
    <div className={styles.errorMsg}>{content}</div>
  );

  render() {
    const { login, dispatch } = this.props;
    const { getFieldDecorator } = this.props.form;
    const {
      type,
      autoLogin,
      showAccountLogin,
      showPhoneLogin,
      captcha,
      loginErrorMsg,
      verifyCaptchaStatus,
    } = this.state;

    const accountLoginMethods = {
      handleSubmit: this.handleAccountSubmit,
      changeAutoLogin: this.changeAutoLogin,
      showForgetPwd: this.showForgetPwd,
      switchPage: this.switchPage,
      getImageCaptcha: this.getImageCaptcha,
    };

    const accountLoginProps = {
      autoLogin: autoLogin,
      submitting: login.submitting,
      captcha: captcha,
    }

    const phoneLoginMethods = {
      handleSubmit: this.handlePhoneSubmit,
      onGetCaptcha: this.onGetCaptcha,
      switchPage: this.switchPage,
      checkUser: this.checkUser
    };

    const phoneLoginProps = {
      submitting: login.submitting,
    }

    return (
      <div className={styles.main}>
        <div className={styles.cards} style={{ background: `url(${loginSvg}) no-repeat `, backgroundSize:'cover'}}>
          {/* <div className={styles.tips}>
            <span className={styles.tips1}>
              {formatMessage({ id: 'app.desc.front' })}
            </span>
            <span className={styles.tips2}>
              {formatMessage({ id: 'app.desc.end' })}
            </span>
          </div> */}
          <div className={styles.copyright}>上海海鼎信息工程股份有限公司 版权所有</div>
        </div>

        <div className={styles.fill} >
          <div className={styles.logo}>
            <img src={logo} />
            <span>HDiWMS</span>
          </div>

          <div className={styles.formWrapper}>
            <div className={styles.accountLogin} style={{ display: showAccountLogin ? 'block' : 'none' }}>
              <div className={styles.title}>
                <span>{formatMessage({ id: 'app.login.type.account.title' })}</span>
                <a href="#" onClick={() => this.switchPage(LOGIN_PAGE_KEY['phoneLogin'])}>
                  {formatMessage({ id: 'app.login.type.phone.title' })}
                </a>
              </div>

              <AccountLogin {...accountLoginMethods} {...accountLoginProps} />
            </div>

            <div className={styles.phoneLogin} style={{ display: showPhoneLogin ? 'block' : 'none' }}>
              <div className={styles.title}>
                <span>{formatMessage({ id: 'app.login.type.phone.title' })}</span>
                <a href="#" onClick={() => this.switchPage(LOGIN_PAGE_KEY['accountLogin'])}>
                  {formatMessage({ id: 'app.login.type.account.title' })}
                </a>
              </div>
              
              <PhoneLogin {...phoneLoginMethods} {...phoneLoginProps} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginPage;
