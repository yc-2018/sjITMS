import { connect } from 'dva';
import { Form, Select, Input, InputNumber, message, Col, DatePicker, Modal } from 'antd';
import moment from 'moment';
import {
  commonLocale,
  notNullLocale,
  placeholderLocale,
  placeholderChooseLocale,
  confirmLineFieldNotNullLocale,
} from '@/utils/CommonLocale';
import { loginCompany, loginOrg, loginUser, getDefOwner, getActiveKey } from '@/utils/LoginContext';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import {
  SimpleTreeSelect,
  SimpleRadio,
  SimpleAutoComplete,
} from '@/pages/Component/RapidDevelopment/CommonComponent';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePage';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { convertCodeName } from '@/utils/utils';
import { colWidth, itemColWidth } from '@/utils/ColWidth';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class QuickCreateExpandDemo extends QuickCreatePage {

  exHandleChange = (e, tableName, dbFieldName, line, formInfo, onlFormField) =>{
    console.log("exHandleChange");
    if (tableName == "eee" && dbFieldName == "NAME" && e == 11) {
      this.setFieldsValue("eee", "DEPARTMENT1", 1366201121000008);
    }
    
    if (tableName == "eee" && dbFieldName == "AGE") {
      this.setComponentproperty(tableName, "BIRTHDAY", {
        disabledDate: (current) => {
          return current && current > moment().add(e, 'd');
        }, showToday: false
      });
    }

    if (tableName == "classes" && dbFieldName == "CLASSNAME") {
      this.setComponentproperty(tableName, "CLASSNAME2", {
        queryParams: JSON.stringify({
          tableName: "DEPARTMENT",
          condition: {
            params: [
              {
                field: "ID",
                rule: "like",
                val: [e.target.value]
              }
            ]
          }
        })
      }, line);
    }
    // this.props.form.setFieldsValue({ "eee_NAME": 11 })
    // this.props.form.setFieldsValue({ "classesID1": 11 })
  }

  beforeSave = (entity) => {
    if (entity["classes"].length < 3) {
      message.error("明细最少填写3条！");
      return false;
    }
  }
}
