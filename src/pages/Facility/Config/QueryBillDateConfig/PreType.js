import React, { PureComponent, Fragment } from 'react';
import { Button, Modal, Form, Input, Divider, message, Tooltip, InputNumber} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import TextArea from 'antd/lib/input/TextArea';
import PageHeaderWrapper from '@/pages/Facility/Config/QueryBillDateConfig/PageHeaderWrapper';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import Page from '@/pages/Component/Page/inner/Page';
import ToolbarPanel from '@/pages/Component/Page/inner/ToolbarPanel';
import StandardTable from '@/components/StandardTable';
import ConfirmProgress from '@/pages/Component/Progress/ConfirmProgress';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import Empty from '@/pages/Component/Form/Empty';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { loginOrg } from '@/utils/LoginContext';
import { colWidth,itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
const FormItem = Form.Item;
const Search = Input.Search;
@connect(({ pretype, loading }) => ({
  pretype,
  loading: loading.models.pretype,
}))
class PreType extends PureComponent {
  state = {
    record: {},
    data:{},
    pageFilter: {
      page: 0,
      pageSize: 20,
      sortFields: {},
      searchKeyValues: {},
    },
    typeCreateModalVisible: false,
    batchProcessConfirmModalVisible: false,
    failedTasks: [],
    selectedRows: [],
    selectedRowKeys: [],
    isCloseFailedResultModal: false,
    taskInfo: {
      total: 0,
    },
    operateType: "",
  };

  componentWillUnmount(){
    this.backToBefore(this.props.pretype)
  }
  columns = [
    {
      title: '查询天数范围',
      dataIndex: 'name',
      width: colWidth.codeColWidth,
      render: val => val ?  <EllipsisCol colValue={val}/> : <Empty/>,
    },
    {
      title: formatMessage({ id: 'pretype.note' }),
      dataIndex: 'note',
      width: itemColWidth.noteEditColWidth,
      render: (text) => <Tooltip placement="topLeft" title={text}>{text?text:<Empty />}</Tooltip>
    },
    {
      title: formatMessage({ id: 'pretype.index.column.operate' }),
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.onView(record)}>
            {formatMessage({ id: 'common.operate.edit' })}
          </a>
          <Divider type="vertical" />
          <IPopconfirm onConfirm={this.handleRemove.bind(this, record, true, false)}
                       operate={commonLocale.deleteLocale}
                       object={this.props.title}
          >
            <a>{commonLocale.deleteLocale}</a>
          </IPopconfirm>
        </Fragment>
      ),
    },
  ];
  componentDidMount() {
    let { pageFilter } = this.state;
    let { preType } = this.props;

    pageFilter.searchKeyValues = {
      'orgUuid': loginOrg().uuid,
      'preType': preType
    };
    const { dispatch } = this.props;

    dispatch({
      type: 'pretype/query',
      payload: pageFilter,
    });
  }

  componentWillReceiveProps(nextProps){
    if(this.props.pretype&&this.props.pretype.data!=nextProps.pretype.data){
      if(nextProps.pretype.data.list ==undefined){
        this.setState({
          data:nextProps.pretype.data
        })
      }else if(nextProps.pretype.data.list
        &&nextProps.pretype.data.list[0].preType === this.props.preType){
        this.setState({
          data:nextProps.pretype.data
        })
      }
    }
  }

  // ---- 进度条相关计算 开始---
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
      this.handleBatchProcessConfirmModalVisible(true);
    }
  };


  /**
   * 任务全部执行成功时回调
   */
  taskSuccessedCallback = () => {
    this.terminateProgress();
  }
  taskCancelCallback = () => {
    this.setState({
      batchProcessConfirmModalVisible: false,
    })
  }
  /**
   * 批量执行具体函数包装
   */
  taskExecutionFuncWrapper = () => {
    return this.handleBatchRemove();
  }

  /**
   * 批量处理弹出框显示处理
   */
  handleBatchProcessConfirmModalVisible = (flag) => {
    const { selectedRows } = this.state;

    if (selectedRows.length == 0) {
      message.warn(formatMessage({ id: 'common.progress.select.tips' }));
      return;
    }
    if (flag) {
      const { taskInfo } = this.state;
      taskInfo.total = selectedRows.length;
      this.setState({
        taskInfo: taskInfo,
      });
    }

    this.setState({
      batchProcessConfirmModalVisible: !!flag,
    });
  };

  // ---- 进度条相关计算 结束---

  /**
   * 获取选中行
   *  */
  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
    this.setState({
      selectedRowKeys: rows,
    });
  }
  /**
   * 批量删除
   */
  handleBatchRemove = () => {
    let { selectedRows } = this.state;
    const that = this;
    if (selectedRows) {
      const bacth=(i)=>{
        if(i<selectedRows.length){
          that.handleRemove(selectedRows[i], false, true).then(res=>{
            bacth(i+1)
          });
        }
      }
      bacth(0);
    }
  };
  /**
   * 删除
   */
  handleRemove = (record, isRefreshTable, isRecordCompletion) => {
    const { dispatch } = this.props;
    const that =this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'pretype/delete',
        payload: record,
        callback: response => {
          if (response && response.success) {
            if (isRecordCompletion) {
              that.refs.batchHandle.calculateTaskSuccessed();
              resolve({ success: response.success });
            } else {
              message.success(formatMessage({ id: 'common.message.success.delete' }));
            }
            if (isRefreshTable) {
              that.refreshTable();
            }
          } else {
            // message.error(formatMessage({ id: 'common.message.error.delete' }));
            if (isRecordCompletion) {
              that.refs.batchHandle.calculateTaskFailed();
              that.collectFaildedTask(record);
              resolve({ success: response.success });
            }
            that.refreshTable();
          }
        }
      });
    });
  }
  //取消复选框选中
  resetCheckBox=()=>{
    this.setState({
      selectedRowKeys:[],
      selectedRows:[]
    })
  }
  /**
   * 表格内容改变时，调用此方法
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    let { pageFilter } = this.state;
    let { preType } = this.props;
    if (pageFilter.page !== pagination.current - 1) {
      pageFilter.changePage = true;
    }
    pageFilter.page = pagination.current - 1;
    pageFilter.pageSize = pagination.pageSize;
    this.refreshTable(pageFilter);
  };
  /**
   * 刷新表格
   */
  refreshTable = (filter) => {
    const { pageFilter } = this.state;
    if (!filter || !filter.changePage) {
      this.resetCheckBox();
    }
    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    const { dispatch } = this.props;
    dispatch({
      type: 'pretype/query',
      payload: queryFilter,
    });
  };

  /**
   * 控制门店类型新增弹出框显示
   */
  handleTypeCreateModalVisible = (flag) => {
    this.setState({
      operateType: "CREAT",
      typeCreateModalVisible: !!flag,
      record: {}
    });
  }
  /**
   * 返回至门店管理界面
   */
  backToBefore = (type) => {
    this.props.backToBefore(type);
  }
  /**
   * 搜索
   */
  onSearch = value => {
    const { dispatch } = this.props;
    let { pageFilter } = this.state;
    pageFilter.page = 0;
    pageFilter.searchKeyValues = {
      'name': value,
      'orgUuid': loginOrg().uuid,
      'preType': this.props.preType
    };
    this.refreshTable();
  };

  /**
   * 增加类型到数据库
   */
  handleAddType = (e) => {
    e.preventDefault();
    const { form, dispatch, preType } = this.props;
    const { record } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      let type = 'pretype/add';
      if (record.uuid) {
        type = 'pretype/modify';
        fieldsValue.uuid = record.uuid
      }
      const values = {
        ...fieldsValue,
        preType: preType,
        orgUuid: loginOrg().uuid,
        version: record.version
      };
      dispatch({
        type: type,
        payload: { ...values },
        callback: (response) => {
          if (response && response.success) {
            message.success(formatMessage({ id: 'common.message.success.operate' }));
            this.setState({
              typeCreateModalVisible: false,
            });
            this.refreshTable();
            form.resetFields();
          } else {
            this.setState({
              typeCreateModalVisible: false,
            });
            this.refreshTable();
            form.resetFields();
          }
        },
      });
    });
  }
  /**
   * 取消增加门店类型
   */
  handleCancel = () => {
    const { form } = this.props;
    this.setState({
      typeCreateModalVisible: false,
      record: {}
    });
    form.resetFields();
  };
  /**
   * 显示增加模态框
   */
  onView = (record) => {
    this.setState({
      record: record,
      operateType: "EDIT",
      typeCreateModalVisible: true,
    });
  }

  formateName = (value) => {
    if (value == "EDIT") {
      return formatMessage({ id: 'common.operate.edit' });
    } else {
      return formatMessage({ id: 'common.operate.create' });
    }
  }

  render() {
    const { record, typeCreateModalVisible, batchProcessConfirmModalVisible,
      taskInfo,
      isCloseFailedResultModal, operateType, selectedRowKeys } = this.state;
    const { form: { getFieldDecorator, validateFields,
      getFieldsValue }, title, loading } = this.props;

    let placeholderName = ''
    if(title.slice(0,2)==='管理'){
      placeholderName = title.slice(2);

    }else{
      placeholderName = title
    }
    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
    };
    const baseFormItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    const progressProps = {
      taskInfo: taskInfo,
      entity: title.toLowerCase(),
      action: formatMessage({ id: 'common.operate.delete' }).toLowerCase(),
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

    const actionBtn = (
      <Fragment>
        <Button type="primary" icon="plus" onClick={() => this.handleTypeCreateModalVisible(true)}>
          {formatMessage({ id: 'common.button.new' })}
        </Button>
        <Button onClick={() => this.backToBefore(this.props.pretype)}>
          {formatMessage({ id: 'pretype.back' })}
        </Button>
      </Fragment>
    );
    return (
      <PageHeaderWrapper style={{marginTop : '50px'}}>
        <Page style={{marginTop : '50px'}}>
          <NavigatorPanel title={title} action={actionBtn} />
          <Search
            style={{width: '40%', float: 'right' }}
            placeholder={placeholderLocale(placeholderName)+'查询'}
            onSearch={value => this.onSearch(value)}
          />
          <ToolbarPanel>
            <Button
              onClick={() =>
                this.handleBatchProcessConfirmModalVisible(true)
              }
            >
              {formatMessage({ id: 'common.button.batchDelete' })}
            </Button>
          </ToolbarPanel>
          {/*<div className={styles.standardTable}>*/}
          <StandardTable
            selectedRows={selectedRowKeys}
            rowKey={record => record.uuid}
            loading={loading}
            data={this.state.data}
            columns={this.columns}
            onSelectRow={this.handleSelectRows}
            onChange={this.handleStandardTableChange}
            comId={this.props.pretype+'pretype.unCommonSearch.table'}
          />
          {/*</div>*/}
        </Page>
        <Modal
          title={record.uuid ? commonLocale.editLocale : commonLocale.createLocale}
          onOk={this.handleAddType}
          visible={typeCreateModalVisible}
          onCancel={this.handleCancel}
          destroyOnClose={true}
        >
          <div style={{ maxHeight: '350px', overflow: 'auto' }}>
            <Form>
              <FormItem
                {...baseFormItemLayout}
                label='查询天数范围'
              >
                {getFieldDecorator('name', {
                  initialValue: record.name ? record.name : 0,
                  rules: [{ required: true, message: notNullLocale(placeholderName) },]
                })(
                  <InputNumber min={1} style={{ width: 200 }} precision={0} autoFocus/>
                )}
              </FormItem>
              <FormItem
                {...baseFormItemLayout}
                label={formatMessage({ id: 'pretype.create.form.note' })}
              >
                {
                  getFieldDecorator('note', {
                    rules: [{
                      max: 255, message: formatMessage({ id: 'pretype.create.form.item.input.limitLength.note' }),
                    }],
                    initialValue: record.note,
                  })(
                    <TextArea placeholder={formatMessage({ id: 'pretype.create.form.item.input.placeholder.note' })} />
                  )
                }
              </FormItem>
            </Form>
          </div>
        </Modal>
        <ConfirmProgress {...progressProps} {...progressMethods} ref="batchHandle" />
      </PageHeaderWrapper>
    );
  }
}
export default Form.create()(PreType);
