import { PureComponent } from "react";
import { Select } from 'antd';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';

@connect(({ wrh }) => ({
  wrh
}))
export default class WrhSelect extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value
    }
  }

  componentDidMount() {
      this.props.dispatch({
          type: 'wrh/query',
          payload: {
              page: 0,
              pageSize: 30,
              searchKeyValues: {
                  companyUuid: loginCompany().uuid,
                  dcUuid: this.props.onlyCompanyParam ? undefined : loginOrg().uuid,
                  state: this.props.onlyCompanyParam ? undefined : STATE.ONLINE
              }
          }
      });
  }

  // componentWillReceiveProps(nextProps) {
  //   this.setState({
  //     value: nextProps.value
  //   });
  // }

  buildOptions = () => {
    let options = [];
    if (this.props.hasAll) {
      options.push(<Select.Option key="wrhAll" value='' > 全部 </Select.Option>);
    }

    let data = this.props.wrh.data.list;
    Array.isArray(data) && data.forEach(function (dg) {
      options.push(
        <Select.Option key={dg.uuid} value={JSON.stringify({
          uuid: dg.uuid,
          code: dg.code,
          name: dg.name
        })}> {'[' + dg.code + ']' + dg.name} </Select.Option>
      );
    });
    return options;
  }

  onChange = (value) => {
    this.setState({ value: value });

    // 用于form表单获取控件值
    if (this.props.onChange)
      this.props.onChange(value);
  }

  render() {
    return (
      <Select id='wrh' disabled={this.props.disabled} value={this.state.value} placeholder={this.props.placeholder} mode={this.props.multiple ? 'multiple' : ''} onChange={this.onChange}>
        {this.buildOptions()}
      </Select>
    );
  }
}
