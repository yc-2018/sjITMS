import { havePermission } from '@/utils/authority';
export const VehicleTypeLocale = {
    title: '车型',
    remove: '删除',
    usage: '用途',
    lengthAndwidth: '长/宽/高(m)',
    bearWeight: '承重(kg)',
    bearVolumeRate: '容积率(%)',
    length: '长(m)',
    width: '宽(m)',
    height: '高(m)',
    extendInfo: '扩展信息',
    confirmToDelete: '确定要删除当前数据',
    carType: '车辆分类',
}

export const VehicleUsage = {
    'REFRIGERATION': '冷冻',
    'HOMOIOTHERMY': '常温',
    'CONSTANTTEMPERATURE':'恒温',
}

export const CarType = {
    'BIG': '大车',
    'MEDIUM': '中车',
    'SMALL': '小车',
}

export const VehicleEmployee = {
    'DRIVER': '驾驶员',
    'STEVEDORE': '装卸员'
}

export const VehicleTypePrem = {
    CREATE: havePermission('iwms.tms.vehicleType.create'),
    EDIT: havePermission('iwms.tms.vehicleType.edit'),
    VIEW: havePermission('iwms.tms.vehicleType.view'),
    REMOVE: havePermission('iwms.tms.vehicleType.delete'),
};
