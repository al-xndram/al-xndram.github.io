import { useState, useCallback, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GlobalStyle from "./styles.js";
import GridOverlay from "./components/GridOverlay.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import Home from "./pages/Home.jsx";
import { FontThemeProvider } from "./context/FontThemeContext.jsx";

function App() {
  const [loading, setLoading] = useState(true);
  const contentReady = useRef(false);
  const timerReady = useRef(false);

  const tryFinish = useCallback(() => {
    if (contentReady.current && timerReady.current) {
      setLoading(false);
    }
  }, []);

  const onContentReady = useCallback(() => {
    contentReady.current = true;
    tryFinish();
  }, [tryFinish]);

  const onTimerReady = useCallback(() => {
    timerReady.current = true;
    tryFinish();
  }, [tryFinish]);

  return (
    <FontThemeProvider>
      <BrowserRouter>
        <GlobalStyle />
        {loading && <LoadingScreen onDone={onTimerReady} />}
        {import.meta.env.DEV && <GridOverlay />}
        <Routes>
          <Route path="/" element={<Home onReady={onContentReady} />} />
        </Routes>
      </BrowserRouter>
    </FontThemeProvider>
  );
}

export default App;
