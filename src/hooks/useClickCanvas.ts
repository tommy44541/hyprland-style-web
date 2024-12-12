import { create } from "zustand"

interface TriangleConfig {
  cols: number;
  rows: number;
  opacity: number;
  cellWidth: number;
  cellHeight: number;
  opacityStep: number;
  vertexStep: number;
  frameDelay: number;
  animateSpeed: number;
}

interface ClickCanvasState {
  triangleConfig: TriangleConfig;
  animationRunning: boolean;
  setAnimationRunning: (value: boolean) => void;
  startCell: number | null;
  setStartCell: (value: number | null) => void;
  //動畫啟動/關閉
  status: "open" | "close";
  setStatus: (value: "open" | "close") => void;
  triggerAnimation: (x: number, y: number) => void;
  resetCells: (nextAction?: any) => void;
}

const CELL_WIDTH = 200;

export const useClickCanvas = create<ClickCanvasState>((set, get) => ({
  triangleConfig: {
    cols: 20,
    rows: 20,
    opacity: .8,
    cellWidth: CELL_WIDTH,
    cellHeight: Math.round(Math.sqrt(CELL_WIDTH * CELL_WIDTH - (CELL_WIDTH/2) * (CELL_WIDTH/2))),
    opacityStep: 4,
    vertexStep: 4,
    frameDelay: 1,
    animateSpeed: 50,
  },
  animationRunning: false,
  setAnimationRunning: (value: boolean) => set({ animationRunning: value }),
  startCell: null,
  setStartCell: (value: number | null) => set({ startCell: value }),
  status: "close",
  setStatus: (value: "open" | "close") => set({ status: value }),
  resetCells: (nextAction) => {
    const { status } = get();
    set({ 
      status: status === 'open' ? 'close' : 'open',
      animationRunning: true 
    });
    nextAction && nextAction()
  },
  triggerAnimation: (x: number, y: number) => {
    const { status, animationRunning, triangleConfig } = get()

    const { cols, cellWidth, cellHeight } = triangleConfig;

    const col = Math.floor(x / (cellWidth / 2));
    const row = Math.floor(y / cellHeight);
    const index = row * cols + col;
    
    if (animationRunning) {
      set({ 
        startCell: index,
        status: status === 'open' ? 'close' : 'open',
      });
    } else {
      set({ 
        startCell: index,
        status: status === 'open' ? 'close' : 'open',
        animationRunning: true 
      });
    }
  },
}))
