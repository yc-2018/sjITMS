import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { connect } from 'dva';
@connect(({ quick,loading}) => ({
    quick,
    loading: loading.models.quick,
  }))
export default class NocheckInfo extends QuickFormSearchPage {

    state = {
        ...this.state,
        isNotHd:true,
    }
}