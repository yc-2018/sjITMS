/**
 * 获取定义字段的显示，允许通过 %字段名% 的方式插入值
 * @param {Map} rowData 原始数据
 * @param {String} str 用户定义的字段文本
 */
export function getFieldShow(rowData, str) {
    if (!rowData || !str) {
        return;
    }
    var reg = /%\w+%/g;
    var matchFields = str.match(reg);
    if (matchFields) {
        for (const replaceText of matchFields) {
            var field = replaceText.replaceAll('%', '');
            str = str.replaceAll(replaceText, rowData[field]);
        }
        return str;
    } else {
        return rowData[str];
    }
}


/**
 * 增加condition
 */
export function addCondition(queryParams, condition) {
    if (!queryParams.condition) {
        // 如果数据源本身查询不带条件，则condition直接作为查询的条件
        queryParams.condition = condition;
    } else if (!queryParams.condition.matchType || queryParams.condition.matchType == "and") {
        // 如果是and连接,则进行条件追加
        queryParams.condition.params.push({ nestCondition: condition });
    } else {
        // 否则将原本的查询条件与condition作为两个子查询进行and拼接
        queryParams.condition = {
            params: [{ nestCondition: queryParams.condition }, { nestCondition: condition }],
        };
    }
}