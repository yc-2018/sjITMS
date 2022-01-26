import { connect } from 'dva';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { SimpleTreeSelect } from "@/pages/Component/RapidDevelopment/CommonComponent";
import { loginCompany, loginOrg, loginUser, getDefOwner, getActiveKey } from '@/utils/LoginContext';
import { Form, Select, Input, InputNumber, message, Col, DatePicker, Modal } from 'antd';
import { commonLocale } from '@/utils/CommonLocale';

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
		//入参
		const param = [{
			tableName: this.state.tableName,
			data: [data]
		}]
		this.props.dispatch({
			type: 'quick/saveOrUpdateEntities',
			payload: {
				showPageK:this.state.quickuuid,
				showPageV:this.state.quickuuid+'query',
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
		if (typeof (onlFormField) !== "undefined" && onlFormField.length > 0) {
			onlFormField.forEach(field => {
				let formItem;
				let rules = [{ required: !field.dbIsNull, message: `${field.dbFieldTxt}字段不能为空` }];
				const fieldProperties = onlFormField.fieldProperties ? JSON.parse(onlFormField.fieldProperties) : "";

				if (field.fieldShowType == "text") {
					rules.push({ max: field.dbLength, message: `${field.dbFieldTxt}字段长度不能超过${field.dbLength}` });
					formItem = <Input disabled={field.isReadOnly} placeholder={field.placeholder} />;
				} else if (field.fieldShowType == "date") {
					formItem = <DatePicker disabled={field.isReadOnly} style={{ width: '100%' }} placeholder={field.placeholder} />
				} else if (field.fieldShowType == "number") {
					formItem = <InputNumber style={{ width: '100%' }} placeholder={field.placeholder} />;		// TODO 数字长度、浮点数
				} else if (field.fieldShowType == "sel_tree") {
					let options = [];
					if (field.dictValue) {
						let dictValue = JSON.parse(field.dictValue);
						Object.keys(dictValue).forEach(function (key) {
							options.push(<Select.Option value={key} key={key}>{dictValue[key]}</Select.Option>);
						});
					}
					formItem = <Select disabled={field.isReadOnly} onChange={this.onModeChange} placeholder={field.placeholder}>
						{options}
					</Select>;
				} else if (field.fieldShowType == "textarea") {
					rules.push({ max: field.dbLength, message: `${field.dbFieldTxt}字段长度不能超过${field.dbLength}` });
					formItem = <Input.TextArea disabled={field.isReadOnly} placeholder={field.placeholder} />;
				} else if (field.fieldShowType == "sel_tree") {
					formItem = <SimpleTreeSelect {...fieldProperties} />;
				} else {
					rules.push({ max: field.dbLength, message: `${field.dbFieldTxt}字段长度不能超过${field.dbLength}` });
					formItem = <Input disabled={field.isReadOnly} placeholder={field.placeholder} />;
				}

				cols.push(
					<CFormItem key={field.dbFieldName} label={field.dbFieldTxt}>
						{
							getFieldDecorator(field.dbFieldName, {
								initialValue: this.state.datas.get(field.dbFieldName),
								rules: rules,
							})(formItem)
						}
					</CFormItem>
				);
			});
		}

		return [
			<FormPanel key='basicInfo' title={"测试"} cols={cols} />
		];
	}
}
