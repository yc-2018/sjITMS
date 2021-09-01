import { connect } from 'dva';
import { Fragment } from 'react';
import moment from "moment";
import { Button, Tabs, message, Table, Modal, Badge } from 'antd';
import StandardTable from '@/components/StandardTable';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import TimeLinePanel from '@/pages/Component/Form/TimeLinePanel';
import CollapsePanel from '@/pages/Component/Form/CollapsePanel';
import Empty from '@/pages/Component/Form/Empty';
import TagUtil from '@/pages/Component/TagUtil';
import { convertCodeName, convertArticleDocField, convertDateToTime } from '@/utils/utils';
import { qtyStrToQty } from '@/utils/QpcStrUtil';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { getMethodCaption } from '@/utils/OperateMethod';
import { getUsageCaption } from '@/utils/BinUsage';
import { State, getStateCaption } from './MoveBillContants';
import { moveBillLocale } from './MoveBillLocale';
import { MOVEBILL_RES } from './MoveBillPermission';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
const TabPane = Tabs.TabPane;

@connect(({ movebill, loading }) => ({
  movebill,
  loading: loading.models.movebill,
}))
export default class MoveBillViewPage extends ViewPage {
  constructor(props) {
    super(props);

    this.state = {
      entity: {},
      billitem: [],
      entityUuid: props.movebill.entityUuid,
      title: '',
      operate: '',
      modalVisible: false,
      showProcessView:false,
      createPermission:'iwms.inner.moveBill.create'
    }
  }
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.movebill.entity) {
      this.setState({
        entity: nextProps.movebill.entity,
        billitem: nextProps.movebill.entity.billItems ? nextProps.movebill.entity.billItems : [],
        title: moveBillLocale.title + "：" + nextProps.movebill.entity.billNumber,
        entityUuid: nextProps.movebill.entity.uuid,
      });
    }
  }

  drawStateTag = () => {
    if (this.state.entity.state) {
      return (
        <TagUtil value={this.state.entity.state} />
      );
    }
  }

  makeQpcStrAndMunit(item) {
    if (item && item.article && item.article.munit) {
      return item.qpcStr + "/" + item.article.munit
    }

    return item.qpcStr;
  }

  convertBinField(binCode, binUsage) {
    if (binCode && binUsage) {
      return binCode + '[' + getUsageCaption(binUsage) + ']';
    }

    if (binCode)
      return binCode;
    return '';
  }

  convertDate(date) {
    if (date) {
      return moment(date).format('YYYY-MM-DD')
    }

    return '';
  }

  onFieldChange = (value, field, index) => {
    const { entity, itemQtys } = this.state;

    let realQty = qtyStrToQty(value, entity.billItems[index - 1].qpcStr);
    let qty = entity.billItems[index - 1].qty;
    if (realQty > qty) {
      realQty = qty;
      value = entity.billItems[index - 1].qtyStr;
    }
    entity.billItems[index - 1].realQtyStr = value;
    entity.billItems[index - 1].realQty = realQty;

    this.setState({
      entity: { ...entity }
    });
  }

  /**
  * 刷新
  */
  refresh(billNumber,uuid) {
    if(billNumber){
      this.props.dispatch({
        type:'movebill/getByBillNumber',
        payload:{
          dcUuid:loginOrg().type === 'DC'?loginOrg().uuid:'',
          billNumber
        },
        callback:res=>{
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的移库单' + billNumber + '不存在！');
            this.onBack();
          }
        }
      })
      return 
    }
    const { entityUuid } = this.state;
    this.props.dispatch({
      type: 'movebill/get',
      payload: uuid?uuid:entityUuid
    });
  }
  /**
  * 返回
  */
  onBack = () => {
    this.props.dispatch({
      type: 'movebill/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
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
    if (operate === commonLocale.deleteLocale) {
      this.onRemove();
    } else if (operate === commonLocale.auditLocale) {
      this.onAudit();
    }
  }

  onRemove = () => {
    const { entity } = this.state;

    this.props.dispatch({
      type: 'movebill/onRemove',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: (response) => {
        if (response && response.success) {
          this.onBack();
          message.success(commonLocale.removeSuccessLocale)
        }
      }
    });

  }

  onAudit = () => {
    const { entity } = this.state;
    this.props.dispatch({
      type: 'movebill/onAudit',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: (response) => {
        if (response && response.success) {
          this.refresh();
          message.success(commonLocale.auditSuccessLocale);
        }
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  };


  onEdit = () => {
    this.props.dispatch({
      type: 'movebill/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entityUuid
      }
    });
  }

  /**
    * 打印
    */
  onPrint = () => {

  }

  getDot = (state) => {
    if (state === State.INPROGRESS.name || state === State.SAVED.name) { return 0; }
    if (state === State.AUDITED.name) { return 1; }
  }
  onCreate = () => {
    this.props.dispatch({
      type: 'movebill/showPage',
      payload: {
        showPage: 'create',
      }
    });
  }
  previousBill = () => {
    const { entity } = this.state;
    if (entity.uuid){
      this.props.dispatch({
        type: 'movebill/previousBill',
        payload: entity.billNumber
      });
    }
  }

  nextBill = () => {
    const { entity } = this.state;
    if (entity.uuid){
      this.props.dispatch({
        type: 'movebill/nextBill',
        payload: entity.billNumber
      });
    }
  }
  /**
  * 绘制右上角按钮
  */
  drawActionButtion = () => {
    return (
      <Fragment>
        <Button onClick={this.onBack}>
          {commonLocale.backLocale}
        </Button>
        <PrintButton
          reportParams={[{ 'billNumber': this.state.entity ? this.state.entity.billNumber : null }]}
          moduleId={PrintTemplateType.MOVEBILL.name}
        />
        {
          State.SAVED.name === this.state.entity.state ?
            <Button type="primary" disabled={!havePermission(MOVEBILL_RES.DELETE)} onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}>
              {commonLocale.deleteLocale}
            </Button>
            : null
        }
        {
          State.SAVED.name === this.state.entity.state ?
            <Button type="primary" disabled={!havePermission(MOVEBILL_RES.CREATE)} onClick={this.onEdit}>
              {commonLocale.editLocale}
            </Button>
            : null
        }
        {
          State.AUDITED.name != this.state.entity.state ?
            <Button type="primary" disabled={!havePermission(MOVEBILL_RES.AUDIT)} onClick={() => this.handleModalVisible(commonLocale.auditLocale)}>
              {commonLocale.auditLocale}
            </Button>
            : null
        }
        {/* {
          <Button type="primary" onClick={() => this.previousBill()}>
            {commonLocale.previousBill}
          </Button>
        }
        {
          <Button type="primary" onClick={() => this.nextBill()}>
            {commonLocale.nextBill}
          </Button>
        } */}
      </Fragment>
    );
  }
  viewProcessView = () => {
    this.setState({
      showProcessView: !this.state.showProcessView
    });
  }

  darwProcess = () => {
    return <a onClick={() => this.viewProcessView()}>流程进度</a>;
  }
  drawOthers = () => {
    const others = [];
  
    if (this.state.showProcessView) {
      const { entity } = this.state;
      let businessItems = [];
    if (entity.statisticProfile) {
      let statisticProfile = entity.statisticProfile;

      businessItems = [
        {
          label: commonLocale.inAllQtyStrLocale,
          value: statisticProfile.qtyStr ? statisticProfile.qtyStr : "0"
        },
        {
          label: commonLocale.inAllArticleCountLocale,
          value: statisticProfile.articleItemCount
        },
        {
          label: commonLocale.inAllAmountLocale,
          value: statisticProfile.amount
        },
        {
          label: commonLocale.inAllWeightLocale,
          value: statisticProfile.weight
        },
        {
          label: commonLocale.inAllVolumeLocale,
          value: statisticProfile.volume
        }
      ];
    }
      let timeLineData = [
        { title: moveBillLocale.beginMoveTime, subTitle: entity.beginMoveTime,description:businessItems,current: entity.state == State.SAVED.name,},
        { title: moveBillLocale.endMoveTime, subTitle: entity.endMoveTime,current: entity.state == State.AUDITED.name, },
      ];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={timeLineData} />);
    }
    return others;
  }
  /**
  * 绘制信息详情
  */
  drawBillInfoTab = () => {
    const { entity } = this.state;

    let profileItems = [
      {
        label:  '来源单号',
        value: entity.sourceBillNumber ? entity.sourceBillNumber : <Empty />
      },
      {
        label: moveBillLocale.moveType,
        value: entity.type ? entity.type : ''
      },
      {
        label: commonLocale.operateMethodLocale,
        value: entity.method ? getMethodCaption(entity.method) : ''
      },
      {
        label: moveBillLocale.mover,
        value: entity.mover ? convertCodeName(entity.mover) : ''
      },
      {
        label: moveBillLocale.fromWrh,
        value: entity.fromWrh ? convertCodeName(entity.fromWrh) : ''
      },
      {
        label: moveBillLocale.toWrh,
        value: entity.toWrh ? convertCodeName(entity.toWrh) : ''
      },
      {
        label: commonLocale.ownerLocale,
        value: entity.owner ? convertCodeName(entity.owner) : ''
      },
      {
        label: commonLocale.inUploadDateLocale,
        value: entity.uploadDate ? convertDateToTime(entity.uploadDate) : <Empty />
      },
      {
        label: commonLocale.noteLocale,
        value: entity.note
      }
    ];

  
   
    let current = this.getDot(entity.state);

  

    let billItemCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: commonLocale.articleLocale,
        key: 'article',
        width: colWidth.codeNameColWidth,
        render: record => <a onClick={() => this.onViewArticle(record.article.articleUuid)} ><EllipsisCol colValue={convertArticleDocField(record.article)} /></a>
      },
      {
        title: moveBillLocale.qpcStrAndMunit,
        width: itemColWidth.qpcStrColWidth,
        render: record => this.makeQpcStrAndMunit(record),
      },
      {
        title: moveBillLocale.fromBin,
        width: colWidth.codeNameColWidth,
        render: record => <EllipsisCol colValue={this.convertBinField(record.fromBinCode, record.fromBinUsage)} />
      },
      {
        title: moveBillLocale.fromContainer,
        width: colWidth.codeNameColWidth,
        dataIndex: 'fromContainerBarcode',
        render: (text, record) => <a onClick={this.onViewContainer.bind(true, text)}
          disabled={'-' === text}>{text}</a>
      },
      {
        title: moveBillLocale.toBin,
        width: colWidth.codeNameColWidth,
        render: record => <EllipsisCol colValue={this.convertBinField(record.toBinCode, record.toBinUsage)} />,
      },
      {
        title: moveBillLocale.toContainer,
        dataIndex: 'toContainerBarcode',
        width: colWidth.codeColWidth,
        render: (text, record) => <a onClick={this.onViewContainer.bind(true, text)}
          disabled={'-' === text}>{text}</a>
      },
      {
        title: commonLocale.productionBatchLocale,
        dataIndex: 'productionBatch',
        width: itemColWidth.numberEditColWidth
      },
      {
        title: commonLocale.productionDateLocale,
        key: 'productionDate',
        width: colWidth.dateColWidth,
        render: record => this.convertDate(record.productionDate)
      },
      {
        title: commonLocale.validDateLocale,
        key: 'validDate',
        width: colWidth.dateColWidth,
        render: record => this.convertDate(record.validDate)
      },
      {
        title: commonLocale.vendorLocale,
        key: 'vendor',
        width: colWidth.codeNameColWidth,
        render: record => <EllipsisCol colValue={convertCodeName(record.vendor)} />
      },
      {
        title: commonLocale.caseQtyStrLocale,
        dataIndex: 'qtyStr',
        width: itemColWidth.qtyStrColWidth
      },
      {
        title: commonLocale.qtyLocale,
        dataIndex: 'qty',
        width: itemColWidth.qtyColWidth
      }
    ]

    if(entity.type && entity.type === '点数移库') {
      billItemCols.push({
          title: '新生产日期',
          key: 'newProductionDate',
          width: itemColWidth.dateEditColWidth,
          render: record => this.convertDate(record.newProductionDate)
        });
      billItemCols.push({
        title: '新批号',
        dataIndex: 'newProductionBatch',
        width: itemColWidth.dateEditColWidth
      });
      billItemCols.push({
        title: '新到效日期',
        key: 'newValidDate',
        width: itemColWidth.dateEditColWidth,
        render: record => this.convertDate(record.newValidDate)
      })
    }

    return (
      <TabPane key="basicInfo" tab={commonLocale.billInfoLocale}>
        <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()}/>
        {/* <CollapsePanel items={collapseItems} /> */}
        {/* <ViewPanel items={businessItems} title={commonLocale.bussinessLocale} /> */}
        <ViewTablePanel
          title={commonLocale.itemsLocale}
          columns={billItemCols}
          data={this.state.billitem}
          tableId={'move.view.table'}
          notNote
          // scroll={{ x: 2200 }}
        />
      
        <div>
          <ConfirmModal
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={moveBillLocale.title + ':' + this.state.entity.billNumber}
            onOk={this.handleOk}
            onCancel={this.handleModalVisible}
          />
        </div>
      </TabPane>
    );
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
}
