import { create } from "zustand"

interface ClickCanvasState {
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

export const useClickCanvas = create<ClickCanvasState>((set, get) => ({
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
    const { status, animationRunning } = get()
    
    const cols = 20;
    const cellWidth = 160;
    const cellHeight = Math.round(Math.sqrt(cellWidth * cellWidth - (cellWidth/2) * (cellWidth/2)));
    
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
