import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Form, Select, Input, InputNumber, message, Col, Button, Tabs, Divider } from 'antd';
import StandardTable from '@/components/StandardTable';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import TagUtil from '@/pages/Component/TagUtil';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { loginCompany,loginOrg } from '@/utils/LoginContext';
import { binUsage, getUsageCaption } from '@/utils/BinUsage';
import { convertCodeName, isEmptyObj } from '@/utils/utils';
import { wrhCloseState, getStateCaption } from './WrhCloseBillState';
import { closeLocale } from './WrhCloseBillLocale';
import { wrhCloseType, getTypeCaption } from './WrhCloseBillType';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { getActiveKey} from '@/utils/LoginContext';
const TabPane = Tabs.TabPane;

@connect(({ close, loading }) => ({
  close,
  loading: loading.models.close,
}))
export default class DecinvBillViewPage extends ViewPage {

  constructor(props) {
    super(props);

    this.state = {
      title: closeLocale.title,
      entityUuid: props.close.entityUuid,
      entity: {},
      operate: '',
      modalVisible: false,
      createPermission:'iwms.inner.close.create'
    }
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.close.entity && nextProps.close.entity.uuid) {

      if (!nextProps.close.entity.uuid) {
        message.warning('当前单据不存在')
        this.onCancel();
        return;
      }
      this.setState({
        entity: nextProps.close.entity,
        title: commonLocale.billNumberLocal + "：" + nextProps.close.entity.billNumber,
        entityUuid: nextProps.close.entity.uuid,
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

  drawActionButtion() {
    const { entity } = this.state;

    return (
      <Fragment>
        <Button onClick={this.onCancel}>
          {commonLocale.backLocale}
        </Button>
        {entity.state === wrhCloseState.SAVED.name &&
          <span>
            <Button onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}>
              {commonLocale.deleteLocale}
            </Button>
            <Button onClick={() => this.onCreate(this.state.entity.uuid)}>
              {commonLocale.editLocale}
            </Button>
            <Button type='primary' onClick={() => this.handleModalVisible(commonLocale.auditLocale)}>
              {commonLocale.auditLocale}
            </Button>
          </span>
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

  refresh = (billNumber,uuid) => {
    if(billNumber){
      this.props.dispatch({
        type:'close/getByBillNumber',
        payload:{
          dcUuid:loginOrg().type === 'DC'?loginOrg().uuid:'',
          billNumber
        },
        callback:res=>{
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的封仓解仓单' + billNumber + '不存在！');
            this.onCancel();
          }
        }
      })
      return 
    }
    this.props.dispatch({
      type: 'close/get',
      payload: {
        uuid: uuid?uuid:this.state.entityUuid
      }
    });
  }

  onCancel = () => {
    this.props.dispatch({
      type: 'close/showPage',
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
        type: 'close/previousBill',
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
        type: 'close/nextBill',
        payload: entity.billNumber
      });
    }
  }

  onCreate = (entityUuid) => {
    this.props.dispatch({
      type: 'close/showPage',
      payload: {
        showPage: 'create',
        entityUuid
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

  /**
   * 删除处理
   */
  onRemove = () => {
    const { dispatch } = this.props;
    const { entity } = this.state;

    dispatch({
      type: 'close/onRemove',
      payload: {
        uuid: entity.uuid,
        version: entity.version,
      },
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
    const { entity } = this.state;

    dispatch({
      type: 'close/onAudit',
      payload: {
        uuid: entity.uuid,
        version: entity.version,
      },
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.auditSuccessLocale);
          this.refresh();
        }
      }
    });
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
    const entity = this.props.close.entity;

    let basicItems = [{
      label: closeLocale.type,
      value: entity ? getTypeCaption(entity.type) : ''
    }, {
      label: closeLocale.reason,
      value: entity ? entity.reason : ''
    }, {
      label: closeLocale.closer,
      value: entity ? convertCodeName(entity.closer) : ''
    },
    {
      label: commonLocale.noteLocale,
      value: entity ? entity.note : ''
    }];

    const itemsColumns = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth + 100,
      },
      {
        title: commonLocale.bincodeLocale,
        dataIndex: 'binCode',
        key: 'binCode',
        width: colWidth.codeColWidth + 100,
      },
      {
        title: commonLocale.inBinUsageLocale,
        dataIndex: 'binUsage',
        key: 'binUsage',
        width: colWidth.enumColWidth + 100,
        render: val => {
          return <span>{getUsageCaption(val)}</span>
        },
      },
    ];

    let noteItems = [{
      label: commonLocale.noteLocale,
      value: entity ? entity.note : ''
    }]

    return (
      <TabPane key="basicInfo" tab={commonLocale.basicInfoLocale}>
        <ViewPanel items={basicItems} title={commonLocale.profileItemsLocale} />
        <ViewTablePanel
          title={commonLocale.itemsLocale}
          columns={itemsColumns}
          data={entity ? (entity.items ? entity.items : []) : []}
        />
        {/* <ViewPanel items={noteItems} title={commonLocale.noteLocale} /> */}
        <div>
          <ConfirmModal
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={closeLocale.title + ':' + this.state.entity.billNumber}
            onOk={this.handleOk}
            onCancel={this.handleModalVisible}
          />
        </div>
      </TabPane>
    );
  }
}
