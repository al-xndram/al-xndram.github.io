import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import loadingGif from "../assets/alex-loading.gif";

const fadeOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  animation: ${({ $fading }) => ($fading ? fadeOut : "none")} 0.6s ease forwards;
  pointer-events: ${({ $fading }) => ($fading ? "none" : "auto")};
`;

const Gif = styled.img`
  width: auto;
  max-width: 320px;
`;

export default function LoadingScreen({ onDone }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFading(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Overlay $fading={fading} onAnimationEnd={() => fading && onDone()}>
      <Gif src={loadingGif} alt="Loading" />
    </Overlay>
  );
}
