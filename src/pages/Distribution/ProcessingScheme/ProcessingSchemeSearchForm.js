import { Form, Input, Select } from 'antd';
import { connect } from 'dva';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import BasicStateSelect from '@/pages/Component/Select/BasicStateSelect';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { processingSchemeLocal } from './ProcessingSchemeLocal';
import {PRETYPE} from '@/utils/constants';
@connect(({ processingScheme,loading }) => ({
  processingScheme,
  loading: loading.models.processingScheme,
}))
@Form.create()
export default class ProcessingSchemeSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      toggle: false,
    }
  }

  onReset = () => {
    this.props.refresh();
  }

  onSearch = (data) => {
    data.owner = data.owner ? JSON.parse(data.owner) : undefined;
    data.ownerUuid = data.owner ? data.owner.uuid : undefined;
    this.props.refresh(data);
  }

  /**
   * 绘制列
   */
  drawCols = () => {
    const { form, filterValue } = this.props;
    const { getFieldDecorator } = form;
    const { toggle,} = this.state;
    let cols = [];
    cols.push(
      <SFormItem key="codeName" label={commonLocale.codeAndNameLocale} labelSpan={'7'}>
        {getFieldDecorator('codeName', {
          initialValue: filterValue ? filterValue.codeName : ''
        })(
          <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)}/>
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="state" label={commonLocale.stateLocale}>
        {getFieldDecorator('state',
          { initialValue: filterValue.state }
        )(
          <BasicStateSelect />)
        }
      </SFormItem>
    );
    cols.push(
      <SFormItem key="ownerUuid" label={commonLocale.inOwnerLocale}>
        {
          getFieldDecorator('owner', {
            initialValue: filterValue.owner ? JSON.stringify(filterValue.owner) : '',
          })(
            <OwnerSelect onlyOnline />)
        }
      </SFormItem>
    );
    if (toggle) {
      cols.push(
        <SFormItem key="rawArticleCodes" label={processingSchemeLocal.rawArticleCodes} labelSpan={'7'}>
          {getFieldDecorator('rawArticleCodes',
            { initialValue: filterValue.rawArticleCodes ? filterValue.rawArticleCodes : '' })(
            <Input placeholder={placeholderLocale(processingSchemeLocal.rawArticleCodes)}/>
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="endproductArticleCodes" label={processingSchemeLocal.endproductArticleCodes} labelSpan={'7'}>
          {
            getFieldDecorator('endproductArticleCodes',
              { initialValue: filterValue.endproductArticleCodes ? filterValue.endproductArticleCodes : '' })(
              <Input placeholder={placeholderLocale(processingSchemeLocal.endproductArticleCodes)}/>)
          }
        </SFormItem>
      );
    }
    return cols;
  }
}
