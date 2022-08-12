/*
 * @Author: Liaorongchang
 * @Date: 2022-07-06 16:31:01
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-07-11 10:31:18
 * @version: 1.0
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form,
  Button,
  Layout,
  Spin,
  Empty,
  Row,
  Col,
  Card,
  Pagination,
  Modal,
  Input,
  DatePicker,
  message,
  Popconfirm
} from 'antd';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import Page from '@/pages/Component/Page/inner/Page';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { dynamicQuery } from '@/services/quick/Quick';
import CostBillDtlSeacrhPage from './CostBillDtlSeacrhPage';
import { haveCheck, consumed } from '@/services/cost/CostCalculation';
import {
  SimpleTreeSelect,
  SimpleAutoComplete,
} from '@/pages/Component/RapidDevelopment/CommonComponent';
import { throttleSetter } from 'lodash-decorators';

const { Header, Footer, Content } = Layout;
const { RangePicker } = DatePicker;

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class CostBillSearchPage extends PureComponent {
  //需要操作列的显示 将noActionCol设置为false
  state = {
    ...this.state,
    e: {},
    data: [],
    billState: [],
    isModalVisible: false,
    title: '费用台账',
    pageFilter: {
      searchCount: true,
      pageNo: 1,
      pageSize: 20,
    },
  };

  componentDidMount() {
    this.handleSarch();
    this.searchDict();
  }

  handleSarch = e => {
    const { pageFilter } = this.state;
    if (e) {
      e.preventDefault();
    }
    const queryData = {
      tableName: 'V_COST_BILL',
      ...pageFilter,
    };
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let params = [];
        if (values.TITLE) {
          params = [...params, { field: 'TITLE', rule: 'like', val: [values.TITLE] }];
        }
        if (values.reportMonth) {
          let month = [
            values.reportMonth[0].format('YYYY-MM'),
            values.reportMonth[1].format('YYYY-MM'),
          ];
          params = [...params, { field: 'BILL_MONTH', rule: 'between', val: month }];
        }
        if (values.state != undefined) {
          params = [...params, { field: 'STATE', rule: 'eq', val: [values.state] }];
        }
        if (values.poject.value) {
          params = [...params, { field: 'PLAN_UUID', rule: 'eq', val: [values.poject.value] }];
        }

        queryData.condition = { params };
      }
    });
    dynamicQuery(queryData).then(e => {
      this.setState({ data: e.result });
    });
  };

  searchDict = () => {
    const queryData = {
      tableName: 'V_SYS_DICT_ITEM',
      condition: { params: [{ field: 'DICT_CODE', rule: 'eq', val: ['costState'] }] },
    };
    dynamicQuery(queryData).then(e => {
      this.setState({ billState: e.result.records });
    });
  };

  changePage = (page, pageSize) => {
    const { pageFilter } = this.state;
    pageFilter.pageNo = page;
    pageFilter.pageSize = pageSize;
    this.handleSarch();
  };

  onShowSizeChange = (current, size) => {
    const { pageFilter } = this.state;
    pageFilter.pageSize = size;
    pageFilter.size = size;
    this.handleSarch();
  };

  drawForm = () => {
    const { getFieldDecorator, TITLE } = this.props.form;
    return (
      <div>
        <Form layout="inline">
          <Form.Item label="台账名称">
            {getFieldDecorator('TITLE', {
              initialValue: TITLE,
            })(
              <Input
                placeholder="请填写台账名称"
                onChange={e => {
                  this.setState({ TITLE: e.target.value });
                }}
              />
            )}
          </Form.Item>
          <Form.Item label="月份" style={{ display: 'inline-block' }}>
            {getFieldDecorator('reportMonth')(
              <RangePicker
                placeholder={['开始月份', '结束月份']}
                format="YYYY-MM"
                mode={['month', 'month']}
                onPanelChange={value => {
                  this.props.form.setFieldsValue({
                    reportMonth: [value[0].startOf('month'), value[1].startOf('month')],
                  });
                }}
              />
            )}
          </Form.Item>
          <Form.Item label="方案类型">
            {getFieldDecorator('poject')(
              <SimpleTreeSelect
                placeholder="请选择方案类型"
                textField="%SCHEME_NAME%"
                valueField="UUID"
                style={{ width: 150 }}
                queryParams={{
                  tableName: 'cost_plan',
                  condition: {
                    params: [{ field: 'NOT_ENABLE', rule: 'eq', val: [0] }],
                  },
                }}
                showSearch
              />
            )}
          </Form.Item>
          <Form.Item label="状态">
            {getFieldDecorator('state')(
              <SimpleAutoComplete
                style={{ width: 150 }}
                placeholder="请选择台账状态"
                dictCode="costState"
                noRecord
                allowClear={true}
              />
            )}
          </Form.Item>

          <Form.Item>
            <Button type="primary" onClick={() => this.handleSarch()}>
              搜索
            </Button>
          </Form.Item>
          <Form.Item>
            <Button
              onClick={() => {
                this.props.form.resetFields();
                this.handleSarch();
              }}
            >
              重置
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  };

  drowe = () => {
    const records = this.state.data?.records;
    return records && records != 'false' ? (
      <Row
        children={records.map(e => {
          return (
            <Col style={{ paddingBottom: 15 }} span={6}>
              <Card
                hoverable
                key={e.UUID}
                bodyStyle={{ padding: '15px 10px 10px' }}
                style={{ width: '90%', border: '0.5px solid #3B77E3' }}
              >
                {this.drawBody(e)}
              </Card>
            </Col>
          );
        })}
      />
    ) : (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    );
  };

  drawBody = e => {
    const { billState } = this.state;
    const stateDict = billState.find(x => x.VALUE == e.STATE);
    return (
      <div>
        <Row style={{ height: '30px' }} align="bottom">
          <Col
            span={20}
            style={{
              fontWeight: 'bolder',
              fontSize: '18px',
            }}
          >
            {e.TITLE}
          </Col>
          <Col
            span={4}
            style={{
              fontSize: '14px',
              color: stateDict?.TEXT_COLOR,
              lineHeight: '30px',
              textAlign: 'center',
            }}
          >
            {e.STATE_CN}
          </Col>
        </Row>
        <Row>
          <Col>
            单号：
            {e.BILL_NUMBER}
          </Col>
        </Row>
        <Row style={{ float: 'right', marginTop: '20px' }}>
          <Button onClick={() => this.checkDtl(e)}>查看台账</Button>
          <Popconfirm title="费用账单确认对账后无法调整，确认后如有问题请在下期账单调整或联系信息中心同事处理" onConfirm ={()=>this.handleHaveCheck(e)}>
          <Button
            type="primary"
            style={{ margin: '0px 10px' }}
            //onClick={() => this.handleHaveCheck(e)}
          >
            确认对账
          </Button>
          </Popconfirm>
          <Button type="primary" onClick={() => this.handleConsumed(e)}>
            核销
          </Button>
        </Row>
      </div>
    );
  };

  checkDtl = e => {
    this.setState({ isModalVisible: true, e });
  };

  handleOk = () => {
    this.setState({ isModalVisible: false });
  };

  handleCancel = () => {
    this.setState({ isModalVisible: false });
  };

  handleHaveCheck = async e => {
    const response = await haveCheck(e.UUID);
    if (response && response.success) {
      message.success('确认成功');
      this.handleSarch();
    }
  };

  handleConsumed = async e => {
    const response = await consumed(e.UUID);
    if (response && response.success) {
      message.success('核销成功');
      this.handleSarch();
    }
  };

  render() {
    const { data, isModalVisible, e } = this.state;
    const layout = {
      width: '100%',
      height: '94%',
      backgroundColor: '#ffffff',
    };

    return (
      <PageHeaderWrapper>
        <Spin indicator={LoadingIcon('default')} delay={5} spinning={this.props.loading}>
          <Page withCollect={true}>
            <NavigatorPanel title={this.state.title} />
            <Layout style={layout}>
              <Header style={{ backgroundColor: '#ffffff', height: '9%', marginTop: '1%' }}>
                {this.drawForm()}
              </Header>
              <Content style={{ overflow: 'auto', height: '20%' }}>{this.drowe()}</Content>
              <Footer style={{ backgroundColor: '#ffffff', padding: '5px' }}>
                <Pagination
                  style={{ float: 'right' }}
                  defaultPageSize={20}
                  size="small"
                  total={data.total == undefined ? 0 : data.total}
                  onChange={(page, pageSize) => this.changePage(page, pageSize)}
                  onShowSizeChange={(current, size) => this.onShowSizeChange(current, size)}
                  showSizeChanger
                />
              </Footer>
            </Layout>
          </Page>
        </Spin>
        <Modal
          visible={isModalVisible}
          onOk={this.handleOk.bind()}
          onCancel={this.handleCancel.bind()}
          width={'80%'}
          bodyStyle={{ height: 'calc(70vh)', overflowY: 'auto' }}
        >
          <CostBillDtlSeacrhPage key={e.UUID} params={e} />
        </Modal>
      </PageHeaderWrapper>
    );
  }
}
