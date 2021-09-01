export function qtyStrToQty(qtyStr, qpcStr) {
    let qpcs = (qpcStr + "").split('*');
    let qpc = 1;
    qpcs.forEach(e => {
        qpc = qpc * e;
    });
    let qtys = (qtyStr + "").split('+');

    let qty = 0;
    if (qtys.length > 1) {
        qty = parseFloat(qtys[0] * qpc) + parseFloat(qtys[1]);
    } else {
        qty = parseFloat(qtys[0] * qpc);
    }
    return parseFloat(qty.toFixed(4));
}

export function add(qtyStr, addedQtyStr) {
    let qtyStrs = (qtyStr + "").split('+');
    let addQtyStrs = (addedQtyStr + "").split('+');
    let case1 = parseInt(qtyStrs[0]) + parseInt(addQtyStrs[0]);
    let split = qtyStrs.length > 1 ? parseFloat(qtyStrs[1]) : 0;
    let addedSplit = addQtyStrs.length > 1 ? parseFloat(addQtyStrs[1]) : 0;
    let splitResult = accAdd(split,addedSplit);
    if (splitResult === 0)
        return case1;
    return case1 + "+" + splitResult;
}

export function toQtyStr(qty, qpcStr) {
    if (qty === 0) {
        return "0";
    }
    if (qty === undefined||qpcStr ===undefined) {
        return "0";
    }
    let qpcs = (qpcStr + "").split('*');
    let qpc = 1;
    qpcs.forEach(e => {
        qpc = accMul(qpc,e);
    });

    let wholeCase = accDiv(qty,qpc);
    if(!/^-?\d+$/.test(accDiv(qty,qpc))){
        wholeCase = parseInt(wholeCase)
    }

    // 判断是否整除
    if(isPositiveIntegerTimes(qty,qpc)){
        return wholeCase;
    }else{
        let split = parseFloat(qty % qpc);
        if (split === 0){
            return wholeCase;
        }else{
            split = (/^-?\d+$/.test(split)) ? split : split.toFixed(4);
            return wholeCase + "+" + split;
        }
    }
}

export function compare(qtyStr, qtyStr2) {
    let qtyStrs = (qtyStr + "").split('+');
    let qtyStr2s = (qtyStr2 + "").split('+');

    let case1 = parseInt(qtyStrs[0]);
    let case2 = parseInt(qtyStr2s[0]);

    if (case1 < case2) {
        return -1;
    }

    if (case1 > case2) {
        return 1;
    }

    let split = 0;
    let split2 = 0;
    if (qtyStrs.length > 1) {
        split = parseFloat(qtyStrs[1]);
    }
    if (qtyStr2s.length > 1) {
        split2 = parseFloat(qtyStr2s[1]);
    }
    if (split < split2) {
        return -1;
    }
    if (split > split2) {
        return 1;
    }
    return 0;
}

export function division(qtyStr, row) {
    let qtyStrs = (qtyStr + "").split('+');
    let case1 = Math.round(parseInt(qtyStrs[0]) / row);

    let split = 0;
    if (qtyStrs.length > 1) {
        split = parseFloat(qtyStrs[1]);
    }
    split = Math.round(split / row);
    if (split === 0) {
        return case1 + "";
    }
    return case1 + "+" + split;
}

export function subtract(qtyStr, subQtyStr) {
    let qtyStrs = (qtyStr + "").split('+');
    let subQtyStrs = (subQtyStr + "").split('+');
    let case1 = parseInt(qtyStrs[0]) - parseInt(subQtyStrs[0]);
    if (qtyStrs.length <= 1) {
        return case1;
    }
    let split = parseFloat(qtyStrs[1]);
    let subSplit = subQtyStrs.length > 1 ? parseFloat(subQtyStrs[1]) : 0;
    return case1 + "+" + (split - subSplit);
}

export function fomatFloat(src, pos) {
    return Math.round(src * Math.pow(10, pos)) / Math.pow(10, pos);
}

/**
 * 判断是否整除
 * @param {数量} qty 
 * @param {规格} qpc 
 */
export function isPositiveIntegerTimes (qty,qpc){
    var t1=0,t2=0,r1,r2;
    try{t1=qty.toString().split(".")[1].length}catch(e){}
    try{t2=qpc.toString().split(".")[1].length}catch(e){}
    r1=Number(qty.toString().replace(".",""));
    r2=Number(qpc.toString().replace(".",""));
    var times= (r1/r2)*Math.pow(10,t2-t1);

    if (!(/(^[1-9]\d*$)/.test(times.toString()))) {
        return false;
    }
    else {
        return true;
    }
}

/**
 * 两数相除(避免丢失精度)--结果值进行四舍五入
 * @param {*} arg1 
 * @param {*} arg2 
 */
export function accDiv(arg1,arg2){
    var t1=0,t2=0,r1,r2; 
    try{t1=arg1.toString().split(".")[1].length}catch(e){} 
    try{t2=arg2.toString().split(".")[1].length}catch(e){} 
    r1=Number(arg1.toString().replace(".","")) 
    r2=Number(arg2.toString().replace(".","")) 
    var res = accMul((r1/r2),Math.pow(10,t2-t1));
    return Math.round(res*1000000)/1000000;
} 
/**
 * 两数相乘(避免丢失精度)
 * @param {} arg1 
 * @param {*} arg2 
 */
export function accMul(arg1,arg2) { 
    var m=0,s1=arg1.toString(),s2=arg2.toString(); 
    try{m+=s1.split(".")[1].length}catch(e){} 
    try{m+=s2.split(".")[1].length}catch(e){} 
    return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m) 
}

/**
 * 两数相加(避免丢失精度)
 * @param {*} arg1 
 * @param {*} arg2 
 */ 
export function accAdd(arg1,arg2){ 
    var r1,r2,m; 
    try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0} 
    try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0} 
    m=Math.pow(10,Math.max(r1,r2)) 
    return (arg1*m+arg2*m)/m 
} 

/**
 * 两数相减(避免丢失精度) 
 * @param {*} arg1 
 * @param {*} arg2 
 */
export function Subtr(arg1,arg2){
    var r1,r2,m,n;
    try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0}
    try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0}
    m=Math.pow(10,Math.max(r1,r2));
    n=(r1>=r2)?r1:r2;
    return ((arg1*m-arg2*m)/m).toFixed(n);
}
