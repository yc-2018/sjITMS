import { DatePicker } from 'antd';
import moment from 'moment';
import React from "react";


const { RangePicker } = DatePicker;

/*
 * @Author LONGYU
 * @Date 2023/12/5 8:24
 * @LastEditors LONGYU
 * @LastEditTime 2023/12/5 8:24
 * @Description 日期选择器——月份
 * @FilePath E:\ideaCode\Company\iwms-web\src\pages\Component\RapidDevelopment\OnlReport\SimpleQuery\ControlledRangePicker\ControlledRangePicker.js
 */
export default class ControlledRangePicker extends React.Component {
  state = {
    mode: ['month', 'month'],
    value: [],
    flag:false,
  };

  handlePanelChange = (value, mode) => {
    const newValue = value.map(date => moment(date).date(1)); // 将日期设置为1号
    // const endValue = moment(newValue[1]).endOf('month'); // 将结束日期设置为下个月的最后一天
    // 将结束日期设置为下个月的第一天再减去一天
    this.setState({
      value:newValue,
      mode: [mode[0] === 'date' ? 'month' : mode[0], mode[1] === 'date' ? 'month' : mode[1]],
    });
    this.props.onChange(value);
  };

  handleChange = value => {
    const newValue = value.map(date => moment(date).date(1)); // 将日期设置为1号
    // const endValue = moment(newValue[1]).endOf('month'); // 将结束日期设置为下个月的最后一天
    this.setState({
      value:newValue,
    });
    this.props.onChange(value);
  };

  //监听点击事件
  closePanel = () => {
    this.setState({
      flag:false,
    })
  }

  //监听点击事件
  handleOpenCalendar = () => {
    this.setState({ flag: true }); // 点击日期选择器输入框打开日历
  };

  render() {
    const { value, mode,flag  } = this.state;
    return (
      <RangePicker
        placeholder={['开始月份', '结束月份']}
        format="YYYY-MM"
        value={value}
        open={flag}
        mode={mode}
        renderExtraFooter={() => (
          <div style={{ position: 'absolute' ,right:0}}>
            <a  className="ant-calendar-ok-btn" role="button" onClick={this.closePanel}>确 定</a>
          </div>
        )}
        style={{ width: '100%' }}
        onChange={this.handleChange}
        onPanelChange={this.handlePanelChange}
        onOpenChange={(open) => {
          if (open) {
            this.handleOpenCalendar();
          }
        }}
        ranges={{
          近一月: [
            moment()
              .startOf('month')
              .subtract(1, 'month'),
            moment().endOf('month').subtract(1, 'month'),
          ],
          近两月: [
            moment()
              .startOf('month')
              .subtract(2, 'month'),
            moment().endOf('month').subtract(1, 'month'),
          ],
          近三月: [
            moment()
              .startOf('month')
              .subtract(3, 'month'),
            moment().endOf('month').subtract(1, 'month'),
          ],
          近半年: [
            moment()
              .startOf('day')
              .subtract(6, 'month'),
            moment().endOf('month').subtract(1, 'month'),
          ],
          近一年: [
            moment()
              .startOf('day')
              .subtract(1, 'year'),
            moment().endOf('month').subtract(1, 'month'),
          ],
        }}
      />
    );
  }
}
