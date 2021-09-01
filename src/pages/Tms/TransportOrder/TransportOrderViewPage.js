import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { message, Button, Tabs, } from 'antd';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg,getActiveKey } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { qtyStrToQty, add, toQtyStr } from '@/utils/QpcStrUtil';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import TagUtil from './TagUtil';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import { alcNtcLocale } from './TransportOrderLocale';
import Empty from '@/pages/Component/Form/Empty';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { orgType } from '@/utils/OrgType';
import { STORE_RES } from '@/pages/Basic/Store/StorePermission';
import { WAVEBILL_RES } from '@/pages/Out/Wave/WaveBillPermission';
import { State, orderBillType } from './TransportOrderContants';
import { sourceWay } from '@/utils/SourceWay';
import { accDiv, accMul } from '@/utils/QpcStrUtil'
import OperateCol from '@/pages/Component/Form/OperateCol';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';

const TabPane = Tabs.TabPane;
@connect(({ transportOrder, loading }) => ({
  transportOrder,
  loading: loading.models.transportOrder,
}))
export default class TransportOrderViewPage extends ViewPage {

  constructor(props) {
    super(props);

    this.state = {
      title: alcNtcLocale.title,
      billNumber: props.billNumber,
      entityUuid: props.transportOrder.entityUuid,
      entity: {},
      operate: '',
      modalVisible: false,
      createPermission: STORE_RES.CREATE,
    }
  }

  componentDidMount() {
    this.refresh(this.state.billNumber, this.state.entityUuid);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.transportOrder.entity) {
      this.setState({
        entity: nextProps.transportOrder.entity,
        title: alcNtcLocale.title + "：" + nextProps.transportOrder.entity.billNumber,
        entityUuid: nextProps.transportOrder.entity.uuid,
      });
    }else if(this.state.entityUuid && nextProps.transportOrder.entityUuid && this.state.entityUuid != nextProps.transportOrder.entityUuid){
      this.refresh(nextProps.transportOrder.entityUuid);
    }
    if(nextProps.transportOrder.entity && nextProps.transportOrder.entity.stat){
      this.renderOperateCol();
    }
  }

  drawStateTag = () => {
    if (this.state.entity.stat) {
      return (
        <TagUtil value={this.state.entity.stat} />
      );
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
      modalVisible: !this.state.modalVisible
    });
  }

  /**
   * 模态框确认操作
   */
  handleOk = () => {
    const { operate } = this.state;
    if (operate === commonLocale.auditLocale) {
        this.onAudit();
      } else if (operate === commonLocale.deleteLocale) {
      this.onDelete();
    } else if (operate === '取消') {
      this.cancel();
    } else if (operate === '调度类型转换') {
      this.onChangeType();
    } else if (operate === '拆单') {
      this.onSplit(this.state.entity);
    } else if (operate === '撤销取消') {
      this.onReturnCancel(this.state.entity, false);
    } else if (operate === '审核') {
      this.onInitial(this.state.entity, false);
    }

  }

  /**
   * 审核
   */
  onAudit = () => {
    const { entity } = this.state;
    this.props.dispatch({
      type: 'transportOrder/initial',
      payload: {
        billNumber: entity.billNumber,
        dispatchCenterUuid: loginOrg().uuid
      },
      callback: response => {
        if (response && response.success) {
          this.refresh();
          message.success(commonLocale.auditSuccessLocale)
        } else {
          message.error(response.message)
        }
      }
    })
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }

  /**
   * 删除
   */
  onDelete = () => {
    const { entity } = this.state;
    this.props.dispatch({
      type: 'transportOrder/delete',
      payload: {
        uuid: entity.uuid
      },
      callback: (response) => {
        if (response && response.success) {
          this.onCancel();
          message.success(commonLocale.removeSuccessLocale)
        } else {
          message.error(response.message)
        }
      }
    })
  }


  /**
   * 绘制省略的按钮
   */
  renderOperateCol = () => {
    let operations = [];
    let operation = [{
      name: '',
    }];
    if (this.state.entity.stat) {
      if(State[this.state.entity.stat].name == 'Initial') {
        if(this.state.entity.sourceOrderBillTms) {
          if(this.state.entity.orderType === 'Delivery' && !this.state.entity.selfhandover) {
            operations = this.fetchOperatePropsSix(this.state.entity)
          } else {
            operations = this.fetchOperatePropsFour(this.state.entity);
          }
        } else {
          if(this.state.entity.orderType === 'Delivery' && !this.state.entity.selfhandover) {
            operations = this.fetchOperatePropsSeven(this.state.entity);
          } else {
            operations = this.fetchOperatePropsOne(this.state.entity);
          }
        }
      } else if(State[this.state.entity.stat].name === 'Saved') {
        operations = this.fetchOperatePropsTwo(this.state.entity);
      } else if(State[this.state.entity.stat].name === 'Canceled') {
        operations = this.fetchOperatePropsFive(this.state.entity);
      } else if(State[this.state.entity.stat].name === 'Finished') {
        if(this.state.entity.selfhandover) {
          operations = this.fetchOperatePropsEight(this.state.entity);
        }
      } else if(State[this.state.entity.stat].name === 'Scheduled' || State[this.state.entity.stat].name === 'Shiped') {
        operations = this.fetchOperatePropsNine(this.state.entity);
      }
    }
    for(let i = 0; i < operations.length; i++) {
      operation.push(operations[i]);
    }
    this.setState({
      operations: operation
    })
  }

  drawActionButtion() {
    if (this.state.entity.stat) {
      return (
        <Fragment>
          <Button onClick={this.onCancel}>
            {commonLocale.backLocale}
          </Button>
          <OperateCol menus={this.state.operations} />
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          <Button onClick={this.onCancel}>
            {commonLocale.backLocale}
          </Button>
        </Fragment>
      );
    }
  }

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.editLocale,
      onClick: this.onEdit.bind(this, record.uuid)
    }, {
      name: '取消',
      onClick: this.handleModalVisible.bind(this, '取消', record)
    }, {
      name: '拆单',
      onClick: this.handleModalVisible.bind(this, '拆单', record)
    }];
  }

  fetchOperatePropsTwo = (record) => {
    return [{
      name: commonLocale.editLocale,
      onClick: this.onEdit.bind(this, record.uuid)
    }, {
      name: commonLocale.auditLocale,
      onClick: this.handleModalVisible.bind(this, commonLocale.auditLocale, record)
    }, {
      name: commonLocale.deleteLocale,
      onClick: this.handleModalVisible.bind(this, commonLocale.deleteLocale, record)
    }];
  }

  fetchOperatePropsFour = (record) => {
    return [{
      name: commonLocale.editLocale,
      onClick: this.onEdit.bind(this, record.uuid)
    }, {
      name: '取消',
      onClick: this.handleModalVisible.bind(this, '取消', record)
    }];
  }

  fetchOperatePropsSix = (record) => {
    return [{
      name: '编辑',
      onClick: this.onEdit.bind(this, record.uuid, false)
    }, {
      name: '取消',
      onClick: this.handleModalVisible.bind(this, '取消', record)
    },
      {
        name: '调度类型转换',
        onClick: this.handleModalVisible.bind(this, '调度类型转换', record)
      }];
  }

  fetchOperatePropsEight = (record) => {
    return [
      {
        name: '调度类型转换',
        onClick: this.handleModalVisible.bind(this, '调度类型转换', record)
      }];
  }

  fetchOperatePropsFive = (record) => {
    return [{
      name: '撤销取消',
      onClick: this.handleModalVisible.bind(this, '撤销取消', record)
    }];
  }
  fetchOperatePropsNine = (record) => {
    return [{
      name: '编辑',
      onClick: this.onEdit.bind(this, record.uuid, false)
    }];
  }

  fetchOperatePropsSeven = (record) => {
    return [{
      name: '编辑',
      onClick: this.onEdit.bind(this, record.uuid, false)
    }, {
      name: '取消',
      onClick: this.handleModalVisible.bind(this, '取消', record)
    }, {
      name: '拆单',
      onClick: this.handleModalVisible.bind(this, '拆单', record)
    }, {
      name: '调度类型转换',
      onClick: this.handleModalVisible.bind(this, '调度类型转换', record)
    }];
  }

  refresh = (billNumber, uuid) => {
    if (!billNumber && !uuid) {
      billNumber = this.state.billNumber;
    }
    if (billNumber) {
      this.props.dispatch({
        type: 'transportOrder/getByBillNumberAndDcUuid',
        payload: {
          billNumber: billNumber
        },
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的运输订单' + billNumber + '不存在！');
            this.onCancel();
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
        type: 'transportOrder/get',
        payload: uuid,
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的运输订单不存在！');
            this.onCancel();
          } else {
            this.setState({
              billNumber: res.data.billNumber
            });
          }
        }
      });
    }
  }

  onReturnCancel = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'transportOrder/returnCancel',
        payload: {
          billNumber: record.billNumber,
          dispatchCenterUuid: loginOrg().uuid
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }

          if (response && response.success) {
            that.refreshTable();
            message.success('撤销取消成功')
          }
        }
      })
    })
  }

  onInitial = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'transportOrder/initial',
        payload: {
          billNumber: record.billNumber,
          dispatchCenterUuid: loginOrg().uuid
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success('审核成功')
          }
        }
      })
    })
  }

  onCancel = () => {
    this.props.dispatch({
      type: 'transportOrder/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }

  cancel = () => {
    const { entity } = this.state;
    this.props.dispatch({
      type: 'transportOrder/cancel',
      payload: {
        billNumber: entity.billNumber,
        dispatchCenterUuid: loginOrg().uuid
      },
      callback: response => {
        if (response && response.success) {
          this.refresh();
          message.success('取消')
        } else {
          message.error(response.message)
        }
      }
    })
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }

  onChangeType = () => {
    const { entity } = this.state;
    this.props.dispatch({
      type: 'transportOrder/changeOrderType',
      payload: {
        billNumber: entity.billNumber,
        dispatchCenterUuid: loginOrg().uuid
      },
      callback: response => {
        if (response && response.success) {
          this.refresh();
          message.success('订单类型转换成功')
        } else {
          message.error(response.message)
        }
      }
    })
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }

  onSplit = (entity) => {
    const payload = {
      showPage: 'split'
    }
    payload.entityUuid = entity.uuid;
    this.props.dispatch({
      type: 'transportOrder/showPage',
      payload: {
        ...payload
      }
    });
  };

  onCreate = () => {
    this.props.dispatch({
      type: 'transportOrder/showPage',
      payload: {
        showPage: 'create',
      }
    });
  }

  onEdit = () => {
    this.props.dispatch({
      type: 'transportOrder/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entity.uuid
      }
    });
  }

  drawTabPanes = () => {
    let tabPanes = [
      this.drawBasicInfoTab()
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

  drawBasicInfoTab = () => {
    const entity = this.state.entity
    let allArticleQty = 0;
    let articleUuids = [];
    let allQtyStr = '0';
    let allAmount = 0;
    entity&&entity.items && entity.items.map(item => {
      if (item.qtyStr) {
        allQtyStr = add(allQtyStr, item.qtyStr);
      }
      if (articleUuids.indexOf(item.article.uuid) === -1) {
        allArticleQty = allArticleQty + 1;
        articleUuids.push(item.article.uuid);
      }
      if (item.price) {
        allAmount = allAmount + item.price * item.qty;
      }
    })
    if(entity && entity.weight) {
      entity.weight = parseFloat(String(entity.weight).replace(/^(.*\..{4}).*$/,"$1"));
    }
    if(entity && entity.volume) {
      entity.volume = parseFloat(String(entity.volume).replace(/^(.*\..{4}).*$/,"$1"));
    }
    let basicItems = [{
      label: commonLocale.billNumberLocal,
      value: entity ? entity.billNumber : ''
    }, {
      label: commonLocale.stateLocale,
      value: entity.stat && State[entity.stat].caption
    }, {
        label: alcNtcLocale.wmsNum,
        value: entity ? entity.wmsNum : ''
      },
      {
        label: '物流来源单号',
        value: entity ? entity.sourceNum : ''
      },
      {
        label: alcNtcLocale.waveNum,
        value: entity ? entity.waveNum : ''
      },
      {
        label: commonLocale.inOwnerLocale,
        value: convertCodeName(entity.owner)
      },
      {
        label: alcNtcLocale.orderType,
        value: entity.orderType && orderBillType[entity.orderType].caption
      },
      {
        label: commonLocale.sourceWayLocale,
        value: entity.sourceWay ? sourceWay[entity.sourceWay].caption : ''
      },
      {
        label: alcNtcLocale.urgencyLevel,
        value: entity.urgencyLevel ? '是' : '否'
      },
      {
        label: alcNtcLocale.allowCashResult,
        value: entity.allowCashResult ? '是' : '否'
      },
      {
        label: '调度类型',
        value: entity.selfhandover ? '自提' : '配送'
      },
      {
        label: alcNtcLocale.orderTime,
        value: entity.orderTime ? moment(entity.orderTime).format('YYYY-MM-DD') : <Empty />
      },
      {
        label: '预约时间',
        value: entity.appointmentTime ? entity.appointmentTime : <Empty />
      },
      {
        label: alcNtcLocale.pickUpPoint,
        value: entity.pickUpPoint ? convertCodeName(entity.pickUpPoint) : ''
      },
      {
        label: '取货点地址',
        value: entity.pickUpPoint&&entity.pickUpPoint.address ? entity.pickUpPoint.address : <Empty />
      },
      {
        label: '取货点具体位置',
        value: entity.pickUpPoint&&entity.pickUpPoint.specificAddress ? entity.pickUpPoint.specificAddress : <Empty />
      },
      {
        label: '取货点联系人',
        value: entity.pickUpPoint&&entity.pickUpPoint.contacter ? entity.pickUpPoint.contacter : <Empty />
      },
      {
        label: '取货点联系电话',
        value: entity.pickUpPoint&&entity.pickUpPoint.contactNumber ? entity.pickUpPoint.contactNumber : <Empty />
      },
      {
        label: alcNtcLocale.deliveryPoint,
        value: entity.deliveryPoint ? convertCodeName(entity.deliveryPoint) : ''
      },
      {
        label: alcNtcLocale.finalPoint,
        value: entity.finalPoint ? convertCodeName(entity.finalPoint) : ''
      }
    ];

    if(entity.orderType === 'TakeDelivery'){
      basicItems.splice(7,0,{
        label: commonLocale.vendorLocale,
        value: entity.vendor ? convertCodeName(entity.vendor) : <Empty/>
      })
    }
    basicItems.push({
      label: commonLocale.noteLocale,
      value: entity.note
    })
    let businessRow = [
      {
        label: '整箱数(估)',
        value: entity ? entity.cartonCount : 0
      },
      {
        label: '整箱数(复核)',
        value: entity ? entity.realCartonCount : 0
      },
      {
        label: '零散数(估)',
        value: entity ? entity.scatteredCount : 0
      },
      {
        label: '零散数(复核)',
        value: entity ? entity.realScatteredCount : 0
      },
      {
        label: commonLocale.inQtyStrLocale,
        value: entity ? entity.totalQtyStr : 0
      },
      {
        label: '周转箱数(估)',
        value: entity ? entity.containerCount : 0
      },
      {
        label: '周转箱数(复核)',
        value: entity ? entity.realContainerCount : 0
      },
      {
        label: '总重量(kg)',
        value: entity ? entity.weight : 0,

      }, {
        label: '总体积(m³)',
        value: entity ? entity.volume : 0
      }
    ];
    const columns = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth
      },
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        width: colWidth.codeColWidth,
        render: (record) => {
          return record.article ? convertCodeName(record.article) : <Empty />;
        }
      },
      {
        title: alcNtcLocale.secondCode,
        key: 'barcode',
        width: itemColWidth.qtyColWidth,
        render: (record) => {
          return record.barcode ? record.barcode : <Empty />;
        }
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        key: 'qpcStr',
        width: itemColWidth.qpcStrColWidth,
        render: (val, record) => {
          return record.qpcStr + '/' + record.munit;
        }
      },
      {
        title: commonLocale.inQtyStrLocale,
        key: 'qtyStr',
        width: itemColWidth.qtyStrColWidth,
        render: (record) => {
          return record.qtyStr;
        }
      },
      {
        title: commonLocale.inQtyLocale,
        key: 'qty',
        width: itemColWidth.qtyColWidth,
        render: (record) => {
          return record.qty;
        }
      },
      {
        title: alcNtcLocale.amount,
        key: 'amount',
        width: itemColWidth.qtyColWidth,
        render: (record) => {
          return record.amount ? record.amount : 0;
        }
      },
      {
        title: alcNtcLocale.weight,
        key: 'weight',
        width: colWidth.dateColWidth,
        render: (record) => {
          return Number(accDiv( accMul(record.weight, record.qty),1000).toFixed(4));
        }
      },
      {
        title: alcNtcLocale.volume,
        key: 'volume',
        width: colWidth.dateColWidth,
        render: (record) => {
          // return accMul(record.volume, record.qty);
          return Number(accDiv( accMul(record.volume, record.qty),1000000).toFixed(4));

        }
      }
    ];

    return (
      <TabPane key="basicInfo" tab={commonLocale.basicInfoLocale}>
        <ViewTabPanel style={{marginTop: '-22px'}}>
        <ViewPanel items={basicItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()}/>
        <ViewTablePanel title={commonLocale.itemsLocale} scroll={{ x: 1300, y:200 }} columns={columns} data={entity.articleDetails ? entity.articleDetails : []} />
        <ConfirmModal
          visible={this.state.modalVisible}
          operate={this.state.operate}
          object={alcNtcLocale.title + ':' + this.state.entity.billNumber}
          onOk={this.handleOk}
          onCancel={this.handleModalVisible}
        />
        </ViewTabPanel>
      </TabPane>
    );
  }
  drawOthers = () => {
    const others = [];
    if (this.state.showProcessView) {
      const { entity } = this.state;
      const data = [{
        title: '创建日期',
        subTitle: entity.createInfo.time,
        description: [{
          label: '整箱数(估)',
          value: entity ? entity.cartonCount : 0
        },
          {
            label: '整箱数(复核)',
            value: entity ? entity.realCartonCount : 0
          },
          {
            label: '零散数(估)',
            value: entity ? entity.scatteredCount : 0
          },
          {
            label: '零散数(复核)',
            value: entity ? entity.realScatteredCount : 0
          },
          {
            label: commonLocale.inQtyStrLocale,
            value: entity ? entity.totalQtyStr : 0
          },
          {
            label: '周转箱数(估)',
            value: entity ? entity.containerCount : 0
          },
          {
            label: '周转箱数(复核)',
            value: entity ? entity.realContainerCount : 0
          },
          {
            label: '总重量(kg)',
            value: entity ? entity.weight : 0
          }, {
            label: '总体积(m³)',
            value: entity ? entity.volume : 0
          }
        ]
      }];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
