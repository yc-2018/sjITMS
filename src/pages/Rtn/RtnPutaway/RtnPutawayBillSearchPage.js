import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, message } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import Empty from '@/pages/Component/Form/Empty';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { State, METHOD } from './RtnPutawayBillContants';
import { putAwayLocal } from './RtnPutawayBillLocale';
import { RTNPUTAWAY_RES } from './RtnPutawayBillPermission';
import OperateCol from '@/pages/Component/Form/OperateCol';
import RtnPutawayBillSearchForm from './RtnPutawayBillSearchForm';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { getQueryBillDays } from '@/utils/LoginContext';
@connect(({ rtnPutaway, loading }) => ({
    rtnPutaway,
    loading: loading.models.rtnPutaway,
}))
@Form.create()
export default class RtnPutawayBillSearchPage extends SearchPage {
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: putAwayLocal.title,
            data: props.rtnPutaway.data,
            selectedRows: [],
            record: {},
            entityUuid: '',
            suspendLoading: false,
            key: 'rtnPutaway.search.table'
        }

        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
        this.state.pageFilter.sortFields = {
            billNumber: true
        }
    }

    componentDidMount() {
      if(this.props.rtnPutaway.fromView) {
        return;
      } else {
        this.refreshTable();
      }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.rtnPutaway.data
        });
    }

    /**
     * 刷新/重置
     */
    refreshTable = (filter) => {
        const { dispatch } = this.props;
        const { pageFilter } = this.state;

        if (!filter || !filter.changePage) {
            this.setState({
                selectedRows: []
            });
            if(pageFilter.searchKeyValues && !pageFilter.searchKeyValues.days) {
              pageFilter.searchKeyValues.days = getQueryBillDays()
            }
        }

        let queryFilter = { ...pageFilter };
        if (filter) {
            queryFilter = { ...pageFilter, ...filter };
        }
        dispatch({
            type: 'rtnPutaway/query',
            payload: queryFilter,
        });
    };
    /**
     * 搜索
     */
    onSearch = (data) => {
        const {
            pageFilter
        } = this.state;
        pageFilter.page = 0;
        var days = '';
        if (data) {
            if (data.days) {
              days = data.days
            }
            pageFilter.searchKeyValues = {
                ...pageFilter.searchKeyValues,
                ...data,
                days: days
            }
        } else {
            pageFilter.searchKeyValues = {
                companyUuid: loginCompany().uuid,
                dcUuid: loginOrg().uuid,
                days: getQueryBillDays()
            }
        }
        this.refreshTable();
    }

    /**
    * 显示新建界面
    */
    onCreate = () => {
        this.props.dispatch({
            type: 'rtnPutaway/showPage',
            payload: {
                showPage: 'create',
            }
        });
    }

    onEdit = (record) => {
        this.props.dispatch({
            type: 'rtnPutaway/showPage',
            payload: {
                showPage: 'create',
                entityUuid: record.uuid
            }
        });
    }

    /**
    * 查看详情
    */
    onView = (record) => {
        this.props.dispatch({
            type: 'rtnPutaway/showPage',
            payload: {
                showPage: 'view',
                entityUuid: record.uuid
            }
        });
    }

    /**
     * 批量审核
     */
    onBatchAudit = () => {
        this.setState({
            batchAction: commonLocale.auditLocale
        })
        this.handleBatchProcessConfirmModalVisible(true);
    }

    /**
     * 批量删除
     */
    onBatchRemove = () => {
        this.setState({
            batchAction: commonLocale.deleteLocale
        })
        this.handleBatchProcessConfirmModalVisible(true);
    }

    // 批量操作
    onBatchProcess = () => {
        const { selectedRows, batchAction } = this.state;
        this.setState({
            suspendLoading: true
        })
        const that = this;
        let batch = (i) => {
            if (i < selectedRows.length) {
                let e = selectedRows[i];
                if (batchAction === commonLocale.auditLocale) {
                    if (State.AUDITED.name !== e.state) {
                        that.onAudit(e, true).then(res => (batch(i + 1)));
                    } else {
                        that.refs.batchHandle.calculateTaskSkipped();
                        batch(i + 1);
                    }
                } else if (batchAction === commonLocale.deleteLocale) {
                    if (State.SAVED.name === e.state) {
                        that.onRemove(e, true).then(res => (batch(i + 1)));
                    } else {
                        that.refs.batchHandle.calculateTaskSkipped();
                        batch(i + 1);
                    }
                }
            } else {
                this.setState({
                    suspendLoading: false
                })
            }
        }
        batch(0);
    }

    /**
     * 单一删除
     */
    onRemove = (record, batch) => {
        const that = this
        return new Promise(function (resolve, reject) {
            that.props.dispatch({
                type: 'rtnPutaway/remove',
                payload: {
                    uuid: record.uuid,
                    version: record.version
                },
                callback: (response) => {
                    if (batch) {
                        that.batchCallback(response, record);
                        resolve({ success: response.success });
                        return;
                    }
                    if (response && response.success) {
                        that.refreshTable();
                        message.success(commonLocale.removeSuccessLocale)
                    }
                }
            })
        })
    }

    onAudit = (record, batch) => {
        const that = this;

        let type = 'rtnPutaway/audit';
        if (record.state === 'INPROGRESS') {
            type = 'rtnPutaway/auditByState';
        }

        return new Promise(function (resolve, reject) {
            that.props.dispatch({
                type: type,
                payload: {
                    uuid: record.uuid,
                    version: record.version
                },
                callback: (response) => {
                    if (batch) {
                        that.batchCallback(response, record);
                        resolve({ success: response.success });
                        return;
                    }
                    if (response && response.success) {
                        that.refreshTable();
                        message.success(commonLocale.finishSuccessLocale)
                    }
                }
            })
        })
    }

    /**
     * 表格列
     */
    columns = [
        {
            title: commonLocale.billNumberLocal,
            dataIndex: 'billNumber',
            sorter: true,
            width: colWidth.billNumberColWidth,
            render: (text, record) =>
                <a onClick={() => this.onView(record)}>
                    {text}
                </a>
        }, {
            title: commonLocale.ownerLocale,
            dataIndex: 'owner',
            sorter: true,
            width: colWidth.enumColWidth,
            render: (text, record) => (<EllipsisCol colValue={convertCodeName(record.owner)} />)
        },
        {
            title: putAwayLocal.method,
            dataIndex: 'method',
            sorter: true,
            width: colWidth.enumColWidth,
            render: (text, record) => (METHOD[record.method].caption)
        },
        {
            title: commonLocale.inUploadDateLocale,
            width: colWidth.dateColWidth,
            dataIndex: 'uploadTime',
            sorter: true,
            render: (text, record) => <span>{record.uploadTime ? moment(record.uploadTime).format('YYYY-MM-DD') : <Empty />}</span>,
        },
        {
            title: commonLocale.stateLocale,
            width: colWidth.enumColWidth,
            dataIndex: 'state',
            sorter: true,
            render: (text, record) => <BadgeUtil value={record.state} />
        },
        {
            title: commonLocale.operateLocale,
            width: colWidth.operateColWidth,
            render: (text, record) => (
                this.renderOperateCol(record)
            ),
        },
    ];

    renderOperateCol = (record) => {
        if (State[record.state].name == State.SAVED.name) {
            return <OperateCol menus={this.fetchOperatePropsOne(record)} />
        }
        if (State[record.state].name == State.INPROGRESS.name) {
            return <OperateCol menus={this.fetchOperatePropsTow(record)} />
        }
        if (State[record.state].name == State.AUDITED.name) {
            return <OperateCol menus={this.fetchOperatePropsThree(record)} />
        }
    }

    fetchOperatePropsOne = (record) => {
        return [{
            name: commonLocale.viewLocale,
            disabled: !havePermission(RTNPUTAWAY_RES.VIEW),
            onClick: this.onView.bind(this, record)
        }, {
            name: commonLocale.auditLocale,
            confirm: true,
            confirmCaption: putAwayLocal.title,
            onClick: this.onAudit.bind(this, record, false)
        }, {
            name: commonLocale.editLocale,
            disabled: !havePermission(RTNPUTAWAY_RES.EDIT),
            onClick: this.onEdit.bind(this, record)
        }, {
            name: commonLocale.deleteLocale,
            disabled: !havePermission(RTNPUTAWAY_RES.DELETE),
            confirm: true,
            confirmCaption: putAwayLocal.title,
            onClick: this.onRemove.bind(this, record, false)
        }];
    }

    fetchOperatePropsTow = (record) => {
        return [{
            name: commonLocale.viewLocale,
            disabled: !havePermission(RTNPUTAWAY_RES.VIEW),
            onClick: this.onView.bind(this, record)
        }, {
            name: commonLocale.auditLocale,
            disabled: !havePermission(RTNPUTAWAY_RES.AUDIT),
            confirm: true,
            confirmCaption: putAwayLocal.title,
            onClick: this.onAudit.bind(this, record, false)
        }];
    }

    fetchOperatePropsThree = (record) => {
        return [{
            name: commonLocale.viewLocale,
            disabled: !havePermission(RTNPUTAWAY_RES.VIEW),
            onClick: this.onView.bind(this, record)
        }];
    }

    /**
     * 绘制右上角按钮
     */
    drawActionButton = () => {
        return <Button
            type='primary' icon="plus"
            disabled={!havePermission(RTNPUTAWAY_RES.CREATE)}
            onClick={() => this.onCreate()}
        >
            {commonLocale.createLocale}
        </Button>
    }

    /**
    * 绘制批量工具栏
    */
    drawToolbarPanel() {
        const { selectedRows } = this.state;

        const batchPrintParams = [];
        selectedRows.forEach(function (e) {
            batchPrintParams.push({
                billNumber: e.billNumber
            })
        });
        return [
            <Button key={1} onClick={() => this.onBatchAudit()}
                disabled={!havePermission(RTNPUTAWAY_RES.AUDIT)}
            >
                {commonLocale.batchAuditLocale}
            </Button>,
            <Button key={2} onClick={() => this.onBatchRemove()}
                disabled={!havePermission(RTNPUTAWAY_RES.DELETE)}
            >
                {commonLocale.batchRemoveLocale}
            </Button>,
            <PrintButton
                key='printButton'
                reportParams={batchPrintParams}
                moduleId={PrintTemplateType.RTNPUTAWAYBILL.name} />
        ];
    }

    /**
    * 绘制搜索表格
    */
    drawSearchPanel = () => {
        return (
            <RtnPutawayBillSearchForm
                filterValue={this.state.pageFilter.searchKeyValues}
                refresh={this.onSearch}
            />
        );
    }
}
