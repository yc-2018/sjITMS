import { PureComponent } from 'react';
import { Select } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg, loginCustomer } from '@/utils/LoginContext';
import { placeholderLocale } from '@/utils/CommonLocale';

/**
* 装车单号选择下拉框
*
* 支持单选和多选，多选时传入mode，参照Select的mode选项
* 
*/
@connect(({ shipbill }) => ({
	shipbill
}))
export default class ShipBillSelect extends PureComponent {

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
		if ( nextProps.shipbill.data&&this.props.shipbill.data != nextProps.shipbill.data) {
			this.setState({
				data: nextProps.shipbill.data.list?nextProps.shipbill.data.list:[]
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
		Array.isArray(this.state.data) && this.state.data.forEach(function (shipbill) {
			
				options.push(
					<Select.Option key={shipbill.billNumber} value={shipbill.billNumber}> {shipbill.billNumber} </Select.Option>
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
			type: 'shipbill/query',
			payload: {
				page: 0,
				pageSize: 20,
				searchKeyValues: {
          companyUuid:loginCompany().uuid,
          createOrgUuid:loginOrg().uuid,
          billNumberLike:value
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
			<Select {...selectProps} style={{ width: '100%' }} id='shipBillNumber' placeholder={placeholderLocale('装车单号')}>
				{this.buildOptions()}
			</Select>
		);
	}
}