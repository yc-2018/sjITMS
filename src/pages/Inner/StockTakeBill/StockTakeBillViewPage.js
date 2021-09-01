import { connect } from 'dva';
import { Fragment } from 'react';
import { formatMessage } from 'umi/locale';
import moment from 'moment';
import { Button, Tabs, message, Menu, Dropdown } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import TagUtil from '@/pages/Component/TagUtil';
import Empty from '@/pages/Component/Form/Empty';
import { convertCodeName, convertArticleDocField } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import { BinUsage, getUsageCaption } from '@/utils/BinUsage';
import { StockTakeBill_RES } from './StockTakeBillPermission';
import { stockTakeBillLocal } from './StockTakeBillLocal';
import { SCHEMA, STATE, METHOD, State } from './StockTakeBillConstants';
import ModifyTakeMethodModal from './ModifyTakeMethodModal';
import ModifyTakeSchemaModal from './ModifyTakeSchemaModal';
import ModifyTakerModal from './ModifyTakerModal';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { stockState } from '@/utils/StockState';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { routerRedux } from 'dva/router';
import { loginOrg } from '@/utils/LoginContext';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import StandardTable from '@/components/StandardTable';

const TabPane = Tabs.TabPane;
@connect(({ stockTakeBill, loading }) => ({
  stockTakeBill,
  loading: loading.models.stockTakeBill,
}))
export default class StockTakeBillViewPage extends ViewPage {

  constructor(props) {
    super(props);

    this.state = {
      entity: props.stockTakeBill.entity,
      entityUuid: props.stockTakeBill.entityUuid,
      title: '',
      checkItemData: {},
      takerModalVisible: false,
      methodModalVisible: false,
      takeSchemaModalVisible: false,
      operate: '',
      modalVisible: false,
      showProcessView: false,
      showTable: false,
    }
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.stockTakeBill.entity) {
      this.setState({
        entity: nextProps.stockTakeBill.entity,
        title: stockTakeBillLocal.title + '：' + nextProps.stockTakeBill.entity.billNumber,
        entityUuid: nextProps.stockTakeBill.entity.uuid,
      });
    }
  }

  refresh(billNumber,uuid) {
    if(billNumber){
      this.props.dispatch({
        type: 'stockTakeBill/getByBillNumber',
        payload: {
          billNumber: billNumber,
          dcUuid: loginOrg().uuid
        },
        callback: (response) => {
          if (response && response.success && response.data) {
            this.props.dispatch({
              type: 'stockTakeBill/get',
              payload: response.data.uuid
            })
          }else{
            message.error('指定的盘点单' + billNumber + '不存在！');
            this.onBack();
          }
        }
      });
      return 
    }
    const { entityUuid } = this.state;
    this.props.dispatch({
      type: 'stockTakeBill/get',
      payload:uuid?uuid:entityUuid
    });
  }


  getStockTakeBill = (billNumber) => {
    this.props.dispatch({
      type: 'stockTakeBill/getByBillNumber',
      payload: {
        billNumber: billNumber,
        dcUuid: loginOrg().uuid
      },
      callback: (response) => {
        if (response && response.success && response.data) {
          this.props.dispatch({
            type: 'stockTakeBill/get',
            payload: response.data.uuid
          })
        }
      }
    });
  }

  onViewStockTakePlan = (planBillNumber) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/inner/stockTakePlanBill',
      payload: {
        showPage: 'view',
        billNumber: planBillNumber
      }
    }));
  }

  onViewSouceBill = (record) => {
    this.props.dispatch({
      type: 'stockTakeBill/getByBillNumber',
      payload: {
        dcUuid: record.dcUuid,
        billNumber: record.sourceBillNumber
      },
      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/inner/stockTakeBill',
            payload: {
              showPage: 'view',
              entityUuid: response.data ? response.data.uuid : undefined
            }
          }));
        }
      }
    });
  }

  onBack = () => {
    this.props.dispatch({
      type: 'stockTakeBill/showPage',
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
    if (entity.uuid) {
      this.props.dispatch({
        type: 'stockTakeBill/previousBill',
        payload: entity.billNumber
      });
    }
  }
  /**
   * 点击下一单
   */
  nextBill = () => {
    const { entity } = this.state;
    if (entity.uuid) {
      this.props.dispatch({
        type: 'stockTakeBill/nextBill',
        payload: entity.billNumber
      });
    }
  }

  onEdit = () => {
    this.props.dispatch({
      type: 'stockTakeBill/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entityUuid
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
    const {
      operate
    } = this.state;
    if (operate === commonLocale.abortLocale) {
      this.onAbort();
    } else if (operate === commonLocale.finishLocale) {
      this.onFinish();
    }
  }

  onSnap = () => {
    const { dispatch } = this.props;
    const { entity } = this.state;

    dispatch({
      type: 'stockTakeBill/snap',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: response => {
        if (response && response.success) {
          this.refresh();
          message.success('操作成功');
        }
      }
    });
  }

  onFinish = () => {
    const { dispatch } = this.props;
    const { entity } = this.state;

    dispatch({
      type: 'stockTakeBill/finish',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: response => {
        if (response && response.success) {
          this.refresh();
          message.success('完成成功');
        }
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }

  onRepeatTake = () => {
    const { dispatch } = this.props;
    const { entity } = this.state;

    dispatch({
      type: 'stockTakeBill/repeatTake',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: response => {
        if (response && response.success) {
          this.refresh();
          message.success('复盘成功');
        }
      }
    });
  }

  onAbort = () => {
    const { dispatch } = this.props;
    const { entity } = this.state;

    dispatch({
      type: 'stockTakeBill/abort',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: (response) => {
        if (response && response.success) {
          this.refresh();
          message.success("作废成功");
        }
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }

  onClickMune = ({ key }) => {
    if (key === '1') {
      this.setState({
        takerModalVisible: true,
      })
    }
    else if (key === '2') {
      this.setState({
        takeSchemaModalVisible: true,
      })
    }
    else if (key === '3') {
      this.setState({
        methodModalVisible: true,
      })
    }
  }

  handleMethodModalVisible = () => {
    this.setState({
      methodModalVisible: !this.state.methodModalVisible,
    })
  }

  handleTakerModalVisible = () => {
    this.setState({
      takerModalVisible: !this.state.takerModalVisible,
    })
  }

  handleSchemaModalVisible = () => {
    this.setState({
      takeSchemaModalVisible: !this.state.takeSchemaModalVisible,
    })
  }

  handleModifyMethod = (value) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'stockTakeBill/modifyStockTakeMethod',
      payload: value,
      callback: response => {
        if (response && response.success) {
          this.refresh();
          this.setState({
            methodModalVisible: false,
          })
          message.success(commonLocale.modifySuccessLocale);
        } else {
          message.error(response.message)
        }
      }
    });
  }

  handleModifySchema = (value) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'stockTakeBill/modifyStockTakeSchema',
      payload: value,
      callback: response => {
        if (response && response.success) {
          this.refresh();
          this.setState({
            takeSchemaModalVisible: false,
          })
          message.success(commonLocale.modifySuccessLocale);
        } else {
          message.error(response.message)
        }
      }
    });
  }

  handleModifyTaker = (value) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'stockTakeBill/modifyStockTaker',
      payload: value,
      callback: response => {
        if (response && response.success) {
          this.setState({
            takerModalVisible: false,
          })
          this.refresh();
          message.success(commonLocale.modifySuccessLocale);
        } else {
          message.error(response.message)
        }
      }
    });
  }

  drawActionButtion = () => {
    const { entity } = this.state;

    const menuNew = () => (
      <Menu onClick={this.onClickMune} >
        <Menu.Item disabled={!havePermission(StockTakeBill_RES.MODIFYTAKER)}
          key="1">{stockTakeBillLocal.modifyTaker}</Menu.Item>
        <Menu.Item disabled={!havePermission(StockTakeBill_RES.MODIFYSCHEMA)}
          key="2">{stockTakeBillLocal.modifySchema}</Menu.Item>
        <Menu.Item disabled={!havePermission(StockTakeBill_RES.MODIFYMETHOD)}
          key="3">{stockTakeBillLocal.modifyMethod}</Menu.Item>
      </Menu>
    );

    return (
      <Fragment>
         <Button onClick={this.onBack}>
          {commonLocale.backLocale}
        </Button>
        <Button onClick={this.onSnap}
          disabled={!havePermission(StockTakeBill_RES.SNAP)}
          style={{
            display: entity && entity.state === 'INITIAL'
              && entity.method !== METHOD.RF.name
              ? '' : 'none'
          }}
        >
          {stockTakeBillLocal.snap}
        </Button>

        <Button onClick={this.onEdit}
          disabled={!havePermission(StockTakeBill_RES.CHECK)}
          style={{
            display: entity && entity.state === 'TAKED'
              && entity.method !== METHOD.RF.name ? '' : 'none'
          }}>
          {commonLocale.editLocale}
        </Button>

        <Button onClick={this.onRepeatTake}
          disabled={!havePermission(StockTakeBill_RES.REPEATTAKE)}
          style={{ display: entity && entity.state === 'TAKED' ? '' : 'none' }}>
          {stockTakeBillLocal.repeatTake}
        </Button>
        <Button
          disabled={!havePermission(StockTakeBill_RES.FINISH)}
          style={{
            display: entity && entity.state === 'TAKED' ? '' : 'none'
          }}
          onClick={() => this.handleModalVisible(commonLocale.finishLocale)}>
          {commonLocale.finishLocale}
        </Button>

        <Button onClick={() => this.handleModalVisible(commonLocale.abortLocale)}
          disabled={!havePermission(StockTakeBill_RES.ABORT)}
          style={{
            display: entity && entity.state !== 'FINISHED'
              && entity.state !== 'ABORTED' ? '' : 'none'
          }}
        >
          {commonLocale.abortLocale}
        </Button>

        <Dropdown overlay={menuNew}
          placement="bottomCenter">
          <Button icon="down"
            style={{ display: entity && entity.state === 'INITIAL' ? '' : 'none' }}
            type="primary">{stockTakeBillLocal.takeModify}</Button>
        </Dropdown>
        
       
        <PrintButton
          reportParams={[{ billNumber: `${entity.billNumber}` }]}
          moduleId={PrintTemplateType.STOCKTAKEBILL.name} />
       
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

  drawTabPanes = () => {
    let tabPanes = [
      this.drawBinTypeInfoTab(),
    ];

    return tabPanes;
  }

  getDot = (state) => {
    if (state === State.INPROGRESS.name || state === State.TAKED.name) { return 0; }
    if (state === State.FINISHED.name) { return 1; }
  }

  drawStateTag = () => {
    if (this.state.entity.state) {
      return (
        <TagUtil value={this.state.entity.state} />
      );
    }
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
      let diffItems = [
        {
          label: stockTakeBillLocal.realBinCount,
          value: entity.realBinCount
        },
        {
          label: stockTakeBillLocal.realContainerCount,
          value: entity.realContainerCount
        },
        {
          label: stockTakeBillLocal.decQtyStr,
          value: entity.decQtyStr ? entity.decQtyStr : "0"
        },
        {
          label: stockTakeBillLocal.incQtyStr,
          value: entity.incQtyStr ? entity.incQtyStr : "0"
        },
        {
          label: stockTakeBillLocal.realArticleCount,
          value: entity.realArticleCount
        },
        {
          label: stockTakeBillLocal.realAmount,
          value: entity.realAmount
        },
        {
          label: stockTakeBillLocal.realVolume,
          value: entity.realVolume
        },
        {
          label: stockTakeBillLocal.realWeight,
          value: entity.realWeight
        },
      ]
      let businessItems = [
        {
          label: stockTakeBillLocal.binCount,
          value: entity.binCount
        },

        {
          label: stockTakeBillLocal.containerCount,
          value: entity.containerCount
        },

        {
          label: commonLocale.inAllQtyStrLocale,
          value: entity.qtyStr ? entity.qtyStr : "0"
        },
        {
          label: stockTakeBillLocal.articleCount,
          value: entity.articleCount
        },

        {
          label: commonLocale.inAllAmountLocale,
          value: entity.amount
        },

        {
          label: commonLocale.inAllVolumeLocale,
          value: entity.volume
        },

        {
          label: commonLocale.inAllWeightLocale,
          value: entity.weight
        },

      ]
      let timeLineData = [
        { title: stockTakeBillLocal.beginTakeTime, subTitle: entity.beginTakeTime, description: businessItems, current: entity.state != State.FINISHED.name },
        { title: stockTakeBillLocal.endTakeTime, subTitle: entity.endTakeTime, description: diffItems, current: entity.state === State.FINISHED.name },
      ];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={timeLineData} />);
    }
    return others;
  }

  drawBinTypeInfoTab = () => {
    const { entity, takerModalVisible,
      methodModalVisible, takeSchemaModalVisible, showTable } = this.state;

    let basicItems = [
      {
        label: stockTakeBillLocal.schema,
        value: entity.takeSchema ? SCHEMA[entity.takeSchema].caption : <Empty />
      }, {
        label: stockTakeBillLocal.method,
        value: entity.method ? METHOD[entity.method].caption : <Empty />
      },
      {
        label: stockTakeBillLocal.stockTakePlan,
        value: <a onClick={this.onViewStockTakePlan.bind(true, entity.takePlanBill)}>{entity.takePlanBill}</a>
      }, {
        label: stockTakeBillLocal.serialNum,
        value: entity.serialNum
      },
      {
        label: commonLocale.inSourceBillLocale,
        value: <a onClick={this.getStockTakeBill.bind(true, entity.sourceBillNumber)}>{entity.sourceBillNumber}</a>
      },
      {
        label: commonLocale.ownerLocale,
        value: convertCodeName(entity.owner)
      },
      {
        label: stockTakeBillLocal.taker,
        value: convertCodeName(entity.taker)
      },
      {
        label: stockTakeBillLocal.repeatCount,
        value: entity.repeatTimes
      },
      {
        label: commonLocale.noteLocale,
        value: entity.note
      }];



    let billtemColumns = [{
      title: "序号",
      dataIndex: 'line',
      render: (text, record, index) => (index + 1),
      width: itemColWidth.lineColWidth
    }, {
      title: "货位用途",
      dataIndex: 'binUsage',
      width: colWidth.enumColWidth,
      render: (text) => text ? (getUsageCaption(text)) : <Empty />,
    },
    {
      title: "货位",
      dataIndex: 'binCode',
      width: colWidth.codeColWidth,
    },
    {
      title: "是否已盘",
      dataIndex: 'checked',
      width: colWidth.enumColWidth,
      render: (text, record) => (record.checked ? "是" : "否")
    }, {
      title: "是否差异",
      dataIndex: 'diversity',
      width: colWidth.enumColWidth,
      render: (text, record) => (record.diversity ? "是" : "否")
    }, {
      title: commonLocale.noteLocale,
      dataIndex: 'note',
      render: text => text ? <EllipsisCol colValue={text} /> : <Empty />,
      width: itemColWidth.noteEditColWidth
    }];

    let snapItemColumns = [{
      title: commonLocale.articleLocale,
      dataIndex: 'article',
      width: itemColWidth.articleColWidth,
      render: (text, record) =>
        <a onClick={() => this.onViewArticle(record.article.articleUuid)} >
          <EllipsisCol colValue={convertArticleDocField(record.article)} /></a>
    }, {
      title: commonLocale.qpcStrLocale,
      dataIndex: 'qpcStr',
      width: itemColWidth.qpcStrColWidth,
      render: (text, record) => (record.qpcStr + '/' + record.article.munit)
    }, {
      title: commonLocale.bincodeLocale,
      dataIndex: 'binCode',
      width: itemColWidth.binCodeEditColWidth,
    }, {
      title: commonLocale.containerLocale,
      dataIndex: 'containerBarcode',
      width: itemColWidth.containerEditColWidth,
      render: (text, record) =>
        <a onClick={() => this.onViewContainer(record.containerBarcode)}
          disabled={!text || '-' === text}>
          <EllipsisCol colValue={record.containerBarcode} /></a>
    }, {
      title: commonLocale.productionDateLocale,
      dataIndex: 'productionDate',
      width: colWidth.dateColWidth,
      render: (text) => moment(text).format("YYYY-MM-DD")
    }, {
      title: commonLocale.validDateLocale,
      dataIndex: 'validDate',
      width: colWidth.dateColWidth,
      render: (text) => moment(text).format("YYYY-MM-DD")
    }, {
      title: stockTakeBillLocal.snapQtyStr,
      dataIndex: 'caseQtyStr',
      width: itemColWidth.qtyStrColWidth
    }, {
      title: stockTakeBillLocal.snapQty,
      dataIndex: 'qty',
      width: itemColWidth.qtyColWidth
    }, {
      title: stockTakeBillLocal.checkQtyStr,
      dataIndex: 'checkCaseQtyStr',
      width: itemColWidth.qtyStrColWidth,
      render: text => text ? text : <Empty />
    }, {
      title: stockTakeBillLocal.checkQty,
      dataIndex: 'checkQty',
      width: itemColWidth.qtyColWidth,
    }, {
      title: commonLocale.vendorLocale,
      dataIndex: 'vendor',
      width: colWidth.codeNameColWidth,
      render: (text, record) => (<EllipsisCol colValue={convertCodeName(record.vendor)} />)
    }, {
      title: commonLocale.productionBatchLocale,
      dataIndex: 'productionBatch',
      width: itemColWidth.numberEditColWidth,
      render: text => text ? text : <Empty />
    }];

    let diverItemColumn = [
      {
        title: commonLocale.articleLocale,
        dataIndex: 'article',
        width: itemColWidth.articleColWidth,
        render: (text, record) =>
          <a onClick={() => this.onViewArticle(record.article.articleUuid)} >
            <EllipsisCol colValue={convertArticleDocField(record.article)} /></a>
      }, {
        title: commonLocale.qpcStrLocale,
        dataIndex: 'qpcStr',
        width: itemColWidth.qpcStrColWidth,
        render: (text, record) => (record.qpcStr + '/' + record.article.munit)
      }, {
        title: commonLocale.bincodeLocale,
        dataIndex: 'binCode',
        width: itemColWidth.binCodeEditColWidth,
      }, {
        title: commonLocale.containerLocale,
        dataIndex: 'containerBarcode',
        width: itemColWidth.containerEditColWidth,
        render: (text, record) =>
          <a onClick={() => this.onViewContainer(record.containerBarcode)}
            disabled={!text || '-' === text}>
            <EllipsisCol colValue={record.containerBarcode} /></a>
      }, {
        title: commonLocale.productionBatchLocale,
        dataIndex: 'productionBatch',
        width: itemColWidth.numberEditColWidth,
        render: text => text ? text : <Empty />
      }, {
        title: commonLocale.productionDateLocale,
        dataIndex: 'productionDate',
        width: colWidth.dateColWidth,
        render: (text) => moment(text).format("YYYY-MM-DD")
      }, {
        title: commonLocale.validDateLocale,
        dataIndex: 'validDate',
        width: colWidth.dateColWidth,
        render: (text) => moment(text).format("YYYY-MM-DD")
      }, {
        title: commonLocale.vendorLocale,
        dataIndex: 'vendor',
        width: colWidth.codeNameColWidth,
        render: (text, record) => (<EllipsisCol colValue={convertCodeName(record.vendor)} />)
      }, {
        title: commonLocale.caseQtyStrLocale,
        dataIndex: 'caseQtyStr',
        width: itemColWidth.qpcStrColWidth
      }, {
        title: commonLocale.qtyLocale,
        dataIndex: 'qty',
        width: itemColWidth.qtyColWidth
      }
    ]
    
    let itemsTab = <Tabs defaultActiveKey="billtemColumns">
     <TabPane tab={'单据信息'} key={'billtemColumns'}>
        {/* <StandardTable
        
          notNote
          columns={snapItemColumns}
          data={entity.snapItems ? entity.snapItems : []}
          tableId={'StockTake.view.snapItemColumns'}

        /> */}
        <div style={{marginTop:'-30px'}}>
        <StandardTable
                minHeight={this.minHeight ? this.minHeight : 150}
                rowKey={record => record.uuid ? record.uuid : record.line}
                unShowRow={true}
                data={entity.items ? entity.items : []}
                columns={billtemColumns}
                selectedRows={[]}
                comId={'StockTake.view.billtemColumns'}
                hasSettingColumns
              />
        </div>
        <div style={{height:'60px'}}></div>
      </TabPane>
      <TabPane tab={'盘点信息'} key={'snapItemColumns'}>
        {/* <StandardTable
        
          notNote
          columns={snapItemColumns}
          data={entity.snapItems ? entity.snapItems : []}
          tableId={'StockTake.view.snapItemColumns'}

        /> */}
        <div style={{marginTop:'-30px'}}>
        <StandardTable
                minHeight={this.minHeight ? this.minHeight : 150}
                rowKey={record => record.uuid ? record.uuid : record.line}
                unShowRow={true}
                data={entity.snapItems ? entity.snapItems : []}
                columns={snapItemColumns}
                selectedRows={[]}
                comId={'StockTake.view.snapItemColumns'}
                hasSettingColumns
              />
        </div>
        <div style={{height:'60px'}}></div>
      </TabPane>
      <TabPane tab={'差异信息'} key={'diverItemColumn'}>
        {/* <ViewTablePanel
          style={{ marginTop: '-30px' }}
          notNote
          columns={diverItemColumn}
          data={entity.diverItems ? entity.diverItems : []}
          tableId={'StockTake.view.diverItemColumn'}

        /> */}
        <div style={{marginTop:'-30px'}}>
        <StandardTable
                minHeight={this.minHeight ? this.minHeight : 150}
                rowKey={record => record.uuid ? record.uuid : record.line}
                unShowRow={true}
                data={entity.diverItems ? entity.diverItems : []}
                columns={diverItemColumn}
                selectedRows={[]}
                comId={'StockTake.view.diverItemColumn'}
                hasSettingColumns
              />
              </div>
        <div style={{height:'60px'}}></div>
      </TabPane>
    </Tabs>


    let current = this.getDot(entity.state);

    return (
      <TabPane key="basicInfo" tab={commonLocale.billInfoLocale}>
        <ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} rightTile={this.darwProcess()} />
        {/* <ViewPanel items={businessItems} title={commonLocale.bussinessLocale} onCollapse={this.onCollapse} isClose={!showTable} /> */}
        <ViewPanel children={itemsTab} title={'明细'} />
        <div>
          <ConfirmModal
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={stockTakeBillLocal.title + ':' + this.state.entity.billNumber}
            onOk={this.handleOk}
            onCancel={this.handleModalVisible}
          />
        </div>

        <ModifyTakeMethodModal
          ModalTitle={stockTakeBillLocal.modifyMethod}
          methodModalVisible={methodModalVisible}
          handleMethodModalVisible={this.handleMethodModalVisible}
          handleSave={this.handleModifyMethod}
          uuid={entity.uuid}
          version={entity.version}
        />
        <ModifyTakeSchemaModal
          ModalTitle={stockTakeBillLocal.modifySchema}
          takeSchemaModalVisible={takeSchemaModalVisible}
          handleSchemaModalVisible={this.handleSchemaModalVisible}
          handleSave={this.handleModifySchema}
          uuid={entity.uuid}
          version={entity.version}
        />
        <ModifyTakerModal
          ModalTitle={stockTakeBillLocal.modifyTaker}
          takerModalVisible={takerModalVisible}
          handleTakerModalVisible={this.handleTakerModalVisible}
          handleSave={this.handleModifyTaker}
          uuid={entity.uuid}
          version={entity.version}
        />
      </TabPane>
    );
  }
}
