/*
 * @Author: guankongjin
 * @Date: 2023-01-03 11:44:10
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-04-17 11:30:13
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\SJTms\Customer\CustomerCreate.js
 */
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
      this.entity[mainName][0]['FEEDBACKTIME'] = moment().format('YYYY-MM-DD HH:mm:ss');
      this.entity[mainName][0]['WAREHOUSE'] = loginOrg().uuid;
    }
  };
  exHandleChange = columnEvent => {
    const mainName = 'sj_itms_customer_service';
    const { fieldName, valueEvent } = columnEvent;
    if (fieldName == 'RESPONSIBILITYGROUP' && valueEvent) {
      const { formItems } = this.state;
      let rules = formItems['sj_itms_customer_service_RESPONSIBILITYCODE'].rules;
      rules.forEach(rule => {
        if (rule.hasOwnProperty('required')) {
          rule.required = valueEvent.record.DESCRIPTION === '1';
        }
      });
      this.setState({ formItems });
    }
    if (fieldName == 'ISDISPOSE' && valueEvent) {
      const { formItems } = this.state;
      const rules = formItems['sj_itms_customer_service_DISPOSEDEPT']?.rules || [];
      rules.forEach(rule => {
        if (rule.hasOwnProperty('required')) {
          rule.required = valueEvent.value == '1';
        }
      });
      this.setState({ formItems });
    }
    // if (fieldName == 'RESPONSIBILITYDEPT' && valueEvent) {
    //   const { formItems } = this.state;
    //   let rules = formItems['sj_itms_customer_service_RESULTTAG'].rules;
    //   rules.forEach(rule => {
    //     if (rule.hasOwnProperty('required')) {
    //       rule.required = valueEvent.value != undefined;
    //     }
    //   });
    //   this.setState({ formItems });
    // }
    // if (fieldName == 'SPECIFICTYPE' && valueEvent) {
    //   const { formItems } = this.state;
    //   let rules = formItems['sj_itms_customer_service_RESULTTAG'].rules;
    //   rules.forEach(rule => {
    //     if (rule.hasOwnProperty('required')) {
    //       rule.required = valueEvent.record.REQUIRED === 1;
    //     }
    //   });
    //   this.setState({ formItems });
    // }
    if (fieldName == 'DISPOSEDEPT' && valueEvent) {
      this.entity[mainName][0]['DISPOSEDEPTNAME'] = valueEvent.record.NAME;
      // this.entity[mainName][0]['DISPOSECODE'] = valueEvent.record.MANAGERCODE?.split(',')[0];
      this.entity[mainName][0]['DISPOSENAME'] = valueEvent.record.MANAGERNAME?.split(',')[0];
      this.setFieldsValue(
        mainName,
        'DISPOSECODE',
        valueEvent.record.MANAGERCODE?.split(',')[0],
        undefined,
        valueEvent.record.MANAGERNAME?.split(',')[0]
      );
    }
    if (fieldName == 'COMPLETIONTIME' && valueEvent) {
      const feedbackTime = this.entity[mainName][0]['FEEDBACKTIME'];
      if (feedbackTime) {
        this.entity[mainName][0]['DEADLINE'] = moment(feedbackTime)
          .add(Number(valueEvent.value), 'hours')
          .format('YYYY-MM-DD HH:mm:ss');
      }
    }
    if (fieldName == 'FEEDBACKTIME' && valueEvent) {
      const completionTime = this.entity[mainName][0]['COMPLETIONTIME'];
      if (completionTime) {
        this.entity[mainName][0]['DEADLINE'] = moment(valueEvent)
          .add(Number(completionTime), 'hours')
          .format('YYYY-MM-DD HH:mm:ss');
      }
    }
    if (fieldName == 'CUSTOMERCODE' && valueEvent) {
      this.entity[mainName][0]['CUSTOMERCODE'] = valueEvent.value?.split(']')[0].replaceAll('[',"");

  }
}
}
