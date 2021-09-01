import { Form, Input, Select,Col } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { formatMessage } from 'umi/locale';
import { decincConfigLocale } from '../Decinc/DecincConfigLocale';
import { commonLocale, placeholderLocale, placeholderChooseLocale} from '@/utils/CommonLocale';
import BinUsageSelect from '@/pages/Component/Select/BinUsageSelect';
import { vendorCollectBinConfigLocale } from '@/pages/Facility/Config/VendorCollectBinConfig/VendorCollectBinConfigLocale';
import ConfigSearchForm from '@/pages/Component/Form/ConfigSearchForm';

const FormItem = Form.Item;

@Form.create()
export default class CloseConfigSearchForm extends ConfigSearchForm {
    constructor(props) {
        super(props);
    }

    drawCols = () => {
        const { getFieldDecorator } = this.props.form;
        const { filterValue } = this.props;
        const Option = Select.Option;

         return [
           <SFormItem label={commonLocale.inBinUsageLocale}>
             {getFieldDecorator('binUsage', {
                initialValue: filterValue.binUsage ? filterValue.binUsage :'',
              })(
               <BinUsageSelect hasAll/>
             )}
           </SFormItem>
      ];

        return cols;
    }
}
