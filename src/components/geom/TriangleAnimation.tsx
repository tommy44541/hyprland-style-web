"use client"

import React, { useRef, useEffect, useState } from "react";
import { distFromCenter, drawTriangle } from "./utils";
import { useClickCanvas } from "@/hooks/useClickCanvas";

//TODO: 使用cursor控制三角形繪製區域,只有cursor匡選起來的區域才會繪製三角形
//TODO: 狀態改成三種狀態, open, close, pending, 其中pending狀態的特效改為從左至右的pulsing, 需要新增一個cell屬性"c_scale", 當pulsing時, c_scale在1 ~ 1.2之間變化

// 會應用到此動畫的元件: sideBar(大三角, 速度較快), darkModeToggle(小三角, 速度較慢, 不透明), 純過場動畫(中三角, 速度快)


interface TriangleAnimationProps {
  /* autoCycle?: boolean;
  triangleConfig? : 'sideBar' | 'darkModeToggle' | 'default'; */
}

const TriangleAnimation: React.FC<TriangleAnimationProps> = () => {
  const {
    triangleConfig,
    animationRunning,
    startCell,
    status,
    setAutoRefire,
    autoRefire,
    resetCells
  } = useClickCanvas();

  const { cols, rows, cellWidth, cellHeight, opacityStep, vertexStep, frameDelay } = triangleConfig;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spreadPathRef = useRef<Set<number>>(new Set());

  const cellsRef = useRef<Array<any>>(Array(rows * cols).fill(null).map((_) => [
    0, .8, // c_opacity, t_opacity
    0, 1, // c_left, t_left
    0, 1, // c_right, t_right
    0, 1, // c_y, t_y
    null,
    false, // s_override
    Math.random() * .5, // 添加新屬性：擴散延遲的隨機因子
  ]));

    // 添加 stable 狀態管理
    const [stable, setStable] = useState(true);

  // 添加重新觸發的計時器
  useEffect(() => {
    if (!autoRefire.auto || !stable) return;
    
    const timer = setTimeout(() => {
      setAutoRefire({ auto: false, refireDelay: 0 });
      resetCells();
    }, autoRefire.refireDelay * 1000);

    return () => clearTimeout(timer);
  }, [stable, autoRefire.auto, autoRefire.refireDelay]);

  // 監聽status的變化
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const currentCells = cellsRef.current;
    // 反转每个 cell 的目标值
    const updatedCells = currentCells.map((cell, i) => {
      const [c_opacity, t_opacity, c_left, t_left, c_right, t_right, c_y, t_y, inited, s_override, spreadDelay] = cell;

      return [
        c_opacity, 1 - t_opacity, // 反转透明度目标
        c_left, 1 - t_left,       // 反转左比例目标  
        c_right, 1 - t_right,     // 反转右比例目标
        c_y, 1 - t_y,             // 反转Y比例目标
        i === startCell || inited, // 保留已初始化的状态
        s_override,                // 保持覆盖状态
        spreadDelay,
      ];
    });

    cellsRef.current = updatedCells;
    spreadPathRef.current.clear();
    if (startCell !== null) {
      spreadPathRef.current.add(startCell);
    }
  }, [status, startCell]);

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
    //const initialColor = status === 'open' ? [218/255, 212/255, 187/255] : [87/255, 84/255, 74/255]
    const initialColor = [87/255, 84/255, 74/255]

    const animate = (timestamp: number) => {
      frameCount++;
      if (frameCount % frameDelay !== 0) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      let stable = true;

      const elapsedTime = (timestamp - startTime) / 1000;

      if (!cellsRef?.current) return;
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
        //增加cellWidth的乘數, 使三角形擴散速度變快
        const baseDelay = distance / (cellWidth * 10);
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

        if (status === 'close') {
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
      } else {
        // 當動畫完成時，設置 stable 狀態
        setStable(true);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [animationRunning, status]);

  if (!window) return null;

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      className="fixed inset-0 w-full h-full m-0 p-0 pointer-events-none z-overlay"
    ></canvas>
  );
};

export default TriangleAnimation;