import { connect } from 'dva';
import moment from 'moment';
import { isArray, format } from 'util';
import { Form, Select, Input, InputNumber, message, DatePicker, Modal } from 'antd';
import CreatePage from './CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import StoreSelect from '@/pages/Component/Select/StoreSelect';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import ArticleSelect from './ArticleSelect';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { STATE } from '@/utils/constants';
import { sourceWay } from '@/utils/SourceWay';
import { orgType } from '@/utils/OrgType';
import { loginCompany, loginOrg, getDefOwner } from '@/utils/LoginContext';
import { convertCodeName, formatDate } from '@/utils/utils';
import { qtyStrToQty, add, accAdd, accMul } from '@/utils/QpcStrUtil';
import { PRETYPE } from '@/utils/constants';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { storeRtnNtcLocal } from './StoreRtnNtcBillLocale';
import { MAX_DECIMAL_VALUE } from '@/utils/constants';
import PanelItemBatchAdd from '@/pages/Component/Form/PanelItemBatchAdd';
import SearchFormItemBatchAdd from './SearchFormItemBatchAdd';
const { TextArea } = Input;
@connect(({ storeRtnNtc, article, loading }) => ({
    storeRtnNtc,
    article,
    loading: loading.models.storeRtnNtc,
}))
@Form.create()
export default class StoreRtnNtcBillCreatePage extends CreatePage {
    constructor(props) {
        super(props);

        this.state = {
            title: commonLocale.createLocale + storeRtnNtcLocal.title,
            entity: {
                owner: getDefOwner(),
                items: []
            },
            items: [],
            articles: [],
            auditButton: true,

            batchAddVisible: false,
            pageFilter: {
                page: 0,
                pageSize: 10,
                searchKeyValues: {
                    companyUuid: loginCompany().uuid
                }
            },
        }
    }
    componentDidMount() {
        this.refresh();
    }

    componentWillReceiveProps(nextProps) {
        const { articles } = this.state;

        if (nextProps.storeRtnNtc.entity && this.props.storeRtnNtc.entityUuid) {
            this.setState({
                entity: nextProps.storeRtnNtc.entity,
                items: nextProps.storeRtnNtc.entity.items,
                title: storeRtnNtcLocal.title + '：' + nextProps.storeRtnNtc.entity.billNumber,
            });

            if (nextProps.storeRtnNtc.entity && nextProps.storeRtnNtc.entity.items
                && this.props.storeRtnNtc.entityUuid && !this.state.entity.uuid) {
                const that = this;
                nextProps.storeRtnNtc.entity.items.forEach(function (e) {
                    that.queryArticle(e.article.articleUuid);
                });
            }
        }

        if (nextProps.article.entity && nextProps.article.entity.uuid
            && !articles[nextProps.article.entity.uuid]) {
            articles[nextProps.article.entity.uuid] = nextProps.article.entity;
            this.setState({
                articles: articles
            });
        }
    }

    queryArticle = (articleUuid) => {
        this.props.dispatch({
            type: 'article/get',
            payload: {
                uuid: articleUuid
            }
        });
    }

    queryArticles = () => {
        this.props.dispatch({
            type: 'article/query',
            payload: {
                ...this.state.pageFilter
            }
        });
    }


    /**
     * 刷新
     */
    refresh = () => {
        if (this.props.storeRtnNtc.entityUuid)
            this.props.dispatch({
                type: 'storeRtnNtc/get',
                payload: this.props.storeRtnNtc.entityUuid
            });
    }
    /**
    * 取消
    */
    onCancel = () => {
        if (!this.props.storeRtnNtc.entityUuid) {
            this.props.dispatch({
                type: 'storeRtnNtc/showPage',
                payload: {
                    showPage: 'query'
                }
            });
        } else {
            this.props.dispatch({
                type: 'storeRtnNtc/showPage',
                payload: {
                    showPage: 'view',
                    entityUuid: this.props.storeRtnNtc.entityUuid
                }
            });
        }
    }

    getQpcStrs = (record) => {
        if (!record.article) {
            return [];
        }

        const { articles } = this.state;
        const article = articles[record.article.articleUuid];

        if (!article) {
            return [];
        }

        const qpcStrs = [];
        if (!article.qpcs) {
            return qpcStrs;
        }

        article.qpcs.forEach(function (e) {
            let volume = e.width * e.height * e.length;
            qpcStrs.push({
                qpcStr: e.qpcStr,
                munit: e.munit ? e.munit : '-',
                spec: article.spec,
                qpc: e.paq,
                volume: volume,
                weight: e.weight,
                defaultQpcStr: e.defaultQpcStr
            });
        });
        return qpcStrs;
    }

    getQpcStrOptions = (record) => {
        const qpcStrs = this.getQpcStrs(record);

        const qpcStrOptions = [];
        qpcStrs.forEach(e => {
            qpcStrOptions.push(
                <Select.Option key={e.qpcStr} value={JSON.stringify(e)}>{e.qpcStr + "/" + e.munit}</Select.Option>
            );
        });
        return qpcStrOptions;
    }

    getVendors = (record) => {
        if (!record.article) {
            return [];
        }

        const { articles } = this.state;
        const article = articles[record.article.articleUuid];
        if (!article) {
            return [];
        }

        const vendors = [];
        if (!article.vendors) {
            return vendors;
        }
        article.vendors.forEach(function (e) {
            vendors.push({
                vendor: e.vendor,
                price: e.defaultReturnPrice,
                defaultVendor: e.vendor.uuid === article.defaultVendor.uuid
            });
        });

        return vendors;
    }

    getVendorOptions = (record) => {
        const vendors = this.getVendors(record);

        const vendorOptions = [];
        vendors.forEach(e => {
            vendorOptions.push(
                <Select.Option key={e.vendor.uuid} value={JSON.stringify(e)}>
                    {convertCodeName(e.vendor)}</Select.Option>
            );
        });
        return vendorOptions;
    }

    /**
     * 保存
     */
    onSave = (data) => {
        const { entity, items } = this.state;

        let bill = {
            ...entity,
            ...data,
        };
        bill.items = items;
        bill.companyUuid = loginCompany().uuid;
        bill.dcUuid = loginOrg().uuid;
        bill.owner = JSON.parse(bill.owner);
        bill.wrh = JSON.parse(bill.wrh);
        bill.store = JSON.parse(bill.store);
        bill.sourceWay = sourceWay.CREATE.name;

        if (this.validate(bill) === false)
            return;

        bill.rtnDate = formatDate(bill.rtnDate);
        if (!bill.uuid) {
            this.props.dispatch({
                type: 'storeRtnNtc/save',
                payload: bill,
                callback: (response) => {
                    if (response && response.success) {
                        message.success(commonLocale.saveSuccessLocale);
                    }
                }
            });
        } else {
            this.props.dispatch({
                type: 'storeRtnNtc/modify',
                payload: bill,
                callback: (response) => {
                    if (response && response.success) {
                        message.success(commonLocale.modifySuccessLocale);
                    }
                }
            });
        }
    }

    /**
     * 保存并新建
     */
    onSaveAndCreate = (data) => {
        let bill = {
            ...this.state.entity,
            ...data,
        };
        bill.items = this.state.items;
        bill.companyUuid = loginCompany().uuid;
        bill.dcUuid = loginOrg().uuid;
        bill.owner = JSON.parse(bill.owner);
        bill.store = JSON.parse(bill.store);
        bill.wrh = JSON.parse(bill.wrh);
        bill.sourceWay = sourceWay.CREATE.name;

        if (this.validate(bill) === false)
            return;

        bill.rtnDate = formatDate(bill.rtnDate);
        this.props.dispatch({
            type: 'storeRtnNtc/onSaveAndApprove',
            payload: bill,
            callback: (response) => {
                if (response && response.success) {
                    message.success(commonLocale.saveAndAuditSuccess);
                }
            }
        });
    }


    validate = (entity) => {
        if (entity.items.length === 0) {
            message.error('退仓明细不能为空');
            return false;
        }

        if (entity.rtnDate && (entity.rtnDate).startOf('day') < moment(new Date()).startOf('day')) {
            message.error(`通知单退货日期不能早于当前日期`);
            return false;
        }

        for (let i = entity.items.length - 1; i >= 0; i--) {
            if (!entity.items[i].article) {
                message.error(`第${entity.items[i].line}行商品不能为空！`);
                return false;
            }

            if (entity.items[i].article && !entity.items[i].vendor) {
                message.error(`第${entity.items[i].line}行供应商不能为空！`);
                return false;
            }
            if (entity.items[i].article && entity.items[i].qty <= 0) {
                message.error(`第${entity.items[i].line}行数量不能小于等于0！`);
                return false;
            }

        }

        return true;
    }

    handlechangeOwner = (value) => {
        const { entity } = this.state;

        if (entity.owner && entity.owner !== JSON.parse(value)) {
            Modal.confirm({
                title: '修改货主会清空其他信息，请确认修改？',
                okText: '确认',
                cancelText: '取消',
                onOk: () => {
                    this.props.form.resetFields();
                    entity.owner = JSON.parse(value);
                    entity.wrh = undefined;
                    entity.store = undefined;
                    entity.rtnDate = undefined;
                    entity.sourceBillNumber = undefined;
                    entity.reason = undefined;
                    entity.items = [];

                    this.setState({
                        entity: entity,
                        items: []
                    });
                },
            });
        } else {
            entity.owner = JSON.parse(value);
            this.setState({
                entity: entity
            })
        }
    }

    reseteEntity = () => {
        this.props.dispatch({
            type: 'storeRtnNtc/getByBillNumberAndDcUuid',
            payload: {
                billNumber: '',
                dcUuid: loginOrg().uuid
            }
        })
    }

    /**
   * 表格变化时
   * @param {*} e
   * @param {*} fieldName
   * @param {*} key
   */
    handleFieldChange(e, fieldName, line) {
        const { entity, items } = this.state;
        if (fieldName === 'article') {
            let article = {
                articleUuid: JSON.parse(e).uuid,
                articleCode: JSON.parse(e).code,
                articleName: JSON.parse(e).name,
                articleSpec: JSON.parse(e).spec,
            }
            items[line - 1].article = article;
            items[line - 1].stockBatch = undefined;
            items[line - 1].price = undefined;
            items[line - 1].vendor = undefined;
            items[line - 1].qtyStr = '0';
            items[line - 1].qty = undefined;
            items[line - 1].note = undefined;

            this.queryArticle(article.articleUuid);
        } else if (fieldName === 'qpcStr') {
            const qpcStrMunit = JSON.parse(e);
            items[line - 1].qpcStr = qpcStrMunit.qpcStr;
            items[line - 1].article.munit = qpcStrMunit.munit;
            items[line - 1].article.articleSpec = qpcStrMunit.spec;
            items[line - 1].volume = qpcStrMunit.volume;
            items[line - 1].weight = qpcStrMunit.weight;
            items[line - 1].qpc = qpcStrMunit.qpc;

            if (items[line - 1].qtyStr)
                items[line - 1].qty = qtyStrToQty(items[line - 1].qtyStr, items[line - 1].qpcStr);
        } else if (fieldName === 'vendor') {
            items[line - 1].vendor = JSON.parse(e).vendor;
            items[line - 1].price = JSON.parse(e).price;

        } else if (fieldName === 'price') {
            items[line - 1].price = e;
        } else if (fieldName === 'qtyStr') {
            items[line - 1].qtyStr = e;
            items[line - 1].qty = qtyStrToQty(e.toString(), items[line - 1].qpcStr);
        }

        this.setState({
            items: items.slice()
        });
    }

    /**
     * 绘制表单
     */
    drawFormItems = () => {
        const { getFieldDecorator } = this.props.form;
        const { entity, defOwner } = this.state;

        let basicCols = [
            <CFormItem key='owner' label={commonLocale.inOwnerLocale}>
                {
                    getFieldDecorator('owner', {
                        initialValue: entity && entity.owner ? JSON.stringify(entity.owner) : undefined,
                        rules: [
                            { required: true, message: notNullLocale(commonLocale.inOwnerLocale) }
                        ],
                    })(
                        <OwnerSelect
                            onChange={this.handlechangeOwner}
                            onlyOnline
                            placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} />
                    )
                }
            </CFormItem>,
            <CFormItem key='wrh' label={commonLocale.inWrhLocale}>
                {
                    getFieldDecorator('wrh', {
                        initialValue: entity && entity.wrh ? JSON.stringify(entity.wrh) : undefined,
                        rules: [{ required: true, message: notNullLocale(commonLocale.inWrhLocale) }],
                    })(
                        <WrhSelect placeholder={placeholderLocale(commonLocale.inWrhLocale)} />
                    )
                }
            </CFormItem>,
            <CFormItem key='store' label={commonLocale.inStoreLocale}>
                {
                    getFieldDecorator('store', {
                        initialValue: entity && entity.store ?
                            JSON.stringify(entity.store) : undefined,
                        rules: [
                            { required: true, message: notNullLocale(commonLocale.inStoreLocale) }
                        ],
                    })(
                        <StoreSelect
                            ownerUuid={entity.owner && entity.owner.uuid ? entity.owner.uuid : undefined}
                            state={STATE.ONLINE}
                            single
                            placeholder={placeholderChooseLocale(commonLocale.inStoreLocale)}
                        />
                    )
                }
            </CFormItem>,
            <CFormItem key='rtnDate' label={storeRtnNtcLocal.rtnDate}>
                {
                    getFieldDecorator('rtnDate', {
                        initialValue: entity.rtnDate ? moment(entity.rtnDate, 'YYYY-MM-DD') : null,
                        rules: [
                            { required: true, message: notNullLocale(storeRtnNtcLocal.rtnDate) }
                        ],
                    })(
                        <DatePicker style={{ width: '100%' }} />
                    )
                }
            </CFormItem>,
            <CFormItem key='sourceBillNumber' label={storeRtnNtcLocal.sourceBillNumber}>
                {
                    getFieldDecorator('sourceBillNumber', {
                        initialValue: entity.sourceBillNumber,
                        rules: [
                            {
                                max: 30,
                                message: '来源单号最大长度为30',
                            }
                        ],
                    })(
                        <Input placeholder={placeholderLocale(storeRtnNtcLocal.sourceBillNumber)} />
                    )
                }
            </CFormItem>,
            <CFormItem label={storeRtnNtcLocal.reason} key='reason'>
                {getFieldDecorator('reason', {
                    initialValue: entity.reason,
                    rules: [
                        { required: true, message: notNullLocale(storeRtnNtcLocal.reason) }
                    ],
                })(<PreTypeSelect placeholder={placeholderChooseLocale(storeRtnNtcLocal.reason)}
                    preType={PRETYPE.rtnType} />)}
            </CFormItem>,
        ];

        return [
          <FormPanel key='basicInfo' noteLabelSpan={4} title={commonLocale.basicInfoLocale} cols={basicCols} noteCol={this.drawNotePanel()}/>,
        ];
    }
    /**
     * 绘制总数量
     */
    drawTotalInfo = () => {
        var allQtyStr = 0;
        var allQty = 0;
        var allAmount = this.state.entity.amount ? this.state.entity.amount : 0;
        var articles = [];
        if (this.state.items) {
            this.state.items.map(item => {
                if (!item.qty) {
                    item.qty = 0;
                }
                if (!item.qtyStr) {
                    item.qtyStr = 0;
                }
                if (!item.price) {
                    item.price = 0;
                }
                allQty = accAdd(allQty, item.qty);
                allQtyStr = add(allQtyStr, item.qtyStr)

                allAmount = accAdd(allAmount, accMul(item.price, item.qty));
            })
        }

        return (
            <span style={{ marginLeft: '10px' }}>
                {commonLocale.inAllQtyStrLocale + ':' + allQtyStr} |
    {commonLocale.inAllQtyLocale + ':' + allQty} |
    {commonLocale.inAllAmountLocale + ':' + allAmount}
            </span >
        );
    }

    /**
     * 绘制明细表格
     */
    drawTable = () => {
        const { getFieldDecorator } = this.props.form;
        const { entity, items } = this.state;
        let articleCols = [
            {
                title: commonLocale.inArticleLocale,
                key: 'article',
                width: itemColWidth.articleEditColWidth,
                render: record => {
                    return (
                        <ArticleSelect
                            value={record.article ? `[${record.article.articleCode}]${record.article.articleName}` : undefined}
                            ownerUuid={entity.owner ? entity.owner.uuid : '-'}
                            placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
                            onChange={e => this.handleFieldChange(e, 'article', record.line)}
                            onlyOnline={true}
                            showSearch={true}
                            single
                        />
                    );
                }
            },
            {
                title: commonLocale.inQpcAndMunitLocale,
                key: 'qpcStrAndMunit',
                width: itemColWidth.qpcStrEditColWidth,
                render: (text, record) => {
                    let value;
                    if (record.qpcStr && record.article.munit) {
                        value = record.qpcStr + "/" + record.article.munit;
                    } else {
                        if (this.getQpcStrs(record).length > 0) {
                            let qpcStrs = this.getQpcStrs(record);
                            qpcStrs && qpcStrs.forEach(function (e) {
                                if (e.defaultQpcStr) {
                                    record.qpcStr = e.qpcStr;
                                    record.article.munit = e.munit;
                                    record.article.articleSpec = e.spec;
                                    record.qpc = e.qpc;
                                    record.weight = e.weight;
                                    record.volume = e.volume;

                                    value = JSON.stringify(e);
                                }
                            })
                            if (!value) {
                                record.qpcStr = this.getQpcStrs(record)[0].qpcStr;
                                record.article.munit = this.getQpcStrs(record)[0].munit;
                                record.article.articleSpec = this.getQpcStrs(record)[0].spec;
                                record.qpc = this.getQpcStrs(record)[0].qpc;
                                record.weight = this.getQpcStrs(record)[0].weight;
                                record.volume = this.getQpcStrs(record)[0].volume;

                                value = JSON.stringify(this.getQpcStrs(record)[0]);
                            }
                        }
                    }
                    return (
                        <Select
                            value={value}
                            placeholder={placeholderLocale(commonLocale.qpcStrLocale)}
                            onChange={e => this.handleFieldChange(e, 'qpcStr', record.line)}>
                            {this.getQpcStrOptions(record)}
                        </Select>
                    );
                },
            },
            {
                title: commonLocale.vendorLocale,
                dataIndex: 'vendor',
                key: 'vendor',
                width: itemColWidth.articleEditColWidth,
                render: (text, record) => {
                    let value;
                    if (record.vendor) {
                        value = convertCodeName(record.vendor);
                    } else {
                        if (this.getVendors(record).length > 0) {
                            let vendors = this.getVendors(record);
                            vendors && vendors.forEach(
                                function (e) {
                                    if (e.defaultVendor) {
                                        value = JSON.stringify(e.vendor);
                                        record.vendor = e.vendor;
                                        record.price = e.price;
                                    }
                                }
                            )
                            if (!value) {
                                record.vendor = this.getVendors(record)[0].vendor;
                                record.price = this.getVendors(record)[0].price;
                                value = JSON.stringify(this.getVendors(record)[0].vednor);
                            }
                        }
                    }
                    return (
                        <Select
                            value={value}
                            placeholder={placeholderChooseLocale(commonLocale.vendorLocale)}
                            onChange={e => this.handleFieldChange(e, 'vendor', record.line)}
                        >
                            {this.getVendorOptions(record)}
                        </Select>
                    );
                }
            },
            {
                title: commonLocale.inPriceLocale,
                dataIndex: 'price',
                key: 'price',
                width: itemColWidth.numberEditColWidth,
                render: (text, record) => {
                    return (
                        <InputNumber
                            value={record.price ? record.price : 0}
                            min={0}
                            precision={4}
                            max={100000}
                            onChange={e => this.handleFieldChange(e, 'price', record.line)}
                            placeholder={placeholderLocale(commonLocale.inPriceLocale)}
                        />
                    );
                }
            },
            {
                title: commonLocale.inQtyStrLocale,
                dataIndex: 'qtyStr',
                key: 'qtyStr',
                width: itemColWidth.qtyStrEditColWidth,
                render: (text, record) => {
                    return (
                        <QtyStrInput
                            value={record.qtyStr ? record.qtyStr : 0}
                            onChange={
                                e => this.handleFieldChange(e, 'qtyStr', record.line)
                            }
                            placeholder={placeholderLocale(commonLocale.inQtyStrLocale)}
                        />
                    );
                }
            },
            {
                title: commonLocale.inQtyLocale,
                dataIndex: 'qty',
                key: 'qty',
                width: itemColWidth.qtyColWidth,
                render: (text, record) => {
                    return <span>{record.qty ? record.qty : 0}</span>
                }
            },
        ];

        let batchQueryResultColumns = [
            {
                title: commonLocale.codeLocale,
                key: 'code',
                dataIndex: 'code',
                width: colWidth.codeColWidth,
            }, {
                title: commonLocale.nameLocale,
                key: 'name',
                dataIndex: 'name',
                width: colWidth.codeColWidth,
            },
        ]
        return (
            <div>
                <ItemEditTable
                    title='商品明细'
                    columns={articleCols}
                    data={items ? items:[]}
                    drawTotalInfo={this.drawTotalInfo}
                    drawBatchButton={this.drawBatchButton}
                />

                <PanelItemBatchAdd
                    searchPanel={<SearchFormItemBatchAdd refresh={this.onSearch} fieldsValue={''} />}
                    visible={this.state.batchAddVisible}
                    columns={batchQueryResultColumns}
                    data={this.props.article.data}
                    handlebatchAddVisible={this.handlebatchAddVisible}
                    getSeletedItems={this.getItemList}
                    onChange={this.tableChange}
                    width={'50%'}
                />
            </div>
        )
    }


    /**搜索*/
    onSearch = (data) => {
        const { pageFilter, entity } = this.state;

        let ownerUuid = entity.owner ? entity.owner.uuid : undefined;
        if (!ownerUuid) {
            return;
        }

        if (data) {
            pageFilter.searchKeyValues = {
                ...pageFilter.searchKeyValues,
                companyUuid: loginCompany().uuid,
                ownerUuid: ownerUuid,
                ...data
            }
        } else {
            pageFilter.searchKeyValues = {
                companyUuid: loginCompany().uuid,
                ownerUuid: ownerUuid,
            }
        }
        this.queryArticles();
    }

    tableChange = (pagination, filtersArg, sorter) => {
        const { pageFilter } = this.state;
        pageFilter.page = pagination.current - 1;
        pageFilter.pageSize = pagination.pageSize;

        this.setState({
            pageFilter: pageFilter
        })

        this.queryArticles();
    }

    /**获取批量增加的集合*/
    getItemList = (value) => {
        const { entity, items } = this.state;

        var newList = [];
        let line = items.length;
        for (let i = 0; i < value.length; i++) {
            if (items && items.find(function (item) {
                return item.article && item.article.articleUuid === value[i].uuid
            }) === undefined) {
                items[line] = {
                    article: {
                        articleUuid: value[i].uuid,
                        articleCode: value[i].code,
                        articleName: value[i].name,
                        articleSpec: value[i].spec
                    },
                    stockBatch: undefined,
                    price: undefined,
                    vendor: undefined,
                    qtyStr: '0',
                    qty: undefined,
                    note: undefined,
                    line: line + 1
                }

                this.queryArticle(value[i].uuid);
                line++;
            }
        }

        this.setState({
            items: items.slice()
        })
    }

    drawBatchButton = () => {
        return (
            <span>
                <a onClick={() => this.handlebatchAddVisible()}>批量添加</a>
            </span>
        )
    }

    handlebatchAddVisible = () => {
        this.setState({
            batchAddVisible: !this.state.batchAddVisible
        })
    }
}
