/*
 * @Author: Liaorongchang
 * @Date: 2022-06-08 10:39:18
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-07-12 17:02:13
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Button, Col, Row, Spin, Form, message } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import { getCompareBill } from '@/services/cost/CostCalculation';
import moment from 'moment';
import { colWidth } from '@/utils/ColWidth';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
@Form.create()
export default class CostBillDtlView extends QuickFormSearchPage {
  //需要操作列的显示 将noActionCol设置为false
  state = {
    ...this.state,
    searchLoading: false,
    calculateLoading: false,
    dateString:
      this.props.params.dateString == undefined
        ? moment().format('YYYY-MM')
        : this.props.params.dateString,
    plan: null,
    bill: null,
    isShowLogs: false,
    billLogs: [],
    isLock: null,
  };

  month = moment().format('YYYY-MM');

  columns = [
    {
      title: '请输入单号',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      width: colWidth.codeColWidth,
    },
  ];

  componentDidMount() {
    // this.handleOnSertch();
  }

  /**
   * 查询处理
   */
  handleOnSertch = data => {
    let params = {};
    if (data) {
      params = data;
    } else {
      params = {
        page: 1,
        pageSize: 20,
        // sortFields: {},
        // searchKeyValues: {},
        // likeKeyValues: {},
      };
    }
    this.props.form.validateFields(async (err, values) => {
      const response = await getCompareBill(values.billNumber, values.compareNum, params);
      if (response.data && response.success) {
        const { structs, data, plan, bill } = response.data.records[0];
        let newColumns = [];
        structs.forEach(struct => {
          newColumns.push({
            fieldName: struct.fieldName,
            fieldTxt: struct.fieldTxt,
            fieldType: 'VarChar',
            fieldWidth: colWidth.codeColWidth,
            isSearch: false,
            isShow: true,
          });
        });
        var datas = {
          list: data,
          pagination: {
            total: response.data.pageCount,
            pageSize: response.data.pageSize,
            current: response.data.page,
            showTotal: total => `共 ${total} 条`,
          },
        };
        this.setState({
          key: this.props.quickuuid + new Date(),
          data: datas,
          searchLoading: false,
          bill,
          plan,
        });
        this.initConfig({
          columns: newColumns,
          sql: ' ccc',
          reportHeadName: 'ccc',
        });
      } else {
        message.error('当前查询无数据,请计算后再操作');
        this.setState({ data: [], searchLoading: false, bill: null });
      }
    });
  };

  changeLogsModal = () => {
    this.setState({ isShowLogs: !this.state.isShowLogs });
  };

  refreshTable = data => {
    data.page = data.page + 1;
    this.handleOnSertch(data);
  };

  monthChange = (date, dateString) => {
    this.month = dateString;
    this.setState({ dateString });
  };

  drawcell = e => {
    if (e.val.toString().substr(-3, 3) == 'red') {
      e.component = (
        <p3 style={{ color: 'red' }}>
          {this.convertData(e.val.substr(0, e.val.indexOf('red')), e.column.preview, e.record)}
        </p3>
      );
    }
    if (e.column.fieldName == 'modified') {
      e.val = e.val ? '是' : '否';
    }
  };

  drawSearchPanel = () => {
    const { getFieldDecorator } = this.props.form;
    let node = [];

    node.push(
      <Form.Item label="当前单号">
        {getFieldDecorator('billNumber', {
          rules: [{ required: true, message: '请输入当前单号!' }],
        })(
          <SimpleAutoComplete
            style={{ width: 200 }}
            placeholder="请输入台账单号"
            textField="%BILL_NUMBER%"
            valueField="BILL_NUMBER"
            searchField="BILL_NUMBER"
            queryParams={{
              tableName: 'COST_BILL',
            }}
            noRecord
            autoComplete
            allowClear={true}
          />
        )}
      </Form.Item>
    );
    node.push(
      <Form.Item label="对比单号">
        {getFieldDecorator('compareNum', {
          rules: [{ required: true, message: '请输入对比单号!' }],
        })(
          <SimpleAutoComplete
            style={{ width: 200 }}
            placeholder="请输入对比单号"
            textField="%BILL_NUMBER%"
            valueField="BILL_NUMBER"
            searchField="BILL_NUMBER"
            queryParams={{
              tableName: 'COST_BILL_BAK',
            }}
            noRecord
            autoComplete
            allowClear={true}
          />
        )}
      </Form.Item>
    );
    node.push(
      <Form.Item>
        <Button type="primary" onClick={() => this.handleOnSertch()}>
          查询
        </Button>
        <Button
          onClick={() => {
            this.props.form.resetFields();
          }}
          style={{ marginLeft: '10px' }}
        >
          重置
        </Button>
      </Form.Item>
    );

    return (
      <Row style={{ marginTop: '10px' }}>
        <Col>
          <Form layout="inline">
            {node.map(e => {
              return e;
            })}
          </Form>
        </Col>
      </Row>
    );
  };

  render() {
    return (
      <PageHeaderWrapper>
        <Page withCollect={true} pathname={this.props.pathname}>
          <Spin spinning={this.state.searchLoading}>{this.drawPage()}</Spin>
        </Page>
      </PageHeaderWrapper>
    );
  }
}
