import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Tabs, message} from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import TimeLinePanel from '@/pages/Component/Form/TimeLinePanel';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import Empty from '@/pages/Component/Form/Empty';
import TagUtil from '@/pages/Component/TagUtil';
import { convertCodeName } from '@/utils/utils';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { State } from './ContainerReviewBillContants';
import { containerReviewBillLocale } from './ContainerReviewBillLocale';

const TabPane = Tabs.TabPane;
@connect(({ containerreview, loading }) => ({
    containerreview,
    loading: loading.models.containerreview,
}))
export default class ContainerReviewBillViewPage extends ViewPage {
    constructor(props) {
        super(props);

        this.state = {
            entity: {},
            articleItems: [],
            childContainerItems: [],
            billNumber: props.billNumber,
            entityUuid: props.containerreview.entityUuid,
            title: ''
        }
    }
    componentDidMount() {
        this.refresh(this.state.billNumber, this.state.entityUuid);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.containerreview.entity) {
            this.setState({
                entity: nextProps.containerreview.entity,
                articleItems: nextProps.containerreview.entity.articleItems ? nextProps.containerreview.entity.articleItems : [],
                childContainerItems: nextProps.containerreview.entity.childContainerItems ? nextProps.containerreview.entity.childContainerItems : [],
                title: containerReviewBillLocale.title + "：" + nextProps.containerreview.entity.billNumber,
                entityUuid: nextProps.containerreview.entity.uuid,
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
          type: 'containerreview/getByNumber',
          payload: billNumber,
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的容器复查单' + billNumber + '不存在！');
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
          type: 'containerreview/get',
          payload: uuid,
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的容器复查单不存在！');
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
            type: 'containerreview/showPage',
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
        type: 'containerreview/previousBill',
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
        type: 'containerreview/nextBill',
        payload: entity.billNumber
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
    * 绘制右上角按钮
    */
    drawActionButtion = () => {
        return (
            <Fragment>
                <Button onClick={this.onBack}>
                    {commonLocale.backLocale}
                </Button>
            </Fragment>
        );
    }

    /**
 * 判断状态节点
 */
    getDot = (state) => {
        if (state === State.INPROGRESS.name) { return 0; }
        if (state === State.AUDITED.name) { return 1; }
    }

    /**
    * 绘制信息详情
    */
    drawBillInfoTab = () => {
        const { entity, articleItems, childContainerItems } = this.state;

        let profileItems = [
            {
                label: containerReviewBillLocale.container,
                value: entity.containerBarcode == "-" ? entity.containerBarcode : 
                // <a onClick={this.onContainerView.bind(this, entity.containerBarcode)}
                <a onClick={this.onViewContainer.bind(true, entity.containerBarcode ? entity.containerBarcode : undefined)}
                >{entity.containerBarcode}</a>
            },
            {
                label: containerReviewBillLocale.reviewer,
                value: convertCodeName(entity.reviewer)
            }
        ];

        let timeLineData = [
            { title: containerReviewBillLocale.beginReviewTime, time: entity.beginReviewTime },
            { title: containerReviewBillLocale.endReviewTime, time: entity.endReviewTime },
        ];
        let current = this.getDot(entity.state);
        let collapseItems = [
            <TimeLinePanel header={commonLocale.timeLineLocale} items={timeLineData} current={current} />
        ];

        let businessItems = [];
        let statisticProfile = entity.statisticProfile;
        let realStatisticProfile = entity.realStatisticProfile;

        if (statisticProfile && realStatisticProfile) {
            businessItems = [
                {
                    label: commonLocale.inAllQtyStrLocale,
                    value: statisticProfile.qtyStr
                },
                {
                    label: containerReviewBillLocale.realQtyStr,
                    value: realStatisticProfile.realQtyStr
                },
                {
                    label: commonLocale.inAllArticleCountLocale,
                    value: statisticProfile.articleItemCount,
                },
                {
                    label: containerReviewBillLocale.realArticleItemCount,
                    value: realStatisticProfile.realArticleItemCount
                },
                {
                    label: commonLocale.inAllAmountLocale,
                    value: statisticProfile.amount
                },
                {
                    label: containerReviewBillLocale.realAmount,
                    value: realStatisticProfile.realAmount
                },
                {
                    label: commonLocale.inAllWeightLocale,
                    value: statisticProfile.weight
                },
                {
                    label: containerReviewBillLocale.realWeight,
                    value: realStatisticProfile.realWeight
                },
                {
                    label: commonLocale.inAllVolumeLocale,
                    value: statisticProfile.volume,
                },
                {
                    label: containerReviewBillLocale.realVolume,
                    value: realStatisticProfile.realVolume
                },
                {
                    label: containerReviewBillLocale.childContainerCount,
                    value: entity.childContainerCount
                },
                {
                    label: containerReviewBillLocale.realChildContainerCount,
                    value: entity.realChildContainerCount
                }
            ];
        }

        let list = [];
        let line = 0;
        if (entity.articleItems) {
            entity.articleItems.forEach(function (articleItem) {
                let item = {};
                item.articleUuid = articleItem.article.uuid;
                item.checkItem = convertCodeName(articleItem.article);
                item.qpcStr = articleItem.qpcStr;
                item.productionBatch = articleItem.productionBatch;
                item.qty = articleItem.qty;
                item.reviewedQty = articleItem.reviewedQty;
                item.differentQty = articleItem.reviewedQty - articleItem.qty;
                line++;
                item.line = line;
                list.push(item);
            });
        }

        if (entity.childContainerItems) {
            entity.childContainerItems.forEach(function (childContainerItem) {
                let item = {};
                item.checkItem = childContainerItem.childContainerBarcode;
                item.qty = childContainerItem.bind ? 1 : 0;
                item.reviewedQty = childContainerItem.reviewedBind ? 1 : 0;
                item.differentQty = item.reviewedQty - item.qty;
                line++;
                item.line = line;
                list.push(item);
            });
        }

        let billItemCols = [
            {
                title: commonLocale.lineLocal,
                dataIndex: 'line',
                width: itemColWidth.lineColWidth,
            },
            {
                title: containerReviewBillLocale.reviewItem,
                dataIndex: 'checkItem',
                width: colWidth.codeNameColWidth,
                render: (text, record) => {
                    if (record.articleUuid) {
                        return (<a onClick={() => this.onViewArticle(record.articleUuid)} > {text} </a>);
                    } else {
                        return text = text ? text : <Empty />
                    }
                }
            },
            {
                title: commonLocale.qpcLocale,
                dataIndex: 'qpcStr',
                width: itemColWidth.qpcStrColWidth,
                render: text => text ? text : <Empty />
            },
            {
                title: commonLocale.qtyLocale,
                width: itemColWidth.qtyStrColWidth,
                dataIndex: 'qty',
            },
            {
                title: containerReviewBillLocale.reviewedQty,
                width: itemColWidth.qtyStrColWidth,
                dataIndex: 'reviewedQty',
            },
            {
                title: containerReviewBillLocale.differentQty,
                width: itemColWidth.qtyStrColWidth,
                dataIndex: 'differentQty',
            }
        ]

        return (
            <TabPane key="basicInfo" tab={commonLocale.billInfoLocale}>
                <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()}/>
                <ViewTablePanel
                    title={commonLocale.itemsLocale}
                    columns={billItemCols}
                    data={list}
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
          title: '开始复查',
          subTitle: entity.beginReviewTime,
          current: entity.beginReviewTime !== '' && entity.beginReviewTime !== undefined,
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
              label: commonLocale.inAllVolumeLocale,
              value: entity.statisticProfile.volume
            },
            {
              label: commonLocale.inAllWeightLocale,
              value: entity.statisticProfile.weight
            },
            {
              label: containerReviewBillLocale.childContainerCount,
              value: entity.childContainerCount
            }
          ]
        },
        {
          title: '结束复查',
          subTitle: entity.endReviewTime,
          current: entity.endReviewTime !== '' && entity.endReviewTime !== undefined,
          description: [
            {
              label: containerReviewBillLocale.realQtyStr,
              value: entity.realStatisticProfile.realQtyStr
            },
            {
              label: containerReviewBillLocale.realArticleItemCount,
              value: entity.realStatisticProfile.realArticleItemCount
            },
            {
              label: containerReviewBillLocale.realAmount,
              value: entity.realStatisticProfile.realAmount
            },
            {
              label: containerReviewBillLocale.realWeight,
              value: entity.realStatisticProfile.realWeight
            },
            {
              label: containerReviewBillLocale.realVolume,
              value: entity.realStatisticProfile.realVolume
            },
            {
              label: containerReviewBillLocale.realChildContainerCount,
              value: entity.realChildContainerCount
            }
          ]
        }
      ];

      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
