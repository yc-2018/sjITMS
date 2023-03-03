import React from 'react';
import { Button, message, Checkbox, Input } from 'antd';
import { connect } from 'dva';
import { Fragment } from 'react';
import { loginCompany } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import { DispatchingConfigLocale } from './DispatchingConfigLocale';
import DispatchingConfigCreateModal from './DispatchingConfigCreateModal';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import DispatcherConfigSearchForm from './DispatchingConfigSearchForm';

@connect(({ dispatcherconfig, dispatcherconfigModal, loading }) => ({
  dispatcherconfig,
  dispatcherconfigModal,
  loading: loading.models.dispatcherconfig,
}))
export default class DispatchingConfig extends ConfigSearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: DispatchingConfigLocale.title,
      data: this.props.dispatcherconfig.data,
      entity: {},
      createModalVisible: false,
      hideLogTab: true,
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
  }

  columns = [
    {
      title: DispatchingConfigLocale.dispatchcenteruuid,
      dataIndex: 'dispatchCenterUuid',
    },
    {
      title: DispatchingConfigLocale.dispatchcentername,
      dataIndex: 'dispatchCenterName',
      render: (_, record) =>
        record.dispatchCenterName
          ? '[' + record.dispatchCenterCode + ']' + record.dispatchCenterName
          : '',
    },
    {
      title: DispatchingConfigLocale.isSumOrder,
      dataIndex: 'isSumOrder',
      render: (val, record) => (
        <Checkbox checked={val} onChange={event => this.onChange(record, 'isSumOrder', event)} />
      ),
    },
    {
      title: DispatchingConfigLocale.isCommendVeh,
      dataIndex: 'isCommendVeh',
      render: (val, record) => (
        <Checkbox
          checked={val === 1}
          onChange={event => this.onChange(record, 'isCommendVeh', event)}
        />
      ),
    },
    {
      title: DispatchingConfigLocale.isCommendEmp,
      dataIndex: 'isCommendEmp',
      render: (val, record) => (
        <Checkbox
          checked={val === 1}
          onChange={event => this.onChange(record, 'isCommendEmp', event)}
        />
      ),
    },
    {
      title: DispatchingConfigLocale.isStuckEmpType,
      dataIndex: 'isStuckEmpType',
      render: (val, record) => (
        <Checkbox
          checked={val === 1}
          onChange={event => this.onChange(record, 'isStuckEmpType', event)}
        />
      ),
    },
    {
      title: DispatchingConfigLocale.isShowSum,
      dataIndex: 'isShowSum',
      render: (val, record) => (
        <Checkbox
          checked={val === 1}
          onChange={event => this.onChange(record, 'isShowSum', event)}
        />
      ),
    },
    {
      title: DispatchingConfigLocale.checkArea,
      dataIndex: 'checkArea',
      render: (val, record) => (
        <Checkbox
          checked={val === 1}
          onChange={event => this.onChange(record, 'checkArea', event)}
        />
      ),
    },
    {
      title: DispatchingConfigLocale.checkBaseData,
      dataIndex: 'checkBaseData',
      render: (val, record) => (
        <Checkbox
          checked={val === 1}
          onChange={event => this.onChange(record, 'checkBaseData', event)}
        />
      ),
    },
    {
      title: DispatchingConfigLocale.calvehicle,
      dataIndex: 'calvehicle',
      render: (val, record) => (
        <Checkbox
          checked={val === 1}
          onChange={event => this.onChange(record, 'calvehicle', event)}
        />
      ),
    },
  ];

  onChange = (record, field, event) => {
    record[field] = event.target.checked ? 1 : 0;
    this.props
      .dispatch({
        type: 'dispatcherconfig/updateDispatchConfig',
        payload: record,
      })
      .then(() => {
        this.refreshTable();
      });
  };
  onInputChange = (record, field, val) => {
    record[field] = Number(val);
    this.props
      .dispatch({
        type: 'dispatcherconfig/updateDispatchConfig',
        payload: record,
      })
      .then(() => {
        this.refreshTable();
      });
  };

  componentDidMount = () => {
    this.refreshTable();
    this.props.dispatch({
      type: 'dispatcherconfigModal/getByCompanyUuid',
      payload: loginCompany().uuid,
    });
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.dispatcherconfig.data ? nextProps.dispatcherconfig.data : {},
      dispatchData: nextProps.dispatcherconfigModal.dispatchData
        ? nextProps.dispatcherconfigModal.dispatchData
        : [],
    });
  }

  refreshTable = filter => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }

    dispatch({
      type: 'dispatcherconfig/queryDispatchConfig',
      payload: queryFilter,
    });
  };

  onSearch = data => {
    const { pageFilter } = this.state;
    if (data) {
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
      };
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
      };
    }
    this.refreshTable();
  };

  handleCreateModalVisible = flag => {
    this.setState({
      entity: {},
    });

    this.setState({
      createModalVisible: !!flag,
    });
  };

  handleSave = () => {
    const { entity } = this.state;
    let type = 'dispatcherconfig/insertDispatchConfig';
    this.props.dispatch({
      type: type,
      payload: entity,
      callback: response => {
        if (response && response.success) {
          this.handleCreateModalVisible(false);
          this.refreshTable();
        }
      },
    });
  };

  handleRemove = (uuid, callback) => {
    if (uuid) {
      this.props.dispatch({
        type: 'dispatcherconfig/remove',
        payload: uuid,
        callback: callback
          ? callback
          : response => {
              if (response && response.success) {
                this.refreshTable();
                message.success(commonLocale.removeSuccessLocale);
              }
            },
      });
    }
  };

  onBatchRemove = () => {
    this.setState({
      batchAction: commonLocale.deleteLocale,
    });
    this.handleBatchProcessConfirmModalVisible(true);
  };

  onBatchProcess = () => {
    const { selectedRows, batchAction } = this.state;

    const that = this;
    selectedRows.forEach(item => {
      if (batchAction === commonLocale.deleteLocale) {
        that.handleRemove(item.uuid, that.batchCallback);
      }
    });
  };

  drawCreateModal = () => {
    const { entity, dispatchData, createModalVisible } = this.state;
    const createModalProps = {
      dispatchData: dispatchData,
      entity: entity,
      modalVisible: createModalVisible,
      handleCreateModalVisible: this.handleCreateModalVisible,
      handleSave: this.handleSave,
      loading: this.props.loading,
    };

    return <DispatchingConfigCreateModal {...createModalProps} />;
  };

  drawSearchPanel = () => {
    const { pageFilter, dispatchData } = this.state;
    return (
      <DispatcherConfigSearchForm
        filterValue={pageFilter.searchKeyValues}
        refresh={this.onSearch}
        dispatchData={dispatchData}
      />
    );
  };

  drawActionButton() {
    return (
      <Fragment>
        <Button type="primary" icon="plus" onClick={() => this.handleCreateModalVisible(true)}>
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    );
  }
}
