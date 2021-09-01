import { PureComponent } from 'react';
import { connect } from 'dva';
import JobSearchPage from './JobSearchPage';

@connect(({ job, loading }) => ({
  job,
  loading: loading.models.owner,
}))
export default class Job extends PureComponent {
  render() {
    return <JobSearchPage />;
  }
}
