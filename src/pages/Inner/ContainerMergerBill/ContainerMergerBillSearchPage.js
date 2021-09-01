import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Button, message, Form } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { convertCodeName, convertDateToTime } from '@/utils/utils';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { State } from './ContainerMergerBillContants';
import { containerMergerBillLocale } from './ContainerMergerBillLocale';
import ContainerMergerBillSearchForm from './ContainerMergerBillSearchForm';
import Empty from '@/pages/Component/Form/Empty';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { CONTAINERMERGER_RES } from './ContainerMergerBillPermission';
import { getQueryBillDays } from '@/utils/LoginContext';
const FormItem = Form.Item;

@connect(({ containermerger, loading }) => ({
    containermerger,
    loading: loading.models.containermerger,
}))
@Form.create()
export default class ContainerMergerBillSearchPage extends SearchPage {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: containerMergerBillLocale.title,
            data: props.containermerger.data,
            key: 'containerMergerBill.search.table'
        };
        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
        this.state.pageFilter.sortFields = {
            billNumber: true
        };
        if (!this.state.pageFilter.searchKeyValues.stateEquals)
            this.state.pageFilter.searchKeyValues.stateEquals = '';
        if (!this.state.pageFilter.likeKeyValues.billNumberLike)
            this.state.pageFilter.likeKeyValues.billNumberLike = null;
        if (!this.state.pageFilter.likeKeyValues.articleCodeContain)
            this.state.pageFilter.likeKeyValues.articleCodeContain = null;
        if (!this.state.pageFilter.likeKeyValues.fromContainerContain)
            this.state.pageFilter.likeKeyValues.fromContainerContain = null;
        if (!this.state.pageFilter.likeKeyValues.toContainerContain)
            this.state.pageFilter.likeKeyValues.toContainerContain = null;
        if (!this.state.pageFilter.likeKeyValues.binCodeContain)
            this.state.pageFilter.likeKeyValues.binCodeContain = null;
    }

    componentDidMount() {
      if(this.props.containermerger.fromView) {
        return;
      } else {
        this.refreshTable();
      }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.containermerger.data
        });
    }

    onAuditEnable = () => {
        this.setState({
            batchAction: commonLocale.auditLocale
        });
        this.handleBatchProcessConfirmModalVisible(true);
    }

    onBatchProcess = () => {
        const { selectedRows, batchAction } = this.state;

        const that = this;
        selectedRows.forEach(function (e) {
            that.onAudit(e, that.batchCallback);
        });
    }

    onAudit = (record, callback) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'containermerger/audit',
            payload: record,
            callback: callback ? callback : (response) => {
                if (response && response.success) {
                    this.refreshTable();
                    message.success(commonLocale.auditSuccessLocale);
                }
            }
        });
    }

    onView = (record) => {

        this.props.dispatch({
            type: 'containermerger/showPage',
            payload: {
                showPage: 'view',
                entityUuid: record.uuid
            }
        });
    }

    onSearch = (data) => {
        const { pageFilter } = this.state;
        var days = '';
        if (data) {
            if (data.days) {
              days = data.days
            }
            pageFilter.searchKeyValues = {
                ...pageFilter.searchKeyValues,
                ...data,
                days: days
            },
                pageFilter.likeKeyValues = {
                    ...pageFilter.likeKeyValues,
                    ...data
                }
        } else {
            pageFilter.searchKeyValues = {
                companyUuid: loginCompany().uuid,
                dcUuid: loginOrg().uuid,
                stateEquals: '',
                days: getQueryBillDays()
            },
                pageFilter.likeKeyValues = {
                    billNumberLike: '',
                    articleCodeContain: '',
                    fromContainerContain: '',
                    toContainerContain: '',
                    binCodeContain: ''
                }
        }
        this.refreshTable();
    }

    refreshTable = (filter) => {
        const { dispatch } = this.props;
        const { pageFilter } = this.state;
        if(pageFilter.searchKeyValues && !pageFilter.searchKeyValues.days) {
          pageFilter.searchKeyValues.days = getQueryBillDays()
        }
        let queryFilter = { ...pageFilter };
        if (filter) {
            queryFilter = { ...pageFilter, ...filter };
        }

        dispatch({
            type: 'containermerger/query',
            payload: queryFilter,
        });
    };

    drawToolbarPanel = () => {
        return [
            <Button key='batchAudit' onClick={() => this.onAuditEnable()}>
                {commonLocale.batchAuditLocale}
            </Button>,
        ];
    }

    drawSearchPanel = () => {
        return <ContainerMergerBillSearchForm filterValue={this.state.pageFilter.searchKeyValues}
            filterLikeValue={this.state.pageFilter.likeKeyValues} refresh={this.onSearch} toggleCallback={this.toggleCallback}/>;
    }

    handleCancel() {
        this.props.form.resetFields();
        this.refreshTable();
    }


    fetchOperateProps = (record) => {
        let operateProps = [];
        operateProps.push(
            {
                name: commonLocale.viewLocale,
                onClick: this.onView.bind(this, record)
            }
        );

        if (record.state === State.INPROGRESS.name) {
            operateProps.push(
                {
                    name: commonLocale.auditLocale,
                    confirm: true,
                    disabled: !havePermission(CONTAINERMERGER_RES.AUDIT),
                    confirmCaption: containerMergerBillLocale.title,
                    onClick: this.onAudit.bind(this, record, false)
                }
            );
        }

        return operateProps;
    }

    columns = [
        {
            title: commonLocale.billNumberLocal,
            dataIndex: 'billNumber',
            width: colWidth.billNumberColWidth,
            sorter: true,
            render: (text, record) => {
                return (
                    <a onClick={() => this.onView(record)}>
                        {text}
                    </a>
                );
            }
        },
        {
            title: containerMergerBillLocale.mergeEmployee,
            dataIndex: 'mergeEmployee',
            sorter: true,
            width: colWidth.codeNameColWidth,
            render: val => <EllipsisCol colValue={convertCodeName(val)} />
        },
        {
            title: containerMergerBillLocale.beginMergerTime,
            dataIndex: 'beginMergerTime',
            sorter: true,
            width: colWidth.dateColWidth,
            render: val => val ? convertDateToTime(val) : <Empty />
        },
        {
            title: containerMergerBillLocale.endMergerTime,
            dataIndex: 'endMergerTime',
            sorter: true,
            width: colWidth.dateColWidth,
            render: val => val ? convertDateToTime(val) : <Empty />
        },
        {
            title: commonLocale.stateLocale,
            dataIndex: 'state',
            sorter: true,
            width: colWidth.enumColWidth,
            render: val => (<BadgeUtil value={val} />)
        },
        {
            key: 'operate',
            title: commonLocale.operateLocale,
            width: colWidth.operateColWidth,
            render: record => {
                return <OperateCol menus={this.fetchOperateProps(record)} />
            }
        }
    ];
}
