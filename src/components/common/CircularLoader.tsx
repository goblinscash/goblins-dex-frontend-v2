import React from "react";
import styled from "styled-components";

interface CircularLoaderProps {
  size?: number;
  thickness?: number;
  color?: string;
  fullpage?: boolean;
}

const CircularLoader: React.FC<CircularLoaderProps> = ({
  size = 40,
  thickness = 4,
  color = "#00ff4e",
  fullpage = false,
}) => {
  return (
    <LoaderContainer fullpage={fullpage}>
      <Spinner
        size={size}
        thickness={thickness}
        color={color}
        viewBox="0 0 50 50"
      >
        <circle
          className="path"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth={thickness}
        />
      </Spinner>
    </LoaderContainer>
  );
};

const LoaderContainer = styled.div<{ fullpage: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  
  ${({ fullpage }) =>
    fullpage &&
    `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
  `}
`;

const Spinner = styled.svg<{
  size: number;
  thickness: number;
  color: string;
}>`
  animation: rotate 2s linear infinite;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  
  & .path {
    stroke: ${({ color }) => color};
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }
  
  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
  
  @keyframes dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }
`;

export default CircularLoader; 