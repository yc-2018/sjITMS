import React, { PureComponent } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import ConfirmProgress from '@/pages/Component/Progress/ConfirmProgress';
import StandardTable from '@/components/StandardTable';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import ToolbarPanel from '@/pages/Component/Page/inner/ToolbarPanel';
import { message } from 'antd';
import { formatMessage } from 'umi/locale';

/**
 * 搜索界面基类<br>
 * 界面标题：具体模块搜索界面在状态中设置title<br>
 * 右上角按钮：子类可通过实现drawActionButton来构造该按钮组<br>
 * 搜索面板：子类通过实现drawSearchPanel来构造搜索面板<br>
 * 工具栏：子类通过实现drawToolbarPanel来构造工具栏<br>
 * 搜索表格：父类会调用子类的columns属性作为表格的列，从子类状态中取data作为数据来源，子类需在state中提供selectedRows，由父类进行更新<br>
 * 刷新表格：子类提供refreshTable方法，当父类表格发生变化（分页、排序、表格内筛选）时会调用该方法，并传入表格搜索数据（当前页、每页条数等等）<br>
 * 界面loading ：当不想让表格进行loaing时 在子类状态中设置suspendLoading属性（是否暂停表格loading）
 */
export default class SearchPage extends PureComponent {
    constructor(props) {
        super(props);

        let queryFilter = {
            selectedRows: [],
            selectedRowKeys:[],
            pageFilter: {
                page: 0,
                pageSize: 10,
                sortFields: {},
                searchKeyValues: {},
                likeKeyValues: {}
            }
        };

        if (sessionStorage.getItem(window.location.href)) {
            queryFilter = JSON.parse(sessionStorage.getItem(window.location.href));
        }

        this.state = {
            ...queryFilter,
            batchProcessConfirmModalVisible: false,
            isCloseFailedResultModal: false,
            taskInfo: {
                total: 0,
            },
            failedTasks: [],
        };

    }

    componentWillReceiveProps(nextProps) {
    }

    handleSelectRows = rows => {
        this.setState({
            selectedRows: rows,
        });
        this.changeSelectedRows && this.changeSelectedRows(rows);
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

        if (sorter.field) {
            // 如果有排序字段，则需要将原来的清空
            pageFilter.sortFields = {};
            var sortField = `${sorter.field}`;
            var sortType = sorter.order === 'descend' ? true : false;
            pageFilter.sortFields[sortField] = sortType;
        }

        if (this.refreshTable)
            this.refreshTable(pageFilter);
    };

    //  -------- 批处理相关 START -------

    /**
     * 确认执行任务之前回调
     */
    taskConfirmCallback = () => {
        this.setState({
            batchProcessConfirmModalVisible: false,
        });
        localStorage.setItem("showMessage", "0");
    }

    /**
     * progress流程结束
     */
    terminateProgress = () => {
        this.refreshTable();
        this.setState({
            batchProcessConfirmModalVisible: false,
            selectedRows: [],
        });
        this.changeSelectedRows && this.changeSelectedRows([]);
    }

    /**
     * 重试取消
     */
    retryCancelCallback = () => {
        localStorage.setItem("showMessage", "1");
        this.terminateProgress();
    };

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

        if (failedTasks.length >= 1) {
            // 将执行失败的任务加入到selectedRows
            this.setState({
                selectedRows: failedTasks,
                failedTasks: [],
            });
            // 继续进行批处理
            this.handleBatchProcessConfirmModalVisible(true, taskInfo.type, failedTasks);
            this.changeSelectedRows && this.changeSelectedRows(failedTasks);
        }
    };

    /**
     * 批量处理弹出框显示处理（入口）
     */
    handleBatchProcessConfirmModalVisible = (flag, taskType, failedTasks) => {
        const { selectedRows } = this.state;
        if (selectedRows.length === 0 && ((failedTasks ? failedTasks.length : 0) === 0)) {
            if (!this.state.noMessage) {
                message.warn(formatMessage({ id: 'common.progress.select.tips' }));
            }
            return;
        }
        if (flag) {
            const { taskInfo } = this.state;
            taskInfo.total = failedTasks ? failedTasks.length : selectedRows.length;
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
     * 任务全部执行成功时回调
     */
    taskSuccessedCallback = () => {
        this.terminateProgress();
        localStorage.setItem("showMessage", "1");
    }

    /**
     * 任务取消执行
     */
    taskCancelCallback = () => {
        this.setState({
            batchProcessConfirmModalVisible: false,
        });
        localStorage.setItem("showMessage", "1");
        this.terminateProgress();
        this.subTaskCancelCallback && this.subTaskCancelCallback()
    }

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
     * 成功或者失败回调
     */
    batchCallback = (response, record) => {
        if (response && response.success) {
            this.refs.batchHandle.calculateTaskSuccessed();
        } else {
            this.refs.batchHandle.calculateTaskFailed();
            this.collectFaildedTask(record);
        }
    }

    /**
     * 渲染批处理
     */
    drawProgress = () => {
        const {
            taskInfo,
            batchProcessConfirmModalVisible,
            isCloseFailedResultModal
        } = this.state;

        const progressProps = {
            taskInfo: taskInfo,
            entity: this.state.title,
            action: this.state.batchAction,
            batchProcessConfirmModalVisible: batchProcessConfirmModalVisible,
            isCloseFailedResultModal: isCloseFailedResultModal,
            content: this.state.content
        }

        const progressMethods = {
            taskConfirmCallback: this.taskConfirmCallback,
            taskCancelCallback: this.taskCancelCallback,
            taskFailedCallback: this.taskFailedCallback,
            taskSuccessedCallback: this.taskSuccessedCallback,
            retryCancelCallback: this.retryCancelCallback,
            taskExecutionFunc: this.onBatchProcess,
        }

        return (
            <ConfirmProgress {...progressProps} {...progressMethods} ref="batchHandle" />
        );
    }

    //  -------- 批处理相关 END -------

    drawToolbar = () => {
        if (this.drawToolbarPanel) {
            return (<ToolbarPanel>{this.drawToolbarPanel()}</ToolbarPanel>);
        } else {
            return '';
        }
    }

    render() {
        const { selectedRows, data,scroll } = this.state;
        const { loading } = this.props;

        let tableFilter = {
            selectedRows: this.state.selectedRows,
            pageFilter: this.state.pageFilter
        };
        sessionStorage.setItem(window.location.href, JSON.stringify(tableFilter));

        const tableLoading = {
            spinning: this.state.suspendLoading?false:loading,
            indicator: LoadingIcon('default')
        }

        return (
            <div>
                <Page>
                    <NavigatorPanel title={this.state.title} action={this.drawActionButton ? this.drawActionButton() : ''} />
                    {this.drawSearchPanel ? this.drawSearchPanel() : ''}
                    {this.drawToolbar()}
                    <StandardTable
                        unShowRow={this.state.unShowRow ? this.state.unShowRow : false}
                        rowKey={record => record.uuid}
                        selectedRows={selectedRows}
                        loading={tableLoading}
                        data={data}
                        columns={this.columns}
                        scroll={scroll ?scroll : undefined}
                        onSelectRow={this.handleSelectRows}
                        onChange={this.handleStandardTableChange}
                    />
                    {this.drawOtherCom && this.drawOtherCom()}
                </Page>
                {this.drawProgress()}
            </div>
        );
    }
}
