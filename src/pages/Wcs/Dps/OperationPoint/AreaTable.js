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
class AreaTable extends PureComponent {

  static propTypes = {
    handleSelectRows: PropTypes.func,
    handleAreaEdit: PropTypes.func,
    handleAreaModalVisible: PropTypes.func,
    handleBatchProcessConfirmModalVisible: PropTypes.func,
    loading: PropTypes.bool,
    data: PropTypes.object,
    selectedRows: PropTypes.array,
    handleAreaTableChange: PropTypes.func,
    handleRemoveArea: PropTypes.func,
    removeAreaForTable: PropTypes.func,
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
    if (this.props.handleSelectRows) {
      this.props.handleSelectRows(rows);
    }
    this.setState({
      selectedRowKeys: rows,
    });
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.props.handleAreaTableChange(pagination, filters, sorter);
  }

  handleDelete = (record) => {
    this.props.removeAreaForTable(record, true);
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
      return operationPointLocal.all + number + operationPointLocal.number + operationPointLocal.area;
    }
  }

  render() {
    const { selectedRowKeys } = this.state;
    const {
      data: { list, pagination },
      loading,
      handleAreaEdit,
      handleBatchProcessConfirmModalVisible,
      taskTypeMap,
      handleAreaModalVisible
    } = this.props;

    const columns = [
      {
        title: operationPointLocal.areaNum,
        dataIndex: 'code',
        sorter: true,
        width: colWidth.codeColWidth,
      },
      {
        title: operationPointLocal.areaName,
        dataIndex: 'name',
        width: colWidth.codeColWidth,
      },
      {
        title: operationPointLocal.areaOrder,
        dataIndex: 'facilityOrder',
        sorter: true,
        width: colWidth.sourceBillNumberColWidth,
      },
      {
        title: commonLocale.operateLocale,
        width: colWidth.operateColWidth,
        render: (text, record) => (
          <span>
            <a href="javascript:;"
               onClick={() => handleAreaEdit(record)}
            >
              {commonLocale.editLocale}
            </a>
            <Divider type="vertical" />
            <IPopconfirm onConfirm={() => this.handleDelete(record)}
                         operate={commonLocale.deleteLocale}
                         object={operationPointLocal.area}>
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
                onClick={() => handleAreaModalVisible(true)}
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

export default AreaTable;
