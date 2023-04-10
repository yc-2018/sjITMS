import React, { PureComponent } from 'react';
import styles from './index.less';
import { formatMessage } from 'umi/locale';
import { Button, Icon, message } from 'antd';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import defaultSettings from '../../defaultSettings';

class Result extends PureComponent {
  state = {
    uploading: true,
    result: {
      successCount: 0,
      errorCount: 0,
      errorDownloadUrl: '',
    },
  };

  componentDidMount() {
    this.uploadFile();
  }

  uploadFile = () => {
    const { uploading, result } = this.state;
    const { fileKey, uploadType, uploadParams, dispatch } = this.props;

    this.setState({
      uploading: true,
    });

    dispatch({
      type: uploadType,
      payload: { fileKey, ...uploadParams },
      callback: response => {
        if (response && response.success) {
          let data = response.data;
          if (data) {
            let msg = formatMessage({ id: 'common.excelImport.result.message.success.import' });

            if (data.successCount == 0 && data.errorCount > 0) {
              message.error(
                formatMessage({ id: 'common.excelImport.result.message.error.import' })
              );
            } else if (data.successCount > 0 && data.errorCount > 0) {
              msg += formatMessage({ id: 'common.excelImport.result.message.success.someError' });
              message.warn(msg);
            } else if (data.successCount == 0 && data.errorCount == 0) {
              message.warn(formatMessage({ id: 'common.excelImport.result.message.error.noData' }));
            } else if (data.successCount > 0 && data.errorCount == 0) {
              message.success(msg);
            }

            result.successCount = data.successCount;
            result.errorCount = data.errorCount;
            result.errorDownloadUrl = data.errorDownloadUrl;
            this.setState({
              result: result,
            });
            this.props.callback && this.props.callback(data.successData);
          }
        } else {
          message.error(
            formatMessage({ id: 'common.excelImport.result.message.error.import' }) +
              response.message
          );
        }
        this.setState({
          uploading: false,
        });
      },
    });
  };

  render() {
    const { uploading, result } = this.state;

    const { fileName, prev, downloadFile } = this.props;

    return (
      <div className={styles.result}>
        {uploading ? (
          <div className={styles.uploading}>
            <Icon
              className={styles.icon}
              type="loading"
              style={{ color: defaultSettings.primaryColor, fontSize: '48px' }}
              spin
            />
            <span>{formatMessage({ id: 'common.excelImport.result.tips.importing' })}</span>
          </div>
        ) : (
          <div className={styles.detail}>
            <div className={styles.fileName}>
              <Icon
                type="file-excel"
                style={{ color: defaultSettings.primaryColor, fontSize: '24px' }}
                theme="filled"
              />
              <span>{fileName}</span>
            </div>
            <div className={styles.report}>
              <span>{formatMessage({ id: 'common.excelImport.result.tips.importSituation' })}</span>
              <div className={styles.detail}>
                <span>
                  <Icon type="check" style={{ color: 'green' }} />{' '}
                  {formatMessage({ id: 'common.excelImport.result.tips.successed' })}{' '}
                  {result.successCount}
                  &nbsp;
                  {formatMessage({ id: 'common.excelImport.result.tips.record' })}
                </span>
                <br />
                <span>
                  <Icon type="close" style={{ color: 'red' }} />{' '}
                  {formatMessage({ id: 'common.excelImport.result.tips.failed' })}{' '}
                  {result.errorCount}
                  &nbsp;
                  {formatMessage({ id: 'common.excelImport.result.tips.record' })}
                </span>
              </div>
            </div>

            <div className={styles.operate}>
              {result.errorDownloadUrl &&
                result.errorCount > 0 && (
                  <Button
                    type="primary"
                    ghost
                    style={{ display: 'block' }}
                    onClick={() => downloadFile(result.errorDownloadUrl, false)}
                  >
                    {formatMessage({ id: 'common.excelImport.result.button.downloadFailed' })}
                  </Button>
                )}
              <br />
              <Button type="primary" style={{ display: 'block' }} onClick={() => prev()}>
                {formatMessage({ id: 'common.excelImport.result.button.continueImport' })}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Result;
