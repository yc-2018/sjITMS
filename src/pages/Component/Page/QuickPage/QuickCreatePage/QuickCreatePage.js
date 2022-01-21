import { connect } from 'dva';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { loginCompany, loginOrg, loginUser, getDefOwner, getActiveKey } from '@/utils/LoginContext';
import { Form, Select, Input, InputNumber, message, Col, DatePicker, Modal } from 'antd';
import { commonLocale } from '@/utils/CommonLocale';
// import { onlFormField } from "./Data"


@connect(({ quick,loading }) => ({
    quick,
    loading: loading.models.quick,
  }))
@Form.create()
export default class QuickCreatePage extends CreatePage {

	
	/**
	* 获取配置信息
   	*/
	getCreateConfig = () => {
		this.props.dispatch({
		  type: 'quick/queryCreateConfig',
		  payload: this.state.quickuuid,
		  callback: response => {
			if (response.result) this.initCreateConfig(response.result.onlFormFields);
		  },
		});
	}

	initCreateConfig=(onlFormFields)=>{
		this.setState({onlFormField:onlFormFields})
	}

   //获取tableName
  queryCoulumns = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'quick/queryColumns',
      payload: {
        reportCode: this.state.quickuuid,
        sysCode: 'tms',
      },
      callback: response => {
        if (response.result){
			 //获取tableName
			 let sqlsplit = response.result.sql.split(/\s+/);
			 let tableName = sqlsplit[sqlsplit.length-1]
			 this.setState({tableName:tableName})
		}
      },
    });
  };

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
			onlFormField:[],
			quickuuid:props.quickuuid,
			tableName:''
		}
	}


	componentDidMount() {
		this.getCreateConfig();		
		this.queryCoulumns()
	}


	onCancel = () => {
		this.props.form.resetFields();
		this.props.dispatch({
			type: 'quick/showPageMap',
			payload: {
				showPageK:this.state.quickuuid,
				showPageV:this.state.quickuuid+'query'
			 }
		});
	}

	onSave = (data) => {
		// 这里可以收集到表单的数据
		// 自定义提交数据接口
		// 默认实现的数据保存接口
		console.log("data",data);
		console.log("tableName",this.state.tableName);
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
		//const{map} = this.props.quick
		const {onlFormField} = this.state
		let cols = [];
		if (typeof(onlFormField)!=="undefined"&&onlFormField.length>0) {
			onlFormField.forEach(field => {
				let formItem;
				let rules = [{ required: !field.dbIsNull, message: `${field.dbFieldTxt}字段不能为空` }];
				
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
		}
			
		return [
			<FormPanel key='basicInfo' title={"测试"} cols={cols}/>
		];
	}
}
