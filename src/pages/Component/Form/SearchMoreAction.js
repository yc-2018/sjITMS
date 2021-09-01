import { PureComponent } from "react";
import { Dropdown, Menu, Icon } from 'antd';

export default class SearchMoreAction extends PureComponent {

    drawMenuItem = () => {
        const { menus } = this.props;
        const menuItems = [];
        Array.isArray(menus) && menus.forEach(m => {
            menuItems.push(
                <Menu.Item key={m.name} disabled={m.disabled}>
                    <span style={m.disabled ? { color: '#AAB6BE' } : null}>{m.name}</span>
                </Menu.Item>
            );
        });
        return (
            <Menu onClick={this.onClick}>
                {menuItems}
            </Menu>
        );
    }

    onClick = (i) => {
        const { menus } = this.props;
        menus.forEach(m => {
            if (m.name === i.key) {
                m.onClick();
            }
         });
    }

    render() {


        return (
            <Dropdown overlay={this.drawMenuItem()}>
                <Icon style={{color: '#848C96', 'paddingLeft': '8px', 'fontSize': '22px', 'verticalAlign': 'middle'}} type="more" />
            </Dropdown>
        );
    }
}
