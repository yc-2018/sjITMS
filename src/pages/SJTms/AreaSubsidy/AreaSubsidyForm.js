/*
 * @Author: Liaorongchang
 * @Date: 2022-09-23 16:17:11
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-10-21 17:05:02
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Layout, Row, Col, Card, Button, message } from 'antd';
import AreaSubsidySearchPage from './AreaSubsidySearchPage';
import AreaSubsidyDtlSearchPage from './AreaSubsidyDtlSearchPage';

const { Content, Sider } = Layout;

export default class AreaSubsidyForm extends PureComponent {
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
            <AreaSubsidySearchPage
              refreshSelectedRow={this.refreshSelectedRow}
              quickuuid="sj_itms_areasubsidy"
              onRef={node => (this.handleHeadPage = node)}
            />
          </Content>
          <Sider style={{ backgroundColor: 'rgb(237, 241, 245)' }} width={'40%'}>
            <AreaSubsidyDtlSearchPage
              selectedRow={selectRows.UUID}
              quickuuid="sj_itms_areasubsidy_dtl"
              onRef={node => (this.handleDtlPage = node)}
            />
          </Sider>
        </Layout>
      </PageHeaderWrapper>
    );
  }
}
