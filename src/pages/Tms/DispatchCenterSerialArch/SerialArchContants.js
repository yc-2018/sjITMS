/**状态 */
export const State = {
  INITIAL: {
    name: 'INITIAL',
    caption: '初始'
  },
  APPROVED: {
    name: 'APPROVED',
    caption: '批准'
  }
}

export function getStatusCaption(name) {
  let caption;
  Object.keys(State).forEach(function (key) {
    if (State[key].name === name)
      caption = State[key].caption;
  });
  return caption;
}

