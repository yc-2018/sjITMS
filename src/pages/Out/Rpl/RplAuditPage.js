import { connect } from 'dva';
import { Fragment } from 'react';
import { Form, message, Button, Tabs } from 'antd';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { loginCompany, loginUser ,getActiveKey} from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { binUsage } from '@/utils/BinUsage';
import { qtyStrToQty, add, toQtyStr, compare } from '@/utils/QpcStrUtil';
import { havePermission } from '@/utils/authority';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import { RplMode, RplType, PickType, RplStep } from '@/pages/Facility/PickArea/PickAreaContants';
import UserSelect from './UserSelect';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import TagUtil from '@/pages/Component/TagUtil';
import { RPL_RES } from './RplPermission';
import { State, RplGenFrom, RplBillType } from './RplContants';
import { rplLocale } from './RplLocale';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';
import Empty from '@/pages/Component/Form/Empty';
import ProcessViewPanel from '@/pages/Component/Page/inner/ProcessViewPanel';
const TabPane = Tabs.TabPane;
@connect(({ rpl, loading }) => ({
  rpl,
  loading: loading.models.rpl,
}))
@Form.create()
export default class RplAuditPage extends ViewPage {

  constructor(props) {
    super(props);

    this.state = {
      title: rplLocale.title,
      entityUuid: props.rpl.entityUuid,
      entity: {},
      operate: '',
      modalVisible: false,
      noUpDown: true
    }
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.rpl.entity) {
      let entity = nextProps.rpl.entity;
      if (!entity.rpler) {
        entity.rpler = {
          uuid: loginUser().uuid,
          code: loginUser().code,
          name: loginUser().name
        }
      }
      this.setState({
        entity: nextProps.rpl.entity,
        title: commonLocale.billNumberLocal + "：" + nextProps.rpl.entity.billNumber,
        entityUuid: nextProps.rpl.entity.uuid,
      });
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
        {this.state.entity.state === State.APPROVED.name && RplMode[this.state.entity.rplMode].name !== RplMode.RF.name &&
          <Button type='primary' onClick={() => this.handleModalVisible(commonLocale.saveLocale)}
          >
            {commonLocale.saveLocale}
          </Button>
        }
      </Fragment>
    );
  }

  refresh = () => {
    this.props.dispatch({
      type: 'rpl/get',
      payload: {
        uuid: this.state.entityUuid
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
    if (operate === commonLocale.saveLocale) {
      this.onSave();
    }
  }

  onCancel = () => {
    this.props.dispatch({
      type: 'rpl/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  onView = () => {
    this.props.dispatch({
      type: 'rpl/showPage',
      payload: {
        showPage: 'view',
        entityUuid: this.state.entityUuid
      }
    });
  }

  /**
 * 审核处理
 */
  onSave = () => {
    const { dispatch } = this.props;
    const { entity } = this.state;
    this.props.form.validateFields((errors, fieldsValue) => {
      if (errors) {
        this.handleModalVisible();
        return;
      }
      let qtyMap = {}

      let items = entity.items;
      let flag = true;
      for(let i = 0;i<items.length;i++){
        if (compare(items[i].realQtyStr, items[i].qtyStr) > 0) {
          message.error('实际件数不能大于件数');
          this.setState({
            modalVisible: !this.state.modalVisible
          });
          flag = false;
          break;
        }
        qtyMap[items[i].uuid] = items[i].realQty
      }

      if(flag == false){
        return;
      }
      dispatch({
        type: 'rpl/modifyRplBill',
        payload: {
          uuid: entity.uuid,
          version: entity.version,
          data: {
            rpler: fieldsValue && fieldsValue.rpler ? JSON.parse(fieldsValue.rpler) : entity.rpler,
            items: qtyMap,
          }
        },
        callback: (response) => {
          if (response && response.success) {
            this.onView();
            message.success(commonLocale.saveSuccessLocale);
          }
        }
      });
      this.setState({
        modalVisible: !this.state.modalVisible
      });
    })
  };

  drawTabPanes = () => {
    let tabPanes = [
      this.drawBasicInfoTab()
    ];

    return tabPanes;
  }

  onFieldChange = (value, field, index) => {
    const { entity } = this.state;
    if (field === 'user') {
      entity.rpler = JSON.parse(value);
    }
    if (field === 'qtyStr') {
      entity.items[index - 1].realQtyStr = value;
      entity.items[index - 1].realQty = qtyStrToQty(value, entity.items[index - 1].qpcStr);
      entity.items[index - 1].realAmount = entity.items[index - 1].realQty * entity.items[index - 1].price;

    }

    this.setState({
      entity: { ...entity }
    });
  }

  darwProcess = () => {
    return <a onClick={() => this.viewProcessView()}>流程进度</a>;
  };

  viewProcessView = () => {
    this.setState({
      showProcessView: !this.state.showProcessView
    });
  };

  drawBasicInfoTab = () => {
    const entity = this.state.entity;
    let allArticleQty = 0;
    let articleUuids = [];
    let allQtyStr = '0';
    let allAmount = 0;
    entity.items && entity.items.map(item => {
      if (item.qtyStr) {
        allQtyStr = add(allQtyStr, item.qtyStr);
      }
      if (articleUuids.indexOf(item.article.uuid) === -1) {
        allArticleQty = allArticleQty + 1;
        articleUuids.push(item.article.uuid);
      }
      if (item.price) {
        allAmount = allAmount + item.price * item.qty;
      }
    })
    let basicItems = [
      {
        label: rplLocale.rpler,
        value: <UserSelect value={JSON.stringify(entity.rpler)}
                           single placeholder={placeholderChooseLocale(rplLocale.rpler)} />
      },
      {
        label: rplLocale.pickArea,
        value: convertCodeName(entity.pickarea)
      },
      {
        label: rplLocale.type,
        value: entity.type && RplBillType[entity.type].caption
      },
      {
        label: rplLocale.mode,
        value: entity.rplMode && RplMode[entity.rplMode].caption
      },
      {
        label: rplLocale.waveBillNumber,
        value: entity.waveBillNumber
      },
      {
        label: rplLocale.step,
        value: entity.rplStep && RplStep[entity.rplStep].caption
      },
      {
        label: rplLocale.genFrom,
        value: entity.genFrom && RplGenFrom[entity.genFrom].caption
      },
      {
        label: commonLocale.noteLocale,
        value: entity.note ? entity.note : <Empty />
      }];

    let businessItems = [{
      label: commonLocale.inAllQtyStrLocale,
      value: entity.totalQtyStr
    }, {
      label: commonLocale.inAllRealQtyStrLocale,
      value: entity.realTotalQtyStr
    }, {
      label: commonLocale.inAllVolumeLocale,
      value: entity.totalVolume
    }, {
      label: commonLocale.inAllRealVolumeLocale,
      value: entity.realTotalVolume
    }, {
      label: commonLocale.inAllWeightLocale,
      value: entity.totalWeight
    }, {
      label: commonLocale.inAllRealWeightLocale,
      value: entity.realTotalWeight
    }];
    const columns = [
      {
        title: commonLocale.lineLocal,
        dataIndex: 'line',
        width: itemColWidth.lineColWidth
      },
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        dataIndex: 'article',
        width: colWidth.codeNameColWidth,
        render: val => <EllipsisCol colValue={convertCodeName(val)} />
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        key: 'qpcStr',
        width: itemColWidth.qpcStrColWidth,
        render: (val, record) => {
          return record.qpcStr + '/' + record.munit;
        }
      },
      {
        title: commonLocale.inQtyStrLocale,
        dataIndex: 'qtyStr',
        key: 'qtyStr',
        width: itemColWidth.qtyStrColWidth,
      },
      {
        title: commonLocale.inAllRealQtyStrLocale,
        dataIndex: 'realQtyStr',
        key: 'realQtyStr',
        width: itemColWidth.qtyStrEditColWidth,
        render: (text, record) => {
          // if(record.realQtyStr ==0){
          //   record.realQtyStr=record.qtyStr;
          //   record.realQty=qtyStrToQty(record.realQtyStr, record.qpcStr);
          // }
          return (
            <QtyStrInput
              value={record.realQtyStr ? record.realQtyStr : null}
              onChange={
                e => this.onFieldChange(e, 'qtyStr', record.line)
              }
            />
          );
        }
      },
      {
        title: commonLocale.productionBatchLocale,
        dataIndex: 'productionBatch',
        width: colWidth.enumColWidth,
        render: val => {
          return (
            <span>{val ? val : <Empty />}</span>
          );
        }
      },
      {
        title: rplLocale.fromBinCode,
        key: 'fromBinCode',
        dataIndex: 'fromBinCode',
        width: colWidth.codeColWidth
      },
      {
        title: rplLocale.fromContainerBarCode,
        key: 'fromContainerBarcode',
        dataIndex: 'fromContainerBarcode',
        width: colWidth.codeColWidth
      },
      {
        title: rplLocale.toBinCode,
        key: 'toBinCode',
        dataIndex: 'toBinCode',
        width: colWidth.codeColWidth
      },
    ];
    return (
      <TabPane key="basicInfo" tab={commonLocale.basicInfoLocale}>
        <ViewTabPanel style={{marginTop: '-23px'}}>
        <ViewPanel items={basicItems} title={commonLocale.profileItemsLocale} rightTile={this.darwProcess()}>
        </ViewPanel>
        <ViewTablePanel title={commonLocale.itemsLocale} columns={columns} data={entity.items ? entity.items : []} />
        <ConfirmModal
          visible={this.state.modalVisible}
          operate={this.state.operate}
          object={rplLocale.title + ':' + this.state.entity.billNumber}
          onOk={this.handleOk}
          onCancel={this.handleModalVisible}
        />
        </ViewTabPanel>
      </TabPane>
    );
  }

  drawOthers = () => {
    const others = [];
    if (this.state.showProcessView) {
      const { entity } = this.state;
      const data = [{
        title: '开始补货',
        subTitle: entity.startRplTime,
        current: entity.state !== '',
        description: [{
          label: commonLocale.inAllQtyStrLocale,
          value: entity.totalQtyStr
        }, {
          label: commonLocale.inAllVolumeLocale,
          value: entity.totalVolume
        }, {
          label: commonLocale.inAllWeightLocale,
          value: entity.totalWeight
        }]
      },{
        title: '结束补货',
        subTitle: entity.endRplTime,
        current: entity.state == State.AUDITED.name,
        description: [{
          label: commonLocale.inAllRealQtyStrLocale,
          value: entity.realTotalQtyStr
        }, {
          label: commonLocale.inAllRealVolumeLocale,
          value: entity.realTotalVolume
        }, {
          label: commonLocale.inAllRealWeightLocale,
          value: entity.realTotalWeight
        }]
      }];
      others.push(<ProcessViewPanel closeCallback={this.viewProcessView} visible={this.state.showProcessView} data={data} />);
    }
    return others;
  }
}
