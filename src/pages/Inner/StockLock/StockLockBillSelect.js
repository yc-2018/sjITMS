import { PureComponent } from "react";
import { Select } from 'antd';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { state, lockType } from './StockLockContants';

@connect(({ stocklock }) => ({
  stocklock,
}))
export default class StockLockBillSelect extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
    if (this.props.value !== nextProps.value) {
      this.onSearch(nextProps.value);
    }
  }

  componentDidMount() {
    const { value } = this.state;
    if (value) {
      this.onSearch(value);

    }
  }

  buildOptions = () => {
    let options = [];

    let data = this.props.stocklock.data.list;
    const that = this;

    Array.isArray(data) && data.forEach(function (bill) {
      if (bill.type == 'LOCK' && loginOrg().uuid === bill.dcUuid && bill.owner.uuid === that.props.ownerUuid) {
        options.push(
          <Select.Option key={bill.uuid} value={bill.billNumber}> {bill.billNumber} </Select.Option>
        );
      } else {
        that.setState({
          value: undefined
        })
      }
    });
    return options;
  }

  onSearch = (value) => {

    if (!this.props.ownerUuid) {
      return;
    }
    this.setState({
      value: value
    })
    this.props.dispatch({
      type: 'stocklock/query',
      payload: {
        page: 0,
        pageSize: 20,
        sortFields: { billNumber: true },
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid,
          ownerUuid: this.props.ownerUuid,
          state: state.AUDITED.name,
          type: lockType.LOCK.name,
          billNumber: value
        }
      }
    });
  }

  onChange = (selectValue) => {
    this.setState({
      value: selectValue,
    });

    // 用于form表单获取控件值
    if (this.props.onChange)
      this.props.onChange(selectValue);
  }

  render() {
    const { single } = this.props;
    const selectProps = {
      showSearch: true,
      mode: single,
      onChange: this.onChange,
      onSearch: this.onSearch,
      // value:this.state.value
    };

    if (this.state.value) {
      selectProps.value = this.state.value;
    }
    return (
      <Select {...selectProps} placeholder={this.props.placeholder}>
        {this.buildOptions()}
      </Select>
    );
  }
}