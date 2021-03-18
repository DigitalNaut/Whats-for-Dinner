import logo from "./logo.svg";
import "./App.css";
import { useSpring, animated, config } from "react-spring";

function App() {
  const spinFade = useSpring({
    config: { duration: 3000 },
    from: {
      opacity: 1,
      rotate: "0deg",
    },
    to: async (next: (prop: Object) => Promise<void>) => {
      while (true) {
        await next({
          rotate: "360deg",
        });
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
