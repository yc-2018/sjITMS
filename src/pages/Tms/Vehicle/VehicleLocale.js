import { havePermission } from '@/utils/authority';
export const VehicleLocale = {
    title: '车辆',
    remove: '启用',
    finish: '禁用',
    plateNo: '车牌号',
    vehicleType: '车型',
    carrier: '承运商',
    mileage: '里程',
    oilConsumption: '油耗',
    tailPlate: '尾板',
    codeOrPlate: '代码/车牌',
    pleaseSelectToReceiveData: '请选择要删除的数据',
    emp: '人员',
    workType: '人员类型',
    empInfo: '人员信息',
    freeSuccessLocale: '释放成功',
    freeLocale: '释放',
    batchFreeLocale: '批量释放',
    state: '车辆状态',
    extendInfo: '扩展信息',
    brand:"品牌",
    etc:"etc",
    mailNumber: "信箱号",
    dispatchCenters: "调度中心",
    dispatchState: "调度状态",
}

export const VehicleState = {
    OFFLINE: {
        name: 'OFFLINE',
        caption: '禁用'
    },
    FREE:{
        name: 'FREE',
        caption: '空闲'
    },
    USED:{
        name: 'USED',
        caption: '已排车'
    },
    SHIPING:{
        name: 'SHIPING',
        caption: '装车中'
    },
    SHIPPED:{
        name: 'SHIPPED',
        caption: '已出车'
    },
    DELIVERYING:{
        name: 'DELIVERYING',
        caption: '配送中'
    },
    RETURNING:{
        name: 'RETURNING',
        caption: '回车中'
    }
}

export const VehiclePerm = {
    CREATE: havePermission('iwms.tms.vehicle.create'),//RES_CREATE,
    EDIT: havePermission('iwms.tms.vehicle.edit'),//RES_EDIT,
    VIEW: havePermission('iwms.tms.vehicle.view'),//RES_VIEW,
    ONLINE: havePermission('iwms.tms.vehicle.online'),//RES_DELETE,
    REMOVE: havePermission('iwms.tms.vehicle.delete'),//RES_ENABLE,
    OFFLINE: havePermission('iwms.tms.vehicle.offline'),//RES_DISENABLE
    ADDEMP: havePermission('iwms.tms.vehicle.emp.create'),
    DELETEEMP: havePermission('iwms.tms.vehicle.emp.delete'),
};

export const VehicleEmployee = {
    'DRIVER': '驾驶员',
    'STEVEDORE': '装卸员',
    'DEPUTYDRIVER': '副班司机',
    'DELIVERYMAN': '送货员',
}
