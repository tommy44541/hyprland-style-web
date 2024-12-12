"use client";

import { throttle } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface TriangleBallProps {
  className?: string
}

export default function TriangleBall({
  className
}: TriangleBallProps) {
  const width = 700
  const height = 700
  const radius = 300;
  const centerX = width / 2;
  const centerY = height / 2;
  const dark = "rgba(87, 84, 74, 0.7)"
  const light = "rgba(180, 175, 154, 0.7)"

  const perspective = 700;

  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  //深度越深, 面數越多, 超過3運算將會有瓶頸
  const depth = 2;

  const vertices = [
    [-1, goldenRatio, 0],
    [1, goldenRatio, 0],
    [-1, -goldenRatio, 0],
    [1, -goldenRatio, 0],
  
    [0, -1, goldenRatio],
    [0, 1, goldenRatio],
    [0, -1, -goldenRatio],
    [0, 1, -goldenRatio],
  
    [goldenRatio, 0, -1],
    [goldenRatio, 0, 1],
    [-goldenRatio, 0, -1],
    [-goldenRatio, 0, 1],
  ].map(([x, y, z]) => {
    const length = Math.sqrt(x * x + y * y + z * z);
    return [x / length, y / length, z / length];
  });

  //初始depth = 1面數數據
  const faces = [
    [0, 11, 5],
    [0, 5, 1],
    [0, 1, 7],
    [0, 7, 10],
    [0, 10, 11],
  
    [1, 5, 9],
    [5, 11, 4],
    [11, 10, 2],
    [10, 7, 6],
    [7, 1, 8],
  
    [3, 9, 4],
    [3, 4, 2],
    [3, 2, 6],
    [3, 6, 8],
    [3, 8, 9],
  
    [4, 9, 5],
    [2, 4, 11],
    [6, 2, 10],
    [8, 6, 7],
    [9, 8, 1],
  ];

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const mousePosition = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>();
  
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const [hoveredTriangleIndex, setHoveredTriangleIndex] = useState<number | null>(null);

  const midpoint = ([x1, y1, z1]: [number, number, number], [x2, y2, z2]: [number, number, number]) => {
    return [(x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2];
  }

  const normalize = ([x, y, z]: [number, number, number]) => {
    const length = Math.sqrt(x * x + y * y + z * z);
    return [x / length, y / length, z / length];
  }

  const subdivideTriangle = (v1: [number, number, number], v2: [number, number, number], v3: [number, number, number], depth: number): [number, number, number][][] => {
    if (depth === 0) {
      return [[v1, v2, v3]];
    }

    const mid1 = normalize(midpoint(v1, v2) as [number, number, number]);
    const mid2 = normalize(midpoint(v2, v3) as [number, number, number]);
    const mid3 = normalize(midpoint(v3, v1) as [number, number, number]);

    return [
      ...subdivideTriangle(v1 as [number, number, number], mid1 as [number, number, number], mid3 as [number, number, number], depth - 1),
      ...subdivideTriangle(mid1 as [number, number, number], v2 as [number, number, number], mid2 as [number, number, number], depth - 1),
      ...subdivideTriangle(mid3 as [number, number, number], mid2 as [number, number, number], v3 as [number, number, number], depth - 1),
      ...subdivideTriangle(mid1 as [number, number, number], mid2 as [number, number, number], mid3 as [number, number, number], depth - 1),
    ];
  }

  const generateSphere = (depth: number) => {
    let triangles: [number, number, number][][] = [];

    faces.forEach(([i1, i2, i3]) => {
      const v1 = vertices[i1];
      const v2 = vertices[i2];
      const v3 = vertices[i3];
      triangles = triangles.concat(subdivideTriangle(v1 as [number, number, number], v2 as [number, number, number], v3 as [number, number, number], depth));
    });    

    return triangles;
  }

  const project3D = ([x, y, z]: [number, number, number]) => {
    const zOffset = perspective + z * radius; // 確保 zOffset > 0
    if (zOffset <= 0) return [centerX, centerY]; // 防止透視反轉

    const scale = perspective / zOffset;
    return [centerX + x * radius * scale, centerY - y * radius * scale];
  }

  /* const specialTriangles = [100, 150]; // 指定三角形索引

  const imagesCache: { [key: string]: HTMLImageElement } = {};

  const loadImage = (src: string) => {
    if (imagesCache[src]) return imagesCache[src];

    const img = new Image();
    img.src = src;
    imagesCache[src] = img;
    return img;
  }; */

  /* const drawImageOnTriangle = (
    imageSrc: string,
    tri: [[number, number], [number, number], [number, number]]
  ) => {
    const center = [(tri[0][0] + tri[1][0] + tri[2][0]) / 3, (tri[0][1] + tri[1][1] + tri[2][1]) / 3];
    if (!ctx.current) return;
  
    const img = loadImage(imageSrc);
      img.onload = () => {
        ctx.current?.drawImage(img, center[0] - 15, center[1] - 15, 30, 30);
      };

      // 如果圖片已經加載，立即繪製
      if (img.complete) {
        ctx.current?.drawImage(img, center[0] - 15, center[1] - 15, 30, 30);
      }
  
    img.onload = () => {
      const [p1, p2, p3] = tri;
  
      // 儲存畫布的狀態
      ctx.current!.save();
  
      // 計算變形矩陣
      const width = Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2);
      const height = Math.sqrt((p3[0] - p1[0]) ** 2 + (p3[1] - p1[1]) ** 2);
  
      const angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
  
      ctx.current!.translate(p1[0], p1[1]);
      ctx.current!.rotate(angle);
      ctx.current!.scale(1, height / width);
  
      // 繪製圖片
      ctx.current!.drawImage(img, 0, 0, width, height);
  
      // 恢復畫布狀態
      ctx.current!.restore();
    };
  };
   */

  const drawTriangle = (v1: [number, number], v2: [number, number], v3: [number, number], index:number) => {
    if (!ctx.current) return;
    ctx.current!.beginPath();
    ctx.current!.moveTo(v1[0], v1[1]);
    ctx.current!.lineTo(v2[0], v2[1]);
    ctx.current!.lineTo(v3[0], v3[1]);
    ctx.current!.closePath();

    //TODO: 優化指定面數三角形特殊內容
    /* if (specialTriangles.includes(index)) {
      ctx.current!.fillStyle = hoveredTriangleIndex === index ?  "rgba(180, 175, 154, 0.7)" : "rgba(87, 84, 74, 1)";
      ctx.current!.fill();
      drawImageOnTriangle("/blue_archieve/Arius.webp", [v1, v2, v3])
    } 
    else {
      ctx.current!.fillStyle = hoveredTriangleIndex === index ? "rgba(87, 84, 74, 1)" : "rgba(180, 175, 154, 0.7)";
      ctx.current!.fill();
      ctx.current!.strokeStyle = "rgba(87, 84, 74, 1)";
      ctx.current!.stroke();
    } */
      ctx.current!.fillStyle = hoveredTriangleIndex === index ? dark : light;
      ctx.current!.fill();
      ctx.current!.strokeStyle = dark;
      ctx.current!.stroke();
  }

  const drawJoint = (x: number, y: number) => {
    if (!ctx.current) return;
    ctx.current!.beginPath();
    ctx.current!.arc(x, y, 2, 0, Math.PI * 2);
    ctx.current!.fillStyle = dark;
    ctx.current!.fill();
  }

  const rotatePoint = (point: [number, number, number]): [number, number, number] => {
    const [x, y, z] = point;
    
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);
    const y1 = y;
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;
    
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const y2 = y1 * cosX - z1 * sinX;
    const z2 = y1 * sinX + z1 * cosX;
    
    return [x1, y2, z2];
  };

  //用外積運算優化
  const isPointInTriangle = (point: [number, number], tri: [[number, number], [number, number], [number, number]]) => {
    const [p1, p2, p3] = tri;
    const [px, py] = point;
  
    const sign = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) =>
      (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
  
    const d1 = sign(px, py, p1[0], p1[1], p2[0], p2[1]);
    const d2 = sign(px, py, p2[0], p2[1], p3[0], p3[1]);
    const d3 = sign(px, py, p3[0], p3[1], p1[0], p1[1]);
  
    const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
  
    return !(hasNeg && hasPos); // 點在三角形內部或邊界上
  };
  //背面的三角形不該被選到(視錐剔除)
  const isTriangleVisible = (v1: [number, number, number], v2: [number, number, number], v3: [number, number, number]) => {
    const normal = [
      (v2[1] - v1[1]) * (v3[2] - v1[2]) - (v2[2] - v1[2]) * (v3[1] - v1[1]),
      (v2[2] - v1[2]) * (v3[0] - v1[0]) - (v2[0] - v1[0]) * (v3[2] - v1[2]),
      (v2[0] - v1[0]) * (v3[1] - v1[1]) - (v2[1] - v1[1]) * (v3[0] - v1[0]),
    ];
    // 只需檢測 z 分量是否正值（面向正面）
    return normal[2] > 0;
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    
    ctx.current = canvasRef.current.getContext('2d');
    
    const render = () => {
      ctx.current?.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const triangles = generateSphere(depth)

      //因為繪製時不能被動確保繪製的順序, 後方的三角形可能會先繪製出來, 因此需要根據深度進行先行排序
      const trianglesWithDepth = triangles.map(([v1, v2, v3], index) => {
        const rv1 = rotatePoint(v1);
        const rv2 = rotatePoint(v2);
        const rv3 = rotatePoint(v3);
      
        const avgZ = (rv1[2] + rv2[2] + rv3[2]) / 3; // 平均 z 值
        return { vertices: [rv1, rv2, rv3], index, avgZ };
      }).sort((a, b) => b.avgZ - a.avgZ);

      trianglesWithDepth.forEach(({ vertices, index }) => {
        const [rv1, rv2, rv3] = vertices;
      
        const p1 = project3D(rv1);
        const p2 = project3D(rv2);
        const p3 = project3D(rv3);
      
        if (!isTriangleVisible(rv1, rv2, rv3) && !isDragging.current && isPointInTriangle([mousePosition.current.x, mousePosition.current.y], [p1 as [number, number], p2 as [number, number], p3 as [number, number]])) {
          setHoveredTriangleIndex(index);
        }
      
        drawTriangle(p1 as [number, number], p2 as [number, number], p3 as [number, number], index);
        drawJoint(p1[0], p1[1]);
        drawJoint(p2[0], p2[1]);
        drawJoint(p3[0], p3[1]);
      });
    };

    const animate = () => {
      if (!isDragging.current) {
        setRotation(prev => ({
          x: prev.x,
          y: prev.y + 0.001 // 調整旋轉速度
        }));
      }
      render();
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    // 啟動動畫
    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [rotation]);

  useEffect(() => {
    const handleMouseMove = throttle((e: MouseEvent) => {
      if (!isDragging.current) {
        const rect = canvasRef.current!.getBoundingClientRect();
        mousePosition.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        return
      }
  
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = lastMousePos.current.y - e.clientY;
      setRotation(prev => ({
        x: prev.x + deltaY * 0.005,
        y: prev.y + deltaX * 0.005
      }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }, 16)

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }

    const handleMouseUp = () => {
      isDragging.current = false;
    }

    const handleMouseLeave = () => {
      isDragging.current = false;
    }

    canvasRef.current?.addEventListener("mousemove", handleMouseMove);
    canvasRef.current?.addEventListener("mousedown", handleMouseDown);
    canvasRef.current?.addEventListener("mouseup", handleMouseUp);
    canvasRef.current?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvasRef.current?.removeEventListener("mousemove", handleMouseMove);
      canvasRef.current?.removeEventListener("mousedown", handleMouseDown);
      canvasRef.current?.removeEventListener("mouseup", handleMouseUp);
      canvasRef.current?.removeEventListener("mouseleave", handleMouseLeave);
    }
  }, [])

  return (
    <canvas
      className={className}
      width={width}
      height={height}
      ref={canvasRef}
    />
  )
}