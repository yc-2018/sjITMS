import React, { PureComponent } from 'react';
import { Modal } from 'antd';
import { formatMessage, getLocale } from 'umi/locale';
import operationPointLocal from './OperationPointLocal';
import PropTypes from 'prop-types';

class RemoveFacilitiesModal extends PureComponent {

  static propTypes = {
    entity: PropTypes.object,
    confirmLoading: PropTypes.bool,
    deleteConfirmModalVisible: PropTypes.bool,
    handleDeleteConfirm: PropTypes.func,
    handleDeleteCancel: PropTypes.func,
  }

  /**
   * 国际化 - 删除提示
   */
  renderConfirmTips = () => {
    const { entity } = this.props;

    if (getLocale() === 'en-US') {
      return 'Whether to delete [' + entity.code + entity.name + '] area?'
    } else if (getLocale() === 'zh-CN') {
      return operationPointLocal.makeSureDeleteFirst + entity.code + entity.name + operationPointLocal.makeSureDeleteLast;
    }
  }

  render() {
    const {
      confirmLoading,
      deleteConfirmModalVisible,
      handleDeleteConfirm,
      handleDeleteCancel,
    } = this.props;

    return (
      <Modal
        visible={deleteConfirmModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmLoading={confirmLoading}
      >
        <p>
          {this.renderConfirmTips()}
        </p>
      </Modal>
    )
  }
}

export default RemoveFacilitiesModal;
