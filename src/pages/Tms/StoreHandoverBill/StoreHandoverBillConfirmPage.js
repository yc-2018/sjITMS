import { connect } from 'dva';
import moment from 'moment';
import { isArray, format } from 'util';
import { Form, Select, Input, InputNumber, message, DatePicker, Modal, Tabs } from 'antd';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { STATE } from '@/utils/constants';
import { loginCompany, loginOrg, getDefOwner } from '@/utils/LoginContext';
import { convertCodeName, formatDate } from '@/utils/utils';
import { qtyStrToQty, add } from '@/utils/QpcStrUtil';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { storeHandoverLocale } from './StoreHandoverBillLocale';
import { MAX_DECIMAL_VALUE } from '@/utils/constants';
import { CollectBinReviewType, ContainerRecycleType, State } from './StoreHandoverBillContants';
import Empty from '@/pages/Component/Form/Empty';
import { compare } from '@/utils/QpcStrUtil';
import ReturnDcTypeSelect from './ReturnDcTypeSelect';

const { TextArea } = Input;
const TabPane = Tabs.TabPane;
@connect(({ storeHandover, loading }) => ({
    storeHandover,
    loading: loading.models.storeHandover,
}))
@Form.create()
export default class StoreHandoverBillConfirmPage extends CreatePage {
    constructor(props) {
        super(props);

        this.state = {
            noNote: true,
            title: commonLocale.createLocale + storeHandoverLocale.title,
            entity: {},
        }
    }
    componentDidMount() {
        this.refresh();
    }

    componentWillReceiveProps(nextProps) {
        const { articles } = this.state;

        if (nextProps.storeHandover.entity && this.props.storeHandover.entityUuid
            && nextProps.storeHandover.entity.uuid === this.props.storeHandover.entityUuid) {
            this.setState({
                entity: nextProps.storeHandover.entity,
                items: nextProps.storeHandover.entity.items,
                title: storeHandoverLocale.title + '：' + nextProps.storeHandover.entity.billNumber,
            });
        }
    }

    /**
     * 刷新
     */
    refresh = () => {
        if (this.props.storeHandover.entityUuid)
            this.props.dispatch({
                type: 'storeHandover/get',
                payload: this.props.storeHandover.entityUuid
            });
    }
    /**
    * 取消
    */
    onCancel = () => {
        this.props.dispatch({
            type: 'storeHandover/showPage',
            payload: {
                showPage: 'query'
            }
        });
    }

    /**
    * 查看详情
    */
    onView = (uuid) => {
        this.props.dispatch({
            type: 'storeHandover/showPage',
            payload: {
                showPage: 'view',
                entityUuid: uuid
            }
        });
    }
    /**
     * 保存
     */
    onSave = () => {
        const { entity, items } = this.state;

        const results = [];
        entity.items && entity.items.forEach(function (e) {
            if (State.UNHANDOVER.name === State[entity.state].name) {
                let result = {
                    handoverItem: {
                        uuid: e.handoverItem.uuid,
                        code: e.handoverItem.code,
                        name: e.handoverItem.name
                    },
                    type: e.type,
                    realQtyStr: e.realQtyStr
                }
                results.push(result);
            }
        });

        const recycleResults = [];
        entity.recycleItems && entity.recycleItems.forEach(function (e) {
            let result = {
                containerType: {
                    uuid: e.containerType.uuid,
                    code: e.containerType.code,
                    name: e.containerType.name
                },
                type: e.recycleType,
                realQty: e.realQty
            }
            recycleResults.push(result);
        });

        if (recycleResults.length === 0 && results.length === 0 && (!entity.returnDcItems || entity.returnDcItems.length === 0)) {
            message.success(commonLocale.modifySuccessLocale);
            this.onView(entity.uuid);
            return;
        }

        if (entity.returnDcItems) {
            let normal = this.validReturnDcItems(entity.returnDcItems);
            if (normal != true) {
                return;
            }
        }

        this.props.dispatch({
            type: 'storeHandover/modify',
            payload: {
                uuid: entity.uuid,
                version: entity.version,
                recycleResult: recycleResults,
                result: results,
                returnDcItems: entity.returnDcItems
            },
            callback: (response) => {
                if (response && response.success) {
                    message.success(commonLocale.modifySuccessLocale);
                    this.onView(entity.uuid);
                }
            }
        });

    }

    validReturnDcItems = (returnDcItems) => {
        for (let i = 0; i < returnDcItems.length; i++) {
            for (let j = i + 1; j < returnDcItems.length; j++) {
                if (returnDcItems[i].returnDcItemUuid === returnDcItems[j].returnDcItemUuid) {
                    message.error(`返配明细第${returnDcItems[i].line}行与第${returnDcItems[j].line}行重复！`);
                    return false;
                }
            }
        }

        for (let i = returnDcItems.length - 1; i >= 0; i--) {

            if (!returnDcItems[i].returnDcItemUuid) {
                message.error(`返配明细第${returnDcItems[i].line}行返配类型不能为空！`);
                return false;
            }

            if (!returnDcItems[i].qtyStr) {
                message.error(`返配明细第${returnDcItems[i].line}行返配件数不能为空！`);
                return false;
            }

            if (returnDcItems[i].qtyStr <= 0) {
                message.error(`返配明细第${returnDcItems[i].line}行返配件数必须大于0！`);
                return false;
            }
        }

        return true;
    }

    /**
   * 交接表格变化时
   * @param {*} e 
   * @param {*} fieldName 
   * @param {*} key 
   */
    handleHandoverFieldChange(e, fieldName, line) {
        const { entity } = this.state;
        console.log(e.nativeEvent)
        if (fieldName === 'realQtyStr') {
            entity.items && entity.items.forEach(function (item) {
                if (item.line === line) {
                    item.realQtyStr = e.nativeEvent.target.defaultValue.replace(/\s*/g, '');
                }
            })
            // entity.items[line - 1].realQtyStr = e.nativeEvent.target.defaultValue.replace(/\s*/g, '');
        }

        this.setState({
            entity: { ...entity }
        })
        console.log(this.state.entity)
    }

    /**
   * 容器回收表格变化时
   * @param {*} e 
   * @param {*} fieldName 
   * @param {*} key 
   */
    handleRecycleFieldChange(e, fieldName, line) {
        const { entity } = this.state;
        if (fieldName === 'realQty') {
            entity.recycleItems[line - 1].realQty = e;
        }

        this.setState({
            entity: { ...entity }
        })
    }

    /**
    * 返配表格变化时
    * @param {*} e 
    * @param {*} fieldName 
    * @param {*} key 
    */
    handleReturnDcFieldChange(e, fieldName, line) {
        const { entity } = this.state;

        let returnDcItems = entity.returnDcItems ? entity.returnDcItems : [];
        let returnDcItem = returnDcItems[line - 1] ? returnDcItems[line - 1] : {};
        returnDcItem.line = line;

        if (fieldName === 'returnDcType') {
            let returnDcType = JSON.parse(e);
            returnDcItem.returnDcItemUuid = returnDcType.uuid;
            returnDcItem.returnDcItemName = returnDcType.name;
        } else if (fieldName === 'qtyStr') {
            returnDcItem.qtyStr = e;
        }
        returnDcItems[line - 1] = returnDcItem;
        entity.returnDcItems = returnDcItems;

        this.setState({
            entity: { ...entity }
        })
    }

    /**
     * 绘制表单
     */
    drawFormItems = () => {
        const { getFieldDecorator } = this.props.form;
        const { entity } = this.state;

        let basicCols = [
            <CFormItem key='billNumber' label={commonLocale.billNumberLocal}>
                {
                    getFieldDecorator('billNumber')(<span>{entity.billNumber}</span>)
                }
            </CFormItem>,
            <CFormItem key='shipBillNumber' label={storeHandoverLocale.shipBillNumber}>
                {
                    getFieldDecorator('shipBillNumber')(<span>{entity.shipBillNumber}</span>)
                }
            </CFormItem>,
            <CFormItem key='store' label={commonLocale.inStoreLocale}>
                {
                    getFieldDecorator('store')(<span>{convertCodeName(entity.store)}</span>)
                }
            </CFormItem>,
            <CFormItem key='vehicle' label={storeHandoverLocale.vehicle}>
                {
                    getFieldDecorator('vehicle')(<span>{convertCodeName(entity.vehicle)}</span>)
                }
            </CFormItem>,
        ];

        return [
            <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={basicCols} />,
        ];
    }

    abc = () => {
        console.log(123);
    }
    /**
     * 绘制明细表格
     */
    drawTable = () => {
        const { getFieldDecorator } = this.props.form;
        const { entity } = this.state;
        let handoverCols = [
            {
                title: commonLocale.lineLocal,
                key: 'line',
                width: itemColWidth.lineColWidth,
                render: (text, record, index) => `${index + 1}`
            },
            {
                title: storeHandoverLocale.handoverItem,
                key: 'handover',
                width: colWidth.codeNameColWidth,
                render: (text, record) => {
                    if (!record.handoverItem)
                        return <Empty />;
                    return <span> {CollectBinReviewType[record.type].name === CollectBinReviewType.WHOLECONTAINERQTYSTR.name
                        ? record.handoverItem.name : convertCodeName(record.handoverItem)}</span>
                }
            },
            {
                title: storeHandoverLocale.handoverType,
                key: 'type',
                width: colWidth.enumColWidth,
                render: (text, record) => record.type ? CollectBinReviewType[record.type].caption : <Empty />,
            },
            {
                title: storeHandoverLocale.handoverQty,
                dataIndex: 'qtyStr',
                key: 'qtyStr',
                width: itemColWidth.qtyColWidth,
                render: (text, record) => record.qtyStr
            },
            {
                title: storeHandoverLocale.realHanoverQty,
                dataIndex: 'realQtyStr',
                key: 'realQtyStr',
                width: itemColWidth.qtyStrEditColWidth,
                render: (text, record) => {
                    if (!record.realQtyStr) {
                        record.realQtyStr = 0;
                    }
                    return (
                        <Input
                            defaultValue={record.realQtyStr}
                            onBlur={
                                e => this.handleHandoverFieldChange(e, 'realQtyStr', record.line)
                            }
                            placeholder={placeholderLocale(storeHandoverLocale.realHanoverQty)} />
                    );
                }
            },
        ];

        let recycleCols = [
            {
                title: storeHandoverLocale.containerType,
                key: 'containerType',
                width: colWidth.codeNameColWidth,
                render: (text, record) => <EllipsisCol colValue={convertCodeName(record.containerType)} />
            },
            {
                title: storeHandoverLocale.recycleType,
                key: 'recycleType',
                width: colWidth.enumColWidth,
                render: (text, record) => record.recycleType ? ContainerRecycleType[record.recycleType].caption : <Empty />,
            },
            {
                title: storeHandoverLocale.recycleQty,
                dataIndex: 'qty',
                key: 'qty',
                width: itemColWidth.qtyColWidth,
            },
            {
                title: storeHandoverLocale.realRecycleQty,
                dataIndex: 'realQty',
                key: 'realQty',
                width: itemColWidth.qtyStrEditColWidth,
                render: (text, record) => {
                    if (ContainerRecycleType[record.recycleType].name === ContainerRecycleType.ByBarcode.name) {
                        return (<span>{record.realQty ? record.realQty : 0}</span>)
                    } else {
                        return (
                            <InputNumber
                                value={record.realQty ? record.realQty : 0}
                                onChange={
                                    e => this.handleRecycleFieldChange(e, 'realQty', record.line)
                                }
                                placeholder={placeholderLocale(commonLocale.inQtyLocale)} />
                        );
                    }

                }
            },
        ];

        let returnDcTypeColumns = [
            {
                title: storeHandoverLocale.returnDcType,
                key: 'returnDcType',
                dataIndex: 'returnDcType',
                //   width: itemColWidth.articleEditColWidth,
                render: (text, record) => {
                    let value = null;
                    if (record.returnDcItemUuid) {
                        value = JSON.stringify({
                            uuid: record.returnDcItemUuid,
                            name: record.returnDcItemName
                        });
                    }
                    return (
                        <ReturnDcTypeSelect
                            value={value}
                            single
                            onChange={e => this.handleReturnDcFieldChange(e, 'returnDcType', record.line)}
                        />
                    );
                }
            },
            {
                title: storeHandoverLocale.returnDcTypeQtyStr,
                key: 'qtyStr',
                // width: itemColWidth.qtyStrEditColWidth,
                render: (record) => {
                    return (
                        <InputNumber
                            precision={0}
                            min={0}
                            value={record.qtyStr ? record.qtyStr : 0}
                            onChange={
                                e => this.handleReturnDcFieldChange(e, 'qtyStr', record.line)
                            }
                        />
                    );
                }
            }
        ]

        if (entity.state && State.STOREHANDOVER.name === State[entity.state].name) {
            return (<ItemEditTable
                title={storeHandoverLocale.recycleItemLocale}
                batchAdd={false}
                noAddandDelete={true}
                notNote={true}
                columns={recycleCols}
                data={entity.recycleItems ? entity.recycleItems : []}
            />)
        } else {
            return (<Tabs header="明细" defaultActiveKey="billItems">
                <TabPane key="billItems" tab={commonLocale.billItemsLocale}>
                    <ItemEditTable
                        batchAdd={false}
                        noAddandDelete={true}
                        notNote={true}
                        columns={handoverCols}
                        data={entity.items ? entity.items : []}
                    />
                </TabPane>
                <TabPane key="recycleItems" tab={storeHandoverLocale.recycleItemLocale}>
                    <ItemEditTable
                        batchAdd={false}
                        noAddandDelete={true}
                        notNote={true}
                        columns={recycleCols}
                        data={entity.recycleItems ? entity.recycleItems : []}
                    />
                </TabPane>
                <TabPane key="returnDcItems" tab={storeHandoverLocale.returnDcItems}>
                    <ItemEditTable
                        batchAdd={false}
                        notNote={true}
                        columns={returnDcTypeColumns}
                        data={entity.returnDcItems ? entity.returnDcItems : []}
                    />
                </TabPane>
            </Tabs>)
        }


        // return (this.fetchEditItemTable()
        // <Tabs header="明细" defaultActiveKey="billItems">
        //     <TabPane key="billItems" tab={commonLocale.billItemsLocale}>
        //         <ItemEditTable
        //             batchAdd={false}
        //             noAddandDelete={true}
        //             notNote={true}
        //             columns={handoverCols}
        //             data={entity.items ? entity.items : []}
        //         />
        //     </TabPane>
        //     <TabPane key="recycleItems" tab={storeHandoverLocale.recycleItemLocale}>
        //         <ItemEditTable
        //             batchAdd={false}
        //             noAddandDelete={true}
        //             notNote={true}
        //             columns={recycleCols}
        //             data={entity.recycleItems ? entity.recycleItems : []}
        //         />
        //     </TabPane>
        // </Tabs>
        // )
    }
}