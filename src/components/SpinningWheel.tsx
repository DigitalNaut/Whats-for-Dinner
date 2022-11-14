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

  private wheelCanvas = document.createElement("canvas");
  private decorationsCanvas = document.createElement("canvas");

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

    this.createWheel();
    this.createDecorations();
  }

  createWheel() {
    const wedgeCount = colors.length;
    const wedgeAngle = TAU / wedgeCount;

    colors.forEach((color, index) => {
      const startAngle = index * wedgeAngle;
      const endAngle = startAngle + wedgeAngle;
      const wedge = new Wedge(startAngle, endAngle, color, this.origin);
      this.wedges.push(wedge);
    });

    this.wheelCanvas.width = this.canvas.width;
    this.wheelCanvas.height = this.canvas.height;

    const offscreenContext = this.wheelCanvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D;

    this.wedges.forEach((wedge) =>
      wedge.drawShape(offscreenContext, this.radius - this.margin)
    );
  }

  createDecorations() {
    this.decorationsCanvas.width = this.canvas.width;
    this.decorationsCanvas.height = this.canvas.height;

    const offscreenContext = this.decorationsCanvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D;

    const radialGradientOverlay = this.context.createRadialGradient(
      this.origin.x,
      this.origin.y,
      0,
      this.origin.x,
      this.origin.y,
      this.radius
    );
    radialGradientOverlay.addColorStop(0, "rgba(255, 255, 255, 0.5)");
    radialGradientOverlay.addColorStop(1, "rgba(255, 255, 255, 0)");
    offscreenContext.fillStyle = radialGradientOverlay;
    offscreenContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const radiusPlusOne = this.radius + 1; // Plus one to hide the border artifacts
    offscreenContext.fillStyle = "#1f2937";
    offscreenContext.beginPath();
    offscreenContext.translate(this.origin.x, this.origin.y);
    offscreenContext.moveTo(0, 0);
    // To get point on perimeter, use radius and angle
    // Angle is t(θ)=o/a, so o/a = r/r = 1
    // θ = atan(1) = π/4
    // sin(π/4) = 0.707106 and cos(π/4) = 0.707106
    offscreenContext.lineTo(
      radiusPlusOne * -0.707106,
      radiusPlusOne * 0.707106
    );
    offscreenContext.arcTo(
      0,
      // To get the pivot point, use Pythagoras theorem
      // c = √(a² + b²) = √(r² + r²) = √(2r²) = √(2) * r
      // √(2) = 1.414213
      radiusPlusOne * 1.414213,
      radiusPlusOne * 0.707106,
      radiusPlusOne * 0.707106,
      this.radius
    );
    offscreenContext.fill();
  }

  draw(currentChoice?: number) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let angle = this.spinAngle + this.angleOffset;

    this.context.save();
    this.context.translate(this.origin.x, this.origin.y);
    this.context.rotate(angle);
    this.context.drawImage(this.wheelCanvas, -this.origin.x, -this.origin.y);
    this.context.restore();

    angle += Math.PI / this.maxChoices; // Offset text by half a wedge width

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

    this.context.drawImage(this.decorationsCanvas, 0, 0);
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
    wheelRef.current = new Spinner(
      canvasRef.current,
      {
        x: width * 0.5,
        y: height * 0.5,
      },
      200,
      3,
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
        <div className="absolute w-1/2 aspect-square flex justify-center items-center inset-0 m-auto bg-white p-1 rounded-full overflow-hidden">
          {result ? (
            <img
              className="aspect-square object-cover rounded-full"
              src={result.imageUrl}
            />
          ) : (
            <div className="grid items-center text-center bg-slate-700 text-white aspect-square w-full h-full rounded-full text-8xl font-bangers">
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
        <button
          className="absolute inset-x-1/2 bottom-2 h-fit -translate-x-1/2 -translate-y-1/2 font-bangers text-2xl cursor-pointer bg-red-700 px-4 py-2 rounded-full hover:bg-red-600 disabled:bg-gray-500 disabled:text-gray-400 disabled:cursor-not-allowed "
          disabled={isSpinning}
          onClick={spinTheWheel}
        >
          !Sorpréndeme!
        </button>
      </div>
    </div>
  );
}
