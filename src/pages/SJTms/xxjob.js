
import React, { Component , Card,Spin, PureComponent} from 'react';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import RyzeSearchPage from '../Component/RapidDevelopment/CommonLayout/RyzeSearchPage';
export default class xxjob extends PureComponent  {
    render() {
        return (
             <Page withCollect={true}>
            <iframe style={{floatLeft:100}} id="mainframe" name="mainframe"  frameBorder="0" width="100%" scrolling="no" height="100%" 
onload="document.all('mainframe').style.height=mainframe.document.body.scrollHeight+30;" src='http://job.timeexpress.com.cn//loginTms/test/123456'> </iframe>
             </Page> 
           
        
        );
      }
}