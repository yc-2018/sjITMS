import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Form, Select, Input, InputNumber, message, Col, Button, Tabs, Divider } from 'antd';
import TagUtil from '@/pages/Component/TagUtil';
import Empty from '@/pages/Component/Form/Empty';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { State, BookType } from './BookContants';
import { bookLocale } from './BookLocale';
import { BOOK_RES } from './BookPermission';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { ORDER_RES } from '@/pages/In/Order/OrderPermission';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';
import { routerRedux } from 'dva/router';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';

const TabPane = Tabs.TabPane;
@connect(({ book, loading }) => ({
  book,
  loading: loading.models.book,
}))
export default class BookViewPage extends ViewPage {

  constructor(props) {
    super(props);

    this.state = {
      title: bookLocale.title,
      entityUuid: props.book.entityUuid,
      entity: {},
      operate: '',
      modalVisible: false,
      createPermission: BOOK_RES.CREATE,
      billNumber: props.billNumber,
    }
  }

  componentDidMount() {
    this.refresh(this.state.billNumber, this.state.entityUuid);
  }

  componentWillReceiveProps(nextProps) {
    const bookBill = nextProps.book.entity;
    if (bookBill && (bookBill.billNumber === this.state.billNumber || bookBill.uuid === this.state.entityUuid)) {
      this.setState({
        entity: bookBill,
        title: bookLocale.title + "：" + bookBill.billNumber,
        entityUuid: bookBill.uuid,
        billNumber: bookBill.billNumber,
        showProcessView: false
      });
    }
    const nextBillNumber = nextProps.billNumber;
    if (nextBillNumber && this.state.billNumber !== nextBillNumber) {
      this.setState({
        billNumber: nextBillNumber
      });
      this.refresh(nextBillNumber);
    }
  }

  drawStateTag = () => {
    if (this.state.entity.state) {
      return (
        <TagUtil value={this.state.entity.state} />
      );
    }
  }

  drawActionButtion() {
    return (
      <Fragment>
        <Button onClick={this.onBack}>
          {commonLocale.backLocale}
        </Button>
        {
          this.state.entity.state && State[this.state.entity.state].name == 'SAVED' &&
          <span>
            <Button disabled={!havePermission(BOOK_RES.REMOVE)}
              onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}>
              {commonLocale.deleteLocale}
            </Button>
            <Button disabled={!havePermission(BOOK_RES.CREATE)}
              onClick={() => this.onEdit()}>
              {commonLocale.editLocale}
            </Button>
            <Button disabled={!havePermission(BOOK_RES.AUDIT)} type='primary'
              onClick={() => this.handleModalVisible(commonLocale.auditLocale)}>
              {commonLocale.auditLocale}
            </Button>

          </span>
        }
        {
          this.state.entity.state && State[this.state.entity.state].name == 'AUDITED' && <span>
            <Button disabled={!havePermission(BOOK_RES.ABORT)} type='primary'
              onClick={() => this.handleModalVisible(commonLocale.abortLocale)}>
              {commonLocale.abortLocale}
            </Button>
          </span>
        }
      </Fragment>
    );
  }

  /**
   * 返回
   */
  onBack = () => {
    this.props.dispatch({
      type: 'book/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }

  refresh = (billNumber, uuid) => {
    if (!billNumber && !uuid) {
      billNumber = this.state.billNumber;
    }

    if (billNumber) {
      this.props.dispatch({
        type: 'book/getByBillNumber',
        payload: {
          billNumber: billNumber,
          dcUuid: loginOrg().uuid
        },
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的预约单' + billNumber + '不存在！');
            this.onCancel();
          } else {
            this.setState({
              billNumber: res.data.billNumber
            });
          }
        }
      });
      return;
    }

    if (uuid) {
      this.props.dispatch({
        type: 'book/get',
        payload: {
          uuid: uuid
        },
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的预约单不存在！');
            this.onCancel();
          } else {
            this.setState({
              billNumber: res.data.billNumber
            });
          }
        }
      });
    }

  }

  onCancel = () => {
    this.props.dispatch({
      type: 'book/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }

  onEdit = () => {
    this.props.dispatch({
      type: 'book/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entity.uuid
      }
    });
  }

  /*
 * 新增
 */
  onCreate = () => {
    this.props.dispatch({
      type: 'book/showPage',
      payload: {
        showPage: 'create'
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
        type: 'book/previousBill',
        payload: entity.billNumber,
        callback: (response) => {
          if (response && response.success && response.data) {
            this.props.dispatch({
              type: 'book/showPage',
              payload: {
                showPage: 'view',
                entityUuid: response.data.uuid
              }
            });

          }
        }
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
        type: 'book/nextBill',
        payload: entity.billNumber,
        callback: (response) => {
          if (response && response.success && response.data) {
            this.props.dispatch({
              type: 'book/showPage',
              payload: {
                showPage: 'view',
                entityUuid: response.data.uuid
              }
            });
          }
        }
      });
    }
  }

  viewProcessView = () => {
    this.setState({
      showProcessView: !this.state.showProcessView
    });
  };

  darwProcess = () => {
    return <a onClick={() => this.viewProcessView()}>流程进度</a>;
  };


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
    } else if (operate === commonLocale.abortLocale) {
      this.onAbort();
    } else if (operate === commonLocale.auditLocale) {
      this.onAudit();
    }
  }

  /**
  * 删除处理
  */
  onRemove = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'book/onRemove',
      payload: this.state.entity,
      callback: (response) => {
        if (response && response.success) {
          this.onCancel();
          message.success(commonLocale.removeSuccessLocale);
        }
      }
    });
  };

  /**
   * 审核处理
   */
  onAudit = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'book/onAudit',
      payload: this.state.entity,
      callback: (response) => {
        if (response && response.success) {
          this.refresh();
          message.success(commonLocale.auditSuccessLocale);
        }
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  };

  /**
 * 作废处理
 */
  onAbort = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'book/onAbort',
      payload: this.state.entity,
      callback: (response) => {
        if (response && response.success) {
          this.refresh();
          message.success(commonLocale.abortSuccessLocale);
        }
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  };

  /**
   * 判断状态节点
   */
  getDot = (state) => {
    if (state === State.INPROGRESS.name) {
      return 1;
    }
    if (state === State.FINISHED.name) {
      return 2;
    }
    return 0;
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
              entityUuid: response.data ? response.data.uuid : undefined
            }
          }));
        }
      }
    });
  }

  drawOthers = () => {
    const others = [];
    if (this.state.showProcessView) {
      const { entity } = this.state;
      const data = [{
        title: '保存',
        subTitle: entity.createInfo.time,
        current: entity.state !== '',
        description: [{
          label: commonLocale.inAllQtyStrLocale,
          value: entity.qtyStr
        }, {
          label: bookLocale.allArticles,
          value: entity.articleCount
        }, {
          label: bookLocale.allOrders,
          value: entity.orderCount
        }]
      },{
        title: '审核',
        subTitle: entity.state === State.AUDITED.name ? entity.lastModifyInfo.time : '',
        current: entity.state === State.AUDITED.name || entity.state === State.ABORTED.name,
      },{
        title: '作废',
        subTitle: entity.state === State.ABORTED.name ? entity.lastModifyInfo.time : '',
        current: entity.state == State.ABORTED.name,
      }];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }

  drawTabPanes = () => {
    let tabPanes = [
      this.drawBasicInfoTab()
    ];

    return tabPanes;
  }

  drawBasicInfoTab = () => {
    const { entity } = this.state;
    let basicItems = [{
      label: commonLocale.inVendorLocale,
      value: <a onClick={this.onViewVendor.bind(this, entity.vendor?entity.vendor.uuid:undefined) }
             disabled={!havePermission(VENDOR_RES.VIEW)}>{convertCodeName(entity.vendor)}</a>
    }, {
      label: commonLocale.inOwnerLocale,
      value: convertCodeName(entity.owner)
    }, {
      label: bookLocale.bookTimeRange,
      value: moment(entity.bookDate).format('YYYY-MM-DD') + ' ' + entity.startTime + '~' + entity.endTime
    }, {
      label: bookLocale.dockGroup,
      value: convertCodeName(entity.dockGroup)
    }, {
      label: bookLocale.type,
      value: entity.bookType ? BookType[entity.bookType].caption : ''
    }, {
      label: bookLocale.booker,
      value: convertCodeName(entity.booker)
    }];

    let businessItems = [{
      label: commonLocale.inAllQtyStrLocale,
      value: entity.qtyStr
    }, {
      label: bookLocale.allArticles,
      value: entity.articleCount
    }, {
      label: bookLocale.allOrders,
      value: entity.orderCount
    }];

    const columns = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: commonLocale.inOrderBillNumberLocale,
        dataIndex: 'orderBillNumber',
        key: 'orderBillNumber',
        width: colWidth.billNumberColWidth,
        render: (val, record) => <a onClick={this.onOrderView.bind(this, record) }
                disabled={!havePermission(ORDER_RES.VIEW)}>{record.orderBillNumber}</a>
      },
      {
        title: bookLocale.bookQtyStr,
        dataIndex: 'qtyStr',
        key: 'qtyStr',
        width: itemColWidth.qtyStrColWidth
      },
      {
        title: bookLocale.bookArticleQty,
        dataIndex: 'articleCount',
        key: 'articleCount',
        width: itemColWidth.qtyColWidth
      },
    ];


    let noteItems = [{
      label: commonLocale.noteLocale,
      value: entity.note
    }]
    return (
      <TabPane key="basicInfo" tab={commonLocale.basicInfoLocale}>
          <ViewPanel onCollapse={this.onCollapse} items={basicItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()} />
          <ViewTablePanel title={commonLocale.itemsLocale} columns={columns} data={entity.items ? entity.items : []} tableId={'book.view.table'} />
          <div>
            <ConfirmModal
              visible={this.state.modalVisible}
              operate={this.state.operate}
              object={bookLocale.title + ':' + this.state.entity.billNumber}
              onOk={this.handleOk}
              onCancel={this.handleModalVisible}
            />
          </div>
      </TabPane>
    );
  }
}
