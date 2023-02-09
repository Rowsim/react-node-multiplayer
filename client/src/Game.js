import { useEffect, useState, Fragment } from 'react';
import classNames from 'classnames';
import { io } from 'socket.io-client';
import KeyPressListener from './utils/KeyPressListener'
import './Game.scss';

export const Game = () => {
    const [playerId, setPlayerId] = useState('');
    const [players, setPlayers] = useState({});
    const [coins, setCoins] = useState({});
    const [chatInput, setChatInput] = useState('');
    const [nameInput, setNameInput] = useState('');
    const [socket, setSocket] = useState();

    useEffect(() => {
        const socket = io('ws://ec2-13-40-214-70.eu-west-2.compute.amazonaws.com:8080');
        setSocket(socket);
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

    const handleSendChat = () => {
        if (!chatInput.trim()) return;
        socket.emit('chatMessage', chatInput);
        setChatInput('');
    };

    const handleSendChatInputKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSendChat();
        }
    };

    const handleChangeName = () => {
        if (!nameInput.trim()) return;
        socket.emit('changeName', nameInput);
        setNameInput('');
    }

    return (
        <Fragment>
            <div className="player-info">
                <div>
                    <label htmlFor="player-name">Your Name</label>
                    <input id="player-name" maxLength="15" type="text" 
                    value={nameInput} 
                    onChange={(e) => setNameInput(e.currentTarget.value)} />
                </div>
                <div>
                    <button id="player-color" onClick={() => handleChangeName()}>Change Name</button>
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
                            {true ?
                                <div className={classNames('Character_chat', {
                                    'visible': player.messages.length > 0,
                                    'hidden': player.messages.length < 1
                                })}>{player.messages[player.messages.length - 1]}</div>
                                : null
                            }
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
            <div className="player-send-chat">
                <input maxLength="60" type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleSendChatInputKeyDown} />
                <button onClick={handleSendChat}>Send</button>
            </div>
        </Fragment>
    )
}