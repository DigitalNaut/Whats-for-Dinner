import logo from "./logo.svg";
import "./App.css";
import { SpringConfig, useSpring, animated, config } from "react-spring";

function App() {
  const spinFade = useSpring({
    from: {
      opacity: 1,
      rotate: "0deg",
    },
    to: async (
      next: (
        prop: Object,
        settings: SpringConfig,
        config?: SpringConfig
      ) => Promise<void>
    ) => {
      while (true) {
        await next(
          {
            rotate: "360deg",
            opacity: 1,
          },
          { duration: 3000 },
          config.stiff
        );
      }
    },
    reset: true,
  });
  return (
    <div className="App">
      <header className="App-header">
        <animated.div style={spinFade}>
          <img src={logo} className="App-logo" alt="" />
        </animated.div>
      </header>
    </div>
  );
}

export default App;
