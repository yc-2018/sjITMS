import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';

/**
* 车辆下拉选择控件
* 属性：支持form表单initialValue设置初始值，也可通过属性value设置初始值；hasAll：包含全部选项，可用于搜索条件;
* disabled：是否禁用；multiple：是否多选；onlyOnline：是否只查询启用状态的货主
* 事件：ownerChange，valueChange事件，默认的onChange事件获取的value为选中货主的代码，ownerChange获取的值为选中货主的ucn
*/
@connect(({ vehicle }) => ({
    vehicle
}))
export default class VehicleSelect extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        }
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'vehicle/getByDispatchCenterUuid',
        });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value
        });

        if (nextProps.value&&this.props.value !== nextProps.value) {
            let code = nextProps.value;
            if(nextProps.value.indexOf('{')!=-1){
                code = JSON.parse(nextProps.value).code
            }
            this.onSearch(code);
        }
    }

    buildOptions = () => {
        const { value } = this.state;
        let options = [];
        let that = this;
        let data = this.props.vehicle.vehicleList;
        if (!data)
            return options;
        let uuids = [];
        if (this.props.extra) {
            options.push(
              <Select.Option key={this.props.extra} value={JSON.stringify({
                uuid: this.props.extra.uuid,
                code: this.props.extra.code,
                name: this.props.extra.name,
            })}>
                {'[' + this.props.extra.code + ']' + this.props.extra.name} 
              </Select.Option>
            )
          }

        Array.isArray(data) && data.forEach(function (dg) {
            uuids.push(dg.uuid);
            if(that.props.extra&&that.props.extra.uuid!=dg.uuid){
                options.push(
                    <Select.Option key={dg.uuid} value={JSON.stringify({
                        uuid: dg.uuid,
                        code: dg.code,
                        name: dg.plateNumber,
                    })}> {'[' + dg.code + ']' + dg.plateNumber} </Select.Option>
                );
            }else if(!that.props.extra){
                options.push(
                    <Select.Option key={dg.uuid} value={JSON.stringify({
                        uuid: dg.uuid,
                        code: dg.code,
                        name: dg.plateNumber,
                    })}> {'[' + dg.code + ']' + dg.plateNumber} </Select.Option>
                );
            }
        });

        // if(uuids.indexOf(value&&JSON.parse(value).uuid)==-1){
        //     this.setState({
        //         value:undefined
        //     })
        // }
        return options;
    }

    onSearch = (value) => {
        if (!value) {
            return;
        }
        this.props.dispatch({
          type: 'vehicle/getByDispatchCenterUuid',
        });
    }

    onChange = (value) => {
        this.setState({ value: value });

        let vehicleUcn = JSON.parse(value);
        let data = this.props.vehicle.vehicleList;
        let vehicleInfo = {};
        // vehicleInfo.vehicleUcn=vehicleUcn;
        data.forEach(function (vehicle) {
            if (vehicle.uuid == vehicleUcn.uuid) {
                vehicleInfo.vehicleTypeUcn = vehicle.vehicleType;
                vehicleInfo.carrierUcn = vehicle.carrier;
                vehicleInfo.employees = vehicle.employees;
            }
        });
        if (this.props.onChange)
            this.props.onChange(value, vehicleInfo.vehicleTypeUcn, vehicleInfo.carrierUcn,vehicleInfo.employees);
    }

    render() {
        const { multiple } = this.props;
        const selectProps = {
            showSearch: true,
            disabled: this.props.disabled,
            mode: multiple ? 'multiple' : '',
            onChange: this.onChange,
            onSearch: this.onSearch,
            placeholder: this.props.placeholder
        };

        selectProps.value = this.state.value;

        return (
            <Select {...selectProps} style={{width:'100%'}}>
                {this.buildOptions()}
            </Select>
        );
    }
}