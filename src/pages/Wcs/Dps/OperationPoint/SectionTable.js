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
class SectionTable extends PureComponent {

  static propTypes = {
    handleSelectRows: PropTypes.func,
    handleSectionEdit: PropTypes.func,
    handleSectionModalVisible: PropTypes.func,
    handleBatchProcessConfirmModalVisible: PropTypes.func,
    loading: PropTypes.bool,
    data: PropTypes.object,
    selectedRows: PropTypes.array,
    handleSectionTableChange: PropTypes.func,
    handleRemoveSection: PropTypes.func,
    removeSectionForTab:  PropTypes.func
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
    this.props.handleSectionTableChange(pagination, filters, sorter);
  }

  handleDelete = (record) => {
    this.props.removeSectionForTab(record, true);
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
      return operationPointLocal.all + number + operationPointLocal.number + operationPointLocal.section;
    }
  }

  render() {
    const { selectedRowKeys } = this.state;
    const {
      data: { list, pagination },
      loading,
      handleSectionEdit,
      handleBatchProcessConfirmModalVisible,
      taskTypeMap,
      handleSectionModalVisible
    } = this.props;

    const columns = [
      {
        title: operationPointLocal.sectionNum,
        dataIndex: 'code',
        sorter: true,
        width: colWidth.codeColWidth,
      },
      {
        title: operationPointLocal.sectionName,
        dataIndex: 'name',
        width: colWidth.codeColWidth,
      },
      {
        title: operationPointLocal.sectionOrder,
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
               onClick={() => handleSectionEdit(record)}
            >
              {commonLocale.editLocale}
            </a>
            <Divider type="vertical" />
            <IPopconfirm onConfirm={() => this.handleDelete(record)}
                         operate={commonLocale.deleteLocale}
                         object={operationPointLocal.section}>
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
                onClick={() => handleSectionModalVisible(true)}
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

export default SectionTable;
