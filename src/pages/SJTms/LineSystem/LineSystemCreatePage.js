import { connect } from 'dva';
import { Form,Input ,DatePicker} from 'antd';
import moment from 'moment';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import {
  SimpleSelect,
  SimpleTreeSelect,
  SimpleRadio,
  SimpleAutoComplete,
  SimpleAddress,
} from '@/pages/Component/RapidDevelopment/CommonComponent';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))

@Form.create()
export default class LineSystemCreatePage extends QuickCreatePage {
    /**
   * 根据控件类型获取控件
   */
     convertInitialValue = (value, fieldShowType, dbType) => {
      if (value == undefined || value == null) {
        return value;
      }
      if (fieldShowType == 'date') {
        return moment(value, 'MM-DD');
      } else if (['text', 'textarea'].indexOf(fieldShowType) > -1 || !fieldShowType) {
        return value.toString();
      } else if (dbType == 'Integer') {
        return parseInt(value);
      } else if (dbType == 'Double' || dbType == 'BigDecimal') {
        return parseFloat(value);
      } else {
        return value;
      }
    };


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
