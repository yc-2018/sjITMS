export interface IListEnhance {
    gird: {
        getSelected: () => object | null
        getSelecteds: () => Array<object>
        reload: () => void
    }
}

export interface IQueryParam {
    field: string,
    type?: string,
    rule: string,
    val: string
}

export interface ISuperQuery {
    matchType: "and" | "or",
    queryParams: IQueryParam[]
}

export interface IOnlReportParam {
    pageNo: number,
    pageSize: number,
    order?: {},
    query?: {},
    superQuery?: ISuperQuery
}

export interface IOnlReportItem {
    id: string,
    fieldName: string;
    fieldType: string;
    fieldWidth: number;
    isSearch: boolean;
    isShow: boolean;
    orderType: number;
    fieldTxt: string;
    isQuery: boolean;
    isTotal: boolean,
    orderNum: number,
    searchShowtype: string,
    searchDictTable: string,
    searchDictField: string,
    searchDictText: string,
    searchDefVal: string,
    searchValidType: boolean
}