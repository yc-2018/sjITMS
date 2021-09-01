import CFormItem from '@/pages/Component/Form/CFormItem';
import FormPanel from '@/pages/Component/Form/FormPanel';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import CreatePage from '@/pages/Component/Page/CreatePage';
import BinSelect from '@/pages/Component/Select/BinSelect';
import VendorSelect from '@/pages/Component/Select/VendorSelect';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import UserSelect from '@/pages/Component/Select/UserSelect';
import { binState } from '@/utils/BinState';
import { binUsage } from '@/utils/BinUsage';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { commonLocale, notNullLocale, placeholderChooseLocale, placeholderLocale } from '@/utils/CommonLocale';
import { STATE } from '@/utils/constants';
import { getDefOwner, loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import { add, toQtyStr, accMul, accDiv, accAdd } from '@/utils/QpcStrUtil';
import { Form, Input, message, Select, Modal } from 'antd';
import { connect } from 'dva';
import { vendorHandoverLocale } from './VendorHandoverBillLocale';
import { orgType } from '@/utils/OrgType';
import PanelItemBatchAdd from '@/pages/Component/Form/PanelItemBatchAdd';
import SearchFormItemBatchAdd from './SearchFormItemBatchAdd';
import { stockState } from '@/utils/StockState';
import VendorHandoverContainerSelect from './VendorHandoverContainerSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import { VENDORHANDOVER_RES } from './VendorHandoverBillPermission';

const { TextArea } = Input;
@connect(({ vendorHandover, stock, loading }) => ({
    vendorHandover,
    stock,
    loading: loading.models.vendorHandover,
}))
@Form.create()
export default class VendorHandoverBillCreatePage extends CreatePage {
    constructor(props) {
        super(props);

        this.state = {
            title: commonLocale.createLocale + vendorHandoverLocale.title,
            entity: {
                owner: getDefOwner(),
                items: []
            },
            handover: {
                uuid: loginUser().uuid,
                code: loginUser().code,
                name: loginUser().name
            },
            items: [],
            stocks: [],
            batchBinInfos: [],
            auditButton: true,
            batchAddVisible: false,
            auditPermission: VENDORHANDOVER_RES.AUDIT,
            pageFilter: {
                page: 0,
                pageSize: 10,
                searchKeyValues: {
                    companyUuid: loginCompany().uuid,
                    dcUuid: loginOrg().uuid,
                    state: stockState.NORMAL.name,
                    binUsages: [binUsage.VendorRtnCollectBin.name],
                }
            },
        }
    }
    componentDidMount() {
        this.refresh();
    }

    componentWillReceiveProps(nextProps) {
        const { stocks, batchBinInfos } = this.state;

        if (nextProps.vendorHandover.entity && this.props.vendorHandover.entityUuid) {
            this.setState({
                entity: nextProps.vendorHandover.entity,
                items: nextProps.vendorHandover.entity.items,
                title: vendorHandoverLocale.title + '：' + nextProps.vendorHandover.entity.billNumber,
            });

            if (nextProps.vendorHandover.entity && nextProps.vendorHandover.entity.items
                && this.props.vendorHandover.entityUuid && !this.state.entity.uuid) {
                const that = this;
                nextProps.vendorHandover.entity.items.forEach(function (item) {
                    that.queryStock(item.binCode);
                });
            }
        }

        if (nextProps.stock.stocks) {
            nextProps.stock.stocks.forEach(function (stock) {
                var exist = stocks.some(function (e) {
                    return e.uuid === stock.uuid;
                })

                if (!exist)
                    stocks.push(stock);
            });

            this.setState({
                stocks: stocks
            });
        }

        if (nextProps.stock.data && nextProps.stock.data.list) {
            let containerBins = [];
            let containerInfos = [];

            let articles = [];
            nextProps.stock.data.list && nextProps.stock.data.list.forEach(function (e) {
                if (e.binCode && e.containerBarcode) {
                    let eAmount = accMul(e.price, e.qty);
                    let eWeight = accDiv(accMul(e.weight, e.qty), 1000);
                    let eVolume = accDiv(accMul(e.volume, e.qty), 1000000);
                    let containerInfo = containerInfos[e.binCode + e.containerBarcode];
                    if (!containerInfo) {
                        containerInfo = {
                            binCode: e.binCode,
                            binUsage: e.binUsage,
                            containerBarcode: e.containerBarcode,
                            wrhUuid: e.wrhUuid,
                            qtyStr: toQtyStr(e.qty, e.qpcStr),
                            articleItemCount: 1,
                            amount: eAmount,
                            weight: eWeight,
                            volume: eVolume,
                        }

                        containerInfos[e.binCode + e.containerBarcode] = containerInfo;
                        containerBins.push(e.binCode + e.containerBarcode);
                        articles.push(e.article.articleUuid);
                    } else {
                        let articleItemCount = containerInfo.articleItemCount
                        if (articles.indexOf(e.article.articleUuid) === -1) {
                            articleItemCount = articleItemCount + 1;
                            articles.push(e.article.articleUuid);
                        }

                        let binCode = e.binCode;
                        let containerBarcode = e.containerBarcode;
                        let wrhUuid = e.wrhUuid;
                        let qtyStr = add(toQtyStr(e.qty, e.qpcStr), containerInfo.qtyStr);
                        let amount = accAdd(containerInfo.amount, eAmount);
                        let weight = accAdd(containerInfo.weight, eWeight);
                        let volume = accAdd(containerInfo.volume, eVolume);
                        containerInfo = {
                            binCode: e.binCode,
                            binUsage: e.binUsage,
                            containerBarcode: containerBarcode,
                            wrhUuid: wrhUuid,
                            qtyStr: qtyStr,
                            articleItemCount: articleItemCount,
                            amount: amount,
                            weight: weight,
                            volume: volume,
                        }

                        containerInfos[e.containerBarcode] = containerInfo;
                    }
                }
            });

            let containerTotalInfos = [];
            containerBins && containerBins.forEach(function (e) {
                if (containerInfos && containerInfos[e]) {
                    containerTotalInfos.push(containerInfos[e]);
                }
            });

            this.setState({
                batchBinInfos: {
                    list: containerTotalInfos,
                    pagination: {
                        total: containerTotalInfos.length,
                        pageSize: nextProps.stock.data.pagination.pageSize,
                        current: nextProps.stock.data.pagination.current,
                        showTotal: total => `共 ${total} 条`,
                    },
                }
            })
        }
    }

    queryStock = (binCode) => {
        if (!binCode)
            return;
        const ownerUuid = this.state.entity.owner ? this.state.entity.owner.uuid : null;
        const vendorUuid = this.state.entity.vendor ? this.state.entity.vendor.uuid : null;

        this.props.dispatch({
            type: 'stock/query',
            payload: {
                companyUuid: loginCompany().uuid,
                dcUuid: loginOrg().uuid,
                binCode: binCode,
                ownerUuid: ownerUuid,
                vendorUuid: vendorUuid
            }
        });
    }

    /**
     * 刷新
     */
    refresh = () => {
        this.props.dispatch({
            type: 'vendorHandover/get',
            payload: this.props.vendorHandover.entityUuid
        });
    }

    queryStocks = () => {
        this.props.dispatch({
            type: 'stock/pageQuery',
            payload: {
                ...this.state.pageFilter.searchKeyValues
            }
        })
    }

    /**
  * 取消
  */
    onCancel = () => {
        if (!this.props.vendorHandover.entityUuid) {
            this.props.dispatch({
                type: 'vendorHandover/showPage',
                payload: {
                    showPage: 'query'
                }
            });
        } else {
            this.props.dispatch({
                type: 'vendorHandover/showPage',
                payload: {
                    showPage: 'view',
                    entityUuid: this.props.vendorHandover.entityUuid
                }
            });
        }
    }

    validate = (data) => {
        const { entity } = this.state;

        let bill = {
            ...entity,
        };
        bill.handover = JSON.parse(data.handover);
        bill.note = data.note;
        bill.companyUuid = loginCompany().uuid;
        bill.dcUuid = loginOrg().uuid;

        if (bill.items.length === 0) {
            message.error('供应商交接单明细不能为空');
            return false;
        }

        for (let i = bill.items.length - 1; i >= 0; i--) {
            if (!bill.items[i].binCode) {
                message.error(`第${bill.items[i].line}行货位不能为空！`);
                return false;
            }

            if (!bill.items[i].containerBarcode) {
                message.error(`第${bill.items[i].line}行容器条码不能为空！`);
                return false;
            }
        }

        for (let i = 0; i < bill.items.length; i++) {
            for (let j = i + 1; j < bill.items.length; j++) {
                if (bill.items[i].containerBarcode === bill.items[j].containerBarcode &&
                    bill.items[i].binCode === bill.items[j].binCode) {
                    message.error(`第${bill.items[i].line}行与第${bill.items[j].line}行重复！`);
                    return false;
                }
            }
        }

        return bill;
    }

    /**
     * 保存
     */
    onSave = (data) => {
        let bill = this.validate(data);
        if (!bill)
            return;

        if (!bill.uuid) {
            this.props.dispatch({
                type: 'vendorHandover/save',
                payload: bill,
                callback: (response) => {
                    if (response && response.success) {
                        message.success(commonLocale.saveSuccessLocale);
                    }
                }
            });
        } else {
            this.props.dispatch({
                type: 'vendorHandover/modify',
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
        let bill = this.validate(data);
        if (!bill)
            return;

        this.props.dispatch({
            type: 'vendorHandover/onSaveAndAudit',
            payload: bill,
            callback: (response) => {
                if (response && response.success) {
                    message.success(commonLocale.saveAndAuditSuccess);
                }
            }
        });
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
                    entity.vendor = undefined;
                    entity.wrh = undefined;
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

    handlechangeVendor = (value) => {
        const { entity } = this.state;

        if (entity.vendor && entity.vendor !== JSON.parse(value)) {
            Modal.confirm({
                title: '修改供应商会清空明细，请确认修改？',
                okText: '确认',
                cancelText: '取消',
                onOk: () => {
                    this.props.form.resetFields();
                    entity.vendor = JSON.parse(value);
                    entity.items = [];

                    this.setState({
                        entity: entity,
                        items: []
                    });
                },
            });
        } else {
            entity.vendor = JSON.parse(value);
            this.setState({
                entity: entity
            })
        }
    }

    handlechangeWrh = (value) => {
        const { entity } = this.state;

        if (entity.wrh && entity.wrh !== JSON.parse(value)) {
            Modal.confirm({
                title: '修改仓位会清空明细，请确认修改？',
                okText: '确认',
                cancelText: '取消',
                onOk: () => {
                    this.props.form.resetFields();
                    entity.wrh = JSON.parse(value);
                    entity.items = [];

                    this.setState({
                        entity: entity,
                        items: []
                    });
                },
            });
        } else {
            entity.wrh = JSON.parse(value);
            this.setState({
                entity: entity
            })
        }
    }

    getContainers = (line) => {
        const { stocks, entity } = this.state;
        let containers = [];
        let containerInfos = [];

        if (!entity.items[line - 1]
            || !entity.items[line - 1].binCode
            || !entity.owner || !entity.vendor
        ) {
            return containerInfos;
        }

        let articles = [];
        stocks && stocks.forEach(function (e) {
            if (e.binCode === entity.items[line - 1].binCode &&
                e.owner.uuid === entity.owner.uuid &&
                e.vendor.uuid === entity.vendor.uuid &&
                e.containerBarcode) {

                let eAmount = accMul(e.price, e.qty);
                let eWeight = accDiv(accMul(e.weight, e.qty), 1000);
                let eVolume = accDiv(accMul(e.volume, e.qty), 1000000);
                let containerInfo = containerInfos[e.containerBarcode];
                if (!containerInfo) {
                    containerInfo = {
                        containerBarcode: e.containerBarcode,
                        wrhUuid: e.wrhUuid,
                        qtyStr: toQtyStr(e.qty, e.qpcStr),
                        articleItemCount: 1,
                        amount: eAmount,
                        weight: eWeight,
                        volume: eVolume,
                    }

                    containerInfos[e.containerBarcode] = containerInfo;
                    containers.push(e.containerBarcode);
                    articles.push(e.article.articleUuid);
                } else {
                    let articleItemCount = containerInfo.articleItemCount
                    if (articles.indexOf(e.article.articleUuid) === -1) {
                        articleItemCount = articleItemCount + 1;
                        articles.push(e.article.articleUuid);
                    }

                    let containerBarcode = e.containerBarcode;
                    let wrhUuid = e.wrhUuid;
                    let qtyStr = add(toQtyStr(e.qty, e.qpcStr), containerInfo.qtyStr);
                    let amount = accAdd(containerInfo.amount, eAmount);
                    let weight = accAdd(containerInfo.weight, eWeight);
                    let volume = accAdd(containerInfo.volume, eVolume);
                    containerInfo = {
                        containerBarcode: containerBarcode,
                        wrhUuid: wrhUuid,
                        qtyStr: qtyStr,
                        articleItemCount: articleItemCount,
                        amount: amount,
                        weight: weight,
                        volume: volume,
                    }

                    containerInfos[e.containerBarcode] = containerInfo;
                }
            }
        });

        let containerTotalInfos = [];
        containers && containers.forEach(function (e) {
            if (containerInfos && containerInfos[e]) {
                containerTotalInfos.push(containerInfos[e]);
            }
        });
        if (containerTotalInfos.length === 1) {
            entity.items[line - 1].containerBarcode = containerTotalInfos[0].containerBarcode;
            entity.items[line - 1].wrhUuid = containerTotalInfos[0].wrhUuid;
            entity.items[line - 1].qtyStr = containerTotalInfos[0].containerBarcode;
            entity.items[line - 1].articleItemCount = containerTotalInfos[0].articleItemCount;
            entity.items[line - 1].amount = containerTotalInfos[0].amount;
            entity.items[line - 1].weight = containerTotalInfos[0].weight;
            entity.items[line - 1].volume = containerTotalInfos[0].volume;
        }
        return containerTotalInfos;
    }

    getContainerOptions = (line) => {
        let containerOptions = [];
        this.getContainers(line).forEach(function (e) {
            containerOptions.push(
                <Select.Option key={JSON.stringify(e)} value={JSON.stringify(e)}>
                    {e.containerBarcode}</Select.Option>
            );
        });
        return containerOptions;
    }

    /**
   * 表格变化时
   * @param {*} e
   * @param {*} fieldName
   * @param {*} key
   */
    handleFieldChange(e, fieldName, line) {
        const { entity, items } = this.state;
        if (fieldName === 'binCode') {
            if (entity.items[line - 1] && entity.items[line - 1].binCode &&
                entity.items[line - 1].binCode !== JSON.parse(e).bincode) {
                entity.items[line - 1].containerBarcode = undefined;
                entity.items[line - 1].wrhUuid = undefined;
                entity.items[line - 1].qtyStr = undefined;
                entity.items[line - 1].articleItemCount = undefined;
                entity.items[line - 1].amount = undefined;
                entity.items[line - 1].weight = undefined;
                entity.items[line - 1].volume = undefined;
            }

            entity.items[line - 1].binCode = JSON.parse(e).bincode;
            this.queryStock(JSON.parse(e).bincode);
        } else if (fieldName === 'containerBarcode') {
            entity.items[line - 1].containerBarcode = JSON.parse(e).containerBarcode;
            entity.items[line - 1].wrhUuid = JSON.parse(e).wrhUuid;
            entity.items[line - 1].qtyStr = JSON.parse(e).qtyStr;
            entity.items[line - 1].articleItemCount = JSON.parse(e).articleItemCount;
            entity.items[line - 1].amount = JSON.parse(e).amount;
            entity.items[line - 1].weight = JSON.parse(e).weight;
            entity.items[line - 1].volume = JSON.parse(e).volume;
        }

        this.setState({
            entity: { ...entity }
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
                        <WrhSelect
                        onChange={this.handlechangeWrh}
                        placeholder={placeholderLocale(commonLocale.inWrhLocale)} />
                    )
                }
            </CFormItem>,
            <CFormItem key='vendor' label={commonLocale.inVendorLocale}>
                {
                    getFieldDecorator('vendor', {
                        initialValue: entity ? (entity.vendor ? JSON.stringify(entity.vendor) : undefined) : undefined,
                        rules: [
                            { required: true, message: notNullLocale(commonLocale.inVendorLocale) }
                        ],
                    })(
                        <VendorSelect
                            ownerUuid={entity.owner && entity.owner.uuid ? entity.owner.uuid : ''}
                            state={STATE.ONLINE}
                            single
                            onChange={this.handlechangeVendor}
                            placeholder={placeholderChooseLocale(commonLocale.inVendorLocale)}
                        />
                    )
                }
            </CFormItem>,
            <CFormItem label={vendorHandoverLocale.handover} key='handover'>
                {getFieldDecorator('handover', {
                    initialValue: JSON.stringify(entity.handover && entity.handover.uuid ?
                        entity.handover : this.state.handover),
                    rules: [
                        {
                            required: true,
                            message: notNullLocale(vendorHandoverLocale.handover)
                        }
                    ],
                })(<UserSelect autoFocus single={true} />)}
            </CFormItem>,
        ];

        return [
            <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={basicCols} />,
        ];
    }

    /**
     * 绘制明细表格
     */
    drawTable = () => {
        const { getFieldDecorator } = this.props.form;
        const { entity, items } = this.state;
        let articleCols = [
            {
                title: commonLocale.bincodeLocale,
                key: 'binCode',
                width: colWidth.codeColWidth,
                render: (record) => {
                    return <VendorHandoverContainerSelect
                        value={record.binCode}
                        ownerUuid={entity && entity.owner ? entity.owner.uuid : undefined}
                        vendorUuid={entity && entity.vendor ? entity.vendor.uuid : undefined}
                        wrhUuid={entity && entity.wrh ? entity.wrh.uuid : undefined}
                        onChange={e => this.handleFieldChange(e, 'binCode', record.line)}
                        placeholder={placeholderLocale(commonLocale.bincodeLocale)}
                        disabled={false}
                    />
                }
            }, {
                title: commonLocale.containerLocale,
                dataIndex: 'containerBarcode',
                key: 'containerBarcode',
                width: itemColWidth.containerEditColWidth,
                render: (text, record) => {
                    if (this.getContainers(record.line).length === 1) {
                        let containerInfo = this.getContainers(record.line)[0];
                        record.containerBarcode = containerInfo.containerBarcode;
                        record.wrhUuid = containerInfo.wrhUuid,
                            record.qtyStr = containerInfo.qtyStr;
                        record.articleItemCount = containerInfo.articleItemCount;
                        record.amount = containerInfo.amount;
                        record.weight = containerInfo.weight;
                        record.volume = containerInfo.volume;

                        return <span>{record.containerBarcode}</span>
                    }
                    return (
                        <Select
                            value={record.containerBarcode}
                            placeholder={placeholderChooseLocale(commonLocale.inContainerBarcodeLocale)}
                            onChange={e => this.handleFieldChange(e, 'containerBarcode', record.line)}>
                            {this.getContainerOptions(record.line)}
                        </Select>
                    );
                },
            },
            {
                title: commonLocale.inAllQtyStrLocale,
                key: 'qtyStr',
                width: itemColWidth.qtyStrColWidth,
                render: (text, record) => <span>{record.qtyStr
                    ? record.qtyStr : '0'}</span>
            }, {
                title: commonLocale.inAllArticleCountLocale,
                key: 'articleItemCount',
                width: itemColWidth.qtyStrColWidth,
                render: (text, record) => <span>{record.articleItemCount
                    ? record.articleItemCount : 0}</span>
            }, {
                title: commonLocale.inAllAmountLocale,
                key: 'amount',
                width: itemColWidth.qtyStrColWidth,
                render: (text, record) => <span>{record.amount
                    ? record.amount : 0}</span>
            }, {
                title: commonLocale.inAllWeightLocale,
                key: 'weight',
                width: itemColWidth.qtyStrColWidth,
                render: (text, record) => <span>{record.weight
                    ? record.weight : 0}</span>
            }, {
                title: commonLocale.inAllVolumeLocale,
                key: 'volume',
                width: itemColWidth.qtyStrColWidth,
                render: (text, record) => <span>{record.volume
                    ? record.volume : 0}</span>
            },
        ];

        let batchQueryResultColumns = [
            {
                title: commonLocale.containerLocale,
                key: 'containerBarcode',
                dataIndex: 'containerBarcode',
                width: colWidth.codeColWidth,
            },
            {
                title: commonLocale.bincodeLocale,
                key: 'binCode',
                dataIndex: 'binCode',
                width: colWidth.codeColWidth,
            }, {
                title: commonLocale.inBinUsageLocale,
                key: 'binUsage',
                dataIndex: 'binUsage',
                render: (text) => text ? binUsage[text].caption : null,
                width: colWidth.enumColWidth,
            },
        ];

        return (
            <div>
                <ItemEditTable
                    scroll={{ x: 1500 }}
                    title='添加明细'
                    columns={articleCols}
                    data={entity.items ? entity.items : []}
                    drawBatchButton={this.drawBatchButton}
                />
                <PanelItemBatchAdd
                    searchPanel={<SearchFormItemBatchAdd refresh={this.onSearch} fieldsValue={''} />}
                    visible={this.state.batchAddVisible}
                    columns={batchQueryResultColumns}
                    data={this.state.batchBinInfos}
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
        let ownerUuid = entity && entity.owner ? entity.owner.uuid : undefined;
        let vendorUuid = entity && entity.vendor ? entity.vendor.uuid : undefined;
        let wrhUuid = entity && entity.wrh ? entity.wrh.uuid : undefined;
        if (!ownerUuid || !vendorUuid || !wrhUuid) {
            return;
        }
        if (data) {
            pageFilter.searchKeyValues = {
                ...pageFilter.searchKeyValues,
                page: 0,
                pageSize: 10,
                companyUuid: loginCompany().uuid,
                dcUuid: loginOrg().uuid,
                ownerUuid: ownerUuid,
                vendorUuid: vendorUuid,
                wrhUuid: wrhUuid,
                state: stockState.NORMAL.name,
                binUsages: [binUsage.VendorRtnCollectBin.name],
                ...data
            }
        } else {
            pageFilter.searchKeyValues = {
                page: 0,
                pageSize: 10,
                companyUuid: loginCompany().uuid,
                dcUuid: loginOrg().uuid,
                ownerUuid: ownerUuid,
                vendorUuid: vendorUuid,
                wrhUuid: wrhUuid,
                state: stockState.NORMAL.name,
                binUsages: [binUsage.VendorRtnCollectBin.name],
            }
        }
        this.queryStocks();
    }

    tableChange = (pagination, filtersArg, sorter) => {
        const { pageFilter } = this.state;
        pageFilter.searchKeyValues.page = pagination.current - 1;
        pageFilter.searchKeyValues.pageSize = pagination.pageSize;

        this.setState({
            pageFilter: pageFilter
        })

        this.queryStocks();
    }

    /**获取批量增加的集合*/
    getItemList = (value) => {
        const { entity, items } = this.state;

        var newList = [];
        let line = items.length;
        for (let i = 0; i < value.length; i++) {
            if (entity && entity.items && entity.items.find(function (item) {
                return item.article && item.article.articleUuid === value[i].uuid
            }) === undefined) {
                entity.items[line] = {
                    binCode: value[i].binCode,
                    binUsage: value[i].binUsage,
                    containerBarcode: value[i].containerBarcode,
                    wrhUuid: value[i].wrhUuid,
                    qtyStr: value[i].qtyStr,
                    articleItemCount: value[i].articleItemCount,
                    amount: value[i].amount,
                    weight: value[i].weight,
                    volume: value[i].volume,
                    line: line + 1
                }

                this.queryStock(value[i].binCode);
                line++;
            }
        }

        this.setState({
            entity: { ...entity }
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
