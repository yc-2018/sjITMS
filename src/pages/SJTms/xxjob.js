
import React, { Component , Card,Spin, PureComponent} from 'react';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import RyzeSearchPage from '../Component/RapidDevelopment/CommonLayout/RyzeSearchPage';
import configs from '@/utils/config';
import { Button } from 'antd';
export default class xxjob extends PureComponent  {
  componentDidMount(){
    window.open('http://job.timeexpress.com.cn/loginTms/test/123456')
    
  }
    render() {
          return <></>
      }
}