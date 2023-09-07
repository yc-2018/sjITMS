import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Switch, message } from 'antd';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import SearchPage from '@/pages/Component/Page/SearchPage';
import DCSearchForm from './DCSearchForm';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { getSourceWayCaption } from '@/utils/SourceWay';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { DC_RES } from './DCPermission';
import { dCLocale } from './DCLocale';
import { colWidth } from '@/utils/ColWidth';
import OperateCol from '@/pages/Component/Form/OperateCol';
import Empty from '@/pages/Component/Form/Empty';

@connect(({ dc, loading }) => ({
    dc,
    loading: loading.models.dc,
}))
export default class DCSearchPage extends SearchPage {
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            title: dCLocale.title,
            data: props.dc.data ? props.dc.data : { list: [] },
            suspendLoading: false,
            key: 'dc.search.table'
        };
        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        if (!this.state.pageFilter.searchKeyValues.state)
            this.state.pageFilter.searchKeyValues.state = '';
    }
    componentDidMount() {
        this.refreshTable();
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.dc.data) {
            this.setState({
                data: nextProps.dc.data
            });
        }
    }
    onCreate = () => {
        this.props.dispatch({
            type: 'dc/showPage',
            payload: {
                showPage: 'create'
            }
        });
    }
    onView = (record) => {
        this.props.dispatch({
            type: 'dc/showPage',
            payload: {
                showPage: 'view',
                entityUuid: record.uuid
            }
        });
    }
    onEdit = (record) => {
        this.props.dispatch({
            type: 'dc/showPage',
            payload: {
                showPage: 'create',
                entityUuid: record.uuid
            }
        });
    }
    onChangeState = (record) => {
        if (record.state === basicState.ONLINE.name) {
            this.offline(record, false);
        } else {
            this.online(record, false);
        }
    }
    online = (record, batch) => {
        const { dispatch } = this.props;
        let that = this;

        return new Promise(function (resolve, reject) {
            dispatch({
                type: 'dc/online',
                payload: {
                    uuid: record.uuid,
                    version: record.version
                },
                callback: response => {
                    if (batch) {
                        that.batchCallback(response, record);
                        resolve({ success: response.success });
                        return;
                    }

                    if (response && response.success) {
                        that.refreshTable();
                        message.success(commonLocale.onlineSuccessLocale);
                    }
                }
            });
        });
    }
    offline = (record, batch) => {
        const { dispatch } = this.props;
        let that = this;

        return new Promise(function (resolve, reject) {
            dispatch({
                type: 'dc/offline',
                payload: {
                    uuid: record.uuid,
                    version: record.version
                },
                callback: response => {
                    if (batch) {
                        that.batchCallback(response, record);
                        resolve({ success: response.success });
                        return;
                    }

                    if (response && response.success) {
                        that.refreshTable();
                        message.success(commonLocale.offlineSuccessLocale);
                    }
                }
            });
        });
    }
    onSearch = (data) => {
        const { pageFilter } = this.state;
        pageFilter.page = 0;
        if (data) {
            pageFilter.searchKeyValues = {
                ...pageFilter.searchKeyValues,
                ...data
            }
        } else {
            pageFilter.searchKeyValues = {
                companyUuid: loginCompany().uuid,
                state: ''
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
            type: 'dc/query',
            payload: queryFilter,
        });
    };
    onBatchOnline = () => {
        this.setState({
            batchAction: basicState.ONLINE.caption
        });
        this.handleBatchProcessConfirmModalVisible(true);
    }
    onBatchOffline = () => {
        this.setState({
            batchAction: basicState.OFFLINE.caption
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
                if (batchAction === basicState.ONLINE.caption) {
                    if (selectedRows[i].state === basicState.ONLINE.name) {
                        that.refs.batchHandle.calculateTaskSkipped();
                        bacth(i + 1)
                    } else {
                        this.online(selectedRows[i], true).then(res => {
                            bacth(i + 1)
                        });
                    }
                } else {
                    if (selectedRows[i].state === basicState.OFFLINE.name) {
                        that.refs.batchHandle.calculateTaskSkipped();
                        bacth(i + 1)
                    } else {
                        that.offline(selectedRows[i], true).then(res => {
                            bacth(i + 1)
                        })
                    }
                }
            } else {
                this.setState({
                    suspendLoading: false
                })
            }
        }
        bacth(0);
    }
    drawActionButton = () => {
        return (
            <Fragment>
                <Button icon="plus" disabled={!havePermission(DC_RES.CREATE)} type="primary" onClick={this.onCreate}>
                    {commonLocale.createLocale}
                </Button>
            </Fragment>
        );
    }
    drawToolbarPanel() {
        return [
            <Button key="onLine" disabled={!havePermission(DC_RES.ONLINE)} onClick={() => this.onBatchOnline()}>
                {commonLocale.batchOnlineLocale}
            </Button>,
            <Button key="offLine" disabled={!havePermission(DC_RES.ONLINE)} onClick={() => this.onBatchOffline()}>
                {commonLocale.batchOfflineLocale}
            </Button>
        ];
    }
    drawSearchPanel = () => {
        return <DCSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} />;
    }

    fetchOperateProps = (record) => {
        return [{
            name: commonLocale.viewLocale,
            onClick: this.onView.bind(this, record)
        }, {
            name: commonLocale.editLocale,
            disabled: !havePermission(DC_RES.CREATE),
            onClick: this.onEdit.bind(this, record)
        }];
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
            sorter: true,
            width: colWidth.codeColWidth,
        },
        {
            title: commonLocale.shortNameLocale,
            dataIndex: 'shortName',
            width: colWidth.codeColWidth,
            render: val => val ? val : <Empty />
        },
        {
            title: commonLocale.sourceWayLocale,
            dataIndex: 'sourceWay',
            width: colWidth.enumColWidth,
            render: val => (
                <span>
                    {getSourceWayCaption(val)}
                </span>
            )
        },
        {
            title: commonLocale.stateLocale,
            dataIndex: 'state',
            render: (text, record) => {
                confirm = record.state === basicState.ONLINE.name ? commonLocale.offlineLocale : commonLocale.onlineLocale;
                return (
                    <div>
                        <IPopconfirm onConfirm={this.onChangeState.bind(this, record)}
                            operate={confirm}
                            disabled={!havePermission(DC_RES.ONLINE)}
                            object={dCLocale.title}>
                            <Switch disabled={!havePermission(DC_RES.ONLINE)} checked={record.state === basicState.ONLINE.name} size="small" />
                        </IPopconfirm>
                        &emsp; {getStateCaption(record.state)}
                    </div>
                )
            },
        },
        {
            title: commonLocale.operateLocale,
            width: colWidth.operateColWidth,
            render: record => (
                <OperateCol menus={this.fetchOperateProps(record)} />
            ),
        },
    ];
}
