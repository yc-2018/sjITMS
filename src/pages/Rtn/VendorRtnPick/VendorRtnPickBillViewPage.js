import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, Tabs, Steps, message, Form } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import TagUtil from '@/pages/Component/TagUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { convertCodeName, convertArticleDocField } from '@/utils/utils';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { add } from '@/utils/QpcStrUtil';
import { commonLocale, notNullLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { sourceWay } from '@/utils/SourceWay';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { vendorRtnPickLocale } from './VendorRtnPickBillLocale';
import { State, Type, METHOD, ItemState } from './VendorRtnPickBillContants';
import ModifyPickerModal from './ModifyPickerModal';
import BatchAuditModal from './BatchAuditModal';
import Empty from '@/pages/Component/Form/Empty';
import { VENDORRTNPICK_RES } from './VendorRtnPickBillPermission';
import { havePermission } from '@/utils/authority';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import styles from "@/pages/Out/Wave/Wave.less";
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';

const TabPane = Tabs.TabPane;
const { Step } = Steps;

@connect(({ vendorRtnPick, loading }) => ({
    vendorRtnPick,
    loading: loading.models.vendorRtnPick,
}))
@Form.create()
export default class VendorRtnPickBillViewPage extends ViewPage {
    constructor(props) {
        super(props);
        this.state = {
            entity: {},
            items: [],
            entityUuid: props.vendorRtnPick.entityUuid,
            title: '',
            operate: '',
            visible: false,// 修改操作方式的模态框
            modifyPickerVisible: false,//修改拣货员的模态框
            auditModalVisible: false,
            confirmLoading: false,
            billNumber: props.vendorRtnPick.billNumber,
        }
    }
    componentDidMount() {
      this.refresh(this.state.billNumber, this.state.entityUuid);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.vendorRtnPick.entity) {
            this.setState({
                entity: nextProps.vendorRtnPick.entity,
                items: nextProps.vendorRtnPick.entity.items ? nextProps.vendorRtnPick.entity.items : [],
                title: vendorRtnPickLocale.title + '：' + nextProps.vendorRtnPick.entity.billNumber,
                entityUuid: nextProps.vendorRtnPick.entity.uuid,
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
          type: 'vendorRtnPick/getByBillNumber',
          payload: {
            billNumber: billNumber,
            dcUuid: loginOrg().uuid
          },
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的供应商拣货单' + billNumber + '不存在！');
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
          type: 'vendorRtnPick/get',
          payload: uuid,
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的供应商拣货单' + billNumber + '不存在！');
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
          type: 'vendorRtnPick/get',
          payload: entityUuid,
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的供应商拣货单' + billNumber + '不存在！');
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
            type: 'vendorRtnPick/showPage',
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
        type: 'vendorRtnPick/previousBill',
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
        type: 'vendorRtnPick/nextBill',
        payload: entity.billNumber
      });
    }
  }

    /**
     * 模态框显示/隐藏
     */
    handleModalVisible = () => {
        this.setState({
            visible: !this.state.visible,
        })
    }

    handleModifyPickerModal = (flag) => {
        this.setState({
            modifyPickerVisible: flag,
        })
    }

    handleAuditModal = () => {
        this.props.dispatch({
            type: 'vendorRtnPick/showPage',
            payload: {
                showPage: 'audit',
                entityUuid: this.state.entityUuid
            }
        });
    }

    onAudit = (data) => {
        const { entity } = this.state;

        this.setState({
            confirmLoading: !this.state.confirmLoading
        })

        this.props.dispatch({
            type: 'vendorRtnPick/auditWhole',
            payload: {
                uuid: entity.uuid,
                version: entity.version,
                body: {
                    dcUuid: entity.dcUuid,
                    companyUuid: entity.companyUuid,
                    picker: JSON.parse(data.picker),
                    pickQty: data.pickQty,
                    toBinCode: data.toBinCode,
                }
            },
            callback: (response) => {
                if (response && response.success) {
                    this.setState({
                        auditModalVisible: !this.state.auditModalVisible,
                        confirmLoading: false
                    })
                    this.refresh(entity.billNumber);
                    message.success(commonLocale.auditSuccessLocale)
                }
            }
        });
    }

    onModifyPicker = (data) => {
        const { entity } = this.state;

        this.setState({
            confirmLoading: !this.state.confirmLoading
        })

        this.props.dispatch({
            type: 'vendorRtnPick/alterPicker',
            payload: {
                uuid: entity.uuid,
                version: entity.version,
                picker: JSON.parse(data.picker)
            },
            callback: (response) => {
                if (response && response.success) {
                    this.setState({
                        modifyPickerVisible: !this.state.modifyPickerVisible,
                        confirmLoading: false
                    })
                    this.refresh(entity.billNumber);
                    message.success(commonLocale.modifySuccessLocale)
                }
            }
        });
    }

    /**
     * 修改操作方式
     */
    onModifyOperate = () => {
        const { entity } = this.state;

        const method = METHOD.MANUAL.name === entity.method ?
            METHOD.RF.name : METHOD.MANUAL.name;

        this.props.dispatch({
            type: 'vendorRtnPick/alterMethod',
            payload: {
                uuid: entity.uuid,
                version: entity.version,
                method: method
            },
            callback: (response) => {
                if (response && response.success) {
                    this.setState({
                        visible: !this.state.visible
                    });
                    this.refresh(entity.billNumber);
                    message.success(commonLocale.modifySuccessLocale)
                }
            }
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
        const { entity } = this.state;

        if (entity.state) {
            return (
                <Fragment>
                  <Button onClick={this.onBack}>
                    {commonLocale.backLocale}
                  </Button>
                  <PrintButton
                    reportParams={[{ billNumber: `${entity.billNumber}` }]}//模板未出，参数待定
                    moduleId={'VENDORPICKUPBILL'} />

                  <Button
                        disabled={!havePermission(VENDORRTNPICK_RES.MODIFYMETHOD)}
                        style={{
                            display: entity && entity.state === State.APPROVED.name ? '' : 'none'
                        }}
                        onClick={() => this.handleModalVisible()}>
                    {vendorRtnPickLocale.batchAlterMethod}
                  </Button>

                  <Button
                        disabled={!havePermission(VENDORRTNPICK_RES.MODIFYPICKER)}
                        style={{
                            display: entity && entity.state === State.APPROVED.name ? '' : 'none'
                        }}
                        onClick={() => this.handleModifyPickerModal(true)}>
                    {vendorRtnPickLocale.batchAlterPicker}
                  </Button>

                  <Button
                        disabled={!havePermission(VENDORRTNPICK_RES.AUDIT)}
                        style={{
                            display: entity && entity.state === State.APPROVED.name
                                && entity.method === METHOD.MANUAL.name ? '' : 'none'
                        }}
                        type='primary' onClick={() => this.handleAuditModal()}>
                    {commonLocale.auditLocale}
                  </Button>

                </Fragment>
            );
        }
    }
    /**
    * 绘制信息详情
    */
    drawPickUpBillBillInfoTab = () => {
        const { entity } = this.state;
        const { pagination } = this.props.vendorRtnPick.data;

        // 概要信息
        let profileItems = [
          {
            label: commonLocale.vendorLocale,
            value: <a onClick={this.onViewVendor.bind(true, entity.vendor ? entity.vendor.uuid : undefined)}>
                {convertCodeName(entity.vendor)}</a>
          },
          {
            label: commonLocale.inWrhLocale,
            value: convertCodeName(entity.wrh)
          },
          {
            label: commonLocale.operateMethodLocale,
            value: entity.method ? METHOD[entity.method].caption : null
          },
          {
            label: vendorRtnPickLocale.type,
            value: entity.type ? Type[entity.type].caption : null
          },

          {
            label: commonLocale.inSourceBillLocale,
            value: entity.sourceBill ? entity.sourceBill.billNumber : null
          },
          {
            label: vendorRtnPickLocale.picker,
            value: entity.picker ? convertCodeName(entity.picker) : <Empty />
          },
          {
            label: commonLocale.noteLocale,
            value: entity.note ? entity.note : <Empty />
          }
        ];

        // 明细
        let pickUpItemCols = [
          {
            title: commonLocale.lineLocal,
            dataIndex: 'line',
            width: itemColWidth.lineColWidth,
          },
          {
            title: commonLocale.articleLocale,
            width: colWidth.codeNameColWidth,
            render: record => <a onClick={() => this.onViewArticle(record.article.articleUuid)} >
                <EllipsisCol colValue={convertArticleDocField(record.article)} /></a>
          },
          {
            title: commonLocale.inQpcAndMunitLocale,
            render: (text, record) => (record.qpcStr + '/' + (record.article.munit ? record.article.munit : '-')),
            width: itemColWidth.qpcStrColWidth,
          },
          {
            title: commonLocale.stateLocale,
            width: colWidth.enumColWidth,
            dataIndex: 'state',
            render: (text, record) => ItemState[record.state].caption
          },
          {
            title: commonLocale.inQtyStrLocale,
            width: itemColWidth.qtyStrColWidth,
            dataIndex: 'qtyStr',
          },
          {
            title: commonLocale.inAllRealQtyStrLocale,
            width: itemColWidth.qtyStrColWidth,
            dataIndex: 'realQtyStr'
          },
          {
            title: commonLocale.bincodeLocale,
            dataIndex: 'binCode',
            width: colWidth.codeColWidth,
          },
          {
            title: commonLocale.containerLocale,
            dataIndex: 'containerBarcode',
            width: colWidth.codeColWidth,
            render: (text, record) => <a onClick={this.onViewContainer.bind(true, record.containerBarcode)} >
                {record.containerBarcode}</a>
          },
          {
            title: vendorRtnPickLocale.pickTime,
            dataIndex: 'pickTime',
            width: colWidth.dateColWidth,
          },
          {
            title: commonLocale.noteLocale,
            dataIndex: 'note',
            render: text => text ? <EllipsisCol colValue={text} /> : <Empty />,
            width: itemColWidth.noteEditColWidth
          }
        ]

        let stockCols = [
          {
            title: commonLocale.lineLocal,
            dataIndex: 'line',
            width: 50,
          },
          {
            title: commonLocale.articleLocale,
            width: colWidth.codeNameColWidth,
            render: (rext, record) => <a onClick={() => this.onViewArticle(record.article.articleUuid)} >
                <EllipsisCol colValue={convertArticleDocField(record.article)} /></a>
          },
          {
            title: commonLocale.inQpcAndMunitLocale,
            width: itemColWidth.qpcStrEditColWidth,
            render: (rext, record) => (record.qpcStr + '/' + (record.article.munit ? record.article.munit : '-'))
          },
          {
            title: commonLocale.containerLocale,
            dataIndex: 'containerBarcode',
            key: 'containerBarcode',
            width: colWidth.codeColWidth,
            render: (text, record) => <a onClick={this.onViewContainer.bind(true, record.containerBarcode)} >
                {record.containerBarcode}</a>
          },
          {
              title: commonLocale.bincodeLocale,
              dataIndex: 'binCode',
              key: 'binCode',
              width: colWidth.codeColWidth,
              render: text => text ? text : <Empty />
          },
          {
            title: vendorRtnPickLocale.toContainerBarcode,
            dataIndex: 'toContainerBarcode',
            key: 'toContainerBarcode',
            width: colWidth.codeColWidth,
            render: (text, record) => <a onClick={this.onViewContainer.bind(true, record.toContainerBarcode)} >
                {record.toContainerBarcode}</a>
          },
          {
            title: vendorRtnPickLocale.toBinCode,
            dataIndex: 'toBinCode',
            key: 'toBinCode',
            width: colWidth.codeColWidth,
            render: text => text ? text : <Empty />
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
          },
          {
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
          },
          {
            title: commonLocale.inStockBatchLocale,
            dataIndex: 'stockBatch',
            key: 'stockBatch',
            width: itemColWidth.stockBatchColWidth,
            render: (rext, record) => <EllipsisCol colValue={record.stockBatch} />
          },
          {
            title: commonLocale.inPriceLocale,
            dataIndex: 'price',
            key: 'price',
            width: itemColWidth.priceColWidth,
            render: text => text ? text : <Empty />
          }
        ]
        let tabPanes = [
          <TabPane tab='单据明细' key="items">
            <ViewTablePanel
              data={entity.items ? entity.items : []}
              columns={pickUpItemCols}
            />
          </TabPane>,
          <TabPane tab="库存明细" key="stockItems">
            <ViewTablePanel
              data={entity.stockItems ? entity.stockItems : []}
              columns={stockCols}
            />
          </TabPane>
        ];
        let tabsItem =
          <Tabs key='itemTabs' defaultActiveKey="billItems" className={styles.ItemTabs}>
            {tabPanes}
          </Tabs>

        return (
            <TabPane key="basicInfo" tab={commonLocale.billInfoLocale}>
                <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale}  rightTile={this.darwProcess()} />
              <ViewTabPanel style={{ width: '100%', marginTop: '-22px'}}>
                <ViewPanel title={commonLocale.itemsLocale} children={tabsItem} />

                <ConfirmModal
                    operate={vendorRtnPickLocale.batchAlterMethod}
                    content={vendorRtnPickLocale.content}
                    visible={this.state.visible}
                    onOk={() => this.onModifyOperate()}
                    onCancel={this.handleModalVisible}
                />
                <ModifyPickerModal
                    ModalTitle={vendorRtnPickLocale.batchAlterPicker}
                    pickerModalVisible={this.state.modifyPickerVisible}
                    handlePickerModalVisible={this.handleModifyPickerModal}
                    handleSave={this.onModifyPicker}
                    confirmLoading={this.state.confirmLoading}
                />
                <BatchAuditModal
                    ModalTitle={vendorRtnPickLocale.batchWholeAudit}
                    batchAuditVisible={this.state.auditModalVisible}
                    handleAuditModalVisible={this.handleAuditModal}
                    handleSave={this.onAudit}
                    confirmLoading={this.state.confirmLoading}
                />
              </ViewTabPanel>
            </TabPane>
        );
    }

    /**
    * 判断状态节点
    */
    getDot = (state) => {
        if (state === State.APPROVED.name || state === State.INPROGRESS.name) { return 0; }
        if (state === State.AUDITED.name) { return 1; }
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
      const profile = entity.statisticProfile;
      const realProfile = entity.realStatisticProfile;
      const data = [{
        title:'开始拣货时间',
        subTitle:entity.createInfo.time,
        current: entity.state !== '',
        description:[
          {
            label: commonLocale.inAllQtyStrLocale,
            value: profile ? profile.qtyStr : '0'
          },
          {
            label: commonLocale.inAllArticleCountLocale,
            value: profile ? profile.articleItemCount : 0
          },
          {
            label: commonLocale.inAllAmountLocale,
            value: profile ? profile.amount : 0
          },
          {
            label: commonLocale.inAllWeightLocale,
            value: profile ? profile.weight : 0
          },
          {
            label: commonLocale.inAllVolumeLocale,
            value: profile ? profile.volume : 0
          },
        ]
      },{
        title:'结束拣货时间',
        subTitle:entity.endTime,
        current: entity.state == State.AUDITED.name,
        description: [
          {
            label: commonLocale.inAllRealQtyStrLocale,
            value: realProfile ? realProfile.realQtyStr : '0'
          },
           {
            label: commonLocale.inAllRealArticleCountLocale,
            value: realProfile ? realProfile.realArticleItemCount : 0
          },
          {
            label: commonLocale.inAllRealAmountLocale,
            value: realProfile ? realProfile.realAmount : '0'
          },
          {
            label: commonLocale.inAllRealWeightLocale,
            value: realProfile ? realProfile.realWeight : '0'
          },
          {
            label: commonLocale.inAllRealVolumeLocale,
            value: realProfile ? realProfile.realVolume : '0'
          },]
      }
      ];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
