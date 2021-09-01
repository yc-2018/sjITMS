import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, Tabs, Modal, message, Progress, Row, Col,Table,Select,Form } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { RplMode, RplType, PickType, PickMethod } from '@/pages/Facility/PickArea/PickAreaContants';
import TagUtil from '@/pages/Component/TagUtil';
import StandardTable from '@/components/StandardTable';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import CFormItem from '@/pages/Component/Form/CFormItem';
import FormPanel from '@/pages/Component/Form/FormPanel';
import { binUsage } from '@/utils/BinUsage';
import { convertCodeName } from '@/utils/utils';
import { commonLocale,placeholderChooseLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { WAVEBILL_RES } from './WaveBillPermission';
import { WaveBillState, WaveAlcNtcItemState, WaveType, StockAllocateType } from './WaveBillContants';
import { waveBillLocale } from './WaveBillLocale';
import { getActiveKey} from '@/utils/LoginContext';
import Empty from '@/pages/Component/Form/Empty';
import styles from './Wave.less';
const TabPane = Tabs.TabPane;

@connect(({ wave,loading }) => ({
  wave,
  loading: loading.models.wave,
}))
@Form.create()
export default class WaveBillFinishPage extends ViewPage {
  constructor(props) {
    super(props);
    this.state = {
      entity: {},
      unReceivedInfo:[],
      receiveStockInfo:[],
      entityUuid: props.entityUuid,
      waveBillNumber: props.waveBillNumber,
      waveState: props.waveState,
    }
  }
  componentDidMount() {
    this.refresh();
    // 查询 订单未收货信息
    this.queryUnReceivedInfo();
    // 查询 收货未分拨信息
    this.queryReceiveStockInfos();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.wave.entity) {
      this.setState({
        entity: nextProps.wave.entity,
        title: waveBillLocale.title + ':' + nextProps.wave.entity.billNumber,
        entityUuid: nextProps.wave.entity.uuid,
        waveBillNumber: nextProps.wave.entity.billNumber
      });
    }
    if(nextProps.wave.unReceivedInfo){
      let line = 1;
      nextProps.wave.unReceivedInfo.map(item=>{
        item.line = line;
        line++;
      })
      this.setState({
        unReceivedInfo:nextProps.wave.unReceivedInfo
      })
    }
    if(nextProps.wave.receiveStockInfo){
      let line = 1;
      nextProps.wave.receiveStockInfo.map(item=>{
        item.line = line;
        line++;
      })
      this.setState({
        receiveStockInfo:nextProps.wave.receiveStockInfo
      })
    }
  }
  /**
  * 刷新
  */
  refresh() {
    const { entityUuid } = this.state;
    this.props.dispatch({
      type: 'wave/get',
      payload: {
        uuid: entityUuid
      }
    });
  }

  /**
   * 查询订单未收货信息
   */
  queryUnReceivedInfo(){
    const { waveBillNumber } = this.state;
    this.props.dispatch({
      type: 'wave/queryUnReceivedInfo',
      payload: {
        billNumber: waveBillNumber
      }
    });
  }

  /**
   * 查询收货未分拨信息
   */
  queryReceiveStockInfos(){
    const { waveBillNumber } = this.state;
    this.props.dispatch({
      type: 'wave/queryReceiveStockInfos',
      payload: {
        billNumber: waveBillNumber
      }
    });
  }

  /**
  * 返回
  */
  onBack = () => {
    this.props.dispatch({
      type: 'wave/showPage',
      payload: {
        showPage: 'query'
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
    this.props.form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      this.setState({
        modalVisible: !this.state.modalVisible
      });
    });
  }

  /**
   * 模态框确认操作
   */
  handleOk = () => {
    const { operate } = this.state;
    if (operate === commonLocale.finishLocale) {
      this.onFinish();
    } 
  }

  /**
   * 完成
   */
  onFinish = () => {
    const { waveBillNumber } = this.state
    const { dispatch } = this.props;
    this.props.form.validateFields((errors, fieldsValue) => {
      this.props.dispatch({
        type: 'wave/onFinish',
        payload: {
          billNumber: waveBillNumber,
          finishOrder:fieldsValue.finishOrder
        },
        callback: (response) => {
          if (response && response.success) {
            this.onBack();
            message.success(commonLocale.finishSuccessLocale)
          }else{
            this.setState({
              modalVisible: !this.state.modalVisible
            });
          }
        }
      })
    })
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
    if (this.state.entity.state) {
      return (
        <Fragment>
          <Button onClick={this.onBack}>
            {commonLocale.backLocale}
          </Button>
          {
            WaveBillState[this.state.entity.state].name == 'INPROGRESS' ?
              <Button type="primary" onClick={() => this.handleModalVisible(commonLocale.finishLocale)}
               disabled={!havePermission(WAVEBILL_RES.FINISH)}
              >
                {commonLocale.finishLocale}
              </Button>
              : null
          }
        </Fragment>
      );
    }
  }
  /**
   * 切换详情面板时触发
   */
  handleChangeTabPane = (e) => {
    if (e == 'orderBill') {
      this.queryUnReceivedInfo();
      return;
    } else if (e == 'receiveBill') {
      this.queryReceiveStockInfos();
      return;
    }
  }

  /**
  * 绘制信息详情
  */
  drawItemInfoTab = () => {
    const { entity,unReceivedInfo,receiveStockInfo } = this.state;
    // 概要
    let basicItems = [
      <CFormItem label={commonLocale.inWaveTypeLocale} key='waveType' >
        <Col>{entity.waveType ? WaveType[entity.waveType].caption : <Empty/>}</Col>
      </CFormItem>,
      <CFormItem label={waveBillLocale.waveType} key='type' >
        <Col>{entity.type ? entity.type : <Empty/>}</Col>
      </CFormItem>,
      <CFormItem label={waveBillLocale.collectBinMgrScheme} key='collectBinMgrScheme' >
        <Col>{entity.collectBinMgrScheme ? convertCodeName(entity.collectBinMgrScheme) : <Empty/>}</Col>
      </CFormItem>,
      <CFormItem label={waveBillLocale.pickOrderScheme} key='pickOrderScheme' >
        <Col>{entity.pickOrderScheme ? convertCodeName(entity.pickOrderScheme) : <Empty/>}</Col>
      </CFormItem>,
      <CFormItem label={waveBillLocale.stockAllocateType} key='stockAllocateType' >
        <Col>{entity.stockAllocateType ? convertCodeName(entity.stockAllocateType) : <Empty/>}</Col>
      </CFormItem>,
      <CFormItem label={waveBillLocale.finishOrder} key='finishOrder'>
        {this.props.form.getFieldDecorator('finishOrder', {
          rules: [
            { required: true, message: waveBillLocale.finishOrder }
          ],
        })(
          <Select placeholder={placeholderChooseLocale(waveBillLocale.finishOrder)} style={{width:'240px'}}>
            <Select.Option value="1">是</Select.Option>
            <Select.Option value="0">否</Select.Option>
          </Select>
        )}
      </CFormItem>
    ];

    // 订单未收货信息
    let orderCols =[
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title:'订单单号',
        dataIndex: 'orderBillNumber',
      },
      {
        title:commonLocale.inArticleLocale,
        render:record=>convertCodeName(record.article)
      },
      {
        title:'规格',
        dataIndex:'qpcStr'
      },
      {
        title:commonLocale.inQtyStrLocale,
        dataIndex:'totalQtyStr'
      },
      {
        title:'收货件数',
        dataIndex:'receivedQtyStr'
      }
    ];

    // 收货未分拨信息
    let receiveCols =[
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title:commonLocale.inArticleLocale,
        render:record=>convertCodeName(record.article)
      },
      {
        title:commonLocale.containerLocale,
        dataIndex:'containerBarcode'
      },
      {
        title:commonLocale.bincodeLocale,
        render:record=>record.binCode+'['+binUsage[record.binUsage].caption+']'
      },
      {
        title:'规格',
        dataIndex:'qpcStr'
      },
      {
        title:commonLocale.inQtyStrLocale,
        dataIndex:'qtyStr'
      },
    ];

    let itemsTab = <Tabs defaultActiveKey="orderBill" className={styles.ItemTabs} onChange={this.handleChangeTabPane}>
      <TabPane tab={'订单未收货信息'} key="orderBill">
        <ViewTablePanel
          columns={orderCols}
          data={unReceivedInfo}
          notNote
        />
      </TabPane>
      <TabPane tab={'收货未分拨信息'} key="receiveBill">
        <Table
          className={styles.standardTable}
          columns={receiveCols}
          pagination={false}
          dataSource={receiveStockInfo}
          onChange={this.handleStandardTableChange}
          rowKey={record => record.uuid}
          rowClassName={(record, index) => index % 2  === 0 ? styles.lightRow :''}
        />
      </TabPane>
    </Tabs>;

    return (
      <TabPane key="basicInfo" tab={commonLocale.basicInfoLocale}>
        <ViewPanel title={commonLocale.profileItemsLocale} >
          <Form className={styles.basicInfo}>
            <FormPanel key='basicInfo' cols={basicItems} />
          </Form>
        </ViewPanel>
        <ViewPanel children={itemsTab} title={commonLocale.itemsLocale} />
      </TabPane>
    );
  }

  /**
  * 绘制Tab页
  */
  drawTabPanes = () => {
    let tabPanes = [
      this.drawItemInfoTab(),// 单头-订单未收货信息
      // this.drawReceiveInfoTab(),// 收货未分拨信息
    ];

    return tabPanes;
  }

  drawOthers =() =>{
    return <ConfirmModal
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={waveBillLocale.title + ':' + this.state.entity.billNumber}
            onOk={this.handleOk}
            onCancel={this.handleModalVisible}
          />;
  }

}
