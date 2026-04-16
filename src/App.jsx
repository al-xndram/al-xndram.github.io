import { BrowserRouter, Routes, Route } from "react-router-dom";
import GlobalStyle from "./styles.js";
import GridOverlay from "./components/GridOverlay.jsx";
import Home from "./pages/Home.jsx";
import { FontThemeProvider } from "./context/FontThemeContext.jsx";

function App() {
  return (
    <FontThemeProvider>
      <BrowserRouter>
        <GlobalStyle />
        {import.meta.env.DEV && <GridOverlay />}
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </FontThemeProvider>
  );
}

export default App;
