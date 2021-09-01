import { connect } from 'dva';
import CreatePage from '@/pages/Component/Page/CreatePage';
import { loginCompany } from '@/utils/LoginContext';
import Address from '@/pages/Component/Form/Address';
import { Form, Input, message, Col } from 'antd';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { sourceWay } from '@/utils/SourceWay';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { ownerLocale } from './OwnerLocale';
import { codePattern } from '@/utils/PatternContants';
@connect(({ owner, loading }) => ({
	owner,
	loading: loading.models.owner,
}))
@Form.create()
export default class OwnerCreatePage extends CreatePage {
	constructor(props) {
		super(props);

		this.state = {
			title: commonLocale.createLocale + ownerLocale.title,
			entity: {
				companyUuid: loginCompany().uuid,
				sourceWay: sourceWay.CREATE.name,
			},
			spinning: false,
		}
	}

	componentDidMount() {
		this.refresh();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.owner.entity && this.props.owner.entityUuid) {
			this.setState({
				entity: nextProps.owner.entity,
				title: convertCodeName(nextProps.owner.entity)
			});
		}
	}
	refresh = () => {
		this.props.dispatch({
			type: 'owner/get',
			payload: this.props.owner.entityUuid
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
		if (!data.address.country || !data.address.province) {
			message.error("地址不能为空");
		} else if (!data.address.street) {
			message.error("详细地址不能为空");
		} else {
			if (!data.uuid) {
				this.props.dispatch({
					type: 'owner/onSave',
					payload: data,
					callback: (response) => {
						if (response && response.success) {
							message.success(commonLocale.saveSuccessLocale);
						}
					}
				});
			} else {
				this.props.dispatch({
					type: 'owner/onModify',
					payload: data,
					callback: (response) => {
						if (response && response.success) {
							message.success(commonLocale.modifySuccessLocale);
						}
					}
				});
			}
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
		if (!data.address.country || !data.address.province) {
			message.error("地址不能为空");
		} else if (!data.address.street) {
			message.error("详细地址不能为空");
		} else {
			this.props.dispatch({
				type: 'owner/onSaveAndCreate',
				payload: data,
				callback: (response) => {
					if (response && response.success) {
						message.success(commonLocale.saveSuccessLocale);
						this.props.form.resetFields();
					}
				}
			});
		}
	}

	onCancel = () => {
		this.props.dispatch({
			type: 'owner/showPage',
			payload: {
				showPage: 'query'
			}
		});
	}

	drawFormItems = () => {
		return (
			<FormPanel key="basicInfo" noteLabelSpan={4} title={commonLocale.basicInfoLocale} cols={this.drawBasicInfoCols()} noteCol={this.drawNotePanel()}/>
		);
	}

	drawBasicInfoCols = () => {
		const { form } = this.props;
		const { entity } = this.state;
		let basicInfoCols = [];
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
		basicInfoCols.push(
			codeItem
		);
		basicInfoCols.push(
			<CFormItem key='name' label={commonLocale.nameLocale}>
				{form.getFieldDecorator('name', {
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
			<CFormItem key='shortName' label={commonLocale.shortNameLocale}>
				{form.getFieldDecorator('shortName', {
					rules: [{
						max: 30, message: tooLongLocale(commonLocale.shortNameLocale, 30),
					}],
					initialValue: entity.shortName,
				})(<Input placeholder={placeholderLocale(commonLocale.shortNameLocale)} />)}
			</CFormItem>
		);
		basicInfoCols.push(
			<CFormItem key='contactor' label={commonLocale.contactorLocale}>
				{form.getFieldDecorator('contactor', {
					rules: [{ required: true, message: notNullLocale(commonLocale.contactorLocale) }, {
						max: 30, message: tooLongLocale(commonLocale.contactorLocale, 30),
					}],
					initialValue: entity.contactor,
				})(<Input placeholder={placeholderLocale(commonLocale.contactorLocale)} />)}
			</CFormItem>
		);
		basicInfoCols.push(
			<CFormItem key='contactPhone' label={commonLocale.contactPhoneLocale}>
				{form.getFieldDecorator('contactPhone', {
					rules: [{ required: true, message: notNullLocale(commonLocale.contactPhoneLocale) }, {
						max: 30, message: tooLongLocale(commonLocale.contactPhoneLocale, 30),
					}],
					initialValue: entity.contactPhone,
				})(<Input placeholder={placeholderLocale(commonLocale.contactPhoneLocale)} />)}
			</CFormItem>
		);
		basicInfoCols.push(
			<CFormItem key='address' label={commonLocale.addressLocale}>
				{form.getFieldDecorator('address', {
					initialValue: entity.address,
					rules: [
						{ required: true, message: notNullLocale(commonLocale.addressLocale) },
					]
				})(<Address />)}
			</CFormItem>
		);
		basicInfoCols.push(
			<CFormItem key='zipCode' label={commonLocale.zipCodeLocale}>
				{form.getFieldDecorator('zipCode', {
					rules: [{
						max: 30, message: tooLongLocale(commonLocale.zipCodeLocale, 30),
					}],
					initialValue: entity.zipCode,
				})(<Input placeholder={placeholderLocale(commonLocale.zipCodeLocale)} />)}
			</CFormItem>
		);
		basicInfoCols.push(
			<CFormItem key='homePage' label={commonLocale.homeUrlLocale}>
				{form.getFieldDecorator('homePage', {
					initialValue: entity.homePage,
					rules: [
						{
							max: 30,
							message: tooLongLocale(commonLocale.homeUrlLocale, 30),
						},
					],
				})(<Input placeholder={placeholderLocale(commonLocale.homeUrlLocale)} />)}
			</CFormItem>
		);
		return basicInfoCols;
	}
}
