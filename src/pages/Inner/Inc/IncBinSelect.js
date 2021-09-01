import { PureComponent } from "react";
import { Select } from 'antd';
import { connect } from 'dva';
import { binUsage, getUsageCaption } from '@/utils/BinUsage';


@connect(({ inc }) => ({
    inc,
}))
export default class IncBinSelect extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value
        });
    }


    buildOptions = () => {
        let options = [];

        if (!this.props.wrhUuid) {
            return options;
        }

        let data = this.props.inc.bins;
        let that = this;
        Array.isArray(data) && data.forEach(function (bin) {
            if(that.props.getUsage){
                options.push(
                    <Select.Option key={bin.code} value={JSON.stringify({
                        code: bin.code,
                        usage: bin.usage
                    })}> {bin.code+'['+binUsage[bin.usage].caption+']'} </Select.Option>
                );
            }else{
                options.push(
                    <Select.Option key={bin.code} value={JSON.stringify({
                    // <Select.Option key={bin.code} lable={bin.code} value={JSON.stringify({
                        code: bin.code,
                        usage: bin.usage
                    })}> {bin.code} </Select.Option>
                );
            }
            
        });
        return options;
    }

    onSearch = (value) => {
        if (!this.props.wrhUuid) {
            return;
        }
        
        let binCode = '';
        let bin = {};
        try {
            bin = JSON.parse(value); 
        } catch (error) {
            
        }
        binCode = bin.code? bin.code : bin.binCode? bin.binCode : value;
        
        let bins = this.props.inc.bins;
        if (Array.isArray(bins)) {
            let isExist = false;
            for(let t = 0;t<bins.length;t++){
                if(bins[t].code === bin.code){
                    isExist = true;
                    break;
                }
            }
            // for (let x in bins) {
            //     if (bins[x].code === bin.code) {
            //         isExist = true;
            //         break;
            //     }
            // }
            if (isExist) {
                return;  //存在于列表中就不用再查了
            }
        }
  
        this.props.dispatch({
            type: 'inc/queryIncBins',
            payload: {
                wrhUuid: this.props.wrhUuid,
                binCode: binCode
            }
        });
    }

    // onSelect = (selectValue) => {
    onChange = (selectValue) => {
        this.setState({
            value: selectValue,
        });

        // 用于form表单获取控件值
        if (this.props.onChange)
            this.props.onChange(selectValue);
    }

    render() {
        const { single } = this.props;
        const selectProps = {
            showSearch: true,
            mode: single,
            onChange: this.onChange,
            onSearch: this.onSearch
            // mode:'combobox',// 为了保留搜索的值
            // onSelect: this.onSelect,
            // onSearch: this.onSearch,
            // optionLabelProp :'lable'
        };

        if (this.state.value) {
            selectProps.value = this.state.value;
        }

        if (this.state.value && this.props.getUsage&&this.props.value) {
            selectProps.value = JSON.parse(this.props.value).code + '[' + binUsage[JSON.parse(this.props.value).usage].caption + ']'
          }

        return (
            <Select {...selectProps} placeholder={this.props.placeholder}>
                {this.buildOptions()}
            </Select>
        );
    }
}
