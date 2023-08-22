import { useEffect, useRef, useState, createRef } from "react";
import Pusher from "pusher-js";
import {
    CSSTransition,
    TransitionGroup,
} from 'react-transition-group';
import { v4 as uuidv4 } from 'uuid';

function App() {
    const [username, setUsername] = useState('username');
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    let allMessages = [];

    useEffect(() => {
        Pusher.logToConsole = true;

        const pusher = new Pusher('6951f8cb93cbf86d7f65', {
            cluster: 'ap1'
        });

        const channel = pusher.subscribe('chat');
        channel.bind('message', function (data) {
            data.id = uuidv4()
            data.nodeRef = createRef(null)
            allMessages.push(data);
            console.log(data)
            // setMessages(allMessages);
            setMessages((prevState) => [
                ...prevState,
                { username: data.username, message: data.message, nodeRef: createRef(null), id: uuidv4() },
            ]);
        });

        return () => {
            pusher.unsubscribe('chat')
        }
    }, []);

    useEffect(() => {
        console.log('messages', messages)
    }, [messages])

    const submit = async e => {
        e.preventDefault();

        await fetch('http://127.0.0.1:8000/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({
                username,
                message
            })
        });

        setMessage('');
    }

    return (
        <div className="container">
            <div className="d-flex flex-column align-items-stretch flex-shrink-0 bg-white">
                <div
                    className="d-flex align-items-center flex-shrink-0 p-3 link-dark text-decoration-none border-bottom">
                    <input className="fs-5 fw-semibold" value={username}
                        onChange={e => setUsername(e.target.value)} />
                </div>
                <TransitionGroup className="list-group list-group-flush border-bottom scrollarea">
                    {messages.map(({ username, message, nodeRef, id }) => {
                        return (
                            <CSSTransition
                                key={id}
                                nodeRef={nodeRef}
                                timeout={500}
                                classNames="item"
                            >
                                <div key={Math.random()} ref={nodeRef} className="list-group-item list-group-item-action py-3 lh-tight before-transition transition">
                                    <div className="d-flex w-100 align-items-center justify-content-between">
                                        <strong className="mb-1">{username}</strong>
                                    </div>
                                    <div className="col-10 mb-1 small">{message}</div>
                                </div>
                            </CSSTransition>
                        )
                    })}
                </TransitionGroup>
            </div>
            <form onSubmit={e => submit(e)}>
                <input className="form-control" placeholder="Write a message" value={message}
                    onChange={e => setMessage(e.target.value)}
                />
            </form>
        </div>
    );
}

export default App;