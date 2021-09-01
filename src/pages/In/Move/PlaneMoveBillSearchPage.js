import { connect } from 'dva';
import { message, Button } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import { itemColWidth, colWidth } from '@/utils/ColWidth';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import PlaneMoveBillSearchForm from './PlaneMoveBillSearchForm';
import { res } from './PlaneMovePermission';
import { planeMoveLocale } from './PlaneMoveLocale';
import { state, getTypeCaption } from './PlaneMoveContants';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { getQueryBillDays } from '@/utils/LoginContext';
@connect(({ planeMove, loading }) => ({
    planeMove,
    loading: loading.models.planeMove,
}))
export default class PlaneMoveBillSearchPage extends SearchPage {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: planeMoveLocale.title,
            data: props.planeMove.data,
            suspendLoading:false,
            key: 'planeMove.search.table'
        };

        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    }

    componentDidMount() {
      if(this.props.planeMove.fromView) {
        return;
      } else {
        this.refreshTable();
      }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.planeMove.data
        });
    }

    onBatchAudit = () => {
        this.setState({
            batchAction: commonLocale.auditLocale
        });
        this.handleBatchProcessConfirmModalVisible(true);
    }

    onBatchProcess = () => {
        this.setState({
            suspendLoading:true
        })
        const { selectedRows } = this.state;

        const that = this;
        let bacth=(i)=>{
            if(i<selectedRows.length){
                if (selectedRows[i].state === state.INPROGRESS.name == false) {
                    that.refs.batchHandle.calculateTaskSkipped();
                    bacth(i+1);
                } else {
                    that.onAudit(selectedRows[i], true).then(res=>{
                        bacth(i+1);
                    })
                }
            }else{
                this.setState({
                    suspendLoading:false
                })
              }
        };
        batch(0);
    }

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
            type: 'planeMove/query',
            payload: queryFilter,
        });
    };

    onSearch = (data) => {
        const { pageFilter } = this.state;
        pageFilter.page = 0;
        var days = '';
        if (data) {
            let ownerUuid=undefined;
            let moverUuid=undefined;
            if (data.owner) {
                ownerUuid = JSON.parse(data.owner).uuid
            }
            if (data.mover) {
                moverUuid= JSON.parse(data.mover).uuid;
            }
            if (data.uploadDate) {
                data.beginUploadDate = data.uploadDate[0];
                data.endUploadDate = data.uploadDate[1];
            }
            if (data.days) {
              days = data.days
            }
            pageFilter.searchKeyValues = {
                ...pageFilter.searchKeyValues,
                ...data,
                ownerUuid:ownerUuid,
                moverUuid:moverUuid,
                days: days
            }
        } else {
            pageFilter.searchKeyValues = {
                companyUuid: loginCompany().uuid,
                dcUuid: loginOrg().uuid,
                state: '',
                days: getQueryBillDays()
            }
        }
        this.refreshTable();
    }

    drawToolbarPanel() {
        return [
            <Button key='batchAudit' disabled={!havePermission(res.audit)} onClick={() => this.onBatchAudit()}>
                {commonLocale.batchAuditLocale}
            </Button>
        ];
    }

    drawSearchPanel = () => {
        return (
            <PlaneMoveBillSearchForm
                filterValue={this.state.pageFilter.searchKeyValues}
                refresh={this.onSearch}
                toggleCallback={this.toggleCallback}
            />
        );
    }

    onView = (record) => {
        this.props.dispatch({
            type: 'planeMove/showPage',
            payload: {
                showPage: 'view',
              billNumber: record.billNumber
            }
        });
    }

    onAudit = (record, batch) => {
        const that = this;
        return new Promise(function (resolve, reject) {
            that.props.dispatch({
                type: 'planeMove/audit',
                payload: {
                    planeMoveBillNumber: record.billNumber,
                    version: record.version,
                    dcUuid: record.dcUuid,
                },
                callback: response => {
                    if (batch) {
                        that.batchCallback(response, record);
                        resolve({ success: response.success });
                        return;
                    }
                    if (response && response.success) {
                        that.refreshTable();
                        message.success(planeMoveLocale.title + record.billNumber + commonLocale.auditSuccessLocale);
                    } else {
                        message.error(response.message)
                    }
                }
            });
        })
    }





    fetchOperatePropsOne = (record) => {
        return [{
            name: commonLocale.viewLocale,
            onClick: this.onView.bind(this, record)
        }];
    }

    fetchOperatePropsTwo = (record) => {
        return [{
            name: commonLocale.viewLocale,
            onClick: this.onView.bind(this, record)
        }, {
            name: commonLocale.auditLocale,
            disabled: !havePermission(res.audit),
            confirm: true,
            confirmCaption: planeMoveLocale.title,
            onClick: this.onAudit.bind(this, record)
        }];
    }

    renderOperateCol = (record) => {
        if (record.state === state.INPROGRESS.name) {
            return <OperateCol menus={this.fetchOperatePropsTwo(record)} />
        }
        if (record.state === state.audited.name) {
            return <OperateCol menus={this.fetchOperatePropsOne(record)} />
        }
    }
    columns = [
        {
            key: 'billNumber',
            title: commonLocale.billNumberLocal,
            sorter: true,
            width: colWidth.billNumberColWidth,
            dataIndex: 'billNumber',
            render: (val, record) =>
                <span>
                    <a onClick={this.onView.bind(this, record)}>{record.billNumber}</a>
                </span>
        },
        {
            key: 'owner',
            title: commonLocale.ownerLocale,
            width: colWidth.codeNameColWidth,
            dataIndex: 'owner',
            sorter: true,
            render: val => <EllipsisCol colValue={convertCodeName(val)} />
        },
        {
            key: 'sourceWrh',
            title: planeMoveLocale.sourceWrh,
            width: colWidth.codeNameColWidth,
            dataIndex: 'sourceWrh',
            sorter: true,
            render: val => <EllipsisCol colValue={convertCodeName(val)} />
        },
        {
            key: 'targetWrh',
            title: planeMoveLocale.targetWrh,
            width: colWidth.codeNameColWidth,
            dataIndex: 'targetWrh',
            sorter: true,
            render: val => <EllipsisCol colValue={convertCodeName(val)} />
        },
        {
            key: 'type',
            dataIndex: 'type',
            title: planeMoveLocale.type,
            width: colWidth.enumColWidth,
            sorter: true,
            render: val => getTypeCaption(val)
        },
        {
            key: 'mover',
            title: planeMoveLocale.mover,
            width: colWidth.enumColWidth,
            dataIndex: 'mover',
            sorter: true,
            render: val => <EllipsisCol colValue={convertCodeName(val)} />
        },
        {
            key: 'state',
            title: commonLocale.stateLocale,
            width: colWidth.enumColWidth,
            dataIndex: 'state',
            sorter: true,
            render: val => <BadgeUtil value={val} />
        },
        {
            key: 'operate',
            title: commonLocale.operateLocale,
            width: colWidth.operateColWidth,

            render: record => (
                this.renderOperateCol(record)
            ),
        },
    ];
}
