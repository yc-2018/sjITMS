/*
 * @Author: Liaorongchang
 * @Date: 2023-06-26 14:41:13
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-09-23 17:11:24
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Button, Layout, Spin, Row, Input, Empty, DatePicker } from 'antd';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import Page from '@/pages/Component/Page/inner/Page';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import CostPlanCard from './CostPlanCard';
import { getPlanInfo } from '@/services/cost/CostPlan';
import { queryDictByCode } from '@/services/quick/Quick';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import moment from 'moment';

const { Header, Footer, Content } = Layout;
const { RangePicker } = DatePicker;

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
    changeStat: '',
    organization: '',
  };
  componentDidMount() {
    queryDictByCode(['costPlanStat']).then(res => {
      this.setState({ costPlanStat: res.data });
      //查询方案内容
      this.handleSarch();
    });
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
    this.props.switchTab('queryBill', { entityUuid: e.uuid, e });
  };

  // changeLoading = val => {
  //   this.setState({ loading: val });
  // };

  drowe = () => {
    const records = this.state.data;
    return records.success && records.data && records.data.length > 0 ? (
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
              // changeLoading={val => this.changeLoading(val)}
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
        getPlanInfo(loginOrg().uuid, values).then(response => {
          this.setState({ data: response });
        });
      }
    });
    this.setState({ loading: false });
  };

  drawForm = () => {
    const { getFieldDecorator } = this.props.form;
    const { changeStat, organization } = this.state;
    return (
      <div>
        <Form layout="inline" onSubmit={this.handleSarch}>
          <Form.Item label="方案名称">
            {getFieldDecorator('schemName')(<Input placeholder="请填写方案名称" allowClear />)}
          </Form.Item>
          <Form.Item label="状态">
            {getFieldDecorator('stat')(
              <SimpleAutoComplete
                placeholder={'请选择状态'}
                dictCode="costPlanStat"
                value={changeStat}
                onChange={e => {
                  this.setState({ changeStat: e });
                }}
                style={{ width: '10rem' }}
                allowClear
                noRecord
              />
            )}
          </Form.Item>
          <Form.Item label="有效期">
            {getFieldDecorator('expiringDate')(
              <RangePicker
                size="default"
                format="YYYY-MM-DD HH:mm:ss"
                showTime={{
                  hideDisabledOptions: true,
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
                }}
              />
            )}
          </Form.Item>
          <Form.Item label="所属组织">
            {getFieldDecorator('organization')(
              <SimpleAutoComplete
                placeholder={'请选择所属组织'}
                dictCode="dispatchCenter"
                value={organization}
                onChange={e => {
                  this.setState({ organization: e });
                }}
                style={{ width: '10rem' }}
                allowClear
                noRecord
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
