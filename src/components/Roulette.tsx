import { createRef, useEffect, useRef, useState } from "react";
import { ReactComponent as Arrow } from "src/assets/wedge.svg";

// import history from "src/pages/Main";

const TAU = 2 * Math.PI;

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

class SpinnerWedge {
  private readonly textAngle: number;
  constructor(
    public readonly startAngle: number,
    public readonly endAngle: number,
    public readonly color: string,
    public readonly origin: { x: number; y: number }
  ) {
    this.textAngle = (startAngle + endAngle) * 0.5;
  }

  drawShape(context: CanvasRenderingContext2D, radius: number, angle: number) {
    context.save();
    context.fillStyle = this.color;
    context.beginPath();
    context.moveTo(this.origin.x, this.origin.y);
    context.arc(
      this.origin.x,
      this.origin.y,
      radius,
      this.startAngle + angle,
      this.endAngle + angle
    );
    context.fill();
    context.restore();
  }

  drawText(
    context: CanvasRenderingContext2D,
    text: string,
    origin: { x: number; y: number },
    angle: number
  ) {
    context.save();
    context.fillStyle = "white";
    context.font = "bold 20px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.translate(origin.x, origin.y);
    context.rotate(angle + this.textAngle);
    context.fillText(text, 0, 0);
    context.restore();
  }
}

class SpinnerWheel {
  private readonly wedges: SpinnerWedge[] = [];
  private spinAngle = 0;
  private angleOffset = 0.5 * Math.PI;
  private readonly context: CanvasRenderingContext2D;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly origin: { x: number; y: number },
    private readonly radius: number,
    private readonly margin: number
  ) {
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.wedges = [];
  }

  addWedge(wedge: SpinnerWedge) {
    this.wedges.push(wedge);
  }

  draw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.wedges.forEach((wedge) =>
      wedge.drawShape(
        this.context,
        this.radius - this.margin,
        this.spinAngle + this.angleOffset
      )
    );

    const offset = this.spinAngle + this.angleOffset + Math.PI / colors.length;

    this.wedges.forEach((wedge, index) => {
      const text = (index + 1).toString();
      const theta = wedge.startAngle + offset;
      const x = this.origin.x + this.radius * 0.8 * Math.cos(theta);
      const y = this.origin.y + this.radius * 0.8 * Math.sin(theta);
      wedge.drawText(this.context, text, { x, y }, this.spinAngle);
    });
  }

  spin(
    velocity: number,
    onUpdate?: (result: string) => void,
    onSpinEnd?: () => void
  ) {
    this.spinAngle = (this.spinAngle + velocity) % TAU;
    this.draw();

    velocity = velocity < 0.005 ? 0 : velocity * 0.99;

    const animation = requestAnimationFrame(() => {
      // (Circle unit + 180 degrees for the top wedge)
      // - the offset to reverse the numbers
      // + half a wedge width,
      // all % adjusted for 360 degrees, divided by 360 degrees

      if (onUpdate) {
        const result =
          Math.floor(
            (((Math.PI * 3 - this.spinAngle) % TAU) / TAU) * colors.length
          ) + 1;

        onUpdate(result.toString());
      }

      if (velocity > 0) this.spin(velocity, onUpdate, onSpinEnd);
      else {
        cancelAnimationFrame(animation);
        onSpinEnd?.();
      }
    });
  }
}

function createRouletteWheel(
  canvas: HTMLCanvasElement,
  radius: number,
  origin: { x: number; y: number }
) {
  const wheel = new SpinnerWheel(canvas, origin, radius, 4);

  const wedgeCount = colors.length;
  const wedgeAngle = TAU / wedgeCount;

  colors.forEach((color, index) => {
    const startAngle = index * wedgeAngle;
    const endAngle = startAngle + wedgeAngle;
    const wedge = new SpinnerWedge(startAngle, endAngle, color, origin);
    wheel.addWedge(wedge);
  });

  return wheel;
}

export default function Roulette() {
  const canvasRef = createRef<HTMLCanvasElement>();
  const wheelRef = useRef<SpinnerWheel>();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    if (!canvasRef.current) return;

    wheelRef.current = createRouletteWheel(canvasRef.current, 200, {
      x: canvasRef.current?.width * 0.5,
      y: canvasRef.current?.height * 0.5,
    });
    wheelRef.current.draw();
  }, []);

  function randomVelocity(base: number, range: number) {
    return ((Math.random() * range + base) * Math.PI) / 180;
  }

  const spinTheWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);

    const velocity = randomVelocity(10, 10);
    wheelRef.current?.spin(velocity, setResult, () => {
      setIsSpinning(false);
    });
  };

  return (
    <div className="w-full">
      <div className="relative w-96 aspect-square max-w-full rounded-full bg-white m-auto">
        <div className="absolute rounded-full flex justify-center items-center bg-slate-700 w-1/3 aspect-square inset-0 m-auto text-7xl">
          {result || "No result"}
        </div>
        <Arrow className="absolute inset-x-1/2 -inset-y-4 -translate-x-1/2 -translate-y-4" />
        <canvas
          className="w-full h-full aspect-square"
          ref={canvasRef}
          width="400"
          height="400"
        />
      </div>
      <button data-filled disabled={isSpinning} onClick={spinTheWheel}>
        {isSpinning ? "Girando" : "Girar"}
      </button>
    </div>
  );
}
