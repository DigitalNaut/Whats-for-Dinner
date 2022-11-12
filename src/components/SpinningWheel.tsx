import { createRef, useEffect, useRef, useState } from "react";
import { ReactComponent as Arrow } from "src/assets/wedge.svg";

type SpinnerOption = {
  label: string;
  imageUrl: string;
};

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

class Wedge {
  constructor(
    public readonly startAngle: number,
    public readonly endAngle: number,
    public readonly color: string,
    public readonly origin: { x: number; y: number }
  ) {}

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
    radius: number,
    angle: number,
    emphasis: boolean
  ) {
    const x = this.origin.x + radius * Math.cos(angle);
    const y = this.origin.y + radius * Math.sin(angle);

    context.save();
    context.fillStyle = "white";
    context.font = emphasis ? "900 16px Montserrat" : "300 14px Montserrat";
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.translate(x, y);
    context.rotate(angle + Math.PI * 0.5);
    context.fillText(text, 0, 0);
    context.restore();
  }
}

class Spinner {
  private readonly wedges: Wedge[] = [];
  private spinAngle = 0;
  private angleOffset = 0.5 * Math.PI;
  private readonly context: CanvasRenderingContext2D;
  private mutableChoices: SpinnerOption[];
  private replaceIndex;
  private maxChoices;
  private prevResult = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly origin: { x: number; y: number },
    private readonly radius: number,
    private readonly margin: number,
    private choices: SpinnerOption[]
  ) {
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.wedges = [];
    this.maxChoices = Math.min(this.choices.length, colors.length);
    this.mutableChoices = this.choices.slice(0, this.maxChoices);
    this.replaceIndex = this.maxChoices;
  }

  addWedge(wedge: Wedge) {
    this.wedges.push(wedge);
  }

  draw(currentChoice?: number) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let angle = this.spinAngle + this.angleOffset;

    this.wedges.forEach((wedge) =>
      wedge.drawShape(this.context, this.radius - this.margin, angle)
    );

    // Offset by half a wedge width
    angle += Math.PI / this.maxChoices;

    this.wedges.forEach((wedge, index) => {
      const { label } = this.mutableChoices[index];
      wedge.drawText(
        this.context,
        label,
        this.radius * 0.75,
        angle + wedge.startAngle,
        index === currentChoice
      );
    });
  }

  juggleChoices(insertIndex: number) {
    const newChoice = this.choices.slice(
      this.replaceIndex,
      this.replaceIndex + 1
    )[0];
    this.mutableChoices.splice(insertIndex, 1, newChoice);
    this.replaceIndex = (this.replaceIndex + 1) % this.choices.length;
  }

  update() {
    const result = Math.floor(
      (((Math.PI * 3 - this.spinAngle) % TAU) / TAU) * this.maxChoices
    );

    if (result !== this.prevResult) {
      // Calculate the choice at the opposite end of the wheel
      const insertIndex =
        (result + Math.floor(this.maxChoices * 0.5)) % this.maxChoices;
      this.juggleChoices(insertIndex);
    }
    this.prevResult = result;

    return result;
  }

  spin(
    velocity: number,
    onUpdate?: (result: SpinnerOption) => void,
    onSpinEnd?: () => void
  ) {
    this.spinAngle = (this.spinAngle + velocity) % TAU;

    const result = this.update();
    onUpdate?.(this.mutableChoices[result]);
    this.draw(result);

    velocity = velocity < 0.005 ? 0 : velocity * 0.99;

    const animation = requestAnimationFrame(() => {
      // (Circle unit + 180 degrees for the top wedge)
      // - the offset to reverse the numbers
      // + half a wedge width,
      // all % adjusted for 360 degrees, divided by 360 degrees

      if (velocity > 0) {
        this.spin(velocity, onUpdate, onSpinEnd);
      } else {
        cancelAnimationFrame(animation);
        onSpinEnd?.();
      }
    });
  }
}

function createRouletteWheel(
  canvas: HTMLCanvasElement,
  radius: number,
  origin: { x: number; y: number },
  choices: SpinnerOption[]
) {
  const wheel = new Spinner(canvas, origin, radius, 3, choices);

  const wedgeCount = colors.length;
  const wedgeAngle = TAU / wedgeCount;

  colors.forEach((color, index) => {
    const startAngle = index * wedgeAngle;
    const endAngle = startAngle + wedgeAngle;
    const wedge = new Wedge(startAngle, endAngle, color, origin);
    wheel.addWedge(wedge);
  });

  return wheel;
}

type SpinningWheelProps = {
  choices: SpinnerOption[];
};

export default function SpinningWheel({ choices }: SpinningWheelProps) {
  const canvasRef = createRef<HTMLCanvasElement>();
  const wheelRef = useRef<Spinner>();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<SpinnerOption>();

  useEffect(() => {
    if (!canvasRef.current) return;

    const { width, height } = canvasRef.current;
    wheelRef.current = createRouletteWheel(
      canvasRef.current,
      200,
      {
        x: width * 0.5,
        y: height * 0.5,
      },
      choices
    );
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
        <div className="absolute w-full h-full inset-0 m-auto bg-gradient-radial-overlay" />
        <div className="absolute w-1/2 aspect-square flex justify-center items-center inset-0 m-auto bg-white p-1 rounded-full overflow-hidden">
          {result ? (
            <img
              className="aspect-square object-cover rounded-full"
              src={result.imageUrl}
            />
          ) : (
            <div className="grid items-center text-center bg-slate-700 text-white aspect-square w-full h-full rounded-full">
              ?
            </div>
          )}
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
