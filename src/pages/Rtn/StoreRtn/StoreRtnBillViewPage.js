import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, Tabs, Modal, message } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import Empty from '@/pages/Component/Form/Empty';
import TagUtil from '@/pages/Component/TagUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { convertCodeName, convertArticleDocField } from '@/utils/utils';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { sourceWay } from '@/utils/SourceWay';
import { havePermission } from '@/utils/authority';
import { storeRtnLocal } from './StoreRtnBillLocale';
import { State, Type, METHOD, ReturnType } from './StoreRtnBillContants';
import { STORERTN_RES } from './StoreRtnBillPermission';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { orgType } from '@/utils/OrgType';
import { binUsage, getUsageCaption } from '@/utils/BinUsage';
import { WRH_RES } from '@/pages/Basic/Wrh/WrhPermission';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';
import { OWNER_RES } from '@/pages/Basic/Owner/OwnerPermission';
import { STORE_RES } from '@/pages/Basic/Store/StorePermission';
import { routerRedux } from 'dva/router';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';

const TabPane = Tabs.TabPane;
@connect(({ storeRtn, loading }) => ({
    storeRtn,
    loading: loading.models.storeRtn,
}))
export default class StoreRtnBillViewPage extends ViewPage {
    constructor(props) {
        super(props);
        this.state = {
            entity: {},
            items: [],
            title: '',
            visibleDelete: false,
            visiblAudit: false,
            confirmLoading: false,
            entityUuid: props.storeRtn.entityUuid,
            billNumber: props.billNumber,
        }
    }
    componentDidMount() {
      this.refresh(this.state.billNumber, this.state.entityUuid);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.storeRtn.entity) {
            this.setState({
                entity: nextProps.storeRtn.entity,
                items: nextProps.storeRtn.entity.items ? nextProps.storeRtn.entity.items : [],
                title: storeRtnLocal.title + '：' + nextProps.storeRtn.entity.billNumber,
                entityUuid: nextProps.storeRtn.entity.uuid,
            });
        }
    }
    /**
    * 刷新
    */
    refresh(billNumber, entityUuid) {
      if (!billNumber && !entityUuid) {
        billNumber = this.state.billNumber;
      }
      if (billNumber) {
        this.props.dispatch({
          type: 'storeRtn/getByBillNumber',
          payload: {
            billNumber: billNumber,
            dcUuid: loginOrg().uuid
          },
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的退仓单' + billNumber + '不存在！');
              this.onBack();
            } else {
              this.setState({
                billNumber: res.data.billNumber,
              });
            }
          }
        });
        return;
      }
      if (entityUuid) {
        this.props.dispatch({
          type: 'storeRtn/get',
          payload: entityUuid,
          callback: (res) => {
            if (!res || !res.data || !res.data.uuid) {
              message.error('指定的退仓单' + billNumber + '不存在！');
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
            type: 'storeRtn/showPage',
            payload: {
                showPage: 'query',
              fromView: true
            }
        });
    }
    /**
    * 编辑
    */
    onEdit = () => {
        const { entity } = this.state
        this.props.dispatch({
            type: 'storeRtn/showPage',
            payload: {
                showPage: entity.rtnNtcBillNumber ? 'create' : 'createno',
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
    handleAuditModal = () => {
        this.setState({
            visiblAudit: !this.state.visiblAudit
        })
    }

    onAudit = () => {
        const { entity } = this.state

        this.setState({
            confirmLoading: !this.state.confirmLoading
        })

        let type = 'storeRtn/audit';
        if (entity.state === 'INPROGRESS') {
            type = 'storeRtn/auditByState';
        }

        this.props.dispatch({
            type: type,
            payload: {
                uuid: entity.uuid,
                version: entity.version
            },
            callback: (response) => {
                if (response && response.success) {
                  this.refresh(entity.billNumber, entity.uuid);
                    message.success(commonLocale.auditLocale)
                }

                this.setState({
                    visiblAudit: !this.state.visiblAudit,
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
            type: 'storeRtn/remove',
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

    onViewNtcBill = (record) => {
        this.props.dispatch({
            type: 'storeRtnNtc/getByBillNumberAndDcUuid',
            payload: {
                dcUuid: record.dcUuid,
                billNumber: record.rtnNtcBillNumber
            },
            callback: (response) => {
                if (response && response.success && response.data) {
                    this.props.dispatch(routerRedux.push({
                        pathname: '/rtn/storeRtnNtc',
                        payload: {
                            showPage: 'view',
                            entityUuid: response.data.uuid
                        }
                    }))
                }
            }
        });
    }

    previousBill = () => {
        const { entity } = this.state;
        if (entity.uuid){
          this.props.dispatch({
            type: 'storeRtn/previousBill',
            payload: entity.billNumber
          });
        }
      }

      nextBill = () => {
        const { entity } = this.state;
        if (entity.uuid){
          this.props.dispatch({
            type: 'storeRtn/nextBill',
            payload: entity.billNumber
          });
        }
      }

    /**
    * 绘制右上角按钮
    */
    drawActionButtion = () => {
        const { entity } = this.state;

        return  [(
            <Fragment key='actionFragment'>
              <Button onClick={this.onBack}>
                {commonLocale.backLocale}
              </Button>
              <PrintButton
                reportParams={[{ billNumber: `${entity.billNumber}` }]}
                moduleId={PrintTemplateType.STORERTNBILL.name} />
                <Button onClick={this.onEdit}
                    disabled={!havePermission(STORERTN_RES.EDIT)}
                    style={{
                        display: entity && entity.state === State.SAVED.name
                            ? '' : 'none'
                    }}>
                    {commonLocale.editLocale}
                </Button>

                <Button onClick={this.handleAuditModal}
                    disabled={!havePermission(STORERTN_RES.AUDIT)}
                    style={{
                        display: entity && (entity.state === State.SAVED.name
                            || entity.state === State.INPROGRESS.name)
                            ? '' : 'none'
                    }}>
                    {commonLocale.auditLocale}
                </Button>

                <Button onClick={this.handleDeleteModal}
                    disabled={!havePermission(STORERTN_RES.DELETE)}
                    style={{
                        display: entity && entity.state === State.SAVED.name
                            ? '' : 'none'
                    }}>
                    {commonLocale.deleteLocale}
                </Button>

            </Fragment>
        )];

    }
    /**
    * 绘制信息详情
    */
    drawBillInfoTab = () => {
        const { entity } = this.state;

        let profileItems = [{
            label: storeRtnLocal.rtnNtcBillNumber,
            value: <a onClick={this.onViewNtcBill.bind(true, entity)}>{entity.rtnNtcBillNumber ? entity.rtnNtcBillNumber : <Empty />}</a>
        },
        {
            label: commonLocale.inOwnerLocale,
            value: <a onClick={this.onViewOwner.bind(true, entity.owner ? entity.owner.uuid : undefined)}
                disabled={!havePermission(OWNER_RES.VIEW)}>{convertCodeName(entity.owner)}</a>
        },
        {
            label: commonLocale.inWrhLocale,
            value: <a onClick={this.onViewWrh.bind(true, entity.wrh ? entity.wrh.uuid : undefined)}
                disabled={!havePermission(WRH_RES.VIEW)}>{convertCodeName(entity.wrh)}</a>
        },
        {
            label: commonLocale.inStoreLocale,
            value: <a onClick={this.onViewStore.bind(true, entity.store ? entity.store.uuid : undefined)}
                disabled={!havePermission(STORE_RES.VIEW)}>{convertCodeName(entity.store)}</a>
        }, {
            label: storeRtnLocal.method,
            value: entity.method ? METHOD[entity.method].caption : <Empty />
        },
        {
            label: storeRtnLocal.rtner,
            value: convertCodeName(entity.rtner)
        }, {
            label: commonLocale.inUploadDateLocale,
            value: entity.uploadTime
        }, {
            label: "单据类型",
            value: entity.returnType? ReturnType[entity.returnType].caption: <Empty />
        }, {
            label: commonLocale.noteLocale,
            value: entity.note ? entity.note : <Empty />
          }];



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
                title: storeRtnLocal.type,
                dataIndex: 'type',
                width: colWidth.enumColWidth,
                render: (text, record) => (record.type ? Type[record.type].caption : <Empty />)
            },
            {
                title: commonLocale.inVendorLocale,
                dataIndex: 'vendor',
                width: colWidth.codeNameColWidth,
                render: (text, record) => <a onClick={() => this.onViewVendor(record.vendor.uuid)}
                    disabled={!havePermission(VENDOR_RES.VIEW) || !record.vendor || !record.vendor.uuid}>
                    <EllipsisCol colValue={convertCodeName(record.vendor)} /></a>
            }, {
                title: commonLocale.inQtyStrLocale,
                dataIndex: 'qtyStr',
                key: 'qtyStr',
                width: itemColWidth.qtyStrColWidth,
            },
            {
                title: commonLocale.inQtyLocale,
                dataIndex: 'qty',
                key: 'qty',
                width: itemColWidth.qtyColWidth,
            },
            {
                title: commonLocale.inProductDateLocale,
                dataIndex: 'productDate',
                key: 'productDate',
                width: colWidth.dateColWidth,
                render: (val) => {
                    return moment(val).format('YYYY-MM-DD');
                }
            },
            {
                title: commonLocale.inValidDateLocale,
                dataIndex: 'validDate',
                key: 'validDate',
                width: colWidth.dateColWidth,
                render: (val) => {
                    return moment(val).format('YYYY-MM-DD');
                }
            }, {
                title: storeRtnLocal.targetBin,
                width: colWidth.codeColWidth,
                render: record => record.targetBinCode ? record.targetBinCode + '[' + (record.targetBinUsage != undefined ? binUsage[record.targetBinUsage].caption : <Empty />) + ']' : <Empty />
            },
            {
                title: commonLocale.inContainerBarcodeLocale,
                dataIndex: 'containerBarcode',
                key: 'containerBarcode',
                width: colWidth.codeColWidth,
                render: (text, record) => <a onClick={() => this.onViewContainer(record.containerBarcode)}
                    disabled={!record.containerBarcode || '-' === record.containerBarcode}>
                    {record.containerBarcode}</a>
            },
            {
                title: commonLocale.productionBatchLocale,
                dataIndex: 'productionBatch',
                key: 'productionBatch',
                width: itemColWidth.stockBatchColWidth,
                render: text => text ? <EllipsisCol colValue={text} /> : <Empty />
            },
            {
                title: commonLocale.inPriceLocale,
                dataIndex: 'price',
                key: 'price',
                width: itemColWidth.priceColWidth,
                render: text => text ? text : <Empty />
            }
        ]
        return (
            <TabPane key="basicInfo" tab={commonLocale.billInfoLocale}>
                <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()} />
                <ViewTablePanel
                    title={commonLocale.itemsLocale}
                    columns={articleCols}
                    scroll={{ x: 2200 }}
                    data={entity.items ? entity.items : []}
                />
                <div>
                    <Modal
                        title={commonLocale.deleteLocale}
                        visible={this.state.visibleDelete}
                        uuid={this.state.entity.uuid}
                        onOk={this.onDelete}
                        confirmLoading={this.state.confirmLoading}
                        onCancel={this.handleDeleteModal}
                    >
                        <p>{storeRtnLocal.IPopconfirmDeleteTitle + ':' + this.state.entity.billNumber}</p>
                    </Modal>
                    <Modal
                        title={commonLocale.auditLocale}
                        visible={this.state.visiblAudit}
                        uuid={this.state.entity.uuid}
                        onOk={this.onAudit}
                        confirmLoading={this.state.confirmLoading}
                        onCancel={this.handleAuditModal}
                    >
                        <p>{storeRtnLocal.IPopconfirmAuditTitle + ':' + this.state.entity.billNumber}</p>
                    </Modal>
                </div>
            </TabPane>
        );
    }

    drawStateTag = () => {
        if (this.state.entity.state) {
            return (
                <TagUtil value={this.state.entity.state} />
            );
        }
    }
    /**
     * 判断状态节点
    */
    getDot = (state) => {
        if (state === State.SAVED.name || state === State.INPROGRESS.name) { return 0; }
        if (state === State.AUDITED.name) { return 1; }
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
      const data = [{
        title:'开始退仓时间',
        subTitle:entity.createInfo.time,
        current: entity.state !== '',
        description:[
          {
            label: commonLocale.inAllQtyStrLocale,
            value: entity.totalQtyStr
          }, {
            label: storeRtnLocal.articleCount,
            value: entity.articleCount
          }, {
            label: commonLocale.inAllAmountLocale,
            value: entity.totalAmount
          },
          {
            label: commonLocale.inAllWeightLocale,
            value: entity.totalWeight
          }, {
            label: commonLocale.inAllVolumeLocale,
            value: entity.totalVolume
          }
        ]
      },{
        title:'结束退仓时间',
        subTitle:entity.state === State.AUDITED.name ? entity.endTime: '',
        current: entity.state = State.AUDITED.name,
        description: []
      }
      ];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }

}
