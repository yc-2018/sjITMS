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
    const endValue = moment(newValue[1]).endOf('month'); // 将结束日期设置为下个月的最后一天
    // 将结束日期设置为下个月的第一天再减去一天
    this.setState({
      value:[newValue[0], endValue],
      mode: [mode[0] === 'date' ? 'month' : mode[0], mode[1] === 'date' ? 'month' : mode[1]],
    });
    this.props.onChange(value);
  };

  handleChange = value => {
    const newValue = value.map(date => moment(date).date(1)); // 将日期设置为1号
    const endValue = moment(newValue[1]).endOf('month'); // 将结束日期设置为下个月的最后一天
    // 将结束日期设置为下个月的第一天再减去一天
    this.setState({ value:[newValue[0], endValue] });
    this.props.onChange(value);
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
        style={{ width: '100%' }}
        onChange={this.handleChange}
        onPanelChange={this.handlePanelChange}
        ranges={{
          近一月: [
            moment()
              .startOf('month')
              .subtract(1, 'month').date(1),
            moment().endOf('month').subtract(1, 'month'),
          ],
          近两月: [
            moment()
              .startOf('month')
              .subtract(2, 'month').date(1),
            moment().endOf('month').subtract(1, 'month'),
          ],
          近三月: [
            moment()
              .startOf('month')
              .subtract(3, 'month').date(1),
            moment().endOf('month').subtract(1, 'month'),
          ],
          近半年: [
            moment()
              .startOf('day')
              .subtract(6, 'month').date(1),
            moment().endOf('month').subtract(1, 'month'),
          ],
          近一年: [
            moment()
              .startOf('day')
              .subtract(1, 'year').date(1),
            moment().endOf('month').subtract(1, 'month'),
          ],
        }}
      />
    );
  }
}
