import { connect } from 'dva';
import { Fragment } from 'react';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import { Button, Tabs, Modal, message, Progress, Spin } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';
import { RplMode, RplType, PickMethod } from '@/pages/Facility/PickArea/PickAreaContants';
import TagUtil from '@/pages/Component/TagUtil';
import { State, RplBillType } from '@/pages/Out/Rpl/RplContants';
import { PickupBillState, PickType } from '@/pages/Out/PickUp/PickUpBillContants';
import { CrossPickupBillState, CrossPickupBillItemState, PickType as CrossPickType } from '@/pages/Out/CrossPickUp/CrossPickUpBillContants';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { convertCodeName } from '@/utils/utils';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { WAVEBILL_RES } from './WaveBillPermission';
import { WaveBillState, WaveType, StockAllocateType } from './WaveBillContants';
import { waveBillLocale } from './WaveBillLocale';
import Empty from '@/pages/Component/Form/Empty';
import styles from './Wave.less';
import ShowDifferentPage from './ShowDifferentPage';
import { routerRedux } from 'dva/router';
import { ALCNTC_RES } from '@/pages/Out/AlcNtc/AlcNtcPermission';
import { STORE_RES } from '@/pages/Basic/Store/StorePermission';
import { PICKUPBILL_RES } from '@/pages/Out/PickUp/PickUpBillPermission';
import { CROSSPICKUPBILL_RES } from '@/pages/Out/CrossPickUp/CrossPickUpBillPermission';
import { RPL_RES } from '@/pages/Out/Rpl/RplPermission';
import { getActiveKey } from '@/utils/LoginContext';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import React from "react";
const TabPane = Tabs.TabPane;



let dragingIndex = -1;
class BodyRow extends React.Component {
  render() {
    const { isOver, connectDragSource, connectDropTarget, ...restProps } = this.props;
    const style = { ...restProps.style, cursor: 'move' };

    let className = restProps.className;
    if (isOver) {
      if (restProps.index > dragingIndex) {
        className += ' drop-over-downward';
      }
      if (restProps.index < dragingIndex) {
        className += ' drop-over-upward';
      }
    }

    return connectDragSource(
      connectDropTarget(<tr {...restProps} className={className} style={style} />),
    );
  }
}

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;
    if (dragIndex === hoverIndex) {
      return;
    }
    props.moveRow(dragIndex, hoverIndex);
    monitor.getItem().index = hoverIndex;
  },
};
const rowSource = {
  beginDrag(props) {
    dragingIndex = props.index;
    return {
      index: props.index,
    };
  },
};
const DragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
}))(
  DragSource('row', rowSource, connect => ({
    connectDragSource: connect.dragSource(),
  }))(BodyRow),
);


@connect(({ wave, alcNtc, pickup, rpl, crossPickUp, loading }) => ({
  wave, alcNtc, pickup, rpl, crossPickUp,
  loading: loading.models.wave
}))
export default class WaveBillViewPage extends ViewPage {
  constructor(props) {
    super(props);
    this.state = {
      entity: {},
      entityItems: [], // 波次单对应的详情
      items: [],

      alcNtcPageInfo: [],// 波次单对应的配单信息(包含分页信息)
      storeInfos: [],// 波次单对应的门店信息
      pickUpPageInfo: [], // 波次单对应的拣货单信息
      crossPickUpPageInfo: [], // 波次单对应的集合拣货单信息
      rplPageInfo: [], // 波次单对应的补货单信息
      pickUpLoading: true,
      crossPickUpLoading: true,
      rplLoading: true,
      waveList: [],
      entityUuid: props.entityUuid,
      billNumber: props.billNumber,
      waveBillNumber: props.waveBillNumber,
      waveState: props.waveState,
      title: '',
      operate: '',
      modalVisible: false,
      scheduleModalvisible: false,//执行进度模态框
      differentPageVisible: false, // 查看差异模态框
      pageFilter: {
        page: 0,
        pageSize: 10,
        searchKeyValues: {
          dcUuid: loginOrg().uuid,
          companyUuid: loginCompany().uuid
        },
      },
      schedule: {},//该波次单的执行进度,

      suspendLoading: false,
      activeKey: "alcNtcBill"
    }
  }
  componentDidMount() {
    this.refresh(this.state.billNumber, this.state.entityUuid);

  }

  componentWillUnmount() {
    clearInterval(this.timerID)
    if(this.props.pathname){
      let pathname = this.props.pathname;
      let namespace = pathname.substring(pathname.lastIndexOf('/') + 1, pathname.length);
      if(this.props[namespace]){
        this.props[namespace].showPage = 'query'
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const entity = nextProps.wave.entity;
    if(entity) {
      this.setState({
        entity: entity,
        title: waveBillLocale.title + '：' + entity.billNumber,
        entityUuid: entity.uuid,
        billNumber: entity.billNumber
      });
    }
    if (nextProps.wave.entityItems && (this.props.wave.entityUuid || this.state.entityUuid)) {
      this.setState({
        entityItems: nextProps.wave.entityItems
      });
    }

    if (nextProps.wave.storeInfos && (this.props.wave.entityUuid || this.state.entityUuid)) {
      for (var i = 0; i < nextProps.wave.storeInfos.length; i++) {
        nextProps.wave.storeInfos[i].line = i + 1;
      }
      this.setState({
        storeInfos: nextProps.wave.storeInfos
      })
    }

    if (nextProps.alcNtc.waveAlcNtcData && (this.props.wave.entityUuid || this.state.entityUuid)) {
      for (var i = 0; i < nextProps.alcNtc.waveAlcNtcData.list.length; i++) {
        nextProps.alcNtc.waveAlcNtcData.list[i].line = i + 1;
      }

      this.setState({
        alcNtcPageInfo: nextProps.alcNtc.waveAlcNtcData ? nextProps.alcNtc.waveAlcNtcData : [],
      });
    }

    if (nextProps.pickup.wavePickUpData && nextProps.pickup.wavePickUpData != this.props.pickup.data) {
      let line = 1;
      for (let i = 0; i < nextProps.pickup.wavePickUpData.list.length; i++) {
        nextProps.pickup.wavePickUpData.list[i].line = line;
        line++;
      }
      this.setState({
        pickUpPageInfo: nextProps.pickup.wavePickUpData ? nextProps.pickup.wavePickUpData : [],
      });
    }

    if (nextProps.crossPickUp.data.list && nextProps.crossPickUp.data.list != this.props.crossPickUp.data.list) {
      let line = 1;
      for (let i = 0; i < nextProps.crossPickUp.data.list.length; i++) {
        nextProps.crossPickUp.data.list[i].line = line;
        line++;
      }
      this.setState({
        crossPickUpPageInfo: nextProps.crossPickUp.data,
      });
    }

    if (nextProps.rpl.waveRplData && nextProps.rpl.waveRplData != this.props.rpl.data) {
      let line = 1;
      for (let i = 0; i < nextProps.rpl.waveRplData.list.length; i++) {
        nextProps.rpl.waveRplData.list[i].line = line;
        line++;
      }
      this.setState({
        rplPageInfo: nextProps.rpl.waveRplData ? nextProps.rpl.waveRplData : [],
      });
    }

    if (nextProps.wave.schedule && this.state.scheduleModalvisible) {
      this.setState({
        schedule: nextProps.wave.schedule
      });
      if (nextProps.wave.schedule.state === WaveBillState.STARTED.name) {
        clearInterval(this.timerID)
      }
    }
    const nextBillNumber = nextProps.billNumber;
    if (nextBillNumber && nextBillNumber !== this.state.billNumber) {
      this.setState({
        billNumber: nextBillNumber
      });
      this.refresh(nextBillNumber);
    }
  }
  /**
  * 刷新
  */
  refresh(billNumber, uuid) {
    const { entityUuid, waveBillNumber } = this.state;
    if (!billNumber && !uuid) {
      billNumber = this.state.billNumber;
    }
    if (billNumber) {
      this.props.dispatch({
        type: 'wave/getByNumber',
        payload: billNumber,
        callback: (response) => {
          if (!response || !response.data || !response.data.uuid) {
            message.error('指定的波次单' + billNumber + '不存在！');
            this.onBack();
            return;
          }
          if (response && response.success) {
            this.getAlcNtcBills();
            this.getPickUpBills();
            this.getRplBills(0, 10);
            this.setState({
              activeKey: "alcNtcBill"
            })
            if (response.data.waveType == WaveType.PRERPL.name) {
              this.getRplBills(0, 10);
            }
            if (response.data.state === WaveBillState.FINISHED.name || response.data.state === WaveBillState.STARTEXCEPTION.name) {
              clearInterval(this.timerID);
            }
          }
        }
      });
      return;
    }

    if (uuid) {
      this.props.dispatch({
        type: 'wave/get',
        payload: {
          uuid: uuid
        },
        callback: (response) => {
          if (!response || !response.data || !response.data.uuid) {
            message.error('指定的波次单不存在！');
            this.onBack();
            return;
          }

          if (response && response.success) {
            this.getPickUpBills();
            this.getAlcNtcBills();
            this.getRplBills(0, 10);
            if (response.data.waveType == WaveType.PRERPL.name) {
              this.getRplBills(0, 10);
            }
            if (response.data.state === WaveBillState.FINISHED.name || response.data.state === WaveBillState.STARTEXCEPTION.name) {
              clearInterval(this.timerID);
            }
          }
        }
      });
    }else{
      this.props.dispatch({
        type: 'wave/get',
        payload: {
          uuid: entityUuid
        },
        callback: (response) => {
          if (!response || !response.data || !response.data.uuid) {
            message.error('指定的波次单不存在！');
            this.onBack();
            return;
          }

          if (response && response.success) {
            this.getAlcNtcBills();
            this.getPickUpBills();
            this.getRplBills(0, 10);
            if (response.data.waveType == WaveType.PRERPL.name) {
              this.getRplBills(0, 10);
            }
            if (response.data.state === WaveBillState.FINISHED.name || response.data.state === WaveBillState.STARTEXCEPTION.name) {
              clearInterval(this.timerID);
            }
          }
        }
      });
    }
  }
  /**
   * 获取该波次单对应的配单
   */
  getAlcNtcBills = (page, pageSize) => {
    const { waveBillNumber, pageFilter } = this.state;

    this.state.pageFilter.searchKeyValues = {
      ...this.state.pageFilter.searchKeyValues,
      waveBillNumber: this.state.billNumber
    }

    if (page != undefined && pageSize != undefined) {
      this.state.pageFilter.page = page
      this.state.pageFilter.pageSize = pageSize
    }

    let queryFilter = {
      ...this.state.pageFilter
    }

    this.props.dispatch({
      type: 'alcNtc/queryWaveAlcNtc',
      payload: queryFilter
    });
  }

  /**
   * 获取该波次单对应的门店信息
   */
  queryStoreInfo() {
    this.props.dispatch({
      type: 'wave/queryStoreInfo',
      payload: {
        billNumber: this.state.billNumber
      }
    });
  }

  /**
   * 获取该波次单对应的拣货单信息（表格变化时调用）
   */
  getPickUpBills = (page, pageSize) => {
    this.setState({
      pickUpLoading: true
    });
    const { pageFilter } = this.state;
    this.state.pageFilter.searchKeyValues = {
      ...this.state.pageFilter.searchKeyValues,
      waveBillNumber: this.state.billNumber
    }

    this.state.pageFilter.page = page
    this.state.pageFilter.pageSize = pageSize

    let queryFilter = { ...pageFilter }

    this.props.dispatch({
      type: 'pickup/queryWavePickUp',
      payload: queryFilter,
      callback: response => {
        if (response && response.success) {
          this.setState({
            pickUpLoading: false
          })
        }
      }
    });
  }

  /**
   * 获取该波次单对应的补货单信息（表格变化时调用）
   */
  getRplBills = (page, pageSize) => {
    this.setState({
      rplLoading: true
    });
    const { pageFilter } = this.state;
    this.state.pageFilter.searchKeyValues = {
      ...this.state.pageFilter.searchKeyValues,
      waveBillNumber: this.state.billNumber
    }

    this.state.pageFilter.page = page
    this.state.pageFilter.pageSize = pageSize

    let queryFilter = { ...pageFilter }

    this.props.dispatch({
      type: 'rpl/queryWaveRpl',
      payload: queryFilter,
      callback: response => {
        if (response && response.success) {
          this.setState({
            rplLoading: false
          })
        }
      }
    });
  }

  /**
   * 获取该波次单执行进度--
   */
  getSchedule() {
    this.props.dispatch({
      type: 'wave/getSchedule',
      payload: {
        billNumber: this.state.billNumber
      },
    });
  }

  /**
  * 返回
  */
  onBack = () => {
    this.props.dispatch({
      type: 'wave/showPage',
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
        type: 'wave/previousBill',
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
        type: 'wave/nextBill',
        payload: entity.billNumber
      });
    }
  }

  /**
  * 编辑
  */
  onEdit = () => {
    this.props.dispatch({
      type: 'wave/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entityUuid,
        waveBillNumber: this.state.billNumber
      }
    });
  }
  /**
   * 完成
   */
  onFinish = () => {
    this.props.dispatch({
      type: 'wave/showPage',
      payload: {
        showPage: 'finish',
        entityUuid: this.state.entityUuid,
        waveBillNumber: this.state.billNumber,
        state: this.state.entity.state
      }
    });
  }

  /**
   * 启动
   */
  onStart = () => {
    const that = this;
    this.setState({
      modalVisible: !this.state.modalVisible
    }, () => {
      this.props.dispatch({
        type: 'wave/onStart',
        payload: {
          uuid: this.state.entityUuid,
          version: this.state.entity.version
        },
        callback: (response) => {
          if (!response || response.success == false || response.error) {
            this.onScheduleModelCancel();
          }
          if (response && response.success) {
            this.handleScheduleModalVisible();
          }
        }
      });
    });
  }
  /**
   * 回滚
   */
  onRollBack = () => {
    this.props.dispatch({
      type: 'wave/onRollBack',
      payload: {
        uuid: this.state.entityUuid,
        version: this.state.entity.version
      },
      callback: response => {
        if (response && response.success) {
          // this.refresh();
          this.refresh(this.state.entity.billNumber);

          message.success(commonLocale.rollBackSuccessLocale)
        }
        this.getSchedule();
        this.setState({
          schedule: {}
        });
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }
  /**
   * 作废，仅适用于预补波次单
   */
  onAbort = () => {
    this.props.dispatch({
      type: 'wave/onAbort',
      payload: this.state.entity.billNumber,
      callback: response => {
        if (response && response.success) {
          this.refresh(this.state.billNumber);

          message.success(commonLocale.abortSuccessLocale);
        }
        this.getSchedule();
        this.setState({
          schedule: {}
        });
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }
  /**
   * 确认
   */
  onConfirm = () => {
    this.props.dispatch({
      type: 'wave/onConfirm',
      payload: {
        uuid: this.state.entityUuid,
        version: this.state.entity.version
      },
      callback: response => {
        if (response && response.success) {
          this.refresh(this.state.entity.billNumber);
          message.success(commonLocale.confirmSuccessLocale);
        } else {
          message.error(response.message)
        }
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }

  /**
   * 查看波次进度显示/隐藏
   */
  handleScheduleModalVisible = () => {
    this.setState({
      scheduleModalvisible: !this.state.scheduleModalvisible,
      suspendLoading: true
    }, () => {
      if (this.state.scheduleModalvisible == true) {
        this.timerID = setInterval(
          () => this.getSchedule(),
          1000
        );
      } else if (this.state.scheduleModalvisible == false) {
        this.setState({
          suspendLoading: false
        });
        clearInterval(this.timerID);
        this.refresh(this.state.billNumber);

      }
    });

  }

  /**
   * 查看差异 显示/隐藏
   */
  handleDifferentPageVisible = (flag) => {
    if (flag) {
      this.props.dispatch({
        type: 'wave/queryWaveDifference',
        payload: {
          waveBillUuid: this.state.entityUuid,
          articleCode: '',
          fillRate: ''
        },
      });
    }
    this.setState({
      differentPageVisible: flag ? flag : false
    })
  }

  /**
   * 模态框显示/隐藏
   */
  handleModalVisible = (operate) => {
    if (operate != undefined) {
      this.setState({
        operate: operate
      })
    }

    this.setState({
      modalVisible: !this.state.modalVisible
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
   * 模态框确认操作
   */
  handleOk = () => {
    const { operate } = this.state;
    if (operate === commonLocale.deleteLocale) {
      this.onDelete();
    } else if (operate === waveBillLocale.start) {
      this.onStart();
    } else if (operate == waveBillLocale.rollBack) {
      this.onRollBack();
    } else if (operate === commonLocale.abortLocale) {
      this.onAbort();
    } else {
      this.onConfirm();
    }
  }

  /**
   * 删除
   */
  onDelete = () => {
    const { entity } = this.state
    this.props.dispatch({
      type: 'wave/onRemove',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: (response) => {
        if (response && response.success) {
          this.onBack();
          message.success(commonLocale.removeSuccessLocale)
        } else {
          message.error(response.message)
        }
      }
    })
  }
  refreshColumns = (StoreItemsCols) => {
    StoreItemsCols.forEach(e => {
      if (e.width) {
        e.onCell = () => {
          return {
            style: {
              maxWidth: e.width,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }
          }
        }
      }
    });
  }


  /**
   * 切换详情面板时触发
   */
  handleChangeTabPane = (e) => {
    this.setState({
      pickUpLoading: true,
      rplLoading: true,
      activeKey: e
    });
    const { pageFilter } = this.state;
    this.state.pageFilter.searchKeyValues = {
      ...this.state.pageFilter.searchKeyValues,
      waveBillNumber: this.state.entity.billNumber
    }
    this.state.pageFilter.page = 0;
    this.state.pageFilter.pageSize = 10;
    let queryFilter = { ...pageFilter }
    let type = ''
    if (e == 'alcNtcBill') {
      type = 'alcNtc/queryWaveAlcNtc';
    } else if (e == 'store') {
      this.queryStoreInfo();
      return;
    } else if (e == 'pickUpBill') {
      type = 'pickup/queryWavePickUp'
    } else if (e == 'crossPickUpBill') {
      type = 'crossPickUp/query'
    } else if (e == 'rplBill') {
      type = 'rpl/queryWaveRpl'
    }
    this.props.dispatch({
      type: type,
      payload: queryFilter,
      callback: response => {
        if (response && response.success) {
          if (type === 'pickup/queryWavePickUp') {
            this.setState({
              pickUpLoading: false
            });
          } else if (type === 'crossPickUp/query') {
            this.setState({
              crossPickUpLoading: false
            });
          } else if (type === 'rpl/queryWaveRpl') {
            this.setState({
              rplLoading: false
            });
          }
        }
      }
    });
  }

  /**
   * 跳转到配单详情页面
   */
  onAlcNtcView = (record) => {
    this.props.dispatch({
      type: 'alcNtc/getByNumber',
      payload: record,

      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/out/alcNtc',
            payload: {
              showPage: 'view',
              billNumber: record,
            }
          }));
        }
      }
    });
  }

  /**
   * 跳转到门店详情页面
   */
  onStoreView = (store) => {
    this.props.dispatch({
      type: 'store/getByCompanyUuidAndCode',
      payload: store.code,

      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/basic/store',
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
   * 跳转到拣货单详情页面
   */
  onPickUpView = (record) => {
    this.props.dispatch({
      type: 'pickup/getByNumber',
      payload: record,

      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/out/pickup',
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
   * 跳转到集合拣货单详情界面
   */
  onCrossPickUpView = (record) => {
    this.props.dispatch({
      type: 'crossPickUp/getByNumber',
      payload: record,

      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/out/crossPickUp',
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
   * 跳转到补货单详情页面
   */
  onRplView = (record) => {
    this.props.dispatch({
      type: 'rpl/getByNumber',
      payload: record,

      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/out/rpl',
            payload: {
              showPage: 'view',
              entityUuid: response.data ? response.data.uuid : undefined
            }
          }));
        }
      }
    });
  }

  recalcPalletBin = () => {
    this.props.dispatch({
      type: 'wave/recalcPalletBin',
      payload: this.state.entity.uuid,
      callback: (response) => {
        if (response && response.success) {
          message.success('重算完成。');
        }
      }
    });
  }
  /**
   *  拖拽
   */
  components = {
    body: {
      row: DragableBodyRow,
    },
  };

  moveRow = (dragIndex, hoverIndex) => {
    const { data, dispatch } = this.props
    const { storeInfos } = this.state;
    const dragRow = storeInfos[dragIndex];
    const hoverRow = storeInfos[hoverIndex];

    let orderNo = '';
    if (this.state.entity.stockAllocateScheme == undefined && this.state.entity.pickOrderScheme != undefined) {
      orderNo = hoverRow.stockOrder
    } else if (this.state.entity.pickOrderScheme == undefined && this.state.entity.stockAllocateScheme != undefined) {
      orderNo = hoverRow.pickOrder
    } else {
      orderNo = hoverRow.stockOrder
    }
    var payload = {
      billNumber: this.state.waveBillNumber,
      storeUuid: dragRow.store.uuid,
      orderNo: orderNo,
    }
    dispatch({
      type: 'wave/modifyOrderItem',
      payload: { ...payload },
      callback: response => {
        if (response && response.success) {
          this.queryStoreInfo();
        }
      }
    });
  };
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
          {
            WaveBillState[this.state.entity.state].name == 'INPROGRESS' &&
              (this.state.entity.waveType == WaveType.ONESTEPCROSS.name || this.state.entity.waveType == WaveType.TWOSTEPCROSS.name) ?
              <Button type="primary" onClick={() => this.onFinish()}
                disabled={!havePermission(WAVEBILL_RES.FINISH)}
              >
                {commonLocale.finishLocale}
              </Button>
              : null
          }
          {
            WaveBillState[this.state.entity.state].name == 'INPROGRESS' ?
              <Button onClick={this.recalcPalletBin}>
                {'重算集货板位'}
              </Button>
              : null
          }
          {
            WaveBillState[this.state.entity.state].name == 'SAVED' ?
              <Button onClick={this.onEdit}
                disabled={!havePermission(WAVEBILL_RES.EDIT)}
              >
                {commonLocale.editLocale}
              </Button>
              : null
          }
          {
            WaveBillState[this.state.entity.state].name == 'STARTING' ?
              <Button onClick={() => this.handleScheduleModalVisible()}
              >
                {waveBillLocale.schedule}
              </Button>
              : null
          }
          {
            (WaveBillState[this.state.entity.state].name == 'STARTEXCEPTION' ||
              WaveBillState[this.state.entity.state].name == 'STARTED') ?
              (
                WaveType.PRERPL.name === this.state.entity.waveType ?
                  <Button onClick={() => this.handleModalVisible(commonLocale.abortLocale)}
                    disabled={!havePermission(WAVEBILL_RES.ROLLBACK)}>{commonLocale.abortLocale}</Button>
                  : <Button onClick={() => this.handleModalVisible(waveBillLocale.rollBack)}
                    disabled={!havePermission(WAVEBILL_RES.ROLLBACK)}>{waveBillLocale.rollBack}</Button>
              )
              : null
          }
          {
            (WaveBillState[this.state.entity.state].name == 'STARTED' || WaveBillState[this.state.entity.state].name == 'INPROGRESS' || WaveBillState[this.state.entity.state].name == 'FINISHED')
              && this.state.entity.waveType != WaveType.PRERPL.name ?
              <Button onClick={() => this.handleDifferentPageVisible(true)}
              >
                {waveBillLocale.showDifferentButton}
              </Button>
              : null
          }
          {
            WaveBillState[this.state.entity.state].name == 'STARTED' ?
              <Button type="primary" onClick={() => this.handleModalVisible('')}
                disabled={!havePermission(WAVEBILL_RES.CONFIRM)}
              >
                {waveBillLocale.confirmButton}
              </Button>
              : null
          }
          {
            WaveBillState[this.state.entity.state].name == 'SAVED' ?
              <Button onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}
                disabled={!havePermission(WAVEBILL_RES.DELETE)}
              >
                {commonLocale.deleteLocale}
              </Button>
              : null
          }
          {
            WaveBillState[this.state.entity.state].name == 'SAVED' ?
              <Button type="primary" onClick={() => this.handleModalVisible(waveBillLocale.start)}
                disabled={!havePermission(WAVEBILL_RES.START)}
              >
                {waveBillLocale.start}
              </Button>
              : null
          }
        </Fragment>
      );
    }
  }

  onScheduleModelCancel = () => {
    this.handleScheduleModalVisible();
    // this.refresh();

    this.props.wave.schedule = {};

  }

  /**
  * 绘制信息详情
  */
  drawItemInfoTab = () => {
    const { entity, entityItems, alcNtcPageInfo, schedule } = this.state;

    if (schedule.state === 'STARTED' || schedule.state === 'STARTEXCEPTION') {
      clearInterval(this.timerID);
    }

    // 基本信息
    let profileItems = [
      {
        label: commonLocale.inWaveTypeLocale,
        value: entity.waveType ? WaveType[entity.waveType].caption : ''
      },
      {
        label: waveBillLocale.type,
        value: entity.type
      },
    ];

    if (entity.waveType == WaveType.UNIFY.name) {
      profileItems.push(
        {
          label: waveBillLocale.collectBinMgrScheme,
          value: convertCodeName(entity.collectBinMgrScheme)
        },
        {
          label: waveBillLocale.pickOrderScheme,
          value: convertCodeName(entity.pickOrderScheme)
        },
        {
          label: waveBillLocale.stockAllocateType,
          value: entity.stockAllocateType ? StockAllocateType[entity.stockAllocateType].caption : ''
        },
      );
    } else if (entity.waveType == WaveType.ONESTEPCROSS.name || entity.waveType == WaveType.TWOSTEPCROSS.name) {
      profileItems.push(
        {
          label: waveBillLocale.collectBinMgrScheme,
          value: convertCodeName(entity.collectBinMgrScheme)
        },
      );
    }
    if (entity.stockAllocateType != StockAllocateType.AVG.name && entity.waveType == WaveType.UNIFY.name) {
      profileItems.push(
        {
          label: waveBillLocale.stockAllocateScheme,
          value: convertCodeName(entity.stockAllocateScheme)
        }
      )
    }
    profileItems.push(
      {
        label: commonLocale.noteLocale,
        value: entity.note
      }
    )

    // 配单信息
    let AlcNtcItemsCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: waveBillLocale.alcNtcBillNumber,
        width: colWidth.billNumberColWidth - 80,
        render: record =>
          <a onClick={this.onAlcNtcView.bind(this, record.billNumber)}
            disabled={!havePermission(ALCNTC_RES.VIEW)}>{record.billNumber}</a>
      },
      {
        title: commonLocale.inStoreLocale,
        width: colWidth.codeNameColWidth - 50,
        render: record =>
          <a onClick={this.onViewStore.bind(true, record.store ? record.store.uuid : undefined)}
            disabled={!havePermission(STORE_RES.VIEW)}>{convertCodeName(record.store)}</a>
      },
      {
        title: waveBillLocale.totalQtyStr,
        dataIndex: 'totalQtyStr',
        width: itemColWidth.qtyStrColWidth - 90,
      },
      {
        title: waveBillLocale.totalAmount,
        dataIndex: 'totalAmount',
        width: itemColWidth.qtyStrColWidth - 90,
      },
      {
        title: waveBillLocale.pickupTotalQtyStr,
        dataIndex: 'totalPlanQtyStr',
        width: itemColWidth.qtyStrColWidth - 90,
      },
      {
        title: waveBillLocale.pickupTotalAmount,
        width: itemColWidth.qtyStrColWidth - 90,
        dataIndex: 'totalPlanAmount',
      },
      {
        title: waveBillLocale.totalRealQtyStr,
        width: itemColWidth.qtyStrColWidth - 90,
        dataIndex: 'totalRealQtyStr',
      },
      {
        title: waveBillLocale.totalRealAmount,
        width: itemColWidth.qtyStrColWidth - 90,
        dataIndex: 'totalRealAmount',
      },
      {
        title: waveBillLocale.totalShipQtyStr,
        dataIndex: 'totalShipQtyStr',
        width: itemColWidth.qtyStrColWidth - 90,
      },
      {
        title: waveBillLocale.totalShipAmount,
        width: itemColWidth.qtyStrColWidth - 90,
        dataIndex: 'totalShipAmount',
      },
      {
        title: "组别",
        width: itemColWidth.qtyStrColWidth - 90,
        dataIndex: 'groupName',
      }
    ];

    // 门店信息
    let StoreItemsCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: commonLocale.inStoreLocale,
        width: colWidth.codeNameColWidth - 50,
        render: record =>
          <a onClick={this.onViewStore.bind(true, record.store ? record.store.uuid : undefined)}
            disabled={!havePermission(STORE_RES.VIEW)}>{convertCodeName(record.store)}</a>
      },
      {
        title: waveBillLocale.pickOrder,
        dataIndex: 'pickOrder',
        width: colWidth.enumColWidth - 80,
      },
      {
        title: waveBillLocale.stockOrder,
        dataIndex: 'stockOrder',
        width: colWidth.enumColWidth - 50,
      },
      {
        title: waveBillLocale.totalQtyStr,
        dataIndex: 'totalQtyStr',
        width: itemColWidth.qtyStrColWidth - 80,
      },
      {
        title: waveBillLocale.totalAmount,
        dataIndex: 'totalAmount',
        width: itemColWidth.qtyStrColWidth - 80,
      },
      {
        title: waveBillLocale.pickupBillNum,
        dataIndex: 'pickupBillNum',
        width: itemColWidth.qtyStrColWidth - 80,
      },
      {
        title: waveBillLocale.lineNum,
        dataIndex: 'lineNum',
        width: itemColWidth.qtyStrColWidth - 80,
      },
      {
        title: waveBillLocale.totalPlanQtyStr,
        dataIndex: 'totalPlanQtyStr',
        width: itemColWidth.qtyStrColWidth - 80,
      },
      {
        title: waveBillLocale.totalPlanAmount,
        dataIndex: 'totalPlanAmount',
        width: itemColWidth.qtyStrColWidth - 80,
      },
      {
        title: waveBillLocale.totalRealQtyStr,
        dataIndex: 'totalRealQtyStr',
        width: itemColWidth.qtyStrColWidth - 80,
      },
      {
        title: waveBillLocale.totalRealAmount,
        dataIndex: 'totalRealAmount',
        width: itemColWidth.qtyStrColWidth - 80,
      },
      {
        title: waveBillLocale.collectBin,
        dataIndex: 'collectBin',
        width: itemColWidth.numberEditColWidth - 50,
        render: val => val ? <EllipsisCol colValue={val} /> : <Empty />
      },
    ];

    // 拣货单明细
    let PickUpItemsCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: waveBillLocale.pickOrderBillNUmber,
        width: colWidth.billNumberColWidth - 75,
        render: record =>
          <a onClick={this.onPickUpView.bind(this, record.billNumber)}
            disabled={!havePermission(PICKUPBILL_RES.VIEW)}>{record.billNumber}</a>
      },
      {
        title: commonLocale.inStoreLocale,
        width: colWidth.codeNameColWidth - 50,
        render: record =>
          <a onClick={this.onViewStore.bind(true, record.store ? record.store.uuid : undefined)}
            disabled={!havePermission(STORE_RES.VIEW)}>{convertCodeName(record.store)}</a>
      },
      {
        title: waveBillLocale.pickarea,
        width: colWidth.codeNameColWidth - 50,
        render: record => <EllipsisCol colValue={convertCodeName(record.pickarea)} />
      },
      {
        title: waveBillLocale.pickType,
        width: colWidth.codeNameColWidth - 50,
        render: record => PickType[record.pickType].caption
      },
      {
        title: waveBillLocale.operateMethod,
        width: colWidth.enumColWidth - 50,
        render: record => PickMethod[record.operateMethod].caption
      },
      {
        title: waveBillLocale.pickupTotalQtyStr,
        width: itemColWidth.qtyStrColWidth - 80,
        dataIndex: 'totalQtyStr'
      },
      {
        title: waveBillLocale.pickupTotalAmount,
        width: itemColWidth.qtyStrColWidth - 80,
        dataIndex: 'totalAmount'
      },
      {
        title: waveBillLocale.totalRealQtyStr,
        width: itemColWidth.qtyStrColWidth - 80,
        dataIndex: 'realTotalQtyStr'
      },
      {
        title: waveBillLocale.totalRealAmount,
        width: itemColWidth.qtyStrColWidth - 80,
        dataIndex: 'realTotalAmount'
      },
      {
        title: commonLocale.stateLocale,
        width: colWidth.enumColWidth - 80,
        dataIndex: 'state',
        render: val => PickupBillState[val].caption
      },
    ];

    // 集合拣货单明细
    let CrossPickUpItemsCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: waveBillLocale.crossPickOrderBillNUmber,
        width: colWidth.billNumberColWidth - 75,
        render: record =>
          <a onClick={this.onCrossPickUpView.bind(this, record.billNumber)}
            disabled={!havePermission(CROSSPICKUPBILL_RES.VIEW)}>{record.billNumber}</a>
      },
      {
        title: waveBillLocale.pickarea,
        width: colWidth.codeNameColWidth - 50,
        render: record => <EllipsisCol colValue={convertCodeName(record.pickarea)} />
      },
      {
        title: waveBillLocale.pickType,
        width: colWidth.codeNameColWidth - 50,
        render: record => CrossPickType[record.pickType].caption
      },
      {
        title: waveBillLocale.operateMethod,
        width: colWidth.enumColWidth - 50,
        render: record => PickMethod[record.operateMethod].caption
      },
      {
        title: waveBillLocale.pickupTotalQtyStr,
        width: itemColWidth.qtyStrColWidth - 80,
        dataIndex: 'totalQtyStr'
      },
      {
        title: waveBillLocale.pickupTotalAmount,
        width: itemColWidth.qtyStrColWidth - 80,
        dataIndex: 'totalAmount'
      },
      {
        title: waveBillLocale.totalRealQtyStr,
        width: itemColWidth.qtyStrColWidth - 80,
        dataIndex: 'realTotalQtyStr'
      },
      {
        title: waveBillLocale.totalRealAmount,
        width: itemColWidth.qtyStrColWidth - 80,
        dataIndex: 'realTotalAmount'
      },
      {
        title: commonLocale.stateLocale,
        width: colWidth.enumColWidth - 80,
        dataIndex: 'state',
        render: val => CrossPickupBillState[val].caption
      },
    ];

    // 补货单明细
    let RplItemsCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: waveBillLocale.rplBillNumber,
        width: colWidth.billNumberColWidth - 80,
        render: record =>
          <a onClick={this.onRplView.bind(this, record.billNumber)}
            disabled={!havePermission(RPL_RES.VIEW)}>{record.billNumber}</a>
      },
      {
        title: waveBillLocale.pickarea,
        width: colWidth.codeNameColWidth - 50,
        render: record => <EllipsisCol colValue={convertCodeName(record.pickarea)} />
      },
      {
        title: waveBillLocale.rplType,
        width: colWidth.codeNameColWidth - 50,
        render: record => RplBillType[record.type].caption
      },
      {
        title: waveBillLocale.rplMode,
        width: colWidth.enumColWidth - 50,
        render: record => RplMode[record.rplMode].caption
      },
      {
        title: waveBillLocale.rplTotalQtyStr,
        dataIndex: 'totalQtyStr',
        width: itemColWidth.qtyStrColWidth - 80,
      },
      {
        title: waveBillLocale.rplRealTotalQtyStr,
        dataIndex: 'realTotalQtyStr',
        width: itemColWidth.qtyStrColWidth - 80,
      },
      {
        title: waveBillLocale.rplRealTotalAmount,
        dataIndex: 'realTotalAmount',
        width: itemColWidth.qtyStrColWidth - 80,
      },
      {
        title: commonLocale.stateLocale,
        width: colWidth.enumColWidth - 80,
        dataIndex: 'state',
        render: val => State[val].caption
      },
    ];

    const data = [];
    var line = 1;
    entityItems ? entityItems.map(e => {
      let result = undefined;
      for (var i = 0; i < data.length; i++) {
        if (e.article.uuid === data[i].article.uuid &&
          e.qpcStr === data[i].qpcStr &&
          e.vendor.uuid === data[i].vendor.uuid &&
          e.productionBatch === data[i].productionBatch &&
          e.binCode === data[i].binCode &&
          e.containerBarcode === data[i].containerBarcode) {
          data[i].qty = e.qty + data[i].qty;
          data[i].qtyStr = toQtyStr(data[i].qty, data[i].qpcStr)
          result = e;
        }
      }
      if (!result) {
        e.line = line;
        line++;
        data.push(e)
      }
    }) : [];

    /**
     * 时间轴
     */
    let timeLineData = [];

    if (entity.waveType === WaveType.UNIFY.name) {
      let times = [
        { title: waveBillLocale.startRplTime, time: entity.startRplTime },
        { title: waveBillLocale.endRplTime, time: entity.endRplTime },
        { title: waveBillLocale.startPickTime, time: entity.startPickTime },
        { title: waveBillLocale.endPickTime, time: entity.endPickTime }
      ]
      //排序
      times.sort(function (a, b) {
        return new Date(a.time) - new Date(b.time)
      })

      // 没有时间的放最后
      let notHaveTimeList = [];
      for (let i = times.length - 1; i > 0; i--) {
        if (times[i].time == undefined) {
          notHaveTimeList.unshift(times[i]);
          times.splice(i, 1);
        }
      }

      times.push(...notHaveTimeList);

      timeLineData.push(
        { title: waveBillLocale.startTime, time: entity.startTime },
        { title: waveBillLocale.startCompleteTime, time: entity.startCompleteTime },
        { title: waveBillLocale.confirmTime, time: entity.confirmTime },
        ...times
      )

    } else if (entity.waveType === WaveType.ONESTEPCROSS.name || entity.waveType === WaveType.TWOSTEPCROSS.name) {
      timeLineData.push(
        { title: waveBillLocale.createdTime, time: entity.createInfo.time },
        { title: waveBillLocale.startPickTime, time: entity.startPickTime },
        { title: waveBillLocale.endPickTime, time: entity.endPickTime },
      );
    } else if (entity.waveType == WaveType.PRERPL.name) {
      timeLineData.push(
        { title: waveBillLocale.startTime, time: entity.startTime },
        { title: waveBillLocale.startCompleteTime, time: entity.startCompleteTime },
        { title: waveBillLocale.confirmTime, time: entity.confirmTime },
        { title: waveBillLocale.startRplTime, time: entity.startRplTime },
        { title: waveBillLocale.endRplTime, time: entity.endRplTime },
      )
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

    if ((!this.state.entity.stockAllocateScheme || !this.state.entity.pickOrderScheme)
      && this.state.entity.state === State.SAVED.name
    ) {
      this.refreshColumns(StoreItemsCols);
    }

    let itemsTab = <Tabs activeKey={this.state.activeKey} defaultActiveKey="alcNtcBill" className={styles.ItemTabs} onChange={this.handleChangeTabPane}>
      {this.state.entity.waveType != WaveType.PRERPL.name ?
        <TabPane tab={waveBillLocale.alcNtcTab} key="alcNtcBill">
          <ViewTablePanel
            // notNote={true}
            columns={AlcNtcItemsCols}
            data={alcNtcPageInfo}
            hasPagination={true}
            refreshTable={this.getAlcNtcBills}
          />
        </TabPane> : null}
      {this.state.entity.waveType != WaveType.PRERPL.name ? <TabPane tab={commonLocale.inStoreLocale} key="store">
        {(
          (!this.state.entity.stockAllocateScheme || !this.state.entity.pickOrderScheme)
          && this.state.entity.state === State.SAVED.name
        ) ? <ViewTablePanel
            className={styles.standardTable}
            columns={StoreItemsCols}
            pagination={false}
            data={this.state.storeInfos}
            components={this.components}
            onRow={(record, index) => ({
              index,
              moveRow: this.moveRow,
            })}
          /> :
          <ViewTablePanel
            notNote={true}
            // noPagination={true}
            columns={StoreItemsCols}
            data={this.state.storeInfos}
          />
        }
      </TabPane> : null}
      {this.state.entity.waveType != WaveType.PRERPL.name && (entity.state == WaveBillState.STARTED.name || entity.state == WaveBillState.STARTEXCEPTION.name
        || entity.state == WaveBillState.INPROGRESS.name
        || entity.state == WaveBillState.FINISHED.name) ? <TabPane tab={
          waveBillLocale.pickUpTab
        }
          key="pickUpBill" >
          <Spin spinning={this.state.pickUpLoading}>
            <ViewTablePanel
              notNote={true}
              columns={PickUpItemsCols}
              data={this.state.pickUpPageInfo}
              hasPagination={true}
              refreshTable={this.getPickUpBills}
            />
          </Spin>
        </TabPane> : null}

      {/* 集合拣货单 */}
      {this.state.entity.waveType != WaveType.PRERPL.name && (entity.state == WaveBillState.STARTED.name || entity.state == WaveBillState.STARTEXCEPTION.name
        || entity.state == WaveBillState.INPROGRESS.name
        || entity.state == WaveBillState.FINISHED.name) ? <TabPane tab={
          waveBillLocale.crossPickUpTab
        }
          key="crossPickUpBill" >
          <Spin spinning={this.state.crossPickUpLoading}>
            <ViewTablePanel
              notNote={true}
              columns={CrossPickUpItemsCols}
              data={this.state.crossPickUpPageInfo}
              hasPagination={true}
              refreshTable={this.getCrossPickUpBills}
            />
          </Spin>
        </TabPane> : null}

      {((entity.state == WaveBillState.STARTED.name || entity.state == WaveBillState.STARTEXCEPTION.name
        || entity.state == WaveBillState.INPROGRESS.name
        || entity.state == WaveBillState.FINISHED.name) && (entity.waveType === WaveType.UNIFY.name || entity.waveType == WaveType.PRERPL.name)) ? <TabPane tab={waveBillLocale.rplTab} key="rplBill">
          <Spin spinning={this.state.rplLoading}>
            <ViewTablePanel
              notNote={true}
              columns={RplItemsCols}
              data={this.state.rplPageInfo}
              hasPagination={true}
              refreshTable={this.getRplBills}
            />
          </Spin>
        </TabPane> : null}
    </Tabs>;

    let state = "active";
    if (schedule.state === 'STARTED') {
      state = "success";
    }
    if (schedule.state === 'STARTEXCEPTION') {
      state = "exception";
    }

    return (
      <TabPane key="basicInfo" tab={waveBillLocale.title}>
        <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()}/>
        <ViewTabPanel style={{ width: '100%', marginTop: '-22px'}}>
          {
          (this.state.entity.waveType == WaveType.PRERPL.name && (this.state.entity.state == WaveBillState.SAVED.name ||
            this.state.entity.state == WaveBillState.STARTING.name || this.state.entity.state == WaveBillState.ABORTED.name)) ?
            null : <ViewPanel children={itemsTab} title={commonLocale.itemsLocale} />
        }
        <div>
          <ConfirmModal
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={waveBillLocale.title + ':' + this.state.entity.billNumber}
            onOk={this.handleOk}
            onCancel={this.handleModalVisible}
          />
        </div>
        <div>
          <Modal
            title={waveBillLocale.schedule}
            visible={this.state.scheduleModalvisible}
            footer={null}
            onCancel={this.onScheduleModelCancel}
          >
            <Progress percent={((schedule.execuedStep / schedule.totalStep).toFixed(1) * 100)} status={
              schedule.state === 'STARTED' ? 'success' : (schedule.state === 'STARTEXCEPTION' ? 'exception' : 'active')} />
            <span>{schedule.executeMessage}</span>
          </Modal>
        </div>
        </ViewTabPanel>
      </TabPane>
    );
  }
  /**
  * 绘制Tab页
  */
  drawTabPanes = () => {
    let tabPanes = [
      this.drawItemInfoTab(),
    ];

    return tabPanes;
  }

  /**
   * 绘制其它组件
   */
  drawOthers = () => {
    const others = [];

    others.push(<ShowDifferentPage
      visible={this.state.differentPageVisible}
      handleDifferentPageVisible={this.handleDifferentPageVisible}
      waveBillUuid={this.state.entityUuid}
    />);

    if (this.state.showProcessView) {
      const { entity } = this.state;

      const data = [{
        title: '启动',
        subTitle: entity.startTime,
        current: entity.startTime !== '' && entity.startTime !== undefined,
        description: [{
          label: commonLocale.inAllQtyStrLocale,
          value: entity.totalQtyStr,
        },
          {
            label: commonLocale.inAllArticleCountLocale,
            value: entity.totalArticleCount,
          },
          {
            label: commonLocale.inAllAmountLocale,
            value: entity.totalAmount,
          },
          {
            label: commonLocale.inAllVolumeLocale,
            value: entity.totalVolume,
          },
          {
            label: commonLocale.inAllWeightLocale,
            value: entity.totalWeight,
          },
          {
            label: commonLocale.inAllStoresLocale,
            value: entity.totalStores,
          },
          {
            label: commonLocale.inAllBillsLocale,
            value: entity.totalBills,
          },
        ],
      }, {
        title: '启动完成',
        subTitle: entity.startCompleteTime,
        current: entity.startCompleteTime !== '' && entity.startCompleteTime !== undefined,
        description: [],
      },
        {
          title: '确认',
          subTitle: entity.confirmTime,
          current: entity.confirmTime !== '' && entity.confirmTime !== undefined,
          description: [
            {
              label: commonLocale.inAllPlanQtyStrLocale,
              value: entity.totalPlanQtyStr,
            }, {
              label: commonLocale.inAllPlanArticleCountLocale,
              value: entity.totalPlanArticleCount,
            }, {
              label: commonLocale.inAllPlanAmountLocale,
              value: entity.totalPlanAmount,
            }, {
              label: commonLocale.inAllPlanVolumeLocale,
              value: entity.totalPlanVolume,
            }, {
              label: commonLocale.inAllPlanWeightLocale,
              value: entity.totalPlanWeight,
            }, {
              label: commonLocale.inAllPlanStoresLocale,
              value: entity.totalPlanStores,
            }, {
              label: commonLocale.inAllPlanBillsLocale,
              value: entity.totalPlanBills,
            },
          ],
        },
        {
          title: '开始拣货',
          subTitle: entity.startPickTime,
          current: entity.startPickTime !== '' && entity.startPickTime !== undefined,
          description: [],
        },
        {
          title: '结束拣货',
          subTitle: entity.endPickTime,
          current: entity.endPickTime !== '' && entity.endPickTime !== undefined,
          description: [
            {
              label: commonLocale.inAllRealQtyStrLocale,
              value: entity.totalRealQtyStr,
            }, {
              label: commonLocale.inAllRealArticleCountLocale,
              value: entity.totalRealArticleCount,
            }, {
              label: commonLocale.inAllRealAmountLocale,
              value: entity.totalRealAmount,
            }, {
              label: commonLocale.inAllRealVolumeLocale,
              value: entity.totalRealVolume,
            }, {
              label: commonLocale.inAllRealWeightLocale,
              value: entity.totalRealWeight,
            }, {
              label: commonLocale.inAllRealStoresLocale,
              value: entity.totalRealStores,
            }, {
              label: commonLocale.inAllRealBillsLocale,
              value: entity.totalRealBills,
            },
          ],
        },
        {
          title: '开始装车',
          subTitle: entity.startShipTime,
          current: entity.startShipTime !== '' && entity.startShipTime !== undefined,
          description: [],
        },
        {
          title: '结束装车',
          subTitle: entity.endShipTime,
          current: entity.endShipTime !== '' && entity.endShipTime !== undefined,
          description: [
            {
              label: commonLocale.inAllShipQtyStrLocale,
              value: entity.totalShipQtyStr,
            }, {
              label: commonLocale.inAllShipArticleCountLocale,
              value: entity.totalShipArticleCount,
            }, {
              label: commonLocale.inAllShipAmountLocale,
              value: entity.totalShipAmount,
            }, {
              label: commonLocale.inAllShipVolumeLocale,
              value: entity.totalShipVolume,
            }, {
              label: commonLocale.inAllShipWeightLocale,
              value: entity.totalShipWeight,
            }, {
              label: commonLocale.inAllShipStoresLocale,
              value: entity.totalShipStores,
            }, {
              label: commonLocale.inAllShipBillsLocale,
              value: entity.totalShipBills,
            },
          ],
        },
      ];
      if (entity.shipUploadDate !== '' && entity.shipUploadDate !== undefined) {
        data.push({
          title: '装车上传',
          subTitle: entity.shipUploadDate,
          current: entity.shipUploadDate !== '' && entity.shipUploadDate !== undefined,
          description: [],
        });
      }
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  };
}
