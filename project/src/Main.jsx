import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { SubmitButton } from "./ImageRevealGame";

const Main = () => {
  return (
    <Container>
      <GameLink to="/game">
        <GameButton>🎮 게임</GameButton>
      </GameLink>
      <RankLink to="/rank">
        <RankButton>🏆 순위</RankButton>
      </RankLink>
    </Container>
  );
};

export default Main;

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const GameLink = styled(Link)`
  text-decoration: none; /* 밑줄 제거 */
`;
const GameButton = styled(SubmitButton)`
  width: 250px;
  height: 250px;
  font-size:30px;
  color: white; /* 부모 요소의 텍스트 색상을 따름 */
  border-radius: 15px;
`;

const RankLink = styled(Link)`
  text-decoration: none; /* 밑줄 제거 */
`;
const RankButton = styled(GameButton)`
  background-color: burlywood;
  color: white; /* 부모 요소의 텍스트 색상을 따름 */
  margin-top: 30px;
`;
