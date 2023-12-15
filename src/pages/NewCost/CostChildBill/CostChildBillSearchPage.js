/*
 * @Author: Liaorongchang
 * @Date: 2023-08-08 17:06:51
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-12-15 10:52:13
 * @version: 1.0
 */
import { Form, Modal, Button, Icon, Row, Col, Upload, List, message, Spin, Divider } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import {
  childUploadFile,
  deleteChildFile,
  childDownload,
  getUploadFile,
} from '@/services/bms/CostBill';
import CostChildBillDtlSearchPage from './CostChildBillDtlSearchPage';
import FileViewer from 'react-file-viewer';

@connect(({ quick, deliveredConfirm, loading }) => ({
  quick,
  deliveredConfirm,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
@Form.create()
export default class CostChildBillSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    noNavigator: true,
    // scroll: { x: false, y: false },
    // hasSettingColumns: false,
    divstyle: { marginRight: '10px' },
    isModalVisible: false,
    accessoryModal: false,
    showViewer: false,
    fileType: '',
    filePath: '',
    billDownloads: [],
    downloads: [],
  };

  componentDidMount() {
    this.props.onRef && this.props.onRef(this);
    this.queryCoulumns();
    this.getCreateConfig();
  }

  exSearchFilter = () => {
    return [
      {
        field: 'BILL_UUID',
        type: 'VarChar',
        rule: 'eq',
        val: this.props.billUuid,
      },
    ];
  };

  changeState = () => {
    let tableWidth = 0;
    for (const item of this.columns) {
      tableWidth += item.width;
    }
    this.setState({ scroll: { x: tableWidth, y: false } });
  };

  drawToolbarPanel = () => {};

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
      let billAccessory =
        e.record.BILL_ACCESSORY != undefined ? e.record.BILL_ACCESSORY.split(',').length : 0;
      let count = accessory + billAccessory;
      const component = (
        <Button onClick={() => this.accessoryModalShow(true, e.record)}>
          <Icon type="upload" />
          附件（
          {count}）
        </Button>
      );
      e.component = component;
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
  //预览附件
  preview = async item => {
    // this.setState({ showViewer: true });
    const type = item.accessory.split('.')[item.accessory.split('.').length - 1];
    getUploadFile(item.accessory).then(res => {
      if (res.type == 'application/pdf') {
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

  drawOtherCom = () => {
    const {
      isModalVisible,
      accessoryModal,
      downloads,
      billDownloads,
      e,
      filePath,
      fileType,
      showViewer,
    } = this.state;
    return (
      <>
        <Modal
          visible={isModalVisible}
          onOk={this.handleOk.bind()}
          onCancel={this.handleCancel.bind()}
          width={'90%'}
          bodyStyle={{ height: 'calc(82vh)', overflowY: 'auto' }}
        >
          <CostChildBillDtlSearchPage
            key={e == undefined ? new Date() : e.val}
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
          // key={uploadUuid}
          footer={[
            <Row justify="end">
              <Col span={6} offset={8}>
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
              <Col span={6}>
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
              </Col>
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
          <Divider />
          <div>账单</div>
          <div style={{ overflow: 'auto' }}>
            <List
              bordered
              dataSource={billDownloads}
              renderItem={(item, index) => (
                <List.Item
                  actions={[
                    <a onClick={() => this.preview(item)}>预览</a>,
                    <a onClick={() => this.download(item, index, 'bill')} key="list-loadmore-edit">
                      下载
                    </a>,
                    <a onClick={() => this.delete(item, index, 'bill')} key="list-loadmore-delete">
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
        <Modal
          title="附件预览"
          visible={showViewer}
          footer={null}
          onCancel={() => {
            this.setState({ showViewer: false });
          }}
          centered={true}
          width={'80%'}
          bodyStyle={{ height: 'calc(84vh)', overflowY: 'auto' }}
        >
          {filePath == '' ? (
            <Spin />
          ) : (
            <FileViewer
              fileType={fileType}
              filePath={filePath}
              errorComponent={''}
              onError={err => console.log(err)}
            />
          )}
        </Modal>
      </>
    );
  };
}
