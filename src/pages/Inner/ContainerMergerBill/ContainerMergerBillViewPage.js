import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Tabs, message } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import TagUtil from '@/pages/Component/TagUtil';
import TimeLinePanel from '@/pages/Component/Form/TimeLinePanel';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { convertCodeName, convertArticleDocField, composeQpcStrAndMunit, convertDate } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { State } from './ContainerMergerBillContants';
import { containerMergerBillLocale } from './ContainerMergerBillLocale';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import { CONTAINERMERGER_RES } from './ContainerMergerBillPermission';

const TabPane = Tabs.TabPane;

@connect(({ containermerger, loading }) => ({
  containermerger,
  loading: loading.models.containermerger,
}))
export default class ContainerMergerBillViewPage extends ViewPage {
  constructor(props) {
    super(props);

    this.state = {
      entity: {},
      billitem: [],
      billNumber: props.billNumber,
      entityUuid: props.containermerger.entityUuid,
      title: '',
      operate: '',
      modalVisible: false,
    }
  }
  componentDidMount() {
    this.refresh(this.state.billNumber, this.state.entityUuid);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.containermerger.entity) {
      this.setState({
        entity: nextProps.containermerger.entity,
        billitem: nextProps.containermerger.entity.items ? nextProps.containermerger.entity.items : [],
        title: containerMergerBillLocale.title + "：" + nextProps.containermerger.entity.billNumber,
        entityUuid: nextProps.containermerger.entity.uuid,
      });
    }
  }

  drawStateTag = () => {
    const { entity } = this.state;

    if (entity.state) {
      return (
        <TagUtil value={entity.state} />
      );
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
        type: 'containermerger/getByNumber',
        payload: billNumber,
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的容器拆并单' + billNumber + '不存在！');
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
        type: 'containermerger/get',
        payload: uuid,
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的容器拆并单不存在！');
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
      type: 'containermerger/showPage',
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
        type: 'containermerger/previousBill',
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
        type: 'containermerger/nextBill',
        payload: entity.billNumber
      });
    }
  }

  /**
    * 打印
    */
  onPrint = () => {

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
    this.onAudit();
  }

  onAudit = () => {
    const { entity } = this.state;
    this.props.dispatch({
      type: 'containermerger/audit',
      payload: entity,
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

  /**
   * 判断状态节点
   */
  getDot = (state) => {
    if (state === State.INPROGRESS.name) { return 0; }
    if (state === State.AUDITED.name) { return 1; }
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
        {
          State.INPROGRESS.name === this.state.entity.state ?
            <Button type="primary" disabled={!havePermission(CONTAINERMERGER_RES.AUDIT)} onClick={() => this.handleModalVisible(commonLocale.auditLocale)}>
              {commonLocale.auditLocale}
            </Button>
            : null
        }
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
        label: containerMergerBillLocale.mergeEmployee,
        value: entity.mergeEmployee ? convertCodeName(entity.mergeEmployee) : '-'
      },
    ];

    let timeLineData = [
      { title: containerMergerBillLocale.beginMergerTime, time: entity.beginMergerTime },
      { title: containerMergerBillLocale.endMergerTime, time: entity.endMergerTime },
    ];
    let current = this.getDot(entity.state);
    let collapseItems = [
      <TimeLinePanel header={commonLocale.timeLineLocale} items={timeLineData} current={current} />
    ];

    let businessItems = [];
    if (entity.statisticProfile) {
      let statisticProfile = entity.statisticProfile;
      businessItems = [
        {
          label: commonLocale.inAllQtyStrLocale,
          value: statisticProfile.qtyStr
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

    const gridStyle = {
      width: '25%',
      textAlign: 'center',
    };

    let billItemCols = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: commonLocale.articleLocale,
        key: 'article',
        width: itemColWidth.articleColWidth,
        render: record => <a onClick={() => this.onViewArticle(record.article.articleUuid)} >{convertArticleDocField(record.article)}</a>
      },
      {
        title: containerMergerBillLocale.qpcStrAndMunit,
        width: itemColWidth.qpcStrColWidth,
        render: record => composeQpcStrAndMunit(record)
      },
      {
        title: commonLocale.bincodeLocale,
        width: colWidth.codeColWidth,
        dataIndex: 'binCode',
      },
      {
        title: containerMergerBillLocale.fromContainer,
        width: colWidth.codeColWidth,
        dataIndex: 'fromContainerBarcode',
        render: (text, record) => <a onClick={() => this.onViewContainer(record.fromContainerBarcode)}
          disabled={!record.fromContainerBarcode || '-' === record.fromContainerBarcode}>
          {record.fromContainerBarcode}</a>
      },
      {
        title: containerMergerBillLocale.toContainer,
        width: colWidth.codeColWidth,
        dataIndex: 'toContainerBarcode',
        render: (text, record) => <a onClick={() => this.onViewContainer(record.toContainerBarcode)}
          disabled={!record.toContainerBarcode || '-' === record.toContainerBarcode}>
          {record.toContainerBarcode}</a>
      },
      {
        title: commonLocale.productionDateLocale,
        key: 'productionDate',
        width: colWidth.dateColWidth,
        render: record => convertDate(record.productionDate)
      },
      {
        title: commonLocale.validDateLocale,
        key: 'validDate',
        width: colWidth.dateColWidth,
        render: record => convertDate(record.validDate)
      },
      {
        title: commonLocale.productionBatchLocale,
        dataIndex: 'productionBatch',
        width: itemColWidth.numberEditColWidth,
      },
      {
        title: commonLocale.caseQtyStrLocale,
        dataIndex: 'qtyStr',
        width: itemColWidth.qtyStrColWidth,
      },
      {
        title: commonLocale.qtyLocale,
        dataIndex: 'qty',
        width: itemColWidth.qtyStrColWidth,
      },
      {
        title: commonLocale.vendorLocale,
        key: 'vendor',
        width: colWidth.codeNameColWidth,
        render: record => <EllipsisCol colValue={convertCodeName(record.vendor)} />
      },
      {
        title: commonLocale.ownerLocale,
        width: colWidth.codeNameColWidth,
        key: 'owner',
        render: record => <EllipsisCol colValue={convertCodeName(record.owner)} />
      },
    ]

    return (
      <TabPane key="basicInfo" tab={commonLocale.billInfoLocale}>
        <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()}/>
        <ViewTablePanel
          title={commonLocale.itemsLocale}
          columns={billItemCols}
          data={this.state.billitem}
          scroll={{ x: 2500 }}
        />
        <div>
          <ConfirmModal
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={containerMergerBillLocale.title + ':' + this.state.entity.billNumber}
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

      const data = [
        {
          title: '开始拆并',
          subTitle: entity.beginMergerTime,
          current: entity.beginMergerTime !== '' && entity.beginMergerTime !== undefined,
          description: [
            {
              label: commonLocale.inAllQtyStrLocale,
              value: entity.statisticProfile.qtyStr
            },
            {
              label: commonLocale.inAllArticleCountLocale,
              value: entity.statisticProfile.articleItemCount
            },
            {
              label: commonLocale.inAllAmountLocale,
              value: entity.statisticProfile.amount
            },
            {
              label: commonLocale.inAllWeightLocale,
              value: entity.statisticProfile.weight
            },
            {
              label: commonLocale.inAllVolumeLocale,
              value: entity.statisticProfile.volume
            }
          ]
        },
        {
          title: '结束拆并',
          subTitle: entity.endMergerTime,
          current: entity.endMergerTime !== '' && entity.endMergerTime !== undefined,
          description: [

          ]
        }
      ];

      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
