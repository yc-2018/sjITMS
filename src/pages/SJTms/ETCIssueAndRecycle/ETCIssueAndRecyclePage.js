/*
 * @Author: Liaorongchang
 * @Date: 2022-09-23 16:17:11
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-04-18 14:40:44
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Layout, Row, Col, Card, Button, message } from 'antd';
import ETCCreatePage from './ETCIssueAndRecycleCreatePage';
import ETCDTLSearchPage from './ETCDTLSearchPage';
import { recommend, issue, recycle ,repairIssue} from '@/services/sjitms/ETCIssueAndRecycle';
import { havePermission } from '@/utils/authority';
import { log } from 'lodash-decorators/utils';
const { Content, Sider } = Layout;
export default class ETCIssueAndRecyclePage extends PureComponent {
  state = {
    selectRows: {},
    passCard: {},
  };

  componentDidMount() {
    this.setState({authority:this.props.route.authority})
    window.addEventListener('keydown', this.keyDown);
  }

  keyDown = (event, ...args) => {
    let that = this;
    var e = event || window.event || args.callee.caller.arguments[0];
    console.log('e', e);
    if (e && e.keyCode == 90 && e.altKey) {
      that.recommend();
    } else if (e && e.keyCode == 88 && e.altKey) {
      that.issue();
    } else if (e && e.keyCode == 67 && e.altKey) {
      that.recycle();
    }
  };

  componentWillUnmount() {
    window.removeEventListener('keydown', this.keyDown);
  }

  issueButton = () => {
 
    return (
      <span>
        <Button onClick={this.recommend.bind()}>推荐(Alt+Z)</Button>
        <Button type="primary" style={{ margin: '0 10px' }} onClick={this.issue.bind()}>
          发放(Alt+X)
        </Button>
        <Button type="danger" onClick={this.recycle.bind()}>
          回收(Alt+C)
        </Button>
        <Button 
          type="primary" 
          style={{ margin: '0 10px'}} 
          onClick={this.repairIssue.bind()}
          hidden={!havePermission(this.state.authority + '.repairIssue')}
        >
        补发
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
      return;
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
      return;
    }
    const data = this.getCardEntity.getEntity();
    if (data.v_sj_itms_etc_issueandrecycle[0].CARDNO == undefined) {
      message.error('请填写发放的粤通卡号');
      return;
    }
    const response = await issue(data);
    if (response.success) {
      message.success('发放成功');
      this.setState({ selectRows: {} });
      this.handlePage.onSearch();
    }
  };

    //补发
    repairIssue = async () => {
      const { selectRows } = this.state;
      if (selectRows.BILLNUMBER == undefined) {
        message.error('请选择需要发放粤通卡的排车单');
        return;
      }
      const data = this.getCardEntity.getEntity();
      if (data.v_sj_itms_etc_issueandrecycle[0].CARDNO == undefined) {
        message.error('请填写发放的粤通卡号');
        return;
      }
      const response = await repairIssue(data);
      if (response.success) {
        message.success('补发成功');
        this.setState({ selectRows: {} });
        this.handlePage.onSearch();
      }
    };

  //回收
  recycle = async () => {
    const { selectRows } = this.state;
    if (selectRows.BILLNUMBER == undefined) {
      message.error('请选择需要回收粤通卡的排车单');
      return;
    }
    const data = this.getCardEntity.getEntity();
    if (data.v_sj_itms_etc_issueandrecycle[0].CARDNO == undefined) {
      message.error('该排车单无需回收粤通卡');
      return;
    }
    const response = await recycle(data);
    if (response.success) {
      message.success('回收成功');
      this.handlePage.onSearch();
    }
  };

  //刷新
  refreshSelectedRow = row => {
    this.setState({ selectRows: row[0] });
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
              row={this.state.row}
            />
          </Content>
          <Sider style={{ backgroundColor: 'rgb(237, 241, 245)' }} width={'30%'}>
            <Row gutter={[0, 8]}>
              <Col>
                <Card title="发放与回收"  bodyStyle ={{padding:10,}}>
                  <div>{this.issueButton()}</div>
                  <ETCCreatePage
                    noBorder
                    noCategory
                    quickuuid="sj_itms_etc_issue"
                    params={{ entityUuid: selectRows?.BILLNUMBER }}
                    showPageNow="update"
                    passCard={passCard}
                    onRef={node => (this.getCardEntity = node)}
                    style={{ color: 'black' }}
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
