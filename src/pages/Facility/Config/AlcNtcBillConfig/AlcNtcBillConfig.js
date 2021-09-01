import { Divider, Button, message, Popconfirm, Table } from 'antd';
import { connect } from 'dva';
import { Fragment } from 'react';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import AlcNtcBillConfigCreateModal from './AlcNtcBillConfigCreateModal';

@connect(({ alcNtcBillConfig, loading }) => ({
  alcNtcBillConfig,
  loading: loading.models.alcNtcBillConfig,
}))
export default class AlcNtcBillConfig extends ConfigSearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: '配单分单类型配置',
      selectedRows: [],
      data: {
        list:this.props.alcNtcBillConfig.saveAlcNtcBillConfigList
      },
      createModalVisible: false,
      entity: {},
      logCaption: 'AlcNtcBillConfig',
      suspendLoading:false,
    };
  }

  columns = [{
    title: '配单类型',
    key: 'alcntcType',
    dataIndex: 'alcntcType',
    width: itemColWidth.qpcStrColWidth,
  },{
    title: commonLocale.operateLocale,
    key: 'action',
    width: colWidth.operateColWidth,
    render: (text, record) => (
      <span>
        <IPopconfirm onConfirm={() => this.handleRemove(record, false)}
          operate={commonLocale.deleteLocale}
          object={'配单分单类型配置'}>
          <a>{commonLocale.deleteLocale}</a>
        </IPopconfirm>
      </span>
    ),
  }];

  componentDidMount = () => {
    this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: {list:nextProps.alcNtcBillConfig.saveAlcNtcBillConfigList}
    });
  }

  refreshTable = () => {
    this.props.dispatch({
      type: 'alcNtcBillConfig/queryByDc',
    })
  }


  //新增按钮
  drawActionButton = () => {
    return (
      <Fragment>
        <Button type='primary' icon="plus"
          onClick={() => this.handleCreateModalVisible(true)}
        >
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    );
  }

  /**
   *新增界面
   */
  drawCreateModal = () => {
    const {
      createModalVisible,
      entity
    } = this.state;
    const createModalProps = {
      modalVisible: createModalVisible,
      handleCreateModalVisible: this.handleCreateModalVisible,
      refreshTable: this.refreshTable,
      entity: entity,
    }
    return (
      <AlcNtcBillConfigCreateModal {...createModalProps} />
    );
  }

  /**
   *批量删除
   */
  drawToolbarPanel() {
    return (
      <Fragment>
        <Button
          onClick={() =>
            this.onBatchRemove()
          }
        >
          {commonLocale.batchRemoveLocale}
        </Button>
      </Fragment>
    );
  }

  onBatchRemove = () => {
    this.setState({
      batchAction: basicState.REMOVE.caption,
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchProcess = () => {
    this.setState({
      suspendLoading:true
    })
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === basicState.REMOVE.caption) {
          that.handleRemove(selectedRows[i],true).then(res => {
            bacth(i + 1);
          })
        } else {
          that.refs.batchHandle.calculateTaskSkipped();
          bacth(i + 1);
        }
      }else{
        this.setState({
          suspendLoading:false
        })
      }
    }
    bacth(0);
  }


  handleCreateModalVisible = (flag, uuid) => {
    this.setState({
      createModalVisible: !!flag,
    })
  }

  handleSave = (fieldsValue) => {
    let { entity } = this.state;
    let pickAreas = [];
    if (fieldsValue.pickarea != undefined) {
      pickAreas = fieldsValue.pickarea.map((val) => {
        let obj = JSON.parse(val);
        return obj;
      })
    }
    let params = {
      ...fieldsValue,
      dockGroup: JSON.parse(fieldsValue.dockGroup),
      pickarea: pickAreas,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      version: entity ? entity.version : 0,
    }
    let type = 'alcNtcBillConfig/save';
    let that = this;

    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: type,
        payload: params,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
            that.handleCreateModalVisible(false);
            resolve({ success: response.success });
            that.refreshTable();
          }else{
            reject({ success: response.success });
          }
        },
      })
    })
  }

  handleRemove = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'alcNtcBillConfig/remove',
        payload: {
          alcntcType: record.alcntcType,
          version: 0,
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

}
