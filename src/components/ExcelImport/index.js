import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { formatMessage } from 'umi/locale';
import styles from './index.less';
import {
  Steps,
  Icon,
  Button,
  message,
} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NavigatorPanel from '@/components/MyComponent/NavigatorPanel';
import PageDetail from '@/components/MyComponent/PageDetail';
import Select from './Select';
import Result from './Result';

const Step = Steps.Step;
/**
 * title{string}:提供页眉标题
 * templateType{string}:提供下载模板
 * uploadType{string}:提供model定义上传接口类型
 * uploadParams{object}:上传接口参数
 * cancelCallback{func}:取消按钮回调
 * dispatch{func}:提供调用的上传接口
 */

/**
 * 分步Excel导入组件
 */
class ExcelImport extends PureComponent {

  static propTypes = {
    title: PropTypes.string,
    templateType: PropTypes.string,
    uploadType: PropTypes.string,
    uploadParams: PropTypes.object,
    cancelCallback: PropTypes.func,
    dispatch: PropTypes.func,
  }

  state = {
    current: 0,
    fileKey: '',
    fileName: '',
  };

  /**
   * 下一步
   */
  next = () => {
    const current = this.state.current + 1;
    this.setState({ current });
  }

  /**
   * 上一步
   */
  prev = () => {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  setFileKey = (fileKey) => {
    this.setState({
      fileKey: fileKey,
    })
  }

  setFileName = (fileName) => {
    this.setState({
      fileName: fileName,
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

  importCallback = (result) => {
    this.setState({
      successData: result
    });
  }

  render() {
    const {
      title,
      uploadType,
      uploadParams,
      cancelCallback,
      dispatch,
      templateType
    } = this.props;

    const {
      current,
      fileKey,
      fileName,
    } = this.state;

    const pageTitle = formatMessage({ id: 'common.excelImport.title' }) + title;

    const selectProps = {
      templateType: templateType,
      setFileKey: this.setFileKey,
      setFileName: this.setFileName,
      next: this.next,
      downloadFile: this.downloadFile,
    }

    const resultProps = {
      fileKey: fileKey,
      fileName: fileName,
      uploadType: uploadType,
      uploadParams: uploadParams,
      prev: this.prev,
      dispatch: dispatch,
      downloadFile: this.downloadFile,
      callback: this.importCallback
    }

    const actionBtn = (
      <Fragment>
        <Button onClick={() => cancelCallback(this.state.successData)}>
          {formatMessage({ id: 'common.button.back' })}
        </Button>
      </Fragment>
    );

    const pageDetailProps = {
      title: pageTitle,
      action: actionBtn,
    }
    if (this.props.styleType === 'config') {
      return (
        <PageDetail {...pageDetailProps}>
          <div className={styles.excelImport}>
            <Steps current={current}>
              <Step key='1' title={formatMessage({ id: 'common.excelImport.step1.tips' })} />
              <Step key='2' title={formatMessage({ id: 'common.excelImport.step2.tips' })} />
            </Steps>
            <div className="steps-content">
              {
                current === 0 && <Select {...selectProps} />
              }
              {
                current === 1 && <Result {...resultProps} />
              }
            </div>
          </div>
        </PageDetail>
      )
    } else {
      return (
        <PageHeaderWrapper>
          <PageDetail {...pageDetailProps}>
            <div className={styles.excelImport}>
              <Steps current={current}>
                <Step key='1' title={formatMessage({ id: 'common.excelImport.step1.tips' })} />
                <Step key='2' title={formatMessage({ id: 'common.excelImport.step2.tips' })} />
              </Steps>
              <div className="steps-content">
                {
                  current === 0 && <Select {...selectProps} />
                }
                {
                  current === 1 && <Result {...resultProps} />
                }
              </div>
            </div>
          </PageDetail>
        </PageHeaderWrapper>
      )
    }
  }
}

export default ExcelImport;
