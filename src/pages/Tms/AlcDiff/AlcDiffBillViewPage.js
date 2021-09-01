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
import { convertCodeName, convertArticleDocField } from '@/utils/utils';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { sourceWay } from '@/utils/SourceWay';
import { havePermission } from '@/utils/authority';
import { alcDiffLocal } from './AlcDiffBillLocale';
import { AlcClassify, State, Type } from './AlcDiffBillContants';
import { ALCDIFFBILL_RES } from './AlcDiffBillPremission';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { binUsage } from '@/utils/BinUsage';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import { toQtyStr } from '@/utils/QpcStrUtil';
import { routerRedux } from 'dva/router';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import styles from "@/pages/Out/Wave/Wave.less";
const TabPane = Tabs.TabPane;
@connect(({ alcDiff, loading }) => ({
    alcDiff,
    loading: loading.models.alcDiff,
}))
export default class AlcDiffBillViewPage extends ViewPage {
    constructor(props) {
        super(props);
        this.state = {
            entity: {},
            items: [],
            entityUuid: props.alcDiff.entityUuid,
            title: '',
            visibleDelete: false,
            visiblAudit: false,
            confirmLoading: false,
            billNumber: props.alcDiff.billNumber,
        }
    }
    componentDidMount() {
      this.refresh(this.state.billNumber, this.state.entityUuid);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.alcDiff.entity) {
            this.setState({
                entity: nextProps.alcDiff.entity,
                items: nextProps.alcDiff.entity.state && State.INITIAL.name === State[nextProps.alcDiff.entity.state].name ?
                    (nextProps.alcDiff.entity.simItems ? nextProps.alcDiff.entity.simItems : [])
                    : (nextProps.alcDiff.entity.items ? nextProps.alcDiff.entity.items : []),
                title: alcDiffLocal.title + '：' + nextProps.alcDiff.entity.billNumber,
                entityUuid: nextProps.alcDiff.entity.uuid,
            });
        }
    }
    /**
    * 刷新
    */
    refresh(billNumber, entityUuid) {
      if (!billNumber && !entityUuid) {
        billNumber = this.state.billNumber;
      }
      if (billNumber) {
        this.props.dispatch({
          type: 'alcDiff/getByBillNumber',
          payload: {
            billNumber: billNumber,
            dcUuid: loginOrg().uuid
          },
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的配货差异单' + billNumber + '不存在！');
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
      if (entityUuid) {
        this.props.dispatch({
          type: 'alcDiff/get',
          payload: entityUuid,
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的配货差异单' + billNumber + '不存在！');
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
            type: 'alcDiff/showPage',
            payload: {
                showPage: 'query',
              fromView: true
            }
        });
    }
    /**
    * 编辑
    */
    onEdit = () => {
        const { entity, entityUuid } = this.state;
        let showPage = State.SAVED.name === State[entity.state].name ? 'create' : 'edit';

        this.props.dispatch({
            type: 'alcDiff/showPage',
            payload: {
                showPage: showPage,
                entityUuid: entityUuid
            }
        });
    }
    /**
     * 显示/隐藏删除提示框
     */
    handleDeleteModal = () => {
        this.setState({
            visibleDelete: !this.state.visibleDelete
        })
    }
    handleAuditModal = () => {
        this.setState({
            visiblAudit: !this.state.visiblAudit
        })
    }

    onAudit = () => {
        const { entity } = this.state

        this.setState({
            confirmLoading: !this.state.confirmLoading
        })

        this.props.dispatch({
            type: 'alcDiff/audit',
            payload: {
                uuid: entity.uuid,
                version: entity.version
            },
            callback: (response) => {
                if (response && response.success) {
                    this.refresh(entity.billNumber);
                    message.success(commonLocale.auditSuccessLocale)
                }

                this.setState({
                    visiblAudit: !this.state.visiblAudit,
                    confirmLoading: false
                })
            }
        })
    }
    /**
     * 删除
     */
    onDelete = () => {
        const { entity } = this.state

        this.setState({
            confirmLoading: !this.state.confirmLoading
        })

        this.props.dispatch({
            type: 'alcDiff/remove',
            payload: {
                uuid: entity.uuid,
                version: entity.version
            },
            callback: (response) => {
                if (response && response.success) {
                    this.onBack();
                    message.success(commonLocale.removeSuccessLocale)
                }

                this.setState({
                    visibleDelete: !this.state.visibleDelete,
                    confirmLoading: false
                })
            }
        })

    }

    onViewStoreHandoverBill = (billNumber) => {
        this.props.dispatch({
            type: 'storeHandover/getByBillNumber',
            payload: {
                billNumber: billNumber,
                companyUuid: loginCompany().uuid
            },
            callback: (response) => {
                if (response && response.success && response.data) {
                    this.props.dispatch(routerRedux.push({
                        pathname: '/tms/storeHandoverbill',
                        payload: {
                            showPage: 'view',
                            entityUuid: response.data.uuid
                        }
                    }))
                }
            }
        })
    }

    onViewAlcNtcBill = (billNumber) => {
        this.props.dispatch({
            type: 'alcNtc/getByNumber',
            payload: billNumber,
            callback: (response) => {
                if (response && response.success && response.data) {
                    this.props.dispatch(routerRedux.push({
                        pathname: '/out/alcNtc',
                        payload: {
                            showPage: 'view',
                            entityUuid: response.data.uuid
                        }
                    }))
                }
            }
        })
    }

    previousBill = () => {
        const { entity } = this.state;
        if (entity.uuid) {
            this.props.dispatch({
                type: 'alcDiff/previousBill',
                payload: entity.billNumber
            });
        }
    }

    nextBill = () => {
        const { entity } = this.state;
        if (entity.uuid) {
            this.props.dispatch({
                type: 'alcDiff/nextBill',
                payload: entity.billNumber
            });
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
              <PrintButton
                reportParams={[{ billNumber: `${entity.billNumber}` }]}
                moduleId={PrintTemplateType.ALCDIFFBILL.name} />

              <Button onClick={this.onEdit}
                    disabled={!havePermission(ALCDIFFBILL_RES.EDIT)}
                    style={{
                        display: entity && (entity.state === State.SAVED.name || entity.state === State.INITIAL.name
                            || entity.state === State.APPROVED.name)
                            ? '' : 'none'
                    }}>
                  {commonLocale.editLocale}
                </Button>

              <Button onClick={this.handleAuditModal}
                    disabled={!havePermission(ALCDIFFBILL_RES.AUDIT)}
                    style={{
                        display: entity && (entity.state === State.SAVED.name || entity.state === State.APPROVED.name)
                            ? '' : 'none'
                    }}>
                  {commonLocale.auditLocale}
                </Button>

              <Button onClick={this.handleDeleteModal}
                    disabled={!havePermission(ALCDIFFBILL_RES.DELETE)}
                    style={{
                        display: entity && entity.state === State.SAVED.name
                            ? '' : 'none'
                    }}>
                  {commonLocale.deleteLocale}
                </Button>


            </Fragment>
        );

    }
    /**
    * 绘制信息详情
    */
    drawBillInfoTab = () => {
        const { entity } = this.state;

        let profileItems = [{
            label: alcDiffLocal.handoverBillNumber,
            value: <a onClick={this.onViewStoreHandoverBill.bind(true, entity.storeHandoverBillNumber)}>
                {entity.storeHandoverBillNumber}</a>
        },
        {
            label: alcDiffLocal.alcNtcBillNumber,
            value: <a onClick={this.onViewAlcNtcBill.bind(true, entity.alcNtcBillNumber)}>
                {entity.alcNtcBillNumber}</a>
        },
        {
            label: alcDiffLocal.sourceBillNumber,
            value: entity.sourceBillNumber
        },
        {
            label: commonLocale.inOwnerLocale,
            value: convertCodeName(entity.owner)
        },
        {
            label: commonLocale.inWrhLocale,
            value: convertCodeName(entity.wrh)
        },
        {
            label: commonLocale.inStoreLocale,
            value: <a onClick={this.onViewStore.bind(true, entity.store ? entity.store.uuid : undefined)}>
                {convertCodeName(entity.store)}</a>
        },
        {
            label: alcDiffLocal.differ,
            value: convertCodeName(entity.differ)
        },
        {
            label: alcDiffLocal.alctype,
            value: entity.diffType
        },
        {
            label: alcDiffLocal.alcDiffDutyType,
            value: entity.alcDiffDutyType ? AlcClassify[entity.alcDiffDutyType].caption : ''
        },
        {
            label: commonLocale.inUploadDateLocale,
            value: entity.uploadDate
        },
        {
            label: commonLocale.noteLocale,
            value: entity.note
        }];


        let simItemsCols = [
            {
                title: commonLocale.lineLocal,
                dataIndex: 'line',
                width: itemColWidth.lineColWidth,
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
            }, {
                title: alcDiffLocal.type,
                dataIndex: 'type',
                width: colWidth.enumColWidth,
                render: (text, record) => (record.type ? Type[record.type].caption : <Empty />)
            }, {
                title: commonLocale.inQtyStrLocale,
                dataIndex: 'qtyStr',
                key: 'qtyStr',
                width: itemColWidth.qtyStrColWidth,
                render: (text, record) => (record.qty ? toQtyStr(record.qty, record.qpcStr) : 0)
            },
            {
                title: commonLocale.inQtyLocale,
                dataIndex: 'qty',
                key: 'qty',
                width: itemColWidth.qtyColWidth,
            },
            {
                title: commonLocale.inAllRealQtyStrLocale,
                dataIndex: 'realQtyStr',
                key: 'realQtyStr',
                width: itemColWidth.qtyStrColWidth,
                render: (text, record) => (record.realQty ? toQtyStr(record.realQty, record.qpcStr) : 0)
            },
            {
                title: commonLocale.inAllRealQtyLocale,
                dataIndex: 'realQty',
                key: 'realQty',
                width: itemColWidth.qtyColWidth,
                render: (text, record) => (record.realQty ? record.realQty : 0)
            },
        ];

        let articleCols = [
            {
                title: commonLocale.lineLocal,
                dataIndex: 'line',
                width: itemColWidth.lineColWidth,
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
            }, {
                title: alcDiffLocal.type,
                dataIndex: 'type',
                width: colWidth.enumColWidth,
                render: (text, record) => (record.type ? Type[record.type].caption : <Empty />)
            },
            {
                title: commonLocale.inVendorLocale,
                dataIndex: 'vendor',
                width: colWidth.codeNameColWidth,
                render: (text, record) => record.vendor && record.vendor.uuid ?
                    <a onClick={this.onViewVendor.bind(true, record.vendor ? record.vendor.uuid : undefined)}>
                        {<EllipsisCol colValue={convertCodeName(record.vendor)} />}</a> : <Empty />
            }, {
                title: commonLocale.inQtyStrLocale,
                dataIndex: 'qtyStr',
                key: 'qtyStr',
                width: itemColWidth.qtyStrColWidth,
                render: (text, record) => (record.qtyStr ? record.qtyStr : toQtyStr(record.qty, record.qpcStr))
            },
            {
                title: commonLocale.inQtyLocale,
                dataIndex: 'qty',
                key: 'qty',
                width: itemColWidth.qtyColWidth,
            },
            {
                title: commonLocale.inProductionBatchLocale,
                dataIndex: 'productionBatch',
                key: 'productionBatch',
                width: colWidth.dateColWidth,
                render: (text, record) => (record.productionBatch ? record.productionBatch : <Empty />)
            }, {
                title: commonLocale.bincodeLocale,
                dataIndex: 'binCode',
                key: 'binCode',
                width: colWidth.codeColWidth,
                render: (text, record) => (record.binCode ? record.binCode : <Empty />)
            }, {
                title: commonLocale.inBinUsageLocale,
                dataIndex: 'binUsage',
                key: 'binUsage',
                render: (text, record) => record.binUsage ? binUsage[record.binUsage].caption : <Empty />,
                width: colWidth.enumColWidth,
            },
            {
                title: commonLocale.inContainerBarcodeLocale,
                dataIndex: 'containerBarcode',
                key: 'containerBarcode',
                width: colWidth.codeColWidth,
                render: (text, record) => <a onClick={this.onViewContainer.bind(true, record.containerBarcode)}
                    disabled={'-' === text}>{record.containerBarcode ? record.containerBarcode : <Empty />}</a>
            }, {
                title: commonLocale.inPriceLocale,
                dataIndex: 'price',
                key: 'price',
                width: itemColWidth.priceColWidth,
                render: text => text ? text : <Empty />
            }
        ]

        let stockCols = [
            {
              title: commonLocale.lineLocal,
              dataIndex: 'line',
              width: itemColWidth.lineColWidth,
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
                render: (text, record) => (record.qpcStr + '/' + (record.article && record.article.munit ? record.article.munit : '-'))
            },
            {
                title: commonLocale.inVendorLocale,
                dataIndex: 'vendor',
                width: colWidth.codeNameColWidth,
                render: (text, record) => <a onClick={this.onViewVendor.bind(true, record.vendor ? record.vendor.uuid : undefined)}>
                    {<EllipsisCol colValue={convertCodeName(record.vendor)} />}</a>
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
                render: (text) => {
                    return moment(text).format('YYYY-MM-DD');
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
                render: (text, record) => <a onClick={this.onViewContainer.bind(true, record.containerBarcode)}
                    disabled={'-' === text}>{record.containerBarcode ? record.containerBarcode : <Empty />}</a>
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
        let tabPanes = [];
        if (sourceWay.INTERFACE_IMPORT.name === entity.sourceWay) {
          tabPanes.push(
            <TabPane tab='下发明细' key="simItemsCols">
              <ViewTablePanel
                data={entity.simItems ? entity.simItems : []}
                columns={simItemsCols}
              />
            </TabPane>)
        };
        tabPanes.push(
          <TabPane tab='商品明细' key="articleCols">
            <ViewTablePanel
              data={this.state.items}
              columns={articleCols}
            />
          </TabPane>,
          <TabPane tab='库存信息' key="stockCols">
            <ViewTablePanel
              data={entity.stockItems ? entity.stockItems : []}
              columns={stockCols}
            />
          </TabPane>);
          let tabsItem = [
            <Tabs key='itemTabs' defaultActiveKey="billItems" className={styles.ItemTabs}>
              {tabPanes}
            </Tabs>
          ]
        return (
            <TabPane key="basicInfo" tab={commonLocale.billInfoLocale}>
                <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()} />
                <ViewPanel title={commonLocale.itemsLocale} children={tabsItem} />
                <div>
                    <Modal
                        title={commonLocale.deleteLocale}
                        visible={this.state.visibleDelete}
                        uuid={this.state.entity.uuid}
                        onOk={this.onDelete}
                        confirmLoading={this.state.confirmLoading}
                        onCancel={this.handleDeleteModal}
                    >
                        <p>{alcDiffLocal.IPopconfirmDeleteTitle + ':' + this.state.entity.billNumber}</p>
                    </Modal>
                    <Modal
                        title={commonLocale.auditLocale}
                        visible={this.state.visiblAudit}
                        uuid={this.state.entity.uuid}
                        onOk={this.onAudit}
                        confirmLoading={this.state.confirmLoading}
                        onCancel={this.handleAuditModal}
                    >
                        <p>{alcDiffLocal.IPopconfirmAuditTitle + ':' + this.state.entity.billNumber}</p>
                    </Modal>
                </div>
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
      let statisticProfile = entity.tmsStatisticProfile;
      const data = [{
        title:'新建配货差异单',
        subTitle:entity.createInfo.time,
        current: entity.state !== '',
        description:[
          {
            label: commonLocale.inAllQtyStrLocale,
            value: entity.qtyStr ? entity.qtyStr : '0'
          }, {
            label: commonLocale.inAllArticleCountLocale,
            value: entity.articleCount ? entity.articleCount : '0'
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
          }
        ]
      },{
        title:'审核配货差异单',
        subTitle:entity.state == State.AUDITED.name ?entity.lastModifyInfo.time:'',
        current: entity.state == State.AUDITED.name,
        description: []
      }
      ];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
