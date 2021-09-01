import { havePermission } from '@/utils/authority';
import { formatMessage } from 'umi/locale';
export const SerialArchLocale = {
    serialArchTitle: '线路体系',
    saveSuccess: '线路体系新建成功',
    containStore: '包含门店',
    addStore: '添加门店',
    orderNo: '序号',
    store: '门店',
    serialArchLine: '线路',
    saveLineSuccess: '线路新建成功',
    pleaseSelectArchLineFirst: '请先选择线路',
    pleaseSelectToRemoveStore: '请选择要删除的门店',
    pleaseSelectOrCreateSerialArch: '请先选择或新建线路体系',
    search: formatMessage({ id: 'company.index.search.button.search' }),
    reset: formatMessage({ id: 'company.index.search.button.reset' }),
    storeCode: '门店代码',
    sureToRemoveSelectedStore: "确定要删除所选门店？",
    selectedToRemoveLine: '请先选择要删除的线路',
    sureToRemoveThisLine: '确定要删除当前线路？',
    createSerialArch: '新建体系',
    addSerialArchLine: "添加线路",
    addWrh: "添加供应商",
    state: "状态",
    approver: "批准",

    adjOrderNo: '调整序号',

}

export const SerialArchPerm = {
    CREATE: havePermission('iwms.tms.serialArch.create'),
    CREATE_LINE: havePermission('iwms.tms.serialArch.line.create'),
    VIEW: havePermission('iwms.tms.serialArch.view'),
    EDIT_LINE: havePermission('iwms.tms.serialArch.line.edit'),
    VIEW_LINE: havePermission('iwms.tms.serialArch.line.view'),
    DELETE_LINE: havePermission('iwms.tms.serialArch.line.delete'),
    ADD_STORE: havePermission('iwms.tms.serialArch.line.addStore'),
    DELETE_STORE: havePermission('iwms.tms.serialArch.line.deleteStore'),
};
