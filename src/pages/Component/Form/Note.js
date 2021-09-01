import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import { Input } from 'antd';

export default class Note extends PureComponent {
    state = {
        value: this.props.value
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value
        });
    }

    onChange = (e) => {
        this.setState({
            value: e.target.value
        });
        if (this.props.onChange)
            this.props.onChange(e.target.value);
    }

    render() {
        return (
            <Input.TextArea value={this.state.value} onChange={this.onChange} rows={4} placeholder='请输入备注' />
        );
    }
}