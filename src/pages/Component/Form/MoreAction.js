import { PureComponent } from "react";
import { Dropdown, Menu, Icon } from 'antd';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';

export default class MoreAction extends PureComponent {

    drawMenuItem = () => {
        const { menus, onClick } = this.props;
        const menuItems = [];
        Array.isArray(menus) && menus.forEach(m => {

            menuItems.push(
                <Menu.Item key={m.name} disabled={m.disabled}>
                    {
                        m.confirm &&
                        <IPopconfirm onConfirm={m.onClick} operate={m.name} object={m.confirmCaption}>
                            <a disabled={m.disabled} style={m.disabled?{color:'#AAB6BE'}:null}>
                                {m.name}
                            </a>
                        </IPopconfirm>
                    }
                    {
                        !m.confirm && <a disabled={m.disabled} onClick={m.onClick} style={m.disabled?{color:'#AAB6BE'}:null}>{m.name}</a>
                    }
                </Menu.Item>
            );
        });
        return (
            <Menu>
                {menuItems}
            </Menu>
        );
    }

    render() {
        const { menus } = this.props;

        return (
            <Dropdown overlay={this.drawMenuItem()}>
                <Icon type="more" />
            </Dropdown>
        );
    }
}