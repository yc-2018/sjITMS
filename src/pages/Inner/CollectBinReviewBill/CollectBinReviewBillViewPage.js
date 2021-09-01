import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Tabs, message } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import TimeLinePanel from '@/pages/Component/Form/TimeLinePanel';
import TagUtil from '@/pages/Component/TagUtil';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import { collectBinReviewBillLocale } from './CollectBinReviewBillLocale';
import { State, ReviewType } from './CollectBinReviewBillContants';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { getActiveKey} from '@/utils/LoginContext';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';

const TabPane = Tabs.TabPane;
@connect(({ collectbinreview, loading }) => ({
    collectbinreview,
    loading: loading.models.collectbinreview,
}))
export default class CollectBinReviewBillViewPage extends ViewPage {
    constructor(props) {
        super(props);

        this.state = {
            entity: {},
            items: [],
            entityUuid: props.collectbinreview.entityUuid,
            billNumber: props.billNumber,
            title: ''
        }
    }
    componentDidMount() {
        this.refresh(this.state.billNumber, this.state.entityUuid);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.collectbinreview.entity) {
            this.setState({
                entity: nextProps.collectbinreview.entity,
                items: nextProps.collectbinreview.entity.items ? nextProps.collectbinreview.entity.childContainerItems : [],
                title: collectBinReviewBillLocale.title + "：" + nextProps.collectbinreview.entity.billNumber,
                entityUuid: nextProps.collectbinreview.entity.uuid,
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
          type: 'collectbinreview/getByNumber',
          payload: billNumber,
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的集货区复查单' + billNumber + '不存在！');
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
          type: 'collectbinreview/get',
          payload: uuid,
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的集货区复查单不存在！');
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
            type: 'collectbinreview/showPage',
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
        type: 'collectbinreview/previousBill',
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
        type: 'collectbinreview/nextBill',
        payload: entity.billNumber
      });
    }
  }

    listToString = (collectBinList) => {
        if (!collectBinList)
            return "";
        return collectBinList.toString();
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
        const { entity, items } = this.state;

        let profileItems = [
            {
              label: '波次单号',
              value: entity.waveBillNumber
            },
            {
                label: collectBinReviewBillLocale.store,
                value: convertCodeName(entity.store)
            },
            {
                label: collectBinReviewBillLocale.reviewer,
                value: convertCodeName(entity.reviewer)
            },
            {
                label: collectBinReviewBillLocale.dockGroup,
                value: convertCodeName(entity.dockGroup)
            }
        ];

        let timeLineData = [
            { title: collectBinReviewBillLocale.beginReviewTime, time: entity.beginReviewTime },
            { title: collectBinReviewBillLocale.endReviewTime, time: entity.endReviewTime },
        ];
        let current = this.getDot(entity.state);
        let collapseItems = [
            <TimeLinePanel header={commonLocale.timeLineLocale} items={timeLineData} current={current} />
        ];

        let bussinessItems = [
            {
                label: collectBinReviewBillLocale.collectBin,
                value: this.listToString(entity.collectBins)
            }
        ];

        let reviewedItems = [];
        if (entity.items) {
            entity.items.forEach(function (item) {
                if (ReviewType.WHOLECONTAINERQTYSTR.name === item.reviewType && item.reviewItem) {
                    reviewedItems.push(
                        {
                            label: item.reviewItem.name,
                            value: item.stockQtyStr
                        }
                    );
                    reviewedItems.push(
                        {
                            label: collectBinReviewBillLocale.reviewed + item.reviewItem.name,
                            value: item.reviewedQtyStr
                        }
                    );
                }
            });

            entity.items.forEach(function (item) {
                if (ReviewType.CONTAINERTYPE.name === item.reviewType && item.reviewItem) {
                    reviewedItems.push(
                        {
                            label: convertCodeName(item.reviewItem),
                            value: item.stockQtyStr
                        }
                    );
                    reviewedItems.push(
                        {
                            label: collectBinReviewBillLocale.reviewed + convertCodeName(item.reviewItem),
                            value: item.reviewedQtyStr
                        }
                    );
                }
            });

            entity.items.forEach(function (item) {
                if (ReviewType.ATTACHMENT.name === item.reviewType && item.reviewItem) {
                    reviewedItems.push(
                        {
                            label: convertCodeName(item.reviewItem),
                            value: item.stockQtyStr
                        }
                    );
                    reviewedItems.push(
                        {
                            label: collectBinReviewBillLocale.reviewed + convertCodeName(item.reviewItem),
                            value: item.reviewedQtyStr
                        }
                    );
                }
            });
        }

        return (
            <TabPane key="basicInfo" tab={commonLocale.billInfoLocale}>
                <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()}/>
                <ViewPanel items={reviewedItems} title={collectBinReviewBillLocale.reviewedInfo} />
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

      const data = [
        {
          title: '开始复查',
          subTitle: entity.beginReviewTime,
          current: entity.beginReviewTime !== '' && entity.beginReviewTime !== undefined,
          description: [
          ]
        },
        {
          title: '结束复查',
          subTitle: entity.endReviewTime,
          current: entity.endReviewTime !== '' && entity.endReviewTime !== undefined,
          description: [

          ]
        }
      ];

      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
