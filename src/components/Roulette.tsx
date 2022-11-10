import { createRef, useEffect, useRef, useState } from "react";

function drawRoulette(
  canvas: HTMLCanvasElement | null,
  offset: number,
  velocity: number,
  callback: (offset: number) => void
) {
  if (!canvas) return;

  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  context.clearRect(0, 0, canvas.width, canvas.height);

  const bgColor = "#334155";
  const halfSize = canvas.width * 0.5;
  const radius = halfSize - 4;

  context.fillStyle = bgColor;
  context.ellipse(halfSize, halfSize, radius, radius, 0, 0, 2 * Math.PI);
  context.fill();

  const colors = [
    "#dc2626",
    "#d97706",
    "#65a30d",
    "#059669",
    "#0891b2",
    "#2563eb",
    "#7c3aed",
    "#c026d3",
  ];

  colors.forEach((color, index) => {
    const startAngle = (index * 2 * Math.PI) / colors.length + offset;
    const endAngle = ((index + 1) * 2 * Math.PI) / colors.length + offset;

    context.fillStyle = color;
    context.beginPath();
    context.moveTo(halfSize, halfSize);
    context.arc(halfSize, halfSize, radius, startAngle, endAngle);
    context.fill();
  });

  velocity = velocity < 0.0005 ? 0 : velocity * 0.99;
  offset = (offset + velocity) % (2 * Math.PI);

  console.log(velocity, offset);

  const animation = requestAnimationFrame(() => {
    if (velocity <= 0) {
      cancelAnimationFrame(animation);
      return callback(offset);
    }

    drawRoulette(canvas, offset, velocity, callback);
  });
}

export default function Roulette() {
  const rouletteRef = createRef<HTMLCanvasElement>();
  const velocity = useRef<number>(0);
  const [offset, setOffset] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    drawRoulette(rouletteRef.current, offset, velocity.current, (newOffset) => {
      setOffset(newOffset);
    });
  }, []);

  useEffect(() => {
    if (!isSpinning) return;

    drawRoulette(rouletteRef.current, offset, velocity.current, (newOffset) => {
      setOffset(newOffset);
      setIsSpinning(false);
    });
  }, [isSpinning]);

  return (
    <div className="w-full">
      <div className="w-96 aspect-square max-w-full rounded-full bg-white m-auto">
        <canvas
          className="w-full h-full aspect-square"
          ref={rouletteRef}
          width="400"
          height="400"
        />
      </div>
      <button
        data-filled
        disabled={isSpinning}
        onClick={() => {
          velocity.current = ((Math.random() * 15 + 5) * Math.PI) / 180;
          setIsSpinning(true);
        }}
      >
        Girar
      </button>
    </div>
  );
}
