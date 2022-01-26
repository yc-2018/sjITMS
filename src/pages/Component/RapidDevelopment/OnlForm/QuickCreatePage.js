import { connect } from 'dva';
import { Form, Select, Input, InputNumber, message, Col, DatePicker, Modal } from 'antd';
import moment from 'moment';

import { loginCompany, loginOrg, loginUser, getDefOwner, getActiveKey } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { SimpleTreeSelect, SimpleRadio } from "@/pages/Component/RapidDevelopment/CommonComponent";

@connect(({ quick, loading }) => ({
	quick,
	loading: loading.models.quick,
}))
@Form.create()
export default class QuickCreatePage extends CreatePage {
	constructor(props) {
		console.log("props:", props)
		super(props);
		this.state = {
			title: "测试标题",
			entityUuid: "",
			entity: {
				uuid: ""
			},
			onlFormField: props.onlFormField,
			quickuuid: props.quickuuid,
			tableName: props.tableName,
			datas: new Map(),
		}
		//this.queryCoulumns();
	}

	dynamicqueryById() {
		if (this.props.quick.showPageMap.get(this.props.quickuuid).endsWith("update")) {
			const { tableName } = this.state
			var field = this.state.onlFormField.find(x => x.dbIsKey)?.dbFieldName;
			const param = {
				tableName: tableName,
				condition: { "params": [{ "field": field, rule: "eq", val: [this.props.quick.entityUuid] }] }
			}
			this.props.dispatch({
				type: 'quick/dynamicqueryById',
				payload: param,
				callback: response => {
					this.setState({ datas: new Map(Object.entries(response.result.records[0])) });
				},
			});
		}
	}

	componentDidMount() {
		this.dynamicqueryById();
	}

	onCancel = () => {
		this.props.form.resetFields();
		this.props.dispatch({
			type: 'quick/showPageMap',
			payload: {
				showPageK: this.state.quickuuid,
				showPageV: this.state.quickuuid + 'query'
			}
		});
	}

	onSave = (data) => {
		// 这里可以收集到表单的数据
		// 自定义提交数据接口
		// 默认实现的数据保存接口
		console.log("data", data);
		console.log("tableName", this.state.tableName);
		// TODO 日期格式oracle保存有问题
		// 格式转换处理
		convertSaveData(data);
		
		//入参
		const param = [{
			tableName: this.state.tableName,
			data: [data]
		}]
		this.props.dispatch({
			type: 'quick/saveOrUpdateEntities',
			payload: {
				showPageK: this.state.quickuuid,
				showPageV: this.state.quickuuid + 'query',
				param
			},
			callback: response => {
				if (response.success) message.success(commonLocale.saveSuccessLocale);
			},
		});
	}

	/**
	 * 渲染表单组件
	 */
	drawFormItems = () => {
		const { getFieldDecorator } = this.props.form;
		//const{map} = this.props.quick
		const { onlFormField } = this.state
		let cols = [];
		const { datas } = this.state;
		if (!onlFormField) {
			return null;
		}

		onlFormField.forEach(field => {
			let formItem;
			let rules = [{ required: !field.dbIsNull, message: `${field.dbFieldTxt}字段不能为空` }];
			const fieldExtendJson = field.fieldExtendJson ? JSON.parse(field.fieldExtendJson) : "";		// 扩展属性

			if (field.fieldShowType == "text") {
				rules.push({ max: field.dbLength, message: `${field.dbFieldTxt}字段长度不能超过${field.dbLength}` });
				formItem = <Input {...fieldExtendJson} disabled={field.isReadOnly} placeholder={field.placeholder} />;
			} else if (field.fieldShowType == "date") {
				formItem = <DatePicker {...fieldExtendJson} disabled={field.isReadOnly} style={{ width: '100%' }} placeholder={field.placeholder} />
			} else if (field.fieldShowType == "number") {
				formItem = <InputNumber {...fieldExtendJson} disabled={field.isReadOnly} style={{ width: '100%' }} placeholder={field.placeholder} />;
			} else if (field.fieldShowType == "sel_tree") {
				formItem = <SimpleTreeSelect {...fieldExtendJson} />;
			} else if (field.fieldShowType == "radio") {
				formItem = <SimpleRadio {...fieldExtendJson} disabled={field.isReadOnly}/>;
			}
			// else if (field.fieldShowType == "sel_tree") {
			// 	let options = [];
			// 	if (field.dictValue) {
			// 		let dictValue = JSON.parse(field.dictValue);
			// 		Object.keys(dictValue).forEach(function (key) {
			// 			options.push(<Select.Option value={key} key={key}>{dictValue[key]}</Select.Option>);
			// 		});
			// 	}
			// 	formItem = <Select disabled={field.isReadOnly} onChange={this.onModeChange} placeholder={field.placeholder}>
			// 		{options}
			// 	</Select>;
			// } 
			else if (field.fieldShowType == "textarea") {
				rules.push({ max: field.dbLength, message: `${field.dbFieldTxt}字段长度不能超过${field.dbLength}` });
				formItem = <Input.TextArea {...fieldExtendJson} disabled={field.isReadOnly} placeholder={field.placeholder} />;
			} else {
				rules.push({ max: field.dbLength, message: `${field.dbFieldTxt}字段长度不能超过${field.dbLength}` });
				formItem = <Input {...fieldExtendJson} disabled={field.isReadOnly} placeholder={field.placeholder} />;
			}

			cols.push(
				<CFormItem key={field.dbFieldName} label={field.dbFieldTxt}>
					{
						getFieldDecorator(field.dbFieldName, {
							initialValue: convertInitialValue(this.state.datas.get(field.dbFieldName), field.fieldShowType),
							rules: rules,
						})(formItem)
					}
				</CFormItem>
			);
		});

		return [
			<FormPanel key='basicInfo' title={"测试"} cols={cols} />
		];
	}
}

/**
 * 转换保存数据
 * @param {*} saveData 
 */
function convertSaveData(saveData){
	for (let key in saveData) {
		if(saveData[key]?._isAMomentObject){
			saveData[key] = data[key].format('YYYY-MM-DD');
		}
	}
}

/**
 * 转换初始值
 * @param {*} value 值
 * @param {string} type 类型 
 * @returns 
 */
function convertInitialValue(value, type) {
	if(!value){
		return value;
	}
	if (type == "date") {
		return moment(value, 'YYYY/MM/DD')
	} else {
		return value;
	}
}
