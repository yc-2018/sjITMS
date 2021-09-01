import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select } from 'antd';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { State, ReturnType } from './StoreRtnBillContants';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { storeRtnLocal } from './StoreRtnBillLocale';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import VendorSelect from './VendorSelect';
import { PRETYPE } from '@/utils/constants';
import { orgType } from '@/utils/OrgType';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';

const Option = Select.Option;
const stateOptions = [];
stateOptions.push(<Option key='stateAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
    stateOptions.push(<Option value={State[key].name} key={State[key].name}>{State[key].caption}</Option>);
});
const returnTypeOptions = [];
returnTypeOptions.push(<Option key='stateAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(ReturnType).forEach(function (key){
    returnTypeOptions.push(<Option value={ReturnType[key].name}
        key={ReturnType[key].name}>
            {ReturnType[key].caption}
        </Option>)
});
@Form.create()
export default class StoreRtnBillSearchForm extends SearchForm {
    constructor(props) {
        super(props);
        this.state = {
            toggle: false,
            showLimitDays: true,
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
        const { getFieldDecorator } = this.props.form;
        const { filterValue } = this.props;
        const { toggle } = this.state;
        let cols = [];
        cols.push(
            <SFormItem key="billNumber" label={commonLocale.billNumberLocal}>
                {getFieldDecorator('billNumber', {
                    initialValue: filterValue.billNumber
                })(
                    <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)} />
                )}
            </SFormItem>
        );
        cols.push(
            <SFormItem key="state" label={commonLocale.stateLocale}>
                {getFieldDecorator('state',
                    { initialValue: filterValue.state ? filterValue.state : '' })(
                        <Select>{stateOptions}</Select>)}
            </SFormItem>
        );
        cols.push(
            <SFormItem key="rtnNtcBillNumber" label={storeRtnLocal.rtnNtcBillNumber}>
                {getFieldDecorator('rtnNtcBillNumber',
                    { initialValue: filterValue.rtnNtcBillNumber })(
                        <Input placeholder={placeholderLocale(storeRtnLocal.rtnNtcBillNumber)} />
                    )}
            </SFormItem>
        );
        cols.push(
            <SFormItem key="returnType" label={"单据类型"}>
                {getFieldDecorator('returnType',
                    { initialValue: filterValue.returnType ? filterValue.returnType : '' })(
                        <Select>{returnTypeOptions}</Select>)}
            </SFormItem>
        );
        if (toggle) {
          cols.push(
            <SFormItem key="owner" label={commonLocale.inOwnerLocale}>
              {
                getFieldDecorator('owner', {
                  initialValue: filterValue.owner ? filterValue.owner : '',
                })(
                  <OwnerSelect onlyOnline />)
              }
            </SFormItem>
          );
            cols.push(
                <SFormItem key="vendor" label={commonLocale.inVendorLocale}>
                    {getFieldDecorator('vendor',
                        { initialValue: filterValue.vendor }
                    )(
                      <VendorSelect
                        ownerUuid={''}
                        single
                        placeholder={placeholderLocale(commonLocale.inVendorLocale)}
                      />)}
                </SFormItem>
            );
            cols.push(
                loginOrg().type === orgType.dc.name ?
                    <SFormItem key="store" label={commonLocale.inStoreLocale}>
                        {getFieldDecorator('store',
                            { initialValue: filterValue.store }
                        )(
                            <OrgSelect
                                placeholder={placeholderLocale(commonLocale.inStoreLocale)}
                                upperUuid={loginCompany().uuid}
                                type={'STORE'}
                                single
                            />)}
                    </SFormItem> : <SFormItem key="dc" label={commonLocale.inDCLocale}>
                        {getFieldDecorator('dc',
                            { initialValue: filterValue.dc }
                        )(
                            <OrgSelect
                                placeholder={placeholderLocale(commonLocale.inDCLocale)}
                                upperUuid={loginCompany().uuid}
                                type={'DC'}
                                single
                            />)}
                    </SFormItem>
            );
            cols.push(
                <SFormItem key="articleCode" label={commonLocale.articleLocale}>
                    {getFieldDecorator('articleCode', {
                        initialValue: filterValue.articleCode
                    })(
                        <Input placeholder={placeholderLocale(commonLocale.articleLocale)} />
                    )}
                </SFormItem>
            );
            if(loginOrg().type === orgType.dc.name){
                cols.push(
                    <SFormItem key="containerBarcode" label={commonLocale.inContainerBarcodeLocale}>
                        {getFieldDecorator('containerBarcode',
                            { initialValue: filterValue.containerBarcode })(
                                <Input placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)} />
                            )}
                    </SFormItem>
                );
            }
        }
        return cols;
    }
}
