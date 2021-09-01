import { PureComponent } from 'react';
import { connect } from 'dva';
import BillImportMouldSearchPage from './BillImportMouldSearchPage';
import BillImportMouldViewPage from './BillImportMouldViewPage';
import BillImportMouldCreatePage from './BillImportMouldCreatePage';
import BillImportPage from './BillImportPage';
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';

@connect(({ billImport, loading }) => ({
    billImport,
    loading: loading.models.billImport,
}))
export default class BillImport extends PureComponent {
    handleExcelImportCallback = () => {
        this.props.dispatch({
          type: 'billImport/showPage',
          payload: {
            showPage: 'query'
          }
        });
      }
    render() {
      if (this.props.billImport.showPage === 'home') {
        return <BillImportPage pathname={this.props.location.pathname} />;
      } if (this.props.billImport.showPage === 'query') {
        return <BillImportMouldSearchPage pathname={this.props.location.pathname} />;
      } else if (this.props.billImport.showPage === 'view') {
        return <BillImportMouldViewPage pathname={this.props.location.pathname} />;
      } else if (this.props.billImport.showPage === 'create') {
        return <BillImportMouldCreatePage pathname={this.props.location.pathname} />;
      }else if (this.props.billImport.showPage === 'type') {
            return (<PreType
                preType={PRETYPE.defaultQpcUnit}
                title={'默认规格单位'}
                pathname={this.props.location.pathname}
                backToBefore={this.handleExcelImportCallback}
            />);
        }
    }
}
