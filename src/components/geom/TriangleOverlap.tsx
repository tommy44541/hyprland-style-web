"use client"

import React, { useRef, useEffect } from "react";
import { useClickCanvas } from "@/hooks/useClickCanvas";
import { cn } from "@/lib/utils";

//TODO: 使用cursor控制三角形繪製區域,只有cursor匡選起來的區域才會繪製三角形
//TODO: 狀態改成三種狀態, open, close, pending, 其中pending狀態的特效改為從左至右的pulsing, 需要新增一個cell屬性"c_scale", 當pulsing時, c_scale在1 ~ 1.2之間變化

// 會應用到此動畫的元件: sideBar(大三角, 速度較快), darkModeToggle(小三角, 速度較慢, 不透明), 純過場動畫(中三角, 速度快)


interface TriangleAnimationProps {

}

const TriangleAnimation: React.FC<TriangleAnimationProps> = () => {
  const {
    triangleConfig,
    animationRunning,
    startCell,
    status,
  } = useClickCanvas();

  const { cols, rows, opacity, cellWidth, cellHeight, opacityStep, vertexStep, frameDelay, animateSpeed } = triangleConfig;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spreadPathRef = useRef<Set<number>>(new Set());

  const cellsRef = useRef<Array<any>>(Array(rows * cols).fill(null).map((_) => [
    0, opacity, // c_opacity, t_opacity
    0, 1, // c_left, t_left
    0, 1, // c_right, t_right
    0, 1, // c_y, t_y
    null,
    false, // s_override
    Math.random() * .5, //擴散延遲的隨機因子
  ]));

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
    //const initialColor = status === 'open' ? [87/255, 84/255, 74/255] : [218/255, 212/255, 187/255]
    //const borderColor = status === 'open' ? [218/255, 212/255, 187/255] : [87/255, 84/255, 74/255]
    const borderColor = [218/255, 212/255, 187/255]
    const initialColor = [87 / 255, 84 / 255, 74 / 255]

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
        const baseDelay = distance / (cellWidth * animateSpeed);
        const finalDelay = baseDelay + randomDelay;

        if (elapsedTime < finalDelay && !stable) {
          stable = false;
          drawTriangle(
            context,
            x * (cellWidth / 2),
            y * cellHeight,
            cellWidth,
            cellHeight,
            [initialColor[0], initialColor[1], initialColor[2], c_opacity],
            [borderColor[0], borderColor[1], borderColor[2], c_opacity],
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
          cellWidth,
          cellHeight,
          [initialColor[0], initialColor[1], initialColor[2], c_opacity],
          [borderColor[0], borderColor[1], borderColor[2], c_opacity],
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
        stable = true
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [animationRunning, status]);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      className={cn("fixed inset-0 w-full h-full m-0 p-0 z-overlay",
        status === 'close' && "pointer-events-none"
      )}
    ></canvas>
  );
};

export default TriangleAnimation;

function drawTriangle(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  color: [number, number, number, number],
  borderColor: [number, number, number, number],
  inverted: boolean,
  leftRatio: number,
  rightRatio: number,
  yRatio: number,
){
  // 如果任何一個比率太小，就不繪製
  if (leftRatio <= 0.001 || rightRatio <= 0.001 || yRatio <= 0.001) {
    return;
  }

  context.fillStyle = `rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${color[3]})`;

  // 計算三角形的頂點位置
  let leftPoint, rightPoint, yPoint;
  if (inverted) {
    // 倒置三角形的頂點計算
    leftPoint = [centerX - width/2, centerY + height/2];
    rightPoint = [centerX + width/2, centerY + height/2];
    yPoint = [centerX, centerY - height/2];
  } else {
    // 正置三角形的頂點計算
    leftPoint = [centerX - width/2, centerY - height/2];
    rightPoint = [centerX + width/2, centerY - height/2];
    yPoint = [centerX, centerY + height/2];
  }

  // 應用頂點變換
  if (leftRatio < 1) {
    let vector_left_right = [(rightPoint[0] - leftPoint[0]) * (1 - leftRatio), (rightPoint[1] - leftPoint[1]) * (1 - leftRatio)];
    let vector_left_y = [(yPoint[0] - leftPoint[0]) * (1 - leftRatio), (yPoint[1] - leftPoint[1]) * (1 - leftRatio)];
    leftPoint = [
      leftPoint[0] + vector_left_right[0]/2 + vector_left_y[0]/2,
      leftPoint[1] + vector_left_right[1]/2 + vector_left_y[1]/2
    ];
  }
  
  if (rightRatio < 1) {
    let vector_right_left = [(leftPoint[0] - rightPoint[0]) * (1 - rightRatio), (leftPoint[1] - rightPoint[1]) * (1 - rightRatio)];
    let vector_right_y = [(yPoint[0] - rightPoint[0]) * (1 - rightRatio), (yPoint[1] - rightPoint[1]) * (1 - rightRatio)];
    rightPoint = [
      rightPoint[0] + vector_right_left[0]/2 + vector_right_y[0]/2,
      rightPoint[1] + vector_right_left[1]/2 + vector_right_y[1]/2
    ];
  }

  if (yRatio < 1) {
    let vector_y_left = [(leftPoint[0] - yPoint[0]) * (1 - yRatio), (leftPoint[1] - yPoint[1]) * (1 - yRatio)];
    let vector_y_right = [(rightPoint[0] - yPoint[0]) * (1 - yRatio), (rightPoint[1] - yPoint[1]) * (1 - yRatio)];
    yPoint = [
      yPoint[0] + vector_y_left[0]/2 + vector_y_right[0]/2,
      yPoint[1] + vector_y_left[1]/2 + vector_y_right[1]/2
    ];
  }

  // 繪製三角形
  context.beginPath();
  context.moveTo(leftPoint[0], leftPoint[1]);
  context.lineTo(rightPoint[0], rightPoint[1]);
  context.lineTo(yPoint[0], yPoint[1]);
  context.closePath();
  context.fill();

  context.strokeStyle = `rgba(${borderColor[0] * 255}, ${borderColor[1] * 255}, ${borderColor[2] * 255}, ${borderColor[3]}`;
  context.lineWidth = .5;
  context.stroke();
};

function distFromCenter(x: number, y: number, centerX: number, centerY: number){
  return Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
};

/* function pos_mapper(x: number,y:number,size1_x:number,size1_y:number,size2_x:number,size2_y:number){
  let x_ratio = x/size1_x;
  let y_ratio = y/size1_y;

  return [x_ratio*size2_x,y_ratio*size2_y];
} */
