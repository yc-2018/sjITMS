import { DatePicker } from 'antd';
import moment from 'moment';
import React from "react";


const { RangePicker } = DatePicker;

export default class ControlledRangePicker extends React.Component {
  state = {
    mode: ['month', 'month'],
    value: []
  };

  handlePanelChange = (value, mode) => {
    const newValue = value.map(date => moment(date).date(1)); // 将日期设置为1号
    this.setState({
      value:newValue,
      mode: [mode[0] === 'date' ? 'month' : mode[0], mode[1] === 'date' ? 'month' : mode[1]],
    });
    this.props.onChange(newValue);
  };

  handleChange = value => {
    const newValue = value.map(date => moment(date).date(1)); // 将日期设置为1号
    this.setState({ value:newValue });
    this.props.onChange(newValue);
  };

  render() {
    const { value, mode } = this.state;
    return (
      <RangePicker
        placeholder={['开始月份', '结束月份']}
        format="YYYY-MM"
        value={value}
        mode={mode}
        showTime
        defaultValue={[
          moment().date(1).startOf('month'),
          moment().date(1).endOf('month'),
        ]}
        onChange={this.handleChange}
        onPanelChange={this.handlePanelChange}
        ranges={{
          近一月: [
            moment()
              .startOf('month')
              .subtract(1, 'month'),
            moment(),
          ],
          近两月: [
            moment()
              .startOf('month')
              .subtract(2, 'month'),
            moment(),
          ],
          近三月: [
            moment()
              .startOf('month')
              .subtract(3, 'month'),
            moment(),
          ],
          近半年: [
            moment()
              .startOf('day')
              .subtract(6, 'month'),
            moment(),
          ],
          近一年: [
            moment()
              .startOf('day')
              .subtract(1, 'year'),
            moment(),
          ],
        }}

      />
    );
  }
}
