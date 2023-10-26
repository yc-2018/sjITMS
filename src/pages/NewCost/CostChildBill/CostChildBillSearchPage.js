/*
 * @Author: Liaorongchang
 * @Date: 2023-08-08 17:06:51
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-10-26 10:57:35
 * @version: 1.0
 */
import { Form, Modal, Button, Icon, Row, Col, Upload, List, message, Spin } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import {
  childUploadFile,
  deleteChildFile,
  childDownload,
  getUploadFile,
} from '@/services/cost/CostBill';
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
    //找到fieldName为CODE这一列 更改它的component
    if (e.column.fieldName == 'BILL_NUMBER') {
      const component = <a onClick={() => this.checkDtl(e)}>{e.record.BILL_NUMBER}</a>;
      e.component = component;
    }
    if (e.column.fieldName == 'ACCESSORY') {
      let count = e.val == '<空>' ? 0 : e.val.split(',').length;
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
    if (e != 'false' && e.ACCESSORY_NAME) {
      let downloadsName = e.ACCESSORY_NAME.split(',');
      let accessory = e.ACCESSORY.split(',');
      let downloads = [];
      downloadsName.map((data, index) => {
        let param = {
          download: data,
          accessory: accessory[index],
          uuid: e.UUID,
        };
        downloads.push(param);
      });
      this.setState({ accessoryModal: isShow, uploadUuid: e.UUID, downloads });
    } else {
      this.setState({ accessoryModal: isShow, uploadUuid: e.UUID, downloads: [] });
    }
  };

  uploadFile = async (file, fileList) => {
    const { uploadUuid } = this.state;
    var formDatas = new FormData();
    formDatas.append('file', fileList[0]);
    const response = await childUploadFile(formDatas, uploadUuid);
    if (response && response.success) {
      message.success('上传成功');
      this.setState({ accessoryModal: false });
      this.onSearch();
    }
  };
  //下载附件
  download = (item, index) => {
    let parma = {
      uuid: item.uuid,
      index: index,
      fileName: item.download,
    };
    childDownload(parma);
  };
  //删除附件
  delete = async (item, index) => {
    const response = await deleteChildFile(item.uuid, item.download, index);
    if (response && response.success) {
      message.success('删除成功');
      this.setState({ accessoryModal: false });
      this.onSearch();
    }
  };
  //预览附件
  preview = async item => {
    this.setState({ showViewer: true });
    const type = item.accessory.split('.')[item.accessory.split('.').length - 1];
    getUploadFile(item.accessory).then(res => {
      this.setState({
        filePath: res,
        fileType: type,
      });
    });
  };

  drawOtherCom = () => {
    const {
      isModalVisible,
      accessoryModal,
      downloads,
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
                    <a onClick={() => this.preview(item)}>预览</a>,
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
            <Spin/>
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
