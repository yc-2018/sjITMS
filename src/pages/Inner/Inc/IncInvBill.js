import { PureComponent } from "react";
import { connect } from 'dva';
import IncInvBillCreatePage from './IncInvBillCreatePage';
import IncInvBillSearchPage from './IncInvBillSearchPage';
import IncInvBillViewPage from './IncInvBillViewPage';
import IncInvBillAuditPage from './IncInvBillAuditPage';
import { incLocale } from './IncInvBillLocale';
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';
import ExcelImport from '@/components/ExcelImport';
import {ImportTemplateType} from '@/pages/Account/ImTemplate/ImTemplateContants';
@connect(({ inc, loading }) => ({
	inc,
	loading: loading.models.inc,
}))
export default class IncInvBill extends PureComponent {
	showQuery = () => {
		this.props.dispatch({
			type: 'inc/showPage',
			payload: {
				showPage: 'query'
			}
		});
	}
	handleExcelImportCallback = () => {
		this.showQuery();
	}
	render() {
		const { showPage, entityUuid, importTemplateUrl } = this.props.inc;
		if (showPage === 'create') {
			return <IncInvBillCreatePage entityUuid={entityUuid} pathname={this.props.location.pathname}/>;
		} else if (showPage === 'query') {
			return <IncInvBillSearchPage pathname={this.props.location.pathname}/>;
		} else if (showPage === 'view') {
			return <IncInvBillViewPage pathname={this.props.location.pathname}/>;
		} else if (showPage === 'audit') {
			return <IncInvBillAuditPage pathname={this.props.location.pathname}/>;
		} else if (showPage === 'type') {
			return (<PreType
				preType={PRETYPE['incInvType']}
				title={incLocale.type}
				backToBefore={this.showQuery}
			/>);
		} else if (showPage === 'import') {
			return <ExcelImport
				// title={incLocale.title}
				// templateUrl={importTemplateUrl}
        title={ImportTemplateType.INCINVBILL.caption}
        templateType ={ImportTemplateType.INCINVBILL.name}
				uploadType='inc/batchImport'
				cancelCallback={this.handleExcelImportCallback}
				dispatch={this.props.dispatch}
			/>;
		}
	}
}
