import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { spawn } from 'child_process';
import { formatMessage } from 'umi/locale';
import { Button, Tabs, message, Checkbox } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import TagUtil from '@/pages/Component/TagUtil';
import { addressToStr, convertCodeName } from '@/utils/utils';
import { basicState } from '@/utils/BasicState';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { binUsage } from '@/utils/BinUsage';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import {
  StockTakePlanLocale, StockTakePlanPerm,
  StockTakePlanMethod, StockTakeSchema, OperateMethod, Type
} from './StockTakePlanLocale';

const TabPane = Tabs.TabPane;
@connect(({ stockTakePlanBill, loading }) => ({
  stockTakePlanBill,
  loading: loading.models.stockTakePlanBill,
}))
export default class StockTakePlanViewPage extends ViewPage {

  constructor(props) {
    super(props);

    this.state = {
      entity: {},
      title: '',
      entityUuid: '',
      entityState: '',
      disabledChangeState: true,
      operate: '',
      modalVisible: false,
      billNumber: props.stockTakePlanBill.billNumber,
      createPermission:"iwms.inner.stockTakePlan.create"
    }
  }

  componentDidMount() {
    this.refresh(this.state.billNumber);
  }

  componentWillReceiveProps(nextProps) {
    const stockTakePlan = nextProps.stockTakePlanBill.entity;
    if(stockTakePlan){
      this.setState({
        entity: stockTakePlan,
        title: stockTakePlan ? StockTakePlanLocale.title + "：" + stockTakePlan.billNumber : '',
        entityUuid: stockTakePlan ? stockTakePlan.uuid : '',
      });
    }
   

    if (nextProps.stockTakePlanBill.billNumber != this.props.stockTakePlanBill.billNumber) {
      this.setState({
        billNumber: nextProps.stockTakePlanBill.billNumber
      }, () => {
        this.refresh(nextProps.stockTakePlanBill.billNumber)
      })
    }
  }

  refresh(billNumber,uuid) {
    if(billNumber){
      this.props.dispatch({
        type: 'stockTakePlanBill/getByBillNumber',
        payload: {
          billNumber:billNumber,
          dcUuid: loginOrg().uuid
        },
        callback:res=>{
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的盘点计划单' + billNumber + '不存在！');
            this.onBack();
          } else {
            this.setState({
              billNumber: res.data.billNumber,
              entity: res.data,
            });
          }
        }
      }); 
      return
    }

    const { entityUuid } = this.state;
    this.props.dispatch({
      type:'stockTakePlanBill/billUuid',
      payload:{
        uuid:entityUuid
      },
      callback:res=>{
        if (!res || !res.data || !res.data.uuid) {
          message.error('指定的盘点计划单' + billNumber + '不存在！');
          this.onBack();
        } else {
          this.setState({
            billNumber: res.data.billNumber,
            entity: res.data,
          });
        }
      }
    })
  }

  onBack = () => {
    this.props.dispatch({
      type: 'stockTakePlanBill/showPage',
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
    } else if (operate === commonLocale.finishLocale) {
      this.onFinish();
    }
  }

  onRemove = () => {
    this.props.dispatch({
      type: 'stockTakePlanBill/remove',
      payload: {
        uuid: this.state.entity.uuid,
        version: this.state.entity.version
      },
      callback: response => {
        if (response && response.success) {
          message.success("盘点计划已删除");
        }
      }
    });
  }

  onEdit = () => {
    this.props.dispatch({
      type: 'stockTakePlanBill/showPage',
      payload: {
        showPage: 'create',
        billNumber: this.state.entity.billNumber
      }
    });
  }

  onFinish = () => {
    this.props.dispatch({
      type: 'stockTakePlanBill/finish',
      payload: {
        uuid: this.state.entity.uuid,
        version: this.state.entity.version,
      },
      callback: response => {
        if (response && response.success) {
          message.success("盘点计划已完成");
          this.refresh(this.state.billNumber);
        }
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }

  onGenerateTakeBill = () => {
    this.props.dispatch({
      type: 'stockTakePlanBill/generateTakeBill',
      payload: {
        uuid: this.state.entity.uuid,
        version: this.state.entity.version,
      },
      callback: response => {
        if (response && response.success) {
          if (response.data == 0) {
            message.success("未生成盘点单，该盘点计划已完成");
          } else
            message.success("盘点单生成成功，共生成单据" + response.data + "张");
          this.refresh(this.state.billNumber);
        }
      }
    })
  }
  onCreate = () => {
    const payload = {
      showPage: 'create',
      billNumber:undefined
    }
    this.props.dispatch({
      type: 'stockTakePlanBill/showPage',
      payload: { ...payload }
    });
  }

  drawActionButtion = () => {
    return (
      <Fragment>
        <Button onClick={this.onBack}>
          {commonLocale.backLocale}
        </Button>
        {(this.state.entity && this.state.entity.state === 'INITIAL') &&
          <Button disabled={StockTakePlanPerm.REMOVE} onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}>
            {commonLocale.deleteLocale}
          </Button>}
        {(this.state.entity && this.state.entity.state === 'INITIAL') &&
          <Button disabled={StockTakePlanPerm.CREATE} onClick={this.onEdit}>
            {commonLocale.editLocale}
          </Button>}
        {(this.state.entity && this.state.entity.state !== 'FINISHED') &&
          <Button disabled={StockTakePlanPerm.FINISH} onClick={() => this.handleModalVisible(commonLocale.finishLocale)}>
            {'完成'}
          </Button>}
        {(this.state.entity && this.state.entity.state === 'INITIAL') &&
          <Button type="primary" disabled={StockTakePlanPerm.FINISH} onClick={this.onGenerateTakeBill}>
            {'生成盘点单'}
          </Button>}
      </Fragment>
    );
  }

  drawTabPanes = () => {
    let tabPanes = [
      this.drawInfoTab(),
    ];

    return tabPanes;
  }

  drawStateTag = () => {
    if (this.state.entity && this.state.entity.state) {
      return (
        <TagUtil value={this.state.entity.state} />
      );
    }
  }

  drawInfoTab = () => {
    const { entity } = this.state;

    let basicItems =
      [{
        label: StockTakePlanLocale.schema,
        value: entity ? StockTakeSchema[entity.stockTakeSchema] : ''
      }, {
        label: StockTakePlanLocale.operateMehthod,
        value: entity ? OperateMethod[entity.stockTakeMethod] : ''
      }, {
        label: StockTakePlanLocale.owner,
        value: entity?convertCodeName(entity.owner):""
      }, {
        label: StockTakePlanLocale.type,
        value: entity && entity.type ? Type[entity.type].caption : ''
      },
      {
        label: commonLocale.noteLocale,
        value: entity?entity.note:''
      }];
    if (entity && entity.type && Type.VIRTUALITY_STOCK.name === Type[entity.type].name) {
      basicItems.push({
        label: StockTakePlanLocale.virtualityBin,
        value: entity?entity.virtualityBin:''
      });
    }

    function convertBinUsages(entity) {
      let result = [];
      if (entity.binUsages) {
        entity.binUsages.forEach(usage => {
          result.push(binUsage[usage].caption);
        });
      }
      return result.join();
    }

    function convertPickAreas(entity) {
      let result = [];
      if (entity.pickAreas) {
        entity.pickAreas.forEach(pickArea => {
          result.push('[' + pickArea.code + ']' + pickArea.name);
        });
      }
      return result.join();
    }
    let scopeItems =
      [{
        label: StockTakePlanLocale.pickArea,
        value: entity ? convertPickAreas(entity) : ''
      }, {
        label: StockTakePlanLocale.binUsage,
        value: entity ? convertBinUsages(entity) : ''
      }, {
        label: StockTakePlanLocale.binScope,
        value: entity ? entity.binScope : ''
      },
      {
        label: StockTakePlanLocale.change,
        value: entity ? <div style={{ display: 'inline-block' }}><span style={{ width: '50%' }}>{entity.changeTimes}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ width: '50%' }}> {entity.startDate ? moment(entity.startDate).format("YYYY-MM-DD") : ''}</span></div> : ''
      },
      {
        label: StockTakePlanLocale.articleScope,
        value: entity ? entity.articleScope : ''
      }, {
        label: StockTakePlanLocale.existStock,
        value: entity ? <Checkbox checked={entity.existStock} disabled /> : ''
      }];

    function convertCondition(entity) {
      let result = [];
      if (entity.byBinUsage)
        result.push(StockTakePlanLocale.binUsage);
      if (entity.byPickArea)
        result.push(StockTakePlanLocale.pickArea);
      if (entity.byPath)
        result.push(StockTakePlanLocale.path);
      if (entity.byZone)
        result.push(StockTakePlanLocale.zone);
      return result.join();
    }

    let conditionItems =
      [{
        label: StockTakePlanLocale.splitConfition,
        value: entity ? <span>{(entity.splitBasic === "MAX_BILL_COUNT" ? StockTakePlanLocale.maxBillCount : StockTakePlanLocale.maxBinCount)
          + "   " + entity.maxCount}</span> : ''
      }, {
        label: StockTakePlanLocale.conditionInfo,
        value: entity ? convertCondition(entity) : ''
      },];

    let noteItems = [{
      key: 'note',
      value: entity ? entity.note : ''
    }]

    return (
      <TabPane key="basicInfo" tab={StockTakePlanLocale.billInfo}>
        <ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} />
        <ViewPanel items={scopeItems} title={StockTakePlanLocale.scopeInfo} />
        <ViewPanel items={conditionItems} title={StockTakePlanLocale.splitConfition} />
        <div>
          <ConfirmModal
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={StockTakePlanLocale.title + ':' + this.state.entity?this.state.entity.billNumber:''}
            onOk={this.handleOk}
            onCancel={this.handleModalVisible}
          />
        </div>
      </TabPane>
    );
  }
}
