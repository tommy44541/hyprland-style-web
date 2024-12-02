async function get_cursor() {
  return new Promise((resolve) => {
    window.addEventListener("mousemove", function onMouseMove(event) {
      resolve([event.clientX, event.clientY]);
      window.removeEventListener("mousemove", onMouseMove);
    });
  });
}

const pos_mapper = (x: number,y:number,size1_x:number,size1_y:number,size2_x:number,size2_y:number) => {
  let x_ratio = x/size1_x;
  let y_ratio = y/size1_y;

  return [x_ratio*size2_x,y_ratio*size2_y];
}

const drawTriangle = (
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  color: [number, number, number, number],
  inverted: boolean,
  leftRatio: number,
  rightRatio: number,
  yRatio: number,
) => {
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
};

const distFromCenter = (x: number, y: number, centerX: number, centerY: number) => {
  return Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
};


export { get_cursor, distFromCenter, drawTriangle, pos_mapper };
