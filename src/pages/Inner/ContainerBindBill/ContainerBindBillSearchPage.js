import { connect } from 'dva';
import { Button, message, Form} from 'antd';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import { State } from '../ContainerMergerBill/ContainerMergerBillContants';
import ContainerBindBillSearchForm from './ContainerBindBillSearchForm';
import { containerBindBillLocale } from './ContainerBindBillLocale';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { getActiveKey} from '@/utils/LoginContext';
import { getQueryBillDays } from '@/utils/LoginContext';

const FormItem = Form.Item;
@connect(({ containerbind, loading }) => ({
    containerbind,
    loading: loading.models.containerbind,
}))
@Form.create()
export default class ContainerBindBillSearchPage extends SearchPage {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: containerBindBillLocale.title,
            data: props.containerbind.data,
            key: 'containerBind.search.table'
        };
        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
        this.state.pageFilter.sortFields = {
            billNumber: true
        };
    }

    componentDidMount() {
      if(this.props.containerbind.fromView) {
        return;
      } else {
        this.refreshTable();
      }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.containerbind.data
        });
    }

    onView = (record) => {
        this.props.dispatch({
            type: 'containerbind/showPage',
            payload: {
                showPage: 'view',
                entityUuid: record.uuid
            }
        });
    }

    onSearch = (data) => {
        const { pageFilter } = this.state;
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
            type: 'containerbind/query',
            payload: queryFilter,
        });
    };

    /**
* 审核
*/
    onAudit = (record, batch) => {
        const that = this;
        this.props.dispatch({
            type: 'containerbind/audit',
            payload: {
                uuid: record.uuid,
                version: record.version
            },
            callback: (response) => {
                if (batch) {
                    that.batchCallback(response, record);
                    return;
                }
                if (response && response.success) {
                    this.refreshTable();
                    message.success(commonLocale.auditLocale)
                }
            }
        });
    }

    drawSearchPanel = () => {
        return <ContainerBindBillSearchForm filterValue={this.state.pageFilter.searchKeyValues}
            refresh={this.onSearch} toggleCallback={this.toggleCallback}/>;
    }

    handleCancel() {
        this.props.form.resetFields();
        this.refreshTable();
    }

    columns = [
        {
            title: commonLocale.billNumberLocal,
            dataIndex: 'billNumber',
            sorter: true,
            width: colWidth.billNumberColWidth,
            render: (text, record) => {
                return (
                    <a onClick={() => this.onView(record)}>
                        {text}
                    </a>
                );
            }
        },
        {
            title: containerBindBillLocale.binder,
            dataIndex: 'binder',
            sorter: true,
            width: colWidth.codeNameColWidth,
            render: (val, record) => <EllipsisCol colValue={convertCodeName(record.binder)} />
        }, {
            title: commonLocale.stateLocale,
            dataIndex: 'state',
            sorter: true,
            width: colWidth.enumColWidth,
            render: val => (<BadgeUtil value={val} />)
        },
        {
            title: commonLocale.operateLocale,
            key: 'operate',
            width: colWidth.operateColWidth,
            render: record => (
                this.renderOperateCol(record)
            ),
        }
    ];

    renderOperateCol = (record) => {
        if (State[record.state].name == State.INPROGRESS.name) {
            return <OperateCol menus={this.fetchOperatePropsTow(record)} />
        }
        if (State[record.state].name == State.AUDITED.name) {
            return <OperateCol menus={this.fetchOperatePropsThree(record)} />
        }
    }

    fetchOperatePropsTow = (record) => {
        return [{
            name: commonLocale.viewLocale,
            onClick: this.onView.bind(this, record)
        }, {
            name: commonLocale.auditLocale,
            disabled: !havePermission(containerBindBillLocale.AUDIT),
            confirm: true,
            confirmCaption: containerBindBillLocale.title,
            onClick: this.onAudit.bind(this, record, undefined)
        }];
    }

    fetchOperatePropsThree = (record) => {
        return [{
            name: commonLocale.viewLocale,
            onClick: this.onView.bind(this, record)
        }];
    }


    /**
   * 绘制批量工具栏
   */
    drawToolbarPanel() {
        return [
            <Button key={1} onClick={() => this.onBatchAudit()}
                disabled={!havePermission(containerBindBillLocale.AUDIT)}
            >
                {commonLocale.batchAuditLocale}
            </Button>,
        ];
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


    // 批量操作
    onBatchProcess = () => {
        const { selectedRows, batchAction } = this.state;

        const that = this;
        selectedRows.forEach(function (e) {
            if (batchAction === commonLocale.auditLocale) {
                if (e.state === State.AUDITED.name)
                    that.refs.batchHandle.calculateTaskSkipped();
                else
                    that.onAudit(e, true);
            }
        });
    }

}
