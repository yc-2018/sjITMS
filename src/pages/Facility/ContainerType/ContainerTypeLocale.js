export const containerTypeLocale = {
    title: '容器类型',
    remove:'删除',

    barCodePrefix:'条码前缀',
    barcodeType:'条码类型',
    barCodeLength:'条码长度',
    recycleType:'回收类型',
    shipFlage:'随车',
    collect:'是否必须集货复查',

    qpcInfoLocale: '规格信息',
    inLength:'内长(cm)',
    inWidth:'内宽(cm)',
    inHeight:'内高(cm)',
    outLength:'外长(cm)',
    outWidth:'外宽(cm)',
    outHeight:'外高(cm)',
    weight:'自重(kg)',
    bearingWeight:'承重(kg)',
    plotRatio:'容积率(%)',
    note:'备注',
  
    inSide: '内长/宽/高(cm)',
    outSide: '外长/宽/高(cm)',

    barCodePrefixRuleMessage:'条码前缀必须是大写字母组成，长度最大为2位',
    barCodeLengthRule:' (7<=条码长度<=10)',

}

export const BarcodeType={
    'ONCE':'一次性',
    'FOREVER':'永久'
}

export const RecycleType={
    'ByQty':'按数量',
    'ByBarcode':'按条码'
}