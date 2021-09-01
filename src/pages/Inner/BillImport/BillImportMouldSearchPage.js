import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, message, Modal, Form, Input, InputNumber } from 'antd';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BillImportMouldSearchForm from './BillImportMouldSearchForm';
import { BILLIMPORT_RES } from './BillImportPermission';
import { billImportLocale } from './BillImportLocale';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { convertCodeName } from '@/utils/utils';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { BillType, getBillTypeCaption } from './BillType';
import Empty from '@/pages/Component/Form/Empty';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';

const FormItem = Form.Item;

@connect(({ billImport, loading }) => ({
    billImport,
    loading: loading.models.billImport,
}))
@Form.create()
export default class BillImportMouldSearchPage extends SearchPage {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            suspendLoading: false,
            title: billImportLocale.title,
            data: props.billImport.data,
            key: 'billImport.search.table'
        };
        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
        if (!this.state.pageFilter.likeKeyValues.codeNameLike)
            this.state.pageFilter.likeKeyValues.codeNameLike = '';
    }

    componentDidMount() {
        this.refreshTable();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.billImport.data,
            entity: {}
        });
    }

    onCreate = (uuid) => {
        const payload = {
            showPage: 'create'
        }
        if (uuid != '') {
            payload.entityUuid = uuid;
        }
        this.props.dispatch({
            type: 'billImport/showPage',
            payload: { ...payload }
        });
    }

    onType = () => {
        this.props.dispatch({
          type: 'billImport/showPage',
          payload: {
            showPage: 'type'
          }
        });
      }

    import = () => {
        this.props.dispatch({
            type: 'billImport/showPage',
            payload: {
                showPage: 'home'
            }
        });
    }

    onView = (record) => {
        this.props.dispatch({
            type: 'billImport/showPage',
            payload: {
                showPage: 'view',
                entityUuid: record.uuid
            }
        });
    }

    onRemove = (record, batch) => {
        const that = this;
        return new Promise(function (resolve, reject) {
            that.props.dispatch({
                type: 'billImport/remove',
                payload: record.uuid,
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

    onSearch = (data) => {
        const { pageFilter } = this.state;
        if (data) {
            delete data.ownerUuid;
            if (data.owner) {
                data.ownerUuid = JSON.parse(data.owner).uuid
            }
            pageFilter.searchKeyValues = {
                companyUuid: loginCompany().uuid,
                dcUuid: loginOrg().uuid,
                ...data
            }
        } else {
            pageFilter.searchKeyValues = {
                companyUuid: loginCompany().uuid,
                dcUuid: loginOrg().uuid,
                codeNameLike: '',
                ownerUuid: '',
                billType: ''
            }
        }
        this.refreshTable();
    }

    refreshTable = (filter) => {
        const { dispatch } = this.props;
        const { pageFilter } = this.state;

        let queryFilter = { ...pageFilter };
        if (filter) {
            queryFilter = { ...pageFilter, ...filter };
        }

        dispatch({
            type: 'billImport/query',
            payload: queryFilter,
        });
    };

    drawActionButton = () => {
      const menus = [
        {
        disabled: !havePermission(BILLIMPORT_RES.CREATE),
        name: billImportLocale.import,
        onClick: this.import
        },
        {
          name: '管理默认规格单位',
          onClick: this.onType
        },
      ];
        return (
            <Fragment>
                <Button disabled={!havePermission(BILLIMPORT_RES.CREATE)} icon="plus" type="primary" onClick={() => this.onCreate()}>
                    {commonLocale.createLocale}
                </Button>
              <SearchMoreAction menus={menus}/>
            </Fragment>
        );
    }

    drawToolbarPanel = () => {
        return (
            <Button disabled={!havePermission(BILLIMPORT_RES.DELETE)} onClick={() => this.onBatchOnRemove()}>
                {commonLocale.batchRemoveLocale}
            </Button>
        );
    }

    onBatchOnRemove = () => {
        this.setState({
            batchAction: commonLocale.deleteLocale
        });
        this.handleBatchProcessConfirmModalVisible(true);
    }

    onBatchProcess = () => {
        this.setState({
            suspendLoading: true
        })
        const { selectedRows, batchAction } = this.state;

        const that = this;
        let bacth = (i) => {
            if (i < selectedRows.length) {
                if (batchAction === commonLocale.deleteLocale) {
                    that.onRemove(selectedRows[i], true).then(res => {
                        bacth(i + 1);
                    });
                }
            } else {
                this.setState({
                    suspendLoading: false
                })
            }
        }
        bacth(0);
    }

    drawOtherCom = () => {
        return (
            <div>
                {this.drawProgress()}
            </div>
        );
    }

    drawSearchPanel = () => {
      return <BillImportMouldSearchForm toggleCallback={this.toggleCallback} filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} />;
    }

    fetchOperateProps = (record) => {
        return [
            {
                name: commonLocale.viewLocale,
                onClick: this.onView.bind(this, record)
            },
            {
                name: commonLocale.editLocale,
                disabled: !havePermission(BILLIMPORT_RES.CREATE),
                onClick: this.onCreate.bind(this, record.uuid)
            },
            {
                name: commonLocale.deleteLocale,
                disabled: !havePermission(BILLIMPORT_RES.DELETE),
                confirm: true,
                confirmCaption: billImportLocale.DELETE,
                onClick: this.onRemove.bind(this, record, false)
            }
        ];
    }

    columns = [
        {
            title: commonLocale.codeLocale,
            dataIndex: 'code',
            sorter: true,
            width: colWidth.codeColWidth,
            render: (text, record) => {
                return (
                    <a onClick={() => this.onView(record)}>
                        {text}
                    </a>
                );
            }
        },
        {
            title: commonLocale.nameLocale,
            dataIndex: 'name',
            width: colWidth.codeColWidth,
        },
        {
            title: billImportLocale.owner,
            dataIndex: 'owner',
            width: colWidth.codeNameColWidth,
            render: val => (
                <EllipsisCol colValue={convertCodeName(val)} />
            )
        },
        {
            title: billImportLocale.billType,
            dataIndex: 'billType',
            width: colWidth.codeColWidth,
            render: (text, record) => {
                return record.billType ? getBillTypeCaption(record.billType) : <Empty />
            }
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
