/*
 * @Author: Liaorongchang
 * @Date: 2023-06-26 14:41:13
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-08-17 12:03:21
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Button, Layout, Spin, Row, Input, Empty, Steps } from 'antd';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import Page from '@/pages/Component/Page/inner/Page';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import CostPlanCard from './CostPlanCard';
import { getPlanInfo } from '@/services/cost/CostPlan';
import { queryDictByCode } from '@/services/quick/Quick';

const { Header, Footer, Content } = Layout;

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class CostPlanIndex extends PureComponent {
  state = {
    ...this.state,
    isNotHd: true,
    filelist: [],
    title: '计费方案',
    data: [],
    SCHEM_ENAME: '',
    tableName: 'COST_PLAN',
    current: 0,
    loading: false,
    costPlanStat: [],
  };
  componentDidMount() {
    //查询方案内容
    this.handleSarch();
    queryDictByCode(['costPlanStat']).then(res => this.setState({ costPlanStat: res.data }));
  }
  onClickPlan = e => {
    this.props.switchTab('update', { entityUuid: e });
  };

  onClickDefView = e => {
    this.props.switchTab('defView', { entityUuid: e });
  };

  onClickCalculation = e => {
    this.props.switchTab('import', { entityUuid: e.uuid, e });
  };

  onClickSelectBill = e => {
    this.props.switchTab('queryBill', { e });
  };

  drowe = () => {
    const records = this.state.data;
    return records && records.success && records.data.length > 0 ? (
      <Row
        children={records.data.map(e => {
          return (
            <CostPlanCard
              costPlanStat={this.state.costPlanStat}
              e={e}
              handleSarch={this.handleSarch.bind()}
              onClickPlan={e => {
                this.onClickPlan(e);
              }}
              onClickDefView={e => {
                this.onClickDefView(e);
              }}
              onClickCalculation={e => {
                this.onClickCalculation(e);
              }}
              onClickSelectBill={e => {
                this.onClickSelectBill(e);
              }}
            />
          );
        })}
        style={{ paddingBottom: 20 }}
        gutter={3}
      />
    ) : (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
    this.setState({ loading: true });
    this.props.form.validateFields((err, values) => {
      if (!err) {
        getPlanInfo(loginOrg().uuid).then(response => {
          this.setState({ data: response });
        });
      }
    });
    this.setState({ loading: false });
  };

  drawForm = () => {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Form layout="inline" onSubmit={this.handleSarch}>
          <Form.Item label="方案名称">
            {getFieldDecorator('SCHEM_ENAME', { initialValue: this.state.SCHEM_ENAME })(
              <Input
                placeholder="请填写方案名称"
                onChange={e => {
                  this.setState({ SCHEM_ENAME: e.target.value });
                }}
              />
            )}
          </Form.Item>
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
      backgroundColor: '#ffffff',
    };
    return (
      <PageHeaderWrapper>
        <Spin indicator={LoadingIcon('default')} delay={5} spinning={this.state.loading}>
          <Page withCollect={true}>
            <NavigatorPanel title={this.state.title} action={this.drawButtion()} />
            <Layout style={layout}>
              <Header style={{ backgroundColor: '#ffffff', height: '10%', marginTop: '2%' }}>
                {this.drawForm()}
              </Header>
              <Content style={{ overflow: 'auto', height: '20%' }}>{this.drowe()}</Content>
              <Footer />
            </Layout>
          </Page>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}
