import { Button, message, Spin, Tabs } from 'antd';
import { connect } from 'dva';
import ViewPage from '@/pages/Component/Page/ViewPage';
import { teamLocale } from '@/pages/Basic/Team/TeamLocale';
import { commonLocale } from '@/utils/CommonLocale';
import TagUtil from '@/pages/Component/TagUtil';
import React, { Component, Fragment } from 'react';
import Empty from '@/pages/Component/Form/Empty';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import TabsPanel from '@/pages/Component/Form/TabsPanel';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import ViewTable from '@/pages/Basic/Team/ViewTable';
import team from '@/models/basic/team';
import { State } from '@/pages/Basic/Team/TeamConstant';
import { havePermission } from '@/utils/authority';
import { TEAM_RES } from '@/pages/Basic/Team/TeamPermission';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import UserTab from './UserTab';
import VehicleTab from './VehicleTab';
import CustomerTab from './CustomerTab';
import styles from '@/pages/Out/Wave/Wave.less';

const TabPane = Tabs.TabPane;

@connect(({ team, loading }) => ({
  team,
  loading: loading.models.team,
}))
export default class TeamViewPage extends ViewPage {
  constructor(props) {
    super(props);
    this.state = {
      entity: {
        users: [],
        vehicles: [],
        customers: [],
      },
      entityUuid: props.team.entityUuid,
      entityCode: props.team.entityCode,
      title: '',
      operate: '',
    }
  }
  componentDidMount() {
    this.refresh(this.state.entityCode, this.state.entityUuid);
  }

  componentWillReceiveProps(nextProps) {
    const entity = nextProps.team.entity;
    if (entity && (entity.code === this.state.entityCode || entity.uuid === this.state.entityUuid)) {
      this.setState({
        entity: entity,
        title: "[" + entity.code + "]" + entity.name,
        entityState: entity.state,
        realChecked: entity.state === State.ONLINE.name,
        entityUuid: entity.uuid,
        entityCode: entity.code,
      });
    }
    const nextEntityCode = nextProps.entityCode;
    if (nextEntityCode && nextEntityCode !== this.state.entityCode) {
      this.setState({
        entityCode: nextEntityCode
      });
      this.refresh(nextEntityCode);
    }

    const nextEntityUuid = nextProps.entityUuid;
    if (nextEntityUuid && nextEntityUuid !== this.state.entityUuid) {
      this.setState({
        entityUuid: nextEntityUuid
      });
      this.refresh(undefined, nextEntityUuid);
    }
  }

  /**
   * 刷新
   */

  refresh(entityCode, entityUuid) {
    const { entity } = this.state;
    if (!entityCode && !entityUuid) {
      entityCode = this.state.entityCode;
    }

    if (entityCode) {
      this.props.dispatch({
        type: 'team/getByCode',
        payload: {
          code: entityCode
        },
        callback: (response) => {
          // 当查询实体结果为空时，给出错误信息，返回列表页
          if (!response || !response.data || !response.data.uuid) {
            this.onBack();
          } else {
            this.setState({
              entityCode: response.data.code,
              entity: { ...entity }
            });
          }
        }
      });
      return;
    }

    if (entityUuid) {
      this.props.dispatch({
        type: 'team/get',
        payload:entityUuid,
        callback: (response) => {
          // 当查询实体结果为空时，给出错误信息，返回列表页
          if (!response || !response.data || !response.data.uuid) {
            this.onBack();
          } else {
            this.setState({
              entityCode: response.data.code
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
      type: 'team/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  /**
   * 编辑
   */
  onEdit = () => {
    this.props.dispatch({
      type: 'team/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entityUuid,
      }
    });
  }
  /**
   * 删除
   */
  onDelete = () => {
    const { entity } = this.state
    this.props.dispatch({
      type: 'team/onRemove',
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
  onOnline = (record, batch) => {
    const { entity } = this.state;
    const { dispatch } = this.props;
    const that = this;
    dispatch({
      type: 'team/online',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: response => {
        if (response && response.success) {
          this.refresh(this.state.entityCode, this.state.entityUuid);
          message.success(commonLocale.onlineSuccessLocale);
        }
      }
    });
  }

  onOffline = (record, batch) => {
    const { entity } = this.state;
    const { dispatch } = this.props;
    const that = this;
    dispatch({
      type: 'team/offline',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: response => {
        if (response && response.success) {
          this.refresh(this.state.entityCode, this.state.entityUuid);
          message.success(commonLocale.offlineSuccessLocale);
        }
      }
    });
  }

  onChangeState = () => {
    const { entity } = this.state;
    let type = '';
    if (this.state.entity.state === State.OFFLINE.name)
        type = 'team/online';
    else if(this.state.entity.state === State.ONLINE.name)
        type = 'team/offline';
    this.props.dispatch({
        type: type,
        payload: {
          uuid: entity.uuid,
          version: entity.version
        },
        callback: response => {
            this.props.dispatch({
                type: 'team/get',
                payload: this.state.entity.uuid
            })
        }
    })
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
            State[this.state.entity.state].name === 'OFFLINE' ?
              <Button onClick={this.onOnline}>
                {commonLocale.onlineLocale}
              </Button> :
              <Button onClick={this.onOffline}>
                {commonLocale.offlineLocale}
              </Button>
          }
          <Button disabled={!havePermission(TEAM_RES.EDIT)} onClick={() => this.onEdit()}>
            {commonLocale.editLocale}
          </Button>
        </Fragment>
      );
    }
  }

  /**
   * 绘制信息详情
   */
  drawTeamInfoTab = () => {
    const { entity } = this.state;

    let profileItems = [
      {
        label: commonLocale.codeLocale,
        value: entity.code? entity.code : <Empty />,
      },
      {
        label: commonLocale.nameLocale,
        value: entity.name? entity.name : <Empty />,
      },
      {
        label: commonLocale.noteLocale,
        value: entity.note ? entity.note : <Empty />
      }
    ];

    let employeeColumns = [
      {
        title: commonLocale.codeLocale,
        width: 100,
        render: record => record.user.code? record.user.code : ''
      },
      {
        title: commonLocale.nameLocale,
        width: 100,
        render: record => record.user.name? record.user.name : ''
      },
    ]
    let vehicleColumns = [
      {
        title: commonLocale.codeLocale,
        width: 100,
        render: record => record.vehicleCode? record.vehicleCode : ''
      },
      {
        title: '车牌',
        width: 100,
        render: record => record.plateNumber? record.plateNumber : ''
      },
    ]
    let customerColumns = [
      {
        title: commonLocale.codeLocale,
        width: 100,
        render: record => record.customer.code? record.customer.code : ''
      },
      {
        title: commonLocale.nameLocale,
        width: 100,
        render: record => record.customer.name? record.customer.name : ''
      },
    ]
    let tabsItem = [
      <UserTab
        title='人员' 
        entityUuid={entity.uuid}
        data={entity.users? entity.users : []}
        dispatch={this.props.dispatch}
        refresh={this.refresh}
      />,
      <VehicleTab
        title='车辆' 
        entityUuid={entity.uuid}
        data={entity.vehicles? entity.vehicles : []}
        dispatch={this.props.dispatch}
        refresh={this.refresh}
      />,
      <CustomerTab
        title='客户' 
        entityUuid={entity.uuid}
        data={entity.customers? entity.customers : []}
        dispatch={this.props.dispatch}
        refresh={this.refresh}
      />,
    ];
    let itemsTab =<Tabs defaultActiveKey="user" className={styles.ItemTabs}>
      <TabPane tab={'人员'} key="user">
        <UserTab
          entityUuid={entity.uuid}
          data={entity.users ? entity.users : []}
          dispatch={this.props.dispatch}
          refresh={this.refresh}
        />
      </TabPane>
      <TabPane tab={'车辆'} key="vehicle">
        <VehicleTab
          entityUuid={entity.uuid}
          data={entity.vehicles? entity.vehicles : []}
          dispatch={this.props.dispatch}
          refresh={this.refresh}
        />
      </TabPane>
      <TabPane tab={'客户'} key="customer">
        <CustomerTab
          entityUuid={entity.uuid}
          data={entity.customers? entity.customers : []}
          dispatch={this.props.dispatch}
          refresh={this.refresh}
        />
      </TabPane>
    </Tabs>;
    return (
      <TabPane key="basicInfo" tab={"班组"}>
        <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} />
        <ViewPanel children={itemsTab} title={commonLocale.itemsLocale}/>
        <div>
          <ConfirmModal
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={teamLocale.title + ':' + this.state.entity.code}
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
      this.drawTeamInfoTab(),
    ];

    return tabPanes;
  }
}
