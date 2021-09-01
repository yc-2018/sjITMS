import { Table, Button, Select, message } from 'antd';
import { connect } from 'dva';
import { Fragment } from 'react';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import ItemEditTable from './ItemEditTable';
import UserSelect from './UserSelect';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import { VehicleLocale, VehicleEmployee } from './VehicleLocale';
import { orgType } from '@/utils/OrgType';

const Option = Select.Option;

@connect(({ vehicle, loading }) => ({
    vehicle,
    loading: loading.models.vehicle,
}))
export default class VehicleEmployeeTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            vehicleUuid: '',
            carrierUuid: '',
            newEmp: { workType: 'DRIVER' }
        }
        this.onSave = this.onSave.bind(this);
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.vehicle.entity) {
            let employees = [];
            let employeeUuids = [];

            if (loginOrg().type === orgType.carrier.name && nextProps.vehicle.entity.employees) {
                nextProps.vehicle.entity.employees.forEach(function (employee) {
                    console.log(">>>>>>>>>>>>>" + employeeUuids.indexOf(employee.empUuid));
                    if ('DRIVER' === employee.workType && employeeUuids.indexOf(employee.empUuid) === -1) {
                        employees.push(employee);
                        employeeUuids.push(employee.empUuid);
                    }
                });
            }

            if (loginOrg().type != orgType.carrier.name && nextProps.vehicle.entity.employees) {
                employees = nextProps.vehicle.entity.employees;
            }

            this.setState({
                data: employees,
                vehicleUuid: nextProps.vehicle.entity.uuid,
                carrierUuid: nextProps.vehicle.entity.carrier ? nextProps.vehicle.entity.carrier.uuid : ''
            })
        }
    }

    onSave = (record) => {
        if (record.empUuid && record.workType) {
            record.vehicleUuid = this.state.vehicleUuid;
            record.companyUuid = loginCompany().uuid;
            this.props.dispatch({
                type: 'vehicle/saveEmployee',
                payload: record
            })
        }
    }

    onRemove = (record) => {
        let params = [];
        if (record.vehicleUuid) {
            params.push(record.uuid);
            this.props.dispatch({
                type: 'vehicle/removeEmp',
                payload: {
                    params,
                    vehicleUuid: this.state.vehicleUuid
                }
            })
        } else {
            let newData = [];
            newData = this.state.data.filter(item => {
                return item.line !== record.line
            });
            this.setState({
                data: newData
            })
        }
    }

    batchRemove = (selectedRows) => {
        if (!selectedRows) {
            message.warning(VehicleLocale.pleaseSelectToReceiveData);
            return;
        };
        this.state.data;
        let params = [];
        selectedRows.forEach(item => {
            if (item.vehicleUuid)
                params.push(item.uuid);
        })
        if (params && params.length > 0) {
            this.props.dispatch({
                type: 'vehicle/removeEmp',
                payload: {
                    params,
                    vehicleUuid: this.state.vehicleUuid
                }
            })
        }
        else {
            let newData = [];
            newData = this.state.data.filter(item => { return !selectedRows.includes(item) });
            this.setState({
                data: newData
            })
        }
    }

    onCodeChange = (record, value) => {
        let { data } = this.state;
        const ucn = JSON.parse(value);
        data.forEach(item => {
            if (item.line == record.line) {
                item.empUuid = ucn.uuid;
                item.empCode = ucn.code;
                item.empName = ucn.name;
            }
        })
        this.setState({
            data: data
        })
    }

    onWorkTypeChange = (record, value) => {
        let { data } = this.state;
        data.forEach(item => {
            if (item.line == record.line) {
                item.workType = value;
            }
        })
        this.setState({
            data: data
        })
    }

    render() {
        const { data } = this.state;
        if (data) {
            let i = 0;
            data.forEach(item => {
                if (!item.vehicleUuid) {
                    item.edit = true
                }
                item.line = i;
                i++;
            });
        }

        let orgUuids = [];
        orgUuids.push(this.state.carrierUuid);
        // orgUuids.push(loginOrg().uuid);
        let columns = [
            {
                title: VehicleLocale.emp,
                key: 'code',
                width: '40%',
                render: record => {
                    if (record && record.vehicleUuid)
                        return '[' + record.empCode + ']' + record.empName;
                    else return <UserSelect style={{ width: '100%' }} single={true} onChange={this.onCodeChange.bind(this, record)}
                        value={record && record.empUuid ? JSON.stringify({ uuid: record.empUuid, code: record.empCode, name: record.empName }) : ''} />
                }
            },
            {
                title: VehicleLocale.workType,
                key: 'workType',
                width: '40%',
                render: record => {
                    if (record && !record.edit) {
                        return VehicleEmployee[record.workType];
                    }
                    return (
                        <Select
                            value={record ? record.workType : 'DRIVER'}
                            onChange={this.onWorkTypeChange.bind(this, record)}
                            showSearch={true}
                            style={{ width: '100%' }}
                        >
                            <Option value="DRIVER">{VehicleEmployee['DRIVER']}</Option>
                            <Option value="STEVEDORE">{VehicleEmployee['STEVEDORE']}</Option>
                            <Option value="DEPUTYDRIVER">{VehicleEmployee['DEPUTYDRIVER']}</Option>
                            <Option value="DELIVERYMAN">{VehicleEmployee['DELIVERYMAN']}</Option>
                        </Select>
                    );
                }
            },
        ];
        return (
            <div>
                <ViewPanel title={VehicleLocale.empInfo}>
                    {loginOrg().type !== orgType.dispatchCenter.name ?
                        <Table
                            rowKey={record => record.uuid}
                            columns={columns}
                            dataSource={data}
                            pagination={false}
                            size='middle'
                        /> :
                        <ItemEditTable
                            unShowRow={true}
                            columns={columns}
                            data={data}
                            save={this.onSave}
                            remove={this.onRemove}
                            // batchRemove={this.batchRemove}
                        />
                    }
                </ViewPanel>
            </div>
        )
    }
}
