/*
 * @Author: guankongjin
 * @Date: 2022-03-09 10:08:34
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-06-28 15:22:16
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\SJTms\LineSystem\LineSystem.js
 */
import { createRef, PureComponent } from 'react';
import { connect } from 'dva';
import { Tabs } from 'antd';
import Page from '@/pages/Component/Page/inner/Page';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import LineSystemhisSearchPage from './LineSystemhisSearchPage';
import LineSystemSearchPage from './LineSystemSearchPage';
const { TabPane } = Tabs;
@connect(({ loading }) => ({
  loading: loading.models.lineSystem,
}))
export default class LineSystem extends PureComponent {
  onTabClick =(key)=>{
    if(key=='HisLineSystemPage'){
      this.setState({flag:new Date()});
    }
  }
  render() {
    return (
      <PageHeaderWrapper>
        <Page withCollect={true} pathname={this.props.location ? this.props.location.pathname : ''}>
          <Tabs defaultActiveKey="LineSystemPage" style={{ height: '100%' }}  onChange={this.onTabClick}>
            <TabPane tab="当前线路" key="LineSystemPage">
              <LineSystemSearchPage />
            </TabPane>
            <TabPane tab="历史线路" key="HisLineSystemPage">
              <LineSystemhisSearchPage kedata = {this.state?.flag}/>
            </TabPane>
          </Tabs>
        </Page>
      </PageHeaderWrapper>
    );
  }
}
