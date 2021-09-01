import { connect } from 'dva';
import { Fragment } from 'react';
import moment from "moment";
import { Button, Tabs, message } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import Empty from '@/pages/Component/Form/Empty';
import TimeLinePanel from '@/pages/Component/Form/TimeLinePanel';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import TagUtil from '@/pages/Component/TagUtil';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { containerBindBillLocale } from './ContainerBindBillLocale';
import { State } from './ContainerBindBillContants';
import { getActiveKey } from '@/utils/LoginContext';
const TabPane = Tabs.TabPane;
@connect(({ containerbind, loading }) => ({
    containerbind,
    loading: loading.models.containerbind,
}))
export default class ContainerBindBillViewPage extends ViewPage {
    constructor(props) {
        super(props);

        this.state = {
            entity: {},
            billitem: [],
            billNumber: props.billNumber,
            entityUuid: props.containerbind.entityUuid,
            title: ''
        }
    }
    componentDidMount() {
        this.refresh(this.state.billNumber, this.state.entityUuid);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.containerbind.entity) {
            this.setState({
                entity: nextProps.containerbind.entity,
                billitem: nextProps.containerbind.entity.items ? nextProps.containerbind.entity.items : [],
                title: containerBindBillLocale.title + '：' + nextProps.containerbind.entity.billNumber,
                entityUuid: nextProps.containerbind.entity.uuid,
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
          type: 'containerbind/getByNumber',
          payload: billNumber,
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的容器绑定单' + billNumber + '不存在！');
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
          type: 'containerbind/get',
          payload: uuid,
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的容器绑定单不存在！');
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
            type: 'containerbind/showPage',
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
        type: 'containerbind/previousBill',
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
        type: 'containerbind/nextBill',
        payload: entity.billNumber
      });
    }
  }

    /**
    * 审核
    */
    onAudit = () => {
        this.props.dispatch({
            type: 'containerbind/audit',
            payload: {
                uuid: this.state.entity.uuid,
                version: this.state.entity.version
            },
            callback: (response) => {
                if (response && response.success) {
                    this.refresh();
                    message.success(commonLocale.auditLocale)
                }
            }
        });
    }

    /**
      * 打印
      */
    onPrint = () => {

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
                <Button onClick={this.onAudit}
                    disabled={!havePermission(containerBindBillLocale.AUDIT)}
                    style={{
                        display: entity && (entity.state === State.INPROGRESS.name
                        ) ? '' : 'none'
                    }}
                >
                    {commonLocale.auditLocale}
                </Button>
            </Fragment>
        );
    }

    getDot = (state) => {
        if (state === State.INPROGRESS.name) { return 0; }
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
    * 绘制信息详情
    */
    drawBillInfoTab = () => {
        const { entity } = this.state;

        let profileItems = [
            {
                label: containerBindBillLocale.binder,
                value: convertCodeName(entity.binder)
            },
            {
                label: containerBindBillLocale.sourceBill,
                value: entity.sourceBill && entity.sourceBill.billUuid ? entity.sourceBill.billType + ',' + entity.sourceBill.billNumber : <Empty />
            },
        ];

        let billItemCols = [
            {
                title: commonLocale.lineLocal,
                dataIndex: 'line',
                width: itemColWidth.lineColWidth,
            },
            {
                title: containerBindBillLocale.barcode,
                dataIndex: 'barcode',
                width: colWidth.codeColWidth,
                render: (text, record) => <a onClick={() => this.onViewContainer(record.barcode)}
                    disabled={!record.barcode || '-' === record.barcode}>
                    {record.barcode}</a>
            },
            {
                title: containerBindBillLocale.oldParentContainer,
                dataIndex: 'oldParentContainer',
                width: colWidth.codeColWidth,
                render: (text, record) => <a onClick={() => this.onViewContainer(record.oldParentContainer)}
                    disabled={!record.oldParentContainer || '-' === record.oldParentContainer}>
                    {record.oldParentContainer ? record.oldParentContainer : <Empty />}</a>
            },
            {
                title: '新父容器',
                dataIndex: 'newParentContainer',
                width: colWidth.codeColWidth,
                render: (text, record) => <a onClick={() => this.onViewContainer(record.newParentContainer)}
                    disabled={!record.newParentContainer || '-' === record.newParentContainer}>
                    {record.newParentContainer ? record.newParentContainer : <Empty />}</a>
            },
            {
                title: containerBindBillLocale.bindTime,
                dataIndex: 'bingTime',
                width: colWidth.dateColWidth,
                render: (text, record) => moment(record.bindTime).format("YYYY-MM-DD HH:mm:ss")
            }
        ]

        let timeLineData = [
            { title: "开始绑定时间", time: entity.beginBindTime },
            { title: "结束绑定时间", time: entity.endBindTime },
        ];

        let current = this.getDot(entity.state);
        let collapseItems = [
            <TimeLinePanel header={"时间轴"} items={timeLineData} current={current} />
        ];

        return (
            <TabPane key="basicInfo" tab={commonLocale.billInfoLocale}>
                <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()}/>
                <ViewTablePanel
                    title={commonLocale.itemsLocale}
                    columns={billItemCols}
                    data={this.state.billitem}
                    scroll={{ x: true }}
                />
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
          title: '开始绑定',
          subTitle: entity.beginBindTime,
          current: entity.beginBindTime !== '' && entity.beginBindTime !== undefined,
          description: [

          ]
        },
        {
          title: '结束绑定',
          subTitle: entity.endBindTime,
          current: entity.endBindTime !== '' && entity.endBindTime !== undefined,
          description: [

          ]
        }
      ];

      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
