import logo from "./logo.svg";
import "./tailwind.output.css";
import { useSpring, animated } from "react-spring";

function App() {
  const spin = useSpring({
    config: {
      velocity: 2,
      friction: 0.15,
      tension: 0,
    },
    from: {
      rotate: "0deg",
    },
    to: async (next: (prop: Object) => Promise<void>) => {
      while (true) {
        await next({
          rotate: "360deg",
        });
      }
    },
    reset: false,
  });
  return (
    <div className="App">
      <header className="App-header">
        <animated.div style={spin}>
          <img src={logo} className="App-logo" alt="" />
        </animated.div>
      </header>
      <div className="max-w-md mx-auto flex p-6 bg-gray-100 mt-10 rounded-lg shadow-xl">
        <div className="ml-6 pt-1">
          <h1 className="text-2xl text-blue-700 leading-tight">
            Tailwind and Create React App
          </h1>
          <p className="text-base text-gray-700 leading-normal">
            Building apps together
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
