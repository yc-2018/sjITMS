import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select } from 'antd';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { State } from './StoreRtnNtcBillContants';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { storeRtnNtcLocal } from './StoreRtnNtcBillLocale';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { PRETYPE } from '@/utils/constants';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import { orgType } from '@/utils/OrgType';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';

const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key='stateAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
    stateOptions.push(<Option value={State[key].name} key={State[key].name}>{State[key].caption}</Option>);
});
@Form.create()
export default class StoreRtnNtcBillSearchForm extends SearchForm {
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
            <SFormItem key="billNumberAndSource" label={commonLocale.billNumberLocal}>
                {getFieldDecorator('billNumberAndSource', {
                    initialValue: filterValue.billNumberAndSource
                })(
                    <Input placeholder={placeholderLocale(commonLocale.billNumberLocal + '/' + storeRtnNtcLocal.sourceBillNumber)} />
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
        <SFormItem key="owner" label={commonLocale.inOwnerLocale}>
          {
            getFieldDecorator('owner', {
              initialValue: filterValue.owner ? filterValue.owner : '',
            })(
              <OwnerSelect onlyOnline />)
          }
        </SFormItem>
      );

        if (toggle) {
            cols.push(
                <SFormItem key="vendorCode" label={commonLocale.inVendorLocale}>
                    {getFieldDecorator('vendorCode',
                        { initialValue: filterValue.vendorCode }
                    )(
                        <Input placeholder={placeholderLocale(commonLocale.inVendorLocale)} />
                    )
                    }
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
            cols.push(
                loginOrg().type === orgType.dc.name ?
                    <SFormItem key="store" label={commonLocale.inStoreLocale}>
                        {getFieldDecorator('store',
                            { initialValue: filterValue.store ? filterValue.store : '' }
                        )(
                            <OrgSelect
                                placeholder={placeholderLocale(commonLocale.inStoreLocale)}
                                upperUuid={loginCompany().uuid}
                                type={'STORE'}
                                single
                            />)}
                    </SFormItem>
                    : <SFormItem key="dc" label={commonLocale.inDCLocale}>
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
                <SFormItem key="reason" label={storeRtnNtcLocal.reason}>
                    {getFieldDecorator('reason',
                        { initialValue: filterValue.reason }
                    )(
                        <PreTypeSelect placeholder={placeholderChooseLocale(storeRtnNtcLocal.reason)}
                            preType={PRETYPE.rtnType} />)}
                </SFormItem>
            );
        }
        return cols;
    }
}
