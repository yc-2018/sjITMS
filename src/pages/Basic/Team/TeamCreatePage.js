import { connect } from 'dva';
import { Col, DatePicker, Form, Input, InputNumber, message, Radio, Select, Tabs } from 'antd';
import CreatePage from '@/pages/Component/Page/CreatePage';
import { commonLocale, notNullLocale, placeholderChooseLocale, placeholderLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { teamLocale } from '@/pages/Basic/Team/TeamLocale';
import FormPanel from '@/pages/Component/Form/FormPanel';
import React from 'react';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import FormTitle from '@/pages/Component/Form/FormTitle';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import UserSelect from '@/pages/Component/Select/UserSelect';
import VehicleSelect from '@/pages/Tms/ShipPlanBill/VehicleSelect';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { State } from '@/pages/Basic/Team/TeamConstant';
import { orgType } from '@/utils/OrgType';

const TabPane = Tabs.TabPane;

@connect(({ team, loading }) => ({
  team,
  loading: null,
}))
@Form.create()
export default class TeamCreate extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      title: commonLocale.createLocale,
      entityUuid: props.team.entityUuid,
      entity: {
        orgUuid: loginOrg().uuid,
      },
      users: [],
      vehicles: [],
      customers: [],
    }
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.team.entity.uuid && nextProps.team.entity.uuid !== this.state.entity.uuid) {
      let vehicles = [];
      let users = [];
      let customers = [];
      let line = 0;
      Array.isArray(nextProps.team.entity.vehicles) && nextProps.team.entity.vehicles.forEach(vehicle => {
        line = line + 1;
        let item = {
          uuid: vehicle.vehicleUuid,
          code: vehicle.vehicleCode,
          name: vehicle.plateNumber,
        }
        vehicles.push({
          line: line,
          vehicle: item
        });
      })
      line = 0;
      Array.isArray(nextProps.team.entity.users) && nextProps.team.entity.users.forEach(user => {
        line = line + 1;
        users.push({
          line: line,
          user: user.user
        });
      })
      line = 0;
      Array.isArray(nextProps.team.entity.customers) && nextProps.team.entity.customers.forEach(customer => {
        line = line + 1;
        let item = {...customer.customer,
          type: customer.customerType,
        }
        customers.push({
          line: line,
          customer: item
        });
      })
      this.setState({
        entity: nextProps.team.entity,
        title: nextProps.team.entity.code,
        users: users,
        vehicles: vehicles,
        customers: customers,
      });
    }
  }

  refresh = () => {
    let uuid = this.props.team.entityUuid;
    if (uuid) {
      this.props.dispatch({
        type: 'team/get',
        payload: uuid
      });
    }
  }

  onSave = (data) => {
    this.onCreate(data, true)
  }

  onSaveAndCreate = (data) => {
    this.onCreate(data, false);
  }

  onCreate = (data) => {
    const { entity, users, vehicles, customers } = this.state;
    const { dispatch } = this.props;

    let payload = {};
    if (data){
      payload.code = data.code;
      payload.name = data.name;
      payload.note = data.note;
      payload.state = State.ONLINE.name;
      payload.companyUuid = loginCompany().uuid;
      payload.dispatchCenterUuid = loginOrg().uuid;
    }
    let payloadUsers = [];
    let payloadCustomers = [];
    let payloadVehicles = [];

    users.forEach(function(record) {
      payloadUsers.push({
        user :{
          uuid: record.user.uuid,
          code: record.user.code,
          name: record.user.name,
        },
        workType:'DRIVER',
      })
    })

    vehicles.forEach(function(record) {
      payloadVehicles.push({
        vehicleUuid: record.vehicle.uuid,
        vehicleCode: record.vehicle.code,
        plateNumber: record.vehicle.name,
      })
    })

    customers.forEach(function(record) {
      payloadCustomers.push({
        customer: {
          uuid: record.customer.uuid,
          code: record.customer.code,
          name: record.customer.name,
        },
        customerType: record.customer.type,
      })
    })
    payload.users = payloadUsers;
    payload.vehicles = payloadVehicles;
    payload.customers = payloadCustomers;

    let type = 'team/onSave';
    if (entity.uuid) {
      type = 'team/onModify';
      payload.uuid = entity.uuid;
      payload.version = entity.version;
    }
    dispatch({
      type: type,
      payload: payload,
      callback: response => {
        if (response && response.success) {
          if (entity.uuid) {
            message.success(commonLocale.modifySuccessLocale);
          } else {
            message.success(commonLocale.saveSuccessLocale);
          }
        }
      },
    });
  }

  onView = (uuid) => {
    this.props.dispatch({
      type: 'team/showPage',
      payload: {
        showPage: 'view',
        uuid: uuid
      }
    });
  }

  onCancel = () => {
    const payload = {
      showPage: 'query',
      entity: {},
      uuid: ''
    }
    this.props.dispatch({
      type: 'team/showPage',
      payload: {
        ...payload
      }
    });
  }

  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;

    let basicInfoCols = [];

    basicInfoCols.push(
      <CFormItem key='code' label={commonLocale.codeLocale}>
        {getFieldDecorator('code', {
          initialValue: entity && entity.uuid ? entity.code : '', rules: [{
            required: true, message: notNullLocale(commonLocale.codeLocale)
          }, {
            max: 30,
            message: '最大长度为30'
          }]
        })(
          <Input disabled={entity.uuid} placeholder={placeholderLocale(commonLocale.codeLocale)} />
        )}
      </CFormItem>,
      <CFormItem key='name' label={commonLocale.nameLocale}>
        {getFieldDecorator('name', {
          initialValue: entity && entity.name ? entity.name : '', rules: [{
            required: true, message: notNullLocale(commonLocale.nameLocale)
          }, {
            max: 30,
            message: '最大长度为30'
          }]
        })(
          <Input disabled={entity.uuid} placeholder={placeholderLocale(commonLocale.nameLocale)} />
        )}
      </CFormItem>,
    );

   return [
      <FormPanel key='basicInfo' noteLabelSpan={4} title={commonLocale.basicInfoLocale} cols={basicInfoCols} noteCol={this.drawNotePanel()}/>,
    ];
  }

  onUserChanged = (record, value) => {
    const { users } = this.state;
    users[record.line - 1].user = JSON.parse(value);
  }

  onVehicleChanged = (record, value) => {
    const { vehicles } = this.state;
    vehicles[record.line - 1].vehicle = JSON.parse(value);
  }

  onCustomerChanged = (record, value) => {
    const { customers } = this.state;
    customers[record.line - 1].customer = JSON.parse(value);
  }

  /**
   * 绘制明细表格
   */
  drawTable = () => {
    const { entity, users, customers, vehicles } = this.state;

    // 人员列
    let userColumns = [
      {
        title: commonLocale.codeAndNameLocale,
        width: itemColWidth.articleColWidth,
        render: record => {
          return (
            <UserSelect
              value={record.user ? JSON.stringify(record.user) : undefined}
              placeholder={placeholderChooseLocale(commonLocale.codeLocale)}
              onChange={this.onUserChanged.bind(this, record)}
              single
            />
          );
        }
      },
    ];

    // 车辆列
    let vehicleColumns = [
      {
        title: commonLocale.codeAndNameLocale,
        width: itemColWidth.articleColWidth,
        render: record => {
          return (
            <VehicleSelect
              value={record.vehicle ? JSON.stringify(record.vehicle) : undefined}
              placeholder={placeholderChooseLocale(commonLocale.codeLocale)}
              onChange={this.onVehicleChanged.bind(this, record)}
              single
            />
          );
        }
      },
    ]

    // 客户列
    let customerColumns = [
      {
        title: commonLocale.codeAndNameLocale,
        key: 'code',
        width: itemColWidth.articleColWidth,
        render: record => {
          return (
            <OrgSelect
              types={[orgType.store.name, orgType.vendor.name]}
              value={record.customer? JSON.stringify(record.customer) : undefined}
              placeholder={placeholderChooseLocale(commonLocale.codeLocale)}
              onChange={this.onCustomerChanged.bind(this, record)}
              single
            />
          );
        }
      },
    ]
    return (
      <div >
        <FormTitle title='详细信息' />
        <Tabs defaultActiveKey="1">
          <TabPane tab={teamLocale.employee} key="1">
            <ItemEditTable
              columns={userColumns}
              // batchAdd={false}
              notNote
              data={users}
            />
          </TabPane>
          <TabPane tab={teamLocale.vehicle} key="2">
            <ItemEditTable
              columns={vehicleColumns}
              batchAdd={false}
              notNote
              data={vehicles}
            />
          </TabPane>
          <TabPane tab={teamLocale.customer} key="3">
            <ItemEditTable
              columns={customerColumns}
              // batchAdd={false}
              notNote
              data={customers}
            />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
