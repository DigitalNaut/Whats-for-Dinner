import { createRef, useEffect, useState } from "react";
import { ReactComponent as Wedge } from "src/assets/wedge.svg";

// import history from "src/pages/Main";

const TAU = 2 * Math.PI;

function drawRoulette(
  canvas: HTMLCanvasElement | null,
  offset: number,
  velocity: number,
  onUpdate?: (result: string) => void,
  onSpinEnd?: (offset: number) => void
) {
  if (!canvas) return;

  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  context.clearRect(0, 0, canvas.width, canvas.height);

  const bgColor = "#334155";
  const halfSize = canvas.width * 0.5;
  const radius = halfSize - 4;

  context.fillStyle = bgColor;
  context.ellipse(halfSize, halfSize, radius, radius, 0, 0, TAU);
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

  const compositeOffset = offset + 0.5 * Math.PI - Math.PI / colors.length;
  colors.forEach((color, index) => {
    const startAngle = (index * TAU) / colors.length + compositeOffset;
    const endAngle = ((index + 1) * TAU) / colors.length + compositeOffset;

    context.fillStyle = color;
    context.beginPath();
    context.moveTo(halfSize, halfSize);
    context.arc(halfSize, halfSize, radius, startAngle, endAngle);
    context.fill();

    context.save();
    context.fillStyle = "white";
    context.font = "bold 32px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.translate(
      halfSize + radius * 0.8 * Math.cos(startAngle + Math.PI / colors.length),
      halfSize + radius * 0.8 * Math.sin(startAngle + Math.PI / colors.length)
    );
    context.rotate(startAngle + Math.PI / colors.length + Math.PI / 2);
    context.fillText(`${index + 1}`, 0, 0);
    context.restore();
  });

  velocity = velocity < 0.005 ? 0 : velocity * 0.99;
  offset = (offset + velocity) % TAU;

  const animation = requestAnimationFrame(() => {
    // (Circle unit + 180 degrees for the top wedge)
    // - the offset to reverse the numbers
    // + half a wedge width,
    // all % adjusted for 360 degrees, divided by 360 degrees

    if (onUpdate) {
      const result =
        Math.floor(
          (((Math.PI * 3 - offset + Math.PI / colors.length) % TAU) / TAU) *
            colors.length
        ) + 1;

      onUpdate(result.toString());
    }

    if (velocity > 0)
      drawRoulette(canvas, offset, velocity, onUpdate, onSpinEnd);
    else {
      cancelAnimationFrame(animation);
      onSpinEnd?.(offset);
    }
  });
}

export default function Roulette() {
  const rouletteRef = createRef<HTMLCanvasElement>();
  const [offset, setOffset] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    drawRoulette(rouletteRef.current, offset, 0);
  }, []);

  function randomVelocity(base: number, range: number) {
    return ((Math.random() * range + base) * Math.PI) / 180;
  }

  const spin = () => {
    if (isSpinning) return;

    setIsSpinning(true);

    drawRoulette(
      rouletteRef.current,
      offset,
      randomVelocity(5, 15),
      setResult,
      (newOffset) => {
        setOffset(newOffset);
        setIsSpinning(false);
      }
    );
  };

  return (
    <div className="w-full">
      <div className="relative w-96 aspect-square max-w-full rounded-full bg-white m-auto">
        <div className="absolute rounded-full flex justify-center items-center bg-slate-700 w-1/3 aspect-square inset-0 m-auto text-7xl">
          {result || "No result"}
        </div>
        <Wedge className="absolute inset-x-1/2 -inset-y-4 -translate-x-1/2 -translate-y-4" />
        <canvas
          className="w-full h-full aspect-square"
          ref={rouletteRef}
          width="400"
          height="400"
        />
      </div>
      <button data-filled disabled={isSpinning} onClick={spin}>
        {isSpinning ? "Girando" : "Girar"}
      </button>
    </div>
  );
}
