import { PureComponent } from "react";
import styles from './ViewPanel.less';
import { Steps } from 'antd';
import { formatMessage } from 'umi/locale';
import StandardTable from '@/components/StandardTable';
const Step = Steps.Step;
export default class TimeLinePanelTest extends PureComponent {
  drawStep = () => {
    let items = this.props.items;
    let steps = [];
    items.forEach(function (item) {
      steps.push(
        <Step title={item.title} key={item.title} description={item.time} />
      );
    });
    return steps;
  }
  render() {
    return (
      //<div className={styles.collapse}>
      // <div className={styles.collapseDiv}>
      <Steps progressDot current={this.props.current}>
        {this.drawStep()}
      </Steps>
      // </div>
      //</div>
    );
  }
}