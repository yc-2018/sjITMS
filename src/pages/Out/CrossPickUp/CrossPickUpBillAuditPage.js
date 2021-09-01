import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, Tabs, Modal, Tag, message, Form } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import UserSelect from '../PickUp/UserSelect';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';
import ContainerSelect from '@/pages/Component/Select/ContainerSelect';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { qtyStrToQty, toQtyStr, compare } from '@/utils/QpcStrUtil';
import { convertCodeName } from '@/utils/utils';
import { commonLocale, placeholderLocale, placeholderChooseLocale, notNullLocale } from '@/utils/CommonLocale';
import { loginUser } from '@/utils/LoginContext';
import { crossPickUpBillLocale } from './CrossPickUpBillLocale';
import styles from '../PickUp/PickUpBill.less';
import { CrossPickupBillState, PickType, OperateMethod, LogisticMode, CrossPickupDateType } from './CrossPickUpBillContants';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import Empty from '@/pages/Component/Form/Empty';
import { containerState } from '@/utils/ContainerState';
import { binUsage } from '@/utils/BinUsage';
import { havePermission } from '@/utils/authority';
import { billState } from '@/utils/BillState';
import { CROSSPICKUPBILL_RES } from './CrossPickUpBillPermission';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

@connect(({ crossPickUp, loading }) => ({
  crossPickUp,
  loading: loading.models.crossPickUp,
}))
@Form.create()
export default class PickUpBillAuditPage extends ViewPage {
  constructor(props) {
    super(props);
    this.state = {
      entity: {},
      items: [],
      entityUuid: props.crossPickUp.entityUuid,
      title: '',
      operate: '',
      visiblAudit: false,
      showContainerModal: false,
      noUpDown: true
    }
  }
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.crossPickUp.entity&&nextProps.crossPickUp.entity!=this.props.crossPickUp.entity) {
      let entity = nextProps.crossPickUp.entity;
      if (!entity.picker || (entity.picker && Object.keys(entity.picker).length === 0)) {
        entity.picker = {
          uuid: loginUser().uuid,
          code: loginUser().code,
          name: loginUser().name
        }
      }
      let items=[];

      // 根据指定条件分组--合并展示
      let groupItems  = this.groupBy(nextProps.crossPickUp.entity.items, function (item) {
        return [item.article.uuid,item.qpcStr,item.binCode,item.munit,item.containerBarcode,item.productDate,item.productionBatch];
      });

      
      for(let i = 0;i<groupItems.length;i++){
        items.push({
          ...groupItems[i][0],
          line: i+1
        });
      }

      entity.items=items;
      this.setState({
        entity: entity,
        items: items,
        title: crossPickUpBillLocale.title + '：' + nextProps.crossPickUp.entity.billNumber,
        entityUuid: nextProps.crossPickUp.entity.uuid,
      });
    }
  }

  /**
   * js 分组 根据指定条件分组--件数做和
   * @param {*} array 对象数组
   * @param {*} f 匿名函数 返回对象的某个指定属性的属性值并存放在数组中
   */
  groupBy(array, f) {
    const groups = {};
    array.forEach(function (i) {
      const group = JSON.stringify(f(i));
      groups[group] = groups[group] || [];
      groups[group].push(i);
    });

    return Object.keys(groups).map(function (group) {
      let qty = 0;
      let realQty = 0;

      for(let t = 0;t<groups[group].length;t++){
        qty = qty+groups[group][t].qty;
        realQty = realQty+groups[group][t].qty;
      }
      groups[group][0].qty = qty;
      groups[group][0].realQty = realQty;
      groups[group][0].qtyStr = toQtyStr(qty,groups[group][0].qpcStr);
      groups[group][0].realQtyStr = toQtyStr(realQty,groups[group][0].qpcStr);

      return groups[group];
    });
  }

  /**
  * 刷新
  */
  refresh() {
    const { entityUuid } = this.state;
    this.props.dispatch({
      type: 'crossPickUp/get',
      payload: {
        uuid: entityUuid
      }
    });
  }
  /**
  * 返回
  */
  onBack = () => {
    this.props.dispatch({
      type: 'crossPickUp/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  onView = () => {
    this.props.dispatch({
      type: 'crossPickUp/showPage',
      payload: {
        showPage: 'view',
        entityUuid: this.state.entityUuid
      }
    });
  }
  /**
   * 模态框显示/隐藏
   */
  handleAuditModal = (operate) => {
    if (operate) {
      this.setState({
        operate: operate
      })
    }
    this.setState({
      visiblAudit: !this.state.visiblAudit
    })
  }
  /**
   * 模态框确认操作
   */
  handleOk = () => {
    const { operate } = this.state;
    if (operate === commonLocale.saveLocale) {
      this.onSave();
    }
  }

  /**
   * 审核
   */
  onSave = () => {
    const { entity } = this.state
    let realItems = [];
    let items = entity.items;
    let flag = false;
    this.props.form.validateFields((errors, fieldsValue) => {
      if (errors) {
        this.handleAuditModal();
        return;
      }
      if (Array.isArray(items)) {
        for(let i=0;i<items.length;i++){
          let item=items[i];
          if (compare(item.realQtyStr, '0') < 0) {
            message.error('第' + item.line + '行数据实际件数不能小于0');
            this.handleAuditModal();
            return false;
          }
          if (compare(item.realQtyStr, item.qtyStr) > 0) {
            message.error('第' + item.line + '行实际件数不能大于件数');
            this.handleAuditModal();
            return false;
          }else if(compare(item.realQtyStr,0) == 0){
            item.targetContainerBarcode = '-';
          }

          if(!item.targetContainerBarcode){
            message.error('第' + item.line + '行目标容器不能为空');
            this.handleAuditModal();
            return false;
          }

          if(!item.targetBinCode){
            message.error('第' + item.line + '行目标货位不能为空');
            this.handleAuditModal();
            return false;
          }
        
          let obj = {
            articleUuid: item.article.uuid,
            binCode:item.binCode,
            qpcStr:item.qpcStr,
            targetContainerBarcode: item.targetContainerBarcode,
            qty: item.realQty,
            targetBinCode: item.targetBinCode
          };
          realItems.push(obj);
        }
      }
      this.props.dispatch({
        type: 'crossPickUp/modifyCrossPickUpBill',
        payload: {
          uuid: entity.uuid,
          version: entity.version,
          picker: entity.picker,
          items: realItems,
        },
        callback: response => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale)
            this.onView();
          }
        }
      })
      this.setState({
        visiblAudit: !this.state.visiblAudit
      })
    })
  }
  /**
   * 用户改变时
   */
  handleChangeUser = (value) => {
    const { entity } = this.state;
    entity.picker = JSON.parse(value);

    this.setState({
      entity: { ...entity },
    });
  }

  /**
   * 明细发生变化时调用
   */
  onFieldChange = (value, field, index) => {
    const { entity } = this.state;
    if (field === 'targetContainerBarcode') {
      entity.items[index - 1].targetContainerBarcode = value;
    } else if (field === 'realQtyStr') {
      entity.items[index - 1].realQtyStr = value;
      entity.items[index - 1].realQty = qtyStrToQty(value, entity.items[index - 1].qpcStr);
    } else if (field === 'targetBinCode') {
      entity.items[index - 1].targetBinCode = value;
    }

    this.setState({
      entity: { ...entity },
    });
  }
  /**
   * 绘制订单状态tag
   */
  drawStateTag = () => {
    if (this.state.entity.state) {
      return (
        <Tag color={billState[this.state.entity.state].color}>
          {billState[this.state.entity.state].caption}
        </Tag>
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
            this.state.entity.state === (CrossPickupBillState.APPROVED.name || CrossPickupBillState.SENDED.name || CrossPickupBillState.INPROGRESS.name) && this.state.entity.operateMethod === OperateMethod.MANUAL.name &&
            <Button type='primary' onClick={() => this.handleAuditModal(commonLocale.saveLocale)}>
              {commonLocale.saveLocale}
            </Button>
          }
        </Fragment>
      );
    }
  }
  onshowModal = (flag, selectedRowKeys) => {
    if (flag) {
      if (Array.isArray(selectedRowKeys) && selectedRowKeys.length === 0) {
        message.warn('请勾选，再进行批量操作');
        return;
      }
      this.setState({
        selectedRowKeys: selectedRowKeys,
        showContainerModal: true
      })
      return;
    }
    this.setState({
      showContainerModal: false,
      selectedRowKeys: []
    })
  }
  drawBatchButton = (selectedRowKeys) => {
    return <span style={{display:'inline-block', marginTop:'-23px'}}>
      {this.state.entity.pickType !== PickType.CONTAINER.name && <a onClick={() => this.onshowModal(true, selectedRowKeys)}
      >
        批量设置目标容器
      </a>}&nbsp; &nbsp;</span>
      ;
  }

  onOk = () => {
    this.props.form.validateFields(['container'], (errors, fieldsValue) => {
      if (errors) return;
      const entity = this.state.entity;
      let lines = this.state.selectedRowKeys;
      if (fieldsValue.container) {
        Array.isArray(lines) && lines.forEach(function (line) {
          entity.items[line - 1].targetContainerBarcode = fieldsValue.container
        });
      }
      this.setState({
        entity:{...entity},
      });
      this.onshowModal();
    })
  }

  /**
  * 绘制信息详情
  */
  drawPickUpBillBillInfoTab = () => {
    const { entity } = this.state;
    const items = entity.items;
    // 概要信息
    let profileItems = [
      {
        label: crossPickUpBillLocale.picker,
        value: <UserSelect value={JSON.stringify(entity.picker)}
          single placeholder={placeholderChooseLocale(crossPickUpBillLocale.picker)} />
      },
      {
        label: crossPickUpBillLocale.waveBillNumber,
        value: entity.waveBillNumber
      },
      {
        label: crossPickUpBillLocale.pickarea,
        value: convertCodeName(entity.pickarea)
      },
      {
        label: crossPickUpBillLocale.pickType,
        value: entity.pickType && PickType[entity.pickType].caption
      },
      {
        label: crossPickUpBillLocale.operateMethod,
        value: entity.operateMethod && OperateMethod[entity.operateMethod].caption
      },
      {
        label: crossPickUpBillLocale.crossPickupDateType,
        value: entity.crossPickupDateType && CrossPickupDateType[entity.crossPickupDateType].caption
      },
      {
        label: '物流模式',
        value: entity.logisticMode && LogisticMode[entity.logisticMode].caption
      },
      {
        label: '分拨中转位',
        value: entity.allocateTransferBin ? entity.allocateTransferBin : <Empty />
      },
      {
        label: commonLocale.noteLocale,
        value: entity.note ? entity.note : <Empty />
      }
    ];

    // 明细
    let pickUpItemCols = [
      {
        title: commonLocale.articleLocale,
        key: 'article',
        width: colWidth.codeNameColWidth,
        render: record => <EllipsisCol colValue={convertCodeName(record.article)} />
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        key: 'munit',
        width: itemColWidth.qpcStrColWidth,
        render: record => record.qpcStr + ' / ' + record.munit
      },
      {
        title: commonLocale.inQtyStrLocale,
        key: 'qtyStr',
        width: itemColWidth.qtyStrColWidth,
        dataIndex: 'qtyStr',
      },
      {
        title: crossPickUpBillLocale.realQtyStr,
        key: 'realQtyStr',
        width: itemColWidth.qtyStrEditColWidth,
        render: (text, record) => {
          if (entity.pickType === PickType.CONTAINER.name) {
            record.realQtyStr = record.qtyStr;
            record.realQty = record.qty;
            return record.realQtyStr;
          }
          return (
            <QtyStrInput
              value={record.realQtyStr}
              onChange={
                e => this.onFieldChange(e, 'realQtyStr', record.line)
              }
            />
          );
        }
      },
      {
        title: commonLocale.bincodeLocale,
        width: colWidth.codeColWidth,
        key: 'binCode',
        render: record => {
          return <span>[{record.binCode}]{record.binUsage ? binUsage[record.binUsage].caption : <Empty />}</span>
        }
      },
      {
        title: commonLocale.containerLocale,
        width: colWidth.codeColWidth,
        key: 'containerBarcode',
        dataIndex: 'containerBarcode'
      },
      {
        title: '批号',
        dataIndex: 'productionBatch',
        width: colWidth.enumColWidth,
        render: val => {
          return (
            <span>{val ? val : <Empty />}</span>
          );
        }
      },
      {
        title: '生产日期',
        dataIndex: 'productDate',
        width: colWidth.enumColWidth,
        render: val => {
          return (
            <span>{val ? moment(val).format('YYYY-MM-DD') : <Empty />}</span>
          );
        }
      },
      {
        title: '到效日期',
        dataIndex: 'validDate',
        width: colWidth.enumColWidth,
        render: val => {
          return (
            <span>{val ? moment(val).format('YYYY-MM-DD') : <Empty />}</span>
          );
        }
      },
      {
        title: crossPickUpBillLocale.targetContainerBarcode,
        key: 'targetContainerBarcode',
        width: itemColWidth.containerEditColWidth + 100,
        render: (text, record) => {
          // if (entity.pickType === PickType.CONTAINER.name) {
          //   record.targetContainerBarcode = record.containerBarcode;
          //   return record.targetContainerBarcode;
          // }
          return (
            <ContainerSelect
              onChange={
                e => this.onFieldChange(e, 'targetContainerBarcode', record.line)
              }
              state={containerState.IDLE.name}
              value={record.targetContainerBarcode}
              placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)} />
          );
        }
      },
      {
        title: crossPickUpBillLocale.targetBinCode,
        key: 'targetBinCode',
        width: itemColWidth.binCodeEditColWidth+100,
        render: (text, record) => {
          record.targetBinCode = entity.allocateTransferBin;
          return record.targetBinCode?record.targetBinCode:<Empty/>
        }
      },
      {
        title: commonLocale.noteLocale,
        key: 'note',
        dataIndex: 'note',
        width: itemColWidth.noteEditColWidth+100,
        render:val=>val?val:<Empty/>
      },
    ]
    let noteItems = [{
      value: entity.note
    }];
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    const { form: { getFieldDecorator } } = this.props;
    return (
      <TabPane className={styles.AuditSelect} key="basicInfo" tab={crossPickUpBillLocale.title}>
        <ViewTabPanel style={{marginTop: '-23px'}}>
        <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale}/>
        <ViewPanel title={commonLocale.itemsLocale}>
          <ItemEditTable
            columns={pickUpItemCols}
            data={this.state.items}
            scroll={{ x: 1800 }}
            drawBatchButton={this.drawBatchButton}
            noAddandDelete={true}
            notNote={true}
          />
        </ViewPanel>
        <div>
          <ConfirmModal
            visible={this.state.visiblAudit}
            operate={this.state.operate}
            object={crossPickUpBillLocale.title + ':' + this.state.entity.billNumber}
            onOk={this.handleOk}
            onCancel={this.handleAuditModal}
          />
          <Modal
            title={'批量设置'}
            visible={this.state.showContainerModal}
            onOk={this.onOk}
            onCancel={() => this.onshowModal()}
            destroyOnClose={true}>
            <Form {...formItemLayout}>
              {this.state.showContainerModal && <FormItem key='container' label={crossPickUpBillLocale.targetContainerBarcode}>
                {
                  getFieldDecorator('container', {
                    rules: [
                      { required: true, message: notNullLocale(crossPickUpBillLocale.targetContainerBarcode) }
                    ],
                  })(
                    <ContainerSelect state={containerState.IDLE.name}
                      placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)} />
                  )
                }
              </FormItem>}
            </Form >
          </Modal>
        </div>
        </ViewTabPanel>
      </TabPane>
    );
  }
  /**
  * 绘制Tab页
  */
  drawTabPanes = () => {
    let tabPanes = [
      this.drawPickUpBillBillInfoTab(),
    ];

    return tabPanes;
  }
}
