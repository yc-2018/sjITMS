import { PureComponent, Fragment } from "react";
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import { Button, Card, Form, Spin, Col, Tabs, Table } from 'antd';
import { formatMessage } from 'umi/locale';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import { convertCodeName, composeQpcStrAndMunit, convertArticleDocField, convertDate } from '@/utils/utils';
import FormPanel from '@/pages/Component/Form/FormPanel';
import { commonLocale } from '@/utils/CommonLocale';
import CFormItem from '@/pages/Component/Form/CFormItem';
const FormItem = Form.Item;
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import Empty from '@/pages/Component/Form/Empty';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { ShipPlanDispatchLocale } from './ShipPlanDispatchLocale';
import CollapsePanel from '@/pages/Component/Form/CollapsePanel';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { getStateCaption } from '@/utils/ContainerState'
import { getUsageCaption } from '@/utils/BinUsage';;
import { routerRedux } from 'dva/router';
import { DC_RES } from '@/pages/Basic/DC/DCPermission';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';
import { STORE_RES } from '@/pages/Basic/Store/StorePermission';
import { havePermission } from '@/utils/authority';

const TabPane = Tabs.TabPane;

@connect(({ shipPlanDispatch, loading }) => ({
    shipPlanDispatch,
    loading: loading.models.shipPlanDispatch,
}))
export default class ShipPlanDeliveryTaskPage extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            title: '排车任务明细看板',
            deliveryTaskEntity: {},
            stockItems: [],
            containerItems: [],
            attachmentItems: []
        }
    }

    componentDidMount() {
        if (!this.props.shipPlanDispatch.deliveryTaskEntity)
            return;
        const deliveryTaskEntity = this.props.shipPlanDispatch.deliveryTaskEntity;
        this.setState({
            deliveryTaskEntity: deliveryTaskEntity
        });

        if (deliveryTaskEntity
            && deliveryTaskEntity.fromOrg
            && deliveryTaskEntity.toOrg) {
            this.props.dispatch({
                type: 'shipPlanDispatch/queryShipPlanDeliveryTaskItem',
                payload: {
                    dcUuid: deliveryTaskEntity.fromOrg.uuid,
                    storeUuid: deliveryTaskEntity.toOrg.uuid,
                    companyUuid: loginCompany().uuid
                }
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        const deliveryTaskItem = nextProps.shipPlanDispatch.deliveryTaskItem;
        if (deliveryTaskItem) {
            let stockItems = deliveryTaskItem.stockItems ? deliveryTaskItem.stockItems : [];
            stockItems.forEach(function (data, index) {
                data.line = index + 1;
            });
            let containerItems = deliveryTaskItem.containerItems ? deliveryTaskItem.containerItems : [];
            containerItems.forEach(function (data, index) {
                data.line = index + 1;
            });
            let attachmentItems = deliveryTaskItem.attachmentItems ? deliveryTaskItem.attachmentItems : [];
            attachmentItems.forEach(function (data, index) {
                data.line = index + 1;
            });

            this.setState({
                stockItems: stockItems,
                containerItems: containerItems,
                attachmentItems: attachmentItems
            });
        }
    }

    handleCancel = () => {
        this.props.dispatch({
            type: 'shipPlanDispatch/showPage',
            payload: {
                showPage: 'query'
            }
        });
    }

    drawCreateButtons = () => {
        return (
            <Fragment>
                <Button key="cancel" onClick={this.handleCancel}>
                    {formatMessage({ id: 'company.create.button.cancel' })}
                </Button>
            </Fragment>
        );
    }

    onViewDC = (dcUuid) => {
        this.props.dispatch(routerRedux.push({
            pathname: '/basic/dc',
            payload: {
                showPage: 'view',
                entityUuid: dcUuid
            }
        }));
    }

    onViewArticle = (articleUuid) => {
        this.props.dispatch(routerRedux.push({
            pathname: '/basic/article',
            payload: {
                showPage: 'view',
                entityUuid: articleUuid
            }
        }));
    }

    onViewVendor = (vendorUuid) => {
        this.props.dispatch(routerRedux.push({
            pathname: '/basic/vendor',
            payload: {
                showPage: 'view',
                entityUuid: vendorUuid
            }
        }));
    }

    onViewStore = (storeUuid) => {
        this.props.dispatch(routerRedux.push({
            pathname: '/basic/store',
            payload: {
                showPage: 'view',
                entityUuid: storeUuid
            }
        }));
    }

    onViewContainer = (barcode) => {
        this.props.dispatch(routerRedux.push({
            pathname: '/facility/container',
            payload: {
                showPage: 'view',
                entityUuid: barcode
            }
        }));
    }

    refreshColumns = (columns) => {
        columns.forEach(e => {
            if (e.width) {
                e.onCell = () => {
                    return {
                        style: {
                            maxWidth: e.width,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            cursor: 'pointer'
                        }
                    }
                }
            }
        });
    }

    drawFormItems = () => {
        const { deliveryTaskEntity } = this.state;
        let basicItems = [
            {
                label: ShipPlanDispatchLocale.dc,
                value: loginOrg().type === 'DC' ? deliveryTaskEntity.fromOrg ? convertCodeName(deliveryTaskEntity.fromOrg) : <Empty />
                    : <a onClick={this.onViewDC.bind(true, deliveryTaskEntity.fromOrg ? deliveryTaskEntity.fromOrg : undefined)}
                        disabled={!havePermission(DC_RES.VIEW)}>
                        {deliveryTaskEntity.fromOrg ? convertCodeName(deliveryTaskEntity.fromOrg) : <Empty />}</a>
            },
            {
                label: ShipPlanDispatchLocale.store,
                value: <a onClick={this.onViewStore.bind(true, deliveryTaskEntity.toOrg ? deliveryTaskEntity.toOrg : undefined)}
                    disabled={!havePermission(STORE_RES.VIEW)}>
                    {deliveryTaskEntity.toOrg ? convertCodeName(deliveryTaskEntity.toOrg) : <Empty />}</a>
            },
            {
                label: ShipPlanDispatchLocale.amount,
                value: deliveryTaskEntity.staticProfile && deliveryTaskEntity.staticProfile.amount ? deliveryTaskEntity.staticProfile.amount : <Empty />
            },
            {
                label: ShipPlanDispatchLocale.weight,
                value: deliveryTaskEntity.staticProfile && deliveryTaskEntity.staticProfile.weight ? (Number(deliveryTaskEntity.staticProfile.weight) / 1000).toFixed(4) : <Empty />
            },
            {
                label: ShipPlanDispatchLocale.volume,
                value: deliveryTaskEntity.staticProfile && deliveryTaskEntity.staticProfile.volume ? deliveryTaskEntity.staticProfile.volume : <Empty />
            }
        ];


        let stockItemsCols = [
            {
                title: commonLocale.lineLocal,
                dataIndex: 'line',
                width: itemColWidth.lineColWidth,
            },
            {
                title: commonLocale.articleLocale,
                key: 'article',
                width: itemColWidth.articleColWidth,
                render: record => <a onClick={() => this.onViewArticle(record.article.articleUuid)} ><EllipsisCol colValue={convertArticleDocField(record.article)} /></a>
            },
            {
                title: commonLocale.qpcStrLocale,
                width: itemColWidth.qpcStrColWidth,
                render: (text, record) => <EllipsisCol colValue={composeQpcStrAndMunit(record)} />
            },
            {
                title: commonLocale.bincodeLocale,
                width: colWidth.codeNameColWidth,
                dataIndex: 'binCode',
            },
            {
                title: commonLocale.inBinUsageLocale,
                width: colWidth.codeNameColWidth,
                key: 'binUsage',
                render: record => getUsageCaption(record.binUsage)
            },
            {
                title: commonLocale.containerLocale,
                width: colWidth.codeNameColWidth,
                dataIndex: 'containerBarcode',
                render: (text, record) => <a onClick={this.onViewContainer.bind(true, text)}
                    disabled={!text || '-' === text}>{text}</a>
            },
            {
                title: commonLocale.productionDateLocale,
                key: 'productionDate',
                width: colWidth.dateColWidth,
                render: record => convertDate(record.productionDate)
            },
            {
                title: commonLocale.validDateLocale,
                key: 'validDate',
                width: colWidth.dateColWidth,
                render: record => convertDate(record.validDate)
            },
            {
                title: commonLocale.productionBatchLocale,
                dataIndex: 'productionBatch',
                width: itemColWidth.numberEditColWidth,
                render: (text, record) => <EllipsisCol colValue={text} />
            },
            {
                title: commonLocale.inStockBatchLocale,
                dataIndex: 'stockBatch',
                width: itemColWidth.numberEditColWidth,
                render: (text, record) => <EllipsisCol colValue={text} />
            },
            {
                title: commonLocale.caseQtyStrLocale,
                dataIndex: 'qtyStr',
                width: itemColWidth.qtyStrColWidth,
            },
            {
                title: commonLocale.qtyLocale,
                dataIndex: 'qty',
                width: itemColWidth.qpcStrColWidth,
            },
            {
                title: commonLocale.vendorLocale,
                key: 'vendor',
                width: colWidth.codeNameColWidth,
                render: record => <a onClick={this.onViewVendor.bind(true, record.vendor ? record.vendor.uuid : undefined)}
                    disabled={!havePermission(VENDOR_RES.VIEW)}>
                    <EllipsisCol colValue={convertCodeName(record.vendor)} /></a>
            },
            {
                title: commonLocale.ownerLocale,
                width: colWidth.codeNameColWidth,
                key: 'owner',
                render: record => <EllipsisCol colValue={convertCodeName(record.owner)} />
            }
        ]

        let containerItemsCols = [
            {
                title: commonLocale.lineLocal,
                dataIndex: 'line',
                width: itemColWidth.lineColWidth,
            },
            {
                title: commonLocale.containerLocale,
                width: colWidth.codeNameColWidth,
                dataIndex: 'containerBarcode',
                render: (text, record) => <a onClick={this.onViewContainer.bind(true, text)}
                    disabled={!text || '-' === text}>{text}</a>
            },
            {
                title: commonLocale.bincodeLocale,
                width: colWidth.codeNameColWidth,
                dataIndex: 'binCode',
            },
            {
                title: commonLocale.inBinUsageLocale,
                width: colWidth.codeNameColWidth,
                key: 'binUsage',
                render: record => getUsageCaption(record.binUsage)
            },
            {
                title: ShipPlanDispatchLocale.containerType,
                key: 'containerType',
                width: colWidth.codeNameColWidth,
                render: record => <EllipsisCol colValue={convertCodeName(record.containerType)} />
            },
            {
                title: commonLocale.stateLocale,
                key: "containerState",
                width: colWidth.enumColWidth,
                render: record => getStateCaption(record.containerState)
            }
        ]

        let attachmentItemsCols = [
            {
                title: commonLocale.lineLocal,
                dataIndex: 'line',
                width: itemColWidth.lineColWidth,
            },
            {
                title: ShipPlanDispatchLocale.attachment,
                dataIndex: 'attachmentItem',
                width: colWidth.codeNameColWidth,
                render: (text, record) => <EllipsisCol colValue={convertCodeName(record.attachmentItem)} />
            },
            {
                title: commonLocale.caseQtyStrLocale,
                dataIndex: 'reviewedQtyStr',
                width: itemColWidth.qtyStrColWidth,
            }
        ]

        this.refreshColumns(stockItemsCols);
        this.refreshColumns(containerItemsCols);
        this.refreshColumns(attachmentItemsCols);

        let tabPanes = [
            <TabPane key="stockItemsCols" tab={ShipPlanDispatchLocale.stockItems}>
                <Table dataSource={this.state.stockItems} columns={stockItemsCols} scroll={{ x: 2400 }} />
            </TabPane>,
            <TabPane key="containerItemsCols" tab={ShipPlanDispatchLocale.containerItems}>
                <Table dataSource={this.state.containerItems} columns={containerItemsCols} />
            </TabPane>,
            <TabPane key="attachmentItemsCols" tab={ShipPlanDispatchLocale.attachmentItems}>
                <Table dataSource={this.state.attachmentItems} columns={attachmentItemsCols} />
            </TabPane>
        ];

        let test = [
            <Tabs defaultActiveKey="1" header="明细" >
                {tabPanes}
            </Tabs>
        ];

        return (
            <div>
                <ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} />
                <CollapsePanel defaultOpen={true} items={test} />
            </div>
        );
    }


    render() {
        return (
            <PageHeaderWrapper>
                <Spin indicator={LoadingIcon('default')} spinning={this.props.loading} >
                    <Page>
                        <NavigatorPanel title={this.state.title} action={this.drawCreateButtons()} />
                        {this.drawFormItems()}
                        <NavigatorPanel />
                    </Page>
                </Spin>
            </PageHeaderWrapper>
        );
    }
}