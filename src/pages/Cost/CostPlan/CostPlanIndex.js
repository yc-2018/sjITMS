import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Button, Layout, Spin, Card, Row, Col, Input, Empty } from 'antd';
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
    SCHEM_ENAME: '',
  };
  componentDidMount() {
    this.handleSarch();
  }
  onClickPlan = e => {
    this.props.switchTab('update', { entityUuid: e });
  };
  drowe = () => {
    const records = this.state.data?.result?.records;
    return records && records != 'false' ? (
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
                style={{ width: '80%', border: '0.5px solid #3B77E3' }}
              >
                {this.drawButton(e.UUID)}
              </Card>
            </Col>
          );
        })}
        style={{ paddingBottom: 20 }}
        gutter={4}
      />
    ) : (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    );
  };

  drawButton = e => {
    return (
      <div style={{ float: 'right' }}>
        <Button style={{ marginRight: '10px' }} onClick={() => this.onClickPlan(e)}>
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
        <Button type="primary" onClick={() => this.handleShowExcelImportPage()}>
          {'新建'}
        </Button>
      </>
    );
  };
  handleSarch = e => {
    if (e) {
      e.preventDefault();
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const queryData = {
          tableName: 'COST_PLAN',
        };
        let params = [];
        if (values.SCHEM_ENAME) {
          params = [...params, { field: 'SCHEME_NAME', rule: 'like', val: [values.SCHEM_ENAME] }];
        }
        queryData.condition = { params };

        dynamicQuery(queryData).then(e => {
          this.setState({ data: e });
        });
      }
    });
  };
  drawForm = () => {
    const formItemLayout = {
      labelCol: { span: 8, offset: 4 },
      wrapperCol: { span: 12, offset: 4 },
    };
    const formTailLayout = {
      labelCol: { span: 4, offset: 8 },
      wrapperCol: { span: 20, offset: 8 },
    };
    const { getFieldDecorator } = this.props.form;
    return (
      //labelCol={{ span: 8 }} wrapperCol={{ span: 12 ,offset:8}}
      <div>
        <Form layout="inline" onSubmit={this.handleSarch}>
          <Form.Item label="方案名称">
            {getFieldDecorator('SCHEM_ENAME', { initialValue: this.state.SCHEM_ENAME })(
              <Input placeholder="请填写方案名称" onChange={(e)=>{this.setState({SCHEM_ENAME:e.target.value})}} />
            )}
          </Form.Item>
          {/* <Form.Item labelCol={{span:8}} wrapperCol={{span:8,offset:5}} label="Nickname">
          {getFieldDecorator('nickname', {
            rules: [
              {
                required: this.state.checkNick,
                message: 'Please input your nickname',
              },
            ],
          })(<Input placeholder="Please input your nickname" />)}
        </Form.Item> */}

          <Form.Item>
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={() => this.props.form.resetFields()}>重置</Button>
          </Form.Item>
        </Form>
      </div>
    );
  };
  render() {
    const layout = {
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffff'
    };
    return (
      <PageHeaderWrapper>
        <Spin indicator={LoadingIcon('default')} delay={5} spinning={this.props.loading}>
          <Page withCollect={true}>
            <NavigatorPanel title={this.state.title} action={this.drawButtion()} />
            <Layout style={layout}>
              <Header style={{  backgroundColor: '#ffffff',height: '10%',marginTop:'2%' }}>{this.drawForm()}</Header>
              <Content style={{ overflow: 'auto', height: '20%' }}>
                {this.drowe()}
              </Content>
              <Footer />
            </Layout>
          </Page>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}
