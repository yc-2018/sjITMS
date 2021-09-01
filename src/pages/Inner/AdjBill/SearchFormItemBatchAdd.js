import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { convertCodeName, convertArticleDocField } from '@/utils/utils';
import { Form, Input, Select } from 'antd';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import BinUsageSelect from '../../Component/Select/BinUsageSelect';
import { Type } from './AdjBillContants';

@Form.create()
export default class SearchFormItemBatchAdd extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {

    }
  }
  onReset = () => {
    this.props.form.resetFields();
    this.props.refresh();
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }

  drawCols = () => {
    const articleOptions = [];
    const vendorOptions = [];
    const wrhOptions = [];
    const { items, vendor, type, wrh, fieldsValue } = this.props
    if (vendor != undefined) {
      vendorOptions.push(
        <Select.Option value={JSON.stringify(vendor)} key={vendor.uuid}>
          {convertCodeName(vendor)}
        </Select.Option>
      );
    }
    if (wrh != undefined) {
      wrhOptions.push(
        <Select.Option value={JSON.stringify(wrh)} key={wrh.uuid}>
          {convertCodeName(wrh)}
        </Select.Option>
      );
    }
    if (items != undefined) {
      items.map(item => {
        if (item.article != undefined) {
          if (type == Type['RECEIVE'].name) {
            articleOptions.push(
              <Select.Option value={item.article.code} key={item.article.uuid}>
                {convertCodeName(item.article)}
              </Select.Option>
            );
          } else if (type == Type['STORE_RTN'].name) {
            articleOptions.push(
              <Select.Option value={item.article.articleCode} key={item.article.articleUuid}>
                {convertArticleDocField(item.article)}
              </Select.Option>
            );
          }

        }
      })
    }
    const { getFieldDecorator } = this.props.form;
    const { toggle } = this.state;
    let cols = [
      <SFormItem key="wrh" label={'仓位'}>
        {getFieldDecorator('wrh', {
          // initialValue: fieldsValue.wrh
        })(
          <Select placeholder={placeholderChooseLocale('仓位')}>
            {wrhOptions}
          </Select>
        )}
      </SFormItem>,
      <SFormItem key="binUsage" label={'货位用途'}>
        {getFieldDecorator('binUsage', { initialValue: fieldsValue.binUsage })(
          <BinUsageSelect
            onChange={this.onChange
            }
            placeholder={placeholderLocale('货位用途')} />
        )}
      </SFormItem>,
    ];
    if (type == Type['VENDOR_RTN'].name) {
      cols.push(
        <SFormItem key="vendor" label={'供应商'}>
          {getFieldDecorator('vendor', {
            initialValue: fieldsValue.vendor
          })(
            <Select placeholder={placeholderChooseLocale('供应商')}>
              {vendorOptions}
            </Select>
          )}
        </SFormItem>
      );
    } else {
      cols.push(
        <SFormItem key="articleCodeName" label={'商品'}>
          {getFieldDecorator('articleCodeName')
            (
              <Select placeholder={placeholderChooseLocale('商品')}>
                {articleOptions}
              </Select>
            )}
        </SFormItem>
      );
    }
    return cols;
  }
}
