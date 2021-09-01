import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, Tabs, Modal, message } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import styles from '@/pages/Component/Form/ViewPanel.less';
import TimeLinePanel from '@/pages/Component/Form/TimeLinePanel';
import CollapsePanel from '@/pages/Component/Form/CollapsePanel';
import Empty from '@/pages/Component/Form/Empty';
import TagUtil from '@/pages/Component/TagUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { convertCodeName, convertArticleDocField } from '@/utils/utils';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { sourceWay } from '@/utils/SourceWay';
import { havePermission } from '@/utils/authority';
import { State } from './StoreRtnNtcBillContants';
import { storeRtnNtcLocal } from './StoreRtnNtcBillLocale';
import { STORERTNNTC_RES } from './StoreRtnNtcBillPermission';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import router from 'umi/router';
import { orgType } from '@/utils/OrgType';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';
import { OWNER_RES } from '@/pages/Basic/Owner/OwnerPermission';
import { STORE_RES } from '@/pages/Basic/Store/StorePermission';
import { routerRedux } from 'dva/router';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import { STORERTN_RES } from '@/pages/Rtn/StoreRtn/StoreRtnBillPermission';
const TabPane = Tabs.TabPane;
@connect(({ storeRtnNtc, loading }) => ({
    storeRtnNtc,
    loading: loading.models.storeRtnNtc,
}))
export default class StoreRtnNtcBillViewPage extends ViewPage {
    constructor(props) {
        super(props);
        this.state = {
            entity: {},
            items: [],
            entityUuid: props.storeRtnNtc.entityUuid,
            title: '',
            visibleDelete: false,
            visiblApprove: false,
            visiblFinish: false,
            visibleAbort: false,
            visibleCopy: false,
            confirmLoading: false,
            billNumber: props.billNumber,
        }
    }
    componentDidMount() {
      this.refresh(this.state.billNumber, this.state.entityUuid);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.storeRtnNtc.entity) {
          this.setState({
            entity: nextProps.storeRtnNtc.entity,
            items: nextProps.storeRtnNtc.entity.items ? nextProps.storeRtnNtc.entity.items : [],
            title: storeRtnNtcLocal.title + '：' + nextProps.storeRtnNtc.entity.billNumber,
            entityUuid: nextProps.storeRtnNtc.entity.uuid,
          });
        }
    }
    /**
    * 刷新
    // */
  /**
   * 刷新
   */
  refresh(billNumber, uuid) {
    const {entityUuid} = this.state;
    if (!billNumber && !uuid) {
      billNumber = this.state.billNumber;
    }
    if (billNumber) {
      this.props.dispatch({
        type: 'storeRtnNtc/getByBillNumberAndDcUuid',
        payload: {
          billNumber: billNumber,
          dcUuid: loginOrg().uuid
        },
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的退仓通知单' + billNumber + '不存在！');
            this.onBack();
          } else {
            this.setState({
              billNumber: res.data.billNumber,
              entityUuid: res.data.uuid
            });
          }
        }
      });
      return;
    }
    if (uuid) {
      this.props.dispatch({
        type: 'storeRtnNtc/get',
        payload: uuid,
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的退仓通知单' + billNumber + '不存在！');
            this.onBack();
          } else {
            this.setState({
              billNumber: res.data.billNumber,
            });
          }
        }
      });
    }else{
      this.props.dispatch({
        type: 'storeRtnNtc/get',
        payload: entityUuid,
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的退仓通知单' + billNumber + '不存在！');
            this.onBack();
          } else {
            this.setState({
              billNumber: res.data.billNumber,
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
            type: 'storeRtnNtc/showPage',
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
        type: 'storeRtnNtc/previousBill',
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
        type: 'storeRtnNtc/nextBill',
        payload: entity.billNumber
      });
    }
  }
    /**
    * 编辑
    */
    onEdit = () => {
        this.props.dispatch({
            type: 'storeRtnNtc/showPage',
            payload: {
                showPage: 'create',
                entityUuid: this.state.entityUuid
            }
        });
    }

    /**
     * 显示/隐藏删除提示框
     */
    handleDeleteModal = () => {
        this.setState({
            visibleDelete: !this.state.visibleDelete
        })
    }
    /**
     * 显示/隐藏审核提示框
     */
    handleApproveModal = () => {
        this.setState({
            visiblApprove: !this.state.visiblApprove
        })
    }

    handleFinishModal = () => {
        this.setState({
            visiblFinish: !this.state.visiblFinish
        })
    }

    handleAbortModal = () => {
        this.setState({
            visibleAbort: !this.state.visibleAbort
        })
    }

    handleCopyModal = () => {
        this.setState({
            visibleCopy: !this.state.visibleCopy
        })
    }

    onCopy = () => {
        const { entity } = this.state
        this.setState({
            confirmLoading: !this.state.confirmLoading
        })

        this.props.dispatch({
            type: 'storeRtnNtc/copy',
            payload: {
                uuid: entity.uuid,
                isView: true
            },
            callback: (response) => {
                if (response && response.success) {
                    message.success(storeRtnNtcLocal.copySuccess)
                }
                this.setState({
                    visibleCopy: !this.state.visibleCopy,
                    confirmLoading: false
                })
            }
        })
    }

    rtnWrh = () => {
        const { entity } = this.state

        this.props.dispatch(
            routerRedux.push({
                pathname: '/rtn/storeRtn',
                payload: {
                    showPage: 'create',
                    rtnNtcBillNumber: entity.billNumber
                }
            })
        )
        // this.props.dispatch(
        //     routerRedux.push({
        //         pathname: '/rtn/storeRtn',
        //         rtnNtcBillNumber: entity.billNumber
        //     }))
    }

    onAbort = () => {
        const { entity } = this.state

        this.setState({
            confirmLoading: !this.state.confirmLoading
        })

        this.props.dispatch({
            type: 'storeRtnNtc/abort',
            payload: {
                uuid: entity.uuid,
                version: entity.version
            },
            callback: (response) => {
                if (response && response.success) {
                    this.refresh(entity.billNumber);
                    message.success(commonLocale.abortSuccessLocale)
                }
                this.setState({
                    visibleAbort: !this.state.visibleAbort,
                    confirmLoading: false
                })
            }
        })
    }

    onFinish = () => {
        const { entity } = this.state

        this.setState({
            confirmLoading: !this.state.confirmLoading
        })

        this.props.dispatch({
            type: 'storeRtnNtc/finish',
            payload: {
                uuid: entity.uuid,
                version: entity.version
            },
            callback: (response) => {
                if (response && response.success) {
                    this.refresh(entity.billNumber);
                    message.success(commonLocale.finishLocale)
                }
                this.setState({
                    visiblFinish: !this.state.visiblFinish,
                    confirmLoading: false
                })
            }
        })
    }
    /**
     * 删除
     */
    onDelete = () => {
        const { entity } = this.state

        this.setState({
            confirmLoading: !this.state.confirmLoading
        })

        this.props.dispatch({
            type: 'storeRtnNtc/remove',
            payload: {
                uuid: entity.uuid,
                version: entity.version
            },
            callback: (response) => {
                if (response && response.success) {
                    this.onBack();
                    message.success(commonLocale.removeSuccessLocale)
                }

                this.setState({
                    visibleDelete: !this.state.visibleDelete,
                    confirmLoading: false
                })
            }
        })

    }
    /**
     * 批准
     */
    onApprove = () => {
        const { entity } = this.state

        this.setState({
            confirmLoading: !this.state.confirmLoading
        })

        this.props.dispatch({
            type: 'storeRtnNtc/approve',
            payload: {
                uuid: entity.uuid,
                version: entity.version
            },
            callback: response => {
                if (response && response.success) {
                    this.refresh(entity.billNumber);
                    message.success(commonLocale.auditSuccessLocale)
                }

                this.setState({
                    visiblApprove: !this.state.visiblApprove,
                    confirmLoading: false,
                    billNumber: entity.billNumber
                })
            }
        })

    }
    /**
     * 判断状态节点
     */
    getDot = (state, uploadTime) => {
        if (state === State.INITIAL.name || state === State.SAVED.name) { return 0; }
        if (state === State.INPROGRESS.name) { return 1; }
        if (state === State.FINISHED.name) { return 2; }
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
        const { entity } = this.state;

        return loginOrg().type == orgType.store.name ? [<Fragment key='backFragment'>

        </Fragment>] : [(
            <Fragment key='actionFragment'>

              <Button onClick={this.onBack}>
                {commonLocale.backLocale}
              </Button>
              <PrintButton
                reportParams={[{ billNumber: `${entity.billNumber}` }]}//模板未出，参数待定
                moduleId={PrintTemplateType.STORERTNNTCBILL.name} />

              <Button onClick={this.onEdit}
                    disabled={!havePermission(STORERTNNTC_RES.EDIT)}
                    style={{
                        display: entity && entity.state === State.SAVED.name
                            ? '' : 'none'
                    }}>
                {commonLocale.editLocale}
              </Button>

              <Button type='primary' onClick={this.handleApproveModal}
                    disabled={!havePermission(STORERTNNTC_RES.AUDIT)}
                    style={{
                        display: entity && entity.state === State.SAVED.name
                            ? '' : 'none'
                    }}>
                {commonLocale.auditLocale}
              </Button>



              <Button onClick={this.rtnWrh}
                    disabled={!havePermission(STORERTNNTC_RES.RTNWRH)}
                    style={{
                        display: entity && (entity.state === State.INITIAL.name
                            || entity.state === State.INPROGRESS.name)
                            ? '' : 'none'
                    }}>
                {storeRtnNtcLocal.rtnWrh}
              </Button>

              <Button onClick={this.handleAbortModal}
                    disabled={!havePermission(STORERTNNTC_RES.ABORT)}
                    style={{
                        display: entity && (entity.state === State.INITIAL.name)
                            ? '' : 'none'
                    }}>
                {commonLocale.abortLocale}
              </Button>

              <Button onClick={this.handleFinishModal}
                    disabled={!havePermission(STORERTNNTC_RES.FINISH)}
                    style={{
                        display: entity && (entity.state === State.INITIAL.name
                            || entity.state === State.INPROGRESS.name)
                            ? '' : 'none'
                    }}>
                {commonLocale.finishLocale}
              </Button>

              <Button onClick={this.handleDeleteModal}
                    disabled={!havePermission(STORERTNNTC_RES.DELETE)}
                    style={{
                        display: entity && entity.state === State.SAVED.name
                            ? '' : 'none'
                    }}>
                {commonLocale.deleteLocale}
              </Button>


              <Button disabled={!havePermission(STORERTNNTC_RES.COPY)} onClick={this.handleCopyModal}>
                {storeRtnNtcLocal.copy}
              </Button>


            </Fragment>
        )];

    }
    /**
    * 绘制信息详情
    */
    drawBillInfoTab = () => {
        const { entity } = this.state;

        const items = entity.items;
        var articles = [];
        var singleArticles = [];
        if (items) {
            items.map(e => {
                if (e.rtnQty > 0) {
                    articles.push(e.article.articleUuid);
                }
            })
        }
        for (var i = 0; i < articles.length; i++) {
            if (singleArticles.indexOf(articles[i]) == -1) {
                singleArticles.push(articles[i]);
            }
        }

        let profileItems = [
            {
                label: commonLocale.inOwnerLocale,
                value: <a onClick={this.onViewOwner.bind(true, entity.owner ? entity.owner.uuid : undefined)}
                    disabled={!havePermission(OWNER_RES.VIEW)}>{convertCodeName(entity.owner)}</a>
            },
            {
                label: commonLocale.inWrhLocale,
                value: convertCodeName(entity.wrh)
            },
            {
                label: commonLocale.inStoreLocale,
                value: <a onClick={this.onViewStore.bind(true, entity.store ? entity.store.uuid : undefined)}
                    disabled={!havePermission(STORE_RES.VIEW)}>{convertCodeName(entity.store)}</a>
            }, {
                label: storeRtnNtcLocal.sourceBillNumber,
                value: entity.sourceBillNumber
            },
            {
                label: storeRtnNtcLocal.rtnDate,
                value: entity.rtnDate ? moment(entity.rtnDate).format('YYYY-MM-DD') : <Empty />,
            },
            {
                label: commonLocale.sourceWayLocale,
                value: entity.sourceWay ? sourceWay[entity.sourceWay].caption : ''
            },
            {
                label: storeRtnNtcLocal.reason,
                value: entity.reason
            },
            {
                label: storeRtnNtcLocal.uploadTime,
                value: entity.uploadTime
            },
            {
              label: commonLocale.noteLocale,
              value: entity.note ? entity.note : <Empty />
            }
        ];

        let articleCols = [
            {
                title: commonLocale.lineLocal,
                dataIndex: 'line',
                width: itemColWidth.lineColWidth,
            },
            {
                title: commonLocale.articleLocale,
                width: itemColWidth.articleColWidth,
                render: record => <a onClick={() => this.onViewArticle(record.article.articleUuid)} >
                    <EllipsisCol colValue={convertArticleDocField(record.article)} /></a>
            },
            {
                title: commonLocale.inQpcAndMunitLocale,
                width: itemColWidth.qpcStrColWidth,
                render: (text, record) => (record.qpcStr + '/' + (record.article.munit ? record.article.munit : '-'))
            }, {
                title: commonLocale.inVendorLocale,
                dataIndex: 'vendor',
                width: colWidth.codeNameColWidth,
                render: (rext, record) => <a onClick={this.onViewVendor.bind(true, record.vendor ? record.vendor.uuid : undefined)}
                    disabled={!havePermission(VENDOR_RES.VIEW)}>{<EllipsisCol colValue={convertCodeName(record.vendor)} />}</a>
            }, {
                title: storeRtnNtcLocal.stockBatch,
                dataIndex: 'stockBatch',
                width: itemColWidth.stockBatchColWidth,
                render: text => text ? text : <Empty />
            },
            {
                title: commonLocale.inPriceLocale,
                dataIndex: 'price',
                width: itemColWidth.priceColWidth,
            }, {
                title: storeRtnNtcLocal.rtnAndAmount,
                dataIndex: 'amount',
                width: itemColWidth.amountColWidth,
                render: (rext, record) => record.realQty * record.price + ' / ' + record.amount
            }, {
                title: storeRtnNtcLocal.rtnAndQtyStr,
                width: itemColWidth.qtyStrColWidth,
                render: (rext, record) => record.realQtyStr + ' / ' + record.qtyStr
            }
        ]

        return (
            <TabPane key="basicInfo" tab={commonLocale.billInfoLocale}>
                <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()} />
                <ViewTablePanel
                    title={commonLocale.itemsLocale}
                    columns={articleCols}
                    data={entity.items ? entity.items : []}
                />
                <div>
                    <Modal
                        title={commonLocale.deleteLocale}
                        visible={this.state.visibleDelete}
                        uuid={this.state.entity.uuid}
                        onOk={this.onDelete}
                        onCancel={this.handleDeleteModal}
                        confirmLoading={this.state.confirmLoading}
                    >
                        <p>{storeRtnNtcLocal.IPopconfirmDeleteTitle + ':' + this.state.entity.billNumber}</p>
                    </Modal>
                    <Modal
                        title={commonLocale.finishLocale}
                        visible={this.state.visiblFinish}
                        uuid={this.state.entity.uuid}
                        onOk={this.onFinish}
                        onCancel={this.handleFinishModal}
                        confirmLoading={this.state.confirmLoading}
                    >
                        <p>{storeRtnNtcLocal.IPopconfirmFinishTitle + ':' + this.state.entity.billNumber}</p>
                    </Modal>
                    <Modal
                        title={commonLocale.auditLocale}
                        visible={this.state.visiblApprove}
                        uuid={this.state.entity.uuid}
                        onOk={this.onApprove}
                        onCancel={this.handleApproveModal}
                        confirmLoading={this.state.confirmLoading}
                    >
                        <p>{storeRtnNtcLocal.IPopconfirmApproveTitle + ':' + this.state.entity.billNumber}</p>
                    </Modal>

                    <Modal
                        title={commonLocale.abortLocale}
                        visible={this.state.visibleAbort}
                        uuid={this.state.entity.uuid}
                        onOk={this.onAbort}
                        onCancel={this.handleAbortModal}
                        confirmLoading={this.state.confirmLoading}
                    >
                        <p>{storeRtnNtcLocal.IPopconfirmAbortTitle + ':' + this.state.entity.billNumber}</p>
                    </Modal>
                    <Modal
                        title={storeRtnNtcLocal.copy}
                        visible={this.state.visibleCopy}
                        uuid={this.state.entity.uuid}
                        onOk={this.onCopy}
                        onCancel={this.handleCopyModal}
                        confirmLoading={this.state.confirmLoading}
                    >
                        <p>{storeRtnNtcLocal.IPopconfirmCopyTitle + ':' + this.state.entity.billNumber}</p>
                    </Modal>
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


  darwProcess = () => {
    return <a onClick={() => this.viewProcessView()}>流程进度</a>;
  };

  viewProcessView = () => {
    this.setState({
      showProcessView: !this.state.showProcessView
    });
  };

  drawOthers = () =>{
    const others = [];
    if(this.state.showProcessView){
      const  entity  = this.state.entity;
      let statisticProfile = entity.statisticProfile;
      let realStatisticProfile = entity.realStatisticProfile;
      const data = [{
        title:'创建/接收时间',
        subTitle:entity.createTime,
        current: entity.state !== '',
        description:[
          {
            label: commonLocale.inAllQtyStrLocale,
            value: statisticProfile.qtyStr,
          }, {
            label: commonLocale.inAllRealQtyStrLocale,
            value: realStatisticProfile.realQtyStr
          },
          {
            label: commonLocale.inAllArticleCountLocale,
            value: statisticProfile.articleItemCount,
          }, {
            label: commonLocale.inAllRealArticleCountLocale,
            value: realStatisticProfile.realArticleItemCount
          },
          {
            label: commonLocale.inAllAmountLocale,
            value: statisticProfile.amount,

          }, {
            label: commonLocale.inAllRealAmountLocale,
            value: realStatisticProfile.realAmount
          },
          {
            label: commonLocale.inAllWeightLocale,
            value: statisticProfile.weight,

          }, {
            label: commonLocale.inAllRealWeightLocale,
            value: realStatisticProfile.realWeight
          },
          {
            label: commonLocale.inAllVolumeLocale,
            value: statisticProfile.volume,
          }, {
            label: commonLocale.inAllRealVolumeLocale,
            value: realStatisticProfile.realVolume
          }
        ]
      },{
        title:'开始退仓时间',
        subTitle:entity.beginRtnTime,
        current: entity.state == State.INPROGRESS.name,
        description: []
      },
        {
          title:'结束退仓时间',
          subTitle:entity.endRtnTime,
          current: entity.state == State.FINISHED.name,
          description: []
        },
      ];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
