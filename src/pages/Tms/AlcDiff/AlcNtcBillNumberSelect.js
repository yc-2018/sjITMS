import { PureComponent } from 'react';
import { Select } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { placeholderLocale } from '@/utils/CommonLocale';
import { waveBillLocale } from '@/pages/Out/Wave/WaveBillLocale'

/**
* 配货通知单编号选择下拉框
*
* 支持单选和多选，多选时传入mode，参照Select的mode选项
* 
*/
@connect(({ alcNtc }) => ({
	alcNtc
}))
export default class AlcNtcBillNumberSelect extends PureComponent {

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
		let data = this.props.alcNtc.data.list;
		Array.isArray(data) && data.forEach(function (alcNtc) {
			options.push(
				<Select.Option key={alcNtc.billNumber} value={JSON.stringify(alcNtc)}> {alcNtc.billNumber} </Select.Option>
			);
		});
		return options;
	}

	onSearch = (value) => {
		const { states } = this.props;
		if (this.props.ownerUuid === null) {
			return;
		}
		this.props.dispatch({
			type: 'alcNtc/query',
			payload: {
				page: 0,
				pageSize: 20,
				searchKeyValues: {
					companyUuid: loginCompany().uuid,
					dcUuid: loginOrg().uuid,
					logisticType: this.props.logisticType ? this.props.logisticType : '',
					states: states ? states : '',
          orderBillNumber: this.props.orderBillNumber,
          billNumber: value,
					ownerUuid: this.props.ownerUuid,
					storeUuid: this.props.storeUuid,
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
			placeholder: placeholderLocale(waveBillLocale.alcNtcBillNumber),
		};

		if (this.state.value) {
			selectProps.value = this.state.value;
		}

		return (
			<Select {...selectProps} style={{ width: '100%' }} >
				{this.buildOptions()}
			</Select>
		);
	}
}