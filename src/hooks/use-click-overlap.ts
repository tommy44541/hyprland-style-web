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

interface ClickOverlapState {
  triangleConfig: TriangleConfig;
  animationRunning: boolean;
  setAnimationRunning: (value: boolean) => void;
  startCell: number | null;
  setStartCell: (value: number | null) => void;
  //動畫啟動/關閉
  status: "dark" | "light";
  setStatus: (value: "dark" | "light") => void;
  triggerAnimation: (x: number, y: number, next?: () => void) => void;
}

const CELL_WIDTH = 60;

export const useClickOverlap = create<ClickOverlapState>((set, get) => ({
  triangleConfig: {
    cols: 80,
    rows: 80,
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
  status: "light",
  setStatus: (value: "dark" | "light") => set({ status: value }),
  triggerAnimation: (x: number, y: number, next?: () => void) => {
    const { status, triangleConfig } = get()

    const { cols, cellWidth, cellHeight } = triangleConfig;

    const col = Math.floor(x / (cellWidth / 2));
    const row = Math.floor(y / cellHeight);
    const index = row * cols + col;
    set({ 
      startCell: index,
      status: status === 'dark' ? 'light' : 'dark',
    });
    next && next()
  },
}))
