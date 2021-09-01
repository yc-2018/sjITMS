import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany } from '@/utils/LoginContext';

/**
* 商品类别下拉框
*
* 支持单选和多选，传入属性single，表示单选，得到的值为类别uuid，可通过categoryChange事件获取category的ucn对象
* 不传single属性时为多选模式，获取的值为类别uuid的数组，不支持获取ucn对象
* hasAll：包含全部选项，可用于搜索条件;全部选项值为''，只用于single模式
* 
*/
@connect(({ category }) => ({
    category
}))
export default class CategorySelect extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            single: props.single,
            options: [],
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
        if (this.props.hasAll && this.props.single) {
            options.push(<Select.Option key="all" value='' > 全部 </Select.Option>);
        }
        this.props.category.data.list.forEach(function (category) {
            options.push(
                <Select.Option key={category.uuid} value={category.uuid}> {'[' + category.code + ']' + category.name} </Select.Option>
            );
        });
        return options;
    }

    onSearch = (value) => {
        this.props.dispatch({
            type: 'category/query',
            payload: {
                page: 0,
                pageSize: 20,
                searchKeyValues: {
                    companyUuid: loginCompany().uuid,
                    state: this.props.onlyOnline ? 'ONLINE' : ''
                },
                likeKeyValues: {
                    codeName: value
                },
                sortFields: {
                    code: false
                }
            }
        });
    }

    onChange = (selectValue) => {
        this.setState({
            value: selectValue,
        });

        // 用于form表单获取控件值
        if (this.props.onChange)
            this.props.onChange(selectValue);

        if (this.props.single && this.props.categoryChange) {
            this.props.category.data.list.forEach(function (category) {
                if (category.uuid === selectValue) {
                    this.props.categoryChange({
                        uuid: category.uuid,
                        code: category.code,
                        name: category.name
                    });
                }
            });
        }
    }

    render() {
        const { single } = this.state;
        const selectProps = {
            value: this.state.value,
            showSearch: true,
            mode: this.state.single ? '' : 'tags',
            onChange: this.onChange,
            onSearch: this.onSearch
        };
        return (
            <Select {...selectProps} placeholder={this.props.placeholder}>
                {this.buildOptions()}
            </Select>
        );
    }
}