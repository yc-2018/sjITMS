import React, { Component } from 'react';
import { Divider, Button, message, Popconfirm, Tooltip } from 'antd';
import { connect } from 'dva';
import { Fragment } from 'react';
import { formatMessage } from 'umi/locale';
import StandardTable from '@/components/StandardTable';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { strSeparatorEllipsis } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import Empty from '@/pages/Component/Form/Empty';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { DELIVERYCYCLE_RES } from '../DeliverycyclePermission';
import { deliverycycleLocale } from '../DeliverycycleLocale'
import StoreDeliverycycleSearchForm from './StoreDeliverycycleSearchForm';
import StoreDeliverycycleCreateModal from './StoreDeliverycycleCreateModal';
import { STORE_RES } from '../../../Basic/Store/StorePermission';
import { routerRedux } from 'dva/router';
@connect(({ deliverycycle, loading }) => ({
  deliverycycle,
  loading: loading.models.deliverycycle,
}))
export default class StoreDeliverycycle extends ConfigSearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: '[' + this.props.selectedStoreGroup.code + ']' + this.props.selectedStoreGroup.name,
      data: [],
      entity: {},
      selectedStoreGroup: props.selectedStoreGroup,
      createModalVisible: false,
      scroll: { x: 1100 },
      onlyEntityUuid: true,
      logCaption: this.props.selectedStoreGroup.uuid,
      suspendLoading: false,      
    };
  }

  componentDidMount = () => {

    this.refreshTable();

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.deliverycycle.data && nextProps.deliverycycle.data != this.props.deliverycycle.data) {
      this.setState({
        data: nextProps.deliverycycle.data,
      })
    }
    if (nextProps.deliverycycle.storeEntity && nextProps.deliverycycle.storeEntity != this.props.deliverycycle.storeEntity) {
      this.setState({
        entity: nextProps.deliverycycle.storeEntity,
      })
    }
    if (nextProps.selectedStoreGroup && nextProps.selectedStoreGroup != this.props.selectedStoreGroup) {
      this.state.pageFilter.searchKeyValues.storeType = undefined;
      this.state.pageFilter.searchKeyValues.codeName = undefined;
      this.state.pageFilter.searchKeyValues.operatingType = undefined;      
        this.setState({
          selectedStoreGroup: nextProps.selectedStoreGroup,
          title: '[' + nextProps.selectedStoreGroup.code + ']' + nextProps.selectedStoreGroup.name,
          logCaption: nextProps.selectedStoreGroup.uuid,
        });
      this.refreshTable(nextProps.selectedStoreGroup);
    }
  }

  /**
   * 查询门店配送周期
   */
  refreshTable = (storeGroup) => {
    const { dispatch } = this.props;
    const { pageFilter, selectedStoreGroup } = this.state;
    let queryFilter = { ...pageFilter };
    queryFilter.searchKeyValues['deliveryCycleUuid'] = (storeGroup && storeGroup.deliveryCycleUuid) ? storeGroup.deliveryCycleUuid : selectedStoreGroup.deliveryCycleUuid
    queryFilter.searchKeyValues['storeGroupUuid'] = (storeGroup && storeGroup.uuid) ? storeGroup.uuid : selectedStoreGroup.uuid
    queryFilter.searchKeyValues['dcUuid'] = loginOrg().uuid;
    queryFilter.searchKeyValues['companyUuid'] = loginCompany().uuid;
    dispatch({
      type: 'deliverycycle/query',
      payload: queryFilter,
    });
  };

  /**
   * 条件搜索
   */
  onSearch = (data) => {
    const { pageFilter } = this.state;
    if (data) {
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        ...data

      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        owner: '',
        state: ''
      }
    }
    this.refreshTable();
  }

  /**
   * 控制编辑/新增门店配送周期模态框
   */
  handleCreateModalVisible = (flag, deliveryCycleUuid, uuid) => {
    if (flag && uuid) {
      this.getEntityByUuid(uuid);
    } else if (!uuid) {
      this.setState({
        entity: {},
      })
    }
    this.setState({
      createModalVisible: !!flag,
    })
  }

  /**
   * 查询一条门店配送周期信息
   */
  getEntityByUuid = (uuid) => {
    this.props.dispatch({
      type: 'deliverycycle/getStoreDeliveryCycle',
      payload: uuid,
      callback: response => {
        if (response && response.success) {
          let data = response.data;
          if (data) {
            const { mon, tues, wed, thur, fri, sat, sun } = data;
            if (mon) {
              let mons = mon.split(",");
              data['mons'] = mons;
            }
            if (tues) {
              let tuess = tues.split(",");
              data['tuess'] = tuess;
            }
            if (wed) {
              let weds = wed.split(",");
              data['weds'] = weds;
            }
            if (thur) {
              let thurs = thur.split(",");
              data['thurs'] = thurs;
            }
            if (fri) {
              let fris = fri.split(",");
              data['fris'] = fris;
            }
            if (sat) {
              let sats = sat.split(",");
              data['sats'] = sats;
            }
            if (sun) {
              let suns = sun.split(",");
              data['suns'] = suns;
            }
            this.setState({
              entity: data,
            })
          }
        }
      }
    });
  }

  /**
   * 数据处理
   */
  arrToStr = (arr) => {
    if (Array.isArray(arr)) {
      let str = "";
      let separator = ",";
      arr.map(item => {
        if (item) {
          str = str + item + separator;
        }
      })
      return str.substr(0, str.length - 1);
    }

    return arr;
  }

  /**
   * 保存/新增 门店配送周期
   */
  handleSaveOrModify = (fieldsValue) => {
    const { entity, selectedStoreGroup } = this.state;
    const { mons, tuess, weds, thurs, fris, sats, suns } = fieldsValue;

    if (mons) {
      let mon = this.arrToStr(mons);
      fieldsValue['mon'] = mon;
    }

    if (tuess) {
      let tues = this.arrToStr(tuess);
      fieldsValue['tues'] = tues;
    }

    if (weds) {
      let wed = this.arrToStr(weds);
      fieldsValue['wed'] = wed;
    }

    if (thurs) {
      let thur = this.arrToStr(thurs);
      fieldsValue['thur'] = thur;
    }

    if (fris) {
      let fri = this.arrToStr(fris);
      fieldsValue['fri'] = fri;
    }

    if (sats) {
      let sat = this.arrToStr(sats);
      fieldsValue['sat'] = sat;
    }

    if (suns) {
      let sun = this.arrToStr(suns);
      fieldsValue['sun'] = sun;
    }



    let params = {
      ...fieldsValue,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      deliveryCycleUuid: selectedStoreGroup.deliveryCycleUuid,
      storeGroup: {
        uuid: selectedStoreGroup.uuid,
        code: selectedStoreGroup.code,
        name: selectedStoreGroup.name
      }
    }
    let type = 'deliverycycle/onSaveStoreDeliveryCycle';
    if (entity.uuid) {
      type = 'deliverycycle/onModifyStoreDeliveryCycle';
      params['uuid'] = entity.uuid;
    }
    if (fieldsValue.stores) {
      for (let index in fieldsValue.stores) {
        params['store'] = JSON.parse(fieldsValue.stores[index]);
        delete params.store.type;
        this.props.dispatch({
          type: type,
          payload: params,
          callback: (response) => {
            if (response && response.success) {
              this.refreshTable();
              message.success(JSON.parse(fieldsValue.stores[index]).name + commonLocale.saveSuccessLocale);

            }
          },
        })
        this.handleCreateModalVisible(false);
      }

    }
    if (entity.uuid) {
      params['uuid'] = entity.uuid;
      params['store'] = entity.store;
      this.props.dispatch({
        type: type,
        payload: params,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.modifySuccessLocale);
            this.handleCreateModalVisible(false);
            this.refreshTable();
          }
        },
      })
    }
  }

  /**
   * 单一删除
   */
  handleRemove = (record, callback) => {
    const that = this;
    const { dispatch } = this.props;
    if (record.deliveryCycleUuid) {
      return new Promise(function (resolve, reject) {
        dispatch({
          type: 'deliverycycle/onRemoveStoreDeliveryCycle',
          payload: {
            deliveryCycleUuid: record.deliveryCycleUuid,
            storeUuid: record.store.uuid,
          },
          callback: (response) => {
            if (callback) {
              that.batchCallback(response, record);
              resolve({ success: response.success });
              return;
            }
            if (response && response.success) {
              that.refreshTable();
              message.success(commonLocale.removeSuccessLocale);
            }
          }
        })
      })
    }
  }

  /**
   * 批量删除入口
   */
  onBatchRemove = () => {
    this.setState({
      batchAction: basicState.REMOVE.caption,
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  /**
   * 批量删除入口
   */
  onBatchProcess = () => {
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === basicState.REMOVE.caption) {
          this.handleRemove(selectedRows[i], true).then(res => {
            bacth(i + 1)
          });
        }
      } else {
        this.setState({
          suspendLoading: false
        })
      }
    }

    bacth(0);
  }

  fetchOperateProps = (record) => {
    return [{
      name: commonLocale.editLocale,
      onClick: this.handleCreateModalVisible.bind(this, true, record.deliveryCycleUuid, record.uuid),
      disabled: !havePermission(DELIVERYCYCLE_RES.EDIT)
    }, {
      name: commonLocale.deleteLocale,
      confirm: true,
      confirmCaption: deliverycycleLocale.deliverycycleStoreName + deliverycycleLocale.deliverycycleTitle,
      disabled: !havePermission(DELIVERYCYCLE_RES.DELETE),
      onClick: this.handleRemove.bind(this, record, false)
    }];
  }

  renderOperateCol = (record) => {
    return <OperateCol menus={this.fetchOperateProps(record)} />

  }

  /**
   * 跳转到门店详情页面
   */
  onViewStore = (storeUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/store',
      payload: {
        showPage: 'view',
        entityUuid: storeUuid
      }
    }));
  }

  /**
   * 绘制表格列
   */
  columns = [{
    title: deliverycycleLocale.deliverycycleStoreName,
    dataIndex: 'store',
    key: 'storeName',
    width: colWidth.codeNameColWidth,
    render: text =>
      <a onClick={this.onViewStore.bind(true, text ? text.uuid : undefined)}
        disabled={!havePermission(STORE_RES.VIEW)}><EllipsisCol colValue={convertCodeName(text)} /></a>,
  }, {
    title: deliverycycleLocale.deliverycycleStoreType,
    dataIndex: 'storeType',
    key: 'storeType',
    width: colWidth.enumColWidth,
    render: text => <EllipsisCol colValue={text} />,
  }, {
    title: deliverycycleLocale.deliverycycleOperatingType,
    dataIndex: 'operatingType',
    key: 'operatingType',
    width: colWidth.enumColWidth,
  }, {
    title: deliverycycleLocale.deliverycycleMon,
    dataIndex: 'mon',
    key: 'mon',
    width: colWidth.codeColWidth,
    render: (val, record) => {
      if (val) {
        let arr = val.split(',');
        let res = strSeparatorEllipsis(arr, 1, '、', true);
        let items = res.items;
        let allItems = res.allItems;
        return <Tooltip placement="top" title={allItems}>
          <span >{items}</span>
        </Tooltip>
      } else {
        return <Empty />
      }
    }
  }, {
    title: deliverycycleLocale.deliverycycleTues,
    dataIndex: 'tues',
    key: 'tues',
    width: colWidth.codeColWidth,
    render: (val, record) => {
      if (val) {
        let arr = val.split(',');
        let res = strSeparatorEllipsis(arr, 1, '、', true);
        let items = res.items;
        let allItems = res.allItems;
        return <Tooltip placement="top" title={allItems}>
          <span >{items}</span>
        </Tooltip>
      } else {
        return <Empty />
      }
    }
  }, {
    title: deliverycycleLocale.deliverycycleWed,
    dataIndex: 'wed',
    key: 'wed',
    width: colWidth.codeColWidth,
    render: (val, record) => {
      if (val) {
        let arr = val.split(',');
        let res = strSeparatorEllipsis(arr, 1, '、', true);
        let items = res.items;
        let allItems = res.allItems;
        return <Tooltip placement="top" title={allItems}>
          <span >{items}</span>
        </Tooltip>
      } else {
        return <Empty />
      }
    }
  }, {
    title: deliverycycleLocale.deliverycycleThur,
    dataIndex: 'thur',
    key: 'thur',
    width: colWidth.codeColWidth,
    render: (val, record) => {
      if (val) {
        let arr = val.split(',');
        let res = strSeparatorEllipsis(arr, 1, '、', true);
        let items = res.items;
        let allItems = res.allItems;
        return <Tooltip placement="top" title={allItems}>
          <span >{items}</span>
        </Tooltip>
      } else {
        return <Empty />
      }
    }
  }, {
    title: deliverycycleLocale.deliverycycleFri,
    dataIndex: 'fri',
    key: 'fri',
    width: colWidth.codeColWidth,
    render: (val, record) => {
      if (val) {
        let arr = val.split(',');
        let res = strSeparatorEllipsis(arr, 1, '、', true);
        let items = res.items;
        let allItems = res.allItems;
        return <Tooltip placement="top" title={allItems}>
          <span >{items}</span>
        </Tooltip>
      } else {
        return <Empty />
      }
    }
  }, {
    title: deliverycycleLocale.deliverycycleSat,
    dataIndex: 'sat',
    key: 'sat',
    width: colWidth.codeColWidth,
    render: (val, record) => {
      if (val) {
        let arr = val.split(',');
        let res = strSeparatorEllipsis(arr, 1, '、', true);
        let items = res.items;
        let allItems = res.allItems;
        return <Tooltip placement="top" title={allItems}>
          <span >{items}</span>
        </Tooltip>
      } else {
        return <Empty />
      }
    }
  },
  {
    title: deliverycycleLocale.deliverycycleSun,
    dataIndex: 'sun',
    key: 'sun',
    width: colWidth.codeColWidth,
    render: (val, record) => {
      if (val) {
        let arr = val.split(',');
        let res = strSeparatorEllipsis(arr, 1, '、', true);
        let items = res.items;
        let allItems = res.allItems;
        return <Tooltip placement="top" title={allItems}>
          <span >{items}</span>
        </Tooltip>
      } else {
        return <Empty />
      }
    }
  }, {
    title: commonLocale.operateLocale,
    key: 'action',
    width: colWidth.operateColWidth,
    fixed: 'right',
    render: record => (
      this.renderOperateCol(record)
    ),
  }];

  drawCreateModal = () => {
    const {
      entity,
      selectedRows,
      createModalVisible,
    } = this.state;

    const createModalProps = {
      entity: entity,
      modalVisible: createModalVisible,
      handleCreateModalVisible: this.handleCreateModalVisible,
      handleSaveOrModify: this.handleSaveOrModify,
    }
    return <StoreDeliverycycleCreateModal {...createModalProps} />
  }

  drawSearchPanel = () => {
    const { pageFilter } = this.state;
    return (<StoreDeliverycycleSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} />);
  }

  drawToolbarPanel() {
    return (
      <Fragment>
        <Button
          onClick={() =>
            this.onBatchRemove()
          }
          disabled={!havePermission(DELIVERYCYCLE_RES.DELETE)}
        >
          {commonLocale.batchRemoveLocale}
        </Button>
        <Button type='primary' icon='plus'
          onClick={() => this.handleCreateModalVisible(true)}
          disabled={!havePermission(DELIVERYCYCLE_RES.CREATE)}
        >
          {deliverycycleLocale.deliverycycleAddStoreDeliverycycle}
        </Button>
      </Fragment>
    );
  }
  drawActionButton() {

  }
}
