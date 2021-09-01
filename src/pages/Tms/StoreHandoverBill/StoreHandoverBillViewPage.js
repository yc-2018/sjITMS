import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, Tabs, Modal, message } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import Empty from '@/pages/Component/Form/Empty';
import TagUtil from '@/pages/Component/TagUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { convertCodeName, convertArticleDocField, convertDateToTime } from '@/utils/utils';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { storeHandoverLocale } from './StoreHandoverBillLocale';
import { State, CollectBinReviewType, ContainerRecycleType } from './StoreHandoverBillContants';
import { STOREHANDOVERBILL_RES } from './StoreHandoverBillPremission';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { orgType } from '@/utils/OrgType';
import { routerRedux } from 'dva/router';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import styles from "@/pages/Out/Wave/Wave.less";
const TabPane = Tabs.TabPane;
@connect(({ storeHandover, loading }) => ({
    storeHandover,
    loading: loading.models.storeHandover,
}))
export default class StoreHandoverBillViewPage extends ViewPage {
    constructor(props) {
        super(props);
        this.state = {
            entity: {},
            entityUuid: props.storeHandover.entityUuid,
            title: '',
            visiblConfirm: false,
            confirmLoading: false,
            billNumber: props.billNumber,
            page: 0,
            pageSize: 10
        }
    }
    componentDidMount() {
      this.refresh(this.state.billNumber, this.state.entityUuid);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.storeHandover.entity) {
            this.setState({
                entity: nextProps.storeHandover.entity,
                title: storeHandoverLocale.title + '：' + nextProps.storeHandover.entity.billNumber,
                entityUuid: nextProps.storeHandover.entity.uuid,
            });
        }
    }
    /**
    * 刷新
    */
    refresh(billNumber, uuid) {
      const{entityUuid} = this.state;
      if (!billNumber && !uuid) {
        billNumber = this.state.billNumber;
      }
      if (billNumber) {
        this.props.dispatch({
          type: 'storeHandover/getByBillNumber',
          payload: {
            billNumber: billNumber,
            dcUuid: loginOrg().uuid
          },
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的门店交接单' + billNumber + '不存在！');
              this.onBack();
            } else {
              this.setState({
                billNumber: res.data.billNumber,
              });
            }
          }
        });
        return;
      }
      if (uuid) {
        this.props.dispatch({
          type: 'storeHandover/get',
          payload: uuid,
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的门店交接单' + billNumber + '不存在！');
              this.onBack();
            } else {
              this.setState({
                billNumber: res.data.billNumber,
              });
            }
          }
        });
      }else{
        this.props.dispatch({
          type: 'storeHandover/get',
          payload: entityUuid,
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的门店交接单' + billNumber + '不存在！');
              this.onBack();
            } else {
              this.setState({
                billNumber: res.data.billNumber,
              });
            }
          }
        });
      }
    }
    /**
    * 返回
    */
    onBack = () => {
        this.props.dispatch({
            type: 'storeHandover/showPage',
            payload: {
                showPage: 'query',
              fromView: true
            }
        });
    }

  /**
   * 点击上一单
   */
  previousBill = () => {
    const { entity } = this.state;
    if (entity.uuid){
      this.props.dispatch({
        type: 'storeHandover/previousBill',
        payload: entity.billNumber
      });
    }
  }
  /**
   * 点击下一单
   */
  nextBill = () => {
    const { entity } = this.state;
    if (entity.uuid){
      this.props.dispatch({
        type: 'storeHandover/nextBill',
        payload: entity.billNumber
      });
    }
  }
    /**
    * 编辑
    */
    onEdit = () => {
        this.props.dispatch({
            type: 'storeHandover/showPage',
            payload: {
                showPage: 'create',
                entityUuid: this.state.entityUuid
            }
        });
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
    /**
* 编辑
*/
    onDcConfirm = () => {
        const { entity } = this.state;

        this.setState({
            confirmLoading: !this.state.confirmLoading
        })

        this.props.dispatch({
            type: 'storeHandover/onDCConfirm',
            payload: {
                uuid: entity.uuid,
                version: entity.version
            },
            callback: (response) => {
                if (response && response.success) {
                  this.refresh(entity.billNumber)
                  message.success(commonLocale.auditSuccessLocale);
                }

                this.setState({
                    visiblConfirm: !this.state.visiblConfirm,
                    confirmLoading: false,
                    billNumber: entity.billNumber
                })
            }
        });
    }

    /**
     * 显示/隐藏审核提示框
     */
    handleConfirmModal = () => {
        this.setState({
            visiblConfirm: !this.state.visiblConfirm
        })
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
              <PrintButton
                reportParams={[{ billNumber: `${entity.billNumber}` }]}
                moduleId={PrintTemplateType.STOREHANDOVERBILL.name} />

                {(orgType.carrier.name != loginOrg().type) && <Button onClick={this.onEdit}
                    disabled={!havePermission(STOREHANDOVERBILL_RES.EDIT)}
                    style={{
                        display: entity && entity.state === State.AUDITED.name
                            ? 'none' : ''
                    }}>
                    {commonLocale.editLocale}
                </Button>}
                {(orgType.carrier.name != loginOrg().type) && <Button onClick={this.handleConfirmModal}
                    disabled={!havePermission(STOREHANDOVERBILL_RES.CONFIRM)}
                    style={{
                        display: entity && entity.state === State.AUDITED.name
                            ? 'none' : ''
                    }}>
                  {storeHandoverLocale.dcConfirmTime}
                </Button>}

            </Fragment>
        );

    }
    /**
    * 绘制信息详情
    */
    drawBillInfoTab = () => {
        const { entity } = this.state;

        let profileItems = [{
            label: storeHandoverLocale.shipBillNumber,
            value: <a onClick={this.onViewShipBill.bind(true, entity.shipBillNumber)}>{entity.shipBillNumber}</a>
        },
        {
            label: storeHandoverLocale.fromOrg,
            value: convertCodeName(entity.fromOrg)
        },
        {
            label: commonLocale.inStoreLocale,
            value: <a onClick={this.onViewStore.bind(true, entity.store ? entity.store.uuid : undefined)}>{convertCodeName(entity.store)}</a>
        },
        {
            label: storeHandoverLocale.vehicle,
            value: convertCodeName(entity.vehicle)
        },
        {
            label: commonLocale.inUploadDateLocale,
            value: convertDateToTime(entity.uploadDate)
        },
        {
            label: commonLocale.noteLocale,
            value: entity.note
        }];

        let handoverCols = [
            {
              title: commonLocale.lineLocal,
              dataIndex: 'line',
              width: 40,
              render: (text, record, index) => this.state.page * 10 + index + 1
            },
            {
                title: storeHandoverLocale.handoverType,
                dataIndex: 'type',
                width: colWidth.enumColWidth,
                render: (text, record) => record.type ? CollectBinReviewType[record.type].caption : <Empty />
            }, {
                title: storeHandoverLocale.handoverItem,
                dataIndex: 'handoverItem',
                width: colWidth.codeNameColWidth,
                render: (text, record) => {
                    if (!record.handoverItem)
                        return <Empty />;
                    return <span> {CollectBinReviewType[record.type].name === CollectBinReviewType.WHOLECONTAINERQTYSTR.name
                        ? record.handoverItem.name : convertCodeName(record.handoverItem)}</span>
                }
            }, {
                title: storeHandoverLocale.handoverQty,
                dataIndex: 'qtyStr',
                width: itemColWidth.qtyStrColWidth,
            }, {
                title: storeHandoverLocale.realHanoverQty,
                dataIndex: 'realQtyStr',
                width: itemColWidth.qtyStrColWidth,
                render: (text, record) => record.realQtyStr ? record.realQtyStr : '0'
            }
        ];

        let containerRecycleCols = [
            {
              title: commonLocale.lineLocal,
              dataIndex: 'line',
              width: 40,
              render: (text, record, index) => this.state.page * 10 + index + 1
            },
            {
                title: storeHandoverLocale.containerType,
                dataIndex: 'containerType',
                width: colWidth.codeNameColWidth,
                render: (text, record) => convertCodeName(record.containerType)
            }, {
                title: storeHandoverLocale.recycleType,
                dataIndex: 'recycleType',
                width: colWidth.enumColWidth,
                render: (text, record) => record.recycleType ? ContainerRecycleType[record.recycleType].caption : <Empty />
            }, {
                title: storeHandoverLocale.recycleQty,
                dataIndex: 'qty',
                width: itemColWidth.qtyColWidth,
            }, {
                title: storeHandoverLocale.realRecycleQty,
                dataIndex: 'realQty',
                width: itemColWidth.qtyColWidth,
            }
        ];

        let returnDcTypeColumns = [
            {
              title: commonLocale.lineLocal,
              dataIndex: 'line',
              width: 40,
              render: (text, record, index) => this.state.page * 10 + index + 1
            },
            {
                title: storeHandoverLocale.returnDcType,
                key: 'returnDcItemName',
                dataIndex: 'returnDcItemName',
                width: itemColWidth.codeNameColWidth
            },
            {
                title: storeHandoverLocale.returnDcTypeQtyStr,
                dataIndex: 'qtyStr',
                key: 'qtyStr',
                width: itemColWidth.qtyStrColWidth,
                render: (rext, record) => record.qtyStr ? record.qtyStr : 0
            },
            {
                title: storeHandoverLocale.realReturnDcTypeQtyStr,
                key: 'realQtyStr',
                dataIndex: 'realQtyStr',
                width: itemColWidth.qtyStrColWidth,
                render: (rext, record) => record.realQtyStr ? record.realQtyStr : 0
            }
        ]

        let articleCols = [
            {
              title: commonLocale.lineLocal,
              dataIndex: 'line',
              width: 40,
              render: (text, record, index) => this.state.page * 10 + index + 1
            },
            {
                title: commonLocale.articleLocale,
                width: itemColWidth.articleColWidth,
                render: record => <a onClick={() => this.onViewArticle(record.article.articleUuid)} >
                    <EllipsisCol colValue={convertArticleDocField(record.article)} /></a>
            },
            {
                title: commonLocale.inQpcAndMunitLocale,
                width: itemColWidth.qpcStrColWidth,
                render: (text, record) => (record.qpcStr + '/' + (record.article ? record.article.munit : '-'))
            },
            {
                title: commonLocale.inOwnerLocale,
                dataIndex: 'owner',
                width: colWidth.codeNameColWidth,
                render: (rext, record) => <EllipsisCol colValue={convertCodeName(record.owner)} />
            },
            {
                title: commonLocale.inVendorLocale,
                dataIndex: 'vendor',
                width: colWidth.codeNameColWidth,
                render: (rext, record) => <EllipsisCol colValue={convertCodeName(record.vendor)} />
            }, {
                title: commonLocale.inQtyStrLocale,
                dataIndex: 'qtyStr',
                key: 'qtyStr',
                width: itemColWidth.qtyStrColWidth,
            },
            {
                title: commonLocale.inQtyLocale,
                dataIndex: 'qty',
                key: 'qty',
                width: itemColWidth.qtyColWidth,
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
                title: commonLocale.bincodeLocale,
                dataIndex: 'binCode',
                key: 'binCode',
                width: colWidth.codeColWidth,
                render: text => text ? text : <Empty />
            },
            {
                title: commonLocale.inContainerBarcodeLocale,
                dataIndex: 'containerBarcode',
                key: 'containerBarcode',
                width: colWidth.codeColWidth,
                render: text => <a onClick={this.onViewContainer.bind(true, text)}
                    disabled={'-' === text}>{text}</a>
            },
            {
                title: commonLocale.inStockBatchLocale,
                dataIndex: 'stockBatch',
                key: 'stockBatch',
                width: itemColWidth.stockBatchColWidth,
                render: text => text ? <EllipsisCol colValue={text} /> : <Empty />
            }, {
                title: commonLocale.inPriceLocale,
                dataIndex: 'price',
                key: 'price',
                width: itemColWidth.priceColWidth,
                render: text => text ? text : <Empty />
            }
        ]
        let tabPanes = [
          <TabPane tab='交接信息' key="items">
            <ViewTablePanel
              data={entity.items ? entity.items : []}
              columns={handoverCols}
            />
          </TabPane>,
          <TabPane tab="容器回收" key="recycleItems">
            <ViewTablePanel
              data={entity.recycleItems ? entity.recycleItems : []}
              columns={containerRecycleCols}
            />
          </TabPane>,
          <TabPane tab={storeHandoverLocale.returnDcItems} key="returnDcItems">
            <ViewTablePanel
              data={entity.returnDcItems ? entity.returnDcItems : []}
              columns={returnDcTypeColumns}
            />
          </TabPane>,
            <TabPane tab="商品信息" key="articleItems">
              <ViewTablePanel
                data={entity.articleItems ? entity.articleItems : []}
                columns={articleCols}
              />
          </TabPane>
        ];
        let tabsItem = [
          <Tabs key='itemTabs' defaultActiveKey="billItems" className={styles.ItemTabs}>
            {tabPanes}
          </Tabs>
        ]

        return (
            <TabPane key="basicInfo" tab={commonLocale.billInfoLocale}>
                <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()} />
                <ViewPanel title={commonLocale.itemsLocale} children={tabsItem} />
                <Modal
                    title={storeHandoverLocale.dcConfirmTime}
                    visible={this.state.visiblConfirm}
                    uuid={this.state.entity.uuid}
                    onOk={this.onDcConfirm}
                    onCancel={this.handleConfirmModal}
                    confirmLoading={this.state.confirmLoading}
                >
                    <p>{storeHandoverLocale.IPopconfirmComTitle + ':' + this.state.entity.billNumber}</p>
                </Modal>
            </TabPane>
        );
    }

    drawStateTag = () => {
        if (this.state.entity.state) {
            return (
                <TagUtil value={this.state.entity.state} />
            );
        }
    }
    /**
     * 判断状态节点
    */
    getDot = (state) => {
        if (state === State.UNHANDOVER.name) { return 0; }
        if (state === State.STOREHANDOVER.name) { return 1; }
        if (state === State.AUDITED.name) { return 2; }
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
      const  entity  = this.state.entity;
      const data = [{
        title:'开始配送',
        subTitle:entity.departTime,
        current: entity.departTime !== '' && entity.departTime !== undefined,
        description:[
          {
            label: commonLocale.inAllAmountLocale,
            value: entity.amount
          },
          {
            label: commonLocale.inTmsWeightLocale,
            value: entity.weight ? (entity.weight / 1000).toFixed(4) : 0
          }, {
            label: commonLocale.inAllVolumeLocale,
            value: entity.volume
          }
        ]
      },{
        title:'门店交接',
        subTitle:entity.storeReceiveTime,
        current: entity.storeReceiveTime !== '' && entity.storeReceiveTime !== undefined,
        description: []
      },
        {
          title:'配送确认',
          subTitle:entity.dcConfirmTime,
          current: entity.dcConfirmTime !== '' && entity.dcConfirmTime !== undefined,
          description: []
        },
      ];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
