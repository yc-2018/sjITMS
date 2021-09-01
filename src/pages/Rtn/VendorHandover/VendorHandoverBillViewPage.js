import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, Tabs, Modal, message } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import Empty from '@/pages/Component/Form/Empty';
import TagUtil from '@/pages/Component/TagUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { itemColWidth, colWidth } from '@/utils/ColWidth';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName, convertArticleDocField } from '@/utils/utils';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { vendorHandoverLocale } from './VendorHandoverBillLocale';
import { State, METHOD } from './VendorHandoverBillContants';
import { VENDORHANDOVER_RES } from './VendorHandoverBillPermission';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { storeRtnLocal } from '@/pages/Rtn/StoreRtn/StoreRtnBillLocale';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import styles from "@/pages/Out/Wave/Wave.less";

const TabPane = Tabs.TabPane;
@connect(({ vendorHandover, loading }) => ({
    vendorHandover,
    loading: loading.models.vendorHandover,
}))
export default class VendorHandoverBillViewPage extends ViewPage {
    constructor(props) {
        super(props);
        this.state = {
            entity: {},
            items: [],
            entityUuid: props.vendorHandover.entityUuid,
            title: '',
            visibleDelete: false,
            visiblAudit: false,
            confirmLoading: false,
            billNumber: props.vendorHandover.billNumber,
        }
    }
    componentDidMount() {
      this.refresh(this.state.billNumber, this.state.entityUuid);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.vendorHandover.entity) {
            this.setState({
                entity: nextProps.vendorHandover.entity,
                items: nextProps.vendorHandover.entity.items ? nextProps.vendorHandover.entity.items : [],
                title: vendorHandoverLocale.title + '：' + nextProps.vendorHandover.entity.billNumber,
                entityUuid: nextProps.vendorHandover.entity.uuid,
            });
        }
    }
    /**
    * 刷新
    */

    refresh(billNumber, uuid) {
      const {entityUuid} = this.state;
      if (!billNumber && !uuid) {
        billNumber = this.state.billNumber;
      }
      if (billNumber) {
        this.props.dispatch({
          type: 'vendorHandover/getByBillNumber',
          payload: {
            billNumber: billNumber,
            dcUuid: loginOrg().uuid
          },
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的供应商交接单' + billNumber + '不存在！');
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
          type: 'vendorHandover/get',
          payload: uuid,
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的供应商交接单' + billNumber + '不存在！');
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
          type: 'vendorHandover/get',
          payload: entityUuid,
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的供应商交接单' + billNumber + '不存在！');
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
            type: 'vendorHandover/showPage',
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
        type: 'vendorHandover/previousBill',
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
        type: 'vendorHandover/nextBill',
        payload: entity.billNumber
      });
    }
  }
    /**
    * 编辑
    */
    onEdit = () => {
        this.props.dispatch({
            type: 'vendorHandover/showPage',
            payload: {
                showPage: 'create',
                entityUuid: this.state.entityUuid
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
        const { entity, confirmLoading } = this.state
        this.setState({
            confirmLoading: !confirmLoading
        })

        let type = 'vendorHandover/audit';
        if (entity.state === 'INPROGRESS') {
            type = 'vendorHandover/auditByInprogress';
        }
        this.props.dispatch({
            type: type,
            payload: {
                uuid: entity.uuid,
                version: entity.version
            },
            callback: (response) => {
                if (response && response.success) {
                    this.refresh(entity.billNumber);
                    message.success(commonLocale.auditLocale)
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
        const { entity, confirmLoading } = this.state
        this.setState({
            confirmLoading: !confirmLoading
        })

        this.props.dispatch({
            type: 'vendorHandover/remove',
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
                reportParams={[{ billNumber: `${entity.billNumber}` }]}//模板未出，参数待定
                moduleId={PrintTemplateType.VENDORRTNHANDOVERBILL.name} />
              <Button onClick={this.onEdit}
                    disabled={!havePermission(VENDORHANDOVER_RES.EDIT)}
                    style={{
                        display: entity && entity.state === State.SAVED.name
                            ? '' : 'none'
                    }}>
                {commonLocale.editLocale}
              </Button>

              <Button onClick={this.handleAuditModal}
                    disabled={!havePermission(VENDORHANDOVER_RES.AUDIT)}
                    style={{
                        display: entity && (entity.state === State.SAVED.name
                            || entity.state === State.INPROGRESS.name)
                            ? '' : 'none'
                    }}>
                {commonLocale.auditLocale}
              </Button>

              <Button onClick={this.handleDeleteModal}
                    disabled={!havePermission(VENDORHANDOVER_RES.DELETE)}
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
            label: commonLocale.inOwnerLocale,
            value: convertCodeName(entity.owner)
        },
        {
            label: commonLocale.inVendorLocale,
            value: <a onClick={this.onViewVendor.bind(true, entity.vendor ? entity.vendor.uuid : undefined)}>
                {convertCodeName(entity.vendor)}</a>
        }, {
            label: commonLocale.inWrhLocale,
            value: convertCodeName(entity.wrh)
        },
        {
            label: vendorHandoverLocale.handover,
            value: convertCodeName(entity.handover)
        },
        {
            label: vendorHandoverLocale.method,
            value: entity.method ? METHOD[entity.method].caption : <Empty />
        }, {
            label: commonLocale.inUploadDateLocale,
            value: entity.uploadTime
        }, {
            label: commonLocale.noteLocale,
            value: entity.note ? entity.note : <Empty />
        }];


        let articleCols = [{
            title: commonLocale.lineLocal,
            dataIndex: 'line',
            width: itemColWidth.lineColWidth,
        }, {
            title: commonLocale.inContainerBarcodeLocale,
            dataIndex: 'containerBarcode',
            key: 'containerBarcode',
            width: colWidth.codeColWidth,
            render: (text, record) => <a onClick={this.onViewContainer.bind(true, record.containerBarcode)}>
                {record.containerBarcode}</a>
        }, {
            title: commonLocale.bincodeLocale,
            dataIndex: 'binCode',
            key: 'binCode',
            width: colWidth.codeColWidth
        }, {
            title: commonLocale.inAllQtyStrLocale,
            dataIndex: 'qtyStr',
            key: 'qtyStr',
            width: colWidth.codeColWidth
        }, {
            title: commonLocale.inAllArticleCountLocale,
            dataIndex: 'articleItemCount',
            key: 'articleItemCount',
            width: colWidth.codeColWidth
        }, {
            title: commonLocale.inAllAmountLocale,
            dataIndex: 'amount',
            key: 'amount',
            width: colWidth.codeColWidth
        }, {
            title: commonLocale.inAllWeightLocale,
            dataIndex: 'weight',
            key: 'weight',
            width: colWidth.codeColWidth
        }, {
            title: commonLocale.inAllVolumeLocale,
            dataIndex: 'volume',
            key: 'volume',
            width: colWidth.codeColWidth
        }, {
            title: vendorHandoverLocale.handoverTime,
            dataIndex: 'handoverTime',
            key: 'handoverTime',
            width: colWidth.codeColWidth
        }, {
            title: commonLocale.noteLocale,
            dataIndex: 'note',
            render: text => text ? <EllipsisCol colValue={text} /> : <Empty />,
            width: itemColWidth.noteEditColWidth
        }]

        let stockCols = [
            {
              title: commonLocale.lineLocal,
              dataIndex: 'line',
              width: 50,
            },
            {
              title: commonLocale.articleLocale,
              width: colWidth.codeNameColWidth,
              render: record => <a onClick={() => this.onViewArticle(record.article.articleUuid)} >
                  <EllipsisCol colValue={convertArticleDocField(record.article)} /></a>
            },
            {
              title: commonLocale.inQpcAndMunitLocale,
              width: itemColWidth.qpcStrEditColWidth,
              render: (rext, record) => (record.qpcStr + '/' + (record.article.munit ? record.article.munit : '-'))
            }, {
                title: commonLocale.containerLocale,
                dataIndex: 'containerBarcode',
                key: 'containerBarcode',
                width: itemColWidth.containerEditColWidth,
                render: (text, record) => <a onClick={this.onViewContainer.bind(true, record.containerBarcode)}>
                    {record.containerBarcode}</a>
            }, {
                title: commonLocale.bincodeLocale,
                dataIndex: 'binCode',
                key: 'binCode',
                width: itemColWidth.binCodeEditColWidth,
                render: text => text ? text : <Empty />
            },
            {
              title: commonLocale.inProductDateLocale,
              dataIndex: 'productDate',
              key: 'productDate',
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
                width: itemColWidth.qtyStrColWidth,
            },
            {
              title: commonLocale.inQtyLocale,
              dataIndex: 'qty',
              key: 'qty',
              width: itemColWidth.qtyStrColWidth,
            }, {
                title: commonLocale.inStockBatchLocale,
                dataIndex: 'stockBatch',
                key: 'stockBatch',
                render: text => text ? <EllipsisCol colValue={text} /> : <Empty />,
                width: itemColWidth.stockBatchColWidth,
            }, {
                title: commonLocale.inPriceLocale,
                dataIndex: 'price',
                key: 'price',
                width: itemColWidth.priceColWidth,
                render: text => text ? text : <Empty />
            },
        ]
        let tabPanes = [
          <TabPane tab='单据明细' key="items">
            <ViewTablePanel
              data={entity.items ? entity.items : []}
              columns={articleCols}
            />
          </TabPane>,
          <TabPane tab="库存明细" key="stockItems">
            <ViewTablePanel
              data={entity.stockItems ? entity.stockItems : []}
              columns={stockCols}
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
                <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()}/>
                <ViewPanel title={commonLocale.itemsLocale} children={tabsItem} />

                <div>
                    <Modal
                        title={commonLocale.deleteLocale}
                        visible={this.state.visibleDelete}
                        uuid={this.state.entity.uuid}
                        onOk={this.onDelete}
                        onCancel={this.handleDeleteModal}
                        confirmLoading={this.state.confirmLoading}
                    >
                        <p>{vendorHandoverLocale.IPopconfirmDeleteTitle + ':' + this.state.entity.billNumber}</p>
                    </Modal>
                    <Modal
                        title={commonLocale.auditLocale}
                        visible={this.state.visiblAudit}
                        uuid={this.state.entity.uuid}
                        onOk={this.onAudit}
                        onCancel={this.handleAuditModal}
                        confirmLoading={this.state.confirmLoading}
                    >
                        <p>{vendorHandoverLocale.IPopconfirmAuditTitle + ':' + this.state.entity.billNumber}</p>
                    </Modal>
                </div>
            </TabPane>
        );
    }

    /**
     * 判断状态节点
    */
    getDot = (state) => {
        if (state === State.SAVED.name || state === State.INPROGRESS.name) { return 0; }
        if (state === State.AUDITED.name) { return 1; }
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
      const data = [{
        title:'开始交接时间',
        subTitle:entity.createInfo.time,
        current: entity.state !== '',
        description: [ {
          label: commonLocale.inAllQtyStrLocale,
          value: entity.qtyStr ? entity.qtyStr : "0"
        },
          {
            label: commonLocale.inAllAmountLocale,
            value: entity.amount
          },
          {
            label: commonLocale.inAllWeightLocale,
            value: entity.weight
          },
          {
            label: commonLocale.inAllVolumeLocale,
            value: entity.volume
          }]
      },{
        title:'结束交接时间',
        subTitle:entity.endTime,
        current: entity.state == State.AUDITED.name,
        description: []
      }
      ];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
