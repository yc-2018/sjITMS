import { PureComponent } from 'react';
import { connect } from 'dva';
import SerialArchSearchPage from './SerialArchSearchPage';
import ExcelImport from '@/components/ExcelImport';
import { ImportTemplateType } from '@/pages/Account/ImTemplate/ImTemplateContants';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

@connect(({ dispatchSerialArch, loading }) => ({
  dispatchSerialArch,
    loading: loading.models.dispatchSerialArch,
}))
export default class SerialArch extends PureComponent {


    handleExcelImportCallback = () => {
        this.props.dispatch({
            type: 'dispatchSerialArch/showPage',
            payload: {
                showPage: 'query'
            }
        });
    }


    render() {
        const uploadParams = {
            serialArchUuid: this.props.dispatchSerialArch && this.props.dispatchSerialArch.selectedSerialArch ? this.props.dispatchSerialArch.selectedSerialArch.uuid : '',
            dispatchCenterUuid: loginOrg().uuid,
            companyUuid: loginCompany().uuid
        }
        if (this.props.dispatchSerialArch.showPage === 'query') {
            return <SerialArchSearchPage />;
        } else if (this.props.dispatchSerialArch.showPage === 'import') {
            return <ExcelImport
                title={ImportTemplateType.SERIALARCHLINESTORE.caption}
                templateType={ImportTemplateType.SERIALARCHLINESTORE.name}
                uploadParams={uploadParams}
                uploadType='dispatchSerialArch/batchImport'
                cancelCallback={this.handleExcelImportCallback}
                dispatch={this.props.dispatch}
            />;
        }
    }
}
