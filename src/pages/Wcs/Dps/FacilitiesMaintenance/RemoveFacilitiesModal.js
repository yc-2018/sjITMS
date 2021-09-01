import React, { PureComponent } from 'react';
import { Modal } from 'antd';
import styles from './FacilitiesMaintenance.less';
import { formatMessage, getLocale } from 'umi/locale';
import facilitiesMaintenanceLocale from './FacilitiesMaintenanceLocale';
import PropTypes from 'prop-types';

class RemoveFacilitiesModal extends PureComponent {

  static propTypes = {
    entity: PropTypes.object,
    confirmLoading: PropTypes.bool,
    deleteConfrimModalVisible: PropTypes.bool,
    handleDeleteConfirm: PropTypes.func,
    handleDeleteCancel: PropTypes.func,
  }

  /**
   * 国际化 - 删除提示
   */
  renderConfirmTips = () => {
    const { entity } = this.props;

    if (getLocale() === 'en-US') {
      return 'Whether to delete facilitiesMaintenance [' + entity.code + ']?'
    } else if (getLocale() === 'zh-CN') {
      return facilitiesMaintenanceLocale.makeSureDeleteFirst + entity.code + facilitiesMaintenanceLocale.makeSureDeleteLast;
    }
  }

  render() {
    const {
      confirmLoading,
      deleteConfrimModalVisible,
      handleDeleteConfirm,
      handleDeleteCancel,
    } = this.props;

    return (
      <Modal
        visible={deleteConfrimModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmLoading={confirmLoading}
      >
        <p className={styles.deleteConfirmTips}>
          {this.renderConfirmTips()}
        </p>
      </Modal>
    )
  }
}

export default RemoveFacilitiesModal;
