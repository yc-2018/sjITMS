import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, Tabs, Modal, Tag, message, Form } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';
import UserSelect from './UserSelect';
import ContainerSelect from '@/pages/Component/Select/ContainerSelect';
import BinSelect from '@/pages/Component/Select/BinSelect';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { qtyStrToQty, add, toQtyStr, compare } from '@/utils/QpcStrUtil';
import { convertCodeName } from '@/utils/utils';
import { commonLocale, placeholderLocale, placeholderChooseLocale, notNullLocale } from '@/utils/CommonLocale';
import { sourceWay } from '@/utils/SourceWay';
import { loginCompany, loginOrg, loginUser,getActiveKey } from '@/utils/LoginContext';
import { pickUpBillLocale } from './PickUpBillLocale';
import styles from './PickUpBill.less';
import { PickupBillState, PickType, OperateMethod, PickupDateType } from './PickUpBillContants';
import { PICKUPBILL_RES } from './PickUpBillPermission';
import ItemEditTable from './ItemEditTable';
import Empty from '@/pages/Component/Form/Empty';
import { containerState } from '@/utils/ContainerState';
import { binUsage } from '@/utils/BinUsage';
import { havePermission } from '@/utils/authority';
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
@connect(({ pickup, loading }) => ({
  pickup,
  loading: loading.models.pickup,
}))
@Form.create()
export default class PickUpBillAuditPage extends ViewPage {
  constructor(props) {
    super(props);
    this.state = {
      entity: {},
      items: [],
      entityUuid: props.pickup.entityUuid,
      title: '',
      operate: '',
      visiblAudit: false,
      showBinCodeModal: false,
      showContainerModal: false,
      noUpDown: true
    }
  }
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.pickup.entity&&nextProps.pickup.entity!=this.props.pickup.entity) {
      let entity = nextProps.pickup.entity;
      if (!entity.picker || (entity.picker && Object.keys(entity.picker).length === 0)) {
        entity.picker = {
          uuid: loginUser().uuid,
          code: loginUser().code,
          name: loginUser().name
        }
      }
      let items=[];
      // 根据指定条件分组--合并展示
      // let groupItems  = this.groupBy(nextProps.pickup.entity.items, function (item) {
      //   return [item.article.uuid,item.qpcStr,item.binCode,item.munit,item.containerBarcode,item.productDate,item.productionBatch];
      // });
      //
      //
      // for(let i = 0;i<groupItems.length;i++){
      //   items.push({
      //     ...groupItems[i][0],
      //     line: i+1
      //   });
      // }
      items = nextProps.pickup.entity.items;
      entity.items=items;
      this.setState({
        entity: entity,
        items: items,
        title: pickUpBillLocale.title + '：' + nextProps.pickup.entity.billNumber,
        entityUuid: nextProps.pickup.entity.uuid,
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
      type: 'pickup/get',
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
      type: 'pickup/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  onView = () => {
    this.props.dispatch({
      type: 'pickup/showPage',
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
          }
          if (compare(item.realQtyStr, '0') > 0) {
            if(!item.targetContainerBarcode){
              item.targetContainerBarcode='-';
            }
            if (!item.targetBinCode) {
              message.error('第' + item.line + '行目标货位不能为空');
              this.handleAuditModal();
              return false;
            }
          } else {
            item.realQty = 0;
            item.targetBinCode = '-';
            item.targetContainerBarcode = '-';
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
        type: 'pickup/modifyPickUpBill',
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
        <Tag color={PickupBillState[this.state.entity.state].color}>
          {PickupBillState[this.state.entity.state].caption}
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
            this.state.entity.state === (PickupBillState.APPROVED.name || PickupBillState.SENDED.name || PickupBillState.INPROGRESS.name) && this.state.entity.operateMethod === OperateMethod.MANUAL.name &&
            <Button type='primary' onClick={() => this.handleAuditModal(commonLocale.saveLocale)}>
              {commonLocale.saveLocale}
            </Button>
          }
        </Fragment>
      );
    }
  }
  onshowModal = (flag, param, selectedRowKeys) => {
    if (flag) {
      if (Array.isArray(selectedRowKeys) && selectedRowKeys.length === 0) {
        message.warn('请勾选，再进行批量操作');
        return;
      }
      this.setState({
        selectedRowKeys: selectedRowKeys
      })
      if (param === 'bin') {
        this.setState({
          showBinCodeModal: true
        })
      }
      if (param === 'container') {
        this.setState({
          showContainerModal: true
        })
      }
      return;
    }
    this.setState({
      showContainerModal: false,
      showBinCodeModal: false,
      selectedRowKeys: []
    })
  }
  drawBatchButton = (selectedRowKeys) => {
    return <span style={{display:'inline-block', marginTop:'-23px'}}>
      {this.state.entity.pickType !== PickType.CONTAINER.name && <a onClick={() => this.onshowModal(true, 'container', selectedRowKeys)}
      >
        批量设置目标容器
      </a>}&nbsp; &nbsp;
       <a onClick={() => this.onshowModal(true, 'bin', selectedRowKeys)}
      >
        批量设置目标货位
      </a></span>
      ;
  }

  onOk = () => {
    this.props.form.validateFields(['bin', 'container'], (errors, fieldsValue) => {
      if (errors) return;
      const entity = this.state.entity;
      let lines = this.state.selectedRowKeys;
      if (fieldsValue.bin) {
        Array.isArray(lines) && lines.forEach(function (line) {
          entity.items[line - 1].targetBinCode = fieldsValue.bin;
        })
      } else if (fieldsValue.container) {
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
        label: pickUpBillLocale.picker,
        value: <UserSelect value={JSON.stringify(entity.picker)}
          single placeholder={placeholderChooseLocale(pickUpBillLocale.picker)} />
      },
      {
        label: commonLocale.ownerLocale,
        value: convertCodeName(entity.owner)
      },
      {
        label: commonLocale.inStoreLocale,
        value: convertCodeName(entity.store)
      },
      {
        label: pickUpBillLocale.pickarea,
        value: convertCodeName(entity.pickarea)
      },
      {
        label: pickUpBillLocale.pickType,
        value: entity.pickType && PickType[entity.pickType].caption
      },
      {
        label: pickUpBillLocale.operateMethod,
        value: entity.operateMethod && OperateMethod[entity.operateMethod].caption
      },
      {
        label: pickUpBillLocale.pickupDateType,
        value: entity.pickupDateType && PickupDateType[entity.pickupDateType].caption
      },
      {
        label: pickUpBillLocale.waveBillNumber,
        value: entity.waveBillNumber
      },
      {
        label: '集货位',
        value: entity.collectBin ? entity.collectBin : <Empty />
      },
      {
        label: '统配集货暂存位',
        value: entity.collectTempBin ? entity.collectTempBin : <Empty />
      },
      {
        label: '备注',
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
        title: pickUpBillLocale.realQtyStr,
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
        title: pickUpBillLocale.targetContainerBarcode,
        key: 'targetContainerBarcode',
        width: itemColWidth.containerEditColWidth + 100,
        render: (text, record) => {
          if (entity.pickType === PickType.CONTAINER.name) {
            record.targetContainerBarcode = record.containerBarcode;
            return record.targetContainerBarcode;
          }
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
        title: pickUpBillLocale.targetBinCode,
        key: 'targetBinCode',
        width: itemColWidth.binCodeEditColWidth+100,
        render: (text, record) => {
          return (
            <BinSelect
              extra={entity.pickType== PickType.CONTAINER.name?undefined:entity.collectTempBin}
              usage={binUsage.CollectBin.name}
              value={record.targetBinCode}
              onChange={e => this.onFieldChange(e, 'targetBinCode', record.line)}
              placeholder={placeholderLocale(pickUpBillLocale.targetBinCode)}
            /> 
          );
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
      label: commonLocale.noteLocale,
      value: entity.note
    }];
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    const { form: { getFieldDecorator } } = this.props;
    return (
      <TabPane className={styles.AuditSelect} key="basicInfo" tab={pickUpBillLocale.title}>
        <ViewTabPanel style={{marginTop: '-23px'}}>
        <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale}/>
        <ViewPanel title={commonLocale.itemsLocale}>
          <ItemEditTable
            columns={pickUpItemCols}
            data={this.state.items}
            drawBatchButton={this.drawBatchButton}
            noAddandDelete={true}
            notNote={true}
          />
        </ViewPanel>
        <div>
          <ConfirmModal
            visible={this.state.visiblAudit}
            operate={this.state.operate}
            object={pickUpBillLocale.title + ':' + this.state.entity.billNumber}
            onOk={this.handleOk}
            onCancel={this.handleAuditModal}
          />
          <Modal
            title={'批量设置'}
            visible={this.state.showBinCodeModal || this.state.showContainerModal}
            onOk={this.onOk}
            onCancel={() => this.onshowModal()}
            destroyOnClose={true}>
            <Form {...formItemLayout}>
              {this.state.showBinCodeModal && <FormItem key='bin' label={pickUpBillLocale.targetBinCode}>
                {
                  getFieldDecorator('bin', {
                    rules: [
                      { required: true, message: notNullLocale(pickUpBillLocale.targetBinCode) }
                    ],
                  })(
                    <BinSelect extra={entity.collectTempBin} usage={binUsage.CollectBin.name}
                      placeholder={placeholderChooseLocale(pickUpBillLocale.targetBinCode)}
                    />
                  )
                }
              </FormItem>}
              {this.state.showContainerModal && <FormItem key='container' label={pickUpBillLocale.targetContainerBarcode}>
                {
                  getFieldDecorator('container', {
                    rules: [
                      { required: true, message: notNullLocale(pickUpBillLocale.targetContainerBarcode) }
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
