import { Form, Input, Select, DatePicker } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale, placeholderChooseLocale, notNullLocale } from '@/utils/CommonLocale';
import DockGroupSelect from '@/pages/Component/Select/DockGroupSelect';
import SerialArchLineSelect from '@/pages/Component/Select/SerialArchLineSelect';
import { collectBinBatchReviewLocale } from './CollectBinBatchReviewLocale';
import WaveBillSelect from './WaveBillSelect';
import { WaveBillState} from '@/pages/Out/Wave/WaveBillContants';

const { RangePicker } = DatePicker;
const Option = Select.Option;

@Form.create()
export default class CollectBinBatchReviewSearchForm extends SearchForm {
    constructor(props) {
        super(props);
        this.state = {
            // toggle: false,
        }
    }

    onReset = () => {
        this.props.refresh();
    }

    onSearch = (data) => {
        this.props.refresh(data);
    }
    /**
     * 绘制列
     */
    drawCols = () => {
        const { form, filterValue } = this.props;
        const { getFieldDecorator } = form;

        let cols = [];
        cols.push(
            <SFormItem key="waveBillNumber" label={'波次'+commonLocale.billNumberLocal}>
                {getFieldDecorator('waveBillNumber', {
                    initialValue: filterValue ? filterValue.waveBillNumber : '',
                    rules: [{ required: true, message: notNullLocale('波次'+commonLocale.billNumberLocal) }],
                })(
                    <WaveBillSelect states={[WaveBillState.INPROGRESS.name,WaveBillState.FINISHED.name]}/>
                )}
            </SFormItem>
        );

        // cols.push(
        //     <SFormItem key="dockGroup" label={collectBinBatchReviewLocale.dockGroup}>
        //       {getFieldDecorator('dockGroup', {
        //         initialValue: filterValue.dockGroup?filterValue.dockGroup:' '
        //       })(
        //         <DockGroupSelect  hasAll placeholder={placeholderChooseLocale(collectBinBatchReviewLocale.dockGroup)} style={{ width: '120%' }} />
        //       )}
        //     </SFormItem>
        //   );

          cols.push(
            <SFormItem key="serialArchLine" label={collectBinBatchReviewLocale.serialArchLine}>
                {getFieldDecorator('serialArchLine', {
                    initialValue: filterValue.serialArchLine ? filterValue.serialArchLine : ''
                })(
                    <SerialArchLineSelect hasAll />
                )}
            </SFormItem>,
        );

        return cols;    
    }
}