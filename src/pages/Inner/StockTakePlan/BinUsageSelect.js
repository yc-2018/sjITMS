import { PureComponent } from "react";
import { Select } from 'antd';
import { binUsage } from '@/utils/BinUsage';

export default class BinUsageSelect extends PureComponent {

  getUsageOptions = () => {
    let options = [];
    Object.keys(binUsage).forEach(function (key) {
      options.push(
        <Select.Option key={binUsage[key].name} value={binUsage[key].name}>
          {binUsage[key].caption}</Select.Option>
      );
    });
    return options;
  }

  render() {
    return (
      <Select {...this.props}>
        {this.getUsageOptions()}
      </Select>
    );
  }
}