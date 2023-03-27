import React, { Component } from 'react';
import { Row, Col, message } from 'antd';
import DispatchingTable from './DispatchingTable';
import BatchProcessConfirm from './BatchProcessConfirm';
import { VehicleColumns, pagination } from './DispatchingColumns';
import SearchForm from './SearchForm';
import { save } from '@/services/sjitms/ScheduleBill';
import { queryData } from '@/services/quick/Quick';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { sumBy } from 'lodash';

export default class VehiclePoolPage extends Component {
  state = {
    loading: false,
    btnLoading: false,
    vehiclePagination: false,
    vehicleFilter: [],
    vehicleData: [],
    vehicleRowKeys: [],
  };

  handleCreateSchedule = () => {
    const { vehicleRowKeys } = this.state;
    if (vehicleRowKeys.length == 0) {
      message.warning('请选择车辆！');
      return;
    }
    if (vehicleRowKeys.length == 1) {
      this.setState({ btnLoading: true });
      this.createSchedule(vehicleRowKeys[0]).then(response => {
        if (response.success) {
          message.success('保存成功！');
          this.props.refreshSchedule();
          this.setState({ vehicleRowKeys: [] });
        }
        this.setState({ btnLoading: false });
      });
    } else {
      this.batchProcessConfirmRef.show('创建排车单', vehicleRowKeys, this.createSchedule, () => {
        this.props.refreshSchedule();
        this.setState({ vehicleRowKeys: [] });
      });
    }
  };
  //创建排车单
  createSchedule = async uuid => {
    const { vehicleData } = this.state;
    const vehicle = vehicleData.find(x => x.uuid == uuid);
    const carrier = vehicle.DRIVERUUID
      ? {
          uuid: vehicle.DRIVERUUID,
          code: vehicle.DRIVERCODE,
          name: vehicle.DRIVERNAME,
        }
      : {};
    let memberDetails = [{ member: carrier, memberType: 'Driver' }];
    if (vehicle.DELIVERYUUID) {
      memberDetails.push({
        member: {
          uuid: vehicle.DELIVERYUUID,
          code: vehicle.DELIVERYCODE,
          name: vehicle.DELIVERYNAME,
        },
        memberType: 'DeliveryMan',
      });
    }
    const paramBody = {
      type: 'Job',
      vehicle: {
        uuid: vehicle.UUID,
        code: vehicle.CODE,
        name: vehicle.PLATENUMBER,
      },
      vehicleType: {
        uuid: vehicle.VEHICLETYPEUUID,
        code: vehicle.VEHICLETYPECODE,
        name: vehicle.VEHICLETYPENAME,
      },
      carrier: { ...carrier },
      details: [],
      memberDetails,
      companyUuid: loginCompany().uuid,
      dispatchCenterUuid: loginOrg().uuid,
    };
    return await save(paramBody);
  };

  refreshVehiclePool = (params, pages, sorter) => {
    this.setState({ loading: true });
    let { vehicleFilter, vehiclePagination } = this.state;
    let filter = { superQuery: { matchType: 'and', queryParams: [] } };
    if (params) {
      if (params.superQuery) {
        filter = params;
        vehicleFilter = params.superQuery.queryParams;
      } else {
        vehicleFilter = params;
      }
    }
    if (sorter && sorter.column)
      filter.order =
        (sorter.column.sorterCode ? sorter.columnKey + 'Code' : sorter.columnKey) +
        ',' +
        sorter.order;
    if (pages) {
      filter.page = pages.current;
      filter.pageSize = pages.pageSize;
      //设置页码缓存
      localStorage.setItem('VehiclePoolPageSize', filter.pageSize);
    } else {
      //增加查询页数从缓存中读取
      let pageSize = localStorage.getItem('VehiclePoolPageSize')
        ? parseInt(localStorage.getItem('VehiclePoolPageSize'))
        : 100;
      filter.page = vehiclePagination.current;
      filter.pageSize = vehiclePagination.pageSize || pageSize;
    }
    filter.superQuery.queryParams = [...vehicleFilter, ...this.isOrgQuery];
    filter.quickuuid = 'v_sj_itms_vehicle_stat';
    queryData(filter).then(response => {
      if (response.success) {
        vehiclePagination = {
          ...pagination,
          total: response.data.paging.recordCount,
          pageSize: response.data.paging.pageSize,
          current: response.data.page,
          showTotal: total => `共 ${total} 条`,
        };
        let vehicleData = response.data.records ? response.data.records : [];
        vehicleData = vehicleData.map(vehicle => {
          return { ...vehicle, uuid: vehicle.UUID };
        });
        this.setState({
          vehiclePagination,
          vehicleData,
          auditedRowKeys: [],
          vehicleRowKeys: [],
          loading: false,
          vehicleFilter,
        });
      } else {
        this.setState({ loading: false, vehicleFilter });
      }
    });
  };
  isOrgQuery = [
    { field: 'COMPANYUUID', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
    { field: 'DISPATCHCENTERUUID', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
  ];
  //表格行选择
  tableChangeRows = selectedRowKeys => {
    this.setState({ vehicleRowKeys: selectedRowKeys });
  };
  //运力池汇总
  drawVehicleCollect = (vehicles, rowKeys) => {
    const totalTextStyle = { fontSize: 16, fontWeight: 700, marginLeft: 2, color: '#333' };
    vehicles = vehicles.filter(x => rowKeys.indexOf(x.uuid) != -1);
    return (
      <Row type="flex" justify="space-around" style={{ fontSize: 14 }}>
        <Col span={5}>
          车辆数: <span style={totalTextStyle}>{vehicles.length}</span>
        </Col>
        <Col span={5}>
          总限重:
          <span style={totalTextStyle}>
            {Math.round(sumBy(vehicles.map(x => x.BEARWEIGHT)) * 100) / 100}
          </span>
        </Col>
        <Col span={5}>
          总容积:
          <span style={totalTextStyle}>
            {Math.round(sumBy(vehicles.map(x => (x.BEARVOLUME * x.BEARVOLUMERATE) / 100)) * 100) /
              100}
          </span>
        </Col>
      </Row>
    );
  };

  render() {
    const { loading, vehiclePagination, vehicleRowKeys, vehicleData } = this.state;
    const { searchKey } = this.props;
    return (
      <div>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
        <SearchForm
          refresh={this.refreshVehiclePool}
          key={searchKey}
          quickuuid="v_sj_itms_vehicle_stat"
          refreshOrderPool={this.refreshVehiclePool}
        />
        {/* 运力池 */}
        <DispatchingTable
          comId="vehicles"
          clickRow
          pagination={vehiclePagination || false}
          loading={loading}
          dataSource={vehicleData}
          refreshDataSource={(_, pagination, sorter) => {
            this.refreshVehiclePool(undefined, pagination, sorter);
          }}
          changeSelectRows={rowKeys => this.tableChangeRows(rowKeys)}
          selectedRowKeys={vehicleRowKeys}
          columns={VehicleColumns}
          scrollY="calc(86vh - 215px)"
          title={() => this.drawVehicleCollect(vehicleData, vehicleRowKeys)}
        />
      </div>
    );
  }
}
