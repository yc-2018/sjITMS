import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Form, Select, Input, InputNumber, message, Col, Button, Tabs, Divider } from 'antd';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { loginCompany, getActiveKey } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { add, toQtyStr, accAdd } from '@/utils/QpcStrUtil';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import TagUtil from '@/pages/Component/TagUtil';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
const TabPane = Tabs.TabPane;
import { routerRedux } from 'dva/router';
import Empty from '@/pages/Component/Form/Empty';
import { TITLE_SEPARATION } from '@/utils/constants';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';

import { inWrhBillLocale } from './InWrhBillLocale';
import { ORDER_RES } from '@/pages/In/Order/OrderPermission';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';
import { State, OperateType, BookState } from './InWrhBillContants';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';
@connect(({ inwrh, loading }) => ({
  inwrh,
  loading: loading.models.inwrh,
}))
export default class InWrhBillViewPage extends ViewPage {

  constructor(props) {
    super(props);

    this.state = {
      title: "入园单",
      billNumber: props.billNumber,
      visiblAbort: false,//作废的模态框,
      entity: {},
      operate: '',
      modalVisible: false,
    }
  }

  componentDidMount() {
    this.refresh(this.state.billNumber);
  }

  componentWillReceiveProps(nextProps) {
    const entity = nextProps.inwrh.entity && nextProps.inwrh.entity.inwrhBill ? nextProps.inwrh.entity.inwrhBill : '';
    if (entity && entity.billNumber === this.state.billNumber) {
      this.setState({
        entity: entity,
        title: "入园单" + TITLE_SEPARATION + entity.billNumber,
        entityUuid: entity.uuid,
        showProcessView: false
      });
      //   this.buildStockItems();
    }

    const nextBillNumber = nextProps.billNumber;
    if (nextBillNumber && nextBillNumber !== this.state.billNumber) {
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
        <Button onClick={this.onCancel}>
          {commonLocale.backLocale}
        </Button>
        {
          this.state.entity.state && State[this.state.entity.state].name === State.INITIAL.name &&
          <Button
            type='primary'
            onClick={() => this.handleAbortModal()}
            // disabled={!havePermission(RPL_RES.AUDIT)}
          >{commonLocale.abortLocale}</Button>
        }
      </Fragment>
    );
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
          uuid: that.state.entity.uuid,
          version: that.state.entity.version
        },
        callback: response => {
          if (response && response.success) {
            that.refresh(that.state.billNumber);
            message.success(commonLocale.abortSuccessLocale)
          }
        }
      })
      that.setState({
        visiblAbort: !that.state.visiblAbort
      })
    })
  }

  refresh = (billNumber, uuid) => {
    if (!billNumber && !uuid) {
      billNumber = this.state.billNumber;
    }
    if (billNumber) {
      this.props.dispatch({
        type: 'inwrh/getByBillNumber',
        payload: {
          inwrhBillNumber: billNumber
        },
        callback: (res) => {
          if (!res || !res.data || !res.data.inwrhBill) {
            message.error('指定的入园单' + billNumber + '不存在！');
            this.onCancel();
          } else {
            this.setState({
              billNumber: res.data && res.data.inwrhBill && res.data.inwrhBill.billNumber ? res.data.inwrhBill.billNumber : ''
            });
          }
        }
      });
      return;
    }
    if (uuid) {
      this.props.dispatch({
        type: 'inwrh/get',
        payload: uuid,
        callback: (res) => {
          if (!res || !res.data || !res.data.inwrhBill) {
            message.error('指定的入园单不存在！');
            this.onCancel();
          } else {
            this.setState({
              billNumber: res.data && res.data.inwrhBill && res.data.inwrhBill.billNumber ? res.data.inwrhBill.billNumber : ''
            });
          }
        },
      });
    }
  }

//   handleModalVisible = () => {
//     this.setState({
//       modalVisible: !this.state.modalVisible
//     });
//   }

  onCancel = () => {
    this.props.dispatch({
      type: 'inwrh/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

//   onAudit = () => {
//     this.props.dispatch({
//       type: 'rpl/showPage',
//       payload: {
//         showPage: 'audit',
//         billNumber: this.state.billNumber
//       }
//     });
//   }

  /**
   * 模态框确认操作
   */
  handleOk = () => {
    this.onAbort();
  }

  /**
   * 模态框显示/隐藏
   */
  handleAbortModal = () => {
    // if (operate) {
    //   this.setState({
    //     operate: operate
    //   })
    // }
    this.setState({
      visiblAbort: !this.state.visiblAbort
    })
  }


//   /**
//    * 单一审核
//    */
//   normalAudit = () => {
//     const that = this;
//     return new Promise(function (resolve, reject) {
//       that.props.dispatch({
//         type: 'rpl/normalAudit',
//         payload: {
//           uuid : that.state.entity.uuid,
//           version: that.state.entity.version
//         },
//         callback: response => {
//           if (response && response.success) {
//             that.refresh(that.state.billNumber);
//             message.success(commonLocale.auditSuccessLocale)
//           }
//         }
//       })
//       that.setState({
//         visiblAbort: !that.state.visiblAbort
//       })
//     })
//   }

//   /**
//    * 跳转到波次单详情页面
//    */
//   onWaveView = (record) => {
//     this.props.dispatch(routerRedux.push({
//       pathname: '/out/wave',
//       payload: {
//         showPage: 'view',
//         billNumber: record
//       }
//     }));
//   }

//   /**
//    * 修改操作方式
//    */
//   onEditMode = () => {
//     const { dispatch } = this.props;
//     const { entity } = this.state;
//     dispatch({
//       type: 'rpl/onEditMode',
//       payload: {
//         uuid: entity.uuid,
//         version: entity.version
//       },
//       callback: (response) => {
//         if (response && response.success) {
//           this.refresh(this.state.billNumber);
//           message.success(commonLocale.modifySuccessLocale);
//         }
//       }
//     });
//     this.handleModalVisible();
//   };

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

  drawTabPanes = () => {
    let tabPanes = [
      this.drawBasicInfoTab()
    ];

    return tabPanes;
  }

  drawBasicInfoTab = () => {
    const entity = this.state.entity;

    let basicItems = [
      {
        label: inWrhBillLocale.driver,
        value: entity ? entity.driverName : ''
      }, {
        label: inWrhBillLocale.carNumber,
        value: entity ? entity.vehicleNum : ''
      }, {
        label: inWrhBillLocale.orderState,
        value: entity&&entity.bookState ? BookState[entity.bookState].caption : <Empty/>
      }, {
        label: inWrhBillLocale.time,
        value: entity ? entity.inTime : ''
      }, {
        label: inWrhBillLocale.operateType,
        value: entity&&entity.operateMethod ? OperateType[entity.operateMethod].caption : <Empty/>
      }, {
        label: commonLocale.inAllQtyStrLocale,
        value: entity ? entity.totalQtyStr : ''
      }, {
        label: commonLocale.inAllArticleCountLocale,
        value: entity ? entity.totalQtyStr : ''
      }, {
        label: commonLocale.noteLocale,
        value: entity ? entity.note : ''
      }];

    const itemsColumns = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: commonLocale.inVendorLocale,
        dataIndex: 'vendor',
        width: colWidth.codeNameColWidth,
        render: val => <a onClick={this.onVendorView.bind(this, val)}
                          disabled={!havePermission(VENDOR_RES.VIEW)}><EllipsisCol colValue={convertCodeName(val)} /></a>
      },
      {
        title: commonLocale.inOrderBillNumberLocale,
        dataIndex: 'orderBillNumber',
        width: colWidth.billNumberColWidth,
        render: (val, record) => <a onClick={this.onOrderView.bind(this, record)}
                                    disabled={!havePermission(ORDER_RES.VIEW)}>{val}</a>
      },
      {
        title: commonLocale.sourceOrderBillNumberLocal,
        width: colWidth.billNumberColWidth,
        render: record => record.sourceOrderBillNumber ? <EllipsisCol colValue={record.sourceOrderBillNumber} /> : <Empty />
      },
      {
        title: inWrhBillLocale.qtyStr,
        dataIndex: 'qtyStr',
        width: itemColWidth.qtyStrColWidth
      },
      {
        title: inWrhBillLocale.articleCount,
        dataIndex: 'articleCount',
        width: colWidth.fixColWidth
      },
      {
        title: inWrhBillLocale.bookBillNumber,
        width: colWidth.billNumberColWidth,
        render: record => record.bookBillNumber ? <EllipsisCol colValue={record.bookBillNumber} /> : <Empty />
      },
      {
        title: inWrhBillLocale.bookQtyStr,
        dataIndex: 'bookQtyStr',
        width: itemColWidth.qtyStrColWidth + 50
      },
      {
        title: inWrhBillLocale.bookArticleCount,
        dataIndex: 'bookArticleCount',
        width: colWidth.fixColWidth + 50
      },
      {
        title: inWrhBillLocale.bookTime,
        width: colWidth.dateColWidth,
        render: record => record.bookTime ? <EllipsisCol colValue={record.bookTime} /> : <Empty />
      },
    ];

    // let noteItems = [{
    //   label: commonLocale.noteLocale,
    //   value: entity ? entity.note : ''
    // }]

    return (
      <TabPane key="basicInfo" tab={commonLocale.basicInfoLocale}>
          <ViewPanel onCollapse={this.onCollapse} items={basicItems} title={commonLocale.profileItemsLocale} />
          <ViewTablePanel
            title={commonLocale.itemsLocale}
            columns={itemsColumns}
            data={entity ? (entity.items ? entity.items : []) : []}
          />
          {/* <ViewPanel items={noteItems} title={commonLocale.noteLocale} /> */}
          <div>
            <ConfirmModal
              visible={this.state.visiblAbort}
              operate={'作废'}
              object={inWrhBillLocale.inWrhBillNumber + ':' + entity.billNumber}
              onOk={this.handleOk}
              onCancel={this.handleAbortModal}
            />
          </div>
      </TabPane>
    );
  }
}
