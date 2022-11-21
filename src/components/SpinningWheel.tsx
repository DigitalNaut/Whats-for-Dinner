import { createRef, useEffect, useRef, useState } from "react";

import SpinnerIcon from "src/components/Spinner";
import { useSpinnerMenuContext } from "src/hooks/SpinnerMenuContext";

import { ReactComponent as Arrow } from "src/assets/wedge.svg";

export type SpinnerOption = {
  label: string;
  enabled: boolean;
  imageUrl: string;
};
type SpinningWheelProps = {
  choices?: SpinnerOption[];
  onSpinEnd?: (result: SpinnerOption) => void;
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

  drawShape(context: CanvasRenderingContext2D, radius: number) {
    context.save();
    context.fillStyle = this.color;
    context.beginPath();
    context.moveTo(this.origin.x, this.origin.y);
    context.arc(
      this.origin.x,
      this.origin.y,
      radius,
      this.startAngle,
      this.endAngle
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
    const theta = angle + this.startAngle;
    const x = this.origin.x + radius * Math.cos(theta);
    const y = this.origin.y + radius * Math.sin(theta);

    // TODO: Optimize this to not run on every frame
    const lines: string[] = [];
    if (text.length > 10) {
      const words = text.split(" ");
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const line = currentLine + " " + word;
        if (line.length < 10) currentLine += " " + word;
        else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
    } else lines.push(text);

    context.save();
    context.fillStyle = "white";
    context.font = emphasis ? "900 16px Montserrat" : "300 14px Montserrat";
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.translate(x, y);
    context.rotate(theta + Math.PI * 0.5);
    lines.forEach((line, i) => {
      context.fillText(line, 0, i * 20 - 10 * (lines.length - 1));
    });
    context.restore();
  }
}

class Spinner {
  private readonly wedges: Wedge[] = [];
  private spinAngle = 0;
  private angleOffset = 0.5 * Math.PI;
  private readonly context: CanvasRenderingContext2D;
  private cyclingChoices: SpinnerOption[];
  private cyclingIndex;
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
    this.cyclingChoices = this.choices.slice(0, this.maxChoices);
    this.cyclingIndex = this.maxChoices;

    this.createWheel();
    this.createDecorations();
  }

  createWheel() {
    const wedgeCount = Math.min(colors.length, this.choices.length);
    const wedgeAngle = TAU / wedgeCount;

    for (let i = 0; i < this.maxChoices; i++) {
      const wedgeColor = colors[i];
      const startAngle = i * wedgeAngle;
      const endAngle = startAngle + wedgeAngle;
      const wedge = new Wedge(startAngle, endAngle, wedgeColor, this.origin);
      this.wedges.push(wedge);
    }

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

  draw(currentChoiceIndex?: number, velocity = 0) {
    if (velocity < 0.1)
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    else this.context.globalAlpha = 1 / (1 + velocity * 5);

    let angle = this.spinAngle + this.angleOffset;

    this.context.save();
    this.context.translate(this.origin.x, this.origin.y);
    this.context.rotate(angle);
    this.context.drawImage(this.wheelCanvas, -this.origin.x, -this.origin.y);
    this.context.restore();

    angle += Math.PI / this.maxChoices; // Offset text by half a wedge width

    // TODO: Optimize this to update only when choices change and blit instead of redrawing
    this.wedges.forEach((wedge, index) => {
      const { label } = this.cyclingChoices[index];
      wedge.drawText(
        this.context,
        label,
        this.radius * 0.75,
        angle,
        index === currentChoiceIndex
      );
    });

    this.context.globalAlpha = 1;
    this.context.drawImage(this.decorationsCanvas, 0, 0);
  }

  cycleChoices(insertIndex: number) {
    const newChoice = this.choices.slice(
      this.cyclingIndex,
      this.cyclingIndex + 1
    )[0];
    this.cyclingChoices.splice(insertIndex, 1, newChoice);
    this.cyclingIndex = (this.cyclingIndex + 1) % this.choices.length;
  }

  getCurrentOptionIndex() {
    const index = Math.floor(
      (((Math.PI * 3 - this.spinAngle) % TAU) / TAU) * this.maxChoices
    );
    if (this.choices.length > this.wedges.length && index !== this.prevResult) {
      // Calculate the choice at the opposite end of the wheel
      this.prevResult = index;
      const insertIndex =
        (index + Math.floor(this.maxChoices * 0.5)) % this.maxChoices;
      this.cycleChoices(insertIndex);
    }

    return index;
  }

  spin(
    velocity: number,
    onUpdate?: (result: SpinnerOption) => void,
    onSpinEnd?: (result: SpinnerOption) => void
  ) {
    this.spinAngle = (this.spinAngle + velocity) % TAU;

    const currentOptionIndex = this.getCurrentOptionIndex();
    const result = this.cyclingChoices[currentOptionIndex];

    if (velocity < 0.1) onUpdate?.(result);
    this.draw(currentOptionIndex, velocity);

    velocity = velocity < 0.005 ? 0 : velocity * 0.99;

    const animation = requestAnimationFrame(() => {
      if (velocity > 0) {
        this.spin(velocity, onUpdate, onSpinEnd);
      } else {
        cancelAnimationFrame(animation);
        onSpinEnd?.(result);
      }
    });
  }
}

export default function SpinningWheel({
  choices,
  onSpinEnd,
}: SpinningWheelProps) {
  const { isLoaded } = useSpinnerMenuContext();
  const canvasRef = createRef<HTMLCanvasElement>();
  const wheelRef = useRef<Spinner>();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<SpinnerOption>();
  const cannotSpin = isSpinning || (choices && choices.length <= 0);

  const setupSpinner = (
    canvas: HTMLCanvasElement,
    choices: SpinnerOption[]
  ) => {
    const { width, height } = canvas;
    wheelRef.current = new Spinner(
      canvas,
      {
        x: width * 0.5,
        y: height * 0.5,
      },
      200,
      3,
      choices
    );

    wheelRef.current.draw();
  };

  function randomVelocity(base: number, range: number) {
    return ((Math.random() * range + base) * Math.PI) / 180;
  }

  const spinTheWheel = () => {
    if (cannotSpin) return;

    setIsSpinning(true);
    setResult(undefined);

    const velocity = randomVelocity(100, 10);
    wheelRef.current?.spin(velocity, setResult, (result) => {
      setIsSpinning(false);
      onSpinEnd?.(result);
    });
  };

  useEffect(() => {
    if (canvasRef.current) setupSpinner(canvasRef.current, choices || []);
    // The canvasRef is never going to change
    // Including it in the dependency array causes unnecessary re-renders & resets the spinner
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choices]);

  return (
    <div className="w-full">
      <div className="relative m-auto aspect-square w-96 max-w-full rounded-full bg-white shadow-xl">
        <div className="absolute inset-0 m-auto flex aspect-square w-1/2 items-center justify-center overflow-hidden rounded-full bg-white p-1">
          {result ? (
            <img
              className="aspect-square rounded-full object-cover"
              src={result.imageUrl}
            />
          ) : (
            <div className="grid aspect-square h-full w-full items-center rounded-full bg-slate-700 text-center font-bangers text-8xl text-white">
              {isLoaded ? "?" : <SpinnerIcon text="" />}
            </div>
          )}
        </div>
        <Arrow className="absolute inset-x-1/2 -inset-y-4 -translate-x-1/2 -translate-y-4" />
        <canvas
          className="aspect-square h-full w-full"
          ref={canvasRef}
          width="400"
          height="400"
        />
        <button
          className="absolute inset-x-1/2 bottom-2 h-fit w-fit -translate-x-1/2 -translate-y-1/2 cursor-pointer whitespace-nowrap rounded-full bg-red-700 px-4 py-2 font-bangers text-2xl hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-400"
          disabled={cannotSpin}
          onClick={spinTheWheel}
        >
          ¡Decide!
        </button>
      </div>
    </div>
  );
}
