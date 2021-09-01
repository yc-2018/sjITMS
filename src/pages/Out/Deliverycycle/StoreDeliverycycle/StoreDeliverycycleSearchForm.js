import { connect } from 'dva';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select } from 'antd';
import BasicStateSelect from '@/pages/Component/Select/BasicStateSelect';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { PRETYPE } from '@/utils/constants';
import { loginCompany } from '@/utils/LoginContext';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import {deliverycycleLocale} from '../DeliverycycleLocale'
import ConfigSearchForm from '@/pages/Component/Form/ConfigSearchForm';

@connect(({ store, pretype, loading }) => ({
	store,
	pretype,
	loading: loading.models.store,
}))
@Form.create()
class StoreDeliverycycleSearchForm extends ConfigSearchForm {
	constructor(props) {
		super(props);
		this.state = {
		}
	}
	componentWillReceiveProps(nextProps){
		if(nextProps.key!=this.props.key){
			this.props.form.setFieldsValue({
				codeName: undefined,
				storeType: undefined,
				operatingType: undefined,
			});
		}
		

	}
	onReset = () => {
		this.props.refresh();
	}

	onSearch = (data) => {
		this.props.refresh(data);
	}

	drawCols = () => {
		const { form, filterValue } = this.props;
		const { getFieldDecorator } = form;
		let cols = [];
		cols.push(
			<SFormItem key="codeName" label={commonLocale.inStoreLocale}>
			  {getFieldDecorator('codeName', {
				  initialValue: filterValue ? filterValue.codeName : ''
			  })(
				  <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)}/>
			  )}
			</SFormItem>
		  );
		cols.push(
			<SFormItem key="storeType" label={deliverycycleLocale.deliverycycleStoreType}>
			  {getFieldDecorator('storeType', {
				  initialValue: filterValue&&filterValue.storeType?filterValue.storeType:''
				})(
          <PreTypeSelect
            hasAll
            orgUuid ={loginCompany().uuid}
            preType={PRETYPE.store}
          />
			  )}
			</SFormItem>
		  );
		  cols.push(
        <SFormItem key="operatingType" label={deliverycycleLocale.deliverycycleOperatingType}>
        {getFieldDecorator('operatingType', {
          initialValue: filterValue&&filterValue.operatingType?filterValue.operatingType:''
        })(
          <PreTypeSelect
            hasAll
            orgUuid ={loginCompany().uuid}
            preType={PRETYPE.storeOperating}
          />
        )}
        </SFormItem>
		  );

		return cols;
	}
}
export default connect(({ global, setting }) => ({
    collapsed: global.collapsed,
    layout: setting.layout
  }))(StoreDeliverycycleSearchForm);