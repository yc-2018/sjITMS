import { connect } from 'dva';
import CreatePage from '@/pages/Component/Page/CreatePage';
import { loginCompany } from '@/utils/LoginContext';
import { STATE, STATUS, SOURCE_WAY } from '@/utils/constants';
import Address from '@/pages/Component/Form/Address';
import { Form, Input, message } from 'antd';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { sourceWay } from '@/utils/SourceWay';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { carrierLocale } from './CarrierLocale';
import { codePattern } from '@/utils/PatternContants';
@connect(({ carrier, loading }) => ({
	carrier,
	loading: loading.models.carrier,
}))
@Form.create()
export default class CarrierCreatePage extends CreatePage {
	constructor(props) {
		super(props);

		this.state = {
			title: commonLocale.createLocale + carrierLocale.title,
			entity: {
				companyUuid: loginCompany().uuid,
				sourceWay: sourceWay.CREATE.name,
			},
			spinning: false,
		}
	}

	componentDidMount() {
		if (this.props.carrier.entityUuid) {
			this.props.dispatch({
				type: 'carrier/get',
				payload: {
					uuid: this.props.carrier.entityUuid
				}
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.carrier.entity && this.props.carrier.entityUuid) {
			this.setState({
				entity: nextProps.carrier.entity,
				title: convertCodeName(nextProps.carrier.entity)
			});
		}
	}

	onSave = (value) => {
		let data = {
			...this.state.entity,
			...value
		};
		if (!data.uuid) {
			this.props.dispatch({
				type: 'carrier/onSave',
				payload: data,
				callback: (response) => {
					if (response && response.success) {
						message.success(commonLocale.saveSuccessLocale);
					}
				}
			});
		} else {
			this.props.dispatch({
				type: 'carrier/onModify',
				payload: data,
				callback: (response) => {
					if (response && response.success) {
						message.success(commonLocale.modifySuccessLocale);
					}
				}
			});
		}
	}

	onSaveAndCreate = (value) => {
		let data = {
			...this.state.entity,
			...value
		};
		this.props.dispatch({
			type: 'carrier/onSaveAndCreate',
			payload: data,
			callback: (response) => {
				if (response && response.success) {
					message.success(commonLocale.saveSuccessLocale);
					this.props.form.resetFields();
				}
			}
		});
	}

	onCancel = () => {
		this.props.dispatch({
			type: 'carrier/showPage',
			payload: {
				showPage: 'query'
			}
		});
	}

	drawFormItems = () => {
		return (
			<FormPanel key="basicInfo" title={commonLocale.basicInfoLocale} cols={this.drawBasicInfoCols()} />
		);
	}

	drawBasicInfoCols = () => {
		const { form } = this.props;
		const { entity } = this.state;
		let basicInfoCols = [];
		basicInfoCols.push(
			<CFormItem key="code" label={commonLocale.codeLocale}>
				{form.getFieldDecorator('code', {
					rules: [
						{ required: true, message: notNullLocale(commonLocale.codeLocale) },
						{
							pattern: codePattern.pattern,
							message: codePattern.message,
						},
					],
					initialValue: entity.code,
				})(<Input disabled={entity.code ? true : false} placeholder={placeholderLocale(commonLocale.codeLocale)} />)}
			</CFormItem>
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
			<CFormItem key='homeUrl' label={commonLocale.homeUrlLocale}>
				{form.getFieldDecorator('homeUrl', {
					initialValue: entity.homeUrl,
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