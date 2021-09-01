import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import ContainerTypeSelect from '@/pages/Component/Select/ContainerTypeSelect';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { containerLocale } from './ContainerLocale';
import { containerState, getStateCaption } from '@/utils/ContainerState';


@Form.create()
export default class ContainerSearchForm extends SearchForm {
    constructor(props) {
        super(props);
        this.state = {
            toggle: false,
        }
    }

    containerStateOptions = () => {
        let options = [];
        options.push(<Select.Option key='containerStateAll' value=''>全部</Select.Option>);

        for (let state in containerState) {
            options.push(
                <Select.Option key={state} value={state}>
                    {getStateCaption(state)}
                </Select.Option>
            );
        }
        return options;
    }

  onSearch = (data) => {
    data.typeContainer = data.typeEquals;
    data.typeEquals = data.typeEquals ? JSON.parse(data.typeEquals).uuid : '';
    this.props.refresh(data);
  }

    drawCols = () => {
        const { getFieldDecorator } = this.props.form;
        const { filterValue } = this.props;
        const { toggle } = this.state;
        let cols = [
            <SFormItem key="barcodeLike" label={containerLocale.barcodeLocale}>
                {getFieldDecorator('barcodeLike', {
                    initialValue: filterValue.barcodeLike
                })(
                    <Input placeholder={placeholderLocale(containerLocale.barcodeLocale)} />
                )}
            </SFormItem>,
            <SFormItem key="stateEquals" label={commonLocale.stateLocale}>
                {getFieldDecorator('stateEquals',
                    { initialValue: filterValue.stateEquals ? filterValue.stateEquals : '' }
                )(
                    <Select {...this.props}>
                        {this.containerStateOptions()}
                    </Select>)
                }
            </SFormItem>,
            <SFormItem key="binCodeLike" label={containerLocale.positionLocale}>
                {getFieldDecorator('binCodeLike', {
                    initialValue: filterValue.binCodeLike
                })(
                    <Input placeholder={placeholderLocale(containerLocale.positionLocale)} />
                )}
            </SFormItem>
        ];

        if (toggle == false)
            return cols;

        cols.push(
            <SFormItem key="parentLike" label={containerLocale.parentBarcodeLocale}>
                {getFieldDecorator('parentLike',
                    { initialValue: filterValue.parentLike }
                )(
                    <Input placeholder={placeholderLocale(containerLocale.parentBarcodeLocale)} />)
                }
            </SFormItem>
        );

        cols.push(
            <SFormItem key="typeEquals" label={containerLocale.containerType}>
                {getFieldDecorator('typeEquals',
                    { initialValue: filterValue.typeContainer ? filterValue.typeContainer : '' }
                )(
                    <ContainerTypeSelect hasAll />)
                }
            </SFormItem>
        );

        cols.push(
            <SFormItem key="useCodeNameLike" label={containerLocale.userLocale}>
                {getFieldDecorator('useCodeNameLike',
                    { initialValue: filterValue.useCodeNameLike }
                )(
                    <Input placeholder={placeholderLocale(containerLocale.userLocale)} />)
                }
            </SFormItem>
        );
        return cols;
    }
}
