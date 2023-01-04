import { connect } from 'dva';
import { Form } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import moment from 'moment';
import { loginOrg } from '@/utils/LoginContext';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class CustomerCreate extends QuickCreatePage {
  formLoaded = () => {
    const { showPageNow } = this.props;
    if (showPageNow == 'create') {
      const mainName = 'sj_itms_customer_service';
      this.entity[mainName][0]['FEEDBACKTIME'] = moment();
      this.entity[mainName][0]['WAREHOUSE'] = loginOrg().uuid;
    }
  };
  exHandleChange = columnEvent => {
    const mainName = 'sj_itms_customer_service';
    const { fieldName, valueEvent } = columnEvent;
    if (fieldName == 'DISPOSEDEPT' && valueEvent) {
      this.entity[mainName][0]['DISPOSEDEPTNAME'] = valueEvent.record.NAME;
      this.entity[mainName][0]['DISPOSECODE'] = valueEvent.record.MANAGERCODE?.split(',')[0];
      this.entity[mainName][0]['DISPOSENAME'] = valueEvent.record.MANAGERNAME?.split(',')[0];
    }
    if (fieldName == 'COMPLETIONTIME' && valueEvent) {
      const feedbackTime = this.entity[mainName][0]['FEEDBACKTIME'];
      if (feedbackTime) {
        this.entity[mainName][0]['DEADLINE'] = moment().add(Number(valueEvent.value), 'hours');
      }
    }
  };
}
