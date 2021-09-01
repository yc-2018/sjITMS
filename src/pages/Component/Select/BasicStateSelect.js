import { PureComponent } from "react";
import { Select } from 'antd';
import { basicStateSelect } from '@/utils/BasicState';

export default class BasicStateSelect extends PureComponent {

    getStateOptions = () => {
        let options = [];
        options.push(<Select.Option key='' value=''>全部</Select.Option>);
        Object.keys(basicStateSelect).forEach(function (key) {
            options.push(
                <Select.Option key={basicStateSelect[key].name} value={basicStateSelect[key].name}>{basicStateSelect[key].caption}</Select.Option>
            );
        });
        return options;
    }

    render() {
        return (
            <Select {...this.props}>
                {this.getStateOptions()}
            </Select>
        );
    }
}