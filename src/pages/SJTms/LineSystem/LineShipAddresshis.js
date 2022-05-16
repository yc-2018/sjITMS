/*
 * @Author: guankongjin
 * @Date: 2022-03-10 09:59:43
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-04-22 14:36:26
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\SJTms\LineSystem\LineShipAddress.js
 */
import { connect } from 'dva';
import { Table, Modal, Button, Input, message, Form, Row, Col, Select, TreeSelect } from 'antd';
import OperateCol from '@/pages/Component/Form/OperateCol';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
// import {
//   deleteLineStoreAddressById,
//   findLineByNameLike,
//   addToNewLine,
// } from '@/services/quick/Quick';
import {
  deleteLineStoreAddressById,
  findLineByNameLike,
  addToNewLine,} from '@/services/sjtms/LineSystemHis'
import { commonLocale } from '@/utils/CommonLocale';
import TableTransfer from './TableTransfer';
import { disable } from '@/services/account/Company';
import {
  SimpleTreeSelect,
  SimpleSelect,
  SimpleRadio,
  SimpleAutoComplete,
} from '@/pages/Component/RapidDevelopment/CommonComponent';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class LineShipAddresshis extends QuickFormSearchPage {
  state = {
    ...this.state,
    isNotHd: true,
   }
  constructor(props) {
    super(props);
  }
  exSearchFilter = () => {
    return [
      {
        field: 'LINEUUID',
        type: 'VarChar',
        rule: 'eq',
        val: this.props.lineuuid,
      },
    ];
  };
}




 




 

  

