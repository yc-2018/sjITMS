import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, Tabs, Modal, Steps, message, Select } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import BussinessStatisticPanel from '@/pages/Component/Form/BussinessStatisticPanel';
import CollapsePanel from '@/pages/Component/Form/CollapsePanel';
import Empty from '@/pages/Component/Form/Empty';
import TagUtil from '@/pages/Component/TagUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { convertCodeName } from '@/utils/utils';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { containerRecycleLocale } from './ContainerRecycleLocale';
import { State, ContainerRecycleType } from './ContainerRecycleContants';
import TabsPanel from '@/pages/Component/Form/TabsPanel';
import ViewTable from '@/pages/Inner/StockTakeBill/ViewTable';
import RecycleByQtyModal from './RecycleByQtyModal';
import RecycleByBarcodeModal from './RecycleByBarcodeModal';
import { CONTAINERRECYCLE_RES } from './ContainerRecyclePremission';
import { routerRedux } from 'dva/router';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
const TabPane = Tabs.TabPane;
@connect(({ containerRecycle, loading }) => ({
    containerRecycle,
    loading: loading.models.containerRecycle,
}))
export default class ContainerRecycleViewPage extends ViewPage {
    constructor(props) {
        super(props);
        this.state = {
            entity: {},
            items: [],
            barcodeItems: [],
            qtyItems: [],
            entityUuid: props.containerRecycle.entityUuid,
            title: '',
            visiblByQty: false,
            visiblByBarcode: false,
            confirmLoading: false,
            entityCode: props.containerRecycle.entityCode
        }
    }
    componentDidMount() {
        this.refresh(this.state.entityCode);
    }

    componentWillReceiveProps(nextProps) {
        const entity = nextProps.containerRecycle.entity
        if (nextProps.containerRecycle.entity) {
            const newItems = [];
            const barcodeItems = [];
            const qtyItems = [];
            nextProps.containerRecycle.entity.items && nextProps.containerRecycle.entity.items.forEach(function (item) {
                if (State[item.state].name === State.INSTORE.name) {
                    newItems.push(item);
                }
                if (State[item.state].name === State.RECYCLED.name) {
                    if (ContainerRecycleType[item.type].name === ContainerRecycleType.ByBarcode.name) {
                        barcodeItems.push(item);
                    } else {
                        qtyItems.push(item);
                    }
                }
            })

            this.setState({
                entity: nextProps.containerRecycle.entity,
                title: convertCodeName(nextProps.containerRecycle.entity.store),
                entityUuid: nextProps.containerRecycle.entity.uuid,
                items: newItems,
                barcodeItems: barcodeItems,
                qtyItems: qtyItems,
                entityCode: nextProps.containerRecycle.entity.code,
            });
        }
    }
    /**
    * 刷新
    */
    refresh(entityCode) {
      const { entityUuid } = this.state;
      if (!entityCode) {
        entityCode = this.state.entityCode
      }

      if(entityCode){
        this.props.dispatch({
          type: 'containerRecycle/getByStoreCode',
          payload: entityCode,
          callback:(response)=>{
            if(!response || !response.data || !response.data.uuid){
              message.error("指定的门店容器回收不存在")
              this.onBack()
            }else {
              this.setState({
                entityCode: response.data.code
              })
            }
          }
        });
      }else {
        this.props.dispatch({
          type: 'containerRecycle/get',
          payload: entityUuid
        });
      }
    }
    /**
    * 返回
    */
    onBack = () => {
        this.props.dispatch({
            type: 'containerRecycle/showPage',
            payload: {
                showPage: 'query',
              fromView: true
            }
        });
    }
    onViewShipPlanBill = (planBillNumber) => {
        this.props.dispatch({
            type: 'shipplanbill/getByBillNumber',
            payload: {
                billNumber: planBillNumber
            },
            callback: (response) => {
                if (response && response.success && response.data) {
                    this.props.dispatch(routerRedux.push(
                        {
                            pathname: '/tms/shipplanbill',
                            payload: {
                                showPage: 'view',
                                entityUuid: response.data.uuid
                            }
                        }
                    ))
                }
            }
        })
    }
    onViewShipBill = (shipBillNumber) => {
        this.props.dispatch({
            type: 'shipbill/getByBillNumber',
            payload: {
                billNumber: shipBillNumber,
                companyUuid: loginCompany().uuid
            },
            callback: (response) => {
                if (response && response.success && response.data) {
                    this.props.dispatch(routerRedux.push(
                        {
                            pathname: '/tms/shipbill',
                            payload: {
                                showPage: 'view',
                                entityUuid: response.data.uuid
                            }
                        }
                    ))
                }
            }
        })
    }

    onRecycleByQty = (value) => {
        const { entity } = this.state;

        this.setState({
            confirmLoading: !this.state.confirmLoading
        })

        this.props.dispatch({
            type: 'containerRecycle/recycleByQty',
            payload: {
                companyUuid: loginCompany().uuid,
                fromOrg: entity.fromOrg,
                store: entity.store,
                containerType: JSON.parse(value.containerType),
                recycleCount: value.qty
            },
            callback: response => {
                if (response && response.success) {
                    this.refresh();
                    message.success(containerRecycleLocale.recycleSuccess)
                }

                this.setState({
                    visiblByQty: !this.state.visiblByQty,
                    confirmLoading: false
                })
            }
        })
    }

    onRecycleByBarcode = (value) => {
        const { entity } = this.state;

        this.setState({
            confirmLoading: !this.state.confirmLoading
        })

        this.props.dispatch({
            type: 'containerRecycle/recycleByBarcode',
            payload: {
                companyUuid: loginCompany().uuid,
                fromOrg: entity.fromOrg,
                store: entity.store,
                containerBarcode: value.containerBarcode
            },
            callback: response => {
                if (response && response.success) {
                    this.refresh();
                    message.success(containerRecycleLocale.recycleSuccess)
                }

                this.setState({
                    visiblByBarcode: !this.state.visiblByBarcode,
                    confirmLoading: false
                })
            }
        })
    }

    /**
     * 显示/隐藏审核提示框
     */
    handleQtyModal = () => {
        this.setState({
            visiblByQty: !this.state.visiblByQty
        })
    }

    /**
     * 显示/隐藏审核提示框
     */
    handleBarcodeModal = () => {
        this.setState({
            visiblByBarcode: !this.state.visiblByBarcode
        })
    }

    /**
    * 绘制右上角按钮
    */
    drawActionButtion = () => {
        const { entity, items } = this.state;

        return (
            <Fragment>
              <Button onClick={this.handleBarcodeModal}
                    disabled={!havePermission(CONTAINERRECYCLE_RES.RECYCLE)}
                    style={{
                        display: entity && items.length > 0 ? '' : 'none'
                    }}>
                  {containerRecycleLocale.recycleByBarcode}
                </Button>
              <Button onClick={this.handleQtyModal}
                    disabled={!havePermission(CONTAINERRECYCLE_RES.RECYCLE)}
                    style={{
                        display: entity && items.length > 0 ? '' : 'none'
                    }}>
                  {containerRecycleLocale.recycleByQty}
                </Button>
              <Button onClick={this.onBack}>
                {commonLocale.backLocale}
              </Button>
            </Fragment>
        );

    }
    /**
    * 绘制信息详情
    */
    drawBillInfoTab = () => {
        const { entity, items, qtyItems, barcodeItems } = this.state;

        let profileItems = [
            {
                label: commonLocale.inStoreLocale,
                value: convertCodeName(entity.store)
            },
            {
                label: containerRecycleLocale.fromOrg,
                value: convertCodeName(entity.fromOrg)
            },
            {
                label: containerRecycleLocale.storeQty,
                value: entity.storeCount,
            },
            {
                label: containerRecycleLocale.recycleQty,
                value: entity.recycleCount
            },{
                label: commonLocale.noteLocale,
                value: entity.note
          }];

        let containerCols = [
            {
                title: commonLocale.containerLocale,
                dataIndex: 'containerBarcode',
                width: colWidth.codeColWidth,
            }, {
                title: containerRecycleLocale.containerType,
                dataIndex: 'containerType',
                width: itemColWidth.numberEditColWidth,
                render: (text, record) => convertCodeName(record.containerType)
            }, {
                title: commonLocale.stateLocale,
                dataIndex: 'state',
                width: colWidth.enumColWidth,
                render: (text, record) => record.state ? State[record.state].caption : <Empty />
            }, {
                title: containerRecycleLocale.recycleType,
                dataIndex: 'type',
                width: colWidth.enumColWidth,
                render: (text, record) => record.type ? ContainerRecycleType[record.type].caption : <Empty />
            }, {
                title: containerRecycleLocale.shipBillNumber,
                dataIndex: 'shipBillNumber',
                width: colWidth.billNumberColWidth,
                render: (text, record) => <a onClick={this.onViewShipBill.bind(true, record.shipBillNumber)}>
                    {<EllipsisCol colValue={record.shipBillNumber} />}</a>
            }, {
                title: containerRecycleLocale.shipPlanBillNumber,
                dataIndex: 'shipPlanBillNumber',
                width: colWidth.billNumberColWidth,
                render: (text, record) => <a onClick={this.onViewShipPlanBill.bind(true, record.shipPlanBillNumber)}>{<EllipsisCol colValue={record.shipPlanBillNumber} />}</a>
            },
        ];



        return (
            <TabPane key="basicInfo" tab={commonLocale.billInfoLocale}>
                <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()} />
                <ViewTablePanel
                    title={commonLocale.itemsLocale}
                    columns={containerCols}
                    data={items}
                />


                <RecycleByQtyModal
                    ModalTitle={containerRecycleLocale.recycleByQty}
                    visible={this.state.visiblByQty}
                    store={entity.store}
                    items={items}
                    handleAuditModalVisible={this.handleQtyModal}
                    handleSave={this.onRecycleByQty}
                    confirmLoading={this.state.confirmLoading}
                />
                <RecycleByBarcodeModal
                    ModalTitle={containerRecycleLocale.recycleByBarcode}
                    visible={this.state.visiblByBarcode}
                    items={items}
                    handleAuditModalVisible={this.handleBarcodeModal}
                    handleSave={this.onRecycleByBarcode}
                    confirmLoading={this.state.confirmLoading}
                />
            </TabPane>
        );
    }

    /**
    * 绘制Tab页
    */
    drawTabPanes = () => {
        let tabPanes = [
            this.drawBillInfoTab(),
        ];

        return tabPanes;
    }

  darwProcess = () => {
    return <a onClick={() => this.viewProcessView()}>流程进度</a>;
  };

  viewProcessView = () => {
    this.setState({
      showProcessView: !this.state.showProcessView
    });
  };

  drawOthers = () =>{
    const others = [];
    if(this.state.showProcessView){
      const { entity, items, qtyItems, barcodeItems } = this.state;
      const data = [{
        title:'开始回收',
        current: entity.state !== '',
        description:[
          {
            label: containerRecycleLocale.qtyContainers,
            value: qtyItems ? qtyItems.length : 0
          },
          {
            label: containerRecycleLocale.barcodeContainers,
            value: barcodeItems ? barcodeItems.length : 0
          }
        ]
      },{
        title:'结束回收',
        current: entity.state == State.RECYCLED.name,
        description: []
      },
      ];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
