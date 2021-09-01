import { PureComponent } from 'react';
import { connect } from 'dva';
import SerialArchSearchPage from './SerialArchSearchPage';
import ExcelImport from '@/components/ExcelImport';
import { ImportTemplateType } from '@/pages/Account/ImTemplate/ImTemplateContants';
import { loginCompany } from '@/utils/LoginContext';

@connect(({ serialArch, loading }) => ({
    serialArch,
    loading: loading.models.serialArch,
}))
export default class SerialArch extends PureComponent {


    handleExcelImportCallback = () => {
        this.props.dispatch({
            type: 'serialArch/showPage',
            payload: {
                showPage: 'query'
            }
        });
    }


    render() {
        const uploadParams = {
            serialArchUuid: this.props.serialArch.archEntity.uuid,
            companyUuid: loginCompany().uuid
        }
        if (this.props.serialArch.showPage === 'query') {
            return <SerialArchSearchPage />;
        } else if (this.props.serialArch.showPage === 'import') {
            return <ExcelImport
                title={ImportTemplateType.SERIALARCHLINESTORE.caption}
                templateType={ImportTemplateType.SERIALARCHLINESTORE.name}
                uploadParams={uploadParams}
                uploadType='serialArch/batchImport'
                cancelCallback={this.handleExcelImportCallback}
                dispatch={this.props.dispatch}
            />;
        }
    }
}