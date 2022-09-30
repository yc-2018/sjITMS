/*
 * @Author: Liaorongchang
 * @Date: 2022-09-23 16:17:11
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-09-30 15:59:39
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Layout, Row, Col, Card, Button, message, Select, Input, Tooltip } from 'antd';
import ETCCreatePage from './ETCIssueAndRecycleCreatePage';
import ETCDTLSearchPage from './ETCDTLSearchPage';
import { recommend, issue, recycle } from '@/services/sjitms/ETCIssueAndRecycle';
import { queryDictByCode } from '@/services/quick/Quick';
import ETCApplyRecordSearchPage from '../ETCApplyRecord/ETCApplyRecordSearchPage';

const { Content, Sider } = Layout;
const { Search } = Input;

export default class ETCPage extends PureComponent {
  dict = [];
  state = {
    selectRows: {},
    passCard: {},
  };

  issueButton = () => {
    return (
      <span>
        <Button onClick={this.recommend.bind()}>推荐</Button>
        <Button type="primary" style={{ margin: '0 10px' }} onClick={this.issue.bind()}>
          发放
        </Button>
        <Button type="danger" onClick={this.recycle.bind()}>
          回收
        </Button>
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
  };

  render() {
    const { passCard, selectRows } = this.state;
    return (
      <PageHeaderWrapper>
        <Layout style={{ height: 'calc(100vh - 120px)' }}>
          <Content>
            <ETCDTLSearchPage
              // selectedRows={selectedRows}
              refreshSelectedRow={this.refreshSelectedRow}
              quickuuid="sj_itms_etc_issue"
              onRef={node => (this.handlePage = node)}
            />
          </Content>
          <Sider style={{ backgroundColor: 'rgb(237, 241, 245)' }} width={'30%'}>
            <Row gutter={[0, 8]}>
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
            </Row>
          </Sider>
        </Layout>
      </PageHeaderWrapper>
    );
  }
}
