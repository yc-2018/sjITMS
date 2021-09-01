import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, Tabs, message, Select,Form } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import TagUtil from '@/pages/Component/TagUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { convertCodeName } from '@/utils/utils';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { add, toQtyStr, accAdd } from '@/utils/QpcStrUtil';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg,getActiveKey } from '@/utils/LoginContext';
import { CrossPickupBillState, PickType, OperateMethod, CrossPickupBillItemState, CrossPickupDateType } from './CrossPickUpBillContants';
import ModifyPickerModal from '@/pages/Out/PickUp/ModifyPickerModal';
import Empty from '@/pages/Component/Form/Empty';
import { binUsage } from '@/utils/BinUsage';
import { havePermission } from '@/utils/authority';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { routerRedux } from 'dva/router';
import { WAVEBILL_RES } from '@/pages/Out/Wave/WaveBillPermission';
import { crossPickUpBillLocale } from './CrossPickUpBillLocale';
import { CROSSPICKUPBILL_RES } from './CrossPickUpBillPermission';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import {pickUpBillLocale} from "../PickUp/PickUpBillLocale";
import {PickupBillState} from "../PickUp/PickUpBillContants";

const TabPane = Tabs.TabPane;

@connect(({ crossPickUp, loading }) => ({
  crossPickUp,
  loading: loading.models.crossPickUp,
}))
@Form.create()
export default class PickUpBillViewPage extends ViewPage {
  constructor(props) {
    super(props);
    this.state = {
      entity: {},
      items: [],
      entityUuid: props.crossPickUp.entityUuid,
      billNumber: props.billNumber,
      title: '',
      operate: '',
      visible: false,// 修改操作方式的模态框
      modifyPickerVisible: false,//修改拣货员的模态框
    }
  }
  componentDidMount() {
    this.refresh(this.state.billNumber, this.state.entityUuid);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.crossPickUp.entity) {
      let itemToShow = [];
      let originalItem = nextProps.crossPickUp.entity.items && [...nextProps.crossPickUp.entity.items.slice(1)];
      if (nextProps.crossPickUp.entity.items && itemToShow.length == 0) {
        itemToShow.push({
          ...nextProps.crossPickUp.entity.items[0],
          line: 1
        });
      }

      originalItem && originalItem.forEach((currentItem) => {
        let isExist = false;
        for (let i = 0; i < itemToShow.length; i++) {
          let item = itemToShow[i];
          if (item.article && currentItem && item.article.uuid === currentItem.article.uuid
            && item.qpcStr === currentItem.qpcStr && item.munit === currentItem.munit
            && item.binCode === currentItem.binCode && item.containerBarcode === currentItem.containerBarcode
            && item.state == currentItem.state && item.productDate == currentItem.productDate && item.productionBatch == currentItem.productionBatch) {
            item.qty = accAdd(item.qty, currentItem.qty);
            item.realQty = accAdd(item.realQty, currentItem.realQty);

            item.qtyStr = toQtyStr(item.qty, item.qpcStr);
            item.realQtyStr = toQtyStr(item.realQty, item.qpcStr);
            isExist = true;
            break;
          }
        }
        if (!isExist) {
          itemToShow.push({
            ...currentItem,
            line: itemToShow.length + 1
          });
        }
      })
      this.setState({
        entity: nextProps.crossPickUp.entity,
        items: itemToShow,
        title: crossPickUpBillLocale.title + '：' + nextProps.crossPickUp.entity.billNumber,
        entityUuid: nextProps.crossPickUp.entity.uuid,
      });
    }
  }
  /**
  * 刷新
  */
  refresh(billNumber, uuid) {
    if (!billNumber && !uuid) {
      billNumber = this.state.billNumber;
    }
    if (billNumber) {
      this.props.dispatch({
        type: 'crossPickUp/getByNumber',
        payload: billNumber,
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的集合拣货单' + billNumber + '不存在！');
            this.onBack();
          } else {
            this.setState({
              billNumber: res.data.billNumber
            });
          }
        }
      });
      return;
    }

    if (uuid) {
      this.props.dispatch({
        type: 'crossPickUp/get',
        payload: {
          uuid: uuid
        },
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的集合拣货单不存在！');
            this.onBack();
          } else {
            this.setState({
              billNumber: res.data.billNumber
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
      type: 'crossPickUp/showPage',
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
        type: 'crossPickUp/previousBill',
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
        type: 'crossPickUp/nextBill',
        payload: entity.billNumber
      });
    }
  }

  /**
   * 模态框显示/隐藏
   */
  handleModalVisible = (operate) => {
    if (operate) {
      this.setState({
        operate: operate
      })
    }
    this.setState({
      visible: !this.state.visible,
    })
    if (!this.state.visible) {
      this.props.form.resetFields();
    }
  }

  handleModifyPickerModal = (flag) => {
    this.setState({
      modifyPickerVisible: flag,
    })
  }

  onModifyPicker = (data) => {
    this.props.dispatch({
      type: 'crossPickUp/modifyPicker',
      payload: {
        uuid: this.state.entityUuid,
        version: this.state.entity.version,
        picker: data.picker
      },
      callback: (response) => {
        if (response && response.success) {
          this.refresh();
          message.success(commonLocale.modifySuccessLocale)
        }
      }
    });
    this.handleModifyPickerModal();
  }


  /**
   * 审核
   */
  onAudit = () => {
    const { entity } = this.state;
    this.props.dispatch({
      type: 'crossPickUp/auditCrossPick',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: response => {
        if (response && response.success) {
          this.refresh();
          message.success(commonLocale.auditSuccessLocale)
        }
      }
    })
    this.setState({
      auditVisible: !this.state.auditVisible
    });
  }

  /**
   * 编辑
   */
  onEdit = () => {
    this.props.dispatch({
      type: 'crossPickUp/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entityUuid,
      },
    });
  };

  /**
   * 修改操作方式
   */
  onModifyOperate = () => {
    this.props.dispatch({
      type: 'crossPickUp/modifyOperateMethod',
      payload: {
        uuid: this.state.entityUuid,
        version: this.state.entity.version
      },
      callback: (response) => {
        if (response && response.success) {
          this.refresh();
          message.success(commonLocale.modifySuccessLocale)
        }
      }
    });
    this.setState({
      visible: !this.state.visible
    });
  }

  /**
   * 跳转到波次单详情页面
   */
  onWaveView = (record) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/out/wave',
      payload: {
        showPage: 'view',
        waveBillNumber: record
      }
    }));
  }

  /**
     * 跳转到容器详情页面
     */
  onContainerView = (barcode) => {
    this.props.dispatch({
      type: 'container/get',
      payload: { barcode: barcode },
      callback: (response) => {
        console.log(response.success)
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/facility/container',
            payload: {
              showPage: 'view',
              entityUuid: response.data ? response.data.barcode : undefined
            }
          }));
        }
      }
    });
  }

  /**
   * 模态框确认操作
   */
  handleOk = () => {
    const { operate } = this.state;
    if (operate === commonLocale.auditLocale) {
      this.onAudit();
    }
  }

  /**
   * 模态框显示/隐藏
   */
  handleAuditModalVisible = (operate) => {
    if (operate) {
      this.setState({
        operate: operate
      })
    }
    this.setState({
      auditVisible: !this.state.auditVisible,
    })
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
          <PrintButton
            reportParams={[{ billNumber: `${this.state.entity.billNumber}` }]}
            moduleId={PrintTemplateType.PICKUPBILL.name} />
          {
            this.state.entity.state == (CrossPickupBillState.APPROVED.name || CrossPickupBillState.SENDED.name || CrossPickupBillState.INPROGRESS.name) &&
            !(this.state.entity.operateMethod === OperateMethod.MANUAL.name &&
              this.state.entity.targetOperateMethod === OperateMethod.MANUAL.name) &&
            <Button onClick={() => this.handleModalVisible(crossPickUpBillLocale.modifyOperate)}
              disabled={!havePermission(CROSSPICKUPBILL_RES.MODIFYOPERATEMETHOD)}
            >
              {crossPickUpBillLocale.modifyOperate}
            </Button>
          }
          {
            (this.state.entity.state == CrossPickupBillState.APPROVED.name)
            && this.state.entity.operateMethod === OperateMethod.RF.name
            && <Button onClick={() => this.handleModifyPickerModal(true)}
              disabled={!havePermission(CROSSPICKUPBILL_RES.MODIFYPICKDER)}
              >
              修改拣货员
            </Button>
          }
          {
            this.state.entity.state === PickupBillState.APPROVED.name &&
            <Button onClick={this.onEdit}>
              {commonLocale.editLocale}
            </Button>
          }
          {
            this.state.entity.state == (CrossPickupBillState.APPROVED.name || CrossPickupBillState.SENDED.name || CrossPickupBillState.INPROGRESS.name) &&
            this.state.entity.operateMethod === OperateMethod.MANUAL.name &&
            <Button type='primary' onClick={() => this.handleAuditModalVisible(commonLocale.auditLocale)}
              disabled={!havePermission(CROSSPICKUPBILL_RES.AUDIT)}
            >
              {commonLocale.auditLocale}
            </Button>
          }
        </Fragment>
      );
    }
  }
  /**
  * 绘制信息详情
  */
  drawPickUpBillBillInfoTab = () => {
    const { entity } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    let qtyStr = 0;
    let price = 0;
    let realQtyStr = 0;
    let realPrice = 0;

    const items = entity.items;
    if (items) {
      items.map(item => {
        qtyStr = add(qtyStr, item.qtyStr)
        realQtyStr = add(realQtyStr, item.realQtyStr)
      })
    }
    // 概要信息
    let profileItems = [
      {
        label: crossPickUpBillLocale.pickarea,
        value: convertCodeName(entity.pickarea)
      },
      
      {
        label: crossPickUpBillLocale.waveBillNumber,
        value: entity.waveBillNumber ?
          <span> <a onClick={this.onWaveView.bind(this, entity.waveBillNumber)}
            disabled={!havePermission(WAVEBILL_RES.VIEW)}>{entity.waveBillNumber}</a> </span> : <Empty />
      },
      {
        label: crossPickUpBillLocale.pickType,
        value: entity.pickType ? PickType[entity.pickType].caption : null
      },
      {
        label: crossPickUpBillLocale.operate,
        value: entity.operateMethod ? OperateMethod[entity.operateMethod].caption : null
      },
      {
        label: crossPickUpBillLocale.crossPickupDateType,
        value: entity.crossPickupDateType ? CrossPickupDateType[entity.crossPickupDateType].caption : null
      },
      {
        label: crossPickUpBillLocale.picker,
        value: entity.picker ? (Object.keys(entity.picker).length != 0 ? convertCodeName(entity.picker) : null) : null
      },
      {
        label: commonLocale.noteLocale,
        value: entity.note
      }
    ];
    // 业务信息
    let businessItems = [
      {
        label: crossPickUpBillLocale.qtyStr,
        value: entity.totalQtyStr
      },
      {
        label: crossPickUpBillLocale.realQtyStr,
        value: entity.realTotalQtyStr
      },
      {
        label: crossPickUpBillLocale.price,
        value: entity.totalAmount
      },
      {
        label: crossPickUpBillLocale.realPrice,
        value: entity.realTotalAmount
      },
      {
        label: crossPickUpBillLocale.volume,
        value: entity.totalVolume
      },
      {
        label: crossPickUpBillLocale.realVolume,
        value: entity.realTotalVolume
      },
      {
        label: crossPickUpBillLocale.weight,
        value: entity.totalWeight
      },
      {
        label: crossPickUpBillLocale.realWeight,
        value: entity.realTotalWeight
      },
      {
        label: crossPickUpBillLocale.articleCount,
        value: entity.totalArticleCount
      },
      {
        label: crossPickUpBillLocale.realArticleCount,
        value: entity.realTotalArticleCount
      },
    ];

    let timeLineData = [
      { title: crossPickUpBillLocale.startPickTime, time: entity.startPickTime },
      { title: crossPickUpBillLocale.endPickTime, time: entity.endPickTime }
    ];
    let current = 0;
    for (let i = timeLineData.length - 1; i >= 0; i--) {
      if (timeLineData[i].time) {
        current = i;
        break;
      }
    }
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
        render: record => {
          return <span>
            <a onClick={this.onViewArticle.bind(true, record.article ? record.article.uuid : undefined)}
            ><EllipsisCol colValue={convertCodeName(record.article)} /></a>
          </span>;
        }
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        render: record => record.qpcStr + ' / ' + record.munit,
        width: itemColWidth.qpcStrColWidth,
      },
      {
        title: '应拣件数',
        width: itemColWidth.qtyStrColWidth / 2,
        dataIndex: 'qtyStr',
      },
      {
        title: crossPickUpBillLocale.realQtyStr,
        width: itemColWidth.qtyStrColWidth / 2,
        dataIndex: 'realQtyStr'
      },
      {
        title: commonLocale.bincodeLocale,
        width: colWidth.codeColWidth / 1.5,
        render: record => {
          if (record.binCode && record.binUsage) {
            return <EllipsisCol colValue={record.binCode + "[" + binUsage[record.binUsage].caption + "]"} />
          } else {
            return <Empty />
          }
        }
      },
      {
        title: '目标货位',
        width: colWidth.codeColWidth / 1.5,
        render:record=>{
          let targetBinCode = '';
          let targetBinUsage = '';
          if(entity.stockItems){
            entity.stockItems.forEach(item=>{
              if(item.itemUuid == record.uuid){
                targetBinCode = item.targetBinCode;
                targetBinUsage = item.targetBinUsage;
              }
            })
          }
          return targetBinCode?<EllipsisCol colValue={targetBinCode + "[" + binUsage[targetBinUsage].caption + "]"} />:<Empty/>
        }
      },
      {
        title: commonLocale.containerLocale,
        width: colWidth.codeColWidth / 2,
        render: record => record.containerBarcode == "-" ? record.containerBarcode : <a onClick={this.onContainerView.bind(this, record.containerBarcode)}>{record.containerBarcode}</a>
      },
      {
        title: '批号',
        dataIndex: 'productionBatch',
        width: colWidth.enumColWidth,
        render: val => {
          return (
            <span>{val ? val : <Empty />}</span>
          );
        }
      },
      {
        title: '生产日期',
        dataIndex: 'productDate',
        width: colWidth.enumColWidth,
        render: val => {
          return (
            <span>{val ? moment(val).format('YYYY-MM-DD') : <Empty />}</span>
          );
        }
      },
      {
        title: '到效日期',
        dataIndex: 'validDate',
        width: colWidth.enumColWidth,
        render: val => {
          return (
            <span>{val ? moment(val).format('YYYY-MM-DD') : <Empty />}</span>
          );
        }
      },
      {
        title: commonLocale.stateLocale,
        dataIndex: 'state',
        width: colWidth.enumColWidth / 2,
        render: val => {
          return (
            <span>{val ? CrossPickupBillItemState[val].caption : <Empty />}</span>
          );
        }
      },
      {
        title: '拣货时间',
        dataIndex: 'pickTime',
        width: colWidth.enumColWidth,
        render: val => {
          return (
            <span>{val ? val : <Empty />}</span>
          );
        }
      },
    ]

    let operateMethodOptions = [];
    let mode = entity ? entity.operateMethod : null;
    Object.keys(OperateMethod).forEach(function (key) {
      if (key !== mode) {
        operateMethodOptions.push(<Select.Option value={OperateMethod[key].name} key={OperateMethod[key].name}>{OperateMethod[key].caption}</Select.Option>);
      }
    });
    let content = '您将修改为' + (entity.operateMethod === OperateMethod.MANUAL.name ? OperateMethod[entity.targetOperateMethod].caption : OperateMethod.MANUAL.caption) + '，是否修改？';
    return (
      <TabPane key="basicInfo" tab={crossPickUpBillLocale.title}>
        <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()}/>
        {/* <ViewPanel title={commonLocale.timeLineLocale} children={[<TimeLinePanel items={timeLineData} current={current} />]} /> */}
        <ViewTablePanel
          title={commonLocale.itemsLocale}
          columns={pickUpItemCols}
          data={this.state.items}
        />
        <ConfirmModal
          operate={'修改操作方式'}
          content={content}
          visible={this.state.visible}
          onOk={() => this.onModifyOperate(entity)}
          onCancel={this.handleModalVisible}
        />
        <ModifyPickerModal
          title={'修改拣货员'}
          visible={this.state.modifyPickerVisible}
          modifyPicker={this.onModifyPicker}
          handleModal={() => this.handleModifyPickerModal()}
        />
        <ConfirmModal
          visible={this.state.auditVisible}
          operate={this.state.operate}
          object={this.state.entity.billNumber}
          onOk={this.handleOk}
          onCancel={this.handleAuditModalVisible}
        />
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

  darwProcess = () => {
    return <a onClick={() => this.viewProcessView()}>流程进度</a>;
  };

  viewProcessView = () => {
    this.setState({
      showProcessView: !this.state.showProcessView
    });
  };

  drawOthers = () => {
    const others = [];
    if (this.state.showProcessView) {
      const { entity } = this.state;
      const data = [{
        title: '开始拣货',
        subTitle: entity.startPickTime,
        current: entity.state !== '',
        description: [{
          label: pickUpBillLocale.qtyStr,
          value: entity.totalQtyStr
        },
          {
            label: pickUpBillLocale.articleCount,
            value: entity.totalArticleCount
          },
          {
            label: pickUpBillLocale.price,
            value: entity.totalAmount
          },
          {
            label: pickUpBillLocale.volume,
            value: entity.totalVolume
          },
          {
            label: pickUpBillLocale.weight,
            value: entity.totalWeight
          }]
      },{
        title: '结束拣货',
        subTitle: entity.endPickTime,
        current: entity.state == PickupBillState.AUDITED.name,
        description: [
          {
            label: pickUpBillLocale.realQtyStr,
            value: entity.realTotalQtyStr
          },
          {
            label: pickUpBillLocale.realArticleCount,
            value: entity.realTotalArticleCount
          },
          {
            label: pickUpBillLocale.realPrice,
            value: entity.realTotalAmount
          },
          {
            label: pickUpBillLocale.realVolume,
            value: entity.realTotalVolume
          },
          {
            label: pickUpBillLocale.realWeight,
            value: entity.realTotalWeight
          }]
      }];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
