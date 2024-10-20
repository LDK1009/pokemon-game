import React from 'react';
import { Link } from 'react-router-dom';

const Main = () => {
    return (
        <div>
            <Link to="/game">게임하러 가기</Link>
            <Link to="/rank">순위 보기</Link>
        </div>
    );
};

export default Main;