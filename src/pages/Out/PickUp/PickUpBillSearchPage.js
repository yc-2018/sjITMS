import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Form, Button, Modal, message, Col, Select } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import UserSelect from '@/pages/Component/Select/UserSelect';
import { commonLocale, placeholderLocale, placeholderChooseLocale, notNullLocale } from '@/utils/CommonLocale';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { loginOrg, loginCompany, loginUser, getActiveKey } from '@/utils/LoginContext';
import { PickupBillState, PickType, OperateMethod, PickupDateType } from './PickUpBillContants';
import { pickUpBillLocale } from './PickUpBillLocale';
import { PICKUPBILL_RES } from './PickUpBillPermission';
import PickUpBillSearchForm from './PickUpBillSearchForm';
import ModifyPickerModal from './ModifyPickerModal';
import Empty from '@/pages/Component/Form/Empty';
import OperateCol from '@/pages/Component/Form/OperateCol';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { routerRedux } from 'dva/router';
import { WAVEBILL_RES } from '@/pages/Out/Wave/WaveBillPermission';
import { getQueryBillDays } from '@/utils/LoginContext';
const FormItem = Form.Item;
@connect(({ pickup, loading }) => ({
  pickup,
  loading: loading.models.pickup,
}))
@Form.create()
export default class PickUpBillSearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: pickUpBillLocale.title,
      data: props.pickup.data,
      selectedRows: [],
      modifyPickerVisible: false,//控制修改拣货员弹窗的显示
      record: {},
      entityUuid: '',
      auditVisible: false,//控制批量审核弹窗的显示
      suspendLoading: false,
      key: 'pickUpBill.search.table'
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
  }

  componentDidMount() {
    if(this.props.pickup.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.pickup.data
    });
  }

  /**
   * 刷新/重置
   */
  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: []
      });
      if(pageFilter.searchKeyValues && !pageFilter.searchKeyValues.days) {
        pageFilter.searchKeyValues.days = getQueryBillDays()
      }
    }

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    dispatch({
      type: 'pickup/query',
      payload: queryFilter,
    });
  };
  /**
   * 搜索
   */
  onSearch = (data) => {
    const {
      pageFilter
    } = this.state;
    pageFilter.page = 0;
    var days = '';
    if (data) {
      let pickareaUuid = undefined;
      let storeUuid = undefined;
      let pickerUuid = undefined;
      if (data.pickarea) {
        pickareaUuid = JSON.parse(data.pickarea).uuid
      }

      if (data.store) {
        storeUuid = JSON.parse(data.store).uuid
      }

      if (data.picker) {
        pickerUuid = JSON.parse(data.picker).uuid
      }

      if (data.days) {
        days = data.days
      }

      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        pickareaUuid: pickareaUuid,
        storeUuid: storeUuid,
        pickerUuid: pickerUuid,
        days: days
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        days: getQueryBillDays()
      }
    }
    this.refreshTable();

  }

  /**
   * 显示/隐藏提示框
   */
  handleModifyPickerModal = (flag) => {
    if (flag && this.state.selectedRows.length === 0) {
      message.warn(formatMessage({ id: 'common.progress.select.tips' }));
      return;
    }
    this.setState({
      modifyPickerVisible: flag,
    })
  }

  /**
   * 显示/隐藏提示框
   */
  handleAuditModal = (flag) => {
    if (flag && this.state.selectedRows.length === 0) {
      message.warn(formatMessage({ id: 'common.progress.select.tips' }));
      return;
    }
    this.setState({
      auditVisible: flag,
    })
  }

  /**  批处理相关 开始  **/
  onBatchAudit = () => {
    this.setState({
      batchAction: commonLocale.auditLocale,
      content: undefined
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchModifyOperate = () => {
    this.setState({
      batchAction: pickUpBillLocale.modifyOperate,
      content: '非手工单据的拣货单将修改为手工单据，手工单据的将修改为原操作方式'
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchModifyPicker = () => {
    this.setState({
      batchAction: '修改拣货员',
      content: undefined
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }
  onBatchProcess = () => {
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === pickUpBillLocale.modifyOperate) {
          if (selectedRows[i].state == (PickupBillState.APPROVED.name || PickupBillState.SENDED.name ||
            PickupBillState.INPROGRESS.name)) {
            this.onModifyOperate(selectedRows[i], true).then(res => {
              bacth(i + 1)
            });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        } else if (batchAction === commonLocale.auditLocale) {
          if (selectedRows[i].state == (PickupBillState.APPROVED.name || PickupBillState.SENDED.name ||
            PickupBillState.INPROGRESS.name) && selectedRows[i].operateMethod === OperateMethod.MANUAL.name) {
            this.onHandleAudit(selectedRows[i], true).then(res => {
              bacth(i + 1)
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        } else if (batchAction === '修改拣货员') {
          if ((selectedRows[i].state === PickupBillState.APPROVED.name || selectedRows[i].state === PickupBillState.INPROGRESS.name)
            && selectedRows[i].operateMethod === OperateMethod.RF.name) {
            this.onHandleModifyPicker(selectedRows[i], true).then(res => {
              bacth(i + 1)
            });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        }
      } else {
        this.setState({
          suspendLoading: false
        })
      }
    }

    bacth(0);
  }
  /**  批处理相关 结束  **/

  onOk = () => {
    this.props.form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      this.setState({
        fieldsValue: fieldsValue
      })
      this.handleAuditModal();
      this.onBatchAudit();
    });
  }

  onModifyPicker = (data) => {
    this.setState({
      picker: data.picker
    })
    this.handleModifyPickerModal();
    this.onBatchModifyPicker();
  }

  /**
   * 审核
   */
  onAudit = (entity) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'pickup/showPage',
      payload: {
        showPage: 'audit',
        entityUuid: entity.uuid,
      }
    });
  }

  /**
   * 批量审核
   */
  onHandleAudit = (record, batch) => {
    let fieldsValue = this.state.fieldsValue;
    const { dispatch } = this.props;
    const that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'pickup/batchAudit',
        payload: {
          uuid: record.uuid,
          version: record.version,
          picker: JSON.parse(fieldsValue.picker),
          pickQty: fieldsValue.qty
        },
        callback: (response) => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
        }
      });
    });
  }

  /**
   * 修改拣货人
   */
  onHandleModifyPicker = (record, batch) => {
    const { dispatch } = this.props;
    const that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'pickup/modifyPicker',
        payload: {
          uuid: record.uuid,
          version: record.version,
          picker: that.state.picker,
        },
        callback: (response) => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
        }
      });
    });
  }

  /**
   * 单一修改操作方式
   */
  onModifyOperate = (record, batch) => {
    const { dispatch } = this.props;
    const that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'pickup/modifyOperate',
        payload: {
          uuid: record.uuid,
          version: record.version
        },
        callback: (response) => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
        }
      });
    });
  }
  /**
   * 查看详情
   */
  onView = (record) => {
    this.props.dispatch({
      type: 'pickup/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  /**
   * 跳转到波次单详情页面
   */
  onWaveView = (record) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/out/wave',
      payload: {
        showPage: 'view',
        waveBillNumber: record.waveBillNumber,
        billNumber: record.waveBillNumber
      }
    }));
  }

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }];
  }

  fetchOperatePropsTwo = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.auditLocale,
      confirm: true,
      confirmCaption: pickUpBillLocale.title,
      disabled: !havePermission(PICKUPBILL_RES.AUDIT),
      onClick: this.onAudit.bind(this, record)
    }];
  }

  renderOperateCol = (record) => {
    if (PickupBillState[record.state].name == 'APPROVED'
      && (OperateMethod[record.operateMethod].name == 'MANUAL' ||
        OperateMethod[record.operateMethod].name == 'PRINTLABEL')) {
      return <OperateCol menus={this.fetchOperatePropsTwo(record)} />
    } else {
      return <OperateCol menus={this.fetchOperatePropsOne(record)} />
    }
  }

  /**
   * 表格列
   */
  columns = [
    {
      title: commonLocale.billNumberLocal,
      sorter: true,
      dataIndex: 'billNumber',
      width: colWidth.billNumberColWidth,
      render: (val, record) =>
        <span>
          <a onClick={this.onView.bind(this, record)}>{record.billNumber}</a>
        </span>
    },
    {
      title: commonLocale.inStoreLocale,
      sorter: true,
      dataIndex: 'store',
      width: colWidth.codeNameColWidth,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: pickUpBillLocale.pickType,
      dataIndex: 'pickType',
      sorter: true,
      width: colWidth.enumColWidth,
      render: val => PickType[val].caption
    },
    {
      title: pickUpBillLocale.pickarea,
      dataIndex: 'pickarea',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => !val ? <Empty /> : <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: pickUpBillLocale.operateMethod,
      dataIndex: 'operateMethod',
      sorter: true,
      width: colWidth.enumColWidth,
      render: val => OperateMethod[val].caption
    },
    {
      title: pickUpBillLocale.pickupDateType,
      dataIndex: 'pickupDateType',
      sorter: true,
      width: colWidth.enumColWidth,
      render: val => val?PickupDateType[val].caption:<Empty/>
    },
    {
      title: pickUpBillLocale.picker,
      dataIndex: 'picker',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => { return val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty /> }
    },
    {
      title: pickUpBillLocale.waveBillNumber,
      sorter: true,
      dataIndex: 'waveBillNumber',
      width: colWidth.billNumberColWidth,
      render: (val, record) => {
        return val ? <span>
          <a onClick={this.onWaveView.bind(this, record)}
             disabled={!havePermission(WAVEBILL_RES.VIEW)}>{val}</a>
        </span> : <Empty />;
      }
    },
    {
      title: commonLocale.stateLocale,
      dataIndex: 'state',
      sorter: true,
      width: colWidth.enumColWidth,
      render: (val, record) => <BadgeUtil value={record.state} />
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: record => (
        this.renderOperateCol(record)
      ),
    },
  ];

  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel() {
    const { selectedRows } = this.state;
    const batchPrintParams = [];
    selectedRows.forEach(function (e) {
      batchPrintParams.push({
        billNumber: e.billNumber
      })
    });
    return [
      <Button key={1} onClick={() => this.onBatchModifyOperate()}
              disabled={!havePermission(PICKUPBILL_RES.MODIFYOPERATEMETHOD)}
      >
        {pickUpBillLocale.batchModifyOperate}
      </Button>,
      <Button key={2} onClick={() => this.handleModifyPickerModal(true)}
              disabled={!havePermission(PICKUPBILL_RES.MODIFYPICKDER)}
      >
        {commonLocale.batchModifyLocale}{pickUpBillLocale.picker}
      </Button>,
      <Button key={3} onClick={() => this.handleAuditModal(true)}
              disabled={!havePermission(PICKUPBILL_RES.AUDIT)}
      >
        {commonLocale.batchAuditLocale}
      </Button>,
      <PrintButton
        key='printButton'
        reportParams={batchPrintParams}
        moduleId={PrintTemplateType.PICKUPBILL.name} />
    ];
  }

  /**
   * 绘制搜索表格
   */
  drawSearchPanel = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };

    return (
      <div>
        <PickUpBillSearchForm
          filterValue={this.state.pageFilter.searchKeyValues}
          refresh={this.onSearch} toggleCallback={this.toggleCallback}
        />
        <ModifyPickerModal
          title={'批量修改拣货员'}
          visible={this.state.modifyPickerVisible}
          modifyPicker={this.onModifyPicker}
          handleModal={() => this.handleModifyPickerModal()}
        />
        <Modal
          title={commonLocale.batchAuditLocale}
          visible={this.state.auditVisible}
          onOk={this.onOk}
          onCancel={() => this.handleAuditModal()}
          destroyOnClose={true}>
          <Form {...formItemLayout}>
            <FormItem key='qty' label={commonLocale.inQtyStrLocale}>
              {
                getFieldDecorator('qty', {
                  initialValue: 'ZERO',
                  rules: [
                    { required: true, message: notNullLocale(commonLocale.inQtyStrLocale) }
                  ],
                })(
                  <Select>
                    <Select.Option key='ZERO' value='ZERO'>0</Select.Option>
                    <Select.Option key='REALQTY' value='REALQTY'>{pickUpBillLocale.qtyStr}</Select.Option>
                  </Select>
                )
              }
            </FormItem>
            <FormItem label={pickUpBillLocale.picker} key='picker'>
              {getFieldDecorator('picker', {
                initialValue: JSON.stringify({ uuid: loginUser().uuid, code: loginUser().code, name: loginUser().name }),
                rules: [
                  { required: true, message: notNullLocale(pickUpBillLocale.picker) }
                ],
              })(<UserSelect autoFocus single={true} />)}
            </FormItem>
            <FormItem key='targetContainerBarcode' label={pickUpBillLocale.targetContainerBarcode}>
              {getFieldDecorator('targetContainerBarcode')(
                <Col>-</Col>
              )}
            </FormItem>
          </Form >
        </Modal>
      </div>
    );
  }
}
