import { PureComponent } from "react";
import { Select } from 'antd';
import { simpleOperateMethod } from '@/utils/OperateMethod';

export default class OperateMethodSelect extends PureComponent {

    getMethodOptions = () => {
        let options = [];
        options.push(<Select.Option key='' value=''>全部</Select.Option>);
        Object.keys(simpleOperateMethod).forEach(function (key) {
            options.push(
                <Select.Option key={simpleOperateMethod[key].name} value={simpleOperateMethod[key].name}>
                    {simpleOperateMethod[key].caption}</Select.Option>
            );
        });
        return options;
    }

    render() {
        return (
            <Select {...this.props}>
                {this.getMethodOptions()}
            </Select>
        );
    }
}