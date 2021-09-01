import { havePermission } from '@/utils/authority';
import { formatMessage } from 'umi/locale';

export const BillSort = {
    siderTitle:'大类',
    createBigsort:'新建大类',
    addDetail:'添加小类',
    addObject:'添加小类对象',
    bigSortTitle:'大类',
    smallSortTitle:'小类',
    smallSortObject:'小类对象',
    removeSmallTip:'确定要删除所选小类',
    pleaseSelectSmallSort:'请先选择或新建小类',
    addSmallSortObject:'新建小类对象'
}

export const ObjectType = [
   {
        name:'Goods',
        caption:'商品'
    },
    {
        name:'Store',
        caption:'门店'
    },
    {
        name:'Model',
        caption:'车型'
    },

]
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