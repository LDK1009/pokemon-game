import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image, Rect, Circle } from "react-konva";
import useImage from "use-image";
import axios from "axios";
import lodash from "lodash";
import musicPlayImg from "./음악재생중.png";
import musicStopImg from "./음악중지.png";
import { Box, Button, Modal } from "@mui/material";
import styled from "styled-components";
import { db } from "./firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { Link } from "react-router-dom";
import backImg from "./뒤로가기.png";

const ImageRevealGame = () => {
  const [pokemonData, setPokemonData] = useState([]);
  const [inputValue, setInputValue] = useState(""); // input 값을 관리하는 상태
  const [isCorrect, setIsCorrect] = useState(null); // 정답 여부 관리
  const [current, setCurrent] = useState(0); // 현재 인덱스
  const [circles, setCircles] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isHide, setIsHide] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false); // 음악 재생 상태
  const [open, setOpen] = React.useState(false); // 모달창
  const [modalInputValue, setModalInputValue] = useState(""); // input 값을 관리하는 상태

  const stageRef = useRef(null);
  const audioRef = useRef(null); // 오디오 요소 참조

  const [image] = useImage(pokemonData[current]?.src); // 임의의 외부 이미지 URL 사용

  // 데이터 불러오기
  const fetchData = async () => {
    try {
      // 151개 포켓몬의 정보를 병렬로 모두 가져오기
      const pokemonRequests = Array.from({ length: 151 }, (_, i) =>
        axios.get(`https://pokeapi.co/api/v2/pokemon/${i + 1}`)
      );
      const speciesRequests = Array.from({ length: 151 }, (_, i) =>
        axios.get(`https://pokeapi.co/api/v2/pokemon-species/${i + 1}`)
      );

      // 모든 요청이 완료될 때까지 기다림 (병렬로 처리됨)
      const pokemonResponses = await Promise.all(pokemonRequests);
      const speciesResponses = await Promise.all(speciesRequests);

      // 데이터를 정리하여 필요한 정보를 추출
      const allPokemonData = pokemonResponses.map((response, index) => {
        const speciesResponse = speciesResponses[index].data;
        const koreanName = speciesResponse.names.find((name) => name.language.name === "ko");

        return {
          src: response.data.sprites.front_default,
          name: koreanName ? koreanName.name : response.data.name, // 한국 이름이 없을 경우 기본 이름 사용
        };
      });

      // 데이터 섞기 (shuffle) 및 필요한 형태로 변환
      const needData = lodash.shuffle(allPokemonData);

      return needData;
    } catch (error) {
      console.error("Error fetching Pokémon data:", error);
      return [];
    }
  };

  // 음악 재생/정지 토글
  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current.pause(); // 음악 일시 정지
    } else {
      audioRef.current.volume = 0.5; // 볼륨 설정 (0.0 ~ 1.0)
      audioRef.current.play(); // 음악 재생
    }
    setIsPlaying(!isPlaying); // 재생 상태 업데이트
  };

  useEffect(() => {
    const fetchAndSetData = async () => {
      const data = await fetchData();
      setPokemonData(data);
    };

    fetchAndSetData();
  }, []);

  useEffect(() => {
    // console.log(pokemonData);
  }, [pokemonData]);

  // 공통 핸들러: 마우스 클릭 또는 터치 이벤트 처리
  const handlePointerDown = (e) => {
    const stage = stageRef.current;
    const pos = stage.getPointerPosition(); // 현재 마우스 또는 터치 위치 가져오기

    if (clickCount < 10) {
      // 클릭한 좌표에 새로운 원 추가
      setCircles((prevCircles) => [
        ...prevCircles,
        { x: pos.x, y: pos.y, radius: 20 }, // 원의 좌표와 반지름 저장
      ]);
      setClickCount((prev) => prev + 1);
    }
  };

  // input 값 변경 시 호출되는 함수
  const handleInputChange = (e) => {
    setInputValue(e.target.value); // input에 입력된 값을 상태로 저장
  };

  // 모달창 input 값 변경 시 호출되는 함수
  const handleModalInputChange = (e) => {
    setModalInputValue(e.target.value); // input에 입력된 값을 상태로 저장
  };

  // 제출 버튼 클릭 시 정답 검사하는 함수
  const checkAnswer = () => {
    if (inputValue.trim() === pokemonData[current]?.name) {
      setIsCorrect(true); // 정답인 경우
      setInputValue("");
      setCircles([]);
      setClickCount(0);
      setCorrectCount((prev) => prev + 1);
      setCurrent((prev) => prev + 1);
    } else {
      setIsCorrect(false); // 오답인 경우
      if (navigator.vibrate) {
        // 500ms 동안 진동
        navigator.vibrate(500);
      }
    }
  };

  // 다음 문제 버튼 클릭 시
  const nextQuiz = () => {
    setIsHide(false);
    setInputValue(pokemonData[current].name);
    setTimeout(() => {
      setIsHide(true);
      setInputValue("");
      setCircles([]);
      setClickCount(0);
      setCurrent((prev) => prev + 1);
    }, 1500);
  };

  // 모달 열기/닫기
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // 데이터 전송하기
  // Firestore에 새로운 문서 추가
  const upload = async (name, count) => {
    try {
      await addDoc(collection(db, "users"), {
        name,
        count,
      });
      alert("🎉등록완료!");
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div style={styles.container}>
      <BackLink to="/">
        <BackImg src={backImg} />
      </BackLink>
      {/* 오디오 태그 */}
      <audio ref={audioRef} src="/audio.mp3" loop />
      <h1 style={{ textAlign: "center" }}>
        베일을 벗겨
        <br />
        포켓몬을 맞춰보세요!
      </h1>
      <div style={{ width: "350px", display: "flex", justifyContent: "space-between" }}>
        <div>
          <h2>
            <img
              onClick={toggleMusic}
              src={isPlaying ? musicPlayImg : musicStopImg}
              alt="음악"
              style={styles.musicImg}
            />
          </h2>
          <h2>🔍 {10 - clickCount}</h2>
        </div>
        <div>
          <h2 style={{ color: "gray" }}>남은 문제 {pokemonData.length - current + 1}</h2>
          <h2 style={{ color: "blue" }}>맞춘 문제 {correctCount}</h2>
        </div>
      </div>
      <Stage
        width={350}
        height={350} // 화면 높이의 30%로 설정
        onMouseDown={handlePointerDown} // 마우스 클릭 시 처리
        onTouchStart={handlePointerDown} // 터치 시 처리
        ref={stageRef}
      >
        <Layer>
          {/* 원본 이미지 출력 */}
          <Image image={image} width={350} height={350} />
        </Layer>

        <Layer>
          {/* 검은색 덮개 */}
          {isHide && <Rect x={0} y={0} width={350} height={350} fill="black" />}

          {/* 클릭 시 생성된 원을 통해 검은색 덮개 제거 */}
          {circles.map((circle, index) => (
            <Circle
              key={index}
              x={circle.x} // 원의 x 좌표
              y={circle.y} // 원의 y 좌표
              radius={circle.radius} // 원의 반지름
              fill="white" // 원의 색을 흰색으로 지정해 덮개 제거 효과
              globalCompositeOperation="destination-out" // 이 속성으로 해당 영역을 투명하게 만듦
            />
          ))}
        </Layer>
      </Stage>
      <FormContainer>
        {/* 정답 여부에 따른 메시지 출력 */}
        {isCorrect !== null && (
          <div style={styles.result}>{isCorrect ? <p>정답입니다!</p> : <p>오답입니다. 다시 시도하세요.</p>}</div>
        )}
        <div style={styles.inputContainer}>
          <Input
            placeholder="정답은?"
            value={inputValue} // input 값 바인딩
            onChange={handleInputChange} // 값 변경 시 상태 업데이트
          />
          {/* 제출 버튼 */}
          {isHide && (
            <SubmitButton onClick={checkAnswer} style={styles.SubmitButton}>
              제출
            </SubmitButton>
          )}
        </div>
        {/* 모달 버튼 */}
        <UploadModalButton onClick={handleOpen}>등록하기</UploadModalButton>
        {/* 넘기기 버튼 */}
        {isHide && <NextButton onClick={nextQuiz}>모르겠음</NextButton>}

        <Modal open={open} onClose={handleClose}>
          <UploadContainer>
            <h2>
              {modalInputValue ? `${modalInputValue}의` : "내"} 기록 : {correctCount}
            </h2>
            <UploadModalFormWrap>
              <Input
                placeholder="등록할 닉네임을 입력해주세요"
                value={modalInputValue} // input 값 바인딩
                onChange={handleModalInputChange} // 값 변경 시 상태 업데이트
              />
              <UploadButton onClick={() => upload(modalInputValue, correctCount)}>등록</UploadButton>
            </UploadModalFormWrap>
          </UploadContainer>
        </Modal>
      </FormContainer>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    margin: "20px",
    position: "relative",
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "20px",
  },
  result: {
    marginTop: "20px",
    fontSize: "18px",
    fontWeight: "bold",
  },
  musicImg: {
    width: "30px",
    height: "30px",
  },
};

const BackImg = styled.img`
  width: 25px;
  height: 25px;
  position: absolute;
  top: 5px;
  left: 5px;
`;

const BackLink = styled(Link)`
  text-decoration: none; /* 밑줄 제거 */
`;

const Input = styled.input`
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 5px;
  border: 2px solid #ccc;
  margin-right: 10px;
  outline: none;
  transition: border-color 0.3s;
  width: 200px;
  text-align: center;
`;

const FormContainer = styled.div`
  text-align: center;
`;

export const SubmitButton = styled.button`
  display: block;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 5px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  width: 100px;
  &:hover {
    opacity: 0.9;
  }
`;

const UploadModalButton = styled(SubmitButton)`
  width: 350px;
  background-color: burlywood;
  margin-top: 10px;
`;

const NextButton = styled(UploadModalButton)`
  background-color: gray;
`;

const UploadButton = styled(UploadModalButton)`
  width: 100px;
  margin-top: 0px;
`;

const UploadContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  padding: 30px;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const UploadModalFormWrap = styled.div`
  display: flex;
`;

export default ImageRevealGame;
