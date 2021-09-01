import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage, getLocale } from 'umi/locale';
import moment from 'moment';
import { Form, Button, message, Divider, Popconfirm, Switch} from 'antd';
import { STATE, STATUS } from '@/utils/constants';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { commonLocale } from '@/utils/CommonLocale';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import SearchPanel from '@/pages/Component/Page/inner/SearchPanel';
import Page from '@/pages/Component/Page/inner/Page';
import ToolbarPanel from '@/pages/Component/Page/inner/ToolbarPanel';
import ConfirmProgress from '@/pages/Component/Progress/ConfirmProgress';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { CompanySimpleSearchForm } from './CompanySearchForm';
import CompanyDetail from './CompanyDetail';
import CompanyCreate from './CompanyCreate';
import OperateCol from '@/pages/Component/Form/OperateCol';

const FormItem = Form.Item;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const taskTypeMap = { enable: 'enable', disable: 'disable' };

@connect(({ company, loading }) => ({
  company,
  loading: loading.models.company,
}))
@Form.create()
class Company extends PureComponent {
  state = {
    selectedRows: [],
    formValues: {},
    pageFilter: {
      page: 0,
      pageSize: 10,
      sortFields: {},
      searchKeyValues: {},
      likeKeyValues: {},
    },
    editCompany: {},
    selectedCompany: {},
    showDetailView: false,
    showCreateView: false,
    showDetailEditForm: false,
    batchProcessConfirmModalVisible: false,
    isCloseFailedResultModal: false,
    taskInfo: {
      total: 0,
      type: taskTypeMap['enable'],
    },
    failedTasks: [],
  };
  
  columns = [
    {
      title: formatMessage({ id: 'company.index.table.column.code' }),
      dataIndex: 'code',
      sorter: true,
      render: (val, record) => <a onClick={this.onView.bind(this, record.uuid)}>{val}</a>,
    },
    {
      title: formatMessage({ id: 'company.index.table.column.name' }),
      dataIndex: 'name',
      sorter: true,
    },
    {
      title: formatMessage({ id: 'company.index.table.column.validDate' }),
      dataIndex: 'validDate',
      render: val => <span>{val ? moment(val).format('YYYY-MM-DD') : null}</span>,
    },
    {
      title: formatMessage({id:'company.index.table.column.remainingDays'}),
      render: record =>{
        let validDate = Date.parse(record.validDate);
        let nowDate = Date.parse(moment(new Date()).format('YYYY-MM-DD'));
        let remainingDays = parseInt(((validDate - nowDate) / 1000 / 3600 / 24)+2);
        if (remainingDays<=0){
          remainingDays =  formatMessage({ id: 'company.index.table.column.valided' })
        }
        return <span>{remainingDays}</span>
      }
    },
    {
      title: formatMessage({ id: 'company.index.table.column.userInfo' }),
      render: record => (
        <span>
          {record.usedUserCount}/{record.maxUserCount}
        </span>
      ),
    },
    {
      title: formatMessage({ id: 'company.index.table.column.dcInfo' }),
      render: record => (
        <span>
          {record.usedDcCount}/{record.maxDcCount}
        </span>
      ),
    },
    {
      title: formatMessage({ id: 'company.index.table.column.status' }),
      dataIndex: 'state',
      render:(text, record)=> {
        confirm = record.state == basicState.ONLINE.name ? commonLocale.offlineLocale :
          commonLocale.onlineLocale;
        return (
          <IPopconfirm onConfirm={() => this.handleEnableOrDisable(record,true)} 
                  operate={confirm}
                  object={'企业'}>
            <Switch checked = {
                      record.state == STATE['ONLINE'] ? true : false
                    }
                    size = "small" /> &emsp;
            {STATUS[record.state]}
          </IPopconfirm>
        )
      },
    },
    {
      title: formatMessage({ id: 'company.index.table.column.operate' }),
      render: record => (
        <OperateCol menus={this.fetchOperateProps(record)} />
      ),
    },
  ];

  fetchOperateProps = (record) => {
    return [{
      name: formatMessage({ id: 'company.index.table.operate.view' }),
      onClick: this.onView.bind(this, record.uuid)
    }, {
      name: formatMessage({ id: 'company.index.table.operate.edit' }),
      onClick: this.onViewWithEditDetail.bind(this, record.uuid)
    }];
  }

  // -------- react 钩子函数 --------

  componentDidMount() {
    // 设置默认以Code降序
    const { pageFilter } = this.state;
    pageFilter.sortFields = { 'lastModified': true };
    this.setState({
      pageFilter: pageFilter,
    })
    this.refreshTable();
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      showDetailView: newProps.company.data.showDetailView,
      showCreateView: newProps.company.data.showCreateView,
    });

    if (newProps.company.data.showDetailEditForm != null) {
      this.setState({
        showDetailEditForm: newProps.company.data.showDetailEditForm,
      })
    }
  }

  /**
   * 国际化 - 表格中启用禁用确认文字
   */
  confirmEnableDisableTips = (record) => {
    let text = record.state === STATE['ONLINE']
                ? formatMessage({ id: 'common.operate.disable' })
                : formatMessage({ id: 'common.operate.enable' });
    return formatMessage({ id: 'common.operate.confirm' }) + " " + text.toLowerCase() + "?";
  }

  /**
   * 表单重置
   */
  handleFormReset = () => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    pageFilter.sortFields = { 'lastModified': true };
    pageFilter.searchKeyValues = {};
    pageFilter.likeKeyValues = {};

    this.setState({
      pageFilter: pageFilter,
    });
    this.refreshTable();
  };

  /**
   * 搜索
   */
  handleSearch = values => {
    const { dispatch, form } = this.props;
    const { pageFilter } = this.state;

    pageFilter.page = 0;

    pageFilter.searchKeyValues = {...values};

    let startEndvalidDate = values.startEndvalidDate;
    if ( startEndvalidDate && startEndvalidDate.length>0 ) {
      pageFilter.searchKeyValues['startValidDate'] = startEndvalidDate[0].format('YYYY-MM-DD HH:mm:ss');
      pageFilter.searchKeyValues['endValidDate'] = startEndvalidDate[1].format('YYYY-MM-DD HH:mm:ss')
    }

    this.setState({
      pageFilter: pageFilter,
    });

    dispatch({
      type: 'company/query',
      payload: pageFilter,
    });
  };

  /**
   * 处理选择
   */
  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  /**
   * 表格内容改变时，调用此方法
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    pageFilter.page = pagination.current - 1;
    pageFilter.pageSize = pagination.pageSize;

    // 判断是否有过滤信息
    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    let enable = filters['enable'];
    if (enable) {
      pageFilter.searchKeyValues = {'enable': enable};
      if (enable === '0,1' || enable === '1,0') {
        pageFilter.searchKeyValues = {};
      }
    } else {
      pageFilter.searchKeyValues = {};
    }

    if (sorter.field) {
      // 如果有排序字段，则需要将原来的清空
      pageFilter.sortFields = {};
      var sortField = `${sorter.field}`;
      var sortType = sorter.order === 'descend' ? true : false;
      pageFilter.sortFields[sortField] = sortType;
    }

    dispatch({
      type: 'company/query',
      payload: pageFilter,
    });
  };

  /**
   * 启用或者禁用处理
   */
  handleEnableOrDisable = (record, isRefreshTable) => {
    if (record.state == STATE['ONLINE'] ) {
      this.handleDisable(record, isRefreshTable, false);
    } else {
      this.handleEnable(record, isRefreshTable, false);
    }
  };

  /**
   * 启用处理
   *
   * @param {Object} record 要启用的当前对象
   * @param {Boolean} isRefreshTable 是否刷新表格
   * @param {Boolean} isRecordCompletion 是否记录该任务已经完成
   */
  handleEnable = (record, isRefreshTable, isRecordCompletion) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'company/enable',
      payload: record,
      callback: response => {
        if (response && response.success) {
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskSuccessed();
          }
          if (isRefreshTable) {
            this.refreshTable();
          }
        } else {
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskFailed();
            this.collectFaildedTask(record);
          } else {
            message.error(formatMessage({ id: 'common.message.error.enable' }));
          }
        }
      },
    });
  };

  /**
   * 禁用处理
   *
   * @param {Object} record 要启用的当前对象
   * @param {Boolean} isRefreshTable 是否刷新表格
   * @param {Boolean} isRecordCompletion 是否记录该任务已经完成
   */
  handleDisable = (record, isRefreshTable, isRecordCompletion) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'company/disable',
      payload: record,
      callback: response => {
        if (response && response.success) {
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskSuccessed();
          }
          if (isRefreshTable) {
            this.refreshTable();
          }
        } else {
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskFailed();
            this.collectFaildedTask(record);
          } else {
            message.error(formatMessage({ id: 'common.message.error.disable' }));
          }
        }
      },
    });
  };

  /**
   * 刷新表格
   */
  refreshTable = () => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    dispatch({
      type: 'company/query',
      payload: pageFilter,
    });
  };

  /**
   * 批量启用
   */
  handleBatchEnable = () => {
    let { selectedRows } = this.state;
    if (selectedRows) {
      selectedRows.map(item => {
        this.handleEnable(item, false, true);
      });
    }
  };

  /**
   * 批量禁用
   */
  handleBatchDisable = () => {
    const { selectedRows } = this.state;
    if (selectedRows) {
      selectedRows.map(item => {
        this.handleDisable(item, false, true);
      });
    }
  };

  /**
   * 点击表格中的代码列跳转到企业查看界面
   */
  onView = (uuid) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'company/onView',
      payload: uuid,
    });
  };

  /**
   * 跳转到详情页面，并启用编辑表单
   */
  onViewWithEditDetail = (uuid) => {
    this.setState({
      showDetailEditForm: true,
    })

    this.onView(uuid);
  }

  /**
   * 跳转新建页面
   */
  onViewCreate = () => {
    const { dispatch } = this.props;

    dispatch({
      type: 'company/onViewCreate',
    });
  };

  /**
   * 用于从查看界面返回
   */
  onCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'company/onCancel',
      callback: this.refreshTable,
    });
    this.resetState();
  };

  /**
   * 用于从新增或编辑界面返回
   */
  onCancelCreate = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'company/onCancelCreate',
      callback: this.refreshTable,
    });
    this.resetState();
  };

  /**
   * 重置某些state
   */
  resetState = () => {
    this.setState({
      showDetailEditForm: false,
    })
  }

  // -----进度条相关计算-----

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
    this.refreshTable();
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

    if (selectedRows.length == 0) {
      message.warn(formatMessage({ id: 'common.progress.select.tips' }));
      return;
    }
    if (flag) {
      const { taskInfo, taskExecutionFunc } = this.state;
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
  taskExecutionFuncWrapper = (taskType) => {
    if (taskType === taskTypeMap['enable']) {
      return this.handleBatchEnable;
    } else if (taskType === taskTypeMap['disable']) {
      return this.handleBatchDisable;
    }
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
        case taskTypeMap['enable']:
          this.handleEnable(failedTasks[0], true, false);
          break;
        case taskTypeMap['disable']:
          this.handleDisable(failedTasks[0], true, false);
          break;
        default:
          console.error('错误执行类型');
      }
    } else if (failedTasks.length > 1) {
      // 将执行失败的任务加入到selectedRows
      this.setState({
        selectedRows: failedTasks,
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

  /**
   * 渲染搜索表单
   * @param {*} props 参数
   */
  renderForm(props) {
    return <CompanySimpleSearchForm {...props} />;
  }

  render() {
    const { showDetailView, showCreateView, showDetailEditForm } = this.state;
    if (showDetailView) {
      return <CompanyDetail
               showEdit={showDetailEditForm}
               onCancel={this.onCancel}
               onView={this.onView} 
               onRender={this.render}
            />;
    }
    if (showCreateView) {
      return (
        <CompanyCreate
          onCancel={this.onCancelCreate}
          onRender={this.render}
          onView={this.onView}
        />
      );
    }

    return this.renderIndex();
  }

  renderIndex() {
    const {
      company: { data },
      loading,
    } = this.props;
    const {
      selectedRows,
      editCompany,
      selectedCompany,
      batchProcessConfirmModalVisible,
      isCloseFailedResultModal,
      taskInfo,
    } = this.state;

    const searchProps = {
      handleFormReset: this.handleFormReset,
      handleSearch: this.handleSearch,
    };

    let action;
    switch(taskInfo.type) {
      case taskTypeMap['enable']:
        action = formatMessage({ id: 'common.operate.enable' }).toLowerCase();
        break;
      case taskTypeMap['disable']:
        action = formatMessage({ id: 'common.operate.disable' }).toLowerCase();
        break;
      default:
        action = '';
    }

    const progressProps = {
      taskInfo: taskInfo,
      entity: formatMessage({ id: 'company.title' }).toLowerCase(),
      action: action,
      batchProcessConfirmModalVisible: batchProcessConfirmModalVisible,
      isCloseFailedResultModal: isCloseFailedResultModal,
    }

    const progressMethods = {
      taskConfirmCallback: this.taskConfirmCallback,
      taskCancelCallback: this.taskCancelCallback,
      taskFailedCallback: this.taskFailedCallback,
      taskSuccessedCallback: this.taskSuccessedCallback,
      retryCancelCallback: this.retryCancelCallback,
      taskExecutionFunc: this.taskExecutionFuncWrapper(taskInfo.type),
    }

    const actionBtn = (
      <Fragment>
        <Button icon="plus" type="primary" onClick={this.onViewCreate}>
          {formatMessage({ id: 'common.button.new' })}
        </Button>
      </Fragment>
    );

    const tableLoading = {
      spinning: loading,
      indicator: LoadingIcon('default')
    }

    return (
      <PageHeaderWrapper>
        <Page>
          <NavigatorPanel title={formatMessage({ id: 'company.title' })} action={actionBtn} />
          <SearchPanel>{this.renderForm(searchProps)}</SearchPanel>
          <ToolbarPanel>
            <Button
              onClick={() =>
                this.handleBatchProcessConfirmModalVisible(true, taskTypeMap['enable'])
              }
            >
              {formatMessage({ id: 'common.button.batchEnable' })}
            </Button>
            <Button
              onClick={() =>
                this.handleBatchProcessConfirmModalVisible(true, taskTypeMap['disable'])
              }
            >
              {formatMessage({ id: 'common.button.batchDisable' })}
            </Button>
          </ToolbarPanel>
          <StandardTable
            rowKey={record => record.uuid}
            selectedRows={selectedRows}
            loading={tableLoading}
            data={data}
            columns={this.columns}
            onSelectRow={this.handleSelectRows}
            onChange={this.handleStandardTableChange}
          />
        </Page>
        <ConfirmProgress {...progressProps} {...progressMethods} ref="batchHandle" />
      </PageHeaderWrapper>
    );
  }
}

export default Company;
