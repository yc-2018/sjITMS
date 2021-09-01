import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import update from 'immutability-helper';
import PropTypes from 'prop-types';
import { Table, Icon, Popconfirm, Button, Empty, Input, Tabs, message, Divider, Modal, InputNumber } from 'antd';
import StandardTable from '@/components/StandardTable';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import PageLoading from '@/components/PageLoading';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { loginCompany, loginOrg, loginStore } from '@/utils/LoginContext';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import ConfirmProgress from '@/pages/Component/Progress/ConfirmProgress';
import { pickOrderLocale } from './PickOrderLocale';
import OrderAddStoreModal from './OrderAddStoreModal';
import { PICKORDER_RES } from './PickOrderPermission';
import styles from './PickOrder.less';
const TabPane = Tabs.TabPane;
const taskTypeMap = { delete: 'delete' };
import { STORE_RES } from '@/pages/Basic/Store/StorePermission';
import { routerRedux } from 'dva/router';

@connect(({ storepickorder, loading }) => ({
  storepickorder,
  loading: loading.models.storepickorder,
}))
class StorePickOrderPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      pageFilter: {},
      selectedPickOrder: props.selectedPickOrder,
      pageFilter: {
        page: 0,
        pageSize: 10,
        sortFields: {},
        searchKeyValues: {},
      },
      storePickOrderItems: [],
      itemsPagination: {},
      addStoreModalVisible: false,
      selectedRows: {},// 右侧选中行
      // 进度条相关
      batchProcessConfirmModalVisible: false,
      isCloseFailedResultModal: false,
      taskInfo: {
        total: 0,
        type: '',
      },
      failedTasks: [],
      adjModalVisible: false,
      confirmLoading: false,
      ordeNum: 1,
      orderUuid: "",
      storeUuid: "",
    };
    this.state.pageFilter.searchKeyValues = {
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid
    }
  }
  componentDidMount() {
    this.queryStoreOrder();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedPickOrder != this.props.selectedPickOrder) {
      this.setState({
        selectedPickOrder: nextProps.selectedPickOrder
      });
      this.queryStoreOrder(nextProps.selectedPickOrder.uuid);
    }
    // 查询对应的门店拣货顺序
    if (nextProps.storepickorder.data.list) {
      this.setState({
        storePickOrderItems: nextProps.storepickorder.data.list,
        itemsPagination: {
          ...nextProps.storepickorder.data.pagination,
          showSizeChanger: true,
          showQuickJumper: true,
        },
      })
    } else {
      this.setState({
        storePickOrderItems: [],
        itemsPagination: false
      })
    }
  }

  /**
   * 查询选中拣货顺序对应包含的门店信息
   */
  queryStoreOrder = (orderUuid) => {
    const { dispatch } = this.props;
    const { storePickOrderItems, pageFilter, selectedPickOrder } = this.state;

    pageFilter.searchKeyValues['orderUuid'] = orderUuid ? orderUuid : selectedPickOrder.uuid;

    dispatch({
      type: 'storepickorder/query',
      payload: pageFilter,
    });
  }


  /**
   * 批量删除
   */
  handleBatchRemove = () => {
    this.handleBatchProcessConfirmModalVisible(true);
  }
  /**
   * 顺序添加门店 - 弹窗控制
   */
  handleAddStoreModalVisible = (flag) => {
    this.setState({
      addStoreModalVisible: !!flag,
    })
  }
  /**
   * 顺序添加门店 - 取消
   */
  handleAddStoreCancel = () => {
    this.handleAddStoreModalVisible(false);
  }
  /**
   * 顺序添加门店 - 保存
   */
  handleSaveStore = (list) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'storepickorder/onSaveItem',
      payload: {
        stores: list,
        orderUuid: this.state.selectedPickOrder.uuid,
      },
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.handleAddStoreModalVisible(false);
          this.queryStoreOrder();
        }
      }
    })
  }

  /**
   * 表格发生变化时调用
   */
  handleTableChange = (pagination, filters, sorter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    pageFilter.page = pagination.current - 1;
    pageFilter.pageSize = pagination.pageSize;
    pageFilter.searchKeyValues['orderUuid'] = this.state.selectedPickOrder.uuid;
    pageFilter.searchKeyValues['dcUuid'] = loginOrg().uuid;
    pageFilter.searchKeyValues['companyUuid'] = loginCompany().uuid;

    if (sorter.field) {
      var sortField = `${sorter.field}`;
      var sortType = sorter.order === 'descend' ? true : false;
      pageFilter.sortFields[sortField] = sortType;
    }

    this.setState({
      pageFilter: pageFilter,
    });

    dispatch({
      type: 'storepickorder/query',
      payload: pageFilter,
    });
  }

  /**
   * 遍历删除门店拣货顺序
   */
  handleRemoveItem = () => {
    const { selectedRows } = this.state;
    if (selectedRows) {
      let bacth = (i) => {
        if (i < selectedRows.length) {
          this.handleRemoveStorePickOrder(selectedRows[i], false, true).then(res => {
            bacth(i + 1)
          })
        }
      }

      bacth(0);
    }
  }

  /**
   * 删除
   */
  handleRemoveStorePickOrder = (record, isRefreshView, isRecordCompletion) => {
    const { dispatch } = this.props;
    const that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'storepickorder/onRemoveItem',
        payload: {
          uuid: record.uuid,
        },
        callback: response => {
          if (response && response.success) {
            if (isRecordCompletion) {
              that.refs.batchHandle.calculateTaskSuccessed();
              resolve({ success: response.success });
            }
            if (isRefreshView) {
              message.success(commonLocale.removeSuccessLocale)
              that.queryStoreOrder();
            }
          } else {
            if (isRecordCompletion) {
              that.refs.batchHandle.calculateTaskFailed();
              that.collectFaildedTask(record);
              resolve({ success: response.success });
            }

            if (isRefreshView) {
              message.error(response.message);
              that.queryStoreOrder();
            }
          }
          that.setState({
            selectedRows: [],
            selectedRowKeys: [],
          })
        },
      });
    });
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRowKeys,
      selectedRows: selectedRows
    });
  };

  /**
   * 设置条件
   *  */
  setText = (text) => {
    this.setState({
      searchText: text
    });
  };

  /**
   * 搜索
   * */
  handleSearch = (confirm) => {
    const { pageFilter, selectedPickOrder } = this.state;
    pageFilter.searchKeyValues['storeCodeAndName'] = this.state.searchText;

    pageFilter.page = 0;
    this.queryStoreOrder();
    confirm();
  };
  /**
   * 重置
   */
  handleReset = clearFilters => {
    const { pageFilter } = this.state;
    delete pageFilter.searchKeyValues.storeCodeAndName;
    this.setState({
      searchText: ''
    });
    clearFilters();
    this.queryStoreOrder();
  };
  /**
   * 条件查询
   */
  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={placeholderLocale(commonLocale.inStoreLocale)}
          value={this.state.searchText}
          onChange={e => this.setText(e.target.value ? e.target.value : undefined)}
          onPressEnter={() => this.handleSearch(confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={
            () => this.handleSearch(confirm)
          }
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          {formatMessage({ id: 'company.index.search.button.search' })}
        </Button>
        <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
          {formatMessage({ id: 'company.index.search.button.reset' })}
        </Button>
      </div>
    ),
    filterIcon: () => (
      <Icon type="search" style={{ color: this.state.searchText ? '#1890ff' : undefined }} />
    ),
    render: val =>
      <a onClick={this.onViewStore.bind(true, val ? val.uuid : undefined)}
        disabled={!havePermission(STORE_RES.VIEW)}><EllipsisCol colValue={convertCodeName(val)} /> </a>,
  });


  onViewStore = (storeUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/store',
      payload: {
        showPage: 'view',
        entityUuid: storeUuid
      }
    }));
  }


  //  -----进度条相关计算  开始-----

  /**
   * 收集批量处理产生的失败任务
   */
  collectFaildedTask = (record) => {
    const { failedTasks } = this.state;
    if (failedTasks.indexOf(record) == -1) {
      failedTasks.push(record);
      this.setState({
        failedTasks: failedTasks,
      })
    }
  }

  /**
   * 确认执行任务之前回调
   */
  taskConfirmCallback = () => {
    this.setState({
      batchProcessConfirmModalVisible: false,
    })
  }

  /**
   * 重试取消
   */
  retryCancelCallback = () => {
    this.terminateProgress();
  };

  /**
   * progress流程结束
   */
  terminateProgress = () => {
    const { pageFilter, selectedPickOrder } = this.state;
    pageFilter.page = 0
    this.queryStoreOrder();
    this.setState({
      batchProcessConfirmModalVisible: false,
      selectedRows: [],
    });
  }

  /**
   * 批量处理弹出框显示处理
   */
  handleBatchProcessConfirmModalVisible = (flag, taskType) => {
    const { selectedRows } = this.state;
    if (selectedRows.length == undefined || selectedRows.length == 0) {
      message.warn(pickOrderLocale.progressWarn);
      return;
    }
    if (flag) {
      const { taskInfo } = this.state;
      taskInfo.total = selectedRows.length;
      taskInfo.type = taskType;

      this.setState({
        taskInfo: taskInfo,
      });
    }

    this.setState({
      batchProcessConfirmModalVisible: !!flag,
    });
  };

  /**
   * 批量执行具体函数包装
   */
  taskExecutionFuncWrapper = () => {
    this.handleRemoveItem();
  }

  /**
   * 任务执行出错时回调，用于重试
   */
  taskFailedCallback = () => {
    const { taskInfo, selectedRows, failedTasks } = this.state;

    // 关掉错误提示
    this.setState({
      isCloseFailedResultModal: false,
      batchProcessConfirmModalVisible: false,
    })

    if (failedTasks.length == 1) {
      // 直接执行
      switch (taskInfo.type) {
        case taskTypeMap['delete']:
          this.handleRemoveStore(failedTasks[0], true, false);
          break;
        default:
          console.error('错误执行类型');
      }
    } else if (failedTasks.length > 1) {
      // 将执行失败的任务加入到selectedRows
      this.setState({
        selectedRows: failedTasks
      })
      // 继续进行批处理
      this.handleBatchProcessConfirmModalVisible(true, taskInfo.type);
    }
  };

  /**
   * 任务全部执行成功时回调
   */
  taskSuccessedCallback = () => {
    this.terminateProgress();
  }

  /**
   * 任务取消执行
   */
  taskCancelCallback = () => {
    this.setState({
      batchProcessConfirmModalVisible: false,
    })
  }

  // -----进度条相关计算  结束-----

  setModalVisible = (orderUuid, storeUuid) => {
    this.setState({
      adjModalVisible: true,
      orderUuid: orderUuid,
      storeUuid: storeUuid,
      ordeNum: '1',
    });
  }

  handOk = () => {
    const { pageFilter, orderUuid, storeUuid, ordeNum } = this.state;
    if (!ordeNum || ordeNum === null || ordeNum === '') {
      message.error('序号不能为空。');
      return;
    }
    var payload = {
      pickOrderUuid: orderUuid,
      storeUuid: storeUuid,
      orderNo: ordeNum,
    }
    this.props.dispatch({
      type: 'storepickorder/adjust',
      payload: { ...payload },
      callback: response => {
        if (response && response.success) {
          pageFilter.page = 0;
          this.queryStoreOrder();
        }
      }
    });
    this.setState({
      adjModalVisible: false
    });
  }

  handCanl = () => {
    this.setState({
      adjModalVisible: false
    });
  }

  stateChange = () => {
    this.setState({
      confirmLoading: false
    })
  }

  onAdjChange = value => {
    this.setState({ordeNum: value});
  }

  render() {
    const { selectedRowKeys, itemsPagination, storePickOrderItems, taskInfo,
      batchProcessConfirmModalVisible, isCloseFailedResultModal, failedTasks,
      selectedPickOrder, addStoreModalVisible
    } = this.state;
    const {
      handleBatchProcessConfirmModalVisible, form
    } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const columns = [
      {
        title: pickOrderLocale.orderNo,
        key: 'orderNo',
        dataIndex: 'orderNo',
        width: colWidth.codeColWidth,
        sorter: true
      },
      {
        title: commonLocale.inStoreLocale,
        dataIndex: 'store',
        width: colWidth.codeNameColWidth + 100,
        render: record => <EllipsisCol colValue={convertCodeName(record)} />,
        ...this.getColumnSearchProps('store'),
      },
      {
        title: pickOrderLocale.tabPickOrderTitle,
        dataIndex: 'pickOrder',
        width: colWidth.codeNameColWidth + 100,
        render: record => <EllipsisCol colValue={convertCodeName(record)} />
      },
      {
        title: commonLocale.operateLocale,
        render: (text, record) => (
          <Fragment>
             <a onClick={() => this.setModalVisible(record.pickOrder.uuid, record.store.uuid)}>
              调序
            </a>
            <Divider type="vertical" />
            <IPopconfirm onConfirm={() => this.handleRemoveStorePickOrder(record, true, false)}
              operate={commonLocale.deleteLocale}
              object={pickOrderLocale.title}>
              <a disabled={!havePermission(PICKORDER_RES.DELETE)}>
                {commonLocale.deleteLocale}
              </a>
            </IPopconfirm>
          </Fragment>
        ),
      },
    ];

    columns.forEach(e => {
      if (e.width) {
        e.onCell = () => {
          return {
            style: {
              maxWidth: e.width,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }
          }
        }
      }
    });

    const progressProps = {
      taskInfo: taskInfo,
      entity: pickOrderLocale.progressTitle,
      action: pickOrderLocale.progressTitle,
      batchProcessConfirmModalVisible: batchProcessConfirmModalVisible,
      isCloseFailedResultModal: isCloseFailedResultModal,
    }

    const progressMethods = {
      taskConfirmCallback: this.taskConfirmCallback,
      taskCancelCallback: this.taskCancelCallback,
      taskFailedCallback: this.taskFailedCallback,
      taskSuccessedCallback: this.taskSuccessedCallback,
      retryCancelCallback: this.retryCancelCallback,
      taskExecutionFunc: this.taskExecutionFuncWrapper,
    }

    const addStoreModalProps = {
      entity: selectedPickOrder,
      confirmLoading: this.props.loading,
      dispatch: this.props.dispatch,
      addStoreModalVisible: addStoreModalVisible,
      handleAddStoreCancel: this.handleAddStoreCancel,
      handleSaveStore: this.handleSaveStore,
      storeOrderItems: storePickOrderItems,
      component: 'pickup',
      schemeUuid: selectedPickOrder.schemeUuid
    }

    return (
      <div>
        <div className={styles.tabsWrapper}>
          <div className={styles.storeButtonGrops}>
            <Button style={{ marginLeft: '6%', float: 'right' }} type="primary"
              onClick={() => this.handleAddStoreModalVisible(true)}
              disabled={!havePermission(PICKORDER_RES.CREATE)}
            >
              添加门店
            </Button>
            <Button style={{ float: 'right' }}
              onClick={() => this.handleBatchRemove(commonLocale.deleteLocale)}
              disabled={!havePermission(PICKORDER_RES.DELETE)}
            >
              {commonLocale.batchRemoveLocale}
            </Button>
          </div>
          <Tabs defaultActiveKey="1">
            <TabPane tab={pickOrderLocale.tabPickOrderTitle} key="1">
              <StandardTable
                rowKey={record => record.uuid}
                className={styles.standardTable}
                columns={columns}
                pagination={itemsPagination}
                dataSource={storePickOrderItems}
                onChange={this.handleTableChange}
                rowSelection={rowSelection}
              />
            </TabPane>
            <TabPane tab={pickOrderLocale.tabOperateInfoTitle} key="2" onChange>
              <EntityLogTab entityUuid={this.state.selectedPickOrder.uuid} />
            </TabPane>
          </Tabs>
        </div>
        <ConfirmProgress {...progressProps} {...progressMethods} ref="batchHandle" />
        {addStoreModalVisible && <OrderAddStoreModal {...addStoreModalProps} />}
        <Modal
          title="序号调整"
          visible={this.state.adjModalVisible}
          onOk={() => this.handOk()}
          onCancel={() => this.handCanl()}
          afterClose={this.stateChange()}
          destroyOnClose={true}
        >
        &nbsp;&nbsp;&nbsp; 目标序号： <InputNumber min={1} defaultValue={1} onChange={value => this.onAdjChange(value)}/>
        </Modal>
      </div>
    );
  }
}
export default StorePickOrderPage;
