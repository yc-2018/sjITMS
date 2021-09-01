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
import { putAwayLocal } from './RtnPutawayBillLocale';
import { State, METHOD } from './RtnPutawayBillContants';
import { RTNPUTAWAY_RES } from './RtnPutawayBillPermission';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';
import { storeRtnLocal } from '@/pages/Rtn/StoreRtn/StoreRtnBillLocale';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import styles from "@/pages/Out/Wave/Wave.less";

const TabPane = Tabs.TabPane;
@connect(({ rtnPutaway, loading }) => ({
    rtnPutaway,
    loading: loading.models.rtnPutaway,
}))
export default class RtnPutawayBillViewPage extends ViewPage {
    constructor(props) {
        super(props);
        this.state = {
            entity: {},
            items: [],
            entityUuid: props.rtnPutaway.entityUuid,
            title: '',
            visibleDelete: false,
            visiblAudit: false,
            confirmLoading: false,
            billNumber: props.billNumber,
        }
    }
    componentDidMount() {
      this.refresh(this.state.billNumber, this.state.entityUuid);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.rtnPutaway.entity) {
            this.setState({
                entity: nextProps.rtnPutaway.entity,
                items: nextProps.rtnPutaway.entity.items ? nextProps.rtnPutaway.entity.items : [],
                title: putAwayLocal.title + '：' + nextProps.rtnPutaway.entity.billNumber,
                entityUuid: nextProps.rtnPutaway.entity.uuid,
            });
        }
    }
    /**
    * 刷新
    */
    refresh(number, uuid) {
      const {entityUuid,billNumber} = this.state;
      if (!number && !uuid) {
        number = this.state.billNumber;
      }
      if (number) {
        this.props.dispatch({
          type: 'rtnPutaway/getByBillNumber',
          payload: {
            billNumber: number,
            dcUuid: loginOrg().uuid
          },
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的退仓上架单' + number + '不存在！');
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
          type: 'rtnPutaway/get',
          payload: uuid,
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的退仓上架单' + billNumber + '不存在！');
              this.onBack();
            } else {
              this.setState({
                billNumber: res.data.billNumber,
              });
            }
          }
        });
      }
      else{
        this.props.dispatch({
          type: 'rtnPutaway/get',
          payload: entityUuid,
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的退仓上架单' + billNumber + '不存在！');
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
            type: 'rtnPutaway/showPage',
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
        type: 'rtnPutaway/previousBill',
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
        type: 'rtnPutaway/nextBill',
        payload: entity.billNumber
      });
    }
  }

    /**
    * 编辑
    */
    onEdit = () => {
        this.props.dispatch({
            type: 'rtnPutaway/showPage',
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
        const { entity } = this.state

        this.setState({
            confirmLoading: !this.state.confirmLoading
        })

        let type = 'rtnPutaway/audit';
        if (entity.state === 'INPROGRESS') {
            type = 'rtnPutaway/auditByState';
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
        const { entity } = this.state

        this.setState({
            confirmLoading: !this.state.confirmLoading
        })

        this.props.dispatch({
            type: 'rtnPutaway/remove',
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
                reportParams={[{ '地区': '华北' }]}//模板未出，参数待定
                moduleId={'RTNPUTAWAYBILL'} />
              <Button onClick={this.onEdit}
                    disabled={!havePermission(RTNPUTAWAY_RES.EDIT)}
                    style={{
                        display: entity && entity.state === State.SAVED.name
                            ? '' : 'none'
                    }}>
                  {commonLocale.editLocale}
                </Button>

              <Button onClick={this.handleAuditModal}
                    disabled={!havePermission(RTNPUTAWAY_RES.AUDIT)}
                    style={{
                        display: entity && (entity.state === State.SAVED.name
                            || entity.state === State.INPROGRESS.name)
                            ? '' : 'none'
                    }}>
                  {commonLocale.auditLocale}
                </Button>

              <Button onClick={this.handleDeleteModal}
                    disabled={!havePermission(RTNPUTAWAY_RES.DELETE)}
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

        let profileItems = [
            {
                label: commonLocale.inOwnerLocale,
                value: convertCodeName(entity.owner)
            },
            {
                label: putAwayLocal.method,
                value: entity.method ? METHOD[entity.method].caption : <Empty />
            },
            {
                label: putAwayLocal.putAwayer,
                value: convertCodeName(entity.putawayer)
            },
            {
                label: commonLocale.noteLocale,
                value: entity.note ? entity.note : <Empty />
            }];

        let articleCols = [{
            title: commonLocale.lineLocal,
            dataIndex: 'line',
            width: itemColWidth.lineColWidth,
        }, {
            title: putAwayLocal.sourceContainer,
            dataIndex: 'sourceContainerBarcode',
            key: 'sourceContainerBarcode',
            width: colWidth.codeColWidth,
            render: (text, record) => <a onClick={() => this.onViewContainer(record.sourceContainerBarcode)}
                disabled={!record.sourceContainerBarcode || '-' === record.sourceContainerBarcode}>
                {record.sourceContainerBarcode}</a>
        }, {
            title: putAwayLocal.sourceBin,
            dataIndex: 'sourceBincode',
            key: 'sourceBincode',
            width: colWidth.codeColWidth,
            render: text => text ? text : <Empty />
        },
        {
            title: commonLocale.inVendorLocale,
            dataIndex: 'vendor',
            width: colWidth.codeNameColWidth,
            render: (rext, record) => <EllipsisCol colValue={convertCodeName(record.vendor)} />
        },
        {
            title: putAwayLocal.targetContainer,
            dataIndex: 'targetContainerBarcode',
            key: 'targetContainerBarcode',
            width: colWidth.codeColWidth,
            render: (text, record) => <a onClick={() => this.onViewContainer(record.targetContainerBarcode)}
                disabled={!record.targetContainerBarcode || '-' === record.targetContainerBarcode}>
                {record.targetContainerBarcode}</a>
        }, {
            title: putAwayLocal.targetBin,
            dataIndex: 'targetBincode',
            key: 'targetBincode',
            width: colWidth.codeColWidth,
            render: text => text ? text : <Empty />
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
            },
            {
                title: commonLocale.inVendorLocale,
                dataIndex: 'vendor',
                width: colWidth.codeNameColWidth,
                render: (text, record) => <a onClick={() => this.onViewVendor(record.vendor.uuid)}
                    disabled={!havePermission(VENDOR_RES.VIEW) || !record.vendor || !record.vendor.uuid}>
                    <EllipsisCol colValue={convertCodeName(record.vendor)} /></a>
            }, {
                title: putAwayLocal.sourceContainer,
                dataIndex: 'sourceContainerBarcode',
                key: 'sourceContainerBarcode',
                width: colWidth.codeColWidth,
                render: (text, record) => <a onClick={() => this.onViewContainer(record.sourceContainerBarcode)}
                    disabled={!record.sourceContainerBarcode || '-' === record.sourceContainerBarcode}>
                    {record.sourceContainerBarcode}</a>
            }, {
                title: putAwayLocal.sourceBin,
                dataIndex: 'sourceBincode',
                key: 'sourceBincode',
                width: colWidth.codeColWidth,
                render: text => text ? text : <Empty />
            },
            {
                title: putAwayLocal.targetContainer,
                dataIndex: 'targetContainerBarcode',
                key: 'targetContainerBarcode',
                width: colWidth.codeColWidth,
                render: (text, record) => <a onClick={() => this.onViewContainer(record.targetContainerBarcode)}
                    disabled={!record.targetContainerBarcode || '-' === record.targetContainerBarcode}>
                    {record.targetContainerBarcode}</a>
            }, {
                title: putAwayLocal.targetBin,
                dataIndex: 'targetBincode',
                key: 'targetBincode',
                width: colWidth.codeColWidth,
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
            }
        ];

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
                        <p>{putAwayLocal.IPopconfirmDeleteTitle + ':' + this.state.entity.billNumber}</p>
                    </Modal>
                    <Modal
                        title={commonLocale.auditLocale}
                        visible={this.state.visiblAudit}
                        uuid={this.state.entity.uuid}
                        onOk={this.onAudit}
                        onCancel={this.handleAuditModal}
                        confirmLoading={this.state.confirmLoading}
                    >
                        <p>{putAwayLocal.IPopconfirmAuditTitle + ':' + this.state.entity.billNumber}</p>
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
      const  {entity}  = this.state;
      const data = [{
        title:'开始上架时间',
        subTitle:entity.createInfo.time,
        current: entity.state !== '',
        description:[
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
        ]
      },{
        title:'结束上架时间',
        current: entity.state === State.AUDITED.name,
        subTitle:entity.state === State.AUDITED.name ? entity.endPutawayTime : '',
        description: []
      }
      ];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
