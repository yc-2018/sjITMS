import { PureComponent } from "react";
import { Select } from 'antd';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
/**
 * 拣货分区选择器
* forItemTable: 传入改参数， 则为明细表格使用， 无form表单 无初值
 * 设置autoFocus属性,则会定位焦点
 */
@connect(({ pickArea }) => ({
    pickArea
}))
export default class PickareaSelect extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        }
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'pickArea/query',
            payload: {
                page: 0,
                pageSize: 30,
                searchKeyValues: {
                    companyUuid: loginCompany().uuid,
                    dcUuid: loginOrg().uuid
                }
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value
        });
    }

    buildOptions = () => {
        let options = [];
        if (this.props.hasAll) {
            options.push(<Select.Option key="all" value={undefined} > 全部 </Select.Option>);
        }

        let data = this.props.pickArea.data.list;
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
      const selectProps = {
        disabled: this.props.disabled,
        placeholder: this.props.placeholder,
        onChange: this.onChange,
        mode:this.props.multiple ? 'multiple' : '',
        autoFocus:this.props.autoFocus?true:false
      }
      if (this.state.value) {
        selectProps.value = this.state.value;
      } else if ((this.state.value == undefined || this.state.value === '') && this.props.forItemTable == undefined) {
        selectProps.value = this.state.value;
      }
      return (
          <Select {...selectProps} id='pickArea'>
            {this.buildOptions()}
          </Select>
      );
    }
}