import { Component } from "react";
import { Tooltip } from 'antd';
import styles from './IToolTip.less';
import { guid } from '@/utils/utils';
import ReactDOM from 'react-dom';

export default class IToolTip extends Component {

    state = {
        comId: guid(),
        width: undefined,
        noWidth: false
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            width: undefined
        });
    }

    onMouseEnter = () => {
        const spanEl = document.getElementById(this.state.comId);
        let clientWidth = spanEl.clientWidth;
        let scrollWidth = spanEl.scrollWidth;
        if (clientWidth < scrollWidth) {
            var html = { __html: spanEl.innerHTML };
            ReactDOM.render(
                <Tooltip title={spanEl.innerText}><span dangerouslySetInnerHTML={html}></span></Tooltip>,
                spanEl
            );
        }
    }

    render() {
        const newStyle = this.props.style ? { ...this.props.style } : {};
        if (this.state.width) {
            newStyle.width = this.state.width;
        }
        if (this.state.noWidth) {
            newStyle.width = undefined;
        }

        return <span style={newStyle} id={this.state.comId} className={styles.title} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
            {this.props.children}
        </span>
    }

    componentDidMount() {
        const style = this.props.style;
        const spanEl = document.getElementById(this.state.comId);
        if (style && style.width) {
            let clientWidth = spanEl.clientWidth;
            let scrollWidth = spanEl.scrollWidth;
            if (clientWidth >= scrollWidth) {
                this.setState({ noWidth: true });
            }
            return;
        }
        const width = this.state.width;
        if (width) {
            return;
        }


        const newWidth = spanEl.parentElement.clientWidth - 20;
        this.setState({
            width: newWidth + "px"
        });
    }

    componentDidUpdate() {
        const style = this.props.style;
        const spanEl = document.getElementById(this.state.comId);
        if (style && style.width) {
            let clientWidth = spanEl.clientWidth;
            let scrollWidth = spanEl.scrollWidth;
            if (clientWidth >= scrollWidth && !this.state.noWidth) {
                this.setState({ noWidth: true });
            }
            if (parseFloat(style.width) < scrollWidth && this.state.noWidth) {
                this.setState({ noWidth: false });
            }
            return;
        }
        const width = this.state.width;
        if (width) {
            return;
        }
        const newWidth = spanEl.parentElement.clientWidth - 20;
        this.setState({
            width: newWidth + "px"
        });
    }
}