import { PureComponent } from "react";
import { connect } from 'dva';
import ExcelImport from '@/components/ExcelImport';
import { loginOrg } from '@/utils/LoginContext';
import { orgType } from '@/utils/OrgType';
import { importTemplateType } from '@/utils/ImportTemplateType';
import { ImportTemplateType } from '@/pages/Account/ImTemplate/ImTemplateContants';

@connect(({ dataImport, loading }) => ({
    dataImport,
    loading: loading.models.dataImport,
  }))
export default class DataImport extends PureComponent{

    render() {
        const {
          importType,
        } = this.props.dataImport;
    
        const uploadParams = {
          type: importType,
        }
        return (<ExcelImport
            title={importTemplateType[importType].caption}
            templateType={importType}
            uploadType='dataImport/batchImport'
            noAction
            uploadParams={uploadParams}
            dispatch={this.props.dispatch}
          />);
    }
}