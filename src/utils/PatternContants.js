/** 货位展示格式正则表达式 */
export const binViewPattern = {
    pattern: /^(AA|A-A|AA-|A-A-)(BB|B-B|BB-|B-B-)(CC|C-C|CC-|C-C-)(DD|D-D|DD|D-D)$/,
    message: '必须满足AABBCCDD，以-隔开的格式'
}

/** 4位代码正则表达式 */
export const codePattern_4 = {
    pattern: /^[0-9a-zA-Z]{4}$/,
    message: '代码必须是4位数字、字母或者二者组合'
}

/** 30位代码正则表达式 */
export const codePattern = {
    pattern: /^[0-9a-zA-Z]{1,30}$/,
    message: '代码必须是数字、字母、二者组合，长度最大为30位'
}

/** 货位范围正则表达式 */
export const binScopePattern = {
    pattern: /^(\s*[0-9A-Z]{1,8}(-[0-9A-Z]{1,8})?([(]{1}([0-9A-Z]{1}\/)*[^\/][)]{1})?\s*){1}(,\s*[0-9A-Z]{1,8}(-[0-9A-Z]{1,8})?([(]{1}([0-9A-Z]{1}\/)*[^\/][)]{1})?\s*)*$/,
    message: '满足格式10、10(1/2)、10-20，多个以逗号隔开'
}

/** 4位数字代码正则表达式 */
export const codePatternDigit_4 = {
    pattern: /^[0-9]{4}$/,
    message: '代码必须是4位数字'
}

/** 单据最大明细正整数正则表达式 */
export const billPattern = {
  pattern: /^[0-9]*[1-9][0-9]*$/,
  message: '最大明细数必须是正整数'
}
/** 30位代码正则表达式2 */
export const dpsCodePattern = {
  pattern: /^(?![^A-z]+$)(?!\D+$)[A-z\d]{1,30}$/,
  message: '代码必须是数字、字母、二者组合，长度最大为30位'
}

/**货品允收期正则表达式 */
export const allowReceiveDayPattern = {
    // patternNum:/^[2-9]\d*$/,// 大于0的正整数
    // patternNum:/^(([1-9]\d+)|([2-9]))$/,// 大于0的正整数
    patternNum:/^(([0-9]{2,7})|([2-9]){1,7})$/,// 大于0的正整数
    messageNum:'货品允收期应输入大于1且小于7位的正整数',

    // pattern2:/^(100|[1-9]\d|\d)(\.\d{1,4})?%$/, // 带百分号 大于0 小于100
    // pattern3:/^[0-9]*?\/[0-9]*$/, // 带除号 结果值不能大于1
    pattern:/^((100|[1-9]\d|\d)(\.\d{1,4})?%$)|([0-9]*?\/\d{1}[0-9]*$)/,
    message:'货品允收期满足格式1/2 或1% 且不能大于1'
}