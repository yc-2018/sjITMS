import { Fragment } from 'react';
import { connect } from 'dva';
import { Form, Button, message } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { waveBillLocale } from './WaveBillLocale';
import { WAVEBILL_RES } from './WaveBillPermission';
import { WaveBillState, WaveType, StockAllocateType } from './WaveBillContants';
import WaveBillSearchForm from './WaveBillSearchForm';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { getActiveKey } from '@/utils/LoginContext';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
import { getQueryBillDays } from '@/utils/LoginContext';
@connect(({ wave, loading }) => ({
  wave,
  loading: loading.models.wave,
}))
@Form.create()
export default class WaveBillSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: waveBillLocale.title,
      data: props.wave.data,
      selectedRows: [],
      record: {},
      entityUuid: '',
      suspendLoading: false,
      key: 'waveBill.search.table'
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
  }

  componentDidMount() {
    if(this.props.wave.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.wave.data
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
    dispatch({
      type: 'wave/query',
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
      if (data.days) {
        days = data.days
      }
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        ...data,
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
   * 显示新建/编辑界面
   */
  onCreate = (uuid, billNumber) => {
    const payload = {
      showPage: 'create'
    }
    if (uuid != '') {
      payload.entityUuid = uuid;
      payload.waveBillNumber = billNumber;
    }
    this.props.dispatch({
      type: 'wave/showPage',
      payload: {
        ...payload
      }
    });
  }
  /**
   * 显示波次类型管理界面
   */
  onShowTypeView = () => {
    let { dispatch } = this.props;
    dispatch({
      type: 'wave/onShowTypeView',
    });
  }

  /**
   * 批量删除
   */
  onBatchRemove = () => {
    this.setState({
      batchAction: commonLocale.deleteLocale
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  // 批量操作
  onBatchProcess = () => {
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === commonLocale.deleteLocale) {
          if (selectedRows[i].state == WaveBillState.SAVED.name) {
            this.onRemove(selectedRows[i], true).then(res => {
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

  /**
   * 单一删除
   */
  onRemove = (record, batch) => {
    const { dispatch } = this.props;
    const that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'wave/onRemove',
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
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.removeSuccessLocale)
          }
        }
      })
    })
  }

  /**
   * 查看详情
   */
  onView = (record) => {
    this.props.dispatch({
      type: 'wave/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid,
        billNumber: record.billNumber,
        waveBillNumber: record.billNumber,
        state: record.state
      }
    });
  }

  /**
   * 完成 订单
   */
  onFinish = (record) => {
    this.props.dispatch({
      type: 'wave/showPage',
      payload: {
        showPage: 'finish',
        entityUuid: record.uuid,
        waveBillNumber: record.billNumber,
        state: record.state
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
      name: commonLocale.editLocale,
      disabled: !havePermission(WAVEBILL_RES.EDIT),
      onClick: this.onCreate.bind(this, record.uuid, record.billNumber)
    }, {
      name: commonLocale.deleteLocale,
      confirm: true,
      confirmCaption: waveBillLocale.title,
      disabled: !havePermission(WAVEBILL_RES.DELETE),
      onClick: this.onRemove.bind(this, record, false)
    }];
  }

  fetchOperatePropsThr = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.finishLocale,
      disabled: !havePermission(WAVEBILL_RES.FINISH),
      onClick: this.onFinish.bind(this, record)
    }];
  }


  renderOperateCol = (record) => {

    if (WaveBillState[record.state].name == 'INPROGRESS' &&
      (record.waveType == WaveType.ONESTEPCROSS.name || record.waveType == WaveType.TWOSTEPCROSS.name)) {
      return <OperateCol menus={this.fetchOperatePropsThr(record)} />
    } else if (WaveBillState[record.state].name == 'SAVED') {
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
        <a onClick={this.onView.bind(this, record)}>{record.billNumber}</a>
    },
    {
      title: commonLocale.inWaveTypeLocale,
      dataIndex: 'waveType',
      width: colWidth.enumColWidth,
      sorter: true,
      render: val => WaveType[val].caption
    },
    {
      title: waveBillLocale.pickOrderScheme,
      dataIndex: 'pickOrderScheme',
      width: colWidth.codeNameColWidth,
      sorter: true,
      render: val => val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />
    },
    {
      title: waveBillLocale.stockAllocateType,
      dataIndex: 'stockAllocateType',
      width: colWidth.enumColWidth,
      sorter: true,
      render: val => val ? StockAllocateType[val].caption : <Empty />
    },
    {
      title: waveBillLocale.stockAllocateScheme,
      dataIndex: 'stockAllocateScheme',
      sorter: true,
      width: colWidth.codeNameColWidth + 10,
      render: val => val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />
    },
    {
      title: waveBillLocale.collectBinMgrScheme,
      dataIndex: 'collectBinMgrScheme',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: waveBillLocale.type,
      dataIndex: 'type',
      width: colWidth.enumColWidth,
      sorter: true,
      render: val => <EllipsisCol colValue={val} />
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
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    const menus = [];
    menus.push({
      name: waveBillLocale.waveType,
      onClick: this.onShowTypeView
    });
    return (
      <Fragment>
        <Button icon="plus" type="primary" onClick={this.onCreate.bind(this, '')}
                disabled={!havePermission(WAVEBILL_RES.CREATE)}
        >
          {commonLocale.createLocale}
        </Button>
        <SearchMoreAction menus={menus}/>
      </Fragment>
    )
  }

  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel() {
    return [
      <Button key={1} onClick={() => this.onBatchRemove()}
              disabled={!havePermission(WAVEBILL_RES.DELETE)}
      >
        {commonLocale.batchRemoveLocale}
      </Button>,
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
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    return (
      <div>
        <WaveBillSearchForm
          filterValue={this.state.pageFilter.searchKeyValues}
          refresh={this.onSearch}
          toggleCallback={this.toggleCallback}
        />
      </div>
    );
  }
}
