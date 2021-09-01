import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany } from '@/utils/LoginContext';

/**
* 货主下拉选择控件
* 属性：支持form表单initialValue设置初始值，也可通过属性value设置初始值；hasAll：包含全部选项，可用于搜索条件;
* disabled：是否禁用；multiple：是否多选；onlyOnline：是否只查询启用状态的货主
* 事件：ownerChange，valueChange事件，默认的onChange事件获取的value为选中货主的代码，ownerChange获取的值为选中货主的ucn
*/
@connect(({ dc }) => ({
    dc
}))
export default class DCSelect extends PureComponent {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'dc/getDCByCompanyUuid',
            payload: {
                companyUuid: loginCompany().uuid
            }
        });
    }

    buildOptions = () => {
        let options = [];
        if (this.props.hasAll) {
            options.push(<Select.Option key="all" > 全部 </Select.Option>);
        }
        if (this.props.dc && this.props.dc.dcList) {
            this.props.dc.dcList.forEach(function (dc) {
                let value = {
                    uuid: dc.uuid,
                    code: dc.code,
                    name: dc.name
                };
                options.push(
                    <Select.Option key={dc.uuid} value={dc.uuid}> {'[' + dc.code + ']' + dc.name} </Select.Option>
                );
            });
        }
        return options;
    }

    handleChange = (value) => {
        let ucnValue;
        if (value) {
            this.props.dc.dcList.forEach(function (dc) {
                if (dc.uuid === value) {
                    ucnValue = {
                        uuid: dc.uuid,
                        code: dc.code,
                        name: dc.name
                    };
                }
            });
        }
        this.props.onChange(value);
    }

    render() {
        return (
            <Select defaultValue={this.props.defaultValue} disabled={this.props.disabled} mode={this.props.multiple ? 'multiple' : ''} onChange={this.handleChange}>
                {this.buildOptions()}
            </Select>
        );
    }
}