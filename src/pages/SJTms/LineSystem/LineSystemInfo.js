import LineSystemSearchPage from "./LineSystemSearchPage";
import React, { Component } from 'react';
import LineSystemhisSearchPage from './LineSystemhisSearchPage'
import Page from '@/pages/Component/Page/inner/NewStylePage';
import { Button, Switch, Modal, message, Form, Layout, Menu, Icon, Tree, Tabs } from 'antd';
import { connect } from 'dva';
const {TabPane}  = Tabs

export default class LineSystemInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
          lineTreeData: [],
          lineData: [],
          expandKeys: [],
          selectLineUuid: '',
          rightContent: '',
          isNotHd:true,
          updates:''
        };
      }
    render() {
       return (
        < Page>
            <Tabs defaultActiveKey="1" onChange = {(value)=>{if(value==2)this.setState({updates:new Date()})}}>
                <TabPane tab="当前线路" key="1">
                <LineSystemSearchPage></LineSystemSearchPage>
                </TabPane>
                <TabPane tab="历史线路" key="2">
                   <LineSystemhisSearchPage key = {this.state.updates}> </LineSystemhisSearchPage>
                </TabPane>
        </Tabs>
        </Page>
      ) 
    }
        
}