import { PureComponent } from 'react';
import { connect } from 'dva';
import NoticeList from './NoticeList';
import NoticeCreate from './NoticeCreate';
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';
import { noticeLocale } from './NoticeLocale';
@connect(({ notice, loading }) => ({
	notice,
	loading: loading.models.notice,
}))
export default class Notice extends PureComponent {
	onBackFromPreType = () => {
		this.props.dispatch({
			type: 'notice/onShowPage',
			payload: {
				showPage: 'query'
			}
		});
	}

	render() {
		if (this.props.notice.showPage === 'query') {
			return <NoticeList />;
		} else if (this.props.notice.showPage === 'create') {
			return <NoticeCreate />
		} else if (this.props.notice.showPage === 'noticeType') {
			return <PreType
				preType={PRETYPE['notice']}
				title={noticeLocale.title + noticeLocale.type}
				backToBefore={this.onBackFromPreType} />
		}
	}
}