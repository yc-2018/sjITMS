import { Form, Input, Select, DatePicker } from 'antd';
import { connect } from 'dva';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import StoreSelect from './StoreSelect';
import WaveSelect from '@/pages/Component/Select/WaveSelect';
import { loginCompany,loginOrg } from '@/utils/LoginContext';
import { selfTackShipLocale } from './SelfTackShipLocale';
import { STATE } from '@/utils/constants';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { PRETYPE } from '@/utils/constants';
import {orgType} from '@/utils/OrgType';
const Option = Select.Option;

@connect(({ selfTackShip, loading }) => ({
  selfTackShip,
  loading: loading.models.selfTackShip,
}))
@Form.create()
export default class SelfTackShipSearchForm extends SearchForm {
  constructor(props) {
    super(props);
  }
  onReset = () => {
    this.props.refresh();
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }

  /**
   * 绘制列
   */
  drawCols = () => {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const { filterValue } = this.props;
    let cols = [];
    cols.push(
      <SFormItem key="billNumber" label={selfTackShipLocale.waveBillNumber}>
        {
          getFieldDecorator('billNumber', {
            initialValue: filterValue.billNumber ? filterValue.billNumber : undefined
          })(
            <WaveSelect
              placeholder={placeholderChooseLocale(selfTackShipLocale.waveBillNumber)}
              showSearch={true}
            />)
        }
      </SFormItem>
    );
    cols.push(
      <SFormItem key="codeName" label={commonLocale.inStoreLocale}>
        {
          getFieldDecorator('codeName', {
            initialValue: filterValue.codeName ? JSON.parse(filterValue.codeName) : undefined
          })(
            <StoreSelect
              placeholder={placeholderChooseLocale(commonLocale.inStoreLocale)}
              showSearch={true}
            />)
        }
      </SFormItem>
    );
    return cols;
  }
}
