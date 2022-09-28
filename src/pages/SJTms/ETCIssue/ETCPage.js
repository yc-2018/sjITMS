/*
 * @Author: Liaorongchang
 * @Date: 2022-09-23 16:17:11
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-09-28 11:02:56
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
    // issueRows: {},
    // recycleRows: {},
    selectRows: {},
    passCard: {},
  };

  issueButton = () => {
    return (
      <span>
        <Button onClick={this.recommend.bind()}>推荐</Button>
        <Button style={{ margin: '0 10px' }} onClick={this.issue.bind()}>
          发放
        </Button>
        <Button onClick={this.recycle.bind()}>回收</Button>
      </span>
    );
  };

  //回收
  recycleButton = () => {
    return (
      <span>
        <Button onClick={this.recycle.bind()}>回收</Button>
      </span>
    );
  };

  //推荐
  recommend = async () => {
    const { selectRows } = this.state;
    if (selectRows.BILLNUMBER == undefined) {
      message.error('请选择需要推荐粤通卡的排车单');
    }
    const response = await recommend(selectRows.BILLNUMBER);
    if (response.success && response.data) {
      this.setState({ passCard: { innerno: response.data.innerno, cardno: response.data.cardno } });
    }
  };

  //发放
  issue = async () => {
    const { selectRows } = this.state;
    if (selectRows.BILLNUMBER == undefined) {
      message.error('请选择需要发放粤通卡的排车单');
    }
    const data = this.getCardEntity.getEntity();
    const response = await issue(data);
    if (response.success) {
      message.success('发放成功');
      this.handlePage.onSearch();
    }
  };

  //回收
  recycle = async () => {
    const { selectRows } = this.state;
    if (selectRows.BILLNUMBER == undefined) {
      message.error('请选择需要回收粤通卡的排车单');
    }
    const data = this.getCardEntity.getEntity();
    const response = await recycle(data);
    if (response.success) {
      message.success('回收成功');
      this.handlePage.onSearch();
    }
  };

  //刷新
  refreshSelectedRow = row => {
    this.setState({ selectRows: row });
    // if (row.CARDNO == undefined) {
    //   this.setState({ issueRows: row, recycleRows: {} });
    // } else {
    //   this.setState({ issueRows: {}, recycleRows: row });
    // }
  };

  render() {
    const { issueRows, recycleRows, passCard, selectRows } = this.state;
    return (
      <PageHeaderWrapper>
        <Layout style={{ height: 'calc(100vh - 120px)' }}>
          <Content>
            <ETCSearchPage
              // selectedRows={selectedRows}
              refreshSelectedRow={this.refreshSelectedRow}
              quickuuid="sj_itms_etc_issue"
              onRef={node => (this.handlePage = node)}
            />
          </Content>
          <Sider style={{ backgroundColor: 'rgb(237, 241, 245)' }} width={'25%'}>
            <Row gutter={[0, 16]}>
              <Col>
                <Card title="发放与回收" extra={this.issueButton()}>
                  <ETCCreatePage
                    noBorder
                    noCategory
                    quickuuid="sj_itms_etc_issue"
                    params={{ entityUuid: selectRows.BILLNUMBER }}
                    showPageNow="update"
                    passCard={passCard}
                    onRef={node => (this.getCardEntity = node)}
                  />
                </Card>
              </Col>
              {/* <Col>
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
              </Col> */}
            </Row>
          </Sider>
        </Layout>
      </PageHeaderWrapper>
    );
  }
}
