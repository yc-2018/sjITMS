import SearchForm from '@/pages/Component/Form/SearchForm';
import { Form, Input, Select, Col } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { formatMessage } from 'umi/locale';
import { returnDistributionTypeConfigLocal } from './ReturnDistributionTypeConfigLocal';

const FormItem = Form.Item;

@Form.create()
export default class ReturnDistributionTypeConfigSearchForm extends SearchForm {

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
            <Col key="name">
                <FormItem label={returnDistributionTypeConfigLocal.name}>
                    {getFieldDecorator('name', {

                    })(
                        <Input placeholder={formatMessage({ id: 'form.weight.placeholder' })} />
                    )}
                </FormItem>
            </Col>
        ];
    }
}
