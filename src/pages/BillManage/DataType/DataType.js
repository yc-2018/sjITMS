import { PureComponent } from 'react';
import { connect } from 'dva';
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';
// import DataTypeSearchPage from './DataTypeSearchPage';

@connect(({ dataImport, loading }) => ({
    dataImport,
    loading: loading.models.dataImport,
  }))

export default class DataType extends PureComponent{

    render(){

       return <PreType
        preType={PRETYPE['billData']}
        title={'计费数据类型'}
        noBack
      />
    }
}