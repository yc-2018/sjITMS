import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Button, message, Modal, Select, Form } from 'antd';
import { commonLocale, placeholderChooseLocale, notNullLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { loginCompany, loginOrg, loginUser,getActiveKey} from '@/utils/LoginContext';
import { RplMode, RplType, PickType, getRplModeOptions } from '@/pages/Facility/PickArea/PickAreaContants';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import UserSelect from '@/pages/Component/Select/UserSelect';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import { State, StateColor, RplGenFrom, RplBillType, RplDateType } from './RplContants';
import RplSearchForm from './RplSearchForm';
import RplPrintModal from './RplPrintModal';
import { rplLocale } from './RplLocale';
import { RPL_RES } from './RplPermission';
import { colWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import Empty from '@/pages/Component/Form/Empty';
import OperateCol from '@/pages/Component/Form/OperateCol';
import configs from '@/utils/config';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { routerRedux } from 'dva/router';
import { WAVEBILL_RES } from '@/pages/Out/Wave/WaveBillPermission';
import { getQueryBillDays } from '@/utils/LoginContext';
const FormItem = Form.Item;
const Option = Select.Option;
@connect(({ rpl, loading }) => ({
  rpl,
  loading: loading.models.rpl,
}))
@Form.create()
export default class RplSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: rplLocale.title,
      data: props.rpl.data,
      record: {},
      visible: false,
      suspendLoading: false,
      key: 'rpl.search.table'
    };

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
  }

  componentDidMount() {
    if(this.props.rpl.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.rpl.data
    });
  }

  drawSearchPanel = () => {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    return <div>
      <RplSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} />
      <Modal
        title={commonLocale.batchAuditLocale}
        visible={this.state.visible}
        onOk={this.onOk}
        onCancel={() => this.handleModal()}
        destroyOnClose={true}>
        <Form {...formItemLayout}>
          <FormItem key='qtyStr' label={commonLocale.inQtyStrLocale}>
            {
              getFieldDecorator('qtyStr', {
                initialValue: 'ZERO',
                rules: [
                  { required: true, message: notNullLocale(commonLocale.inQtyStrLocale) }
                ],
              })(
                <Select>
                  <Select.Option key='ZERO' value='ZERO'>0</Select.Option>
                  <Select.Option key='QTYSTR' value='QTYSTR'>应补件数</Select.Option>
                </Select>
              )
            }
          </FormItem>
          <FormItem label={rplLocale.rpler} key='rpler'>
            {getFieldDecorator('rpler', {
              initialValue: JSON.stringify({ uuid: loginUser().uuid, code: loginUser().code, name: loginUser().name }),
              rules: [
                { required: true, message: notNullLocale(rplLocale.rpler) }
              ],
            })(<UserSelect single={true} />)}
          </FormItem>
        </Form >
      </Modal>
      <RplPrintModal
        visible={this.state.printVisible}
        handlePrintModal={this.handlePrintModal}
        onPrint={this.onPrint}
      />
    </div>
  }

  onOk = () => {
    this.props.form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      this.setState({
        fieldsValue: fieldsValue
      })
      this.handleModal();
      this.onBatchAudit();
    });
  }

  /**
   * 显示/隐藏提示框
   */
  handleModal = (flag) => {
    if (flag && this.state.selectedRows.length === 0) {
      message.warn(formatMessage({ id: 'common.progress.select.tips' }));
      return;
    }
    this.setState({
      visible: flag,
    })
    if (!flag) {
      this.props.form.resetFields();
    }
  }

  checkPrint = () => {
    let hasLocalPrint = true;
    try {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open("GET", "http://localhost:9092/socket.io/?EIO=3&transport=polling", false);
      xmlHttp.send(null);
    } catch (error) {
      hasLocalPrint = false;
    }

    if (hasLocalPrint) {
      return true;
    }

    Modal.confirm({
      content: <div>
        {!hasLocalPrint ? <p>没有安装或启动本地打印服务，点击<a href={window.location.origin + '/FinePrint_windows_4_0.exe'} target="_blank">下载安装</a></p> : ''}
        <p>安装完成后，点击确定</p>
      </div>,
      onOk: () => {
        this.handlePrintModal(true);
      }
    });

    return false;
  }

  /**
   * 显示/隐藏打印标签提示框
   */
  handlePrintModal = (flag) => {
    if (flag && this.state.selectedRows.length === 0) {
      message.warn(formatMessage({ id: 'common.progress.select.tips' }));
      return;
    }

    const checked = this.checkPrint();
    if (checked) {
      this.setState({
        printVisible: flag,
      })
    }
  }

  onPrint = (data) => {
    this.setState({
      printData: data
    })
    this.handlePrintModal();
    this.onBatchPrint();
  }

  drawToolbarPanel = () => {
    const { selectedRows } = this.state;
    const batchPrintParams = [];
    selectedRows.forEach(function (e) {
      batchPrintParams.push({
        billNumber: e.billNumber
      })
    });
    return [
      <Button key='onBatchEditMode'
              disabled={!havePermission(RPL_RES.MODIFYRPLMODE)}
              onClick={() => this.onBatchEditMode()}
      >
        批量修改补货方式
      </Button>,
      <Button key='onBatchAudit'
              disabled={!havePermission(RPL_RES.AUDIT)}
              onClick={() => this.handleModal(true)}
      >
        批量审核
      </Button>,
      <Button key='onBatchPrintLabel'
              disabled={!havePermission(RPL_RES.PRINTLABLE)}
              onClick={() => this.handlePrintModal(true)}
      >
        打印标签
      </Button>,
      <PrintButton
        key='printButton'
        reportParams={batchPrintParams}
        moduleId={PrintTemplateType.RPLBILL.name} />
    ];
  }

  /**
   * 批量审核
   */
  onHandleAudit = (record, batch) => {
    const that = this;
    const { dispatch } = this.props;

    return new Promise(function (resolve, reject) {
      let fieldsValue = that.state.fieldsValue;
      dispatch({
        type: 'rpl/batchAudit',
        payload: {
          uuid: record.uuid,
          version: record.version,
          rpler: JSON.parse(fieldsValue.rpler),
          rplQtyStr: fieldsValue.qtyStr
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
  printFR = (billNumbers) => {
    var reportlets = [];
    for (let i = 0; i < billNumbers.length; i++) {
      reportlets.push({
        reportlet: JSON.parse(this.state.printData.printTemplate).path,
        billNumber: billNumbers[i],
        userUuid: loginUser().uuid,
        userCode: loginUser().code,
        userName: loginUser().name,
        dcUuid: loginOrg().uuid,
        dcCode: loginOrg().code,
        dcName: loginOrg().name,
        companyUuid: loginCompany().uuid,
        companyCode: loginCompany().code,
        companyName: loginCompany().name
      })
    }
    var config = {
      printUrl: configs[API_ENV].RPORTER_SERVER,
      isPopUp: false, // 是否弹出设置窗口，true为弹出，false为不弹出
      data: {
        reportlets: reportlets // 需要打印的模板列表
      }
    };
    FR.doURLPrint(config);
  }
  onHandlePrint = (billNumbers, batch) => {
    this.printFR(billNumbers);
    const that = this;
    let printData = this.state.printData;
    this.props.dispatch({
      type: 'rpl/batchPrint',
      payload: {
        dcUuid: loginOrg().uuid,
        billNumbers: billNumbers,
        audit: printData.isAudit,
        rpler: {
          uuid: loginUser().uuid,
          code: loginUser().code,
          name: loginUser().name
        }
      },
      callback: (response) => {
        if (batch) {
          billNumbers.forEach(function (e) {
            that.batchCallback(response, e);
          })
          return;
        }
      }
    });
  }

  /**
   * 跳转到波次单详情页面
   */
  onWaveView = (record) => {
    this.props.dispatch({
      type: 'wave/getByNumber',
      payload: record.waveBillNumber,

      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/out/wave',
            payload: {
              showPage: 'view',
              entityUuid: response.data ? response.data.uuid : undefined
            }
          }));
        }
      }
    });
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
      confirmCaption: rplLocale.title,
      disabled: !havePermission(RPL_RES.AUDIT),
      onClick: this.onAudit.bind(this, record)
    }];
  }

  renderOperateCol = (record) => {
    if (State[record.state].name === State.APPROVED.name
      && record.rplMode === RplMode.MANUAL.name) {
      return <OperateCol menus={this.fetchOperatePropsTwo(record)} />
    } else {
      return <OperateCol menus={this.fetchOperatePropsOne(record)} />
    }
  }

  columns = [
    {
      title: commonLocale.billNumberLocal,
      dataIndex: 'billNumber',
      sorter: true,
      width: colWidth.billNumberColWidth,
      render: (val, record) => <a onClick={this.onView.bind(this, record)}>{val}</a>
    },
    {
      title: rplLocale.genFrom,
      dataIndex: 'genFrom',
      sorter: true,
      width: colWidth.enumColWidth,
      render: val => (
        <span>
          {RplGenFrom[val].caption}
        </span>
      )
    },
    {
      title: rplLocale.type,
      dataIndex: 'type',
      sorter: true,
      width: colWidth.enumColWidth,
      render: val => RplBillType[val].caption
    },
    {
      title: rplLocale.pickArea,
      dataIndex: 'pickarea',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: rplLocale.mode,
      dataIndex: 'rplMode',
      sorter: true,
      width: colWidth.enumColWidth,
      render: val => RplMode[val].caption
    },
    {
      title: '单据类型',
      dataIndex: 'rplDateType',
      sorter: true,
      width: colWidth.enumColWidth,
      render: val => RplDateType[val].caption
    },
    {
      title: rplLocale.rpler,
      dataIndex: 'rpler',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => { return val && val.uuid ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty /> }
    },
    {
      title: rplLocale.waveBillNumber,
      dataIndex: 'waveBillNumber',
      sorter: true,
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
      render: (val, record) => <BadgeUtil value={record.state} />,
      width: colWidth.enumColWidth
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.enumColWidth,
      render: record => (
        this.renderOperateCol(record)
      ),
    },
  ];

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

    let states = "";
    if (pageFilter && pageFilter.searchKeyValues && pageFilter.searchKeyValues.states && Array.isArray(pageFilter.searchKeyValues.states)) {
      states = pageFilter.searchKeyValues.states.join(",");
    } else {
      states = pageFilter.searchKeyValues.states
    }
    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    queryFilter.searchKeyValues.states = states;
    dispatch({
      type: 'rpl/query',
      payload: queryFilter,
    });
  };

  onSearch = (data) => {
    const { pageFilter } = this.state;
    pageFilter.page = 0;
    var days = '';
    if (data) {
      if (data.days) {
        days = data.days
      }
      let rplerUuid = undefined;
      let pickareaUuid = undefined;
      if (data.billNumber) {
        pageFilter.likeKeyValues = {
          ...pageFilter.likeKeyValues,
          billNumber: data.billNumber
        }
      } else {
        delete pageFilter.likeKeyValues.billNumber;
      }
      if (data.rpler) {
        rplerUuid = JSON.parse(data.rpler).uuid
      }
      if (data.pickarea) {
        pickareaUuid = JSON.parse(data.pickarea).uuid
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        rplerUuid: rplerUuid,
        pickareaUuid: pickareaUuid,
        days: days
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        days: getQueryBillDays()
      };
      pageFilter.likeKeyValues = {};
    }
    this.refreshTable();
  }

  /**
   * 跳转到详情页面
   */
  onView = (record) => {
    this.props.dispatch({
      type: 'rpl/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  /**
   * 跳转到审核页面
   */
  onAudit = (record) => {
    this.props.dispatch({
      type: 'rpl/showPage',
      payload: {
        showPage: 'audit',
        entityUuid: record.uuid
      }
    });
  }

  /**
   * 修改操作方式
   */
  onEditMode = (record, callback) => {
    const { info } = this.state;
    const { dispatch } = this.props;
    const that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'rpl/onEditMode',
        payload: {
          uuid: record.uuid,
          version: record.version
        },
        callback: (response) => {
          if (callback) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
        }
      })
    });
  };

  /**  批处理相关 开始  **/
  onBatchAudit = () => {
    this.setState({
      batchAction: commonLocale.auditLocale,
      content: undefined
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchEditMode = () => {
    this.setState({
      batchAction: '修改操作方式',
      content: '非手工单据的补货单将修改为手工单据，手工单据的将修改为原操作方式'
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }
  onBatchPrint = () => {
    this.setState({
      batchAction: '打印标签',
      content: undefined
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }
  onBatchProcess = () => {
    const { selectedRows, batchAction } = this.state;

    const that = this;
    if (batchAction === '打印标签') {
      let billNumbers = [];
      selectedRows.forEach(function (e) {
        if (e.rplMode === RplMode.LABEL.name || !e.rplMode) {
          if (!e.rplMode) {
            billNumbers.push(e);
          } else {
            billNumbers.push(e.billNumber);
          }
        } else {
          that.refs.batchHandle.calculateTaskSkipped();
        }
      })
      if (billNumbers.length > 0) {
        this.onHandlePrint(billNumbers, true);
      }
      return;
    }

    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === '修改操作方式') {
          if (selectedRows[i].state == State.APPROVED.name && !(selectedRows[i].rplMode === RplMode.MANUAL.name &&
            selectedRows[i].targetRplMode === RplMode.MANUAL.name)) {
            this.onEditMode(selectedRows[i], true).then(res => {
              bacth(i + 1)
            });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        } else if (batchAction === commonLocale.auditLocale) {
          if (selectedRows[i].state == State.APPROVED.name && selectedRows[i].rplMode === RplMode.MANUAL.name) {
            this.onHandleAudit(selectedRows[i], true).then(res => {
              bacth(i + 1)
            })
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
}
