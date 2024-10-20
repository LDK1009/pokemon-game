import React, { useEffect, useState } from "react";
import { getDocs, collection, query, orderBy, limit } from "firebase/firestore";
import { db } from "./firebaseConfig";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { SubmitButton } from "./ImageRevealGame";
import backImg from "./뒤로가기.png";

const Rank = () => {
  const [rank, setRank] = useState([]); // 데이터를 담을 state

  // Firestore에서 데이터를 가져와 state에 저장하는 함수
  const readDocuments = async () => {
    try {
      // Firestore에서 'users' 컬렉션을 'count' 기준 내림차순으로 정렬하여 쿼리
      const q = query(collection(db, "users"), orderBy("count", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ ...doc.data() }); // id와 데이터를 함께 저장
      });
      setRank(usersData); // 데이터를 state에 저장
    } catch (error) {
      console.error("Error fetching documents: ", error);
    }
  };

  // 컴포넌트가 마운트될 때 Firestore에서 데이터를 가져옴
  useEffect(() => {
    readDocuments();
  }, []);

  useEffect(() => {
    console.log(rank);
  }, [rank]);

  const RenderRankCard = rank.map((el, index) => {
    let medal = null;
    let borderColor = null;

    switch (index) {
      case 0:
        medal = "🥇";
        borderColor = "#FFD700";
        break;
      case 1:
        medal = "🥈";
        borderColor = "#C0C0C0";
        break;
      case 2:
        medal = "🥉";
        borderColor = "#CD7F32";
        break;
      default:
        medal = null;
        borderColor = null;
        break;
    }

    return (
      <RankCard borderColor={borderColor}>
        <div style={{width:"150px", height:"30px", lineHeight:"30px", overflow:"hidden"}}>
          {medal} {el.name}
        </div>
        <div>{el.count}</div>
      </RankCard>
    );
  });

  return (
    <Container>
      <GameLink to="/">
        <BackImg src={backImg} />
      </GameLink>
      <h1>🏆 명예의 전당 🏆</h1>
      <RankCardContainer>{RenderRankCard}</RankCardContainer>
      <GameLink to="/game">
        <GameButton>🎮 기록 깨러가기</GameButton>
      </GameLink>
    </Container>
  );
};

export default Rank;

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #ebf5ff;
  position: relative;
`;

const BackImg = styled.img`
  width: 25px;
  height: 25px;
  position: absolute;
  top: 5px;
  left: 5px;
`;

const RankCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 700px;
  margin-top: 20px;
`;

const RankCard = styled.div`
  width: 300px;
  height: 50px;
  border: 3px solid ${(props) => props.borderColor || "#A9A9A9"};
  border-radius: 15px;
  box-sizing: border-box;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
`;

const GameLink = styled(Link)`
  text-decoration: none; /* 밑줄 제거 */
`;

const GameButton = styled(SubmitButton)`
  width: 300px;
  height: 50px;
  font-size: 20px;
  color: white; /* 부모 요소의 텍스트 색상을 따름 */
  border-radius: 15px;
  margin-top: 30px;
`;
