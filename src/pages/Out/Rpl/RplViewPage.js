import { connect } from 'dva';
import { Fragment } from 'react';
import { message, Button, Tabs } from 'antd';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { loginCompany, getActiveKey } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { qtyStrToQty, add, toQtyStr } from '@/utils/QpcStrUtil';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import { RplMode, RplType, PickType, RplStep } from '@/pages/Facility/PickArea/PickAreaContants';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import TagUtil from '@/pages/Component/TagUtil';
import { State, StateColor, RplGenFrom, RplBillType, RplDateType } from './RplContants';
import { RPL_RES } from './RplPermission';
import { rplLocale } from './RplLocale';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
const TabPane = Tabs.TabPane;
import { binUsage } from '@/utils/BinUsage';
import { routerRedux } from 'dva/router';
import { WAVEBILL_RES } from '@/pages/Out/Wave/WaveBillPermission';
import Empty from '@/pages/Component/Form/Empty';
import React from "react";
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
@connect(({ rpl, loading }) => ({
  rpl,
  loading: loading.models.rpl,
}))
export default class RplViewPage extends ViewPage {

  constructor(props) {
    super(props);

    this.state = {
      title: rplLocale.title,
      entityUuid: props.rpl.entityUuid,
      billNumber: props.billNumber,
      entity: {},
      operate: '',
      modalVisible: false,
    }
  }

  componentDidMount() {
    this.refresh(this.state.billNumber, this.state.entityUuid);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.rpl.entity) {
      this.setState({
        entity: nextProps.rpl.entity,
        title: rplLocale.title + "：" + nextProps.rpl.entity.billNumber,
        entityUuid: nextProps.rpl.entity.uuid,
      });
    }else if(this.state.entityUuid && nextProps.rpl.entityUuid && this.state.entityUuid != nextProps.rpl.entityUuid){
      // this.refresh(nextProps.rpl.entityUuid);
    }
  }

  drawStateTag = () => {
    if (this.state.entity.state) {
      return (
        <TagUtil value={this.state.entity.state} />
      );
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

  drawActionButtion() {
    return (
      <Fragment>
        <Button onClick={this.onCancel}>
          {commonLocale.backLocale}
        </Button>
        <PrintButton
          reportParams={[{ billNumber: `${this.state.entity.billNumber}` }]}
          moduleId={PrintTemplateType.RPLBILL.name} />
        {
          this.state.entity.state === State.APPROVED.name && !(this.state.entity.rplMode === RplMode.MANUAL.name &&
            this.state.entity.targetRplMode === RplMode.MANUAL.name) &&
          <Button
            onClick={() => this.handleModalVisible(commonLocale.editLocale)}
            disabled={!havePermission(RPL_RES.MODIFYRPLMODE)}
          >{rplLocale.modifyMode}</Button>
        }
        {
          this.state.entity.state && State[this.state.entity.state].name === State.APPROVED.name &&
          <Button
            onClick={() => this.onEdit()}>{commonLocale.editLocale}</Button>
        }
        {
          this.state.entity.state && State[this.state.entity.state].name === State.APPROVED.name
          && RplMode[this.state.entity.rplMode].name !== RplMode.RF.name
          && RplMode[this.state.entity.rplMode].name !== RplMode.LABEL.name &&
          <Button
            type='primary'
            onClick={() => this.handleAuditModalVisible(commonLocale.auditLocale)}
            disabled={!havePermission(RPL_RES.AUDIT)}
          >{commonLocale.auditLocale}</Button>
        }
      </Fragment>
    );
  }

  refresh = (billNumber, uuid) => {
    if (!billNumber && !uuid) {
      billNumber = this.state.billNumber;
    }
    if (billNumber) {
      this.props.dispatch({
        type: 'rpl/getByNumber',
        payload: billNumber,
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的补货单' + billNumber + '不存在！');
            this.onCancel();
          } else {
            this.setState({
              billNumber: res.data.billNumber
            });
          }
        }
      });
    }
    if (uuid) {
      this.props.dispatch({
        type: 'rpl/get',
        payload: {
          uuid: uuid
        },
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的补货单单不存在！');
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

  /**
   * 点击上一单
   */
  previousBill = () => {
    const { entity } = this.state;
    if (entity.uuid){
      this.props.dispatch({
        type: 'rpl/previousBill',
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
        type: 'rpl/nextBill',
        payload: entity.billNumber
      });
    }
  }

  handleModalVisible = () => {
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }

  onCancel = () => {
    this.props.dispatch({
      type: 'rpl/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }

  /**
   * 审核
   */
  onAudit = () => {
    const { entity } = this.state;
    this.props.dispatch({
      type: 'rpl/onAudit',
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

  onEdit = () => {
    this.props.dispatch({
      type: 'rpl/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entity.uuid
      }
    });
  }

  /**
   * 跳转到波次单详情页面
   */
  onWaveView = (record) => {
    this.props.dispatch({
      type: 'wave/getByNumber',
      payload: record,

      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/out/wave',
            payload: {
              showPage: 'view',
              entityUuid: response.data ? response.data.uuid : undefined
            }
          }));
        }
      }
    });
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

  darwProcess = () => {
    return <a onClick={() => this.viewProcessView()}>流程进度</a>;
  };

  viewProcessView = () => {
    this.setState({
      showProcessView: !this.state.showProcessView
    });
  };

  /**
   * 修改操作方式
   */
  onEditMode = () => {
    const { dispatch } = this.props;
    const { entity } = this.state;
    dispatch({
      type: 'rpl/onEditMode',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: (response) => {
        if (response && response.success) {
          this.refresh();
          message.success(commonLocale.modifySuccessLocale);
        }
      }
    });
    this.handleModalVisible();
  };

  /**
   * 模态框确认操作
   */
  handleOk = () => {
    const { operate } = this.state;
    if (operate === commonLocale.auditLocale) {
      this.onAudit();
    }
  }

  drawTabPanes = () => {
    let tabPanes = [
      this.drawBasicInfoTab()
    ];

    return tabPanes;
  }

  drawBasicInfoTab = () => {
    // const entity = this.props.rpl.entity;
    const entity = this.state.entity
    let allArticleQty = 0;
    let articleUuids = [];
    let allQtyStr = '0';
    let allAmount = 0;
    entity.items && entity.items.map(item => {
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
    let basicItems = [{
      label: rplLocale.pickArea,
      value: convertCodeName(entity.pickarea)
    }, {
      label: rplLocale.type,
      value: entity.type && RplBillType[entity.type].caption
    }, {
      label: rplLocale.mode,
      value: entity.rplMode && RplMode[entity.rplMode].caption
    }, {
      label: '单据类型',
      value: entity.rplDateType && RplDateType[entity.rplDateType].caption
    },{
      label: rplLocale.waveBillNumber,
      value: entity.waveBillNumber ?
        <span> <a onClick={this.onWaveView.bind(this, entity.waveBillNumber)}
          disabled={!havePermission(WAVEBILL_RES.VIEW)}>{entity.waveBillNumber}</a> </span> : <Empty />
    }, {
      label: rplLocale.rpler,
      value: convertCodeName(entity.rpler)
    }, {
      label: rplLocale.step,
      value: entity.rplStep && RplStep[entity.rplStep].caption
    }, {
      label: rplLocale.genFrom,
      value: entity.genFrom && RplGenFrom[entity.genFrom].caption
    }, {
      label: commonLocale.noteLocale,
      value: entity.note
    }];
    let businessItems = [{
      label: commonLocale.inAllQtyStrLocale,
      value: entity.totalQtyStr
    }, {
      label: commonLocale.inAllRealQtyStrLocale,
      value: entity.realTotalQtyStr
    }, {
      label: commonLocale.inAllVolumeLocale,
      value: entity.totalVolume
    }, {
      label: commonLocale.inAllRealVolumeLocale,
      value: entity.realTotalVolume
    }, {
      label: commonLocale.inAllWeightLocale,
      value: entity.totalWeight
    }, {
      label: commonLocale.inAllRealWeightLocale,
      value: entity.realTotalWeight
    }];
    let timeLineData = [
      { title: rplLocale.startRplTime, time: entity.startRplTime },
      { title: rplLocale.endRplTime, time: entity.endRplTime }
    ];
    if (entity.rplMode == RplMode.LABEL.name) {
      timeLineData.push({ title: commonLocale.printTimeLocale, time: entity.printTime });
    }
    timeLineData.sort(function (a, b) {
      if (a.time && b.time) {
        return a.time > b.time;
      } else if (a.time) {
        return false;
      }
      return true;
    });
    let current = 0;
    for (let i = timeLineData.length - 1; i >= 0; i--) {
      if (timeLineData[i].time) {
        current = i;
        break;
      }
    }
    const columns = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth
      },
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        dataIndex: 'article',
        width: colWidth.codeNameColWidth,
        render: (val) => {
          return <span>
            <a onClick={this.onViewArticle.bind(true, val ? val.uuid : undefined)}
            ><EllipsisCol colValue={convertCodeName(val)} /></a>
          </span>;
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
        dataIndex: 'qtyStr',
        width: itemColWidth.qtyStrColWidth
      },
      {
        title: commonLocale.inAllRealQtyStrLocale,
        dataIndex: 'realQtyStr',
        key: 'realQtyStr',
        width: itemColWidth.qtyStrColWidth
      },
      {
        title: commonLocale.productionBatchLocale,
        dataIndex: 'productionBatch',
        width: colWidth.enumColWidth,
        render: val => {
          return (
            <span>{val ? val : <Empty />}</span>
          );
        }
      },

      {
        title: rplLocale.fromBinCode,
        width: colWidth.codeColWidth,
        render: record => <EllipsisCol colValue={record.fromBinCode && record.fromBinUsage ? (record.fromBinCode + "[" + binUsage[record.fromBinUsage].caption + "]") : <Empty />} />
      },
      {
        title: rplLocale.fromContainerBarCode,
        key: 'fromContainerBarcode',
        width: colWidth.codeColWidth,
        render: record => record.fromContainerBarcode == "-" ? record.fromContainerBarcode :
          <a onClick={this.onViewContainer.bind(true, record.fromContainerBarcode ? record.fromContainerBarcode : undefined)}
          >{record.fromContainerBarcode}</a>
      },
      {
        title: rplLocale.toBinCode,
        width: colWidth.codeColWidth,
        render: record => <EllipsisCol colValue={record.toBinCode && record.toBinUsage ? (record.toBinCode + "[" + binUsage[record.toBinUsage].caption + "]") : <Empty />} />
      }
    ];

    let content = '您将修改为' + (entity.rplMode === RplMode.MANUAL.name ? RplMode[entity.targetRplMode].caption : RplMode.MANUAL.caption) + '，是否修改？';
    return (
      <TabPane key="basicInfo" tab={commonLocale.basicInfoLocale}>
        <ViewPanel items={basicItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()}/>
        <ViewTablePanel title={commonLocale.itemsLocale} columns={columns} data={entity.items ? entity.items : []} />
        <ConfirmModal
          operate={'修改操作方式'}
          content={content}
          visible={this.state.modalVisible}
          onOk={() => this.onEditMode()}
          onCancel={this.handleModalVisible}
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

  drawOthers = () => {
    const others = [];
    if (this.state.showProcessView) {
      const { entity } = this.state;
      const data = [{
        title: '开始补货',
        subTitle: entity.startRplTime,
        current: entity.state !== '',
        description: [{
          label: commonLocale.inAllQtyStrLocale,
          value: entity.totalQtyStr
        }, {
          label: commonLocale.inAllVolumeLocale,
          value: entity.totalVolume
        }, {
          label: commonLocale.inAllWeightLocale,
          value: entity.totalWeight
        }]
      },{
        title: '结束补货',
        subTitle: entity.endRplTime,
        current: entity.state == State.AUDITED.name,
        description: [{
          label: commonLocale.inAllRealQtyStrLocale,
          value: entity.realTotalQtyStr
        }, {
          label: commonLocale.inAllRealVolumeLocale,
          value: entity.realTotalVolume
        }, {
          label: commonLocale.inAllRealWeightLocale,
          value: entity.realTotalWeight
        }]
      }];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
