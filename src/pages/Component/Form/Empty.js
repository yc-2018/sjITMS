import { PureComponent } from "react";

export default class Empty extends PureComponent {
  render() {
    const emptyStr = "<空>";
    return <span style={{color: 'grey'}}>{emptyStr}</span>;
  }
}
