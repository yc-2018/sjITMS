import { connect } from 'dva';
import { Form } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';

@connect(({ quick, loading }) => ({
  quick,
}))
@Form.create()
export default class ScheduleGroupCreatePage extends QuickCreatePage {
  formLoaded = () => {
    this.onSave();
  };
}