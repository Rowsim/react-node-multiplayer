import { useEffect, useState, Fragment } from 'react';
import classNames from 'classnames';
import { io } from 'socket.io-client';
import KeyPressListener from './utils/KeyPressListener'
import './Game.scss';

export const Game = () => {
    const [playerId, setPlayerId] = useState('');
    const [players, setPlayers] = useState({});
    const [coins, setCoins] = useState({});

    useEffect(() => {
        const socket = io('ws://ec2-18-130-212-104.eu-west-2.compute.amazonaws.com:8080');
        socket.on("connect", () => {
            setPlayerId(socket.id);
        });
        socket.on("gameState", (state) => {
            const gameState = JSON.parse(state);
            setPlayers(gameState.players);
            setCoins(gameState.coins);
        });

        const handleKeydown = (keyCode) => {
            socket.emit('keydown', keyCode);
        }
        const keyUpListener = new KeyPressListener('ArrowUp', () => handleKeydown('ArrowUp'));
        const keyDownListener = new KeyPressListener('ArrowDown', () => handleKeydown('ArrowDown'));
        const keyLeftListener = new KeyPressListener('ArrowLeft', () => handleKeydown('ArrowLeft'));
        const keyRightListener = new KeyPressListener('ArrowRight', () => handleKeydown('ArrowRight'));

        return () => {
            keyUpListener.unbind();
            keyDownListener.unbind();
            keyLeftListener.unbind();
            keyRightListener.unbind();
        };
    }, []);

    return (
        <Fragment>
            <div className="player-info">
                <div>
                    <label htmlFor="player-name">Your Name</label>
                    <input id="player-name" maxLength="10" type="text" />
                </div>
                <div>
                    <button id="player-color">Change Skin</button>
                </div>
            </div>
            <div className='game-container'>
                {Object.entries(players).map(([id, player]) => {
                    const { x, y, color, direction, name, coins } = player;
                    const left = 16 * x + "px";
                    const top = 16 * y - 4 + "px";
                    return (
                        <div
                            key={id}
                            data-color={color}
                            data-direction={direction}
                            style={{ transform: `translate3d(${left}, ${top}, 0)` }}
                            className={classNames('Character grid-cell', {
                                'you': id === playerId
                            })}>
                            <div className="Character_shadow grid-cell" />
                            <div className="Character_sprite grid-cell" />
                            <div className="Character_name-container">
                                <span className="Character_name">{name}</span>
                                <span className="Character_coins">{coins}</span>
                            </div>
                            <div className="Character_you-arrow grid-cell" />
                        </div>)
                })}
                {Object.keys(coins).map((coinKey) => {
                    const [x, y] = coinKey.split('x');
                    const left = 16 * x + 'px';
                    const top = 16 * y - 4 + 'px';
                    return (
                        <div key={`coin-${coinKey}`} className='Coin grid-cell' style={{ transform: `translate3d(${left}, ${top}, 0)` }}>
                            <div className='Coin_shadow grid-cell' />
                            <div className='Coin_sprite grid-cell' />
                        </div>
                    )
                })}
            </div>
        </Fragment>
    )
}