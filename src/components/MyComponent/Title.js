import { Component } from 'react';
import styles from './Title.less';

export default class Title extends Component {
	render() {
		return (
           <div className={styles.title}> {this.props.title} </div>
			);
	}
}