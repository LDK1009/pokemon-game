import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image, Rect, Circle } from "react-konva";
import useImage from "use-image";
import axios from "axios";
import lodash from "lodash";

const ImageRevealGame = () => {
  const [pokemonData, setPokemonData] = useState([]);
  const [inputValue, setInputValue] = useState(""); // input 값을 관리하는 상태
  const [isCorrect, setIsCorrect] = useState(null); // 정답 여부 관리
  const [current, setCurrent] = useState(0); // 현재 인덱스
  const [circles, setCircles] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const stageRef = useRef(null);

  const [image] = useImage(pokemonData[current]?.src); // 임의의 외부 이미지 URL 사용

  useEffect(() => {
    const fetchData = async () => {
      const allPokemonData = [];
      for (let i = 1; i <= 151; i++) {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${i}`);
        const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${i}`);
        const koreanName = speciesResponse.data.names.find((name) => name.language.name === "ko");
        allPokemonData.push({ ...response.data, korean_name: koreanName.name });
      }

      const needData = lodash.shuffle(allPokemonData).map((el) => {
        return {
          src: el.sprites.front_default,
          name: el.korean_name,
        };
      });

      setPokemonData(needData);
    };

    fetchData();
  }, []);

  // 공통 핸들러: 마우스 클릭 또는 터치 이벤트 처리
  const handlePointerDown = (e) => {
    const stage = stageRef.current;
    const pos = stage.getPointerPosition(); // 현재 마우스 또는 터치 위치 가져오기

    if (clickCount < 10) {
      // 클릭한 좌표에 새로운 원 추가
      setCircles((prevCircles) => [
        ...prevCircles,
        { x: pos.x, y: pos.y, radius: 25 }, // 원의 좌표와 반지름 저장
      ]);
      setClickCount((prev) => prev + 1);
    }
  };

  // input 값 변경 시 호출되는 함수
  const handleInputChange = (e) => {
    setInputValue(e.target.value); // input에 입력된 값을 상태로 저장
  };

  // 제출 버튼 클릭 시 정답 검사하는 함수
  const checkAnswer = () => {
    if (inputValue.trim() === pokemonData[current]?.name) {
      setIsCorrect(true); // 정답인 경우
      setInputValue("");
      setCircles([]);
      setClickCount(0);
      setCorrectCount((prev) => prev + 1);
      setCurrent((prev) => (prev + 1));
    } else {
      setIsCorrect(false); // 오답인 경우
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={{textAlign:"center"}}>베일을 벗겨<br/>포켓몬을 맞춰보세요!</h1>
      <h2>남은 횟수 {10 - clickCount}</h2>
      <h2>맞춘 횟수 {correctCount}</h2>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight * 0.5} // 화면 높이의 30%로 설정
        onMouseDown={handlePointerDown} // 마우스 클릭 시 처리
        onTouchStart={handlePointerDown} // 터치 시 처리
        ref={stageRef}
      >
        <Layer>
          {/* 원본 이미지 출력 */}
          <Image image={image} width={window.innerWidth} height={window.innerHeight * 0.5} />
        </Layer>

        <Layer>
          {/* 검은색 덮개 */}
          <Rect x={0} y={0} width={window.innerWidth} height={window.innerHeight * 0.5} fill="black" />

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

      <div style={styles.inputContainer}>
        <input
          placeholder="정답은?"
          value={inputValue} // input 값 바인딩
          onChange={handleInputChange} // 값 변경 시 상태 업데이트
          style={styles.input}
        />
        <button onClick={checkAnswer} style={styles.button}>제출</button> {/* 제출 버튼 */}
      </div>

      {/* 정답 여부에 따른 메시지 출력 */}
      {isCorrect !== null && (
        <div style={styles.result}>
          {isCorrect ? <p>정답입니다!</p> : <p>오답입니다. 다시 시도하세요.</p>}
        </div>
      )}
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
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "20px",
  },
  input: {
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "2px solid #ccc",
    marginRight: "10px",
    outline: "none",
    transition: "border-color 0.3s",
    width: "200px",
    textAlign: "center",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#007BFF",
    color: "white",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  buttonHover: {
    backgroundColor: "#0056b3",
  },
  result: {
    marginTop: "20px",
    fontSize: "18px",
    fontWeight: "bold",
  },
};

export default ImageRevealGame;
