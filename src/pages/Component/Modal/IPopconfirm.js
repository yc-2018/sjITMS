import { PureComponent } from "react";
import { Popconfirm } from 'antd';
import { confirmLocale, cancelLocale } from '@/utils/CommonLocale';

export default class IPopconfirm extends PureComponent {
    render() {
        return (
            <Popconfirm {...this.props}
                title={this.props.title ? this.props.title : '确认' + this.props.operate + '该' + this.props.object + '吗?'}
                okText={confirmLocale}
                cancelText={cancelLocale}>
                {this.props.children}
            </Popconfirm>
        );
    }
}