import { connect } from 'dva';
import { Form } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';

@connect(({ quick, loading }) => ({
  quick
}))
@Form.create()
export default class LineSystemAddPage extends QuickCreatePage {

    convertSaveValue = (e, fieldShowType) => {
        if (fieldShowType == 'date') {
          return e?.format('MM-DD');
        } else if (
          fieldShowType == 'text' ||
          fieldShowType == 'textarea' ||
          fieldShowType == 'radio' ||
          !fieldShowType
        ) {
          return e.target.value;
        } else if (fieldShowType == 'auto_complete' || fieldShowType == 'sel_tree') {
          return e.value;
        } else {
          return e;
        }
      };
}