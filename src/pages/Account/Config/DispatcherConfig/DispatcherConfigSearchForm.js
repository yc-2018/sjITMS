import SearchForm from '@/pages/Component/Form/SearchForm';
import { Form, Input, Select, Col } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { dispatcherConfigLocale } from './DispatcherConfigLocale';

const FormItem = Form.Item;

@Form.create()
export default class DispatcherConfigSearchForm extends SearchForm {

    onReset = () => {
        this.props.refresh();
    }

    onSearch = (data) => {
        this.props.refresh(data);
    }

    drawCols = () => {
        const { getFieldDecorator } = this.props.form;
        const { filterValue } = this.props;

        return [
            <Col key="dcCodeNameLike">
                <FormItem label={dispatcherConfigLocale.dc}>
                    {getFieldDecorator('dcCodeNameLike', {
                        initialValue: filterValue.dcCodeNameLike
                    })(
                        <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
                    )}
                </FormItem>
            </Col>,
            <Col key="dispatcherCodeNameLike">
                <FormItem label={dispatcherConfigLocale.dispatcher}>
                    {getFieldDecorator('dispatcherCodeNameLike', {
                        initialValue: filterValue.dispatcherCodeNameLike
                    })(
                        <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
                    )}
                </FormItem>
            </Col>,
        ];
    }
}
