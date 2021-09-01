import { PureComponent } from "react";
import { Select } from 'antd';
import { State } from './PickBinAdjBillContants';

export default class PickBinAdjStateSelect extends PureComponent {
  getStateCaption = () => {
    let options = [];
    options.push(
      <Select.Option key='' value=''>全部</Select.Option>
    );

    Object.keys(State).forEach(
      function (key) {
        options.push(
          <Select.Option key={State[key].name} value={State[key].name}>
            {State[key].caption}
          </Select.Option>
        )
      });
    return options;
  }

  render() {
    return (
      <Select {...this.props}>
        {this.getStateCaption()}
      </Select>
    )
  }
}