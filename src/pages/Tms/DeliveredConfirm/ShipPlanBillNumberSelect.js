import { PureComponent } from 'react';
import { Select } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { State } from '../ShipPlanBillDispatch/ShipPlanBillDispatchContants';

/**
* 配车单号选择下拉框
*
* 支持单选和多选，多选时传入mode，参照Select的mode选项
* 
*/
@connect(({ shipPlanBillDispatch }) => ({
	shipPlanBillDispatch
}))
export default class ShipPlanBillNumberSelect extends PureComponent {

	constructor(props) {
		super(props);

		this.state = {
			value: props.value,
			driverCodeName: props.driverCodeName,
			vehicleStr: props.vehicleStr,
			data: []
		}
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			value: nextProps.value,
			//data: []
		});
		if (this.props.shipPlanBillDispatch.dataForSelect.list != nextProps.shipPlanBillDispatch.dataForSelect.list) {
			this.setState({
				data: nextProps.shipPlanBillDispatch.dataForSelect.list
			})
		}
		if (this.props.value !== nextProps.value) {
			this.initialValue(nextProps.value);
    }
    if((this.props.driverCodeName != nextProps.driverCodeName)||(this.props.vehicleStr != nextProps.vehicleStr)){
      this.setState({
        driverCodeName: nextProps.driverCodeName,
			  vehicleStr: nextProps.vehicleStr,
      },()=>{
        this.onSearch();
      })  
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
    }else{

		}
			// this.onSearch();
    
	}

	buildOptions = () => {
		let options = [];
		let that=this;
		Array.isArray(this.state.data) && this.state.data.forEach(function (shipPlanBillDispatch) {
			if(that.props.showSourceBill){
				options.push(
					<Select.Option key={shipPlanBillDispatch.billNumber} value={shipPlanBillDispatch.billNumber}>{`${shipPlanBillDispatch.billNumber}[${shipPlanBillDispatch.sourceBillNumber}]`}</Select.Option>
				);
			}else{
				options.push(
					<Select.Option key={shipPlanBillDispatch.billNumber} value={shipPlanBillDispatch.billNumber}> {shipPlanBillDispatch.billNumber} </Select.Option>
				);
			}
			
		});
		return options;
	}

	onSearch = (value) => {
    const { states } = this.props;
    
		if (this.state.vehicleStr == null && this.state.driverCodeName == null&&!value) {
			return;
		}
		if(value){
			this.setState({
				value: value
			})
		}
		this.props.dispatch({
			type: 'shipPlanBillDispatch/queryForSelect',
			payload: {
				page: 0,
				pageSize: 1000,
				searchKeyValues: {
					companyUuid: loginCompany().uuid,
					dispatchCenterUuid: loginOrg().uuid,
					stats:[State.Returned.name,State.Finished.name],
          vehicleStr:this.state.vehicleStr!=null?this.state.vehicleStr:'',
					driverCodeName:this.state.driverCodeName!=null?this.state.driverCodeName:'',
					billNumber:value?value:''
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
			placeholder: '请先选择排车单号',
			value: this.state.value,
			filterOption:false
		};

		return (
			<Select {...selectProps} style={{ width: '100%' }} id='shipPlanBillNumber'>
				{this.buildOptions()}
			</Select>
		);
	}
}