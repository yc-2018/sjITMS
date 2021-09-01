import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, message, Modal, Form, Input, InputNumber, Switch, Divider } from 'antd';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import SearchPage from '@/pages/Component/Page/SearchPage';
import VehicleSearchForm from './VehicleSearchForm';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { VehicleState, VehicleLocale, VehiclePerm } from './VehicleLocale';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { orgType } from '@/utils/OrgType';
import { routerRedux } from 'dva/router';
const FormItem = Form.Item;

@connect(({ vehicle, loading }) => ({
    vehicle,
    loading: loading.models.vehicle,
}))
@Form.create()
export default class VehicleSearchPage extends SearchPage {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            title: VehicleLocale.title,
            data: props.vehicle.data,
            key:'vehicle.search.table',
        };
        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    }

    componentDidMount() {
      if(this.props.vehicle.fromView) {
        return;
      } else {
        this.refreshTable();
      }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.vehicle.data,
            entity: {}
        });
    }

    onCreate = (entity) => {
        const payload = {
            showPage: 'create'
        }
        if (entity) {
            payload.entity = entity;
        }
        this.props.dispatch({
            type: 'vehicle/showPage',
            payload: { ...payload }
        });
    }

    onView = (record) => {
        this.props.dispatch({
            type: 'vehicle/showPage',
            payload: {
                showPage: 'view',
                uuid: record.uuid
            }
        });
    }

    onOnline = (record, batch) => {
        const { dispatch } = this.props;
        const that = this;
        dispatch({
            type: 'vehicle/online',
            payload: {
                uuid: record.uuid,
                version: record.version
            },
            callback: response => {
                if (batch) {
                    that.batchCallback(response, record);
                    return;
                }
                if (response && response.success) {
                    this.refreshTable();
                    message.success(commonLocale.onlineSuccessLocale);
                }
            }
        });
    }

    onFree = (record, batch) => {
        const { dispatch } = this.props;
        const that = this;
        dispatch({
            type: 'vehicle/free',
            payload: {
                uuid: record.uuid,
                version: record.version
            },
            callback: response => {
                if (batch) {
                    that.batchCallback(response, record);
                    return;
                }
                if (response && response.success) {
                    this.refreshTable();
                    message.success(VehicleLocale.freeSuccessLocale);
                }
            }
        });
    }


    onDelete = (record) => {
        const { dispatch } = this.props;
        const that = this;
        dispatch({
            type: 'vehicle/delete',
            payload: {
                uuid: record.uuid,
                version: record.version
            },
            callback: response => {
                if (response && response.success) {
                    this.refreshTable();
                    message.success(commonLocale.removeSuccessLocale);
                }
            }
        });
    }


    onOffline = (record, batch) => {

        const { dispatch } = this.props;
        const that = this;
        dispatch({
            type: 'vehicle/offline',
            payload: {
                uuid: record.uuid,
                version: record.version
            },
            callback: response => {
                if (batch) {
                    that.batchCallback(response, record);
                    return;
                }
                if (response && response.success) {
                    this.refreshTable();
                    message.success(commonLocale.offlineSuccessLocale);
                }
            }
        });
    }

    onSearch = (data) => {
        const { pageFilter } = this.state;
        if (data) {
            pageFilter.likeKeyValues = {
                ...pageFilter.likeKeyValues,
                codeOrPlate: data.codeOrPlate
            },
                pageFilter.searchKeyValues = {
                    ...pageFilter.searchKeyValues,
                    state: data.state,
                    companyUuid: loginCompany().uuid,
                    carrierUuid: data.carrier ? JSON.parse(data.carrier).uuid : '',
                    vehicleTypeUuid: data.vehicleType ? JSON.parse(data.vehicleType).uuid : '',
                  ...data
                }
        } else {
            pageFilter.searchKeyValues = {
                companyUuid: loginCompany().uuid,
            },
                pageFilter.likeKeyValues = {
                }
        }
        this.refreshTable();
    }

    refreshTable = (filter) => {
        const { dispatch } = this.props;
        const { pageFilter } = this.state;

        const currentOrgType = loginOrg().type;
        const carrierUuid = (orgType.carrier.name === currentOrgType) ? loginOrg().uuid : pageFilter.searchKeyValues.carrierUuid;

        pageFilter.searchKeyValues = {
            ...pageFilter.searchKeyValues,
            carrierUuid: carrierUuid
        }

        let queryFilter = { ...pageFilter };
        if (filter) {
            queryFilter = {
                ...pageFilter,
                ...filter
            };
        }

        dispatch({
            type: 'vehicle/query',
            payload: queryFilter,
        });
    };

    drawActionButton = () => {
        return loginOrg().type === orgType.company.name && (
            <Fragment>
                <Button icon="plus" type="primary" onClick={() => this.onCreate()}
                    disabled={!VehiclePerm.CREATE}>
                    {commonLocale.createLocale}
                </Button>
            </Fragment>
        );
    }

    drawToolbarPanel = () => {
        return loginOrg().type === orgType.company.name && [
            <Button key='online' onClick={() => this.onBatchOnline()}
                disabled={!VehiclePerm.ONLINE}>
                {commonLocale.batchOnlineLocale}
            </Button>,
            <Button key='offline' onClick={() => this.onBatchOffline()}
                disabled={!VehiclePerm.ONLINE}>
                {commonLocale.batchOfflineLocale}
            </Button>,
        ];
    }

    onBatchOnline = () => {
        this.setState({
            batchAction: commonLocale.onlineLocale
        });
        this.handleBatchProcessConfirmModalVisible(true);
    }

    onBatchOffline = () => {
        this.setState({
            batchAction: commonLocale.offlineLocale
        });
        this.handleBatchProcessConfirmModalVisible(true);
    }

    onBatchFree = () => {
        this.setState({
            batchAction: VehicleLocale.freeLocale
        });
        this.handleBatchProcessConfirmModalVisible(true);
    }

    onBatchProcess = () => {
        const { selectedRows, batchAction } = this.state;

        const that = this;
        selectedRows.forEach(function (e) {
            if (batchAction === commonLocale.onlineLocale) {
                if (e.state === "Free") {
                    that.refs.batchHandle.calculateTaskSkipped();
                } else {
                    that.onOnline(e, true);
                }
            }
            else if (batchAction === commonLocale.offlineLocale) {
                if (e.state === VehicleState.OFFLINE.name) {
                    that.refs.batchHandle.calculateTaskSkipped();
                } else {
                    that.onOffline(e, true);
                }
            }
        });
    }

    drawOtherCom = () => {
        return (
            <div>
                {this.drawProgress()}
            </div>
        );
    }

    drawSearchPanel = () => {
        return <VehicleSearchForm filterEqualsValue={this.state.pageFilter.searchKeyValues}
            filterLikeValue={this.state.pageFilter.likeKeyValues}
            refresh={this.onSearch} />;
    }

    renderOperateCol = (record) => {
        const options = [];
        if ((record.state === VehicleState.OFFLINE.name) || (record.state === VehicleState.FREE.name))
            options.push(
                {
                    name: commonLocale.editLocale,
                    disabled: !(VehiclePerm.CREATE && (record.state === VehicleState.OFFLINE.name || record.state === VehicleState.FREE.name)),
                    onClick: this.onCreate.bind(this, record),
                }
            )
        if (record.state === VehicleState.OFFLINE.name || (record.state === VehicleState.FREE.name))
            options.push(
                {
                    name: commonLocale.deleteLocale,
                    disabled: !(VehiclePerm.REMOVE && (record.state === VehicleState.OFFLINE.name || record.state === VehicleState.FREE.name)),
                    onClick: this.onDelete.bind(this, record),
                    confirm: true,
                    confirmCaption: VehicleLocale.title
                })

        return <OperateCol menus={options} />
    }


    onChangeState = (record) => {
        let type = '';
        if (record.state === VehicleState.OFFLINE.name)
            type = 'vehicle/online';
        else if (record.state === VehicleState.FREE.name)
            type = 'vehicle/offline';
        if(type==''){
            message.warning('当前状态下不能启用/禁用');
            return;
        }
        this.props.dispatch({
            type: type,
            payload: {
                uuid: record.uuid,
                version: record.version,
            },
            callback: response => {
                this.refreshTable();
            }
        })
    }

    onViewVehicleType = (vehicleTypeUuid) => {
        this.props.dispatch(routerRedux.push({
            pathname: '/tms/vehicleType',
            payload: {
                showPage: 'view',
                uuid: vehicleTypeUuid
            }
        }))
    }

    columns = [
        {
            title: commonLocale.codeLocale,
            key: 'code',
            dataIndex: 'code',
            sorter: true,
            width:100,
            render: (text, record) => {
                return (
                    <a onClick={() => this.onView(record)}>
                        {text}
                    </a>
                );
            }
        },
        {
            title: VehicleLocale.plateNo,
            key: 'plateNumber',
            dataIndex: 'plateNumber',
            width:100,
            sorter: true,
        },
        {
            title: VehicleLocale.vehicleType,
            key: 'vehicleType',
            dataIndex: 'vehicleType',
            width:100,
            sorter: true,
            render: (text, record) => <a onClick={this.onViewVehicleType.bind(true, record.vehicleType ? record.vehicleType.uuid : undefined)}>
                {convertCodeName(record.vehicleType)}</a>

        },
        {
            title: VehicleLocale.carrier,
            key: 'carrier',
            dataIndex: 'carrier',
            width:100,
            sorter: true,
            render: (text, record) => <a onClick={this.onViewCarrier.bind(true, record.carrier ? record.carrier.uuid : undefined)}>
                {convertCodeName(record.carrier)}</a>
        },
        {
            title: commonLocale.stateLocale,
            key: 'state',
            dataIndex: 'state',
            width:100,
            sorter: true,
            render: (text, record) => {
                confirm = record.state === VehicleState.OFFLINE.name ? commonLocale.onlineLocale : commonLocale.offlineLocale;
                return (loginOrg().type === orgType.company.name ?
                    <div>
                        <IPopconfirm disabled={!VehiclePerm.ONLINE} onConfirm={this.onChangeState.bind(this, record)}
                            operate={confirm}
                            object={VehicleLocale.title}>
                            <Switch disabled={!VehiclePerm.ONLINE } checked={record.state !== VehicleState.OFFLINE.name} size="small" />
                        </IPopconfirm>
                        &emsp; {VehicleState[record.state].caption}
                    </div>
                    : <span>{VehicleState[record.state].caption}</span>
                )
            }
        },
        (loginOrg().type === orgType.company.name || loginOrg().type ===  orgType.dispatchCenter.name) ?
            {
                title: commonLocale.operateLocale,
                render: record => this.renderOperateCol(record)
            } : {}
    ];

}
