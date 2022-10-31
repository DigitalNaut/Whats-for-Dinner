import { ReactComponent as Chopsticks } from "./assets/chopsticks.svg";

function App() {
  return (
    <div
      className="text-white text-center bg-gradient-to-br from-[#5B0B68] to-[#4C1D95] shadow-2xl
      rounded-xl p-12 max-w-screen-md w-screen h-full relative
      before:bg-transparent-geometry before:inset-0 before:absolute before:bg-repeat before:bg-top before:rounded-[inherit] before:pointer-events-none"
    >
      <header className="flex flex-col">
        <h1 className="font-bangers text-4xl sm:text-5xl md:text-6xl [text-shadow:1px_2px_0px_rgba(245,158,11,1)]">
          ¿Qué para comer?
        </h1>
        <Chopsticks className="w-full" />
        <p className="text-amber-500">Building a brand new app</p>
      </header>
    </div>
  );
}

export default App;
