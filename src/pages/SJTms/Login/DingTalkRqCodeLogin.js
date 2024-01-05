/*
 * @Author: guankongjin
 * @Date: 2023-10-16 10:47:31
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-10-18 11:12:45
 * @Description: 钉钉登录
 * @FilePath: \iwms-qq\src\pages\Magpie\Login\DingTalkRqCodeLogin.js
 */
import React from 'react';
import Script from 'react-load-script';
import { message } from 'antd';
import dingtalk from '@/assets/login/dingtalk.svg';
import styles from './Login.less';

export default function DingTalkRqCodeLogin(dispatch, orgType) {
  function handleScriptLoad() {
    const appid = 'dingcklpj9ydkhrkwuxw';
    const redirect_uri = encodeURIComponent(`${window.origin}`);
    window.DTFrameLogin(
      {
        id: 'login_container',
        width: 280,
        height: 280,
      },
      {
        redirect_uri: redirect_uri,
        client_id: appid,
        scope: 'openid',
        response_type: 'code',
        prompt: 'consent',
        state: 86,
      },
      async loginResult => {
        const { authCode } = loginResult;
        // 登录
        await dispatch({ type: 'login/dingLogin', payload: { authCode, orgType } });
      },
      errorMsg => {
        // 这里一般需要展示登录失败的具体原因
        message.error(`Login Error: ${errorMsg}`);
      }
    );
  }
  function login() {
    const appid = 'dingcklpj9ydkhrkwuxw';
    const redirect_uri = encodeURIComponent(
      `${window.location.origin}/user/dinglogin?orgType=${orgType}`
    );
    window.location.href = `https://login.dingtalk.com/oauth2/auth?redirect_uri=${redirect_uri}&response_type=code&client_id=${appid}&scope=openid&state=86&prompt=consent`;
  }

  return (
    <div className={styles.dingtalkLoginCell}>
      <Script
        url="https://g.alicdn.com/dingding/h5-dingtalk-login/0.21.0/ddlogin.js"
        onLoad={handleScriptLoad}
      />
      <div id="login_container" className={styles.dingtalkLoginContainer} />
      <a href="#" className={styles.dingtalkAccountLoginContainer} onClick={login}>
        <img src={dingtalk} className={styles.dingtalkLoginLink} />
        <span> 钉钉账号登录</span>
      </a>
    </div>
  );
}
