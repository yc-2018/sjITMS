import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, Tabs, Modal, Steps, message, Tooltip, Row, Col,InputNumber } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import TagUtil from '@/pages/Component/TagUtil';
import Empty from '@/pages/Component/Form/Empty';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { sourceWay } from '@/utils/SourceWay';
import { havePermission } from '@/utils/authority';
import { commonLocale,placeholderLocale } from '@/utils/CommonLocale';
import { LogisticMode, State } from './PackageBillContants';
import { orderLocale } from './PackageBillLocale';
import { PACKAGE_RES } from './PackageBillPermission';
import styles from './PackageBill.less';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';

import { MAX_DECIMAL_VALUE } from '@/utils/constants';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
import { bookLocale } from '../Book/BookLocale';

const TabPane = Tabs.TabPane;

@connect(({ packageBill, loading }) => ({
  packageBill,
  loading: loading.models.packageBill,
}))
export default class PackageBillViewPage extends ViewPage {
  constructor(props) {
    super(props);
    this.state = {
      entity: {},
      items: [],
      entityUuid: props.packageBill.entityUuid,
      billNumber: props.billNumber,
      title: '',
      operate: '',
      modalVisible: false,
    }
  }

  componentDidMount() {
    this.refresh(this.state.billNumber, this.state.entityUuid);
  }

  componentWillReceiveProps(nextProps) {
    let showPricingButton = false;
    const packageBill = nextProps.packageBill.entity;
    if (packageBill && (packageBill.billNumber === this.state.billNumber || packageBill.uuid === this.state.entityUuid)) {
      this.setState({
        entity: packageBill,
        title: orderLocale.title + "：" + packageBill.billNumber,
        entityUuid: packageBill.uuid,
        billNumber: packageBill.billNumber,
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

  refresh = (billNumber, uuid) => {
    if (!billNumber && !uuid) {
      billNumber = this.state.billNumber;
    }

    if (billNumber) {
      this.props.dispatch({
        type: 'packageBill/getByBillNumber',
        payload: {
          billNumber: billNumber,
          dcUuid: loginOrg().uuid
        },
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的包裹订单' + billNumber + '不存在！');
            this.onBack();
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
        type: 'packageBill/get',
        payload: uuid,
        callback: (res) => {
          if (!res || !res.data || !res.data.uuid) {
            message.error('指定的包裹订单不存在！');
            this.onBack();
          } else {
            this.setState({
              billNumber: res.data.billNumber
            });
          }
        }
      });
    }

  }
  /**
   * 返回
   */
  onBack = () => {
    this.props.dispatch({
      type: 'packageBill/showPage',
      payload: {
        showPage: 'query',
        fromView: true
      }
    });
  }
  /**
   * 编辑
   */
  onEdit = () => {
    this.props.dispatch({
      type: 'packageBill/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entityUuid
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
      this.onDelete();
    } else if (operate === commonLocale.auditLocale) {
      this.onAudit();
    }
  }

  /**
   * 删除
   */
  onDelete = () => {
    const { entity } = this.state;
    this.props.dispatch({
      type: 'packageBill/delete',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: (response) => {
        if (response && response.success) {
          this.onBack();
          message.success(commonLocale.removeSuccessLocale)
        } else {
          message.error(response.message)
        }
      }
    })
  }
  /**
   * 完成
   */
  onFinsh = () => {
    this.props.dispatch({
      type: 'packageBill/showPage',
      payload: {
        showPage: 'audit',
        entityUuid: this.state.entityUuid,
        callback: (response) => {
          if (response && response.success) {
            this.refresh();
          } else {
            message.error(response.message)
          }
        }
      }
    });
  }

  /**
   * 审核
   */
  onAudit = () => {
    const { entity } = this.state;
    this.props.dispatch({
      type: 'packageBill/audit',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: (response) => {
        if (response && response.success) {
          this.refresh();
          message.success(commonLocale.auditSuccessLocale);
        } else {
          message.error(response.message)
        }
      }
    });
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }

  /**
   * 绘制订单状态tag
   */
  drawStateTag = () => {
    if (this.state.entity.state) {
      return (
        <TagUtil value={this.state.entity.state}/>
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
            State[this.state.entity.state].name == 'SAVED' ?
              <Button onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}
                      disabled={!havePermission(PACKAGE_RES.DELETE)}>
                {commonLocale.deleteLocale}
              </Button>
              : null
          }
          {
            State[this.state.entity.state].name == 'SAVED' || State[this.state.entity.state].name == 'FINISHED' ?
              <Button onClick={this.onEdit} disabled={!havePermission(PACKAGE_RES.CREATE)}>
                {commonLocale.editLocale}
              </Button>
              : null
          }
          {
            State[this.state.entity.state].name == 'SAVED' ?
              <Button type='primary' onClick={() => this.handleModalVisible(commonLocale.auditLocale)}
                      disabled={!havePermission(PACKAGE_RES.AUDIT)}>
                {commonLocale.auditLocale}
              </Button>
              : null
          }
          {
            State[this.state.entity.state].name == 'INITIAL' ?
              <Button type='primary' onClick={this.onFinsh} disabled={!havePermission(PACKAGE_RES.AUDIT)}>
                {commonLocale.finishLocale}
              </Button>
              : null
          }
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          <Button onClick={this.onBack}>
            {commonLocale.backLocale}
          </Button>
        </Fragment>
      )
    }
  }

  /**
   * 表格变化时
   * @param {*} e
   * @param {*} fieldName
   * @param {*} key
   */
  handleFieldChange(e, fieldName, line) {
    const { items } = this.state;
    if (fieldName === 'price') {
      items[line - 1].price = e;
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
   * 绘制信息详情
   */
  drawOrderBillInfoTab = () => {
    const { entity } = this.state;
    let profileItems = [
      {
        label: orderLocale.sourceBillNumber,
        value: entity.sourceBillNumber ? entity.sourceBillNumber : <Empty/>
      },
      {
        label: orderLocale.code,
        value: entity.customer ? entity.customer.code : <Empty/>
      },
      {
        label: orderLocale.name,
        value: entity.customer ? entity.customer.name : <Empty/>
      },
      {
        label: '客户地址',
        value: entity.customerAddress ? entity.customerAddress : <Empty/>
      },
      {
        label: commonLocale.inOwnerLocale,
        value: convertCodeName(entity.owner)
      },
      {
        label: orderLocale.receiver,
        value: convertCodeName(entity.receiver)
      },
      {
        label: commonLocale.noteLocale,
        value: entity.note,
      }
    ];

    // let businessRow = <div className={styles.leftSpan}>
    //   <Row>
    //     <Col span={4}>{orderLocale.receivedCount}</Col>
    //     <Col span={4}>{entity.totalCount}</Col>
    //     <Col span={4}>{orderLocale.totalCount}</Col>
    //     <Col span={4}>{entity.receivedCount}</Col>
    //   </Row><br/>
    // </div>;

    let articleCols = [
      {
        title: commonLocale.lineLocal,
        key: 'line',
        dataIndex: 'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: orderLocale.packageNumber,
        dataIndex: 'packageNumber',
        width: colWidth.billNumberColWidth
      },
      {
        title: orderLocale.receiveContainerBarcode,
        width: colWidth.billNumberColWidth,
        render: record => <span>{record.receiveContainerBarcode ? record.receiveContainerBarcode : <Empty/>}</span>,
      },
      {
        title: orderLocale.packageContainerBarcode,
        width: colWidth.billNumberColWidth,
        render: record => <span>{record.packageContainerBarcode ? record.packageContainerBarcode : <Empty/>}</span>,
      },
      {
        title: commonLocale.productionDateLocale,
        width: colWidth.dateColWidth,
        render: record => <span>{record.productionDate ? moment(record.productionDate).format('YYYY-MM-DD') :
          <Empty/>}</span>
      },
      {
        title: commonLocale.validDateLocale,
        width: colWidth.dateColWidth,
        render: record => <span>{record.expireDate ? moment(record.expireDate).format('YYYY-MM-DD') : <Empty/>}</span>
      },
      {
        title: orderLocale.receiveOrNo,
        width: colWidth.billNumberColWidth,
        render: record => record.received ? '是' : '否'
      }
    ];

    return (
      <TabPane key="basicInfo" tab={orderLocale.title}>
        <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()}/>
        <ViewTablePanel
          title={commonLocale.itemsLocale}
          columns={articleCols}
          data={entity.items ? entity.items : []}
        />
        <div>
          <ConfirmModal
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={orderLocale.title + ':' + this.state.entity.billNumber}
            onOk={this.handleOk}
            onCancel={this.handleModalVisible}
          />
        </div>
      </TabPane>
    );
  }

  /**
   * 绘制Tab页
   */
  drawTabPanes = () => {
    let tabPanes = [
      this.drawOrderBillInfoTab(),
    ];

    return tabPanes;
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
          label: orderLocale.receivedCount,
          value: entity.totalCount
        }, {
          label: orderLocale.totalCount,
          value: entity.receivedCount
        }]
      },{
        title: '审核',
        subTitle: entity.state === State.INITIAL.name ? entity.lastModifyInfo.time : '',
        current: entity.state === State.INITIAL.name || entity.state === State.FINISHED.name,
      }];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  };
}
