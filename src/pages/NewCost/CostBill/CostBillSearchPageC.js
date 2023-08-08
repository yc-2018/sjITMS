/*
 * @Author: Liaorongchang
 * @Date: 2022-07-06 16:31:01
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-08-08 17:21:50
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
  Popconfirm,
  List,
  Upload,
  Icon,
} from 'antd';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import Page from '@/pages/Component/Page/inner/Page';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { dynamicQuery } from '@/services/quick/Quick';
import { haveCheck, consumed, uploadFile, deleteFile } from '@/services/cost/CostCalculation';
import { getFile } from '@/services/cost/Cost';
import {
  SimpleTreeSelect,
  SimpleAutoComplete,
} from '@/pages/Component/RapidDevelopment/CommonComponent';
import BatchProcessConfirm from '@/pages/SJTms/Dispatching/BatchProcessConfirm';
import CostBillViewForm from './CostBillViewForm';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

const { Header, Footer, Content } = Layout;
const { RangePicker } = DatePicker;

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class CostBillSearchPageC extends PureComponent {
  //需要操作列的显示 将noActionCol设置为false
  state = {
    ...this.state,
    e: {},
    data: [],
    billState: [],
    isModalVisible: false,
    accessoryModal: false,
    title: '费用台账',
    pageFilter: {
      searchCount: true,
      pageNo: 1,
      pageSize: 20,
    },
    selectCords: [],
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
    let params = [
      {
        field: 'COMPANYUUID',
        rule: 'eq',
        val: [loginCompany().uuid],
      },
      {
        field: 'BMSUUID',
        rule: 'eq',
        val: [loginOrg().uuid],
      },
    ];
    this.props.form.validateFields((err, values) => {
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
      if (values.poject?.value) {
        params = [...params, { field: 'PLAN_UUID', rule: 'eq', val: [values.poject.value] }];
      }
      if (values.state) {
        params = [...params, { field: 'STATE', rule: 'eq', val: [values.state] }];
      }
      queryData.condition = { params };
    });
    dynamicQuery(queryData).then(e => {
      this.setState({ data: e.result, selectCords: [], accessoryModal: false });
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
                    params: [
                      { field: 'NOT_ENABLE', rule: 'eq', val: [0] },
                      {
                        field: 'COMPANYUUID',
                        rule: 'eq',
                        val: [loginCompany().uuid],
                      },
                      {
                        field: 'DISPATCHCENTERUUID',
                        rule: 'eq',
                        val: [loginOrg().uuid],
                      },
                    ],
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
        <Row style={{ margin: '-13px 0px 0px -60px' }}>
          {/* <Popconfirm
            title="费用账单确认对账后无法调整，确认后如有问题请在下期账单调整或联系信息中心同事处理"
            onConfirm={() => this.handleHaveCheck()}
          > */}
          <Button
            type="primary"
            onClick={() => this.handleHaveCheck()}
            style={{ margin: '0px 10px' }}
          >
            确认对账
          </Button>
          {/* </Popconfirm> */}
          <Button type="danger" onClick={() => this.handleConsumed()}>
            核销
          </Button>
        </Row>
      </div>
    );
  };

  drowe = () => {
    const records = this.state.data?.records;
    const { selectCords } = this.state;
    return records && records != 'false' ? (
      <div>
        <Row
          children={records.map(e => {
            let color = selectCords?.includes(e.UUID) ? 'skyblue' : '';
            return (
              <Col style={{ paddingBottom: 15 }} span={6}>
                <Card
                  hoverable
                  key={e.UUID}
                  bodyStyle={{ padding: '15px 10px 10px', backgroundColor: color }}
                  style={{ width: '90%', border: '0.5px solid #3B77E3' }}
                  onClick={() => {
                    if (selectCords.includes(e.UUID)) {
                      let selectCord = selectCords.filter(x => x != e.UUID);
                      this.setState({ selectCords: selectCord });
                    } else {
                      let selectCord = [...selectCords];
                      selectCord.push(e.UUID);
                      this.setState({ selectCords: selectCord });
                    }
                  }}
                >
                  {this.drawBody(e)}
                </Card>
              </Col>
            );
          })}
        />
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
      </div>
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
              width: '60px',
              height: '60px',
              transform: 'rotate(0.1turn)',
              border: 'solid 2px' || stateDict?.TEXT_COLOR,
              borderRadius: '100%',
              textAlign: 'center',
              color: stateDict?.TEXT_COLOR,
              fontSize: '16px',
              fontWeight: 'bold',
              lineHeight: '30px',
              right: '10px',
              bottom: '-20px',
              position: 'absolute',
            }}
          >
            <Col style={{ bottom: '-10px' }}>{e.STATE_CN}</Col>
          </Col>
        </Row>
        <Row>
          <Col>
            单号：
            {e.BILL_NUMBER}
          </Col>
        </Row>
        <Row style={{ float: 'right', marginTop: '20px' }}>
          <Button onClick={() => this.checkDtl(e)} style={{ margin: '0px 10px' }}>
            查看台账
          </Button>

          <Button onClick={() => this.accessoryModalShow(true, e)}>
            <Icon type="upload" />
            附件
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

  accessoryModalShow = (isShow, e) => {
    if (e != 'false' && e.ACCESSORY_NAME) {
      let downloadsName = e.ACCESSORY_NAME.split(',');
      let downloads = [];
      downloadsName.map(c => {
        let param = {
          download: c,
          uuid: e.UUID,
        };
        downloads.push(param);
      });
      // this.setState({ downloads: downloads });
      this.setState({ accessoryModal: isShow, uploadUuid: e.UUID, downloads });
    } else {
      // this.setState({ downloads: [] });
      this.setState({ accessoryModal: isShow, uploadUuid: e.UUID, downloads: [] });
    }
  };

  handleHaveCheck = () => {
    const { selectCords } = this.state;
    if (selectCords.length < 1) {
      message.error('至少选择一条数据');
      return;
    }
    if (selectCords.length == 1) {
      this.haveCheck(selectCords[0]).then(response => {
        if (response && response.success) {
          message.success('确认成功');
          this.handleSarch();
        }
      });
    } else {
      this.batchProcessConfirmRef.show('确认', selectCords, this.haveCheck, this.handleSarch);
    }
  };

  haveCheck = async e => {
    return await haveCheck(e);
  };

  consumed = async e => {
    return await consumed(e);
  };

  handleConsumed = () => {
    const { selectCords } = this.state;
    if (selectCords.length < 1) {
      message.error('至少选择一条数据');
      return;
    }
    if (selectCords.length == 1) {
      this.consumed(selectCords[0]).then(response => {
        if (response && response.success) {
          message.success('核销成功');
          this.handleSarch();
        }
      });
    } else {
      this.batchProcessConfirmRef.show('核销', selectCords, this.consumed, this.handleSarch);
    }
  };

  uploadFile = async (file, fileList) => {
    const { uploadUuid } = this.state;
    var formDatas = new FormData();
    formDatas.append('file', fileList[0]);
    const response = await uploadFile(formDatas, uploadUuid);
    if (response && response.success) {
      message.success('上传成功');
      this.handleSarch();
    }
  };

  download = (item, index) => {
    let parma = {
      uuid: item.uuid,
      index: index,
      fileName: item.download,
    };
    getFile(parma);
  };

  delete = async (item, index) => {
    const response = await deleteFile(item.uuid, item.download, index);
    if (response && response.success) {
      message.success('删除成功');
      this.handleSarch();
    }
  };

  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    return (
      <div>
        <Button
          onClick={() => {
            this.props.switchTab('query');
          }}
        >
          返回
        </Button>
      </div>
    );
  };

  render() {
    const { data, isModalVisible, e, accessoryModal, downloads } = this.state;
    const layout = {
      width: '100%',
      height: '90%',
      backgroundColor: '#ffffff',
    };

    return (
      <PageHeaderWrapper>
        <Spin indicator={LoadingIcon('default')} delay={5} spinning={this.props.loading}>
          <Page withCollect={true}>
            <NavigatorPanel title={this.state.title} action={this.drawActionButton()} />
            <Layout style={layout}>
              <Header style={{ backgroundColor: '#ffffff', height: '10%', marginTop: '1%' }}>
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
          {/* <CostBillDtlSeacrhPage key={e.UUID} params={e} /> */}
          <CostBillViewForm
            key={e.UUID}
            showPageNow="query"
            quickuuid="123"
            {...e}
            {...this.props}
            location={{ pathname: '1' }}
          />
        </Modal>

        <Modal
          title="附件列表"
          visible={accessoryModal}
          onCancel={() => this.accessoryModalShow(false, '')}
          footer={[
            <Row justify="end">
              <Col span={4} offset={16}>
                <Upload
                  name="file"
                  className="upload-list-inline"
                  showUploadList={false}
                  beforeUpload={(file, fileList) => this.uploadFile(file, fileList)}
                  maxCount={1}
                >
                  <Button>
                    <Icon type="upload" />
                    上传
                  </Button>
                </Upload>
              </Col>
              <Col span={4}>
                <Button onClick={() => this.accessoryModalShow(false, '')}>返回</Button>
              </Col>
            </Row>,
          ]}
        >
          <div style={{ overflow: 'auto' }}>
            <List
              bordered
              dataSource={downloads}
              renderItem={(item, index) => (
                <List.Item
                  actions={[
                    <a onClick={() => this.download(item, index)} key="list-loadmore-edit">
                      下载
                    </a>,
                    <a onClick={() => this.delete(item, index)} key="list-loadmore-delete">
                      删除
                    </a>,
                  ]}
                >
                  {item.download}
                </List.Item>
              )}
            />
          </div>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}
