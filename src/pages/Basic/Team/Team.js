import { connect } from 'dva';
import React, { PureComponent } from 'react';
import TeamSearchPage from '@/pages/Basic/Team/TeamSearchPage';
import TeamCreatePage from '@/pages/Basic/Team/TeamCreatePage';
import TeamViewPage from '@/pages/Basic/Team/TeamViewPage';

@connect(({ team, loading }) => ({
  team,
  loading: loading.models.team,
}))
export default class Team extends PureComponent {

  render() {
    if (this.props.team.showPage === 'query') {
      return <TeamSearchPage pathname={this.props.location.pathname}/>;
    } else if (this.props.team.showPage === 'create')
      return <TeamCreatePage pathname={this.props.location.pathname}/>;
    else if (this.props.team.showPage === 'view')
      return <TeamViewPage pathname={this.props.location.pathname}/>
  }
}
