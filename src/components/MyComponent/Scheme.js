import React, { PureComponent,Fragment } from 'react';
import { Button, Switch,Table,Modal,Form,Input,Divider,Popconfirm,message,Radio } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NavigatorPanel from '@/components/MyComponent/NavigatorPanel';
import Page from '@/components/MyComponent/Page';
import SearchPanel from '@/components/MyComponent/SearchPanel';
import ConfirmProgress from '@/pages/Component/Progress/ConfirmProgress';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import ToolbarPanel from '@/components/MyComponent/ToolbarPanel';
import StandardTable from '@/components/StandardTable';
import { colWidth,itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { loginOrg, loginUser,loginCompany } from '@/utils/LoginContext';
import styles from './Scheme.less';
import { formatMessage } from 'umi/locale';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale,placeholderChooseLocale } from '@/utils/CommonLocale';
import TextArea from 'antd/lib/input/TextArea';
import { pickOrderLocale } from '@/pages/Out/PickOrder/PickOrderLocale';
import { stockOrderLocale } from '@/pages/Out/StockOrder/StockOrderLocale';
const FormItem = Form.Item;
const Search = Input.Search;
const RadioGroup = Radio.Group;

@connect(({ collectBinScheme,stockAllocateOrder,storepickorder, loading }) => ({
  collectBinScheme, stockAllocateOrder, 
  storepickorder,
  // loading: loading.models.storepickorder,
}))
class Scheme extends PureComponent {
  state = {
    record: {},
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
  columns = [
    {
      title:'代码',
      dataIndex: 'code',
      width: colWidth.codeColWidth,
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: colWidth.codeColWidth,
    },
    {
      title: '是否默认',
      width: colWidth.enumColWidth,
      render:record=>(
        record.def == true?'是':<IPopconfirm 
            onConfirm = {this.onDef.bind(this, record)}
            operate={commonLocale.setDefaultLocale}
            object={'方案'}
          >
            <a> 设置默认 </a>
          </IPopconfirm>
      )
    },
    {
      title: '备注',
      width: itemColWidth.noteEditColWidth,
      dataIndex: 'note',
      render: text => <EllipsisCol colValue={text} />
    },
    {
      title:'操作',
      width: colWidth.operateColWidth,
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.onView(record)}>
            {formatMessage({ id: 'common.operate.edit' })}
          </a>
          <Divider type="vertical" />
          <IPopconfirm onConfirm={this.handleRemove.bind(this, record,true,false)}
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
    let {preType} = this.props;

    var payload = {
      'companyUuid':loginCompany().uuid,
      'dcUuid':loginOrg().uuid
    };
    const { dispatch } = this.props;

    dispatch({
      type: this.props.queryType,
      payload: {...payload},
    });
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
    if (selectedRows) {
      selectedRows.map(item => {
        this.handleRemove(item, false, true);
      });
    }
  };
  /**
   * 删除
   */
  handleRemove = (record, isRefreshTable, isRecordCompletion) =>{
    const { dispatch } = this.props;
    dispatch({
      type: this.props.deleteType,
      payload: record,
      callback: response => {
        if (response&&response.success) {
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskSuccessed();
          }else{
            message.success(formatMessage({ id: 'common.message.success.delete' }));
          }
          if (isRefreshTable) {
            this.refreshTable();
          }
        } else {
          message.error(formatMessage({ id: 'common.message.error.delete' }));
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskFailed();
            this.collectFaildedTask(record);
          }
        }
      },
    });
  }

  /**
   * 设置默认
   */
  onDef = (record)=>{
    const { dispatch } = this.props;
    dispatch({
      type: this.props.defType,
      payload: record,
      callback: response => {
        if (response&&response.success) {
          message.success('设置成功');
          this.refreshTable();
        } else {
          message.error('设置失败');
        }
      },
    });
  }
  /**
   * 表格内容改变时，调用此方法
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {

    var payload = { 
      'companyUuid':loginCompany().uuid,
      'dcUuid':loginOrg().uuid
     };
    const { dispatch } = this.props;
    dispatch({
      type: this.props.queryType,
      payload: {...payload},
    });
  };
  /**
   * 刷新表格
   */
  refreshTable = () => {

    var payload = { 
      'companyUuid':loginCompany().uuid,
      'dcUuid': loginOrg().uuid
     };
    const { dispatch } = this.props;
    dispatch({
      type: this.props.queryType,
      payload: {
        ...payload
      },
    });
  };
  
  /**
   * 控制新增弹出框显示
   */
  handleTypeCreateModalVisible = (flag) => {
    this.setState({
      operateType: "CREAT",
      typeCreateModalVisible: !!flag,
      record:{}
    });
  }
  /**
   * 返回至上级管理界面
   */
  backToBefore = (type) =>{
    this.props.backToBefore(type);
  }

  /**
   * 增加方案到数据库
   */
  handleAdd = (e) => {
    e.preventDefault();
    const { form,dispatch,preType } = this.props;
    const { record } = this.state;
    form.validateFields((err, fieldsValue) => {
      let type = this.props.addType;
      if (record.uuid) {
        type = this.props.modifyType;
        fieldsValue.uuid = record.uuid
      }
      const values = {
        ...fieldsValue,
        companyUuid: loginCompany().uuid,
        dcUuid:loginOrg().uuid,
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
          }
        },
      });
    });
  }
   /**
   * 取消增加方案
   */
  handleCancel = () => {
    const { form} = this.props;
    this.setState({
      typeCreateModalVisible: false,
      record:{}
    });
    form.resetFields();
  };
  /**
   * 显示增加模态框
   */
  onView = (record) => {
    this.setState({
      record:record,
      operateType: "EDIT",
      typeCreateModalVisible: true,
    });
  }

  formateName = (value) => {
    if(value == "EDIT"){
      return formatMessage({ id: 'common.operate.edit' });
    }else{
      return formatMessage({ id: 'common.operate.create' });
    }
  }
  render() {
    const { record,typeCreateModalVisible,batchProcessConfirmModalVisible,
      taskInfo,
      isCloseFailedResultModal,operateType,selectedRowKeys} = this.state;
    const { form: { getFieldDecorator, validateFields,
      getFieldsValue },title,loading } = this.props;

    const data={
      list:
        title===pickOrderLocale.pickOrderScheme ? this.props.storepickorder.listSchemes : (
          title===stockOrderLocale.title ? this.props.stockAllocateOrder.data : []
        )
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
      action: formatMessage({id:'common.operate.delete'}).toLowerCase(),
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
          {formatMessage({id:'common.button.new'})}
        </Button>
        <Button onClick={() => this.backToBefore()}>
          返回
        </Button>
      </Fragment>
    );
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
      getCheckboxProps: record => ({
        disabled: record.disabled,
      }),
    };
    return (
      <PageHeaderWrapper>
      <Page>
        <NavigatorPanel title={title} action={actionBtn} />
        <ToolbarPanel>
          <Button
            onClick={() =>
              this.handleBatchProcessConfirmModalVisible(true)
            }
          >
            {formatMessage({id:'common.button.batchDelete'})}
          </Button>
        </ToolbarPanel>
        <div className={styles.standardTable}>
          <StandardTable
            selectedRows={selectedRowKeys}
            rowKey={record => record.uuid}
            // loading={loading}
            data={data}
            columns={this.columns}
            onSelectRow={this.handleSelectRows}
            pagination={paginationProps}
            onChange={this.handleStandardTableChange}
          />
        </div>
      </Page>
      <Modal
        title={record.uuid?commonLocale.editLocale:commonLocale.createLocale}
        onOk={this.handleAdd}
        visible={typeCreateModalVisible}
        onCancel={this.handleCancel}
        destroyOnClose={true}
      >
        <div style={{maxHeight: '350px', overflow: 'auto'}}>
          <Form>
            <FormItem
              {...baseFormItemLayout}
              label='方案代码'
            >
              {
                getFieldDecorator('code', {
                  rules: [{ required: true, message:notNullLocale(commonLocale.codeLocale)}, {
                  max: 30, message: tooLongLocale(commonLocale.codeLocale, 30),
                  }],
                  initialValue: record.code,
                })(
                  <Input placeholder={placeholderLocale(commonLocale.codeLocale)}/>
                )
              }
            </FormItem>
            <FormItem
              {...baseFormItemLayout}
              label='方案名称'
            >
              {
                getFieldDecorator('name', {
                  rules: [{ required: true, message:notNullLocale(commonLocale.nameLocale)}, {
                  max: 30, message: tooLongLocale(commonLocale.nameLocale,30),
                  }],
                  initialValue: record.name,
                })(
                  <Input placeholder={placeholderLocale(commonLocale.nameLocale)}/>
                )
              }
            </FormItem>
            <FormItem
              {...baseFormItemLayout}
              label='备注'
            >
              {
                getFieldDecorator('note', {
                  rules: [ {
                  max: 255, message: tooLongLocale(commonLocale.noteLocale,255),
                  }],
                  initialValue: record.note,
                })(
                  <TextArea placeholder={placeholderLocale(commonLocale.noteLocale)}/>
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
export default Form.create()(Scheme);