import { PureComponent } from 'react';
import { Select } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg, loginCustomer } from '@/utils/LoginContext';

/**
* 排车单号选择下拉框
*
* 支持单选和多选，多选时传入mode，参照Select的mode选项
* 
*/
@connect(({ shipplanbill }) => ({
	shipplanbill
}))
export default class ShipPlanBillSelect extends PureComponent {

	constructor(props) {
		super(props);

		this.state = {
			value: props.value,
			data: []
		}
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			value: nextProps.value,
			//data: []
		});
		if ( nextProps.shipplanbill.data&&this.props.shipplanbill.data != nextProps.shipplanbill.data) {
			this.setState({
				data: nextProps.shipplanbill.data.list?nextProps.shipplanbill.data.list:[]
			})
		}
		if (this.props.value !== nextProps.value) {
			this.initialValue(nextProps.value);
		}
	}

	componentDidMount() {
		const { value } = this.state;
		if (value)
			this.initialValue(value);
	}

	initialValue = (value) => {
		if (value) {
			this.onSearch(value);
		}
	}

	buildOptions = () => {
		let options = [];
		let that=this;
		Array.isArray(this.state.data) && this.state.data.forEach(function (shipplanbill) {
			
				options.push(
					<Select.Option key={shipplanbill.num} value={shipplanbill.num}> {shipplanbill.num} </Select.Option>
				);
		});
		return options;
	}

	onSearch = (value) => {
		const { states } = this.props;
		this.setState({
			value: value
		})
		this.props.dispatch({
			type: 'shipplanbill/query',
			payload: {
				page: 0,
				pageSize: 20,
				searchKeyValues: {
          companyUuid:loginCompany().code,
          plateNumberLike:this.props.plateNumberLike?this.props.plateNumberLike:''
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
		const selectProps = {
			showSearch: true,
			onSearch: this.onSearch,
			onChange: this.onChange,
			placeholder: '请输入订单号',
			value: this.state.value,
			filterOption:false
		};

		return (
			<Select {...selectProps} style={{ width: '100%' }} id='orderBillNumber'>
				{this.buildOptions()}
			</Select>
		);
	}
}