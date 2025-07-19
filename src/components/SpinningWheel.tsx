import { createRef, useEffect, useRef, useState } from "react";

import { type SpinnerEntry } from "src/hooks/useSpinnerMenuContext/types";
import { useLanguageContext } from "src/hooks/useLanguageContext";
import { useSpinnerMenuContext } from "src/hooks/useSpinnerMenuContext";
import SpinnerIcon from "src/components/common/Spinner";

import Arrow from "src/assets/wedge.svg?react";

type SpinningWheelProps = {
  entries?: SpinnerEntry[];
  onSpinEnd?: (result: SpinnerEntry) => void;
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
    public readonly origin: { x: number; y: number },
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
      this.endAngle,
    );
    context.fill();
    context.restore();
  }

  drawText(
    context: CanvasRenderingContext2D,
    text: string,
    radius: number,
    angle: number,
    emphasis: boolean,
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
  private cyclingEntries: SpinnerEntry[];
  private entryCyclingIndex;
  private maxEntries;
  private prevSwapIndex = 0;

  private wheelCanvas = document.createElement("canvas");
  private decorationsCanvas = document.createElement("canvas");

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly origin: { x: number; y: number },
    private readonly radius: number,
    private readonly margin: number,
    private entries: SpinnerEntry[],
  ) {
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.wedges = [];
    this.maxEntries = Math.min(this.entries.length, colors.length);
    this.cyclingEntries = this.entries.slice(0, this.maxEntries);
    this.entryCyclingIndex = this.maxEntries;

    this.createWheel();
    this.createDecorations();
  }

  createWheel() {
    const wedgeCount = Math.min(colors.length, this.entries.length);
    const wedgeAngle = TAU / wedgeCount;

    for (let i = 0; i < this.maxEntries; i++) {
      const wedgeColor = colors[i];
      const startAngle = i * wedgeAngle;
      const endAngle = startAngle + wedgeAngle;
      const wedge = new Wedge(startAngle, endAngle, wedgeColor, this.origin);
      this.wedges.push(wedge);
    }

    this.wheelCanvas.width = this.canvas.width;
    this.wheelCanvas.height = this.canvas.height;

    const offscreenContext = this.wheelCanvas.getContext(
      "2d",
    ) as CanvasRenderingContext2D;

    this.wedges.forEach((wedge) =>
      wedge.drawShape(offscreenContext, this.radius - this.margin),
    );
  }

  createDecorations() {
    this.decorationsCanvas.width = this.canvas.width;
    this.decorationsCanvas.height = this.canvas.height;

    const offscreenContext = this.decorationsCanvas.getContext(
      "2d",
    ) as CanvasRenderingContext2D;

    const radialGradientOverlay = this.context.createRadialGradient(
      this.origin.x,
      this.origin.y,
      0,
      this.origin.x,
      this.origin.y,
      this.radius,
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
      radiusPlusOne * 0.707106,
    );
    offscreenContext.arcTo(
      0,
      // To get the pivot point, use Pythagoras theorem
      // c = √(a² + b²) = √(r² + r²) = √(2r²) = √(2) * r
      // √(2) = 1.414213
      radiusPlusOne * 1.414213,
      radiusPlusOne * 0.707106,
      radiusPlusOne * 0.707106,
      this.radius,
    );
    offscreenContext.fill();
  }

  draw(currentEntryIndex?: number, velocity = 0) {
    if (velocity < 0.1)
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    else this.context.globalAlpha = 1 / (1 + velocity * 5);

    let angle = this.spinAngle + this.angleOffset;

    this.context.save();
    this.context.translate(this.origin.x, this.origin.y);
    this.context.rotate(angle);
    this.context.drawImage(this.wheelCanvas, -this.origin.x, -this.origin.y);
    this.context.restore();

    angle += Math.PI / this.maxEntries; // Offset text by half a wedge width

    // TODO: Optimize this to update only when entries change and blit instead of redrawing
    this.wedges.forEach((wedge, index) => {
      const { label } = this.cyclingEntries[index];
      wedge.drawText(
        this.context,
        label,
        this.radius * 0.75,
        angle,
        index === currentEntryIndex,
      );
    });

    this.context.globalAlpha = 1;
    this.context.drawImage(this.decorationsCanvas, 0, 0);
  }

  getCurrentEntryIndex() {
    const currentIndex =
      (((Math.PI * 3 - this.spinAngle) % TAU) / TAU) * this.maxEntries;

    return Math.floor(currentIndex);
  }

  swapWheelEntries(index: number) {
    if (
      index === this.prevSwapIndex ||
      this.entries.length <= this.wedges.length
    )
      return;

    // Calculate the entry at the opposite end of the wheel
    this.prevSwapIndex = index;
    const insertIndex =
      (index + Math.floor(this.maxEntries * 0.5)) % this.maxEntries;

    // Swap the entry with one at the insert index
    const newEntry = this.entries[this.entryCyclingIndex];
    this.cyclingEntries.splice(insertIndex, 1, newEntry);
    this.entryCyclingIndex = (this.entryCyclingIndex + 1) % this.entries.length;
  }

  spin(
    velocity: number,
    onUpdate?: (result: SpinnerEntry) => void,
    onSpinEnd?: (result: SpinnerEntry) => void,
  ) {
    this.spinAngle = (this.spinAngle + velocity) % TAU;

    const currentEntryIndex = this.getCurrentEntryIndex();

    this.swapWheelEntries(currentEntryIndex);

    const result = this.cyclingEntries[currentEntryIndex];

    if (velocity < 0.25) onUpdate?.(result);
    this.draw(currentEntryIndex, velocity);

    velocity = velocity < 0.005 ? 0 : velocity * 0.95;

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
  entries,
  onSpinEnd,
}: SpinningWheelProps) {
  const { t } = useLanguageContext();
  const { isLoaded } = useSpinnerMenuContext();
  const canvasRef = createRef<HTMLCanvasElement>();
  const wheelRef = useRef<Spinner>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<SpinnerEntry>();

  const cannotSpin = isSpinning || (entries && entries.length <= 0);

  const setupSpinner = (canvas: HTMLCanvasElement, entries: SpinnerEntry[]) => {
    const { width, height } = canvas;
    wheelRef.current = new Spinner(
      canvas,
      {
        x: width * 0.5,
        y: height * 0.5,
      },
      200,
      3,
      entries,
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

    const velocity = randomVelocity(200, 200);

    wheelRef.current?.spin(velocity, setResult, (result) => {
      setIsSpinning(false);
      onSpinEnd?.(result);
    });
  };

  useEffect(() => {
    if (canvasRef.current) setupSpinner(canvasRef.current, entries || []);
    // The canvasRef is never going to change
    // Including it in the dependency array causes unnecessary re-renders & resets the spinner
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  return (
    <div className="w-full">
      <div className="aspect-1 relative m-auto w-96 max-w-full rounded-full bg-white shadow-xl">
        <div className="aspect-1 absolute inset-0 m-auto flex w-1/2 items-center justify-center overflow-hidden rounded-full bg-white p-1">
          {result ? (
            <img
              className="aspect-1 rounded-full object-cover"
              src={result.imageUrl}
            />
          ) : (
            <div className="aspect-1 font-bangers grid size-full items-center rounded-full bg-slate-700 text-center text-8xl text-white">
              {isLoaded ? "?" : <SpinnerIcon text="" />}
            </div>
          )}
        </div>
        <Arrow className="absolute inset-x-1/2 -inset-y-4 -translate-x-1/2 -translate-y-4" />
        <canvas
          className="aspect-1 size-full"
          ref={canvasRef}
          width="400"
          height="400"
        />
        <button
          className="font-bangers absolute inset-x-1/2 bottom-2 size-fit -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-red-700 px-4 py-2 text-2xl whitespace-nowrap hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-400"
          disabled={cannotSpin}
          onClick={spinTheWheel}
        >
          {t("Choose!")}
        </button>
      </div>
    </div>
  );
}
