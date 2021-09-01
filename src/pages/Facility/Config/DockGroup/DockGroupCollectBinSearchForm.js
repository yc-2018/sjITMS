import { Form, Input } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import ConfigSearchForm from '@/pages/Component/Form/ConfigSearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import React from 'react';
import { dockGroupConfigLocale } from '@/pages/Facility/Config/DockGroup/DockGroupConfigLocale';

@Form.create()
export default class DockGroupCollectBinSearchForm extends ConfigSearchForm {

  onReset = () => {
    this.props.reset();
  };

  onSearch = (data) => {
    this.props.refresh(data);
  };

  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue } = this.props;

    return [
      <SFormItem label={dockGroupConfigLocale.dockGroup}>
        {getFieldDecorator('codeNameLike', {
          initialValue: filterValue.codeNameLike,
        })(
          <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)}/>,
        )}
      </SFormItem>,
    ];
  };
}
