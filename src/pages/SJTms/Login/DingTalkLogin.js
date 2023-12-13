import React, { PureComponent } from "react";
import { connect } from 'dva';
import { getDingUserId } from '@/services/account/Login';

@connect(({ login }) => ({ login }))
export default class DingTalkLogin extends PureComponent {

    componentDidMount() {
        this.login();
    }
    login = async () => {
        const { query } = this.props.history.location;
        const authCode = query?.authCode;
        const response = await getDingUserId({authCode});
        if (response.success) {
            const loginAccount = response.data;
            await this.props.dispatch({ type: 'login/dingLogin1', payload: { loginAccount } });
        }
    }

    render() {
        return (
            <div style={{ fontSize: "28px", marginTop: "15rem", width: "100%", textAlign: "center" }}>
                正在登录...
            </div>
        )
    };
}