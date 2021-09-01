import React, { PureComponent, Fragment } from 'react';
import { Table, Icon, Popconfirm, Button, Empty, Divider } from 'antd';
import { formatMessage, getLocale } from 'umi/locale';
import PropTypes from 'prop-types';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import PageLoading from '@/components/PageLoading';
import StandardTable from '@/components/StandardTable';
import emptySvg from '@/assets/common/img_empoty.svg';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { commonLocale } from '@/utils/CommonLocale';
import operationPointLocal  from './OperationPointLocal';
import styles from './operationPoint.less';
import { colWidth } from '@/utils/ColWidth';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { Usage } from './TagUsage';
import { Type } from '@/pages/Wcs/Dps/FacilitiesMaintenance/TagState';
class BinTable extends PureComponent {

  static propTypes = {
    handleSelectRows: PropTypes.func,
    handleBinEdit: PropTypes.func,
    handleBinAddModalVisible: PropTypes.func,
    handleBatchProcessConfirmModalVisible: PropTypes.func,
    loading: PropTypes.bool,
    data: PropTypes.object,
    selectedRows: PropTypes.array,
    handleBinTableChange: PropTypes.func,
    handleRemoveBin: PropTypes.func
  }

  state = {
    selectedRowKeys: []
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedRows.length === 0) {
      this.setState({
        selectedRowKeys: [],
      });
    }
  }

  handleSelectRows = rows => {
    // if (this.props.handleSelectRows) {
    //   this.props.handleSelectRows(rows);
    // }
    this.setState({
      selectedRowKeys: rows,
    });
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.props.handleBinTableChange(pagination, filters, sorter);
  }

  handleDelete = (record) => {
    this.props.handleRemoveBin(record, true);
  }


  /**
   * 国际化 - 表格中删除确认文字
   */
  confirmDeleteTips = () => {
    return operationPointLocal.makeSureDelete + "?";
  }

  renderTableAlert = (number) => {
    if (getLocale() === 'en-US') {
      let s = '';
      if (number > 1) {
        s = 's';
      }
      return 'Total ' + number + ' controller' + s;
    } else if (getLocale() === 'zh-CN') {
      return operationPointLocal.all + number + operationPointLocal.number + operationPointLocal.bin;
    }
  }

  render() {
    const { selectedRowKeys } = this.state;
    const {
      data: { list, pagination },
      loading,
      handleBinEdit,
      handleBatchProcessConfirmModalVisible,
      taskTypeMap,
      handleBinAddModalVisible
    } = this.props;

    const columns = [
      {
        title: operationPointLocal.binNum,
        dataIndex: 'bin.code',
        width: colWidth.codeColWidth,
      },
      {
        title: operationPointLocal.binOrder,
        dataIndex: 'bin.facilityOrder',
        width: colWidth.codeColWidth,
      },
      {
        title: operationPointLocal.nodeAddress,
        dataIndex: 'facilityEquipmentEntity.equipment.address',
        width: colWidth.codeColWidth,
      },
      {
        title: operationPointLocal.nodeType,
        width: colWidth.codeColWidth,
        render: (text, record) => (
          <span>
            {record.facilityEquipmentEntity && record.facilityEquipmentEntity.equipment ?
            Type[record.facilityEquipmentEntity.equipment.cls].caption : null}
          </span>
        )
      },
      {
        title: operationPointLocal.nodeUsage,
        width: colWidth.sourceBillNumberColWidth,
        // render: record => Usage[record.facilityEquipmentEntity.usage].caption
        render: (text, record) => (
          <span>
            {record.facilityEquipmentEntity && record.facilityEquipmentEntity.usage ?
              Usage[record.facilityEquipmentEntity.usage].caption : null}
          </span>
        )
      },
      {
        title: commonLocale.operateLocale,
        width: colWidth.operateColWidth,
        render: (text, record) => (
          <span>
            <a href="javascript:;"
               onClick={() => handleBinEdit(record)}
            >
              {commonLocale.editLocale}
            </a>
            <Divider type="vertical" />
            <IPopconfirm onConfirm={() => this.handleDelete(record)}
                         operate={commonLocale.deleteLocale}
                         object={operationPointLocal.bin}>
              <a>{commonLocale.deleteLocale}</a>
            </IPopconfirm>
          </span>
        ),
      },
    ];

    const paginationProps = {
      total: this.props.data.list ? this.props.data.pagination.total : 0,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '50', '100', '200'],
      showTotal: total => `共 ${total} 条`,
      ...pagination,
    };

    const tableLoading = {
      spinning: loading,
      indicator: LoadingIcon('default')
    }

    return (
      <div className={styles.standardTable}>
        <div>
          <div className={styles.tableAlert}>
            <span>{this.renderTableAlert(this.props.data.list ? this.props.data.pagination.total : 0)}</span>
            <div className={styles.rightBtnWrapper} style={{ float: 'right' }}>
              <Button style={{ marginRight: '8px' }}
                      onClick={() => handleBatchProcessConfirmModalVisible(true, 'delete')}>
                {operationPointLocal.batchRemove}
              </Button>
              <Button
                type="primary"
                onClick={() => handleBinAddModalVisible(true)}
              >
                {operationPointLocal.createBtn}
              </Button>
            </div>
          </div>
          <StandardTable
            selectedRows={selectedRowKeys}
            rowKey={record => record.uuid}
            loading={tableLoading}
            data={this.props.data}
            columns={columns}
            onSelectRow={this.handleSelectRows}
            pagination={paginationProps}
            onChange={this.handleTableChange} />
        </div>
      </div>
    );
  }
}

export default BinTable;
