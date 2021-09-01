export const wrhCloseType = {
  CLOSE: {
    name: 'CLOSE',
    caption: '封仓',
  },
  UNCLOSE: {
    name: 'UNCLOSE',
    caption: '解仓',
  },
}

export function getTypeCaption(state) {
  let caption;

  for (let x in wrhCloseType) {
    if (wrhCloseType[x].name === state) {
      caption = wrhCloseType[x].caption;
      break;
    }
  }

  return caption;
}