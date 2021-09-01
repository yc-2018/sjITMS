import { Form, Input, Select, DatePicker } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale, placeholderChooseLocale, placeholderContainedLocale } from '@/utils/CommonLocale';
import { moveBillLocale } from './MoveBillLocale';
import { State } from './MoveBillContants';
import UserSelect from '@/pages/Component/Select/UserSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import PreTypeSelect from './PreTypeSelect';
import { PRETYPE } from '@/utils/constants';
import { loginOrg } from '@/utils/LoginContext';
const { RangePicker } = DatePicker;
const Option = Select.Option;
const stateOptions = [];
stateOptions.push(<Option key=' ' value=' '>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
  stateOptions.push(<Option key={State[key].name} value={State[key].name}>{State[key].caption}</Option>);
});
@Form.create()
export default class ContainerMergerBillSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      toggle: false,
      showLimitDays: true,
    }
  }
  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue, filterLikeValue } = this.props;
    const { toggle } = this.state;
    let cols = [
      <SFormItem key="billNumberLike" label={commonLocale.billNumberLocal}>
        {getFieldDecorator('billNumberLike', {
          initialValue: filterLikeValue.billNumberLike
        })(
          <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)} />
        )}
      </SFormItem>,
      <SFormItem key="sourceBillNumber" label={'来源单号'}>
        {getFieldDecorator('sourceBillNumber', {
          initialValue: filterLikeValue.sourceBillNumber
        })(
          <Input placeholder={placeholderLocale('来源单号')} />
        )}
      </SFormItem>,
      <SFormItem key="state" label={commonLocale.stateLocale}>
        {getFieldDecorator('stateEquals',
          {
            initialValue: filterValue.stateEquals ? filterValue.stateEquals : ' '
          }
        )(
          <Select initialValue=' '>
            {stateOptions}
          </Select>
        )
        }
      </SFormItem>,

    ];
    if (toggle == false)
      return cols;
    cols.push(
      <SFormItem key="mover" label={moveBillLocale.mover}>
        {getFieldDecorator('mover', {
          initialValue: filterValue.mover
        })(
          <UserSelect placeholder={placeholderChooseLocale(moveBillLocale.mover)} single={true} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="fromWrh" label={moveBillLocale.fromWrh}>
        {getFieldDecorator('fromWrh', {
          initialValue: filterValue.fromWrh
        })(
          <WrhSelect placeholder={placeholderChooseLocale(moveBillLocale.fromWrh)} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="toWrh" label={moveBillLocale.toWrh}>
        {getFieldDecorator('toWrh', {
          initialValue: filterValue.toWrh
        })(
          <WrhSelect placeholder={placeholderChooseLocale(moveBillLocale.toWrh)} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="fromBin" label={moveBillLocale.fromBin}>
        {getFieldDecorator('fromBinContain', {
          initialValue: filterLikeValue.fromBinContain
        })(
          <Input placeholder={placeholderContainedLocale(moveBillLocale.fromBin)} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="toBin" label={moveBillLocale.toBin}>
        {getFieldDecorator('toBinContain', {
          initialValue: filterLikeValue.toBinContain
        })(
          <Input placeholder={placeholderContainedLocale(moveBillLocale.toBin)} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="fromContainer" label={moveBillLocale.fromContainer}>
        {getFieldDecorator('fromContainerContain', {
          initialValue: filterLikeValue.fromContainerContain
        })(
          <Input placeholder={placeholderContainedLocale(moveBillLocale.fromContainer)} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="toContainer" label={moveBillLocale.toContainer}>
        {getFieldDecorator('toContainerContain', {
          initialValue: filterLikeValue.toContainerContain
        })(
          <Input placeholder={placeholderContainedLocale(moveBillLocale.toContainer)} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="article" label={moveBillLocale.article}>
        {getFieldDecorator('articleCodeContain', {
          initialValue: filterLikeValue.articleCodeContain
        })(
          <Input placeholder={placeholderContainedLocale(moveBillLocale.article)} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="type" label={'移库类型'}>
        {getFieldDecorator('type', {
          initialValue: filterLikeValue.type
        })(
          <PreTypeSelect
            hasAll
            hasRtnWrh
            preType={PRETYPE.moveType}
            orgUuid={loginOrg().uuid}
          />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="uploadDate" label={commonLocale.inUploadDateLocale}>
        {getFieldDecorator('uploadDate', {
        })(
          <RangePicker style={{ width: '100%' }} />
        )}
      </SFormItem>
    );
    return cols;
  }
}
