import { create } from "zustand"



interface ClickCanvasState {
  triangleConfig: {
    cols: number;
    rows: number;
    opacity: number;
    cellWidth: number;
    cellHeight: number;
    opacityStep: number;
    vertexStep: number;
    frameDelay: number;
    animateSpeed: number;
  };
  animationRunning: boolean;
  setAnimationRunning: (value: boolean) => void;
  startCell: number | null;
  setStartCell: (value: number | null) => void;
  status: "open" | "pending" | "close";
  setStatus: (value: "open" | "pending" | "close") => void;
  triggerAnimation: (x: number, y: number) => void;
  resetCells: () => void;
  autoRefire: {
    auto: boolean;
    refireDelay: number;
  };
  setAutoRefire: (value: { auto: boolean; refireDelay: number }) => void;
}

const CELL_WIDTH = 160;

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
    animateSpeed: 30
  },
  animationRunning: false,
  setAnimationRunning: (value: boolean) => set({ animationRunning: value }),
  startCell: null,
  setStartCell: (value: number | null) => set({ startCell: value }),
  status: "close",
  setStatus: (value: "open" | "pending" | "close") => set({ status: value }),
  resetCells: () => {
    const { status } = get();
    set({ 
      status: status === 'open' ? 'close' : 'open',
      animationRunning: true 
    });
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
  autoRefire: {
    auto: false,
    refireDelay: 2
  },
  setAutoRefire: (value: { auto: boolean; refireDelay: number }) => 
    set({ autoRefire: value }),
}))
