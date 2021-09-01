import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Form, Button, message } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import { commonLocale } from '@/utils/CommonLocale';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth } from '@/utils/ColWidth';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { CrossPickupBillState, PickType, OperateMethod, CrossPickupDateType } from './CrossPickUpBillContants';
import { crossPickUpBillLocale } from './CrossPickUpBillLocale';
import CrossPickUpBillSearchForm from './CrossPickUpBillSearchForm';
import ModifyPickerModal from '@/pages/Out/PickUp/ModifyPickerModal';
import Empty from '@/pages/Component/Form/Empty';
import OperateCol from '@/pages/Component/Form/OperateCol';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { routerRedux } from 'dva/router';
import { WAVEBILL_RES } from '@/pages/Out/Wave/WaveBillPermission';
import { CROSSPICKUPBILL_RES } from './CrossPickUpBillPermission';
import { getQueryBillDays } from '@/utils/LoginContext';

const FormItem = Form.Item;
@connect(({ crossPickUp, loading }) => ({
  crossPickUp,
  loading: loading.models.crossPickUp,
}))
@Form.create()
export default class CrossPickUpBillSearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: crossPickUpBillLocale.title,
      data: props.crossPickUp.data,
      selectedRows: [],
      modifyPickerVisible: false,//控制修改拣货员弹窗的显示
      record: {},
      entityUuid: '',
      auditVisible: false,//控制批量审核弹窗的显示
      suspendLoading: false,
      key: 'crossPickUpBill.search.table'
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
  }

  componentDidMount() {
    if(this.props.crossPickUp.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.crossPickUp.data&&nextProps.crossPickUp.data!=this.props.crossPickUp.data){
      this.setState({
        data: nextProps.crossPickUp.data
      });
    }
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
      type: 'crossPickUp/query',
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
      let pickerUuid = undefined;
      if (data.pickarea) {
        pickareaUuid = JSON.parse(data.pickarea).uuid
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

  onBatchModifyOperate = () => {
    this.setState({
      batchAction: crossPickUpBillLocale.modifyOperate,
      content: '非手工单据的拣货单将修改为手工单据，手工单据的将修改为原操作方式'
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  /**
   * 批量修改拣货员
   */
  onBatchModifyPicker = () => {
    this.setState({
      batchAction: '修改拣货员',
      content: undefined
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  /**
   * 批量操作功能
   */
  onBatchProcess = () => {
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === crossPickUpBillLocale.modifyOperate) {
          if (selectedRows[i].state == (CrossPickupBillState.APPROVED.name || CrossPickupBillState.SENDED.name ||
            CrossPickupBillState.INPROGRESS.name)) {
            this.onModifyOperate(selectedRows[i], true).then(res => {
              bacth(i + 1)
            });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        } else if (batchAction === '修改拣货员') {
          if ((selectedRows[i].state === CrossPickupBillState.APPROVED.name || selectedRows[i].state === CrossPickupBillState.INPROGRESS.name)
            && (selectedRows[i].operateMethod === OperateMethod.RF.name||selectedRows[i].operateMethod === OperateMethod.MANUAL.name)) {
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

  /**
   * 确认修改操作人
   */
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
      type: 'crossPickUp/showPage',
      payload: {
        showPage: 'audit',
        entityUuid: entity.uuid,
      }
    });
  }

  /**
   * 单一修改修改拣货人
   */
  onHandleModifyPicker = (record, batch) => {
    const { dispatch } = this.props;
    const that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'crossPickUp/modifyPicker',
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
        type: 'crossPickUp/modifyOperateMethod',
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
      type: 'crossPickUp/showPage',
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
        waveBillNumber: record.waveBillNumber
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
      confirmCaption: crossPickUpBillLocale.title,
      disabled: !havePermission(CROSSPICKUPBILL_RES.AUDIT),
      onClick: this.onAudit.bind(this, record)
    }];
  }

  renderOperateCol = (record) => {
    if (CrossPickupBillState[record.state].name == 'APPROVED'
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
      title: crossPickUpBillLocale.pickType,
      dataIndex: 'pickType',
      sorter: true,
      width: colWidth.enumColWidth,
      render: val => val?PickType[val].caption:<Empty/>
    },
    {

      title: crossPickUpBillLocale.crossPickupDateType,
      dataIndex: 'crossPickupDateType',
      sorter: true,
      width: colWidth.enumColWidth,
      render: val => val?CrossPickupDateType[val].caption:<Empty/>
    },
    {
      title: crossPickUpBillLocale.pickarea,
      dataIndex: 'pickarea',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => !val ? <Empty /> : <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: crossPickUpBillLocale.operateMethod,
      dataIndex: 'operateMethod',
      sorter: true,
      width: colWidth.enumColWidth,
      render: val => val?OperateMethod[val].caption:<Empty/>
    },
    {
      title: crossPickUpBillLocale.picker,
      dataIndex: 'picker',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => { return val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty /> }
    },
    {
      title: crossPickUpBillLocale.waveBillNumber,
      dataIndex: 'waveBillNumber',
      sorter: true,
      width: colWidth.billNumberColWidth,
      render: (val, record) => {
        return val ? <span>
          <a onClick={this.onWaveView.bind(this, record)}
            // disabled={!havePermission(WAVEBILL_RES.VIEW)}
          >{val}</a>
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
              disabled={!havePermission(CROSSPICKUPBILL_RES.MODIFYOPERATEMETHOD)}
      >
        {crossPickUpBillLocale.batchModifyOperate}
      </Button>,
      <Button key={2} onClick={() => this.handleModifyPickerModal(true)}
              disabled={!havePermission(CROSSPICKUPBILL_RES.MODIFYPICKDER)}
      >
        {commonLocale.batchModifyLocale}{crossPickUpBillLocale.picker}
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
        <CrossPickUpBillSearchForm
          filterValue={this.state.pageFilter.searchKeyValues}
          refresh={this.onSearch} toggleCallback={this.toggleCallback}
        />
        <ModifyPickerModal
          title={'批量修改拣货员'}
          visible={this.state.modifyPickerVisible}
          modifyPicker={this.onModifyPicker}
          handleModal={() => this.handleModifyPickerModal()}
        />
      </div>
    );
  }
}
