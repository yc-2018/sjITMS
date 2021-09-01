import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, message } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import Empty from '@/pages/Component/Form/Empty';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { itemColWidth, colWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import StoreRtnBillSearchForm from './StoreRtnBillSearchForm';
import { State, METHOD, ReturnType } from './StoreRtnBillContants';
import { storeRtnLocal } from './StoreRtnBillLocale';
import { STORERTN_RES } from './StoreRtnBillPermission';
import OperateCol from '@/pages/Component/Form/OperateCol';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { orgType } from '@/utils/OrgType';
import { STORE_RES } from '@/pages/Basic/Store/StorePermission';
import { getQueryBillDays } from '@/utils/LoginContext';

@connect(({ storeRtn, loading }) => ({
    storeRtn,
    loading: loading.models.storeRtn,
}))
@Form.create()
export default class StoreRtnBillSearchPage extends SearchPage {
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: storeRtnLocal.title,
            data: props.storeRtn.data,
            selectedRows: [],
            record: {},
            entityUuid: '',
            suspendLoading: false,
            key:'rtn.search.table'
        }

        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        this.state.pageFilter.searchKeyValues[loginOrg().type.toLowerCase() + 'Uuid'] = loginOrg().uuid;
        this.state.pageFilter.sortFields = {
            billNumber: true
        }
    }

    componentDidMount() {
      if(this.props.storeRtn.fromView) {
        return;
      } else {
        this.refreshTable();
      }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.storeRtn.data
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
            type: 'storeRtn/query',
            payload: queryFilter,
        });
    };
    /**
     * 搜索
     */
    onSearch = (data) => {
        const { pageFilter } = this.state;
        pageFilter.page = 0;

        if (data) {
            let vendorUuid = undefined;
            let storeUuid = undefined;
            let dcUuid = undefined;
            let ownerUuid = undefined;
            var days = '';
            if (data.vendor)
                vendorUuid = JSON.parse(data.vendor).uuid;
            if (data.store)
                storeUuid = JSON.parse(data.store).uuid;
            if (data.dc)
                dcUuid = JSON.parse(data.dc).uuid;
            if(data.owner)
              ownerUuid =JSON.parse(data.owner).uuid;
            if (data.days) {
              days = data.days
            }
            pageFilter.searchKeyValues = {
                ...pageFilter.searchKeyValues,
                ...data,
                storeUuid: storeUuid,
                vendorUuid: vendorUuid,
                dcUuid: dcUuid,
                ownerUuid : ownerUuid,
                days: days
            }
        } else {
            pageFilter.searchKeyValues = {
                companyUuid: loginCompany().uuid,
                days: getQueryBillDays()
            }
        }
        pageFilter.searchKeyValues[loginOrg().type.toLowerCase() + 'Uuid'] = loginOrg().uuid;
        this.refreshTable();
    }

    /**
    * 显示新建界面
    */
    onCreate = () => {
        this.props.dispatch({
            type: 'storeRtn/showPage',
            payload: {
                showPage: 'create',
            }
        });
    }

  /**
   * 显示新建界面
   */
  onNoCreate = () => {
    this.props.dispatch({
      type: 'storeRtn/showPage',
      payload: {
        showPage: 'createno',
      }
    });
  }

    onEdit = (record) => {
    let showPage = '';
    if(record.rtnNtcBillNumber) {
      showPage = 'create'
    } else {
      showPage = 'createno'
    }
      this.props.dispatch({
        type: 'storeRtn/showPage',
        payload: {
          showPage: showPage,
          entityUuid: record.uuid
        }
      });
  }

    /**
    * 查看详情
    */
    onView = (record) => {
        this.props.dispatch({
            type: 'storeRtn/showPage',
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
                        that.onAudit(e, true).then(res => { batch(i + 1) });
                    } else {
                        that.refs.batchHandle.calculateTaskSkipped();
                        batch(i + 1);
                    }
                } else if (batchAction === commonLocale.deleteLocale) {
                    if (State.SAVED.name === e.state) {
                        that.onRemove(e, true).then(res => { batch(i + 1) });
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
        const that = this;
        return new Promise(function (resolve, reject) {
            that.props.dispatch({
                type: 'storeRtn/remove',
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
        let type = 'storeRtn/audit';
        if (record.state === 'INPROGRESS') {
            type = 'storeRtn/auditByState';
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
                <span>
                    <a onClick={() => this.onView(record)}>
                        {text}
                    </a>
                </span>
        },
      {
        title: commonLocale.inStoreLocale,
        width: colWidth.codeNameColWidth,
        dataIndex: 'store',
        sorter: true,
        render: (text, record) => <a onClick={this.onViewStore.bind(true, record.store ? record.store.uuid : undefined)}
                                     disabled={!havePermission(STORE_RES.VIEW)}><EllipsisCol colValue={convertCodeName(record.store)} /></a>
      },
      {
        title: commonLocale.inWrhLocale,
        dataIndex: 'wrh',
        sorter: true,
        width: colWidth.codeNameColWidth,
        render: (text, record) => <EllipsisCol colValue={convertCodeName(record.wrh)} />
      },
      {
        title: "单据类型",
        dataIndex: 'returnType',
        sorter: true,
        width: colWidth.codeNameColWidth,
        render: (text, record) => record.returnType ? ReturnType[record.returnType].caption : <Empty />
      },
      {
        title: commonLocale.inOwnerLocale,
        dataIndex: 'owner',
        sorter: true,
        width: colWidth.codeNameColWidth,
        render: (text, record) => <EllipsisCol colValue={convertCodeName(record.owner)} />
      }, {
        title: storeRtnLocal.method,
        dataIndex: 'method',
        sorter: true,
        width: colWidth.enumColWidth,
        render: (text, record) => record.method ? METHOD[record.method].caption : <Empty />
      }, {
        title: storeRtnLocal.rtner,
        dataIndex: 'rtner',
        sorter: true,
        width: colWidth.codeNameColWidth,
        render: (text, record) => <EllipsisCol colValue={convertCodeName(record.rtner)} />
      },
      {
        title: commonLocale.inUploadDateLocale,
        dataIndex: 'uploadTime',
        sorter: true,
        width: colWidth.dateColWidth,
        render: (text, record) => <span>{record.uploadTime ? moment(record.uploadTime).format('YYYY-MM-DD') : <Empty />}</span>,
      },
      {
        title: storeRtnLocal.rtnNtcBillNumber,
        width: colWidth.billNumberColWidth,
        key: storeRtnLocal.rtnNtcBillNumber,
        sorter: true,
        dataIndex: 'rtnNtcBillNumber',
        render: val => val ? <EllipsisCol colValue={val} /> : <Empty />
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
        if (loginOrg().type == orgType.store.name) {
            return <OperateCol menus={this.fetchOperatePropsThree(record)} />
        }
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
            onClick: this.onView.bind(this, record)
        }, {
            name: commonLocale.editLocale,
            disabled: !havePermission(STORERTN_RES.EDIT),
            onClick: this.onEdit.bind(this, record)
        }, {
            name: commonLocale.deleteLocale,
            disabled: !havePermission(STORERTN_RES.DELETE),
            confirm: true,
            confirmCaption: storeRtnLocal.title,
            onClick: this.onRemove.bind(this, record, false)
        }, {
            name: commonLocale.auditLocale,
            disabled: !havePermission(STORERTN_RES.AUDIT),
            confirm: true,
            confirmCaption: storeRtnLocal.title,
            onClick: this.onAudit.bind(this, record, false)
        }];
    }

    fetchOperatePropsTow = (record) => {
        return [{
            name: commonLocale.viewLocale,
            onClick: this.onView.bind(this, record)
        }, {
            name: commonLocale.auditLocale,
            disabled: !havePermission(STORERTN_RES.AUDIT),
            confirm: true,
            confirmCaption: storeRtnLocal.title,
            onClick: this.onAudit.bind(this, record, false)
        }];
    }

    fetchOperatePropsThree = (record) => {
        return [{
            name: commonLocale.viewLocale,
            onClick: this.onView.bind(this, record)
        }];
    }

    /**
     * 绘制右上角按钮
     */
    drawActionButton = () => {
        return loginOrg().type == orgType.store.name ? [] : [(
          <div>
            <Button
              type='primary' key='createButton'
              disabled={!havePermission(STORERTN_RES.CREATE)}
              onClick={() => this.onCreate()}
            >
              {'新建退仓单'}
            </Button>
            <Button
              type='primary' key='createButtonNO'
              disabled={!havePermission(STORERTN_RES.CREATE)}
              onClick={() => this.onNoCreate()}
            >
              {'新建非通知单退仓单'}
            </Button>
          </div>


        )];
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

        return loginOrg().type == orgType.store.name ? [] : [
            <Button key={1} onClick={() => this.onBatchAudit()}
                disabled={!havePermission(STORERTN_RES.AUDIT)}
            >
                {commonLocale.batchAuditLocale}
            </Button>,
            <Button key={2} onClick={() => this.onBatchRemove()}
                disabled={!havePermission(STORERTN_RES.DELETE)}
            >
                {commonLocale.batchRemoveLocale}
            </Button>,
            <PrintButton
                key='printButton'
                reportParams={batchPrintParams}
                moduleId={PrintTemplateType.STORERTNBILL.name} />
        ];
    }

    /**
    * 绘制搜索表格
    */
    drawSearchPanel = () => {
        return (
            <StoreRtnBillSearchForm
                filterValue={this.state.pageFilter.searchKeyValues}
                refresh={this.onSearch} toggleCallback={this.toggleCallback}
            />
        );
    }
}
