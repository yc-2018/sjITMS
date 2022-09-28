/*
 * @Author: Liaorongchang
 * @Date: 2022-09-23 16:17:11
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-09-28 09:31:03
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import ETCSearchPage from './ETCSearchPage';
import { Layout, Row, Col, Card, Button, message } from 'antd';
import ETCCreatePage from './ETCCreatePage';
import { recommend, issue, recycle } from '@/services/sjitms/ETCIssueAndRecycle';

const { Content, Sider } = Layout;

export default class ETCPage extends PureComponent {
  state = {
    issueRows: {},
    recycleRows: {},
    passCard: {},
  };

  issueButton = () => {
    return (
      <span>
        <Button onClick={this.recommend.bind()}>推荐</Button>
        <Button style={{ marginLeft: '10px' }} onClick={this.issue.bind()}>
          发放
        </Button>
      </span>
    );
  };

  //推荐
  recommend = async () => {
    const { issueRows } = this.state;
    if (issueRows.BILLNUMBER == undefined) {
      message.error('请选择需要推荐粤通卡的排车单');
    }
    const respone = await recommend(issueRows.BILLNUMBER);
    if (respone.success && respone.data) {
      this.setState({ passCard: { innerno: respone.data.innerno, cardno: respone.data.cardno } });
    }
  };

  //发放
  issue = async () => {
    const { issueRows } = this.state;
    if (issueRows.BILLNUMBER == undefined) {
      message.error('请选择需要发放粤通卡的排车单');
    }
    const data = this.getCardEntity.getEntity();
    await issue(data);
  };

  //回收
  recycleButton = () => {
    return (
      <span>
        <Button onClick={this.recycle.bind()}>回收</Button>
      </span>
    );
  };

  //回收
  recycle = async () => {
    const { recycleRows } = this.state;
    if (recycleRows.BILLNUMBER == undefined) {
      message.error('请选择需要回收粤通卡的排车单');
    }
    const data = this.getCardEntity.getEntity();
    await issue(data);
  };

  //刷新
  refreshSelectedRow = row => {
    if (row.CARDNO == undefined) {
      this.setState({ issueRows: row, recycleRows: {} });
    } else {
      this.setState({ issueRows: {}, recycleRows: row });
    }
  };

  render() {
    const { issueRows, recycleRows, passCard } = this.state;
    return (
      <PageHeaderWrapper>
        <Layout style={{ height: 'calc(100vh - 120px)' }}>
          <Content>
            <ETCSearchPage
              // selectedRows={selectedRows}
              refreshSelectedRow={this.refreshSelectedRow}
              quickuuid="sj_itms_etc_issue"
            />
          </Content>
          <Sider style={{ backgroundColor: 'rgb(237, 241, 245)' }} width={'30%'}>
            <Row gutter={[0, 16]}>
              <Col>
                <Card title="发放" extra={this.issueButton()}>
                  <ETCCreatePage
                    noBorder
                    noCategory
                    quickuuid="sj_itms_etc_issue"
                    params={{ entityUuid: issueRows.BILLNUMBER }}
                    showPageNow="update"
                    passCard={passCard}
                    onRef={node => (this.getCardEntity = node)}
                  />
                </Card>
              </Col>
              <Col>
                <Card title="回收" extra={this.recycleButton()}>
                  <ETCCreatePage
                    noBorder
                    noCategory
                    quickuuid="sj_itms_etc_issue"
                    params={{ entityUuid: recycleRows.BILLNUMBER }}
                    showPageNow="update"
                    onRef={node => (this.getCardEntity = node)}
                  />
                </Card>
              </Col>
            </Row>
          </Sider>
        </Layout>
      </PageHeaderWrapper>
    );
  }
}
