import { connect } from 'dva';
import { Button, message, Modal, Form, Input, Spin , Upload, Icon, Layout } from 'antd';
import React, { PureComponent } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import ConfirmProgress from '@/pages/Component/Progress/ConfirmProgress';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import ToolbarPanel from '@/pages/Component/Page/inner/ToolbarPanel';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg, loginKey } from '@/utils/LoginContext';
const { Dragger } = Upload;
const { Content, Sider } = Layout;
const allowedExcelType = ['application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
import SiderPage from '@/pages/Component/Page/SiderPage';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import styles from '@/pages/Component/Page/inner/SiderPage.less';
import configs from '@/utils/config'
import { OSS_UPLOAD_URL } from '@/utils/constants';
import BillImportSearchForm from './BillImportSearchForm';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import Empty from '@/pages/Component/Form/Empty';
import { billImportLocale } from './BillImportLocale';
import styles2 from '@/components/ExcelImport/index.less';
@connect(({ billImport, loading }) => ({
  billImport,
  loading: loading.models.billImport,
}))
@Form.create()
export default class BillImportPage extends SiderPage {
  constructor(props) {
    super(props);
    this.state = {
      siderWidth: '600',
      style: {
        marginBottom: '0px'
      },
      siderStyle: {
        boxShadow: '0px 0px 0px 0px rgba(59,119,227,0.24)',
        // overflow: 'auto',
        // minHeight: document.body.clientHeight,
        // height: document.body.clientHeight - 210
      },
      contentStyle: {
        marginLeft: '0px',
        borderRadius: '4px',
        height: document.body.clientHeight - 210,
        overflow: 'auto',
        minHeight: document.body.clientHeight,
      },
      isUploaded: false,
      fileKey: undefined,
      fileName: undefined,
      entity: {},
      billImportResult: undefined,
      owner: undefined,
      billType: undefined,
      showOrNot: false,
      uploadFileList: [],
      result: {
        successCount: null,
        errorCount: null,
        errorDownloadUrl: '',
      }
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.billImport.data.entity) {
      this.setState({
        entity: nextProps.billImport.data.entity
      });
    }
  }
  drawOtherCom = () => {
    return <div>
      <NavigatorPanel title={'单据导入'} action={this.drawActionButton ? this.drawActionButton() : ''} />
      <BillImportSearchForm owner={this.state.owner} billType={this.state.billType}
                            refresh={this.onSearch}
                            onReset={this.onReset}
                            billImport={this.billImport}
                            onViewBillImportMould={this.onViewBillImportMould}
                            mouldString={this.state.entity && this.state.entity.code ? convertCodeName(this.state.entity) : <Empty />} />
    </div>;
  }
  componentDidMount() {
    let owner = this.props.billImport.owner;
    let billType = this.props.billImport.billType;
    if (!owner || !billType)
      return;
    this.setState({
      owner: owner,
      billType: billType
    });
    this.props.dispatch({
      type: 'billImport/getByOwnerAndBillType',
      payload: {
        ownerUuid: owner.uuid,
        billType: billType
      }
    });
  }
  onSearch = (data) => {
    let ownerUuid = undefined;
    let billType = undefined;
    if (data) {
      if (data.owner) {
        ownerUuid = JSON.parse(data.owner).uuid;
      }
      billType = data.billType;
    }
    if (!ownerUuid || !billType)
      return;
    this.props.dispatch({
      type: 'billImport/getByOwnerAndBillType',
      payload: {
        ownerUuid: ownerUuid,
        billType: billType
      }
    });
    if(this.state.result) {
      this.state.result.errorDownloadUrl = '';
      this.setState({
        result: { ...this.state.result }
      });
    }
  }
  onReset = () => {
    this.setState({
      owner: undefined,
      billType: undefined,
      billImportResult: undefined
    });
    this.props.dispatch({
      type: 'billImport/clearImportInfo'
    });
  }
  billImport = () => {
    const { entity, fileKey, isUploaded, result } = this.state;
    if (!entity || !entity.uuid) {
      message.error("请选择模板");
      return;
    }
    if (!isUploaded) {
      message.error("请先上传文件");
      return;
    }
    if(entity && entity.uuid && isUploaded) {
      this.setState({
        showOrNot: true
      });
    }
    this.props.dispatch({
      type: 'billImport/billImport',
      payload: {
        fileKey: fileKey,
        mouldUuid: entity.uuid
      },
      callback: (response) => {
        if (response && response.success && response.data) {
          this.setState({
            billImportResult: response.data,
            isUploaded: false,
            uploadFileList: [],
            showOrNot: false
          })
            let data = response.data;
            if (data) {
              let msg = '';
              if (data.errorCount > 0) {
                msg = '批量导入失败，请下载失败文件查看';
                message.warn(msg);
              }
              if (data.successCount === 0 && data.errorCount === 0) {
                message.warn(formatMessage({ id: 'common.excelImport.result.message.error.noData' }));
              }
              result.successCount = data.successCount;
              result.errorCount = data.errorCount;
              result.errorDownloadUrl = data.errorDownloadUrl;
              this.setState({
                result: result
              });
            }
           if(data && !data.errorDownloadUrl && data.successCount > 0 && data.errorCount === 0 ) {
              message.success('导入成功');
              this.setState({
                result: {
                  successCount: 1,
                  errorCount: 0,
                  errorDownloadUrl: '',
                }
              });
            }
        }
      }
    });
  }
  onViewBillImportMould = () => {
    this.props.dispatch({
      type: 'billImport/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  beforeUpload = (file, fileList) => {
    let isExcel = false;
    allowedExcelType.map(type => {
      if (type === file.type) {
        isExcel = true;
      }
    })
    if (!isExcel) {
      message.error(formatMessage({ id: 'common.excelImport.select.excelLimit' }));
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error(formatMessage({ id: 'common.excelImport.select.fileSizeLimit' }));
      return false;
    }
    this.setState({
      uploadFileList: fileList
    });
    return isExcel && isLt2M;
  }
  handleChange = (info) => {
    if (info.file.status === 'done') {
      let key = info.file.response.data;
      let fileName = info.fileList ? info.fileList[0].name : '';
      this.setState({
        isUploaded: true,
        fileKey: key,
        fileName: fileName
      })
      message.info("文件：" + fileName + "上传成功，请导入！");
    } else if (info.file.status === 'error') {
      message.error(formatMessage({ id: 'common.excelImport.select.ossErrorTips' }));
      this.setState({
        isUploaded: false,
      })
    }
  }
  onRemove = (file) => {
    const { uploadFileList } = this.state;
    const index = uploadFileList.indexOf(file);
    const newFileList = uploadFileList.slice();
    newFileList.splice(index, 1);
    this.setState({
      uploadFileList: newFileList,
      isUploaded: false
    });
  }

  downloadFile = (sUrl) => {
    // IOS devices do not support downloading. We have to inform user about this.
    if (/(iP)/g.test(navigator.userAgent)) {
      message.warn('Your device does not support files downloading. Please try again in desktop browser.');
      return false;
    }

    let isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    let isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;
    // If in Chrome or Safari - download via virtual link click
    if (isChrome || isSafari) {
      // Creating new link node.
      var link = document.createElement('a');
      link.href = sUrl;

      if (link.download !== undefined) {
        // Set HTML5 download attribute. This will prevent file from opening if supported.
        var fileName = sUrl.substring(sUrl.lastIndexOf('/') + 1, sUrl.length);
        link.download = fileName;
      }

      // Dispatching click event.
      if (document.createEvent) {
        var e = document.createEvent('MouseEvents');
        e.initEvent('click', true, true);
        link.dispatchEvent(e);
        return true;
      }
    }

    window.open(sUrl, '_self');
    return true;
  }

  drawSider = () => {
    const props = {
      name: 'file',
      multiple: false,
      action: configs[API_ENV].API_SERVER + OSS_UPLOAD_URL,
      beforeUpload: this.beforeUpload,
      headers: { iwmsJwt: loginKey() },
      withCredentials: true,
      onChange: this.handleChange,
      onRemove: this.onRemove,
      fileList: this.state.uploadFileList,
      height: '200px'
    };
    return <Dragger {...props}>
      <div>
        <p className="ant-upload-drag-icon">
          <Icon type="upload" />
        </p>
        <p className="ant-upload-text">{formatMessage({ id: 'common.excelImport.select.uploadText' })}</p>
        <br /><br />
        <p className={styles.typeTips}>{formatMessage({ id: 'common.excelImport.select.uploadTips' })}</p>
      </div>
    </Dragger>;
  }
  drawContent = () => {
    const { billImportResult, showOrNot, result } = this.state;
    let noteItems = [];
    if (billImportResult && billImportResult.success) {
      let billNumberStr = "";
      billImportResult.billNumbers.forEach((billNumber, index) => {
        if (index == billImportResult.billNumbers.length - 1)
          billNumberStr = billNumberStr + billNumber + "。"
        else
          billNumberStr = billNumberStr + billNumber + "、"
      });
      noteItems.push({
        label: billImportLocale.executeSuccess,
        value: "单号：" + billNumberStr
      });
    } else if (billImportResult && !billImportResult.success) {
      noteItems.push({
        label: billImportLocale.executeFail,
        value: billImportResult.errorMessage
      });
    }
    return <div>
      <div style={{marginTop:'20px'}}>
        {!result.errorDownloadUrl && result.successCount > 0 && <div className={styles2.report}>
          <span>{formatMessage({ id: 'common.excelImport.result.tips.importSituation' })}</span>
          <div className={styles2.detail}>
            <div style={{marginTop:'20px'}}>
              <Icon type="check"
                    style={{ color: 'green' }}/> {'全部导入成功'}
            </div>
          </div>
        </div>
        }
        {!result.errorDownloadUrl && result.successCount === 0 && result.errorCount === 0 && <div className={styles2.report}>
          <span>{formatMessage({ id: 'common.excelImport.result.tips.importSituation' })}</span>
          <div className={styles2.detail}>
            <div style={{marginTop:'20px'}}>
              <Icon type="close"
                    style={{ color: 'red' }}/> {'全部导入失败'}
            </div>
          </div>
        </div>
        }
        {result.errorDownloadUrl && result.errorCount > 0 && <div className={styles2.report}>
          <span>{formatMessage({ id: 'common.excelImport.result.tips.importSituation' })}</span>
          <div className={styles2.detail}>
                {/*<span>*/}
                  {/*<Icon type="check"*/}
                        {/*style={{ color: 'green' }}/> {formatMessage({ id: 'common.excelImport.result.tips.successed' })} {result.successCount}*/}
                  {/*&nbsp;{formatMessage({ id: 'common.excelImport.result.tips.record' })}*/}
                {/*</span><br/>*/}
            <div style={{marginTop:'20px'}}>
                  <Icon type="close"
                        style={{ color: 'red' }}/> {formatMessage({ id: 'common.excelImport.result.tips.failed' })} {result.errorCount}
              &nbsp;{formatMessage({ id: 'common.excelImport.result.tips.record' })}
                  </div>
          </div>
        </div>
        }
        {result.errorDownloadUrl && result.errorCount > 0 &&
        <Button type="primary" ghost style={{display: 'block', marginTop:'20px'}} onClick={() => this.downloadFile(result.errorDownloadUrl)}>
          {formatMessage({ id: 'common.excelImport.result.button.downloadFailed' })}
        </Button>
        }
      </div>
    </div>
  }
}
