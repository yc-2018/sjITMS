/*
 * @Author: Liaorongchang
 * @Date: 2022-09-23 16:17:11
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-10-16 11:58:01
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Layout, Row, Col, Card, Button, message } from 'antd';
import StoreTeamHeadSearchPage from './StoreTeamHeadSearchPage';
import StoreTeamDtlSearchPage from './StoreTeamDtlSearchPage';

const { Content, Sider } = Layout;

export default class ETCIssueAndRecyclePage extends PureComponent {
  state = {
    selectRows: {},
  };

  //刷新
  refreshSelectedRow = row => {
    this.setState({ selectRows: row });
  };

  render() {
    const { selectRows } = this.state;
    return (
      <PageHeaderWrapper>
        <Layout style={{ height: 'calc(100vh - 120px)' }}>
          <Content>
            <StoreTeamHeadSearchPage
              refreshSelectedRow={this.refreshSelectedRow}
              quickuuid="sj_itms_storeteam_head"
              onRef={node => (this.handleHeadPage = node)}
            />
          </Content>
          <Sider style={{ backgroundColor: 'rgb(237, 241, 245)' }} width={'40%'}>
            <StoreTeamDtlSearchPage
              selectedRow={selectRows.UUID}
              quickuuid="v_sj_itms_storeteam_dtl"
              onRef={node => (this.handleDtlPage = node)}
            />
          </Sider>
        </Layout>
      </PageHeaderWrapper>
    );
  }
}
