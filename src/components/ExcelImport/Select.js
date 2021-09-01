import React, { PureComponent } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import { formatMessage } from 'umi/locale';
import {
  Button,
  Upload,
  Icon,
  message,
  Badge,
} from 'antd';
import configs from '@/utils/config'
import { OSS_UPLOAD_URL } from '@/utils/constants';
import {loginKey} from '@/utils/LoginContext';

const Dragger = Upload.Dragger;

const allowedExcelType = ['application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];


@connect(({ imTemplate, loading }) => ({
  imTemplate,
  loading: loading.models.imTemplate,
}))
class Select extends PureComponent {
  state = {
    isUploaded: false,
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
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error(formatMessage({ id: 'common.excelImport.select.fileSizeLimit' }));
    }
    return isExcel && isLt2M;
  }

  handleChange = (info) => {
    if (info.file.status === 'done') {
      let key = info.file.response.data;

      this.props.setFileKey(key);
      this.props.setFileName(info.file.name);
      this.setState({
        isUploaded: true,
      })
      message.info(formatMessage({ id: 'common.excelImport.select.nextTips' }));
    } else if (info.file.status === 'error') {
      message.error(formatMessage({ id: 'common.excelImport.select.ossErrorTips' }));
      this.setState({
        isUploaded: false,
      })
    }
  }

  downloadTemplate = () => {
    const { templateUrl, downloadFile,templateType } = this.props;

    if (!templateType) {
      message.error(formatMessage({ id: 'common.excelImport.select.templateEmptyTips' }))
      return;
    }

    const { dispatch } = this.props;
    dispatch({
      type:'imTemplate/getPath',
      payload:{
        type:templateType
      },
      callback:response=>{
        if(response&&response.success){
          if(response.data){
            downloadFile(response.data);
          }else{
            message.error(formatMessage({ id: 'common.excelImport.select.templateEmptyTips' }))
            return;
          }
        }
      }
    });
  }

  render() {
    const { isUploaded } = this.state;
    const { next, templateUrl,returnResult } = this.props;

    const draggerProps = {
      name: 'file',
      multiple: false,
      action: configs[API_ENV].API_SERVER + OSS_UPLOAD_URL,
      beforeUpload: this.beforeUpload,
      headers: { iwmsJwt: loginKey() },
      withCredentials: true,
      onChange: this.handleChange
    }

    return (
      <div className={styles.select}>
        <div className={styles.downloadTemplate}>
          <Badge status="processing" className={styles.badge} />
          <span>{formatMessage({ id: 'common.excelImport.select.templateTips' })}</span>
          <Button type="primary" className={styles.downloadBtn} onClick={() => this.downloadTemplate()}>
            {formatMessage({ id: 'common.excelImport.select.button.downloadTemplate' })}
          </Button>
        </div>

        <div className={styles.upload}>
          <Dragger {...draggerProps}>
            <p className="ant-upload-drag-icon">
              <Icon type="upload" />
            </p>

            <p className="ant-upload-text">{formatMessage({ id: 'common.excelImport.select.uploadText' })}</p>
          </Dragger>
          <p className={styles.typeTips}>{formatMessage({ id: 'common.excelImport.select.uploadTips' })}</p>

          <br /><br />
          {isUploaded &&
          <div>
            <br />
            <center>
              <Button type="primary" ghost className={styles.nextBtn} onClick={() => next()}>
                {formatMessage({ id: 'common.excelImport.select.button.next' })}
              </Button>
            </center>
          </div>
          }
        </div>

        <div className={styles.tips}>
          <span>{formatMessage({ id: 'common.excelImport.select.tips.title' })}</span>
          <div>
            {formatMessage({ id: 'common.excelImport.select.tips.1' })}<br />
            {formatMessage({ id: 'common.excelImport.select.tips.2' })}<br />
            {formatMessage({ id: 'common.excelImport.select.tips.3' })}<br />
            {formatMessage({ id: 'common.excelImport.select.tips.4' })}
          </div>
        </div>
      </div>
    )
  }
}

export default Select;
