import { Form, Input, Select,DatePicker } from 'antd';
import { connect } from 'dva';
import { loginCompany } from '@/utils/LoginContext';
import { commonLocale,placeholderLocale } from '@/utils/CommonLocale';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { collectBinLocale } from './CollectBinLocale';
import { CollectBinMgrType } from './CollectBinContants';

const Option = Select.Option;

const mgrTypeOptions = [];
mgrTypeOptions.push(<Option key='' value=''>{commonLocale.allLocale}</Option>)
Object.keys(CollectBinMgrType).forEach(function (key) {
  mgrTypeOptions.push(<Option value={CollectBinMgrType[key].name} key={CollectBinMgrType[key].name} >{CollectBinMgrType[key].caption}</Option>);
});

@connect(({ collectBinScheme,loading }) => ({
  collectBinScheme,
  loading: loading.models.collectBinScheme,
}))
@Form.create()
export default class CollectBinSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {}
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
    const { form, filterValue } = this.props;
    const { getFieldDecorator } = form;
    const { toggle,typeNames } = this.state;
    let cols = [];

    cols.push(
      <SFormItem key="codeName" label={commonLocale.codeAndNameLocale}>
        {getFieldDecorator('codeName', {
            initialValue: filterValue ? filterValue.codeName : ''
        })(
            <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)}/>
        )}
      </SFormItem>
    );

    cols.push(
      <SFormItem key="mgrType" label={collectBinLocale.mgrType}>
        {getFieldDecorator('mgrType',
          { initialValue: filterValue.mgrType?filterValue.mgrType:'' }
        )(
          <Select initialValue=''>
            {mgrTypeOptions}
          </Select>
          )
        }
      </SFormItem>
    );
    return cols;
  }
}