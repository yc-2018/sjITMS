import React from 'react';
import { Button, message, Checkbox, Input } from 'antd';
import { connect } from 'dva';
import { Fragment } from 'react';
import { loginCompany } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import { dispatcherConfigLocale } from './DispatcherConfigLocale';
import DispatcherConfigCreateModal from './DispatcherConfigCreateModal';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import DispatcherConfigSearchForm from './DispatcherConfigSearchForm';
import Select from '@/components/ExcelImport/Select';
import { SimpleSelect } from '@/pages/Component/RapidDevelopment/CommonComponent';

@connect(({ dispatcherconfig, dispatcherconfigModal, loading }) => ({
  dispatcherconfig,
  dispatcherconfigModal,
  loading: loading.models.dispatcherconfig,
}))
export default class PlanConfig extends ConfigSearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: dispatcherConfigLocale.title,
      data: this.props.dispatcherconfig.data,
      entity: {},
      createModalVisible: false,
      hideLogTab: true,
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
  }

  columns = [
    {
      title: dispatcherConfigLocale.dispatchcenteruuid,
      dataIndex: 'dispatchcenteruuid',
    },
    {
      title: dispatcherConfigLocale.name,
      dataIndex: 'name',
      render: (_, record) => (record.name ? '[' + record.code + ']' + record.name : ''),
    },
    {
      title: dispatcherConfigLocale.wharf,
      dataIndex: 'wharf',
      render: (val, record) => (
        <Checkbox checked={val} onChange={event => this.onChange(record, 'wharf', event)} />
      ),
    },
    {
      title: dispatcherConfigLocale.volume,
      dataIndex: 'volume',
      render: (val, record) => (
        <Checkbox checked={val === 1} onChange={event => this.onChange(record, 'volume', event)} />
      ),
    },
    {
      title: dispatcherConfigLocale.weight,
      dataIndex: 'weight',
      render: (val, record) => (
        <Checkbox checked={val === 1} onChange={event => this.onChange(record, 'weight', event)} />
      ),
    },
    {
      title: dispatcherConfigLocale.shipTime,
      dataIndex: 'shipTime',
      render: (val, record) => (
        <Input
          defaultValue={val}
          onBlur={event => this.onInputChange(record, 'shipTime', event.target.value)}
        />
      ),
    },
    {
      title: dispatcherConfigLocale.etcIssueStat,
      dataIndex: 'etcissuestat',
      render: (val, record) => (
        <SimpleSelect
          style={{ width: 300 }}
          searchField={{ searchCondition: 'in' }}
          // onSelect={(value, key) => {
          //   console.log('value', value, 'key', key);
          // }}
          onChange={value => this.onSelectChange(record, 'etcissuestat', value)}
          dictCode={'scheduleStat'}
        />
      ),
    },
    {
      title: dispatcherConfigLocale.moverCarEtc,
      dataIndex: 'movercaretc',
      render: (val, record) => (
        <Checkbox
          checked={val === 1}
          onChange={event => this.onChange(record, 'movercaretc', event)}
        />
      ),
    },
  ];

  onChange = (record, field, event) => {
    record[field] = event.target.checked ? 1 : 0;
    this.props
      .dispatch({
        type: 'dispatcherconfig/update',
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
        type: 'dispatcherconfig/update',
        payload: record,
      })
      .then(() => {
        this.refreshTable();
      });
  };
  onSelectChange = (record, field, val) => {
    record[field] = val.toString();
    this.props
      .dispatch({
        type: 'dispatcherconfig/update',
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
      type: 'dispatcherconfig/queryPlanConfig',
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

    let params = {
      ...entity,
      companyUuid: loginCompany().uuid,
    };
    let type = 'dispatcherconfig/insert';
    this.props.dispatch({
      type: type,
      payload: params,
      callback: response => {
        if (response && response.success) {
          // if (type === 'dispatcherconfig/add') {
          //     message.success(commonLocale.saveSuccessLocale);
          // } else if (type === 'dispatcherconfig/modify') {
          //     message.success(commonLocale.modifySuccessLocale);
          // }
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

    return <DispatcherConfigCreateModal {...createModalProps} />;
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
