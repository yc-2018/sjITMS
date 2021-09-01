import { connect } from 'dva';
import { Button, Form, message, Switch } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { orgType } from '@/utils/OrgType';
import { commonLocale } from '@/utils/CommonLocale';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { teamLocale } from '@/pages/Basic/Team/TeamLocale';
import { State } from '@/pages/Basic/Team/TeamConstant';
import { VehicleState } from '@/pages/Tms/Vehicle/VehicleLocale';
import TeamSearchForm from '@/pages/Basic/Team/TeamSearchForm';
import React, { Fragment } from 'react';
import { TEAM_RES } from '@/pages/Basic/Team/TeamPermission';
import { havePermission } from '@/utils/authority';
import { colWidth } from '@/utils/ColWidth';

@connect(({ team, loading }) => ({
  team,
  loading: loading.models.team,
}))
@Form.create()
export default class TeamSearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: teamLocale.title,
      data: props.team.data,
      key: 'team.search.table'
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dispatchCenterUuid = loginOrg().uuid;
  }

  componentDidMount() {
    this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.team.data,
    });
  }

  onCreate = (entity) => {
    const payload = {
      showPage: 'create',
    }
    if (entity) {
      payload.entityUuid = entity.uuid;
    }
    this.props.dispatch({
      type: 'team/showPage',
      payload: { ...payload }
    });
  }

  onView = (record) => {
    this.props.dispatch({
      type: 'team/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  onSearch = (data) => {
    const { pageFilter } = this.state;
    if (data) {
      pageFilter.likeKeyValues = {
        ...pageFilter.likeKeyValues,
      },
        pageFilter.searchKeyValues = {
          ...pageFilter.searchKeyValues,
          codeName: data.codeName,
          state: data.state,
        }
    } else {
      pageFilter.searchKeyValues = {
        dispatchCenterUuid: loginOrg().uuid,
        companyUuid: loginCompany().uuid,
      },
        pageFilter.likeKeyValues = {
        }
    }
    this.refreshTable();
  }

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    pageFilter.searchKeyValues = {
      ...pageFilter.searchKeyValues,
    }

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = {
        ...pageFilter,
        ...filter
      };
    }

    dispatch({
      type: 'team/query',
      payload: queryFilter,
    });
  };

  onOnline = (record, batch) => {
    const { dispatch } = this.props;
    const that = this;
    dispatch({
      type: 'team/online',
      payload: {
        uuid: record.uuid,
        version: record.version
      },
      callback: response => {
        if (batch) {
          that.batchCallback(response, record);
          return;
        }
        if (response && response.success) {
          this.refreshTable();
          message.success(commonLocale.onlineSuccessLocale);
        }
      }
    });
  }

  onOffline = (record, batch) => {

    const { dispatch } = this.props;
    const that = this;
    dispatch({
      type: 'team/offline',
      payload: {
        uuid: record.uuid,
        version: record.version
      },
      callback: response => {
        if (batch) {
          that.batchCallback(response, record);
          return;
        }
        if (response && response.success) {
          this.refreshTable();
          message.success(commonLocale.offlineSuccessLocale);
        }
      }
    });
  }

  drawSearchPanel = () => {
    return <TeamSearchForm filterEqualsValue={this.state.pageFilter.searchKeyValues}
                           filterLikeValue={this.state.pageFilter.likeKeyValues} refresh={this.onSearch} />;
  }

  drawToolbarPanel = () => {
    return loginOrg().type === orgType.dispatchCenter.name && [
      <Button key='online' disabled={!havePermission(TEAM_RES.ONLINE)} onClick={() => this.onBatchOnline()}>
        {commonLocale.batchOnlineLocale}
      </Button>,
      <Button key='offline' disabled={!havePermission(TEAM_RES.ONLINE)} onClick={() => this.onBatchOffline()}>
        {commonLocale.batchOfflineLocale}
      </Button>,
    ];
  }

  onBatchOnline = () => {
    this.setState({
      batchAction: commonLocale.onlineLocale
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchOffline = () => {
    this.setState({
      batchAction: commonLocale.offlineLocale
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchProcess = () => {
    const { selectedRows, batchAction } = this.state;

    const that = this;
    selectedRows.forEach(function (e) {
      if (batchAction === commonLocale.onlineLocale) {
        if (e.state === State.ONLINE.name) {
          that.refs.batchHandle.calculateTaskSkipped();
        } else {
          that.onOnline(e, true);
        }
      }
      else if (batchAction === commonLocale.offlineLocale) {
        if (e.state === VehicleState.OFFLINE.name) {
          that.refs.batchHandle.calculateTaskSkipped();
        } else {
          that.onOffline(e, true);
        }
      }
    });
  }

  drawOtherCom = () => {
    return (
      <div>
        {this.drawProgress()}
      </div>
    );
  }

  drawActionButton = () => {
    return (
      <Fragment>
        <Button icon="plus" type="primary" disabled={!havePermission(TEAM_RES.CREATE)} onClick={() => this.onCreate()}>
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    )
  }

  renderOperateCol = (record) => {
    const options = [];
    options.push(
      {
        name: commonLocale.editLocale,
        disabled: !havePermission(TEAM_RES.EDIT),
        onClick: this.onCreate.bind(this, record),
      }
    )
    return <OperateCol menus={options} />
  }

  columns = [
    {
      title: commonLocale.codeLocale,
      dataIndex: 'code',
      sorter: true,
      render: (text, record) => {
        return (
          <a onClick={() => this.onView(record)}>
            {text}
          </a>
        );
      }
    },
    {
      title: commonLocale.nameLocale,
      dataIndex: 'name',
    },
    {
      title: commonLocale.stateLocale,
      dataIndex: 'state',
      render: text => {
        return (
          <span> {State[text].caption} </span>
        )
      }
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: (text, record) => (
        this.renderOperateCol(record)
      ),
    },
  ];
}
