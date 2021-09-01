import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, Modal, Divider, message, Tabs, Collapse, Checkbox, Row, Col } from 'antd';

import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import InWrhBillSearchForm from './InWrhBillSearchForm';
import { LogisticMode, State } from './InWrhBillContants';
import { inWrhBillLocale } from './InWrhBillLocale';
import OperateCol from './OperateCol';
import DockForUtil from './DockForUtil';
import { wrhCloseState } from '@/pages/Inner/Close/WrhCloseBillState';
import { closeLocale } from '@/pages/Inner/Close/WrhCloseBillLocale';
import { getTypeCaption } from '@/pages/Inner/Close/WrhCloseBillType';
import { getUsageCaption } from '@/utils/BinUsage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import DockUtil from '@/pages/Component/DockUtil';
import TagDetailUtil from '@/pages/Component/TagDetailUtil';
import { OperateType, DockState, BookState } from './InWrhBillContants';
import { ORDER_RES } from '@/pages/In/Order/OrderPermission';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';
import { BOOK_RES } from '@/pages/In/Book/BookPermission';
import { routerRedux } from 'dva/router';
import { formatMessage } from 'umi/locale';
import styles from './InWrhBill.less';
import SearchPage from '@/pages/Component/Page/SearchPage';
// import SearchPage from './SearchPage';

const TabPane = Tabs.TabPane;

const { Panel } = Collapse;

@connect(({ inwrh, dock, releasecontentconfig, loading }) => ({
  inwrh,
  dock,
  releasecontentconfig,
  loading: loading.models.inwrh,
}))
@Form.create()
export default class InWrhBillSearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: inWrhBillLocale.title,
      titleForDetail: inWrhBillLocale.title,
      data: props.inwrh.data,
      selectedRows: [],
      record: {},
      entityUuid: '',
      operate: '',
      modalVisible: false,
      billNumber: '',
      reportParams: [],
      // visible: false,
      dataList: [],
      entity: {},
      checked: [],
      upDockUuids: [],
      key: 'inWrh.search.table',
      noToolbar: true
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
  }

  componentDidMount() {
    this.refreshTable();
    this.getDock();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.inwrh.data
    });
  }

  changeSelectedRows = (selectedRows) => {
    let versionChange = [];
    let uuidChange = [];
    for (let i = 0; i < selectedRows.length; i++) {
      versionChange.push({
        version: selectedRows[i].version
      })
      uuidChange.push({
        uuid: selectedRows[i].uuid
      })
    }
    this.setState({
      versionChange: versionChange,
      uuidChange: uuidChange
    })
  };

  onChange = (checkedList) => {
    let uuids = []
    this.setState({
      checkedList: checkedList
    });
    if (checkedList && checkedList.length > 0) {
      checkedList.forEach(item => {
        if (this.state.arrList && this.state.arrList.length > 0) {
          this.state.arrList.forEach(sub => {
            if (item === '[' + sub.code + ']' + '' + sub.name) {
              uuids.push(sub.uuid)
            }
          })
        }
      })
    }
    this.setState({
      upDockUuids: uuids
    })
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
    }

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }

    dispatch({
      type: 'inwrh/query',
      payload: queryFilter,
      callback: (response) => {
        if (response && response.success) {
          this.setState({
            dataList: response.data.records
          });
        }
      }
    });
  };
  /**
   * 获取码头信息
   * @param filter
   */
  getDock = () => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    let queryFilter = { ...pageFilter };

    dispatch({
      type: 'dock/query',
      payload: queryFilter,
      callback: (response) => {
        if (response && response.success) {
          let options = []
          let innerHtml = []
          if (response.data.records && response.data.records.length > 0) {
            response.data.records.forEach((result, index) => {
              options.push('[' + result.code + ']' + result.name)
            });

            options.forEach((item, index) => {
              innerHtml.push(<Col span={4} style={{ marginLeft: 20, paddingBottom: '8px' }} key={'col' + item}>
                <Checkbox value={item} key={item}>
                  <div style={{ display: 'inline-block' }}><DockForUtil value={response.data.records[index].state} /></div>
                  {item}</Checkbox>
              </Col>)
            })
            this.setState({
              options: options,
              arrList: response.data.records,
              innerHtml: innerHtml,
              checkedList: []
            });
          }
        }
      }
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
    let vendorUuid = undefined;
    if (data) {
      if (data.vendor) {
        vendorUuid = JSON.parse(data.vendor).uuid;
      }
      if (data.inTime && data.inTime[0] && data.inTime[1]) {
        data.beginInTime = moment(data.inTime[0]).format('YYYY-MM-DD HH:mm:ss');
        data.endInTime = moment(data.inTime[1]).format('YYYY-MM-DD HH:mm:ss');
      } else if (pageFilter.searchKeyValues.beginInTime && pageFilter.searchKeyValues.endInTime) {
        delete pageFilter.searchKeyValues.beginInTime;
        delete pageFilter.searchKeyValues.endInTime;
      }

      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        vendorUuid: vendorUuid
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      }
    }
    this.refreshTable();

  }

  onCancel = () => {
    // this.setState({
    //   visible: false
    // })
    this.refreshTable();
  }

  /**
   * 作废
   */
  onAbort = (record) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'inwrh/abort',
        payload: {
          uuid: record.uuid,
          version: record.version
        },
        callback: response => {
          if (response && response.success) {
            // that.setState({
            //   visible: false
            // });
            that.refreshTable();
            message.success(commonLocale.abortSuccessLocale)
          }
        }
      })
    })
  }

  /**
   * 模态框显示/隐藏
   */
  handleModalVisible = (operate) => {
    if (operate) {
      this.setState({
        operate: operate,
        // billNumber: billNumber
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
    const { operate, entity } = this.state;
    if (operate === commonLocale.abortLocale) {
      this.onAbort(entity);
    }
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }

  /**
   * 查看详情
   */
  onView = (record) => {
    // this.setState({
    //   visible: true
    // })
    this.props.dispatch({
      type: 'inwrh/showPage',
      payload: {
        showPage: 'view',
        billNumber: record.billNumber
      }
    });
  }


  /**
   * 跳转到供应商详情页面
   */
  onVendorView = (vendor) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/vendor',
      payload: {
        showPage: 'view',
        entityUuid: vendor ? vendor.uuid : undefined
      }
    }));
  }

  /**
   * 跳转到订单详情页面
   */
  onOrderView = (record) => {
    this.props.dispatch({
      type: 'order/getByBillNumberAndDcUuid',
      payload: {
        dcUuid: record.dcUuid,
        sourceBillNumber: record.orderBillNumber
      },
      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/in/order',
            payload: {
              showPage: 'view',
              billNumber: response.data ? response.data.billNumber : undefined
            }
          }));
        }
      }
    });
  }

  /**
   * 跳转到预约单详情页面
   */
  onBookView = (record) => {
    this.props.dispatch({
      type: 'book/getByBillNumber',
      payload: {
        dcUuid: record.dcUuid,
        billNumber: record.bookBillNumber
      },
      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/in/book',
            payload: {
              showPage: 'view',
              entityUuid: response.data ? response.data.uuid : undefined
            }
          }));
        }
      }
    });
  }

  onAssignDock = () => {
    const { dispatch } = this.props;
    const { uuidChange, upDockUuids } = this.state;
    let arr = []
    if (uuidChange && uuidChange.length > 0) {
      uuidChange.forEach(item => {
        arr.push(item.uuid)
      })
    }
    if (arr.length === 0) {
      message.warn(formatMessage({ id: 'common.progress.select.tips' }));
    } else {
      dispatch({
        type: 'inwrh/assignDock',
        payload: {
          dockUuids: upDockUuids,
          inwrhBillUuids: arr
        },
        callback: (response) => {
          if (response && response.success) {
            this.state.selectedRows = [];
            this.getDock();
            this.refreshTable();
            message.success('分配成功');
          }
        }
      });
    }

  }

  onCancleState = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'inwrh/cancelAssignDock',
      payload: {
        uuid: record.uuid,
        version: record.version
      },
      callback: response => {
        if (response && response.success) {
          this.state.selectedRows = [];
          this.getDock();
          this.refreshTable();
          message.success('取消分配成功');
        }
      }
    });
  }

  onCancelAssignment = () => {
    const { selectedRows } = this.state;
    const that = this;
    if (selectedRows.length === 0) {
      message.warn(formatMessage({ id: 'common.progress.select.tips' }));
      return;
    } else {
      selectedRows.forEach(function (e) {
        that.onCancleState(e);
      });
    }
  }

  /**
   * 配置放行内容
   */
  onReleaseContent = () => {
    this.props.dispatch({
      type: 'inwrh/showPage',
      payload: {
        showPage: 'releasecontentconfig'
      }
    });
  }

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.abortLocale,
      confirm: true,
      confirmCaption: inWrhBillLocale.title,
      onClick: this.onAbort.bind(this, record, false)
    }];
  }

  fetchOperatePropsTwo = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }];
  }

  renderOperateCol = (record) => {
    if (State[record.state].name == 'INITIAL') {
      return <OperateCol menus={this.fetchOperatePropsOne(record)}
        uuid={record.uuid}
        record={record}
      // visible={this.state.visible}
      />
    }
    if (State[record.state].name == 'HASDOCK' ||
      State[record.state].name == 'RECEIVING' || State[record.state].name == 'FINISHED' || State[record.state].name == 'ABORTED') {
      return <OperateCol menus={this.fetchOperatePropsTwo(record)} />
    }
  }

  drawStateTag = () => {
    const { entity } = this.state;
    if (entity.state) {
      return (
        <TagDetailUtil value={entity.state} />
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
        {entity.state === State.INITIAL.name &&
          <span>
            <Button type='primary' onClick={() => this.handleModalVisible(commonLocale.abortLocale)}>
              {commonLocale.abortLocale}
            </Button>
          </span>
        }
      </Fragment>
    );
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
      key: commonLocale.billNumberLocal,
      render: (val, record) =>
        <span>
          <a onClick={this.onView.bind(this, record)}>{record.billNumber}</a>
        </span>
    },
    {
      title: commonLocale.stateLocale,
      width: colWidth.enumColWidth,
      key: commonLocale.stateLocale,
      sorter: true,
      dataIndex: 'state',
      render: val => <DockUtil value={val} />
    },
    {
      title: inWrhBillLocale.orderState,
      width: colWidth.enumColWidth,
      key: inWrhBillLocale.orderState,
      dataIndex: 'bookState',
      sorter: true,
      render: val => <DockUtil value={val} />
    },
    {
      title: commonLocale.inAllQtyStrLocale,
      dataIndex: 'totalQtyStr',
      key: commonLocale.inAllQtyStrLocale,
      width: itemColWidth.qtyStrColWidth,
      sorter: true,
    },
    {
      title: commonLocale.inAllArticleCountLocale,
      dataIndex: 'totalArticleCount',
      sorter: true,
      key: commonLocale.inAllArticleCountLocale,
      width: itemColWidth.qtyColWidth
    },
    {
      title: inWrhBillLocale.dock,
      width: colWidth.codeColWidth,
      dataIndex: 'docks',
      sorter: true,
      render: val =>val? <EllipsisCol colValue={val} /> : <Empty />,
      key: inWrhBillLocale.dock
    },
    {
      title: inWrhBillLocale.operateType,
      width: colWidth.enumColWidth,
      dataIndex: 'operateMethod',
      key: inWrhBillLocale.operateType,
      sorter: true,
      render: val => val?OperateType[val].caption:<Empty />
    },
    {
      title: inWrhBillLocale.driver,
      dataIndex: 'driverName',
      width: colWidth.enumColWidth,
      key: inWrhBillLocale.driver,
      sorter: true,
    },
    {
      title: inWrhBillLocale.carNumber,
      dataIndex: 'vehicleNum',
      width: colWidth.enumColWidth,
      key: inWrhBillLocale.carNumber,
      sorter: true,
    },
    {
      title: inWrhBillLocale.time,
      dataIndex: 'inTime',
      key: inWrhBillLocale.time,
      sorter: true,
      width: colWidth.enumColWidth
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      key: 'action',
      render: record => (
        this.renderOperateCol(record)
      ),
    },
  ];

  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    return (<Fragment>
      <Button type="primary" onClick={this.onReleaseContent}>
        {inWrhBillLocale.configReleaseContent}
      </Button>
      <Button id="createButton" type="primary" disabled={true}>
        {inWrhBillLocale.configAutoFresh}
      </Button>
    </Fragment>);
  }
  /**
   * 绘制操作按钮
   */
  drawToolbarPanel() {
    return [
      <Button key={1} onClick={() => this.onAssignDock()}>
        {inWrhBillLocale.assignDock}
      </Button>,
      <Button key={2} onClick={() => this.onCancelAssignment()}>
        {inWrhBillLocale.cancelAssignment}
      </Button>,
    ];
  }

  drawToolbarPanelContent() {
    return [
      <ViewPanel onCollapse={this.onCollapse} isClose title={'码头信息'}>
        <Checkbox.Group style={{ width: '100%' }} onChange={this.onChange} value={this.state.checkedList}>
          <Row>
            {this.state.innerHtml}
          </Row>
        </Checkbox.Group>
      </ViewPanel>
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
        <InWrhBillSearchForm
          filterValue={this.state.pageFilter.searchKeyValues}
          refresh={this.onSearch}
          toggleCallback={this.toggleCallback}
        />
      </div>

    );
  }
}
