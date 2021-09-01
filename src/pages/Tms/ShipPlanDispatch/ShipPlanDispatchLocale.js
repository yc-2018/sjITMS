import { havePermission } from '@/utils/authority';
export const ShipPlanType = {
    DELIVERY: {
        name: 'DELIVERY',
        caption: '配送'
    },
    TRANSPORT: {
        name: 'TRANSPORT',
        caption: '转运'
    },
    TRANSFER: {
        name: 'TRANSFER',
        caption: '调拨'
    },
    RTN: {
        name: 'RTN',
        caption: '退仓'
    }
}

export const ShipPlanDispatchLocale = {
    amount: '金额(元)',
    weight: '重量(吨)',
    volume: '体积(m³)',
    taskAmount: '任务量',
    taskInfoPanel: '仓库看板',
    dispatchInfoPanel: '调度看板',
    shipPlanTaskPanel: '排车任务看板',
    serialArch: '线路体系',
    sourceOrg: '来源组织',
    targetOrg: '目标组织',
    taskType: '任务类型',
    state: '状态',
    generateShipPlanBill: '生成排车单',
    generateShipBill: '生成装车单',
    serialArchLine: '门店线路',
    dockGroup: '码头集',
    businessInfo: '业务信息',
    pickRate: '拣货进度',
    dc: '配送中心',
    store: '门店',
    stockItems: "库存明细",
    containerItems: "容器明细",
    attachmentItems: "附件明细",
    containerType: "容器类型",
    attachment: "附件",
    attachmentType: "附件类型"
}

export const ShipPlanDispatchPerm = {
    CREATE_SHIP_PLAN_BILL: havePermission('iwms.tms.shipPlanDispatch.createShipPlanBill'),
    CREATE_SHIP_BILL: havePermission('iwms.tms.shipPlanDispatch.createShipBill')
};

export const ShipPlanPickState = {
    PICKED: {
        name: 'PICKED',
        caption: '拣货完成'
    },
    PICKUP: {
        name: 'PICKUP',
        caption: '拣货中'
    },
}
export const LogisticMode = {
    UNIFY: {
        name: 'UNIFY',
        caption: '统配'
    },
    ONESTEPCROSS: {
        name: 'ONESTEPCROSS',
        caption: '一步越库'
    },
    TWOSTEPCROSS: {
        name: 'TWOSTEPCROSS',
        caption: '二步越库'
    },
}