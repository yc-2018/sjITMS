import React, { PureComponent } from 'react';
import { Modal } from 'antd';
import { formatMessage, getLocale } from 'umi/locale';
import styles from './operationPoint.less';

/**
 * 确认离开提示 (按钮级别)
 */
const operationPointFacilityTypeLocale = {
  'JOBPOINT': '作业点',
  'AREA': '分区',
  'SECTION': '区段'
}
export default class RemoveModal extends PureComponent {

  /**
   * 国际化 - 确认离开提示
   */
  renderRemoveConfirmTips = (title) => {
    const { record } = this.props;
    if (getLocale() === 'en-US') {
      return "Are you sure to remove bins with the " + title + " ?";
    } else if (getLocale() === 'zh-CN') {
      return "确认要删除" + title + "`" + record.code + "`吗？";
    }
  }

  handleCancel = () => {
    const { handleRemoveModalVisible } = this.props;
    handleRemoveModalVisible();
  };

  handleRemoveOk = () => {
    const {
      handleRemove,
      operationPointFacilityType,
      record
    } = this.props;

    handleRemove(record, operationPointFacilityType);
  }

  render() {
    const { confirmRemoveVisible, confirmLoading,
      ModalTitle, operationPointFacilityType } = this.props;

    const textInfo = operationPointFacilityTypeLocale[operationPointFacilityType];

    return (
      <div>
        <Modal
          title={ModalTitle}
          visible={confirmRemoveVisible}
          onOk={this.handleRemoveOk}
          onCancel={this.handleCancel}
          confirmLoading={confirmLoading}
          destroyOnClose={true}
        >
          <p className={styles.leaveTips}>
            {this.renderRemoveConfirmTips(textInfo)}
          </p>
        </Modal>
      </div>
    );
  }
}
