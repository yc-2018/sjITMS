import { connect } from 'dva';
import CreatePage from '@/pages/Component/Page/CreatePage';
import { loginCompany, getDefOwner } from '@/utils/LoginContext';
import { STATE, STATUS, SOURCE_WAY } from '@/utils/constants';
import { Form, Input, message, Select, Col } from 'antd';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { sourceWay } from '@/utils/SourceWay';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { categoryLocale } from './CategoryLocale';
import { codePattern } from '@/utils/PatternContants';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';
@connect(({ category, pretype, loading }) => ({
	category,
	pretype,
	loading: loading.models.category,
}))
@Form.create()
export default class CategoryCreatePage extends CreatePage {
	constructor(props) {
		super(props);

		this.state = {
			title: commonLocale.createLocale + categoryLocale.title,
			entity: {
				owner: getDefOwner(),
				companyUuid: loginCompany().uuid
			},
			levelList: [],
			upperList: []
		}
	}

	componentDidMount() {
		if (this.props.category.entityUuid) {
			this.props.dispatch({
				type: 'category/get',
				payload: this.props.category.entityUuid
			});
		}
		this.props.dispatch({
			type: 'pretype/queryType',
			payload: PRETYPE['categoryLevel']
		});
		this.getCategoryByCompanyUuid();
	}

	getCategoryByCompanyUuid = () => {
		this.props.dispatch({
			type: 'category/getByCompanyUuid'
		})
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.category.entity && this.props.category.entityUuid) {
			this.setState({
				entity: nextProps.category.entity,
				title: convertCodeName(nextProps.category.entity)
			});
		}
		if (nextProps.category.upperCode) {
			this.setState({
				upperCode: nextProps.category.upperCode
			})
		}
		this.setState({
			levelList: nextProps.pretype.names ? nextProps.pretype.names : [],
			upperList: nextProps.category.upperList ? nextProps.category.upperList : []
		});
	}

	onSave = (value) => {
		const { entity } = this.state;
		let data = {
			...this.state.entity,
			...value
		};
		if (!data.code) {
			data.code = entity.code;
		}
		data.ownerCode = JSON.parse(data.owner).code;
		delete data.owner;
		if (!data.uuid) {
			data.sourceWay = sourceWay.CREATE.name;
			this.props.dispatch({
				type: 'category/onSave',
				payload: data,
				callback: (response) => {
					if (response && response.success) {
						message.success(commonLocale.saveSuccessLocale);
						this.onCancel();
					}
				}
			});
		} else {
			this.props.dispatch({
				type: 'category/onModify',
				payload: data,
				callback: (response) => {
					if (response && response.success) {
						message.success(commonLocale.modifySuccessLocale);
						this.onCancel();
					}
				}
			});
		}
	}

	onSaveAndCreate = (value) => {
		const { entity } = this.state;
		let data = {
			...this.state.entity,
			...value
		};
		if (!data.code) {
			data.code = entity.code;
		}
		data.ownerCode = JSON.parse(data.owner).code;
		delete data.owner;
		data.sourceWay = sourceWay.CREATE.name;
		this.props.dispatch({
			type: 'category/onSave',
			payload: data,
			callback: (response) => {
				if (response && response.success) {
					this.getCategoryByCompanyUuid();
					message.success(commonLocale.saveSuccessLocale);
					this.props.form.resetFields();
				}
			}
		});
	}

	onCancel = () => {
		this.props.dispatch({
			type: 'category/showPage',
			payload: {
				showPage: 'query'
			}
		});
	}

	drawFormItems = () => {
		return (
			<FormPanel key="basicInfo" title={commonLocale.basicInfoLocale} cols={this.drawBasicInfoCols()} noteCol={this.drawNotePanel()} noteLabelSpan={4}/>
		);
	}

	drawBasicInfoCols = () => {
		const { form } = this.props;
		const { getFieldDecorator } = this.props.form;
		const { entity, levelList, upperList, defOwner } = this.state;
		var showSourceWay = false;
		if (entity.sourceWay) {
			showSourceWay = true;
		}
		let levelListItems = [];
		if (levelList && levelList.length > 0) {
			levelList.map((result) => levelListItems.push(<Select.Option key={`${result}`}>{`${result}`}</Select.Option>));
		}
		let upperCodeListItems = [];
		const owner = this.props.form.getFieldValue('owner');
		if (upperList && upperList.length > 0 && owner) {
			if (JSON.parse(owner) && JSON.parse(owner).uuid) {
				upperList.map((result) => result.code !== entity.code &&
					JSON.parse(owner).uuid === result.owner.uuid &&
					upperCodeListItems.push(<Select.Option key={`${result.code}`}>{`[${result.code}]${result.name}`}</Select.Option>));
			}
		}
		let codeItem = null;
		if (entity.code) {
			codeItem = <CFormItem key="code" label={commonLocale.codeLocale}>
				{form.getFieldDecorator('code')(
					<Col>{entity.code ? entity.code : '空'}</Col>
				)}
			</CFormItem>;
		} else {
			codeItem = <CFormItem key="code" label={commonLocale.codeLocale}>
				{form.getFieldDecorator('code', {
					initialValue: entity.code,
					rules: [
						{ required: true, message: notNullLocale(commonLocale.codeLocale) },
						{
							pattern: codePattern.pattern,
							message: codePattern.message,
						},
					]
				})(<Input placeholder={placeholderLocale(commonLocale.codeLocale)} />)}
			</CFormItem>;
		}
		let basicInfoCols = [];
		basicInfoCols.push(codeItem);
		basicInfoCols.push(
			<CFormItem key='name' label={commonLocale.nameLocale}>
				{getFieldDecorator('name', {
					rules: [
						{ required: true, message: notNullLocale(commonLocale.nameLocale) },
						{
							max: 30,
							message: tooLongLocale(commonLocale.nameLocale, 30),
						},
					],
					initialValue: entity.name,
				})(<Input placeholder={placeholderLocale(commonLocale.nameLocale)} />)}
			</CFormItem>
		);
		basicInfoCols.push(
			<CFormItem key='owner' label={commonLocale.inOwnerLocale}>
				{getFieldDecorator('owner', {
					initialValue: entity.owner ? JSON.stringify(entity.owner) : undefined,
					rules: [
						{ required: true, message: notNullLocale(commonLocale.inOwnerLocale) },
					]
				})(<OwnerSelect onlyOnline placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} />)}
			</CFormItem>
		);
		basicInfoCols.push(
			<CFormItem key='level' label={categoryLocale.level}>
				{
					getFieldDecorator('level', {
						rules: [
							{ required: true, message: notNullLocale(categoryLocale.level) },
						],
						initialValue: entity.level,
					})(
						<Select
							showSearch
							placeholder={placeholderChooseLocale(categoryLocale.level)}
						>
							{levelListItems}
						</Select >
					)
				}
			</CFormItem>
		);
		basicInfoCols.push(
			<CFormItem key='upperCode' label={categoryLocale.upperCategory}>
				{
					getFieldDecorator('upperCode', {
						initialValue: entity.upper ? entity.upper.code : this.state.upperCode,
					})(
						<Select
							showSearch
							placeholder={placeholderLocale(categoryLocale.upperCategory)}
						>
							{upperCodeListItems}
						</Select >
					)
				}
			</CFormItem>
		);
		if (showSourceWay) {
			basicInfoCols.push(
				<CFormItem key='sourceWay' label={commonLocale.sourceWayLocale}>
					{getFieldDecorator('sourceWay', {
					})(<span>{sourceWay[entity.sourceWay] && sourceWay[entity.sourceWay].caption}</span>)}
				</CFormItem>
			);
		}

		return basicInfoCols;
	}
}
