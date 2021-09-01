import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, Tabs, Modal, Steps, Tag, message, Input, Form, Empty } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import UserSelect from '@/pages/Component/Select/UserSelect';
import BinSelect from '@/pages/Component/Select/BinSelect';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { qtyStrToQty, add, toQtyStr, compare } from '@/utils/QpcStrUtil';
import { convertCodeName, convertArticleDocField } from '@/utils/utils';
import { commonLocale, placeholderLocale, placeholderChooseLocale, notNullLocale } from '@/utils/CommonLocale';
import { sourceWay } from '@/utils/SourceWay';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import { vendorRtnPickLocale } from './VendorRtnPickBillLocale';
import styles from '@/pages/Out/PickUp/PickUpBill.less';
import { Type, State, METHOD } from './VendorRtnPickBillContants';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import TagUtil from '@/pages/Component/TagUtil';
import { containerState } from '@/utils/ContainerState';
import { binUsage } from '@/utils/BinUsage';
import { binState } from '@/utils/BinState';
import TargetContainerSelect from './TargetContainerSelect';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
@connect(({ vendorRtnPick, loading }) => ({
    vendorRtnPick,
    loading: loading.models.vendorRtnPick,
}))
@Form.create()
export default class VendorRtnPickBillAuditPage extends ViewPage {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            entity: {},
            picker: {
                uuid: loginUser().uuid,
                code: loginUser().code,
                name: loginUser().name
            },
            entityUuid: props.vendorRtnPick.entityUuid,
            selectedRowKeys: [],
            visiblAudit: false,
            showBinCodeModal: false,
            showContainerModal: false,
            confirmLoading: false
        }
    }
    componentDidMount() {
        this.refresh();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.vendorRtnPick.entity) {
            nextProps.vendorRtnPick.entity.picker = nextProps.vendorRtnPick.entity.picker == null ? {
                uuid: loginUser().uuid,
                code: loginUser().code,
                name: loginUser().name
            } : nextProps.vendorRtnPick.entity.picker;

            nextProps.vendorRtnPick.entity.items
                && nextProps.vendorRtnPick.entity.items.forEach(function (item) {
                    item.targetContainerBarcode = item.targetContainerBarcode ? item.targetContainerBarcode : item.containerBarcode;
                    item.targetBinCode = item.targetBinCode ? item.targetBinCode : undefined;
                    item.realQtyStr = item.realQtyStr && item.realQtyStr !== '0' ? item.realQtyStr : item.qtyStr;
                    item.realQty = item.realQty && item.realQty !== 0 ? item.realQty : item.qty;
                })

            this.setState({
                entity: nextProps.vendorRtnPick.entity,
                title: vendorRtnPickLocale.title + '：' + nextProps.vendorRtnPick.entity.billNumber,
                entityUuid: nextProps.vendorRtnPick.entity.uuid,
            });
        }
    }
    /**
    * 刷新
    */
    refresh() {
        const { entityUuid } = this.state;
        this.props.dispatch({
            type: 'vendorRtnPick/get',
            payload: entityUuid
        });
    }
    /**
    * 返回
    */
    onBack = () => {
        this.props.dispatch({
            type: 'vendorRtnPick/showPage',
            payload: {
                showPage: 'query'
            }
        });
    }

    onView = (uuid) => {
        this.props.dispatch({
            type: 'vendorRtnPick/showPage',
            payload: {
                showPage: 'view',
                entityUuid: uuid
            }
        });
    }

    handleAuditModal = () => {
        this.setState({
            visiblAudit: !this.state.visiblAudit
        })
    }

    onAudit = () => {
        const { entity } = this.state
        let realItems = [];
        let items = entity.items;
        if (!entity.picker) {
            message.error('拣货员不能为空！');
            return false;
        }

        for (let x = entity.items.length - 1; x >= 0; x--) {
            let item = items[x];
            if (compare(item.realQtyStr, item.realQtyStr) > 0) {
                message.error('第' + item.line + '行实际件数不能大于拣货件数');
                this.setState({
                    visiblAudit: !this.state.visiblAudit
                })
                return;
            }
            if (!item.targetContainerBarcode || item.targetContainerBarcode === null) {
                message.error('第' + item.line + '行拣货的容器不能为空');
                this.setState({
                    visiblAudit: !this.state.visiblAudit
                })
                return;
            }
            if (!item.targetBinCode || item.targetBinCode === null) {
                message.error('第' + item.line + '行目标货位不能为空');
                this.setState({
                    visiblAudit: !this.state.visiblAudit
                })
                return;
            }
            if (item.qty !== item.realQty && item.containerBarcode === item.targetContainerBarcode) {
                message.error('第' + item.line + '行商品实拣数量不等于应拣数量，来源容器不能作为目标容器')
                this.setState({
                    visiblAudit: !this.state.visiblAudit
                })
                return;
            }

            let obj = {
                itemUuid: item.uuid,
                articleUuid: item.article.articleUuid,
                articleCode: item.article.articleCode,
                articleName: item.article.articleName,
                binCode: item.binCode,
                containerBarcode: item.containerBarcode,
                qpcStr: item.qpcStr,
                targetBinCode: item.targetBinCode,
                targetContainerBarcode: item.targetContainerBarcode,
                qty: item.realQty,
            };
            realItems.push(obj);
        }

        for (let i = 0; i < entity.items.length; i++) {
            for (let j = i + 1; j < entity.items.length; j++) {
                if (entity.items[i].targetContainerBarcode === entity.items[j].targetContainerBarcode &&
                    entity.items[i].targetBinCode !== entity.items[j].targetBinCode) {
                    message.error(`第${entity.items[i].line}行与第${entity.items[j].line}行同一容器，不同目标货位，无法审核!`);
                    this.setState({
                        visiblAudit: !this.state.visiblAudit
                    })
                    return false;
                }
            }
        }


        this.setState({
            confirmLoading: !this.state.confirmLoading
        })
        this.props.dispatch({
            type: 'vendorRtnPick/audit',
            payload: {
                uuid: entity.uuid,
                version: entity.version,
                picker: entity.picker,
                items: realItems,
            },
            callback: response => {
                if (response && response.success) {
                    message.success(commonLocale.auditSuccessLocale)
                    this.onView(entity.uuid);
                }

                this.setState({
                    confirmLoading: false,
                    visiblAudit: !this.state.visiblAudit
                })
            }
        })
    }
    /**
     * 用户改变时
     */
    handleChangeUser = (value) => {
        const { entity } = this.state;
        entity.picker = JSON.parse(value);

        this.setState({
            entity: { ...entity },
        });
    }

    /**
     * 明细发生变化时调用
     */
    onFieldChange = (value, field, index) => {
        const { entity } = this.state;
        if (field === 'targetContainerBarcode') {
            entity.items[index - 1].targetContainerBarcode = value;
        } else if (field === 'realQtyStr') {
            entity.items[index - 1].realQtyStr = value;
            entity.items[index - 1].realQty = qtyStrToQty(value, entity.items[index - 1].qpcStr);
        } else if (field === 'targetBinCode') {
            entity.items[index - 1].targetBinCode = value;
        }

        this.setState({
            entity: { ...entity },
        });
    }
    /**
     * 绘制订单状态tag
     */
    drawStateTag = () => {
        if (this.state.entity.state) {
            return (
                <TagUtil value={this.state.entity.state} />
            );
        }
    }
    /**
    * 绘制右上角按钮
    */
    drawActionButtion = () => {
        if (this.state.entity.state) {
            return (
                <Fragment>
                    <Button onClick={this.onBack}>
                        {commonLocale.backLocale}
                    </Button>
                    {
                        this.state.entity.state === State.APPROVED.name
                        && this.state.entity.method === METHOD.MANUAL.name &&
                        <Button type='primary' onClick={() => this.handleAuditModal(commonLocale.auditLocale)}>
                            {commonLocale.auditLocale}
                        </Button>
                    }
                </Fragment>
            );
        }
    }

    onshowModal = (flag, param, selectedRowKeys) => {
        if (flag) {
            if (Array.isArray(selectedRowKeys) && selectedRowKeys.length === 0) {
                message.warn('请勾选，再进行批量操作');
                return;
            }
            this.setState({
                selectedRowKeys: selectedRowKeys
            })
            if (param === 'bin') {
                this.setState({
                    showBinCodeModal: true
                })
            }
            if (param === 'container') {
                this.setState({
                    showContainerModal: true
                })
            }
            return;
        }
    }
    drawBatchButton = (selectedRowKeys) => {
        return <span>
            <a onClick={() => this.onshowModal(true, 'container', selectedRowKeys)}
            // disabled={!havePermission(PICKUPBILL_RES.CREATE)}
            >
                批量设置目标容器
      </a>&nbsp; &nbsp;
      <a onClick={() => this.onshowModal(true, 'bin', selectedRowKeys)}
            // disabled={!havePermission(PICKUPBILL_RES.CREATE)}
            >
                批量设置目标货位
      </a></span>
            ;
    }

    onOk = () => {
        const { entity } = this.state;

        this.props.form.validateFields((errors, fieldsValue) => {
            if (errors) return;

            let lines = this.state.selectedRowKeys;
            if (fieldsValue.bin) {
                Array.isArray(lines) && lines.forEach(function (line) {
                    entity.items[line - 1].targetBinCode = fieldsValue.bin;
                })
            } else if (fieldsValue.container) {
                Array.isArray(lines) && lines.forEach(function (line) {
                    entity.items[line - 1].targetContainerBarcode = fieldsValue.container
                });
            }

            this.setState({
                entity: { ...entity },
                showContainerModal: false,
                showBinCodeModal: false,
                selectedRowKeys: []
            });
        })
    }


    onCancel = () => {
        this.setState({
            showBinCodeModal: false,
            showContainerModal: false,
            selectedRowKeys: []
        })
    }

    /**
    * 绘制信息详情
    */
    drawPickUpBillBillInfoTab = () => {
        const { entity, picker } = this.state;
        const items = entity.items;
        // 概要信息
        let profileItems = [
            {
                label: commonLocale.ownerLocale,
                value: convertCodeName(entity.owner)
            },
            {
                label: commonLocale.vendorLocale,
                value: convertCodeName(entity.vendor)
            },
            {
                label: vendorRtnPickLocale.method,
                value: entity.method ? METHOD[entity.method].caption : '<空>'
            },
            {
                label: vendorRtnPickLocale.type,
                value: entity.type ? Type[entity.type].caption : '<空>'
            },
            {
                label: vendorRtnPickLocale.picker,
                value: <div>
                    <UserSelect
                        onChange={this.handleChangeUser}
                        value={JSON.stringify(entity.picker)}
                        single hasAll
                        placeholder={placeholderChooseLocale(vendorRtnPickLocale.picker)} />
                </div>
            },
            {
              label: commonLocale.noteLocale,
              value: entity.note,
            }
        ];

        // 明细
        let pickUpItemCols = [
            {
                title: commonLocale.articleLocale,
                key: 'article',
                width: colWidth.codeNameColWidth,
                render: record => <EllipsisCol colValue={convertArticleDocField(record.article)} />
            },
            {
                title: commonLocale.inQpcAndMunitLocale,
                key: 'munit',
                width: itemColWidth.qpcStrColWidth,
                render: record => record.qpcStr + ' / ' + record.article.munit
            },
            {
                title: commonLocale.bincodeLocale,
                width: itemColWidth.binCodeEditColWidth,
                key: 'binCode',
                dataIndex: 'binCode'
            },
            {
                title: commonLocale.containerLocale,
                width: itemColWidth.binCodeEditColWidth,
                key: 'containerBarcode',
                dataIndex: 'containerBarcode'
            },
            {
                title: vendorRtnPickLocale.toContainerBarcode,
                key: 'targetContainerBarcode',
                width: itemColWidth.dateEditColWidth + 40,
                render: (text, record) => {
                    return (
                        <TargetContainerSelect
                            defaultBarcode={record.containerBarcode}
                            state={containerState.IDLE.name}
                            onChange={e => this.onFieldChange(e, 'targetContainerBarcode', record.line)}
                            value={record.targetContainerBarcode}
                            placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)} />
                    );
                }
            },
            {
                title: vendorRtnPickLocale.toBinCode,
                key: 'targetBinCode',
                width: itemColWidth.dateEditColWidth + 40,
                render: (text, record) => {
                    return (
                        <BinSelect
                            value={record.targetBinCode}
                            wrhUuid={record.wrhUuid}
                            states={[binState.FREE.name, binState.USING.name]}
                            usages={[binUsage.VendorRtnCollectBin.name, binUsage.VendorRtnCollectTempBin.name]}
                            onChange={e => this.onFieldChange(e, 'targetBinCode', record.line)}
                            placeholder={placeholderLocale(commonLocale.inBinCodeLocale)} />
                    );
                }
            },
            {
                title: commonLocale.inQtyStrLocale,
                key: 'qtyStr',
                width: itemColWidth.operateColWidth,
                dataIndex: 'qtyStr',
            },
            {
                title: vendorRtnPickLocale.realQtyStr,
                key: 'realQtyStr',
                width: itemColWidth.qtyStrEditColWidth,
                render: (text, record) => {
                    return (
                        <QtyStrInput
                            value={record.realQtyStr ? record.realQtyStr : null}
                            onChange={
                                e => this.onFieldChange(e, 'realQtyStr', record.line)
                            }
                        />
                    );
                }
            },
        ]

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 15 },
        };
        const { form: { getFieldDecorator } } = this.props;
        return (
            <TabPane className={styles.AuditSelect} key="basicInfo" tab={vendorRtnPickLocale.title}>
                <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} />
                <ViewPanel title={commonLocale.itemsLocale}>
                    <ItemEditTable
                        columns={pickUpItemCols}
                        data={this.state.entity.items ? this.state.entity.items : []}
                        drawBatchButton={this.drawBatchButton}
                        noAddandDelete={true}
                        notNote={true}
                    />
                </ViewPanel>
                <div>
                    <Modal
                        title={commonLocale.auditLocale}
                        visible={this.state.visiblAudit}
                        onOk={this.onAudit}
                        onCancel={this.handleAuditModal}
                        confirmLoading={this.state.confirmLoading}
                    >
                        <p>{vendorRtnPickLocale.title + ':' + this.state.entity.billNumber}</p>
                    </Modal>

                    <Modal
                        title={this.state.showBinCodeModal ? vendorRtnPickLocale.batchAddBinCode : vendorRtnPickLocale.batchAddContainer}
                        visible={this.state.showBinCodeModal || this.state.showContainerModal}
                        onOk={this.onOk}
                        onCancel={this.onCancel}
                        destroyOnClose={true}>
                        <Form {...formItemLayout}>
                            {this.state.showBinCodeModal && <FormItem key='bin' label={vendorRtnPickLocale.toBinCode}>
                                {
                                    getFieldDecorator('bin', {
                                        rules: [
                                            { required: true, message: notNullLocale(vendorRtnPickLocale.toBinCode) }
                                        ],
                                    })(
                                        <BinSelect
                                            states={[binState.FREE.name, binState.USING.name]}
                                            usages={[binUsage.VendorRtnCollectBin.name, binUsage.VendorRtnCollectTempBin.name]}
                                            placeholder={placeholderLocale(commonLocale.inBinCodeLocale)} />
                                    )
                                }
                            </FormItem>}
                            {this.state.showContainerModal && <FormItem key='container' label={vendorRtnPickLocale.toContainerBarcode}>
                                {
                                    getFieldDecorator('container', {
                                        rules: [
                                            { required: true, message: notNullLocale(vendorRtnPickLocale.toContainerBarcode) }
                                        ],
                                    })(
                                        <TargetContainerSelect
                                            state={containerState.IDLE.name}
                                            placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)} />
                                    )
                                }
                            </FormItem>}
                        </Form >
                    </Modal>
                </div>
            </TabPane>
        );
    }
    /**
    * 绘制Tab页
    */
    drawTabPanes = () => {
        let tabPanes = [
            this.drawPickUpBillBillInfoTab(),
        ];

        return tabPanes;
    }
}
