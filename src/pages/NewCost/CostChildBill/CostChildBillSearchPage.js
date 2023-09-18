/*
 * @Author: Liaorongchang
 * @Date: 2023-08-08 17:06:51
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-09-11 14:48:48
 * @version: 1.0
 */
import { Form, Modal, Button, Icon, Row, Col, Upload, List, message } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
// import { haveCheck, consumed, uploadFile, deleteFile } from '@/services/cost/CostCalculation';
import { childUploadFile, deleteChildFile, childDownload } from '@/services/cost/CostBill';

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
      const component = (
        <Button onClick={() => this.accessoryModalShow(true, e.record)}>
          <Icon type="upload" />
          附件
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
      let downloads = [];
      downloadsName.map(c => {
        let param = {
          download: c,
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

  download = (item, index) => {
    let parma = {
      uuid: item.uuid,
      index: index,
      fileName: item.download,
    };
    childDownload(parma);
  };

  delete = async (item, index) => {
    const response = await deleteChildFile(item.uuid, item.download, index);
    if (response && response.success) {
      message.success('删除成功');
      this.setState({ accessoryModal: false });
      this.onSearch();
    }
  };

  drawOtherCom = () => {
    const { isModalVisible, accessoryModal, downloads, e } = this.state;
    return (
      <>
        <Modal
          visible={isModalVisible}
          onOk={this.handleOk.bind()}
          onCancel={this.handleCancel.bind()}
          width={'90%'}
          bodyStyle={{ height: 'calc(82vh)', overflowY: 'auto' }}
        >
          <span>aaaaa</span>
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
      </>
    );
  };
}
