class DragHelper {
  down(){} // eslint-disable-line
  up(){} // eslint-disable-line
  leave(){}// eslint-disable-line
}

export class DragHelperForWin extends DragHelper {
  constructor(win, vue) {
    super();
    this.win = win;
    this.vue = vue;
    this.onDrag = false;
    this.checkInterval = 10;
    this.dragAreaPadding = 10;
    this.timer = null;
    this.bounds = null;
    this.offset = { x: 0, y: 0 };
  }
  down() {
    const CWinfo = this.cursorWindowRelativeInfo(this.dragAreaPadding);
    if (CWinfo.inWindow) {
      this.onDrag = true;
      this.bounds = CWinfo.wb;
      this.offset = { x: (CWinfo.wb.x - CWinfo.cp.x), y: (CWinfo.wb.y - CWinfo.cp.y) };
      this.trackMouse();
    }
  }
  up() {
    if (this.onDrag) {
      this.onDrag = false;
      clearInterval(this.timer);
    }
  }
  leave() {
    this.up();
  }
  trackMouse() {
    this.timer = setInterval(() => {
      const cp = this.vue.$electron.screen.getCursorScreenPoint();
      this.bounds.x = cp.x + this.offset.x;
      this.bounds.y = cp.y + this.offset.y;
      this.win.setBounds(this.bounds);
    }, this.checkInterval);
  }
  cursorWindowRelativeInfo(padding) {
    const cp = this.vue.$electron.screen.getCursorScreenPoint();
    const wb = this.win.getBounds();
    let inWindow = false;
    const x1 = wb.x + padding;
    const x2 = (wb.x + wb.width) - padding;
    const y1 = wb.y + padding;
    const y2 = (wb.y + wb.height) - padding;
    if (x1 < cp.x && cp.x < x2 && y1 < cp.y && cp.y < y2) {
      inWindow = true;
    }
    return { cp, wb, inWindow };
  }
}
export class DragHelperForMac extends DragHelper {
}
export class DragHelperForOther extends DragHelper {
}
export default function getDragHelper() {
  switch (process.platform) {
    case 'win32':
      return DragHelperForWin;
    case 'darwin':
      return DragHelperForWin; // todo lyc
    default:
      return DragHelperForOther;
  }
}
