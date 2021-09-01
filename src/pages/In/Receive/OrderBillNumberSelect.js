import { PureComponent } from 'react';
import { Select } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

/**
* 订单编号选择下拉框
*
* 支持单选和多选，多选时传入mode，参照Select的mode选项
* 
*/
@connect(({ order }) => ({
	order
}))
export default class OrderBillNumberSelect extends PureComponent {

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
		if (this.props.order.data.list != nextProps.order.data.list) {
			this.setState({
				data: nextProps.order.data.list
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
		Array.isArray(this.state.data) && this.state.data.forEach(function (order) {
			if(that.props.showSourceBill){
				options.push(
					<Select.Option key={order.billNumber} value={order.billNumber}>{`${order.billNumber}[${order.sourceBillNumber}]`}</Select.Option>
				);
			}else{
				options.push(
					<Select.Option key={order.billNumber} value={order.billNumber}> {order.billNumber} </Select.Option>
				);
			}
			
		});
		return options;
	}

	onSearch = (value) => {
		const { states } = this.props;
		if (this.props.vendorUuid === null || this.props.ownerUuid === null || this.props.wrhUuid === null || this.props.logisticMode === null) {
			return;
		}
		this.setState({
			value: value
		})
		this.props.dispatch({
			type: 'order/query',
			payload: {
				page: 0,
				pageSize: 20,
				searchKeyValues: {
					companyUuid: loginCompany().uuid,
					dcUuid: loginOrg().uuid,
					logisticMode: this.props.logisticMode ? this.props.logisticMode : '',
					states: states ? states : '',
					billNumberAndSource: value,
					vendorUuid: this.props.vendorUuid,
					ownerUuid: this.props.ownerUuid,
					wrhUuid: this.props.wrhUuid,
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