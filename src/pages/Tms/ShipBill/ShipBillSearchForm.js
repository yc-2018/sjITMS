import { Form, Input, Select, DatePicker } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale, placeholderChooseLocale, placeholderContainedLocale } from '@/utils/CommonLocale';
import { shipBillLocale } from './ShipBillLocale';
import { State } from './ShipBillContants';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import OperateMethodSelect from '@/pages/Component/Select/OperateMethodSelect';
import UserSelect from '@/pages/Component/Select/UserSelect';
import OrgSelect from '@/pages/Component/Select/OrgSelect';

const { RangePicker } = DatePicker;
const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key=' ' value=' '>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
    stateOptions.push(<Option key={State[key].name} value={State[key].name}>{State[key].caption}</Option>);
});

@Form.create()
export default class ShipBillSearchForm extends SearchForm {
    constructor(props) {
        super(props);
        this.state = {
            toggle: false,
            showLimitDays: true,
        }
    }

    drawCols = () => {
        const { getFieldDecorator } = this.props.form;
        const { filterValue } = this.props;
        const { toggle } = this.state;

        let cols = [
            <SFormItem key="billNumberLike" label={commonLocale.billNumberLocal}>
                {getFieldDecorator('billNumberLike', {
                    initialValue: filterValue.billNumberLike
                })(
                    <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)} />
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
            <SFormItem key="shipPlanBillNumberLike" label={shipBillLocale.shipPlanBillNumber}>
                {getFieldDecorator('shipPlanBillNumberLike', {
                    initialValue: filterValue.shipPlanBillNumberLike
                })(
                    <Input placeholder={placeholderLocale(shipBillLocale.shipPlanBillNumber)} />
                )}
            </SFormItem>
        ];

        if (toggle == false)
            return cols;
        cols.push(
            <SFormItem key="plateNumber" label={shipBillLocale.plateNumber}>
                {getFieldDecorator('plateNumberLike',
                    {
                        initialValue: filterValue.plateNumberLike ? filterValue.plateNumberLike : null
                    }
                )(
                    <Input placeholder={placeholderLocale(shipBillLocale.plateNumber)} />
                )}
            </SFormItem>
        );

        cols.push(
            <SFormItem key="operateMethodEquals" label={commonLocale.operateMethodLocale}>
                {
                    getFieldDecorator('operateMethodEquals', {
                        initialValue: filterValue.operateMethodEquals ? filterValue.operateMethodEquals : '',
                    })(
                        <OperateMethodSelect hasAll placeholder={placeholderChooseLocale(commonLocale.operateMethodLocale)} />)
                }
            </SFormItem>
        );

      cols.push(
        <SFormItem key="ownerEquals" label={commonLocale.inOwnerLocale}>
          {
            getFieldDecorator('ownerEquals', {
              initialValue: filterValue.ownerEquals ? filterValue.ownerEquals : ''
            })(
              <OwnerSelect hasAll placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} />)
          }
        </SFormItem>
      );

        cols.push(
            <SFormItem key="driverUuidEquals" label={shipBillLocale.driver}>
                {
                    getFieldDecorator('driverEquals', {
                        initialValue: filterValue.driverEquals ? filterValue.driverEquals : undefined
                    })(
                        <UserSelect autoFocus single={true} placeholder={placeholderChooseLocale(shipBillLocale.driver)} />)
                }
            </SFormItem>
        );



      cols.push(
        <SFormItem key="storeCode" label={shipBillLocale.store}>
          {
            getFieldDecorator('storeCodeContains', {
              initialValue: filterValue.storeCodeContains
            })(
              <OrgSelect
                placeholder={placeholderLocale(
                  shipBillLocale.store
                )}
                type={'STORE'}
                single
              />)
          }
        </SFormItem>
      );


        cols.push(
            <SFormItem key="containerContains" label={commonLocale.inContainerBarcodeLocale}>
                {getFieldDecorator('containerContains', {
                    initialValue: filterValue.containerContains
                })(
                    <Input placeholder={placeholderContainedLocale(commonLocale.inContainerBarcodeLocale)} />
                )}
            </SFormItem>
        );

        cols.push(
            <SFormItem key="article" label={commonLocale.inArticleLocale}>
                {getFieldDecorator('articleCodeContains', {
                    initialValue: filterValue.articleCodeContains
                })(
                    <Input placeholder={placeholderContainedLocale(commonLocale.inArticleLocale)} />
                )}
            </SFormItem>
        );
        cols.push(
            <SFormItem key="downloadDate" label={commonLocale.inDownloadDateLocale}>
                {getFieldDecorator('downloadDate', {
                })(
                    <RangePicker style={{ width: '100%' }} />
                )}
            </SFormItem>
        );

        return cols;
    }
}
