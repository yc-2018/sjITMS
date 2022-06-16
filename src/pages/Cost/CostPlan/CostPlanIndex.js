import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Button, Layout, Spin, Card, Row, Col } from 'antd';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import { savePlan } from '@/services/cost/Cost';
import Page from '@/pages/Component/Page/inner/Page';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { dynamicQuery } from '@/services/quick/Quick';
import { res } from '@/pages/In/Move/PlaneMovePermission';
const { Header, Footer, Sider, Content } = Layout;

export default class CostPlanIndex extends PureComponent {
  state = {
    ...this.state,
    isNotHd: true,
    filelist: [],
    title: '计费方案',
    data: [],
  };
  componentDidMount() {
    const params = {
      tableName: 'COST_PLAN',
    };

    dynamicQuery(params).then(e => {
      this.setState({ data: e });
    });
  }
  onClickPlan = e => {
    this.props.switchTab('update', { entityUuid: e });
  };
  drowe = () => {
    if (this.state.data.length == 0) {
      return;
    }
    const { records } = this.state.data?.result;
    if (records) {
      return (
        <Row
          children={records.map(e => {
            return (
              <Col style={{ paddingBottom: 20 }} span={6}>
                <Card
                  hoverable
                  key={e.UUID}
                  headStyle={{
                    fontWeight: 'bolder',
                    fontSize: '18px',
                    padding: '0 10px',
                    borderBottom: '0px',
                  }}
                  bodyStyle={{ padding: '24px 10px 10px' }}
                  title={e.SCHEME_NAME}
                  style={{ width: 300, border: '0.5px solid #3B77E3' }}
                >
                  {this.drawButton(e)}
                </Card>
              </Col>
            );
          })}
          style={{ paddingBottom: 20 }}
          gutter={4}
        />
      );
    }
  };

  drawButton = e => {
    return (
      <div style={{ float: 'right' }}>
        <Button style={{ marginRight: '10px' }} onClick={() => this.onClickPlan(e.UUID)}>
          编辑
        </Button>
        <Button>停用</Button>
      </div>
    );
  };
  handleShowExcelImportPage = () => {
    this.props.switchTab('create');
  };
  onCreate = () => {};
  drawButtion = () => {
    return (
      <>
        <Button onClick={() => this.handleShowExcelImportPage()}>{'添加'}</Button>
        <Button icon="plus" type="primary" onClick={this.onCreate.bind(this, '')}>
          {'保存'}
        </Button>
      </>
    );
  };
  render() {
    const layout = {
      width: '100%',
      height: '100%',
    };
    return (
      <PageHeaderWrapper>
        <Spin indicator={LoadingIcon('default')} delay={5} spinning={this.props.loading}>
          <Page withCollect={true}>
            <NavigatorPanel title={this.state.title} action={this.drawButtion()} />
            <Layout style={layout}>
              <Header style={{ backgroundColor: 'white' }} />
              <Content style={{ overflow: true, backgroundColor: 'white' }}>{this.drowe()}</Content>
              <Footer />
            </Layout>
          </Page>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}
