import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Tabs, Modal, Tag, message } from 'antd';
import VendorDispatchBasicViewPage from './VendorDispatchBasicViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import CheckTablePanel from './CheckTablePanel';
import { convertCodeName, convertArticleDocField } from '@/utils/utils';
import { commonLocale } from '@/utils/CommonLocale';
import { vendorDispatchLocal } from './VendorDispatchLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import BussinessStatisticPanel from '@/pages/Component/Form/BussinessStatisticPanel';
import moment from 'moment';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import FetchOperateMethod from './FetchOperateMethod';
import TagUtil from '@/pages/Component/TagUtil';
import ViewTable from '@/pages/Inner/StockTakeBill/ViewTable';
import TabsPanel from '@/pages/Component/Form/TabsPanel';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import { VENDORDISPATCH_RES } from './VendorDispatchPermission';
import { havePermission } from '@/utils/authority';
import { routerRedux } from 'dva/router';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';

const TabPane = Tabs.TabPane;
@connect(({ vendorDispatch, allowVendorRtnConfig, loading }) => ({
    vendorDispatch,
    allowVendorRtnConfig,
    loading: loading.models.vendorDispatch,
}))
export default class VendorDispatchViewPage extends VendorDispatchBasicViewPage {
    constructor(props) {
        super(props);
        this.state = {
            entity: {},
            containerItems: [],
            unContainerItems: [],
            stockItems: [],
            unStockItems: [],
            entityUuid: props.vendorDispatch.entityUuid,
            title: '',

            methodModalVisible: false,
            confirmLoading: false,
            selectedRows: [],
            selectedRowKeys: ''
        }
    }
    componentDidMount() {
        this.refresh();
        this.fetchAllowVendorRtnConfig();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.vendorDispatch.entity) {
            this.setState({
                entity: nextProps.vendorDispatch.entity,
                containerItems: nextProps.vendorDispatch.entity.containerItems ? nextProps.vendorDispatch.entity.containerItems : [],
                unContainerItems: nextProps.vendorDispatch.entity.unContainerItems ? nextProps.vendorDispatch.entity.unContainerItems : [],
                stockItems: nextProps.vendorDispatch.entity.stockItems ? nextProps.vendorDispatch.entity.stockItems : [],
                unStockItems: nextProps.vendorDispatch.entity.unStockItems ? nextProps.vendorDispatch.entity.unStockItems : [],
                title: vendorDispatchLocal.title + '：' + convertCodeName(nextProps.vendorDispatch.entity.vendor),
                entityUuid: nextProps.vendorDispatch.entity.uuid,
                allowVendorRtnConfig: nextProps.allowVendorRtnConfig.data.list || [],
            });
        }
    }

    fetchAllowVendorRtnConfig = () => {
        let queryFilter = {
            searchKeyValues: {
              companyUuid: loginCompany().uuid,
              dcUuid: loginOrg().uuid,
            }
        }

        this.props.dispatch({
            type: 'allowVendorRtnConfig/query',
            payload: queryFilter,
        });
    }

    /**
    * 刷新
    */
    refresh() {
        this.props.dispatch({
            type: 'vendorDispatch/get',
            payload: this.props.vendorDispatch.entityUuid,
            callback: (response) => {
            if (!response || !response.data) {
              message.error("供应商不存在退货信息");
              this.onBack()
            }else{
              console.info(response)
            }
            }
        });
    }
    /**
    * 返回
    */
    onBack = () => {
        this.props.dispatch({
            type: 'vendorDispatch/showPage',
            payload: {
                showPage: 'query',
              fromView: true
            }
        });
    }

    /**
     * 显示/隐藏提示框
     */
    onGenPickUpBill = (value) => {
        const { entity, selectedRowKeys } = this.state;

        this.setState({
            confirmLoading: !this.state.confirmLoading
        })

        this.props.dispatch({
            type: 'vendorDispatch/genPickupBillByContainer',
            payload: {
                vendorUuid: entity.vendor.uuid,
                ownerUuid: entity.owner.uuid,
                companyUuid: entity.companyUuid,
                dcUuid: entity.dcUuid,
                method: value.method,
                containerBarcodes: selectedRowKeys
            },
            callback: (response) => {
                if (response && response.success) {
                    message.info('共生成' + response.data + '张拣货单');
                    this.refresh();
                }
                this.setState({
                    selectedRowKeys: "",
                    selectedRows: [],
                    methodModalVisible: false,
                    confirmLoading: false
                })
            }
        })
    }

    handleMethodModalVisible = () => {
        this.setState({
            methodModalVisible: !this.state.methodModalVisible,
        })
    }

    handleModifyMethod = (value) => {
        this.onGenPickUpBill(value);
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
        const { entity } = this.state;

        return (
            <Fragment>
              <Button onClick={this.onBack}>
                {commonLocale.backLocale}
              </Button>
              <Button onClick={this.handleChoose}
                    disabled={!havePermission(VENDORDISPATCH_RES.GENVENDORRTNPICK)}>
                {vendorDispatchLocal.genPickupBill}
              </Button>


              <FetchOperateMethod
                    ModalTitle={vendorDispatchLocal.method}
                    methodModalVisible={this.state.methodModalVisible}
                    handleMethodModalVisible={this.handleMethodModalVisible}
                    handleSave={this.handleModifyMethod}
                    confirmLoading={this.state.confirmLoading}
                />

            </Fragment>
        );

    }

    onViewArticle = (toViewArticleUuid) => {
        this.props.dispatch(routerRedux.push({
            pathname: '/basic/article',
            toViewArticleUuid: toViewArticleUuid
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

    onViewContainer = (barcode) => {
        this.props.dispatch(routerRedux.push({
            pathname: '/facility/container',
            payload: {
                showPage: 'view',
                entityUuid: barcode
            }
        }));
    }


    drawStockItems = () => {
        let stockCols = [
            {
                title: commonLocale.containerLocale,
                dataIndex: 'containerBarcode',
                key: 'containerBarcode',
                width: colWidth.codeColWidth,
                render: (rext, record) => <a onClick={this.onViewContainer.bind(true, record.containerBarcode)}>
                    {record.containerBarcode}</a>
            }, {
                title: commonLocale.bincodeLocale,
                dataIndex: 'binCode',
                key: 'binCode',
                width: colWidth.codeColWidth,
            }, {
                title: commonLocale.inVendorLocale,
                dataIndex: 'vendor',
                width: colWidth.codeNameColWidth,
                render: (rext, record) => <a onClick={this.onViewVendor.bind(true, record.vendor ? record.vendor.uuid : undefined)}>
                    {convertCodeName(record.vendor)}</a>
            },
            {
                title: commonLocale.articleLocale,
                width: colWidth.codeNameColWidth,
                render: (rext, record) =>
                    <a onClick={() => this.onViewArticle(record.article.articleUuid)} >
                        <EllipsisCol colValue={convertArticleDocField(record.article)} /></a>
            },
            {
                title: commonLocale.inQpcAndMunitLocale,
                width: colWidth.codeColWidth,
                render: (rext, record) => (record.qpcStr + '/' + (record.article.munit ? record.article.munit : '-'))
            },
            {
                title: commonLocale.inProductDateLocale,
                dataIndex: 'productionDate',
                key: 'productionDate',
                width: colWidth.dateColWidth,
                render: (val) => {
                    return moment(val).format('YYYY-MM-DD');
                }
            },
            {
                title: commonLocale.inValidDateLocale,
                dataIndex: 'validDate',
                key: 'validDate',
                width: colWidth.dateColWidth,
                render: (val) => {
                    return moment(val).format('YYYY-MM-DD');
                }
            }, {
                title: commonLocale.inQtyStrLocale,
                dataIndex: 'qtyStr',
                key: 'qtyStr',
                width: itemColWidth.qpcStrColWidth,
            },
            {
                title: commonLocale.inQtyLocale,
                dataIndex: 'qty',
                key: 'qty',
                width: itemColWidth.qtyColWidth,
            }, {
                title: commonLocale.inStockBatchLocale,
                dataIndex: 'stockBatch',
                key: 'stockBatch',
                width: colWidth.codeColWidth,
            }, {
                title: commonLocale.inPriceLocale,
                dataIndex: 'price',
                key: 'price',
                width: itemColWidth.priceColWidth,
            },
        ]
        return stockCols;
    }

    drawContainerItems = () => {
        let containerCols = [
            {
                title: commonLocale.bincodeLocale,
                dataIndex: 'bincode',
                key: 'bincode',
                width: 100,
            }, {
                title: commonLocale.containerLocale,
                dataIndex: 'containerBarcode',
                key: 'containerBarcode',
                width: 150,
                render: (rext, record) => <a onClick={this.onViewContainer.bind(true, record.containerBarcode)}>
                    {record.containerBarcode}</a>
            }, {
                title: commonLocale.inAllArticleCountLocale,
                dataIndex: 'articleItemCount',
                width: 100,
            },
            {
                title: commonLocale.inAllQtyStrLocale,
                dataIndex: 'qtyStr',
                width: 100,
            },
            {
                title: commonLocale.inAllAmountLocale,
                dataIndex: 'amount',
                width: 100,
            },
            {
                title: commonLocale.inAllWeightLocale,
                dataIndex: 'weight',
                width: 100,

            },
            {
                title: commonLocale.inAllVolumeLocale,
                dataIndex: 'volume',
                width: 100,
            },
        ]
        return containerCols;
    }

    drawUnContainerItems = () => {
        let containerCols = [
            {
                title: commonLocale.bincodeLocale,
                dataIndex: 'bincode',
                key: 'bincode',
                width: 100,
            }, {
                title: commonLocale.containerLocale,
                dataIndex: 'containerBarcode',
                key: 'containerBarcode',
                width: 150,
                render: (rext, record) => <a onClick={this.onViewContainer.bind(true, record.containerBarcode)}>
                    {record.containerBarcode}</a>
            }, {
                title: commonLocale.stateLocale,
                dataIndex: 'state',
                key: 'state',
                width: 150,
                render: (text, record) => <BadgeUtil value={record.state} />
            }, {
                title: commonLocale.inAllArticleCountLocale,
                dataIndex: 'articleItemCount',
                width: 100,
            },
            {
                title: commonLocale.inAllQtyStrLocale,
                dataIndex: 'qtyStr',
                width: 100,
            },
            {
                title: commonLocale.inAllAmountLocale,
                dataIndex: 'amount',
                width: 100,
            },
            {
                title: commonLocale.inAllWeightLocale,
                dataIndex: 'weight',
                width: 100,

            },
            {
                title: commonLocale.inAllVolumeLocale,
                dataIndex: 'volume',
                width: 100,
            },
        ]
        return containerCols;
    }

    handleChoose = () => {
        const { selectedRows, entity, allowVendorRtnConfig } = this.state

        if (allowVendorRtnConfig.length == 0) {
            message.warn("供应商：" + entity.vendor.code + "不允许生成拣货单");
            return;
        }

        if (allowVendorRtnConfig.length > 1 || (allowVendorRtnConfig.length == 1 && allowVendorRtnConfig[0].vendor.code != '-')) {
            let existVendorArr = allowVendorRtnConfig.filter(allowItem => allowItem.vendor.code === entity.vendor.code);
            if (existVendorArr.length == 0) {
                message.warn("供应商：" + entity.vendor.code + "不允许生成拣货单");
                return;
            }
        }

        if (selectedRows.length <= 0) {
            message.info('请先选择容器');
            return false;
        }
        this.setState({
            methodModalVisible: !this.state.methodModalVisible
        })
    }

    /**
    * 绘制未下架信息详情
    */
    drawUnContainerInfoTab = () => {
        const { entity, selectedRowKeys } = this.state;

        let businessItems = [
            {
                label: vendorDispatchLocal.containerCount,
                value: entity.unContainerCount
            },
            {
                label: commonLocale.inAllQtyStrLocale,
                value: entity.unQtyStr
            }, {
                label: commonLocale.inAllArticleCountLocale,
                value: entity.unArticleItemCount
            }, {
                label: commonLocale.inAllAmountLocale,
                value: entity.unAmount
            },
            {
                label: commonLocale.inAllWeightLocale,
                value: entity.unWeight
            }, {
                label: commonLocale.inAllVolumeLocale,
                value: entity.unVolume
            },
        ];

        const rowSelection = {
            selectedRowKeys,
            getCheckboxProps: record => ({
                disabled: record.disabled,
            }),
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    selectedRowKeys: selectedRowKeys,
                    selectedRows: selectedRows
                })
            }
        }

        let tabsItem = [
            <CheckTablePanel
                title={vendorDispatchLocal.containerInfo}
                columns={this.drawUnContainerItems()}
                rowSelection={rowSelection}
                data={entity.unContainerItems ? entity.unContainerItems : []}
            />
            , <ViewTable title={vendorDispatchLocal.stockInfo}
                columns={this.drawStockItems()}
                scroll={{ x: 1500 }}
                data={entity.unStockItems ? entity.unStockItems : []}
            />
        ]
        return (
            <TabPane key="1" tab={vendorDispatchLocal.unShelveInfo}>
                <ViewPanel items={businessItems} title={commonLocale.bussinessLocale} isClose={true} />
                <TabsPanel title={commonLocale.itemsLocale} items={tabsItem} />
            </TabPane>
        );
    }

    /**
    * 绘制已下架信息详情
    */
    drawContainerInfoTab = () => {
        const { entity } = this.state;

        let businessItems = [
            {
                label: vendorDispatchLocal.containerCount,
                value: entity.containerCount
            },
            {
                label: commonLocale.inAllQtyStrLocale,
                value: entity.qtyStr
            }, {
                label: commonLocale.inAllArticleCountLocale,
                value: entity.articleItemCount
            }, {
                label: commonLocale.inAllAmountLocale,
                value: entity.amount
            },
            {
                label: commonLocale.inAllWeightLocale,
                value: entity.weight
            }, {
                label: commonLocale.inAllVolumeLocale,
                value: entity.volume
            },
        ];

        let tabsItem = [
            <ViewTable columns={this.drawContainerItems()}
                title={vendorDispatchLocal.containerInfo}
                data={entity.containerItems ? entity.containerItems : []} />
            , <ViewTable columns={this.drawStockItems()}
                title={vendorDispatchLocal.stockInfo}
                scroll={{ x: 1500 }}
                data={entity.stockItems ? entity.stockItems : []}
            />
        ]
        return (
            <TabPane key="2" tab={vendorDispatchLocal.shelveInfo}>
                <ViewPanel items={businessItems} title={commonLocale.bussinessLocale} isClose={true} />
                <TabsPanel title={commonLocale.itemsLocale} items={tabsItem} />
            </TabPane>
        );
    }

    /**
    * 绘制Tab页
    */
    drawTabPanes = () => {
        let tabPanes = [
            this.drawUnContainerInfoTab(),
            this.drawContainerInfoTab()
        ];

        return tabPanes;
    }
}
