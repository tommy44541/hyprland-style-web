import React, { useRef, useEffect, useState } from "react";
import { distFromCenter, drawTriangle, rand_int } from "./utils";

//TODO1: 增加隨機性, 讓三角形擴散的更自然

//TODO2: 元件改為overlay,並用使用framer-motion控制
const cols = 20; // 設定列數
const rows = 20; // 設定行數
const cellWidth = 200; // 單元格寬度
const cellHeight = Math.round(Math.sqrt(cellWidth * cellWidth - (cellWidth/2) * (cellWidth/2))); // 使用等邊三角形的高度計算公式
const opacityStep = 4; // 不透明度變化步驟 (調大，減慢速度)
const vertexStep = 4; // 頂點變化步驟 (調大，減慢速度)
const frameDelay = 1; // 每隔幾幀執行更新

const TriangleAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spreadPathRef = useRef<Set<number>>(new Set());
  const cellsRef = useRef<Array<any>>(Array(rows * cols).fill(null).map((_) => [
    0, 1,// c_opacity, t_opacity
    0, 1, // c_left, t_left
    0, 1, // c_right, t_right
    0, 1, // c_y, t_y
    null,
    false, // s_override
    Math.random() * .5, // 添加新屬性：擴散延遲的隨機因子
  ]));
  const [animationRunning, setAnimationRunning] = useState(true);
  const [startCell, setStartCell] = useState<number | null>(null); // 存儲起始三角形
  const [dark, setDark] = useState<boolean>(false); // 控制暗色或亮色

  // 重置動畫
  const resetAnimation = () => {
    setAnimationRunning(false); // 停止動畫
    const currentCells = cellsRef.current

    // 反轉每個 cell 的目標值
    const updatedCells = currentCells.map((cell, i) => {
      const [c_opacity, t_opacity, c_left, t_left, c_right, t_right, c_y, t_y, inited, s_override, spreadDelay] = cell;

      return [
        c_opacity, 1 - t_opacity, // 反轉透明度目標
        c_left, 1 - t_left,       // 反轉左比例目標  
        c_right, 1 - t_right,     // 反轉右比例目標
        c_y, 1 - t_y,             // 反轉Y比例目標
        i === startCell || inited, // 保留已初始化的狀態
        s_override,                // 保持覆蓋狀態
        spreadDelay,
      ];
    });

    cellsRef.current = updatedCells;
    setDark((prev) => !prev); // 切換暗色和亮色
    setAnimationRunning(true); // 重新啟動動畫
    spreadPathRef.current.clear();
    if (startCell !== null) {
      spreadPathRef.current.add(startCell);
    }
  };

  // 動畫邏輯
  useEffect(() => {
    if (!animationRunning) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    let animationFrameId: number;
    let frameCount = 0; // 用於引入幀延遲
    const startTime = performance.now();

    // 計算中心點
    const centerX = startCell ? (startCell % cols) * cellWidth : canvas.width / 2;
    const centerY = startCell ? Math.floor(startCell / cols) * cellHeight : canvas.height / 2;

    // 顏色設定
    const initialColor = [87 / 255, 84 / 255, 74 / 255];

    const animate = (timestamp: number) => {
      frameCount++;
      if (frameCount % frameDelay !== 0) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      let stable = true;

      const elapsedTime = (timestamp - startTime) / 1000;

      const updatedCells = cellsRef.current.map((cell, i) => {
        const x = i % cols;
        const y = Math.floor(i / cols);
        const cellCenterX = x * cellWidth;
        const isLeftSide = cellCenterX < centerX;

        const distance = distFromCenter(x * cellWidth, y * cellHeight, centerX, centerY);
        let [c_opacity, t_opacity, c_left, t_left, c_right, t_right, c_y, t_y, inited, s_override, spreadDelay] = cell;

        if (s_override) return cell;

        if (!inited && !spreadPathRef.current.has(i)) {
          // 獲取相鄰的單元格
          const neighbors = [
            i - cols, // 上
            i + cols, // 下
            i - 1,    // 左
            i + 1     // 右
          ].filter(n => 
            n >= 0 && n < rows * cols && 
            spreadPathRef.current.has(n)
          );

          // 如果有相鄰的已激活單元格，有機會激活當前單元格
          if (neighbors.length > 0 && Math.random() < 0.3) {
            spreadPathRef.current.add(i);
            cell[10] = Math.random() * .5; // 添加隨機延遲因子
          }
        }

        const randomDelay = cell[10] || 0;
        const baseDelay = distance / (cellWidth * 5);
        const finalDelay = baseDelay + randomDelay;

        if (elapsedTime < finalDelay) {
          stable = false;
          drawTriangle(
            context,
            x * (cellWidth / 2),
            y * cellHeight,
            cellWidth - 3,
            cellHeight - 1.5,
            [initialColor[0], initialColor[1], initialColor[2], c_opacity],
            (x % 2 === 0) !== (y % 2 === 0),
            c_left,
            c_right,
            c_y
          );
          return cell;
        }

        if (Math.abs(c_opacity - t_opacity) > 0.01) {
          stable = false;
          c_opacity += (t_opacity - c_opacity) / 
          opacityStep;
        }

        if (dark) {
          if (isLeftSide) {
            if (Math.abs(c_right - t_right) > 0.001) {
              stable = false;
              c_right += (t_right - c_right) / vertexStep;
            } else {
              c_left = t_left;
              c_y = t_y;
            }
          } else {
            if (Math.abs(c_left - t_left) > 0.001) {
              stable = false;
              c_left += (t_left - c_left) / vertexStep;
            } else {
              c_right = t_right;
              c_y = t_y;
            }
          }
        } else {
          if (isLeftSide) {
            if (Math.abs(c_right - t_right) > 0.001 || Math.abs(c_y - t_y) > 0.001) {
              stable = false;
              c_right = t_right;
              c_y = t_y;
            } else if (Math.abs(c_left - t_left) > 0.001) {
              stable = false;
              c_left += (t_left - c_left) / vertexStep;
            }
          } else {
            if (Math.abs(c_left - t_left) > 0.001 || Math.abs(c_y - t_y) > 0.001) {
              stable = false;
              c_left = t_left;
              c_y = t_y;
            } else if (Math.abs(c_right - t_right) > 0.001) {
              stable = false;
              c_right += (t_right - c_right) / vertexStep;
            }
          }
        }

        drawTriangle(
          context,
          x * (cellWidth / 2),
          y * cellHeight,
          cellWidth - 3,
          cellHeight - 1.5,
          [initialColor[0], initialColor[1], initialColor[2], c_opacity],
          (x % 2 === 0) !== (y % 2 === 0),
          c_left,
          c_right,
          c_y
        );

        return [c_opacity, t_opacity, c_left, t_left, c_right, t_right, c_y, t_y, inited, s_override, spreadDelay];
      });

      cellsRef.current = updatedCells;

      if (!stable) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate); // 啟動動畫

    return () => {
      cancelAnimationFrame(animationFrameId); // 停止動畫
      //canvas.style.display = "none";
    };
  }, [animationRunning, dark]);

  // 在 useEffect 中添加點擊事件監聽器
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // 計算點擊的三角形索引
      const col = Math.floor(x / (cellWidth / 2));
      const row = Math.floor(y / cellHeight);
      const index = row * cols + col;

      setStartCell(index); // 設置起始三角形
      resetAnimation(); // 重置動畫
    };

    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [canvasRef, resetAnimation]);

  if (!window) return null;

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{
        //background: "#f4f0e1",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    ></canvas>
  );
};

export default TriangleAnimation;