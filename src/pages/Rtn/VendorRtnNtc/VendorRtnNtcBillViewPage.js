import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Form, Select, Input, InputNumber, message, Col, Button, Tabs, Divider, Row } from 'antd';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName, convertArticleDocField } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { qtyStrToQty, add, toQtyStr } from '@/utils/QpcStrUtil';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import CollapsePanel from '@/pages/Component/Form/CollapsePanel';
import TimeLinePanel from '@/pages/Component/Form/TimeLinePanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import TagUtil from '@/pages/Component/TagUtil';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import { State } from './VendorRtnNtcBillContants';
import { vendorRtnNtcLocale } from './VendorRtnNtcBillLocale';
import { VENDORRTNNTC_RES } from './VendorRtnNtcBillPermission';
import Empty from '@/pages/Component/Form/Empty';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { orgType } from '@/utils/OrgType';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
const TabPane = Tabs.TabPane;


@connect(({ vendorRtnNtc, loading }) => ({
    vendorRtnNtc,
    loading: loading.models.vendorRtnNtc,
}))
export default class VendorRtnNtcBillViewPage extends ViewPage {

    constructor(props) {
        super(props);

        this.state = {
            title: vendorRtnNtcLocale.title,
            entityUuid: props.vendorRtnNtc.entityUuid,
            billNumber: props.billNumber,
            entity: {},
            operate: '',
            modalVisible: false,
            createPermission:VENDORRTNNTC_RES.EDIT
        }
    }

    componentDidMount() {
        this.refresh(this.state.billNumber, this.state.entityUuid);

    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.vendorRtnNtc.entity) {
          this.setState({
            entity: nextProps.vendorRtnNtc.entity,
            title: vendorRtnNtcLocale.title + "：" + nextProps.vendorRtnNtc.entity.billNumber,
            entityUuid: nextProps.vendorRtnNtc.entity.uuid,
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

    drawActionButtion() {
        const state = this.state.entity.state;
        return <Fragment>
          <Button onClick={this.onCancel}>
            {commonLocale.backLocale}
          </Button>
          <PrintButton
            reportParams={[{ billNumber: `${this.state.entity.billNumber}` }]}
            moduleId={PrintTemplateType.VENDORRTNNTCBILL.name} />

            <Button
                disabled={!havePermission(VENDORRTNNTC_RES.COPY)}
                onClick={() => this.handleModalVisible(vendorRtnNtcLocale.copy)}
            >{vendorRtnNtcLocale.copy}</Button>
            {
                state && State[state].name == State.SAVED.name &&
                <span>
                    <Button type='primary'
                        disabled={!havePermission(VENDORRTNNTC_RES.EDIT)}
                        onClick={() => this.onEdit()}>
                        {commonLocale.editLocale}
                    </Button>
                    <Button
                        onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}
                        disabled={!havePermission(VENDORRTNNTC_RES.DELETE)}
                    >{commonLocale.deleteLocale}</Button>
                    <Button type='primary'
                        onClick={() => this.handleModalVisible(commonLocale.auditLocale)}
                        disabled={!havePermission(VENDORRTNNTC_RES.AUDIT)}
                    >{commonLocale.auditLocale}</Button>
                </span>
            }
            {state && State[state].name === State.INITIAL.name && <span>
                <Button
                    onClick={() => this.handleModalVisible(commonLocale.abortLocale)}
                    disabled={!havePermission(VENDORRTNNTC_RES.ABORTED)}
                >{commonLocale.abortLocale}</Button>
                <Button
                    onClick={() => this.handleModalVisible(vendorRtnNtcLocale.generate)}
                    disabled={!havePermission(VENDORRTNNTC_RES.GENERATE)}
                >{vendorRtnNtcLocale.generate}</Button></span>
            }
            {
                state && (State[state].name === State.INITIAL.name) &&
                <Button type='primary'
                    onClick={() => this.handleModalVisible(commonLocale.finishLocale)}
                    disabled={!havePermission(VENDORRTNNTC_RES.FINISH)}
                >{commonLocale.finishLocale}</Button>
            }
            {
                state && (State[state].name === State.INALC.name) &&
                <Button type='primary'
                    onClick={() => this.handleModalVisible(vendorRtnNtcLocale.confirm)}
                    disabled={!havePermission(VENDORRTNNTC_RES.CONFIRM)}
                >{vendorRtnNtcLocale.confirm}</Button>
            }
            {
                state && (State[state].name === State.INALC.name) &&
                <Button type='primary'
                    onClick={() => this.handleModalVisible(vendorRtnNtcLocale.rollback)}
                    disabled={!havePermission(VENDORRTNNTC_RES.ROLLBACK)}
                >{vendorRtnNtcLocale.rollback}</Button>
            }
        </Fragment>
    }

  /**
   * 刷新
   * @param entityUuid
   */

  refresh(billNumber, uuid) {
    const {entityUuid} = this.state;
    if (!billNumber && !uuid) {
      billNumber = this.state.billNumber;
    }
    if (billNumber) {
      this.props.dispatch({
        type: 'vendorRtnNtc/getByBillNumber',
        payload: {
          billNumber: billNumber,
          dcUuid: loginOrg().uuid
        },
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的供应商退货通知单' + billNumber + '不存在！');
            this.onCancel();
          } else {
            this.setState({
              billNumber: res.data.billNumber,
            });
          }
        }
      });
      return;
    }
    if (uuid) {
      this.props.dispatch({
        type: 'vendorRtnNtc/get',
        payload: uuid,
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的供应商退货通知单' + billNumber + '不存在！');
            this.onCancel();
          } else {
            this.setState({
              billNumber: res.data.billNumber,
            });
          }
        }
      });
    }else{
      this.props.dispatch({
        type: 'vendorRtnNtc/get',
        payload: entityUuid,
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的供应商退货通知单' + billNumber + '不存在！');
            this.onCancel();
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
   * 点击上一单
   */
  previousBill = () => {
    const { entity } = this.state;
    if (entity.uuid){
      this.props.dispatch({
        type: 'vendorRtnNtc/previousBill',
        payload: entity.billNumber,
        callback: (response) => {
          if (response && response.success && response.data) {
            this.props.dispatch({
              type: 'vendorRtnNtc/get',
              payload: response.data.uuid,
              callback: (response) => {
                if (response && response.success && response.data) {
                  this.setState({
                    entity:{ ...response.data }
                  })
                }
              }
            });
          }  else {
            this.props.dispatch({
              type: 'vendorRtnNtc/get',
              payload: entity.uuid,
              callback: (response) => {
                if (response && response.success && response.data) {
                  this.setState({
                    entity:{ ...response.data }
                  })
                }
              }
            });
          }
        }
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
        type: 'vendorRtnNtc/nextBill',
        payload: entity.billNumber,
        callback: (response) => {
          if (response && response.success && response.data) {
            this.props.dispatch({
              type: 'vendorRtnNtc/get',
              payload: response.data.uuid,
              callback: (response) => {
                if (response && response.success && response.data) {
                  this.setState({
                    entity:{ ...response.data }
                  })
                }
              }
            });
          } else {
            this.props.dispatch({
              type: 'vendorRtnNtc/get',
              payload: entity.uuid,
              callback: (response) => {
                if (response && response.success && response.data) {
                  this.setState({
                    entity:{ ...response.data }
                  })
                }
              }
            });
          }
        }
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
        } else if (operate === commonLocale.abortLocale) {
            this.onAbort();
        } else if (operate === commonLocale.finishLocale) {
            this.onFinish();
        } else if (operate === vendorRtnNtcLocale.generate) {
            this.onGenerate();
        } else if (operate === vendorRtnNtcLocale.copy) {
            this.onCopy();
        } else if (operate === vendorRtnNtcLocale.confirm) {
            this.onConfirm();
        } else if (operate === vendorRtnNtcLocale.rollback) {
            this.onRollback();
        }
    }

    onCancel = () => {
        this.props.dispatch({
            type: 'vendorRtnNtc/showPage',
            payload: {
                showPage: 'query',
              fromView: true
            }
        });
    }

    onCreate = () => {
        this.props.dispatch({
            type: 'vendorRtnNtc/showPage',
            payload: {
                showPage: 'create',
            }
        });
    }

  onEdit = () => {
    this.props.dispatch({
      type: 'vendorRtnNtc/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entity.uuid
      }
    });
  }

    onRemove = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'vendorRtnNtc/remove',
            payload: this.state.entity,
            callback: (response) => {
                if (response && response.success) {
                    this.onCancel();
                    message.success(commonLocale.removeSuccessLocale);
                }
            }
        });
        this.setState({
            modalVisible: !this.state.modalVisible
        });
    };

    onAudit = () => {
        const { dispatch } = this.props;
         const { entity } = this.state
        dispatch({
            type: 'vendorRtnNtc/audit',
            payload: this.state.entity,
            callback: (response) => {
                if (response && response.success) {
                    this.refresh(entity.billNumber);
                    message.success(commonLocale.auditSuccessLocale);
                }
            }
        });
        this.setState({
            modalVisible: !this.state.modalVisible
        });
    };

    onAbort = () => {
        const { dispatch } = this.props;
        const { entity } = this.state
        dispatch({
            type: 'vendorRtnNtc/abort',
            payload: this.state.entity,
            callback: (response) => {
                if (response && response.success) {
                    this.refresh(entity.billNumber);
                    message.success(commonLocale.abortSuccessLocale);
                }
            }
        });
        this.setState({
            modalVisible: !this.state.modalVisible
        });
    };

    onCopy = () => {
        const { entity } = this.state
        this.props.dispatch({
            type: 'vendorRtnNtc/copy',
            payload: {
                uuid: entity.uuid,
                isView: true
            },
            callback: (response) => {
                if (response && response.success) {
                    message.success(vendorRtnNtcLocale.copySuccess)
                }
            }
        })
        this.setState({
            modalVisible: !this.state.modalVisible
        });
    }

    /**
       * 单一生成拣货单
       */
    onGenerate = () => {
        this.props.dispatch({
            type: 'vendorRtnNtc/generatePickUpBill',
            payload: {
                billNumbers: [this.state.entity.billNumber],
                dcUuid: loginOrg().uuid
            },
            callback: (response) => {
                if (response && response.success) {
                    this.refresh();
                    message.success(vendorRtnNtcLocale.generateSuccess + ':共生成' + response.data + '张供应商拣货单。')
                }
            }
        })

        this.setState({
            modalVisible: !this.state.modalVisible
        });
    }

    onFinish = () => {
        const { dispatch } = this.props;
        const { entity } = this.state
        dispatch({
            type: 'vendorRtnNtc/finish',
            payload: this.state.entity,
            callback: (response) => {
                if (response && response.success) {
                    this.refresh(entity.billNumber);
                    message.success(commonLocale.finishSuccessLocale);
                }
            }
        });
        this.setState({
            modalVisible: !this.state.modalVisible
        });
    };


    onConfirm = () => {
        const { entity } = this.state
        this.props.dispatch({
            type: 'vendorRtnNtc/confirm',
            payload: {
                uuid: this.state.entity.uuid,
                version: this.state.entity.version
            },
            callback: (response) => {
                if (response && response.success) {
                    this.refresh(entity.billNumber);
                    message.success(vendorRtnNtcLocale.confirmSuccess)
                }
            }
        })
        this.setState({
            modalVisible: !this.state.modalVisible
        });
    }

    onRollback = () => {
        const { entity } = this.state
        this.props.dispatch({
            type: 'vendorRtnNtc/rollback',
            payload: {
                uuid: this.state.entity.uuid,
                version: this.state.entity.version
            },
            callback: (response) => {
                if (response && response.success) {
                    this.refresh(entity.billNumber);
                    message.success(vendorRtnNtcLocale.rollbackSuccess)
                }
            }
        })
        this.setState({
            modalVisible: !this.state.modalVisible
        });
    }

    drawTabPanes = () => {
        let tabPanes = [
            this.drawBasicInfoTab()
        ];

        return tabPanes;
    }

    drawBasicInfoTab = () => {
        const { entity } = this.state;
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
            label: commonLocale.inOwnerLocale,
            value: convertCodeName(entity.owner)
        }, {
            label: commonLocale.inVendorLocale,
            value: <a onClick={this.onViewVendor.bind(true, entity.vendor ? entity.vendor.uuid : undefined)}>
                {convertCodeName(entity.vendor)}</a>
        }, {
            label: commonLocale.inWrhLocale,
            value: convertCodeName(entity.wrh)
        }, {
            label: commonLocale.validDateLocale,
            value: moment(entity.expireDate).format('YYYY-MM-DD')
        }, {
            label: vendorRtnNtcLocale.rtnDate,
            value: entity.rtnDate ? moment(entity.rtnDate).format('YYYY-MM-DD') : <Empty />
        },
        {
            label: vendorRtnNtcLocale.sourceBillNumber,
            value: entity.sourceBillNumber
        },
        {
          label: commonLocale.noteLocale,
          value: entity.note ? entity.note : <Empty />
        }];


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
                width: colWidth.codeColWidth,
                render: val => <a onClick={this.onViewArticle.bind(true, val ? val.articleUuid : undefined)}>
                    {<EllipsisCol colValue={convertArticleDocField(val)} />}</a>
            },
            {
                title: commonLocale.inQpcAndMunitLocale,
                key: 'qpcStr',
                width: itemColWidth.qpcStrColWidth,
                render: (val, record) => {
                    return record.qpcStr + '/' + record.article.munit;
                }
            },
            {
                title: commonLocale.inPriceLocale,
                dataIndex: 'price',
                key: 'price',
                width: itemColWidth.priceColWidth,
                render: text => text != undefined ? text : <Empty />
            },
            {
                title: commonLocale.inQtyStrLocale + '/' + commonLocale.inAllPlanQtyStrLocale + '/' + vendorRtnNtcLocale.pickQtyStr
                    + '/' + vendorRtnNtcLocale.handoverQtyStr,
                key: 'qtyStr',
                width: itemColWidth.qtyStrColWidth * 2,
                render: (record) => {
                    return record.qtyStr + '/' + (record.planQtyStr ? record.planQtyStr : '0')
                        + '/' + (record.pickQtyStr ? record.pickQtyStr : '0')
                        + '/' + (record.handoverQtyStr ? record.handoverQtyStr : '0');
                }
            },
            {
                title: commonLocale.inQtyLocale + '/' + commonLocale.inAllPlanQtyLocale + '/' + vendorRtnNtcLocale.pickQty
                    + '/' + vendorRtnNtcLocale.handoverQty,
                key: 'qty',
                width: itemColWidth.qtyColWidth * 2,
                render: (record) => {
                    return record.qty + '/' + record.planQty + '/' + record.pickQty + '/' + record.handoverQty;
                }
            }
        ];
        let current = 0;
        return (
            <TabPane key="basicInfo" tab={commonLocale.basicInfoLocale}>
                <ViewPanel items={basicItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()} />
                <ViewTablePanel title={commonLocale.itemsLocale} scroll={{ x: 1300 }}
                    columns={columns} data={entity.items ? entity.items : []} />
                <ConfirmModal
                    visible={this.state.modalVisible}
                    operate={this.state.operate}
                    object={vendorRtnNtcLocale.title + ':' + this.state.entity.billNumber}
                    onOk={this.handleOk}
                    onCancel={this.handleModalVisible}
                />
            </TabPane>
        );
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
      const data = [{
        title:'创建时间',
        subTitle:entity.createInfo.time,
        current: entity.state !== '',
        description:[
          {
            label: commonLocale.inAllQtyStrLocale,
            value: entity.qtyStr
          }, {
            label: commonLocale.inAllArticleCountLocale,
            value: entity.articleCount
          }, {
            label: commonLocale.inAllAmountLocale,
            value: entity.amount
          },
          {
            label: commonLocale.inAllVolumeLocale,
            value: entity.volume
          }, {
            label: commonLocale.inAllWeightLocale,
            value: entity.weight
          },
        ]
      },{
        title:'开始拣货时间',
        subTitle:entity.startPickTime,
        current: entity.state == State.INPROGRESS.name,
        description: [
          {
            label: commonLocale.inAllPlanQtyStrLocale,
            value: entity.planQtyStr ? entity.planQtyStr : '0'
          }, {
            label: commonLocale.inAllPlanArticleCountLocale,
            value: entity.planArticleCount
          },
          {
            label: commonLocale.inAllPlanAmountLocale,
            value: entity.planAmount
          },
          {
            label: commonLocale.inAllPlanVolumeLocale,
            value: entity.planVolume
          }, {
            label: commonLocale.inAllPlanWeightLocale,
            value: entity.planWeight
          },
        ]
      },
        {
          title:'结束拣货时间',
          subTitle:entity.endPickTime,
          current: entity.state == State.FINISHED.name,
          description: [{
            label: vendorRtnNtcLocale.pickQtyStr,
            value: entity.pickQtyStr ? entity.pickQtyStr : '0'
          }, {
            label: vendorRtnNtcLocale.pickArticleCount,
            value: entity.pickArticleCount
          },
            {
              label: vendorRtnNtcLocale.pickAmount,
              value: entity.pickAmount
            },
            {
              label: vendorRtnNtcLocale.pickVolume,
              value: entity.pickVolume
            }, {
              label: vendorRtnNtcLocale.pickWeight,
              value: entity.pickWeight
            },]
        },
        {
          title:'开始交接时间',
          subTitle:entity.startHandoverTime,
          current: entity.state == State.USED.name,
          description: [
            {
              label: vendorRtnNtcLocale.handoverQtyStr,
              value: entity.handoverQtyStr ? entity.handoverQtyStr : '0'
            }, {
              label: vendorRtnNtcLocale.handoverArticleCount,
              value: entity.handoverArticleCount
            },
            {
              label: vendorRtnNtcLocale.handoverAmount,
              value: entity.handoverAmount
            },
            {
              label: vendorRtnNtcLocale.handoverVolume,
              value: entity.handoverVolume
            }, {
              label: vendorRtnNtcLocale.handoverWeight,
              value: entity.handoverWeight
            },
          ]
        },
        {
          title:'结束交接时间',
          subTitle:entity.endHandoverTime,
          current: entity.state == State.HANDOVERED.name,
          description: []
        },
        {
          title:'上传时间',
          subTitle:entity.uploadTime,
          current: entity.state == State.INALC.name,
          description: []
        }
      ];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
