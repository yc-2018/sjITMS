import CFormItem from '@/pages/Component/Form/CFormItem';
import Empty from '@/pages/Component/Form/Empty';
import FormPanel from '@/pages/Component/Form/FormPanel';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import style from '@/pages/Component/Form/ItemEditTable.less';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import CreatePage from '@/pages/Component/Page/CreatePage';
import BinSelect from '@/pages/Component/Select/BinSelect';
import UserSelect from '@/pages/Component/Select/UserSelect';
import LessContainerSelect from './LessContainerSelect';
import { binUsage } from '@/utils/BinUsage';
import { itemColWidth } from '@/utils/ColWidth';
import { commonLocale, notNullLocale, placeholderChooseLocale, placeholderLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import { qtyStrToQty, toQtyStr, accAdd } from '@/utils/QpcStrUtil';
import { sourceWay } from '@/utils/SourceWay';
import { stockState } from '@/utils/StockState';
import { convertCodeName } from '@/utils/utils';
import { Col, Form, message, Select } from 'antd';
import { connect } from 'dva';
import { State, Type, AlcClassify, AlcType } from './AlcDiffBillContants';
import { alcDiffLocal } from './AlcDiffBillLocale';
import { binState } from '@/utils/BinState';

const typeOptions = [];
Object.keys(Type).forEach(function (key) {
    typeOptions.push(<Option value={Type[key].name}
        key={Type[key].name}>
        {Type[key].caption}
    </Option>);
});

const classifyOptions = [];
Object.keys(AlcClassify).forEach(function (key) {
  classifyOptions.push(<Option value={AlcClassify[key].name}
                               key={AlcClassify[key].name}>
    {AlcClassify[key].caption}
  </Option>);
});
@connect(({ alcDiff, storeHandover, stock, article, pickSchema, billQpcStrConfig, loading }) => ({
    alcDiff, storeHandover, stock, article, pickSchema, billQpcStrConfig,
    loading: loading.models.alcDiff,
}))
@Form.create()
export default class AlcDiffBillCreatePage extends CreatePage {
    constructor(props) {
        super(props);
        this.state = {
            title: commonLocale.createLocale + alcDiffLocal.title,
            entityUuid: props.entityUuid,
            entity: {
                differ: {
                    uuid: loginUser().uuid,
                    code: loginUser().code,
                    name: loginUser().name
                },
                items: []
            },
            differ: {
                uuid: loginUser().uuid,
                code: loginUser().code,
                name: loginUser().name
            },
            storeHandoverBill: {
                items: []
            },
            stocks: [],
            bins: [],
            wrhs: [],
            wrhOptions: [],
            articles: [],
            pickSchemas: [],
            billConfig: {}
        }
    }

    componentDidMount() {
        this.getHandoverBill('');
        this.refresh();
    }

    componentWillReceiveProps(nextProps) {
        const { stocks, bins, articles, pickSchemas } = this.state;
        const that = this;
        if (nextProps.alcDiff.entity && this.state.entityUuid
            && nextProps.alcDiff.entity.uuid === this.state.entityUuid
            && !nextProps.storeHandover.entity.uuid) {
            const newEntity = nextProps.alcDiff.entity;

            if (nextProps.alcDiff.entity && this.props.alcDiff.entityUuid && !this.state.entity.uuid) {
                var lessArticleUuids = [];
                var moreArticleUuids = [];
                var schemaArticleUuids = [];
                if (State.INITIAL.name === State[nextProps.alcDiff.entity.state].name) {
                    newEntity.items = this.genNewItems(nextProps.alcDiff.entity.simItems);
                    nextProps.alcDiff.entity.simItems && nextProps.alcDiff.entity.simItems.forEach(function (e) {
                        if (nextProps.alcDiff.entity.wrh && nextProps.alcDiff.entity.owner) {
                            if (Type.MOREALC.name === e.type) {
                                moreArticleUuids.push(e.article.articleUuid);
                            } else {
                                lessArticleUuids.push(e.article.articleUuid);
                                if (!e.binCode) {
                                    schemaArticleUuids.push(e.article.articleUuid);
                                }
                            }
                        }
                    });
                } else {
                    if (!nextProps.alcDiff.entity.items) {
                        newEntity.items = [];
                    }
                    nextProps.alcDiff.entity.items && nextProps.alcDiff.entity.items.forEach(function (e) {
                        if (nextProps.alcDiff.entity.wrh && nextProps.alcDiff.entity.owner) {
                            if (Type.MOREALC.name === e.type) {
                                moreArticleUuids.push(e.article.articleUuid);
                            } else {
                                lessArticleUuids.push(e.article.articleUuid);
                                if (!e.binCode) {
                                    schemaArticleUuids.push(e.article.articleUuid);
                                }
                            }
                        }
                    });
                }
                if (moreArticleUuids || moreArticleUuids.length != 0)
                    that.queryStocks(moreArticleUuids, nextProps.alcDiff.entity.owner.uuid, nextProps.alcDiff.entity.wrh.uuid);
                if (lessArticleUuids || lessArticleUuids.length != 0)
                    that.queryArticles(lessArticleUuids);
                if (schemaArticleUuids || schemaArticleUuids.length != 0)
                    that.queryPickSchemas(schemaArticleUuids);
                this.setState({
                    entity: newEntity,
                    title: alcDiffLocal.title + "：" + nextProps.alcDiff.entity.billNumber,
                });
                this.getHandoverBill(nextProps.alcDiff.entity.storeHandoverBillNumber);
            }
        }

        if (nextProps.storeHandover.entity.uuid && nextProps.storeHandover.entity) {
            this.setState({
                storeHandoverBill: nextProps.storeHandover.entity
            })
        }

        if (nextProps.stock.stocks) {
            nextProps.stock.stocks.forEach(function (stock) {
                var exist = stocks.some(function (e) {
                    return e.uuid === stock.uuid;
                })
                if (!exist && stockState.NORMAL.name === stockState[stock.state].name)
                    stocks.push(stock);
            });
            this.setState({
                stocks: stocks
            });
        }


        if (nextProps.article.entity && nextProps.article.entity.uuid
            && !articles[nextProps.article.entity.uuid]) {
            articles[nextProps.article.entity.uuid] = nextProps.article.entity;
            this.setState({
                articles: articles
            });
        }
        if (nextProps.article.articles) {
            nextProps.article.articles.forEach(function (e) {
                if (!articles[e.uuid]) {
                    articles[e.uuid] = e;
                }
            })
            this.setState({
                articles: articles
            });
        }

        if (nextProps.pickSchema.entity && nextProps.pickSchema.entity.uuid
            && !pickSchemas[nextProps.pickSchema.entity.uuid]) {
            pickSchemas[nextProps.pickSchema.entity.article.uuid] = nextProps.pickSchema.entity;
            this.setState({
                pickSchemas: pickSchemas
            });
        }
        if (nextProps.pickSchema.schemaList) {
            nextProps.pickSchema.schemaList.forEach(function (e) {
                if (!pickSchemas[e.article.uuid]) {
                    pickSchemas[e.article.uuid] = e;
                }
            })
            this.setState({
                pickSchemas: pickSchemas
            });
        }


        if (nextProps.billQpcStrConfig.entity && nextProps.billQpcStrConfig.entity.uuid) {
            this.setState({
                billConfig: nextProps.billQpcStrConfig.entity
            });
        }
    }

    genNewItems = (simItems) => {
        if (!simItems || simItems.length === 0)
            return null;

        var keys = [];
        var newItems = [];
        let i = 1;
        simItems.forEach((e) => {
            let key = e.article.articleUuid + e.qpcStr;
            if (keys.indexOf(key) == -1) {
                keys.push(key);
                e.qtyStr = toQtyStr(e.qty, e.qpcStr);
                e.line = i++;
                newItems.push(e);
            } else {
                for (let i = 0; i < newItems.length; i++) {
                    let k = newItems[i].article.articleUuid + newItems[i].qpcStr;
                    if (key === k) {
                        newItems[i].qty = accAdd(newItems[i].qty, e.qty);
                        newItems[i].qtyStr = toQtyStr(newItems[i].qty, newItems[i].qpcStr);
                    }
                }
            }
        });

        return newItems;
    }


    queryBillQpcStrConfig = () => {
        this.props.dispatch({
            type: 'billQpcStrConfig/getByBillType',
            payload: {
                dcUuid: loginOrg().uuid,
                billType: 'ALCDIFFBILL'
            }
        });
    }

    queryPickSchemas = (articleUuids) => {
        if (!articleUuids || articleUuids.length == 0)
            return;
        this.props.dispatch({
            type: 'pickSchema/queryByArticles',
            payload: {
                articleUuids: articleUuids
            }
        });
    }

    queryPickSchema = (value) => {
        this.props.dispatch({
            type: 'pickSchema/getByDcUuidAndArticleUuid',
            payload: {
                dcUuid: loginOrg().uuid,
                articleUuid: value
            }
        });
    }

    queryArticles = (articleUuids) => {
        this.props.dispatch({
            type: 'article/queryByUuids',
            payload: articleUuids
        })
    }

    queryArticle = (articleUuid) => {
        this.props.dispatch({
            type: 'article/get',
            payload: {
                uuid: articleUuid
            }
        });
    }

    queryStocks = (articleUuids, ownerUuid, wrhUuid) => {
        if (!articleUuids || articleUuids.length == 0
            || !ownerUuid || !wrhUuid)
            return;

        this.props.dispatch({
            type: 'stock/query',
            payload: {
                companyUuid: loginCompany().uuid,
                dcUuid: loginOrg().uuid,
                articleUuids: articleUuids,
                ownerUuid: ownerUuid,
                wrhUuid: wrhUuid,
                state: stockState.NORMAL.name,
                binUsages: [binUsage.PickUpBin.name, binUsage.PickUpStorageBin.name, binUsage.StorageBin.name, binUsage.Virtuality.name]
            }
        });
    }

    queryStock = (articleUuid, ownerUuid, wrhUuid) => {
        if (!articleUuid)
            return;

        this.props.dispatch({
            type: 'stock/query',
            payload: {
                companyUuid: loginCompany().uuid,
                dcUuid: loginOrg().uuid,
                articleUuid: articleUuid,
                ownerUuid: ownerUuid,
                wrhUuid: wrhUuid,
                state: stockState.NORMAL.name,
                binUsages: [binUsage.PickUpBin.name, binUsage.PickUpStorageBin.name, binUsage.StorageBin.name, binUsage.Virtuality.name]
            }
        });
    }

    onCancel = () => {
        this.props.form.resetFields();
        if (!this.props.alcDiff.entityUuid) {
            this.props.dispatch({
                type: 'alcDiff/showPage',
                payload: {
                    showPage: 'query'
                }
            });
        } else {
            this.props.dispatch({
                type: 'alcDiff/showPage',
                payload: {
                    showPage: 'view',
                    entityUuid: this.props.alcDiff.entityUuid
                }
            });
        }
        this.getHandoverBill('');
    }

    onSave = (data) => {
        const { entity } = this.state;
        let bill = {
            ...entity,
        };
        if (!bill) {
            return;
        }
        bill.companyUuid = loginCompany().uuid;
        bill.dcUuid = loginOrg().uuid;
        bill.differ = JSON.parse(data.differ);
        bill.alcDiffDutyType = data.alcDiffDutyType;
        bill.sourceWay = sourceWay.INTERFACE_IMPORT.name;
        bill.note = data.note;

        if (this.validate(bill) === false)
            return;

        this.props.dispatch({
            type: 'alcDiff/modify',
            payload: bill,
            callback: (response) => {
                if (response && response.success) {
                    this.props.form.resetFields();
                    this.getHandoverBill('');
                    message.success(commonLocale.modifySuccessLocale);
                }
            }
        });

    }

    validate = (entity) => {
        for (let i = entity.items.length - 1; i >= 0; i--) {
            if (!entity.items[i].type) {
                message.error(`第${entity.items[i].line}行差异类型不能为空！`);
                return false;
            }
            if (!entity.items[i].article) {
                message.error(`第${entity.items[i].line}行商品不能为空！`);
                return false;
            }

            if (entity.items[i].qty === 0)
                continue;

            if (entity.items[i].article && !entity.items[i].binCode) {
                message.error(`第${entity.items[i].line}行货位不能为空！`);
                return false;
            }
            if (entity.items[i].article && !entity.items[i].containerBarcode) {
                message.error(`第${entity.items[i].line}行容器条码不能为空！`);
                return false;
            }
            if (entity.items[i].article && !entity.items[i].vendor) {
                message.error(`第${entity.items[i].line}行供应商不能为空！`);
                return false;
            }
            if (entity.items[i].article && !entity.items[i].productionBatch) {
                message.error(`第${entity.items[i].line}行批次不能为空！`);
                return false;
            }
            if (entity.items[i].binUsage && binUsage[entity.items[i].binUsage].name !== binUsage.PickUpStorageBin.name
                && binUsage[entity.items[i].binUsage].name !== binUsage.PickUpBin.name) {
                if ('-' === entity.items[i].containerBarcode) {
                    message.error(`第${entity.items[i].line}行货位不是拣货位或拣货存储位，容器不能为虚拟容器！`);
                    return false;
                }
            }
        }

        for (let i = 0; i < entity.items.length; i++) {
            for (let j = i + 1; j < entity.items.length; j++) {
                if ('-' !== entity.items[i].containerBarcode &&
                    entity.items[i].containerBarcode === entity.items[j].containerBarcode &&
                    entity.items[i].binCode !== entity.items[j].binCode) {
                    message.error(`第${entity.items[i].line}行与第${entity.items[j].line}行容器相同,货位不同！`);
                    return false;
                }
            }
        }

        return true;
    }

    refresh = () => {
        this.props.dispatch({
            type: 'alcDiff/get',
            payload: this.props.alcDiff.entityUuid
        });
    }

    getHandoverBill = (value) => {
        this.props.dispatch({
            type: 'storeHandover/getByBillNumber',
            payload: {
                billNumber: value,
                companyUuid: loginCompany().uuid
            },
        });
    }

    drawFormItems = () => {
        const { getFieldDecorator } = this.props.form;
        const { entity } = this.state;

        let cols = [];
        if (entity.storeHandoverBillNumber) { //导入的单据没有门店交接单，且部分内容不允许修改
            cols = [        
                <CFormItem label={commonLocale.inOwnerLocale} key='owner'>
                    {getFieldDecorator('owner')
                        (<Col>{this.state.entity.owner ?
                            convertCodeName(this.state.entity.owner) : <Empty />}</Col>)}
                </CFormItem>,
                <CFormItem label={commonLocale.inStoreLocale} key='store'>
                    {getFieldDecorator('store')
                        (<Col>{this.state.entity.store ?
                            convertCodeName(this.state.entity.store) : <Empty />}</Col>)}
                </CFormItem>,
                <CFormItem label={commonLocale.inWrhLocale} key='wrh'>
                    {getFieldDecorator('wrh')(
                        (<Col>{entity.wrh ? convertCodeName(entity.wrh) : <Empty />}</Col>))}
                </CFormItem>,

                <CFormItem label={alcDiffLocal.differ} key='differ'>
                    {getFieldDecorator('differ', {
                        initialValue: JSON.stringify(entity.differ && entity.differ.uuid ? entity.differ : this.state.differ),
                        rules: [
                            {
                                required: true,
                                message: notNullLocale(alcDiffLocal.differ)
                            }
                        ],
                    })(<UserSelect autoFocus single={true} />)}
                </CFormItem>,
                <CFormItem label={alcDiffLocal.alcDiffDutyType} key='alcDiffDutyType'>
                    {getFieldDecorator('alcDiffDutyType'), (
                        <Col>{AlcClassify[entity.alcDiffDutyType].name}</Col>)}
                </CFormItem>,
            ];
        }
        else {
            cols = [        
                <CFormItem label={alcDiffLocal.handoverBillNumber}
                    key='storeHandoverBillNumber'>
                    {getFieldDecorator('storeHandoverBillNumber', {
                        initialValue: entity.storeHandoverBillNumber,
                        rules: [
                            {
                                required: true,
                                message: notNullLocale(alcDiffLocal.handoverBillNumber)
                            }
                        ],
                    })(<Col>{entity.storeHandoverBillNumber}</Col>)}
                </CFormItem>,
                <CFormItem label={commonLocale.inOwnerLocale} key='owner'>
                    {getFieldDecorator('owner')
                        (<Col>{this.state.entity.owner ?
                            convertCodeName(this.state.entity.owner) : <Empty />}</Col>)}
                </CFormItem>,
                <CFormItem label={commonLocale.inStoreLocale} key='store'>
                    {getFieldDecorator('store')
                        (<Col>{this.state.entity.store ?
                            convertCodeName(this.state.entity.store) : <Empty />}</Col>)}
                </CFormItem>,
                <CFormItem label={commonLocale.inWrhLocale} key='wrh'>
                    {getFieldDecorator('wrh')(
                        (<Col>{entity.wrh ? convertCodeName(entity.wrh) : <Empty />}</Col>))}
                </CFormItem>,

                <CFormItem label={alcDiffLocal.differ} key='differ'>
                    {getFieldDecorator('differ', {
                        initialValue: JSON.stringify(entity.differ && entity.differ.uuid ? entity.differ : this.state.differ),
                        rules: [
                            {
                                required: true,
                                message: notNullLocale(alcDiffLocal.differ)
                            }
                        ],
                    })(<UserSelect autoFocus single={true} />)}
                </CFormItem>,
                <CFormItem label={alcDiffLocal.alcDiffDutyType} key='alcDiffDutyType'>
                    {getFieldDecorator('alcDiffDutyType', {
                    initialValue: entity.alcDiffDutyType ? AlcClassify[entity.alcDiffDutyType].name : undefined,
                    rules: [
                        {
                        required: true,
                        message: notNullLocale(alcDiffLocal.alcDiffDutyType)
                        }
                    ],
                    })(<Select placeholder={placeholderChooseLocale(alcDiffLocal.alcDiffDutyType)}>
                    {classifyOptions}</Select>)}
                </CFormItem>,
            ];
        }
        return [<FormPanel key='basicInfo'
            title={commonLocale.basicInfoLocale}
            cols={cols} />
        ];
    }

    getPlanQty = (record) => {
        var qty = 0;
        if (!record || !record.article
            || !record.article.articleUuid) {
            return qty;
        }

        let oldItems = this.props.alcDiff.entity.simItems;
        oldItems && oldItems.forEach(function (e) {
            if (e.article && e.article.articleUuid === record.article.articleUuid
                && e.qpcStr === record.qpcStr) {
                qty = accAdd(e.qty, qty);
            }
        })
        return qty;
    }

    getStockBatch = (record) => {
        var stockBatch = 0;
        if (!record || !record.article
            || !record.article.articleUuid) {
            return stockBatch;
        }

        let oldItems = this.props.alcDiff.entity.simItems;
        oldItems && oldItems.forEach(function (e) {
            if (e.article && e.article.articleUuid === record.article.articleUuid) {
                stockBatch = e.stockBatch;
            }
        })
        return stockBatch;
    }

    getProductionBatch = (record) => {
        var productionBatch = 0;
        if (!record || !record.article
            || !record.article.articleUuid) {
            return productionBatch;
        }

        let oldItems = this.props.alcDiff.entity.simItems;
        oldItems && oldItems.forEach(function (e) {
            if (e.article && e.article.articleUuid === record.article.articleUuid) {
                productionBatch = e.productionBatch;
            }
        })
        return productionBatch;
    }

    getArticles = (line) => {
        const { entity } = this.state;

        let articles = [];
        if (!entity.items[line - 1])
            console.log(entity);
        if (!entity.items[line - 1]
            || !entity.items[line - 1].type) {
            return articles;
        }

        let articleUuids = [];
        let oldItems = this.props.alcDiff.entity.simItems;
        oldItems && oldItems.forEach(function (e) {
            if (e.type && e.type === entity.items[line - 1].type
                && e.article && articleUuids.indexOf(e.article.articleUuid) === -1) {
                articles.push({
                    articleUuid: e.article.articleUuid,
                    articleCode: e.article.articleCode,
                    articleName: e.article.articleName,
                    articleSpec: e.article.articleSpec,
                    munit: e.article.munit
                });
                articleUuids.push(e.article.articleUuid);
            }
        });

        return articles;
    }

    getArticleOptions = (line) => {
        let articleOptions = [];
        this.getArticles(line).forEach(function (e) {
            articleOptions.push(
                <Select.Option key={JSON.stringify(e)} value={JSON.stringify(e)}>
                    {'[' + e.articleCode + ']' + e.articleName}</Select.Option>
            );
        });
        return articleOptions;
    }

    getQpcStrs = (line) => {
        const { articles, entity, stocks } = this.state;
        let qpcStrs = [];
        if (!entity.items[line - 1] || !entity.items[line - 1].article) {
            return qpcStrs;
        }

        if (entity.items[line - 1].type && Type.LESSALC.name === entity.items[line - 1].type) {
            const article = articles[entity.items[line - 1].article.articleUuid];
            if (!article || !article.qpcs) {
                return qpcStrs;
            }

            article.qpcs.forEach(function (e) {
                if (e.defaultQpcStr && !entity.items[line - 1].qpcStr) {
                    entity.items[line - 1].qpcStr = e.qpcStr
                    entity.items[line - 1].qpc = e.paq
                }
                qpcStrs.push(JSON.stringify({
                    qpcStr: e.qpcStr,
                    munit: e.munit ? e.munit : '-',
                    qpc: e.paq
                }));
            });
        } else {
            stocks.forEach(function (e) {
                if (e.article
                    && e.article.articleUuid === entity.items[line - 1].article.articleUuid) {
                    if (e.qpcStr && qpcStrs.indexOf(JSON.stringify({
                        qpcStr: e.qpcStr,
                        munit: e.article.munit,
                        qpc: e.qpc
                    })) === -1) {
                        qpcStrs.push(JSON.stringify({
                            qpcStr: e.qpcStr,
                            munit: e.article.munit,
                            qpc: e.qpc
                        }));
                    }
                }
            });
        }

        if (qpcStrs.length === 1) {
            entity.items[line - 1].qpcStr = JSON.parse(qpcStrs[0]).qpcStr;
            entity.items[line - 1].qpc = JSON.parse(qpcStrs[0]).qpc;
        }
        return qpcStrs;
    }

    getQpcStrOptions = (line) => {
        let qpcStrOptions = [];
        this.getQpcStrs(line).forEach(function (e) {
            qpcStrOptions.push(
                <Select.Option key={e} value={e}>
                    {JSON.parse(e).qpcStr + '/' + JSON.parse(e).munit}
                </Select.Option>
            );
        });
        return qpcStrOptions;
    }

    getVendors = (line) => {
        const { storeHandoverBill, entity, stocks } = this.state;
        let vendors = [];
        if (!entity.items[line - 1] || !entity.items[line - 1].article
            || !entity.items[line - 1].qpcStr) {
            return vendors;
        }

        var stockBatch = this.getStockBatch(entity.items[line - 1]);
        var productionBatch = this.getProductionBatch(entity.items[line - 1]);
        let vendorUuids = [];
        if (entity.items[line - 1].type && Type.LESSALC.name === entity.items[line - 1].type) {
            storeHandoverBill.articleItems && storeHandoverBill.articleItems.forEach(function (e) {
                if (e.article && e.article.articleUuid === entity.items[line - 1].article.articleUuid &&
                    (!stockBatch ? true : e.stockBatch === entity.items[line - 1].stockBatch) &&
                    (!productionBatch ? true : e.productionBatch === entity.items[line - 1].productionBatch) &&
                    e.vendor && vendorUuids.indexOf(e.vendor.uuid) === -1) {
                    vendors.push(e.vendor);
                    vendorUuids.push(e.vendor.uuid);
                }
            });
        } else {
            stocks.forEach(function (e) {
                if (e.article.articleUuid === entity.items[line - 1].article.articleUuid &&
                    e.qpcStr === entity.items[line - 1].qpcStr &&
                    (!stockBatch ? true : e.stockBatch === entity.items[line - 1].stockBatch) &&
                    (!productionBatch ? true : e.productionBatch === entity.items[line - 1].productionBatch) &&
                    e.vendor && vendorUuids.indexOf(e.vendor.uuid) === -1) {
                    vendors.push(e.vendor);
                    vendorUuids.push(e.vendor.uuid);
                }
            });
        }

        return vendors;
    }

    getVendorOptions = (line) => {
        let vendorOptions = [];
        this.getVendors(line).forEach(function (e) {
            vendorOptions.push(
                <Select.Option key={JSON.stringify(e)} value={JSON.stringify(e)}>
                    {convertCodeName(e)}</Select.Option>
            );
        });
        return vendorOptions;
    }

    getProductionBatchs = (line) => {
        const { storeHandoverBill, entity, stocks } = this.state;
        let productionBatchs = [];
        if (!entity.items[line - 1] || !entity.items[line - 1].article
            || !entity.items[line - 1].qpcStr
            || !entity.items[line - 1].vendor) {
            return productionBatchs;
        }

        var stockBatch = this.getStockBatch(entity.items[line - 1]);
        if (entity.items[line - 1].type && Type.LESSALC.name === entity.items[line - 1].type) {
            storeHandoverBill.articleItems && storeHandoverBill.articleItems.forEach(function (e) {
                if (e.article.articleUuid === entity.items[line - 1].article.articleUuid &&
                    e.vendor.uuid === entity.items[line - 1].vendor.uuid &&
                    (!stockBatch ? true : e.stockBatch === entity.items[line - 1].stockBatch) &&
                    e.productionBatch && productionBatchs.indexOf(e.productionBatch) === -1) {
                    productionBatchs.push(e.productionBatch);
                }
            });
        } else {
            stocks.forEach(function (e) {
                if (e.article.articleUuid === entity.items[line - 1].article.articleUuid &&
                    e.qpcStr === entity.items[line - 1].qpcStr &&
                    e.vendor.uuid === entity.items[line - 1].vendor.uuid &&
                    (!stockBatch ? true : e.stockBatch === entity.items[line - 1].stockBatch) &&
                    e.productionBatch && productionBatchs.indexOf(e.productionBatch) === -1) {
                    productionBatchs.push(e.productionBatch);
                }
            });
        }

        return productionBatchs;
    }

    getProductionBatchOptions = (line) => {
        let productionBatchOptions = [];
        this.getProductionBatchs(line).forEach(function (e) {
            productionBatchOptions.push(
                <Select.Option key={e} value={e}>
                    {e}</Select.Option>
            );
        });
        return productionBatchOptions;
    }


    getPickUpBin = (line) => {
        const { entity, pickSchemas } = this.state;
        if (!entity || !entity.items[line - 1] || !entity.items[line - 1].article) {
            return undefined;
        }
        if (!pickSchemas)
            return undefined;

        const pickSchema = pickSchemas[entity.items[line - 1].article.articleUuid];
        if (pickSchema) {
            if (pickSchema.caseBinCode) {
                entity.items[line - 1].binCode = pickSchema.caseBinCode;
                entity.items[line - 1].binUsage = pickSchema.caseBinUsage;
                entity.items[line - 1].containerBarcode = '-';
                return {
                    code: entity.items[line - 1].binCode,
                    usage: entity.items[line - 1].binUsage
                };
            }
            if (pickSchema.splitBinCode) {
                entity.items[line - 1].binCode = pickSchema.splitBinCode;
                entity.items[line - 1].binUsage = pickSchema.splitBinUsage;
                entity.items[line - 1].containerBarcode = '-';
                return {
                    code: entity.items[line - 1].binCode,
                    usage: entity.items[line - 1].binUsage
                };
            }
        }

        return undefined;
    }

    getBinCodes = (line) => {
        const { entity, stocks, pickSchemas } = this.state;
        const that = this;
        let bins = [];
        if (!entity.items[line - 1] || !entity.items[line - 1].article
            || !entity.items[line - 1].qpcStr
            || !entity.items[line - 1].vendor) {
            return bins;
        }

        let binCodes = []
        var stockBatch = this.getStockBatch(entity.items[line - 1]);
        if (entity.items[line - 1].type && Type.MOREALC.name === entity.items[line - 1].type) {
            stocks.forEach(function (e) {
                if (e.article.articleUuid === entity.items[line - 1].article.articleUuid &&
                    e.qpcStr === entity.items[line - 1].qpcStr &&
                    e.vendor.uuid === entity.items[line - 1].vendor.uuid
                    && (!stockBatch ? true : e.stockBatch === entity.items[line - 1].stockBatch)
                    && e.productionBatch === entity.items[line - 1].productionBatch
                    && e.binCode && binCodes.indexOf(e.binCode) === -1) {
                    bins.push({
                        code: e.binCode,
                        usage: e.binUsage
                    });

                    binCodes.push(e.binCode)
                }
            });
        }

        return bins;
    }

    getBinCodeOptions = (line) => {
        let binCodeOptions = [];
        this.getBinCodes(line).forEach(function (e) {
            binCodeOptions.push(
                <Select.Option key={e}
                    value={JSON.stringify(e)}>{e.code + '[' + binUsage[e.usage].caption + ']'}
                </Select.Option>
            );
        });
        return binCodeOptions;
    }

    getContainers = (line) => {
        const { entity, stocks } = this.state;
        let containers = [];
        if (!entity.items[line - 1] || !entity.items[line - 1].article
            || !entity.items[line - 1].qpcStr
            || !entity.items[line - 1].vendor
            || !entity.items[line - 1].binCode) {
            return containers;
        }

        var stockBatch = this.getStockBatch(entity.items[line - 1]);
        if (entity.items[line - 1].type && Type.MOREALC.name === entity.items[line - 1].type) {
            stocks.forEach(function (e) {
                if (e.article.articleUuid === entity.items[line - 1].article.articleUuid &&
                    e.qpcStr === entity.items[line - 1].qpcStr &&
                    e.vendor.uuid === entity.items[line - 1].vendor.uuid
                    && (!stockBatch ? true : e.stockBatch === entity.items[line - 1].stockBatch)
                    && e.binCode === entity.items[line - 1].binCode
                    && e.productionBatch === entity.items[line - 1].productionBatch
                    && e.containerBarcode && containers.indexOf(e.containerBarcode) === -1) {
                    containers.push(e.containerBarcode);
                }
            });
        }

        return containers;
    }

    getContainerOptions = (line) => {
        let containerOptions = [];
        this.getContainers(line).forEach(function (e) {
            containerOptions.push(
                <Select.Option key={e} value={e}>{e}</Select.Option>
            );
        });
        return containerOptions;
    }

    handleFieldChange(e, fieldName, line) {
        const { entity } = this.state;
        const target = entity.items[line - 1];

        if (fieldName === 'type') {
            target.type = e;
        } else if (fieldName === 'article') {
            let article = JSON.parse(e);
            if (target.article && target.article.articleUuid !== article.articleUuid) {
                target.qpcStr = undefined;
                target.vendor = undefined;
                target.binCode = undefined;
                target.containerBarcode = undefined;
                target.productionBatch = undefined;
            }

            target.article = {
                articleUuid: article.articleUuid,
                articleCode: article.articleCode,
                articleName: article.articleName,
                articleSpec: article.articleSpec,
                munit: article.munit
            };

            if (Type.MOREALC.name === target.type)
                this.queryStock(article.articleUuid, entity.owner.Uuid, entity.wrh.uuid);
            else {
                this.queryArticle(article.articleUuid);
                this.queryPickSchema(article.articleUuid)
            }
        } else if (fieldName === 'qpcStr') {
            const qpcStrMunit = JSON.parse(e);
            target.qpcStr = qpcStrMunit.qpcStr;
            target.article.munit = qpcStrMunit.munit;
            target.qpc = qpcStrMunit.qpc;
        } else if (fieldName === 'vendor') {
            if (target.vendor && target.vendor.uuid !== e.uuid) {
                target.productionBatch = undefined;
            }
            target.vendor = JSON.parse(e);
        } else if (fieldName === 'productionBatch') {
            target.productionBatch = e;
        } else if (fieldName === 'binCode') {
            if (target.binCode != JSON.parse(e).code) {
                target.containerBarcode = undefined;
            }
            target.binCode = JSON.parse(e).code;
            target.binUsage = JSON.parse(e).usage;
            if (binUsage.PickUpBin.name === target.binUsage || binUsage.PickUpStorageBin.name === target.binUsage)
                target.containerBarcode = '-';
        } else if (fieldName === 'containerBarcode') {
            let containerBarcode = target.type && target.type === Type.LESSALC.name ? JSON.parse(e).barcode : e;
            target.containerBarcode = containerBarcode;
        } else if (fieldName === 'qtyStr') {
            target.qtyStr = e;
            target.qty = qtyStrToQty(e.toString(), target.qpcStr);
        }

        this.setState({
            entity: { ...entity },
        })
    }

    drawTable = () => {
        const { entity } = this.state;

        const columns = [
            {
                title: alcDiffLocal.type,
                dataIndex: 'type',
                key: 'type',
                width: itemColWidth.qtyStrEditColWidth,
                render: (text, record) => {
                    return (
                        <Select className={style.editWrapper}
                            value={record.type}
                            title={placeholderChooseLocale(alcDiffLocal.type)}
                            placeholder={placeholderChooseLocale(alcDiffLocal.type)}
                            onChange={e => this.handleFieldChange(e, 'type', record.line)}>
                            {typeOptions}
                        </Select>
                    );
                }
            },
            {
                title: commonLocale.inArticleLocale,
                dataIndex: 'article',
                key: 'article',
                width: itemColWidth.articleEditColWidth,
                render: (text, record) => {
                    return (
                        <Select
                            value={record.article ? '[' + record.article.articleCode + ']' + record.article.articleName : undefined}
                            placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
                            onChange={e => this.handleFieldChange(e, 'article', record.line)}>
                            {this.getArticleOptions(record.line)}
                        </Select>
                    );
                }
            },
            {
                title: commonLocale.inQpcAndMunitLocale,
                dataIndex: 'qpcStr',
                key: 'qpcStr',
                width: itemColWidth.qpcStrEditColWidth,
                render: (text, record) => {
                    return (
                        <Select value={record.qpcStr && record.article ? record.qpcStr + '/' + record.article.munit : undefined}
                            placeholder={placeholderChooseLocale(commonLocale.qpcStrLocale)}
                            onChange={e => this.handleFieldChange(e, 'qpcStr', record.line)}>
                            {this.getQpcStrOptions(record.line)}
                        </Select>
                    );
                },
            },
            {
                title: commonLocale.inAllPlanQtyLocale,
                dataIndex: 'planQty',
                key: 'planQty',
                width: itemColWidth.qtyColWidth,
                render: (text, record) => {
                    return (<span>{this.getPlanQty(record)}</span>);
                },
            },
            {
                title: commonLocale.inStockBatchLocale,
                dataIndex: 'stockBatch',
                key: 'stockBatch',
                width: itemColWidth.qtyColWidth,
                render: (text, record) => {
                    return (<span>{this.getStockBatch(record) ? this.getStockBatch(record) : '-'}</span>);
                },
            },
            {
                title: commonLocale.inVendorLocale,
                dataIndex: 'vendor',
                key: 'vendor',
                width: itemColWidth.articleEditColWidth,
                render: (text, record) => {
                    return (
                        <Select value={record.vendor ? convertCodeName(record.vendor) : undefined}
                            placeholder={placeholderChooseLocale(commonLocale.inVendorLocale)}
                            onChange={e => this.handleFieldChange(e, 'vendor', record.line)}>
                            {this.getVendorOptions(record.line)}
                        </Select>
                    );
                }
            },
            {
                title: commonLocale.inProductionBatchLocale,
                dataIndex: 'productionBatch',
                key: 'productionBatch',
                width: itemColWidth.containerEditColWidth,
                render: (value, record) => {
                    var productionBatch = this.getProductionBatch(record);
                    if (productionBatch)
                        return (<span>{productionBatch}</span>)
                    else
                        return (
                            <Select value={record.productionBatch ? record.productionBatch : undefined}
                                placeholder={placeholderChooseLocale(commonLocale.inProductionBatchLocale)}
                                onChange={(e) => this.handleFieldChange(e, 'productionBatch', record.line)}>
                                {this.getProductionBatchOptions(record.line)}
                            </Select>
                        );
                },
            },
            {
                title: commonLocale.inBinCodeLocale,
                dataIndex: 'binCode',
                key: 'binCode',
                width: itemColWidth.binCodeEditColWidth,
                render: (text, record) => {
                    if (record.type && Type.MOREALC.name === record.type) {
                        return (
                            <Select value={record.binCode ? record.binCode + '[' + binUsage[record.binUsage].caption + ']' : undefined}
                                placeholder={placeholderChooseLocale(commonLocale.inBinCodeLocale)}
                                onChange={(e) => this.handleFieldChange(e, 'binCode', record.line)}>
                                {this.getBinCodeOptions(record.line)}
                            </Select>
                        );
                    } else {
                        let bin = undefined;
                        if (!record.binCode)
                            bin = this.getPickUpBin(record.line);
                        return (
                            <BinSelect
                                getUsage={true}
                                value={record.binCode ? JSON.stringify({ code: record.binCode, usage: record.binUsage }) :
                                    bin ? JSON.stringify(bin) : undefined}
                                states={[binState.FREE.name, binState.USING.name]}
                                wrhUuid={entity.wrh ? entity.wrh.uuid : undefined}
                                usages={[binUsage.PickUpBin.name, binUsage.PickUpStorageBin.name, binUsage.StorageBin.name, binUsage.Virtuality.name]}
                                onChange={e => this.handleFieldChange(e, 'binCode', record.line)}
                                placeholder={placeholderLocale(commonLocale.inBinCodeLocale)} />
                        );
                    }
                },
            },
            {
                title: commonLocale.inContainerBarcodeLocale,
                dataIndex: 'containerBarcode',
                key: 'containerBarcode',
                width: itemColWidth.containerEditColWidth,
                render: (text, record) => {
                    if (record.type && Type.MOREALC.name === record.type) {
                        if (record.binUsage && (binUsage.PickUpBin.name === record.binUsage
                            || binUsage.PickUpStorageBin.name === record.binUsage)) {
                            return <span>{'-'}</span>;
                        }
                        return (
                            <Select value={record.containerBarcode}
                                placeholder={placeholderChooseLocale(commonLocale.inContainerBarcodeLocale)}
                                onChange={(e) => this.handleFieldChange(e, 'containerBarcode', record.line)}>
                                {this.getContainerOptions(record.line)}
                            </Select>
                        );
                    } else {
                        if (!record.binUsage)
                            return <span>{record.containerBarcode ? record.containerBarcode : <Empty />}</span>
                        if (record.binUsage === binUsage.PickUpBin.name ||
                            record.binUsage === binUsage.PickUpStorageBin.name) {
                            record.containerBarcode = '-';
                            return (<span>{record.containerBarcode}</span>);
                        } else {
                            return (
                                <LessContainerSelect
                                    value={record.containerBarcode ? record.containerBarcode : null}
                                    binCode={record.binCode}
                                    onChange={e => this.handleFieldChange(e, 'containerBarcode', record.line)}
                                    placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)}
                                />
                            );
                        }
                    }
                },
            },
            {
                title: commonLocale.inQtyStrLocale,
                dataIndex: 'qtyStr',
                key: 'qtyStr',
                width: itemColWidth.qtyStrEditColWidth,
                render: (text, record) => {
                    return (
                        <QtyStrInput
                            value={record.qtyStr}
                            onChange={e => this.handleFieldChange(e, 'qtyStr', record.line)}
                            placeholder={placeholderLocale(commonLocale.inQtyStrLocale)}
                        />
                    );
                }
            },
            {
                title: commonLocale.inQtyLocale,
                key: 'qty',
                width: itemColWidth.qtyColWidth,
                render: (text, record) => <span>{record.qty}</span>
            },
        ];

        return (
            <ItemEditTable
                title={commonLocale.inArticleLocale}
                columns={columns}
                data={this.state.entity.items ? this.state.entity.items : []}
                scroll={{ x: 2100 }} />
        )
    }
}
