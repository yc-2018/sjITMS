import { connect } from 'dva';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { loginCompany, loginOrg, loginUser, getDefOwner, getActiveKey } from '@/utils/LoginContext';
import { Form, Select, Input, InputNumber, message, Col, DatePicker, Modal } from 'antd';
import { commonLocale } from '@/utils/CommonLocale';
import { onlFormField } from "./Data"

@connect(({ loading }) => ({
	// loading: loading.models.alcNtc,
	loading: false
}))
@Form.create()
export default class QuickCreatePage extends CreatePage {

	constructor(props) {
		super(props);
		this.state = {
			title: "测试标题",
			auditButton: true,
			entityUuid: "",
			entity: {
				uuid: ""
			},
			auditPermission: "iwms.out.alcntc.audit",
		}
	}

	componentDidMount() {
		
	}

	componentWillReceiveProps(nextProps) {
	}

	onCancel = () => {
		this.props.form.resetFields();
		this.props.dispatch({
			type: 'zztest/showPage',
			payload: {
				showPage: 'query'
			}
		});
	}

	onSave = (data) => {
		// 这里可以收集到表单的数据
		// 自定义提交数据接口
		// 默认实现的数据保存接口
		console.log("data", data);
		console.log("detail", this.state.entity.items)
		
		// this.props.dispatch({
		// 	type: 'alcNtc/onSave',
		// 	payload: creation,
		// 	callback: (response) => {
		// 		if (response && response.success) {
		// 			this.props.form.resetFields();
		// 			message.success(commonLocale.saveSuccessLocale);
		// 		}
		// 	}
		// });
	}

	onSaveAndCreate = (data) => {
		console.log(onSaveAndCreate)
		
		return;

		this.props.dispatch({
			type: 'alcNtc/onSaveAndCreate',
			payload: creation,
			callback: (response) => {
				if (response && response.success) {
					this.setState({
						entity: {
							companyUuid: loginCompany().uuid,
							dcUuid: loginOrg().uuid,
							items: []
						}
					});
					this.props.form.resetFields();
					message.success(commonLocale.saveSuccessLocale);
				}
			}
		});
	}

	/**
	 * 渲染表单组件
	 * @returns 
	 */
	drawFormItems = () => {
		const { getFieldDecorator } = this.props.form;
		let cols = [];
		onlFormField.forEach(field => {
			let formItem;
			let rules = [{ required: !field.dbIsNull, message: `${field.dbFieldTxt}字段不能为空` }];
			
			if (field.fieldShowType == "input") {
				rules.push({ max: field.dbLength, message: `${field.dbFieldTxt}字段长度不能超过${field.dbLength}` });
				formItem = <Input disabled={field.isReadOnly} placeholder={field.placeholder} />;
			} else if (field.fieldShowType == "date") {
				formItem = <DatePicker disabled={field.isReadOnly} style={{ width: '100%' }} placeholder={field.placeholder} />
			} else if (field.fieldShowType == "number") {
				formItem = <InputNumber style={{ width: '100%' }} placeholder={field.placeholder} />;		// TODO 数字长度、浮点数
			} else if (field.fieldShowType == "select") {
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
				formItem = <Input.TextArea disabled={field.isReadOnly} placeholder={field.placeholder}/>;
			}

			cols.push(
				<CFormItem key={field.dbFieldName} label={field.dbFieldTxt}>
					{
						getFieldDecorator(field.dbFieldName, {
							initialValue: field.dbDefaultVal,
							rules: rules,
						})(formItem)
					}
				</CFormItem>
			);
		});
		
		return [
			<FormPanel key='basicInfo' title={"测试"} cols={cols}/>
		];
	}
}
