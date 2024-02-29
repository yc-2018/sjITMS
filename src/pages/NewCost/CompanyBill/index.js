import React, { Component } from 'react';
import {
  queryColumnsByOpen,
  queryDataByDbSource,
  childUploadFile,
  getUploadFile,
  childDownload,
  deleteChildFile,
  reconciliation,
  invoice,
} from '@/services/bms/OpenApi';
import StandardTable from '@/pages/Component/RapidDevelopment/CommonLayout/RyzeStandardTable/index';
import {
  Button,
  Switch,
  Badge,
  Icon,
  Modal,
  Row,
  Col,
  Upload,
  List,
  message,
  Popconfirm,
} from 'antd';
import CostBillDtlSearchPage from './CostBillDtlSearchPage';
import FileViewer from 'viewerjs-react';

export default class index extends Component {
  state = {
    col: [
      {
        dataIndex: 'ERROR',
        title: '查询异常',
        width: 100,
      },
    ],
    dataSource: [],
    dbSource: '',
    isModalVisible: false,
    accessoryModal: false,
    billDownloads: [],
    downloads: [],
    showViewer: false,
    fileType: '',
    filePath: '',
    selectRowKeys: [],
    selectedRows: [],
    // showReconciliation: false,
    // showInvoice: false,
  };

  columnComponent = {
    view: (val, column, record) => {
      return (
        <a
          onClick={() => this.onView(record)}
          style={{ color: this.colorChange(val, column.textColorJson) }}
        >
          {this.convertData(val, column.preview, record)}
        </a>
      );
    },
    otherView: (val, column, record) => {
      const value = this.convertData(val, column.preview, record);
      return value != '<空>' ? (
        <a
          onClick={() => this.onOtherView(record, column)}
          style={{ color: this.colorChange(val, column.textColorJson) }}
        >
          {value}
        </a>
      ) : (
        <p3>{value}</p3>
      );
    },
    switch: (val, column, record) => {
      return (
        <Switch
          checkedChildren="启用"
          unCheckedChildren="禁用"
          checked={val == 1}
          onClick={e => this.changeOpenState(e, record, column)}
        />
      );
    },
    colorBadge: (val, column, record) => {
      return (
        <div>
          <Badge
            color={this.colorChange(val, column.textColorJson)}
            text={this.convertData(val, column.preview, record)}
          />
        </div>
      );
    },
    p3: (val, column, record) => {
      return <p3>{this.convertData(val, column.preview, record)}</p3>;
    },
  };

  componentDidMount = () => {
    //获取列配置
    this.queryColumns();
  };

  //获取列配置
  queryColumns = async () => {
    const { showReconciliation, showInvoice } = this.state;
    const param = {
      reportCode: 'cost_child_bill',
      sysCode: 'tms',
    };
    const response = await queryColumnsByOpen(param);
    if (response && response.success) {
      const columns = response.result.columns;
      let col = [];
      columns.map(column => {
        if (column.isShow) {
          const c = {
            title: column.fieldTxt,
            dataIndex: column.fieldName,
            width: column.fieldWidth,
            render: (val, record) => this.getRender(val, column, record),
          };
          col.push(c);
        }
      });
      this.setState({ col, dbSource: response.result.reportHead.dbSource });
      //获取表数据
      this.queryData(response.result.reportHead.dbSource);
    }
  };

  getRender = (val, column, record) => {
    let component = this.columnComponent.p3(val, column, record);
    return this.customize(record, this.convertData(val, column.preview, record), component, column);
  };

  //自定义报表的render
  customize(record, val, component, column) {
    let e = {
      column: column,
      record: record,
      component: component,
      val: val,
      // props: { ...commonPropertis, ...fieldExtendJson },
    };

    //自定义报表的render
    this.drawcell(e);

    return e.component;
  }

  //扩展render
  drawcell = e => {
    if (e.column.fieldName == 'BILL_NUMBER') {
      const component = <a onClick={() => this.checkDtl(e)}>{e.record.BILL_NUMBER}</a>;
      e.component = component;
    }
    if (e.column.fieldName === 'TOTALAMOUNT') {
      const fontColor = e.val === '<空>' || e.val >= 0 ? 'black' : 'red';
      const component = <a style={{ color: fontColor }}>{e.val}</a>;
      e.component = component;
    }
    if (e.column.fieldName == 'ACCESSORY') {
      let accessory = e.val == '<空>' ? 0 : e.val.split(',').length;
      // let billAccessory =
      //   e.record.BILL_ACCESSORY != undefined ? e.record.BILL_ACCESSORY.split(',').length : 0;
      // let count = accessory + billAccessory;
      const component = (
        <Button onClick={() => this.accessoryModalShow(true, e.record)}>
          <Icon type="upload" />
          附件（
          {accessory}）
        </Button>
      );
      e.component = component;
    }
  };

  accessoryModalShow = (isShow, e) => {
    let downloads = [];
    let billDownloads = [];
    if (e != 'false' && e.ACCESSORY_NAME) {
      let downloadsName = e.ACCESSORY_NAME.split(',');
      let accessory = e.ACCESSORY.split(',');
      downloadsName.map((data, index) => {
        let param = {
          download: data,
          accessory: accessory[index],
          uuid: e.UUID,
        };
        downloads.push(param);
      });
    }
    if (e != 'false' && e.BILL_ACCESSORY_NAME) {
      let downloadsName = e.BILL_ACCESSORY_NAME.split(',');
      let accessory = e.BILL_ACCESSORY.split(',');
      downloadsName.map((data, index) => {
        let param = {
          download: data,
          accessory: accessory[index],
          uuid: e.UUID,
        };
        billDownloads.push(param);
      });
    }
    this.setState({ accessoryModal: isShow, uploadUuid: e.UUID, downloads, billDownloads });
  };

  //数据转换
  convertData = (data, preview, record) => {
    if (data === '' || data == undefined || data === '[]') return '<空>';
    if (!preview) return data;
    const convert = record[preview] || '<空>';
    return convert;
  };

  queryData = async dbSource => {
    const groupInfo = this.props.computedMatch.params[0];
    let filter = { superQuery: { matchType: 'and', queryParams: [] } };
    filter.superQuery.queryParams = [
      { field: 'GROUPINFO', type: 'VarChar', rule: 'eq', val: groupInfo },
    ];
    filter.order = 'BILL_NUMBER,desc';
    filter.quickuuid = 'cost_child_bill';
    filter.dbSource = dbSource;
    const response = await queryDataByDbSource(filter);
    if (response && response.success) {
      this.setState({ dataSource: response.data.records });
    }
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
  //上传附件
  uploadFile = async (file, fileList, type) => {
    const { uploadUuid } = this.state;
    var formDatas = new FormData();
    formDatas.append('file', fileList[0]);
    const response = await childUploadFile(formDatas, uploadUuid, type);
    if (response && response.success) {
      message.success('上传成功');
      this.setState({ accessoryModal: false });
      this.onSearch();
    }
  };

  //预览附件
  preview = async item => {
    const type = item.accessory.split('.')[item.accessory.split('.').length - 1];
    getUploadFile(item.accessory).then(res => {
      if (type == 'pdf') {
        window.open(URL.createObjectURL(res));
      } else {
        this.setState({
          showViewer: true,
          filePath: window.URL.createObjectURL(new Blob([res])),
          fileType: type,
        });
      }
    });
  };

  //下载附件
  download = (item, index, type) => {
    let parma = {
      uuid: item.uuid,
      index: index,
      fileName: item.download,
      type: type,
    };
    childDownload(parma);
  };

  //删除附件
  delete = async (item, index, type) => {
    const response = await deleteChildFile(item.uuid, item.download, index, type);
    if (response && response.success) {
      message.success('删除成功');
      this.setState({ accessoryModal: false });
      this.onSearch();
    }
  };

  handleSelectRows = (rows, rowKeys) => {
    this.setState({
      selectedRows: rows,
      selectRowKeys: rowKeys,
    });
    this.changeSelectedRows && this.changeSelectedRows(rows);
  };

  handleReconciliation = async () => {
    const { selectedRows, dbSource } = this.state;
    if (selectedRows.length == 0 || selectedRows.length > 1) {
      message.error('请选择一份账单进行操作！');
      return;
    }
    const response = await reconciliation('child', selectedRows[0].UUID);
    if (response && response.success) {
      message.success('操作成功！');
      this.queryData(dbSource);
    }
  };

  handleInvoice = async () => {
    const { selectedRows, dbSource } = this.state;
    if (selectedRows.length == 0 || selectedRows.length > 1) {
      message.error('请选择一份账单进行操作！');
      return;
    }
    const response = await invoice('child', selectedRows[0].UUID);
    if (response && response.success) {
      message.success('操作成功！');
      this.queryData(dbSource);
    }
  };

  render() {
    const {
      isModalVisible,
      e,
      accessoryModal,
      downloads,
      billDownloads,
      showViewer,
      filePath,
    } = this.state;
    return (
      <div>
        <div>
          <Button
            style={{ margin: '0.5rem 1rem' }}
            onClick={() => {
              this.handleReconciliation();
            }}
            type="primary"
          >
            对账确认
          </Button>
          <Button
            type="primary"
            onClick={() => {
              this.handleInvoice();
            }}
          >
            票据确认
          </Button>
        </div>
        <StandardTable
          dataSource={this.state.dataSource}
          columns={this.state.col}
          size="middle"
          colTotal={[]}
          onSelectRow={this.handleSelectRows}
          // width="800"
        />
        <Modal
          visible={isModalVisible}
          onOk={this.handleOk.bind()}
          onCancel={this.handleCancel.bind()}
          width={'90%'}
          bodyStyle={{ height: 'calc(82vh)', overflowY: 'auto' }}
        >
          <CostBillDtlSearchPage
            key={e == undefined ? new Date() : e.val}
            quickuuid="123"
            {...e}
            // {...this.props}
            location={{ pathname: '1' }}
          />
        </Modal>

        <Modal
          title="附件列表"
          visible={accessoryModal}
          onCancel={() => this.accessoryModalShow(false, '')}
          footer={[
            <Row justify="end">
              <Col span={6} offset={13}>
                <Upload
                  name="file"
                  className="upload-list-inline"
                  showUploadList={false}
                  beforeUpload={(file, fileList) => this.uploadFile(file, fileList, 'invoice')}
                  maxCount={1}
                >
                  <Button>
                    <Icon type="upload" />
                    上传发票
                  </Button>
                </Upload>
              </Col>
              {/* <Col span={6}>
                <Upload
                  name="file"
                  className="upload-list-inline"
                  showUploadList={false}
                  beforeUpload={(file, fileList) => this.uploadFile(file, fileList, 'bill')}
                  maxCount={1}
                >
                  <Button>
                    <Icon type="upload" />
                    上传账单
                  </Button>
                </Upload>
              </Col> */}
              <Col span={4}>
                <Button onClick={() => this.accessoryModalShow(false, '')}>返回</Button>
              </Col>
            </Row>,
          ]}
        >
          <div>发票</div>
          <div style={{ overflow: 'auto' }}>
            <List
              bordered
              dataSource={downloads}
              renderItem={(item, index) => (
                <List.Item
                  actions={[
                    <a onClick={() => this.preview(item)}>预览</a>,
                    <a
                      onClick={() => this.download(item, index, 'invoice')}
                      key="list-loadmore-edit"
                    >
                      下载
                    </a>,
                    <a
                      onClick={() => this.delete(item, index, 'invoice')}
                      key="list-loadmore-delete"
                    >
                      删除
                    </a>,
                  ]}
                >
                  {item.download}
                </List.Item>
              )}
            />
          </div>
          {/* <Divider />
          <div>账单</div>
          <div style={{ overflow: 'auto' }}>
            <List
              bordered
              dataSource={billDownloads}
              renderItem={(item, index) => (
                <List.Item
                  actions={
                    [
                      // <a onClick={() => this.preview(item)}>预览</a>,
                      // <a onClick={() => this.download(item, index, 'bill')} key="list-loadmore-edit">
                      //   下载
                      // </a>,
                      // <a onClick={() => this.delete(item, index, 'bill')} key="list-loadmore-delete">
                      //   删除
                      // </a>,
                    ]
                  }
                >
                  {item.download}
                </List.Item>
              )}
            />
          </div> */}
        </Modal>
        <Modal
          title="附件预览"
          visible={showViewer}
          footer={null}
          onCancel={() => {
            this.setState({ showViewer: false });
          }}
          centered={true}
          bodyStyle={{
            height: 'calc(38vh)',
            display: 'table-cell',
            verticalAlign: 'middle',
            textAlign: 'center',
          }}
        >
          <FileViewer>
            <img src={filePath} width={'60%'} />
            <div>(点击查看大图)</div>
          </FileViewer>
        </Modal>
      </div>
    );
  }
}
