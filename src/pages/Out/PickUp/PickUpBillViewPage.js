import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, Tabs, message, Form, Select } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import TagUtil from '@/pages/Component/TagUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { convertCodeName } from '@/utils/utils';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { add, toQtyStr, accAdd } from '@/utils/QpcStrUtil';
import { commonLocale, notNullLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { sourceWay } from '@/utils/SourceWay';
import { loginCompany, loginOrg,getActiveKey } from '@/utils/LoginContext';
import { pickUpBillLocale } from './PickUpBillLocale';
import { PickupBillState, PickType, OperateMethod, PickupBillItemState, PickupDateType } from './PickUpBillContants';
import { PICKUPBILL_RES } from './PickUpBillPermission';
import ModifyPickerModal from './ModifyPickerModal';
import Empty from '@/pages/Component/Form/Empty';
import { binUsage } from '@/utils/BinUsage';
import { havePermission } from '@/utils/authority';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { routerRedux } from 'dva/router';
import { WAVEBILL_RES } from '@/pages/Out/Wave/WaveBillPermission';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import { orderLocale } from '../../In/Order/OrderLocale';
const TabPane = Tabs.TabPane;

@connect(({ pickup, loading }) => ({
  pickup,
  loading: loading.models.pickup,
}))
@Form.create()
export default class PickUpBillViewPage extends ViewPage {
  constructor(props) {
    super(props);
    this.state = {
      entity: {},
      items: [],
      entityUuid: props.pickup.entityUuid,
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
    if (nextProps.pickup.entity) {
      let itemToShow = [];
      let originalItem = nextProps.pickup.entity.items && [...nextProps.pickup.entity.items.slice(1)];
      if (nextProps.pickup.entity.items && itemToShow.length == 0) {
        itemToShow.push({
          ...nextProps.pickup.entity.items[0],
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
        entity: nextProps.pickup.entity,
        items: itemToShow,
        title: pickUpBillLocale.title + '：' + nextProps.pickup.entity.billNumber,
        entityUuid: nextProps.pickup.entity.uuid,
      });
    }
  }
  /**
  * 刷新
  */
  refresh(billNumber, uuid) {
    if (!billNumber && !uuid) {
      billNumber = this.state.entity.billNumber
    }
    if (billNumber) {
      this.props.dispatch({
        type: 'pickup/getByNumber',
        payload: billNumber,
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的拣货单' + billNumber + '不存在！');
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
        type: 'pickup/get',
        payload: {
          uuid: uuid
        },
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的拣货单不存在！');
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
      type: 'pickup/showPage',
      payload: {
        showPage: 'query',
        fromView: true
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

  darwProcess = () => {
    return <a onClick={() => this.viewProcessView()}>流程进度</a>;
  };

  viewProcessView = () => {
    this.setState({
      showProcessView: !this.state.showProcessView
    });
  };

  /**
   * 点击上一单
   */
  previousBill = () => {
    const { entity } = this.state;
    if (entity.uuid){
      this.props.dispatch({
        type: 'pickup/previousBill',
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
        type: 'pickup/nextBill',
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

  handleModifyPickerModal = (flag) => {
    this.setState({
      modifyPickerVisible: flag,
    })
  }

  onModifyPicker = (data) => {
    this.props.dispatch({
      type: 'pickup/modifyPicker',
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
      type: 'pickup/auditPick',
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
      type: 'pickup/showPage',
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
      type: 'pickup/modifyOperate',
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
        waveBillNumber: record,
        billNumber: record
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
            this.state.entity.state == (PickupBillState.APPROVED.name || PickupBillState.SENDED.name || PickupBillState.INPROGRESS.name) &&
            !(this.state.entity.operateMethod === OperateMethod.MANUAL.name &&
              this.state.entity.targetOperateMethod === OperateMethod.MANUAL.name) &&
            <Button onClick={() => this.handleModalVisible(pickUpBillLocale.modifyOperate)}
              disabled={!havePermission(PICKUPBILL_RES.MODIFYOPERATEMETHOD)}>
              {pickUpBillLocale.modifyOperate}
            </Button>
          }
          {
            (this.state.entity.state == PickupBillState.APPROVED.name)
            && this.state.entity.operateMethod === OperateMethod.RF.name
            && <Button onClick={() => this.handleModifyPickerModal(true)}
              disabled={!havePermission(PICKUPBILL_RES.MODIFYPICKDER)}>
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
            this.state.entity.state === PickupBillState.APPROVED.name &&
            this.state.entity.operateMethod === OperateMethod.MANUAL.name &&
            <Button type='primary' onClick={() => this.handleAuditModalVisible(commonLocale.auditLocale)}
              disabled={!havePermission(PICKUPBILL_RES.AUDIT)}>
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
    const { form: { getFieldDecorator } } = this.props;
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
        label: commonLocale.ownerLocale,
        value: convertCodeName(entity.owner)
      },
      {
        label: commonLocale.inStoreLocale,
        value: convertCodeName(entity.store)
      },
      {
        label: pickUpBillLocale.pickarea,
        value: convertCodeName(entity.pickarea)
      },
      {
        label: pickUpBillLocale.pickType,
        value: entity.pickType ? PickType[entity.pickType].caption : null
      },
      {
        label: pickUpBillLocale.operate,
        value: entity.operateMethod ? OperateMethod[entity.operateMethod].caption : null
      },
      {
        label: pickUpBillLocale.pickupDateType,
        value: entity.pickupDateType ? PickupDateType[entity.pickupDateType].caption : null
      },
      {
        label: pickUpBillLocale.waveBillNumber,
        value: entity.waveBillNumber ?
          <span> <a onClick={this.onWaveView.bind(this, entity.waveBillNumber)}
            disabled={!havePermission(WAVEBILL_RES.VIEW)}>{entity.waveBillNumber}</a> </span> : <Empty />
      },
      {
        label: pickUpBillLocale.picker,
        value: entity.picker ? (Object.keys(entity.picker).length != 0 ? convertCodeName(entity.picker) : null) : null
      },{
        label: commonLocale.noteLocale,
        value: entity.note
      }
    ];
    // 业务信息
    let businessItems = [
      {
        label: pickUpBillLocale.qtyStr,
        value: entity.totalQtyStr
      },
      {
        label: pickUpBillLocale.realQtyStr,
        value: entity.realTotalQtyStr
      },
      {
        label: pickUpBillLocale.price,
        value: entity.totalAmount
      },
      {
        label: pickUpBillLocale.realPrice,
        value: entity.realTotalAmount
      },
      {
        label: pickUpBillLocale.volume,
        value: entity.totalVolume
      },
      {
        label: pickUpBillLocale.realVolume,
        value: entity.realTotalVolume
      },
      {
        label: pickUpBillLocale.weight,
        value: entity.totalWeight
      },
      {
        label: pickUpBillLocale.realWeight,
        value: entity.realTotalWeight
      },
      {
        label: pickUpBillLocale.articleCount,
        value: entity.totalArticleCount
      },
      {
        label: pickUpBillLocale.realArticleCount,
        value: entity.realTotalArticleCount
      },
    ];

    let timeLineData = [
      { title: pickUpBillLocale.startPickTime, time: entity.startPickTime },
      { title: pickUpBillLocale.endPickTime, time: entity.endPickTime }
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
        title: pickUpBillLocale.realQtyStr,
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
        title: commonLocale.containerLocale,
        width: colWidth.codeColWidth-70,
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
            <span>{val ? PickupBillItemState[val].caption : <Empty />}</span>
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
      <TabPane key="basicInfo" tab={pickUpBillLocale.title}>
        <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()}/>
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
