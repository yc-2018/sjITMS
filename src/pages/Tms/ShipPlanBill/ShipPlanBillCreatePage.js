import { connect } from 'dva';
import moment from 'moment';
import { Select, Form, message, Modal, Input, InputNumber } from 'antd';
import CreatePage from '@/pages/Component/Page/CreatePage';
import CFormItem from '@/pages/Component/Form/CFormItem';
import FormPanel from '@/pages/Component/Form/FormPanel';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import {
    commonLocale, notNullLocale, placeholderChooseLocale,
    placeholderLocale
} from '@/utils/CommonLocale';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { PRETYPE } from '@/utils/constants';
import { shipPlanBillLocale } from './ShipPlanBillLocale';
import { ShipPlanType, WorkType } from './ShipPlanBillContants';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { add, accAdd, accMul } from '@/utils/QpcStrUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import Empty from '@/pages/Component/Form/Empty';
import VehicleSelect from './VehicleSelect';
import SerialArchSelect from '@/pages/Component/Select/SerialArchSelect';
import FromOrgSelect from './FromOrgSelect';
import ToOrgSelect from './ToOrgSelect';
import PanelItemBatchAdd from '@/pages/Component/Form/PanelItemBatchAdd';
import ShipPlanSearchFormItemBatchAdd from './ShipPlanSearchFormItemBatchAdd';

const Option = Select.Option;
@connect(({ shipplanbill, vehicleType, vehicle, loading }) => ({
    shipplanbill,
    vehicleType,
    vehicle,
    loading: loading.models.shipplanbill,
}))

@Form.create()
export default class ShipPlanBillCreatePage extends CreatePage {
    constructor(props) {
        super(props);

        this.state = {
            title: commonLocale.createLocale + shipPlanBillLocale.title,
            currentView: CONFIRM_LEAVE_ACTION.NEW,
            entity: {
                employees: [],
                items: []
            },
            vehicleUuid: '',
            vehicleTypeUuid: '',
            deliveryDispatchItems: [],
            batchAddVisible: false,
            deliveryDispatchList: [],//批量添加查询后的分页数据
            pageFilter: {
                searchKeyValues: {
                    page: 0,
                    pageSize: 10,
                    companyUuid: loginCompany().uuid
                }
            },
            vehicleEmployees: []
        }
    }

    componentDidMount() {
        let shipplanbillItems = this.props.shipplanbill.entity.items;
        if (this.props.shipplanbill.entityUuid) {
            this.setState({
                currentView: CONFIRM_LEAVE_ACTION.EDIT
            })
            this.props.dispatch({
                type: 'shipplanbill/get',
                payload: this.props.shipplanbill.entityUuid
            });
        } else if (this.props.shipplanbill.entity && shipplanbillItems) {
            shipplanbillItems.forEach(function (item, index) {
                item.line = index + 1;
                item.shipPlanType = item.type;
                item.dockGroupStr = item.dockerGroupStr;
                item.serialArchLine = item.serialArchLineUcn;
                if (item.staticProfile) {
                    item.amount = item.staticProfile.amount;
                    item.weight = item.staticProfile.weight;
                    item.volume = item.staticProfile.volume;
                    item.qtyStr = item.staticProfile.qtyStr;
                }
            });

            this.props.shipplanbill.entity.serialArch = shipplanbillItems[0].serialArchUcn;
            this.setState({
                entity: this.props.shipplanbill.entity
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        const vehicleType = nextProps.vehicleType.entity;
        let currentEntity = this.state.entity;

        if (nextProps.shipplanbill.entity && nextProps.shipplanbill.entity != this.props.shipplanbill.entity
            && nextProps.shipplanbill.entity.uuid && !this.state.entity.uuid) {
            if (!nextProps.shipplanbill.entity.items)
                nextProps.shipplanbill.entity.items = [];
            else {
                nextProps.shipplanbill.entity.items.forEach(function (item, index) {
                    item.line = index + 1;
                });
            }

            currentEntity = nextProps.shipplanbill.entity;
            this.setState({
                entity: nextProps.shipplanbill.entity,
                title: shipPlanBillLocale.title + ':' + nextProps.shipplanbill.entity.billNumber
            });

            this.props.dispatch({
                type: 'vehicle/getByUuid',
                payload: nextProps.shipplanbill.entity.vehicle.uuid
            });
        }

        if (this.state.entity.vehicle && vehicleType && vehicleType.uuid) {
            let vehicleBearWeight = vehicleType.bearWeight / 1000;
            let vehicleVolume = vehicleType.length * vehicleType.width * vehicleType.height * vehicleType.bearVolumeRate / 100000000;

            currentEntity.vehicleBearWeight = vehicleBearWeight;
            currentEntity.vehicleVolume = vehicleVolume;
 
            this.setState({
                entity: { ...currentEntity }
            });
        }

        if (nextProps.shipplanbill.toOrgData && nextProps.shipplanbill.toOrgData.list) {
            this.setState({
                deliveryDispatchItems: nextProps.shipplanbill.toOrgData.list
            });
        }

        if (nextProps.shipplanbill.shipPlanDeliveryDispatch && nextProps.shipplanbill.shipPlanDeliveryDispatch.list) {
            let shipPlanDeliveryDispatchList = nextProps.shipplanbill.shipPlanDeliveryDispatch.list;
            shipPlanDeliveryDispatchList.forEach(function (e) {
                var serialArchLineList = e.serialArchLineStr.split(",");
                serialArchLineList.forEach(function (item) {
                    var serialArchLine = item.split(";");
                    var serialArchLineUcn = {
                        "uuid": serialArchLine[0],
                        "code": serialArchLine[1],
                        "name": serialArchLine[2]
                    }
                    e.serialArchLine = serialArchLineUcn;
                });
            });

            nextProps.shipplanbill.shipPlanDeliveryDispatch.list = shipPlanDeliveryDispatchList;
            this.setState({
                deliveryDispatchList: nextProps.shipplanbill.shipPlanDeliveryDispatch
            });
        }

        if (this.state.entity.vehicle && nextProps.vehicle && nextProps.vehicle.entity) {
            this.setState({
                vehicleEmployees: nextProps.vehicle.entity.employees
            });
            if (!nextProps.shipplanbill.entity || !nextProps.shipplanbill.entity.uuid) {
                let employees = [];
                if (nextProps.vehicle.entity.employees && nextProps.vehicle.entity.employees.length > 0) {
                    nextProps.vehicle.entity.employees.forEach(function (employee) {
                        let vehicleEmployee = {
                            "uuid": employee.empUuid,
                            "code": employee.empCode,
                            "name": employee.empName
                        };
                        employees.push({
                            vehicleEmployee: vehicleEmployee,
                            vehicleEmployeeType: employee.workType
                        });
                    });
                }
                currentEntity.employees = employees;
                this.setState({
                    entity: currentEntity
                });
            }
        }
    }

    validData = (newData) => {
        if (newData.items.length === 0) {
            message.error(notNullLocale(commonLocale.itemsLineLocale));
            return false;
        }

        for (let i = newData.items.length - 1; i >= 0; i--) {
            if (!newData.items[i].shipPlanType) {
                message.error(`明细第${newData.items[i].line}行任务类型不能为空！`);
                return false;
            }

            if (!newData.items[i].fromOrg) {
                message.error(`明细第${newData.items[i].line}行来源不能为空！`);
                return false;
            }

            if (!newData.items[i].toOrg) {
                message.error(`明细第${newData.items[i].line}行目标不能为空！`);
                return false;
            }

            if (!newData.items[i].serialArchLine) {
                message.error(`明细第${newData.items[i].line}行线路不能为空！`);
                return false;
            }

            newData.items[i].shipOrder = newData.items[i].line;
        }

        for (let i = 0; i < newData.items.length; i++) {
            for (let j = i + 1; j < newData.items.length; j++) {
                if (newData.items[i].shipPlanType === newData.items[j].shipPlanType &&
                    newData.items[i].fromOrg.uuid === newData.items[j].fromOrg.uuid &&
                    newData.items[i].toOrg.uuid === newData.items[j].toOrg.uuid) {
                    message.error(`明细第${newData.items[i].line}行与第${newData.items[j].line}行重复！`);
                    return false;
                }
            }
        }

        return newData;
    }


    /**
     * 保存
     */
    onSave = (data) => {
        let newData = { ...this.state.entity };
        newData.note = data.note;

        newData = this.validData(newData);
        if (!newData) {
            return;
        }

        let type = 'shipplanbill/onSave';
        if (newData.uuid) {
            type = 'shipplanbill/onModify';
        }
        newData.companyUuid = loginCompany().uuid;
        this.props.dispatch({
            type: type,
            payload: newData,
            callback: response => {
                if (response && response.success) {
                    message.success(commonLocale.saveSuccessLocale);
                }
            }
        });
    }


    /**
     * 创建并新建
     */
    onSaveAndCreate = (data) => {
        let newData = { ...this.state.entity };
        newData.note = data.note;

        newData = this.validData(newData);
        if (!newData) {
            return;
        }

        this.queryVehicleType('');

        newData.companyUuid = loginCompany().uuid;
        this.props.dispatch({
            type: 'shipplanbill/onSaveAndCreate',
            payload: newData,
            callback: response => {
                if (response && response.success) {
                    this.setState({
                        vehicleType: {},
                        vehicleUuid: '',
                        vehicleTypeUuid: '',
                        entity: {
                            employees: [],
                            items: []
                        }
                    })
                    this.props.form.resetFields();
                    message.success(commonLocale.saveSuccessLocale);
                }
            }
        });
    }

    queryVehicleType = (vehicleTypeUuid) => {
        const { entity } = this.state;

        this.props.dispatch({
            type: 'vehicleType/getByUuid',
            payload: vehicleTypeUuid
        });
    }

    /** 取消 **/
    onCancel = () => {
        this.props.dispatch({
            type: 'shipplanbill/showPage',
            payload: {
                showPage: 'query'
            }
        });
        this.setState({
            entity: {
                employees: [],
                items: []
            },
            vehicleUuid: '',
            vehicleTypeUuid: '',
            deliveryDispatchItems: []
        })
    }

    onSerialArchChange = (value) => {
        const { entity } = this.state;

        let serialArch = JSON.parse(value);
        if (!entity.serialArch || entity.items.length === 0) {
            entity.serialArch = serialArch;
            return;
        }

        if (entity.serialArch.uuid != serialArch.uuid) {
            Modal.confirm({
                title: shipPlanBillLocale.serialArchChangeModalMessage,
                okText: commonLocale.confirmLocale,
                cancelText: commonLocale.cancelLocale,
                onOk: () => {
                    entity.serialArch = serialArch;
                    entity.items = [];
                    this.setState({
                        entity: { ...entity }
                    });
                },
                onCancel: () => {
                    this.props.form.setFieldsValue({
                        serialArch: JSON.stringify(entity.serialArch)
                    });
                    this.setState({
                        entity: { ...entity }
                    });
                }
            });
        }
    }

    onDriverChange = (value) => {
        const { entity } = this.state;

        let employees = entity.employees ? entity.employees : [];

        if (!value)
            return;

        value.forEach(function (employee) {
            if (employee) {
                let employeeUcn = {};
                employeeUcn.vehicleEmployee = JSON.parse(employee);
                employeeUcn.vehicleEmployeeType = 'DRIVER';
                employees.push(employeeUcn);
            }
        });

        entity.employees = employees;
    }

    onStevedoreChange = (value) => {
        const { entity } = this.state;

        let employees = entity.employees ? entity.employees : [];

        if (!value)
            return;

        value.forEach(function (employee) {
            if (employee) {
                let employeeUcn = {};
                employeeUcn.vehicleEmployee = JSON.parse(employee);
                employeeUcn.vehicleEmployeeType = 'STEVEDORE';
                employees.push(employeeUcn);
            }
        });

        entity.employees = employees;
    }

    onVehicleChange = (vehicleUcn, vehicleTypeUcn, carrierUcn) => {
        const { entity } = this.state;
        entity.employees = [];

        let vehicle = JSON.parse(vehicleUcn);
        if (!entity.vehicle || (entity.vehicle.uuid != vehicleUcn.uuid)) {
            this.props.dispatch({
                type: 'vehicle/getByUuid',
                payload: vehicle.uuid
            });

            entity.vehicle = vehicle;
            entity.vehicleType = vehicleTypeUcn;
            entity.carrier = carrierUcn;
            this.queryVehicleType(entity.vehicleType.uuid);
            return;
        }

        this.setState({
            entity: { ...entity }
        });
    }

    getVehicleEmployees = (workType) => {
        let drivers = [];
        const { vehicleEmployees } = this.state;
        if (!vehicleEmployees)
            return drivers;

        vehicleEmployees.forEach(function (employee) {
            if (workType === employee.workType) {
                drivers.push({
                    "uuid": employee.empUuid,
                    "code": employee.empCode,
                    "name": employee.empName
                });
            }
        });
        return drivers;
    }

    getVehicleEmployeeOptions = (workType) => {
        const vehicleEmployees = this.getVehicleEmployees(workType);
        const vehicleEmployeeOptions = [];
        vehicleEmployees.forEach(e => {
            vehicleEmployeeOptions.push(
                <Select.Option key={e.uuid} value={JSON.stringify(e)}>
                    {'[' + e.code + ']' + e.name}
                </Select.Option>
            );
        });
        return vehicleEmployeeOptions;
    }

    drawFormItems = () => {
        const { getFieldDecorator } = this.props.form;
        const { entity } = this.state;

        let drivers = [];
        let stevedores = [];
        if (entity.employees && entity.employees.length > 0) {
            entity.employees.forEach(function (employee) {
                if (WorkType.DRIVER.name == employee.vehicleEmployeeType)
                    drivers.push(JSON.stringify(employee.vehicleEmployee));
                else
                    stevedores.push(JSON.stringify(employee.vehicleEmployee));
            });
        }

        let cols = [
            <CFormItem key='vehicle' label={shipPlanBillLocale.vehicle}>
                {
                    getFieldDecorator('vehicle', {
                        rules: [
                            { required: true, message: notNullLocale(shipPlanBillLocale.vehicle) },
                        ],
                        initialValue: JSON.stringify(entity.vehicle),
                    })(
                        <VehicleSelect
                            onChange={this.onVehicleChange}
                            placeholder={shipPlanBillLocale.vehicle}
                        />
                    )
                }
            </CFormItem>,
            <CFormItem label={shipPlanBillLocale.vehicleType} key='vehicleType'>
                {getFieldDecorator('vehicleType', {
                    initialValue: entity.vehicleType ? convertCodeName(entity.vehicleType) : null
                })(<span>{entity.vehicleType ? convertCodeName(entity.vehicleType) : <Empty />}</span>)}
            </CFormItem>,
            <CFormItem label={shipPlanBillLocale.vehicleBearWeight} key='vehicleBearWeight'>
                {getFieldDecorator('vehicleBearWeight', {
                    initialValue: entity.vehicleBearWeight
                })(<span>{entity.vehicleBearWeight ? entity.vehicleBearWeight : <Empty />}</span>)}
            </CFormItem>,
            <CFormItem label={shipPlanBillLocale.vehicleVolume} key='vehicleVolume'>
                {getFieldDecorator('vehicleVolume', {
                    initialValue: entity.vehicleVolume
                })(<span>{entity.vehicleVolume ? entity.vehicleVolume : <Empty />}</span>)}
            </CFormItem>,
            <CFormItem label={shipPlanBillLocale.carrier} key='carrier'>
                {getFieldDecorator('carrier', {
                    initialValue: entity.carrier ? convertCodeName(entity.carrier) : null
                })(<span>{entity.carrier ? convertCodeName(entity.carrier) : <Empty />}</span>)}
            </CFormItem>,
            <CFormItem key='serialArch' label={shipPlanBillLocale.serialArch}>
                {
                    getFieldDecorator('serialArch', {
                        rules: [
                            { required: true, message: notNullLocale(shipPlanBillLocale.serialArch) },
                        ],
                        initialValue: entity.serialArch ? JSON.stringify(entity.serialArch) : undefined,
                    })(
                        <SerialArchSelect
                            onChange={this.onSerialArchChange}
                            placeholder={shipPlanBillLocale.serialArch}
                        />
                    )
                }
            </CFormItem>,
            <CFormItem key='driver' label={shipPlanBillLocale.driver}>
                {getFieldDecorator('drivers', {
                    rules: [
                        { required: true, message: notNullLocale(shipPlanBillLocale.driver) },
                    ],
                    initialValue: drivers.length > 0 ? drivers : [],
                })(
                    <Select
                        placeholder={placeholderChooseLocale(shipPlanBillLocale.driver)}
                        mode='multiple'
                        onChange={this.onDriverChange}
                    >
                        {this.getVehicleEmployeeOptions('DRIVER')}
                    </Select>
                )}
            </CFormItem>,
            <CFormItem key='stevedore' label={shipPlanBillLocale.stevedore}>
                {getFieldDecorator('stevedores', {
                    initialValue: stevedores.length > 0 ? stevedores : undefined,
                })(
                    <Select
                        placeholder={placeholderChooseLocale(shipPlanBillLocale.stevedore)}
                        mode='multiple'
                        onChange={this.onStevedoreChange}
                    >
                        {this.getVehicleEmployeeOptions('STEVEDORE')}
                    </Select>
                )}
            </CFormItem>
        ];

        return [
            <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={cols} />
        ];
    }

    onFieldChange = (value, field, index) => {
        const { entity } = this.state;

        if (field === 'shipPlanType') {
            entity.items[index - 1].shipPlanType = value;
        } else if (field === 'fromOrg') {
            const fromOrg = JSON.parse(value);
            entity.items[index - 1].fromOrg = { uuid: fromOrg.uuid, code: fromOrg.code, name: fromOrg.name };
            entity.items[index - 1].fromOrgType = fromOrg.type;

            entity.items[index - 1].toOrg = null;
            entity.items[index - 1].toOrgType = null;
            entity.items[index - 1].serialArchLine = null;
            entity.items[index - 1].dockGroupStr = null;
            entity.items[index - 1].amount = 0;
            entity.items[index - 1].weight = 0;
            entity.items[index - 1].volume = 0;
            entity.items[index - 1].qtyStr = 0;
        } else if (field === 'toOrg') {
            const toOrg = JSON.parse(value);
            entity.items[index - 1].toOrg = toOrg;
            entity.items[index - 1].toOrgType = toOrg.type;
            this.refreshSerialArchLineAndDockGroup(entity.items[index - 1]);
        }

        this.setState({
            entity: { ...entity }
        });
    }

    getShipPlanTypeOptions = () => {
        const options = [];
        options.push(
            Object.keys(ShipPlanType).forEach(function (key) {
                options.push(<Option key={ShipPlanType[key].name} value={ShipPlanType[key].name}>{ShipPlanType[key].caption}</Option>);
            }));
        return options;
    }

    getFromOrgType = (shipPlanType) => {
        if (ShipPlanType.DELIVERY.name == shipPlanType || ShipPlanType.TRANSPORT.name == shipPlanType)
            return 'DC';
        else
            return 'STORE';
    }

    getToOrgType = (shipPlanType) => {
        if (ShipPlanType.DELIVERY.name == shipPlanType || ShipPlanType.TRANSFER.name == shipPlanType)
            return 'STORE';
        else
            return 'DC';
    }

    getToOrgs = (record) => {
        const { deliveryDispatchItems } = this.state;

        let toOrgs = [];
        if (!deliveryDispatchItems || !record.shipPlanType || !record.fromOrg)
            return toOrgs;

        deliveryDispatchItems.forEach(e => {
            if (e.type == record.shipPlanType && e.fromOrg.uuid == record.fromOrg.uuid) {
                let toOrg = {
                    uuid: e.toOrg.uuid,
                    code: e.toOrg.code,
                    name: e.toOrg.name,
                    type: e.toOrgType
                }
                toOrgs.push(toOrg);
            }
        });
        return toOrgs;
    }

    getToOrgOptions = (record) => {
        let toOrgOptions = [];
        let toOrgs = this.getToOrgs(record);
        if (!toOrgs || toOrgs.length <= 0)
            return toOrgOptions;

        toOrgs.forEach(e => {
            toOrgOptions.push(
                <Select.Option key={e.uuid} value={JSON.stringify(e)}>
                    {convertCodeName(e)}
                </Select.Option>
            );
        });
        return toOrgOptions;
    }

    refreshSerialArchLineAndDockGroup = (record) => {
        const { deliveryDispatchItems } = this.state;

        if (!deliveryDispatchItems)
            return;

        if (!record || !record.fromOrg || !record.toOrg)
            return;

        deliveryDispatchItems.forEach(e => {
            if (e.type == record.shipPlanType && e.fromOrg.uuid == record.fromOrg.uuid
                && e.toOrg.uuid == record.toOrg.uuid) {
                record.dockGroupStr = e.dockerGroupStr;
                record.amount = e.staticProfile.amount;
                record.weight = e.staticProfile.weight;
                record.volume = e.staticProfile.volume;
                record.qtyStr = e.staticProfile.qtyStr;

                var serialArchLineList = e.serialArchLineStr.split(",");
                serialArchLineList.forEach(function (item, index) {
                    var serialArchLine = item.split(";");
                    var serialArchLineUcn = {
                        "uuid": serialArchLine[0],
                        "code": serialArchLine[1],
                        "name": serialArchLine[2]
                    }
                    record.serialArchLine = serialArchLineUcn;
                })
            }
        });
    }

    /**
    * 绘制总数量
    */
    drawTotalInfo = () => {
        var allVolume = 0;
        var allWeight = 0;
        var allAmount = 0;
        if (this.state.entity.items) {
            this.state.entity.items.map(item => {
                if (!item.qty) {
                    item.qty = 0;
                }
                if (!item.amount) {
                    item.amount = 0;
                }
                if (!item.weight) {
                    item.weight = 0;
                }
                if (!item.volume) {
                    item.volume = 0;
                }

                allAmount = accAdd(allAmount, item.amount);
                allWeight = accAdd(allWeight, item.weight);
                allVolume = accAdd(allVolume, item.volume);

            });
        }

        return (
            <span style={{ marginLeft: '10px' }}>
                {commonLocale.inAllAmountLocale + ':' + allAmount.toFixed(4)} |
            {commonLocale.inTmsAllWeightLocale + ':' + Number(allWeight / 1000).toFixed(4)} |
            {commonLocale.inAllVolumeLocale + ':' + allVolume.toFixed(4)}
            </span>
        );
    }

    /**
    * 绘制按钮
    */
    drawBatchButton = () => {
        return (
            <span>
                <a onClick={() => this.handlebatchAddVisible()}>批量添加</a>
            </span>
        )
    }

    tableChange = (pagination, filtersArg, sorter) => {
        const { pageFilter } = this.state;
        pageFilter.searchKeyValues.page = pagination.current - 1;
        pageFilter.searchKeyValues.pageSize = pagination.pageSize;
        this.setState({
            pageFilter: pageFilter
        })
        this.refreshTable();
    }

    /**搜索*/
    onSearch = (data) => {
        const { entity } = this.state;

        let serialArchUuid = entity.serialArch ? entity.serialArch.uuid : undefined;
        if (!serialArchUuid) {
            return;
        }

        let fromOrgCode = undefined;
        let toOrgCode = undefined;
        let serialArchLineUuid = undefined;

        if (data) {
            fromOrgCode = data.fromOrgCode;
            toOrgCode = data.toOrgCode;
            if (data.serialArchLine)
                serialArchLineUuid = JSON.parse(data.serialArchLine).uuid;
        }

        const { pageFilter } = this.state;
        pageFilter.searchKeyValues = {
            ...pageFilter.searchKeyValues,
            page: 0,
            serialArchUuid: serialArchUuid,
            fromOrgCode: fromOrgCode,
            toOrgCode: toOrgCode,
            serialArchLineUuid: serialArchLineUuid
        }
        this.setState({
            pageFilter: pageFilter
        })
        this.refreshTable();
    }

    refreshTable = () => {
        this.props.dispatch({
            type: 'shipplanbill/queryShipPlanDeliveryDispatch',
            payload: { ...this.state.pageFilter.searchKeyValues }
        });
    };

    /** 批量添加弹出框*/
    handlebatchAddVisible = () => {
        this.setState({
            batchAddVisible: !this.state.batchAddVisible
        })
    }

    /**获取批量增加的集合*/
    getItemList = (value) => {
        const { entity } = this.state;
        var newList = [];
        for (let i = 0; i < value.length; i++) {
            if (entity.items && entity.items.find(function (item) {
                return item.fromOrg && item.fromOrg.uuid === value[i].fromOrg.uuid && item.toOrg && item.toOrg.uuid === value[i].toOrg.uuid
                    && item.serialArchLine && item.serialArchLine.uuid === value[i].serialArchLine.uuid
            }) === undefined) {
                let temp = { ...value[i] };
                temp.shipPlanType = temp.type;
                temp.dockGroupStr = temp.dockerGroupStr;
                if (temp.staticProfile) {
                    temp.amount = temp.staticProfile.amount;
                    temp.weight = temp.staticProfile.weight;
                    temp.volume = temp.staticProfile.volume;
                    temp.qtyStr = temp.staticProfile.qtyStr;
                }
                newList.push(temp);
            }
        }
        this.state.line = entity.items.length + 1;
        newList.map(item => {
            item.line = this.state.line;
            this.state.line++;
        });
        entity.items = [...entity.items, ...newList];
        this.setState({
            entity: { ...entity }
        })
    }

    drawTable = () => {
        const { entity } = this.state;

        let columns = [
            {
                title: shipPlanBillLocale.shipPlanType,
                key: 'shipPlanType',
                dataIndex: 'shipPlanType',
                width: itemColWidth.binCodeEditColWidth,
                render: (text, record) => {
                    return (
                        <Select
                            value={record.shipPlanType}
                            placeholder={placeholderLocale(shipPlanBillLocale.shipPlanType)}
                            onChange={e => this.onFieldChange(e, 'shipPlanType', record.line)}>
                            {
                                this.getShipPlanTypeOptions()
                            }
                        </Select>
                    );
                }
            },
            {
                title: shipPlanBillLocale.fromOrg,
                key: 'fromOrg',
                dataIndex: 'fromOrg',
                width: itemColWidth.articleEditColWidth,
                render: (text, record) => {
                    let value = undefined;
                    if (record.fromOrg) {
                        let orgInfo = {};
                        orgInfo.uuid = record.fromOrg.uuid;
                        orgInfo.code = record.fromOrg.code;
                        orgInfo.name = record.fromOrg.name;
                        orgInfo.type = this.getFromOrgType(record.shipPlanType);
                        value = JSON.stringify(orgInfo);
                    }
                    return (
                        <FromOrgSelect
                            value={value}
                            single
                            serialArchUuid={entity.serialArch ? entity.serialArch.uuid : null}
                            type={this.getFromOrgType(record.shipPlanType)}
                            onChange={e => this.onFieldChange(e, 'fromOrg', record.line)}
                        />
                    );
                }
            },
            {
                title: shipPlanBillLocale.toOrg,
                key: 'toOrg',
                dataIndex: 'toOrg',
                width: itemColWidth.articleEditColWidth,
                render: (text, record) => {
                    let value = undefined;
                    if (record.toOrg) {
                        let orgInfo = {};
                        orgInfo.uuid = record.toOrg.uuid;
                        orgInfo.code = record.toOrg.code;
                        orgInfo.name = record.toOrg.name;
                        orgInfo.type = this.getToOrgType(record.shipPlanType);
                        value = JSON.stringify(orgInfo);
                    }
                    return (
                        <ToOrgSelect
                            value={value}
                            single
                            serialArchUuid={entity.serialArch ? entity.serialArch.uuid : null}
                            fromOrgUuid={record.fromOrg ? record.fromOrg.uuid : null}
                            type={this.getToOrgType(record.shipPlanType)}
                            onChange={e => this.onFieldChange(e, 'toOrg', record.line)}
                        />
                    );
                }
            },
            {
                title: shipPlanBillLocale.serialArchLine,
                key: 'serialArchLine',
                width: colWidth.codeNameColWidth,
                render: record => {
                    return (
                        <span>{record.serialArchLine ? convertCodeName(record.serialArchLine) : <Empty />}</span>
                    );
                }
            },
            {
                title: shipPlanBillLocale.dockGroupStr,
                dataIndex: 'dockGroupStr',
                width: colWidth.codeNameColWidth,
                render: text => text ? <EllipsisCol colValue={text} /> : <Empty />
            },
        ]

        let batchQueryResultColumns = [
            {
                title: shipPlanBillLocale.shipPlanType,
                key: 'type',
                dataIndex: 'type',
                width: itemColWidth.codeNameColWidth,
                render: (text, record) => {
                    return (
                        <span>{record.type ? ShipPlanType[record.type].caption : <Empty />}</span>
                    );
                }
            },
            {
                title: shipPlanBillLocale.fromOrg,
                key: 'fromOrg',
                dataIndex: 'fromOrg',
                width: itemColWidth.codeNameColWidth,
                render: (text, record) => record.fromOrg ? <EllipsisCol colValue={convertCodeName(record.fromOrg)} /> : <Empty />
            },
            {
                title: shipPlanBillLocale.toOrg,
                key: 'toOrg',
                dataIndex: 'toOrg',
                width: itemColWidth.codeNameColWidth,
                render: (text, record) => record.toOrg ? <EllipsisCol colValue={convertCodeName(record.toOrg)} /> : <Empty />
            },
            {
                title: shipPlanBillLocale.serialArchLine,
                key: 'serialArchLine',
                width: colWidth.codeNameColWidth,
                render: (text, record) => record.serialArchLine ? <EllipsisCol colValue={convertCodeName(record.serialArchLine)} /> : <Empty />
            },
            {
                title: shipPlanBillLocale.dockGroupStr,
                key: 'dockerGroupStr',
                width: colWidth.codeNameColWidth,
                render: (text, record) => {
                    return (
                        <span>{record.dockerGroupStr ? record.dockerGroupStr : <Empty />}</span>
                    );
                }
            },
        ]


        return (
            <div>
                <ItemEditTable
                    title={shipPlanBillLocale.billItems}
                    columns={columns}
                    data={this.state.entity.items}
                    drawBatchButton={this.drawBatchButton}
                    drawTotalInfo={this.drawTotalInfo}
                />
                <PanelItemBatchAdd
                    searchPanel={<ShipPlanSearchFormItemBatchAdd refresh={this.onSearch} fieldsValue={''} />}
                    visible={this.state.batchAddVisible}
                    columns={batchQueryResultColumns}
                    data={this.state.deliveryDispatchList}
                    handlebatchAddVisible={this.handlebatchAddVisible}
                    getSeletedItems={this.getItemList}
                    width={'90%'}
                    onChange={this.tableChange}
                />
            </div>
        )
    }
}