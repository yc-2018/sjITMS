import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, message} from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import StoreRtnNtcBillSearchForm from './StoreRtnNtcBillSearchForm';
import { State } from './StoreRtnNtcBillContants';
import { storeRtnNtcLocal } from './StoreRtnNtcBillLocale';
import { STORERTNNTC_RES } from './StoreRtnNtcBillPermission';
import OperateCol from '@/pages/Component/Form/OperateCol';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { orgType } from '@/utils/OrgType';
import { OWNER_RES } from '@/pages/Basic/Owner/OwnerPermission';
import { STORE_RES } from '@/pages/Basic/Store/StorePermission';
import { ALCNTC_RES } from '@/pages/Out/AlcNtc/AlcNtcPermission';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
import { getQueryBillDays } from '@/utils/LoginContext';

@connect(({ storeRtnNtc, loading }) => ({
    storeRtnNtc,
    loading: loading.models.storeRtnNtc,
}))
@Form.create()
export default class StoreRtnNtcBillSearchPage extends SearchPage {
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: storeRtnNtcLocal.title,
            data: props.storeRtnNtc.data,
            selectedRows: [],
            record: {},
            entityUuid: '',
            suspendLoading: false,
            key: 'storeRtnNtc.search.table'
        }

        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        this.state.pageFilter.searchKeyValues[loginOrg().type.toLowerCase() + 'Uuid'] = loginOrg().uuid;
        this.state.pageFilter.sortFields = {
            billNumber: true
        }
    }

    componentDidMount() {
      if(this.props.storeRtnNtc.fromView) {
        return;
      } else {
        this.refreshTable();
      }
    }

    componentWillReceiveProps(nextProps) {
        // this.setState({
        //     data: nextProps.storeRtnNtc.data
        // });
    }

    /**
     * 刷新/重置
     */
    refreshTable = (filter) => {
        const { dispatch } = this.props;
        const { pageFilter } = this.state;
        pageFilter.searchKeyValues[loginOrg().type.toLowerCase() + 'Uuid'] = loginOrg().uuid;
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
            type: 'storeRtnNtc/query',
            payload: queryFilter,
            callback: response => {
              if (response && response.success && response.data) {
                this.setState({
                  data:{
                    list: response.data.records ? response.data.records : [],
                    pagination: {
                      total: response.data.paging.recordCount,
                      pageSize: response.data.paging.pageSize,
                      current: response.data.page + 1,
                      showTotal: total => `共 ${total} 条`,
                    }
                  }
                })
              }
            }
        });
    };
    /**
     * 搜索
     */
    onSearch = (data) => {
        const { pageFilter } = this.state;
        pageFilter.page = 0;
        var days = '';

        if (data) {
            let storeUuid = undefined;
            let dcUuid = undefined;
            let ownerUuid = undefined;

          if (data.store)
                storeUuid = JSON.parse(data.store).uuid
            if (data.dc)
                dcUuid = JSON.parse(data.dc).uuid
            if (data.owner) {
              ownerUuid = JSON.parse(data.owner).uuid;
            }
            if (data.days) {
              days = data.days
            }
            pageFilter.searchKeyValues = {
              ...pageFilter.searchKeyValues,
              ...data,
              ownerUuid: ownerUuid,
            }
          pageFilter.searchKeyValues = {
            ...pageFilter.searchKeyValues,
            ...data,
            ownerUuid: ownerUuid,
            dcUuid: dcUuid,
            storeUuid: storeUuid,
            days: days
          }
            // if (loginOrg().type === orgType.store.name) {
            //     pageFilter.searchKeyValues = {
            //         ...pageFilter.searchKeyValues,
            //         ...data,
            //         dcUuid: dcUuid
            //     }
            // }
            // if (loginOrg().type === orgType.dc.name) {
            //     pageFilter.searchKeyValues = {
            //         ...pageFilter.searchKeyValues,
            //         ...data,
            //         storeUuid: storeUuid,
            //     }
            // }
        } else {
            pageFilter.searchKeyValues = {
                companyUuid: loginCompany().uuid,
                dcUuid:loginOrg().uuid,
                days: getQueryBillDays()
            }
            pageFilter.searchKeyValues[loginOrg().type.toLowerCase() + 'Uuid'] = loginOrg().uuid;
        }
        this.refreshTable();
    }

    /**
    * 显示新建界面
    */
    onCreate = () => {
        this.props.dispatch({
            type: 'storeRtnNtc/showPage',
            payload: {
                showPage: 'create',
            }
        });
    }

    onEdit = (record) => {
        this.props.dispatch({
            type: 'storeRtnNtc/showPage',
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
            type: 'storeRtnNtc/showPage',
            payload: {
                showPage: 'view',
                entityUuid: record.uuid
            }
        });
    }

    onBatchFinish = () => {
        this.setState({
            batchAction: commonLocale.finishLocale
        })
        this.handleBatchProcessConfirmModalVisible(true);
    }

    onBatchRemove = () => {
        this.setState({
            batchAction: commonLocale.deleteLocale
        })
        this.handleBatchProcessConfirmModalVisible(true);
    }

    onBatchAudit = () => {
        this.setState({
            batchAction: commonLocale.auditLocale
        })
        this.handleBatchProcessConfirmModalVisible(true);
    }

    onBatchCopy = () => {
        this.setState({
            batchAction: storeRtnNtcLocal.copy
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
                if (batchAction === commonLocale.finishLocale) {
                    if (e.state === State.INITIAL.name
                        || e.state === State.INPROGRESS.name)
                        that.onFinish(e, true).then(res => { batch(i + 1) });
                    else {
                        that.refs.batchHandle.calculateTaskSkipped();
                        batch(i + 1);
                    }
                } else if (batchAction === commonLocale.deleteLocale) {
                    if (e.state === State.SAVED.name)
                        that.onRemove(e, true).then(res => { batch(i + 1) });
                    else {
                        that.refs.batchHandle.calculateTaskSkipped();
                        batch(i + 1);
                    }
                } else if (batchAction === commonLocale.auditLocale) {
                    if (e.state === State.SAVED.name)
                        that.onApprove(e, true).then(res => { batch(i + 1) });
                    else {
                        that.refs.batchHandle.calculateTaskSkipped();
                        batch(i + 1);
                    }
                } else if (batchAction === storeRtnNtcLocal.copy) {
                    that.onCopy(e, true).then(res => { batch(i + 1) });
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
                type: 'storeRtnNtc/remove',
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
    /**
     * 批准
     */
    onApprove = (record, batch) => {
        const that = this

        return new Promise(function (resolve, reject) {
            that.props.dispatch({
                type: 'storeRtnNtc/approve',
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
                        message.success(commonLocale.auditSuccessLocale)
                    }
                }
            })
        })
    }

    /**
     * 单一完成
     */
    onFinish = (record, batch) => {
        const that = this;
        return new Promise(function (resolve, reject) {
            that.props.dispatch({
                type: 'storeRtnNtc/finish',
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

    onAbort = (record) => {
        const that = this;
        this.props.dispatch({
            type: 'storeRtnNtc/abort',
            payload: {
                uuid: record.uuid,
                version: record.version
            },
            callback: (response) => {
                if (response && response.success) {
                    this.refreshTable();
                    message.success(commonLocale.abortSuccessLocale)
                }
            }
        })
    }

    /**
     * 复制
     */
    onCopy = (record, batch) => {
        const that = this
        return new Promise(function (resolve, reject) {
            that.props.dispatch({
                type: 'storeRtnNtc/copy',
                payload: {
                    uuid: record.uuid,
                    isView: false
                },
                callback: (response) => {
                    if (batch) {
                        that.batchCallback(response, record);
                        resolve({ success: response.success });
                        return;
                    }
                    if (response && response.success) {
                        that.refreshTable();
                        message.success(storeRtnNtcLocal.copySuccess)
                    }
                }
            })
        })

    }

    /**
     * 批量导入
     */
    handleShowExcelImportPage = () => {
        this.props.dispatch({
            type: 'storeRtnNtc/showPage',
            payload: {
                showPage: 'import',
            }
        });
    }

    /**
     * 表格列
     */
    columns = [
        {
            title: commonLocale.billNumberLocal,
            dataIndex: 'billNumber',
            width: colWidth.billNumberColWidth + 50,
            sorter: true,
            render: (text, record) =>
                <span>
                    <a onClick={() => this.onView(record)}>
                        {text}
                    </a>
                </span>
        },
        {
          title: commonLocale.inStoreLocale,
          dataIndex: 'store',
          sorter: true,
          width: colWidth.codeNameColWidth,
          render: (text, record) => <a onClick={this.onViewStore.bind(true, record.store.uuid)}
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
          title: commonLocale.inOwnerLocale,
          dataIndex: 'owner',
          sorter: true,
          width: colWidth.codeNameColWidth,
          render: (text, record) => <a onClick={this.onViewOwner.bind(true, record.owner.uuid)}
                                     disabled={!havePermission(OWNER_RES.VIEW)}><EllipsisCol colValue={convertCodeName(record.owner)} /></a>
        }, {
          title: storeRtnNtcLocal.reason,
          dataIndex: 'reason',
          sorter: true,
          width: colWidth.codeNameColWidth,
        }, {
          title: storeRtnNtcLocal.rtnDate,
          dataIndex: 'rtnDate',
          sorter: true,
          width: colWidth.codeNameColWidth,
          render: (text, record) => record.rtnDate ? moment(record.rtnDate).format('YYYY-MM-DD') : <Empty />
        },
        {
          title: commonLocale.inUploadDateLocale,
          dataIndex: 'uploadTime',
          sorter: true,
          width: colWidth.dateColWidth,
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
            width: colWidth.operateColWidth + 100,
            render: (text, record) => (this.renderOperateCol(record))
        }
    ];

    renderOperateCol = (record) => {
        if (loginOrg().type == orgType.store.name) {
            return <OperateCol menus={[{
                name: commonLocale.viewLocale,
                onClick: this.onView.bind(this, record)
            }]} />
        }
        if (State[record.state].name == State.SAVED.name) {
            return <OperateCol menus={this.fetchOperatePropsOne(record)} />
        }
        if (State[record.state].name == State.INITIAL.name) {
            return <OperateCol menus={this.fetchOperatePropsTwo(record)} />
        }
        if (State[record.state].name == State.FINISHED.name
            || State[record.state].name == State.ABORTED.name) {
            return <OperateCol menus={this.fetchOperatePropsThree(record)} />
        }
        if (State[record.state].name == State.INPROGRESS.name) {
            return <OperateCol menus={this.fetchOperatePropsFour(record)} />
        }
    }

    fetchOperatePropsOne = (record) => {
        return [{
            name: commonLocale.viewLocale,
            onClick: this.onView.bind(this, record)
        }, {
            name: storeRtnNtcLocal.copy,
            confirm: true,
            confirmCaption: storeRtnNtcLocal.title,
            disabled: !havePermission(STORERTNNTC_RES.COPY),
            onClick: this.onCopy.bind(this, record, false)
        }, {
            name: commonLocale.auditLocale,
            disabled: !havePermission(STORERTNNTC_RES.AUDIT),
            confirm: true,
            confirmCaption: storeRtnNtcLocal.title,
            onClick: this.onApprove.bind(this, record, false)
        }, {
            name: commonLocale.editLocale,
            disabled: !havePermission(STORERTNNTC_RES.EDIT),
            onClick: this.onEdit.bind(this, record)
        }, {
            name: commonLocale.deleteLocale,
            disabled: !havePermission(STORERTNNTC_RES.DELETE),
            confirm: true,
            confirmCaption: storeRtnNtcLocal.title,
            onClick: this.onRemove.bind(this, record, false)
        }];
    }

    fetchOperatePropsTwo = (record) => {
        return [{
            name: commonLocale.viewLocale,
            onClick: this.onView.bind(this, record)
        }, {
            name: storeRtnNtcLocal.copy,
            confirm: true,
            confirmCaption: storeRtnNtcLocal.title,
            disabled: !havePermission(STORERTNNTC_RES.COPY),
            onClick: this.onCopy.bind(this, record, false)
        }, {
            name: commonLocale.abortLocale,
            confirm: true,
            disabled: !havePermission(STORERTNNTC_RES.ABORT),
            confirmCaption: storeRtnNtcLocal.title,
            onClick: this.onAbort.bind(this, record)
        }, {
            name: commonLocale.finishLocale,
            disabled: !havePermission(STORERTNNTC_RES.FINISH),
            confirm: true,
            confirmCaption: storeRtnNtcLocal.title,
            onClick: this.onFinish.bind(this, record, false)
        }];
    }

    fetchOperatePropsThree = (record) => {
        return [{
            name: commonLocale.viewLocale,
            onClick: this.onView.bind(this, record)
        }, {
            name: storeRtnNtcLocal.copy,
            confirm: true,
            confirmCaption: storeRtnNtcLocal.title,
            disabled: !havePermission(STORERTNNTC_RES.COPY),
            onClick: this.onCopy.bind(this, record, false)
        },];
    }

    fetchOperatePropsFour = (record) => {
        return [{
            name: commonLocale.viewLocale,
            onClick: this.onView.bind(this, record)
        }, {
            name: storeRtnNtcLocal.copy,
            confirm: true,
            confirmCaption: storeRtnNtcLocal.title,
            disabled: !havePermission(STORERTNNTC_RES.COPY),
            onClick: this.onCopy.bind(this, record, false)
        }, {
            name: commonLocale.finishLocale,
            disabled: !havePermission(STORERTNNTC_RES.FINISH),
            confirm: true,
            confirmCaption: storeRtnNtcLocal.title,
            onClick: this.onFinish.bind(this, record, false)
        }];
    }


    /**
     * 绘制右上角按钮
     */
    drawActionButton = () => {
        const menus  = [];
        if(loginOrg().type != orgType.store.name){
          menus.push({
            disabled: !havePermission(STORERTNNTC_RES.CREATE),
            name: commonLocale.importLocale,
            onClick: this.handleShowExcelImportPage
          });
          menus.push({
            name: storeRtnNtcLocal.storeRtnReason,
            onClick: this.onMangeRtnType
          });
        }
        // const menus = [{
        //   name:storeRtnNtcLocal.storeRtnReason,
        //   onClick:this.onMangeRtnType
        // },{
        //   name:commonLocale.importLocale,
        //   onClick: this.handleShowExcelImportPage
        // }]
        return loginOrg().type == orgType.store.name ? null :(
            <Fragment >
                <Button icon="plus" type="primary"
                    disabled={!havePermission(STORERTNNTC_RES.CREATE)}
                    onClick={this.onCreate.bind(this, '')}>{commonLocale.createLocale}
                </Button>
              <SearchMoreAction menus={menus}/>
            </Fragment>
        );
    }

  /**
   * 管理退仓原因
   */
  onMangeRtnType = () => {
        this.props.dispatch({
            type: 'storeRtnNtc/showPage',
            payload: {
                showPage: 'rtnType'
            }
        });
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
            <Button key={1} onClick={() => this.onBatchFinish()}
                disabled={!havePermission(STORERTNNTC_RES.FINISH)}
            >
                {commonLocale.batchFinishLocale}
            </Button>,
            <Button key={2} onClick={() => this.onBatchRemove()}
                disabled={!havePermission(STORERTNNTC_RES.DELETE)}
            >
                {commonLocale.batchRemoveLocale}
            </Button>,
            <Button key={3} onClick={() => this.onBatchAudit()}
                disabled={!havePermission(STORERTNNTC_RES.AUDIT)}
            >
                {commonLocale.batchAuditLocale}
            </Button>,
            <Button key={3} onClick={() => this.onBatchCopy()}
                disabled={!havePermission(STORERTNNTC_RES.COPY)}
            >
                {commonLocale.batchCopyLocale}
            </Button>,
            <PrintButton
                key='printButton'
                reportParams={batchPrintParams}
                moduleId={PrintTemplateType.STORERTNNTCBILL.name} />

        ];
    }

    /**
    * 绘制搜索表格
    */
    drawSearchPanel = () => {
        return (
            <StoreRtnNtcBillSearchForm
                filterValue={this.state.pageFilter.searchKeyValues}
                refresh={this.onSearch} toggleCallback={this.toggleCallback}
            />
        );
    }
}
