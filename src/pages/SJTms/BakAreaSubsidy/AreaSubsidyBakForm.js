/*
 * @Author: Liaorongchang
 * @Date: 2022-09-23 16:17:11
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-04-11 16:47:22
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Layout, Row, Col, Card, Button, message } from 'antd';
import AreaSubsidySearchPage from './AreaSubsidyBakSearchPage';
import AreaSubsidyDtlSearchPage from './AreaSubsidyDtlBakSearchPage';

const { Content, Sider } = Layout;

export default class AreaSubsidyBakForm extends PureComponent {
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
              quickuuid="sj_itms_areasubsidy_bak"
              onRef={node => (this.handleHeadPage = node)}
            />
          </Content>
          <Sider style={{ backgroundColor: 'rgb(237, 241, 245)' }} width={'58%'}>
            <AreaSubsidyDtlSearchPage
              selectedRow={selectRows.UUID}
              quickuuid="v_sj_itms_areasubsidy_dtl_bak"
              onRef={node => (this.handleDtlPage = node)}
            />
          </Sider>
        </Layout>
      </PageHeaderWrapper>
    );
  }
}
