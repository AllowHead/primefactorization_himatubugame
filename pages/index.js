import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card } from 'react-bootstrap';
import { io } from 'socket.io-client';
import PageHeader from '../components/PageHeader';
import styles from '../styles/Home.module.css';
import Head from 'next/head';

const socket = io();

export default function Index() {

    const [questionS, setQuestionS] = useState('NaN');
    const [answerS, setAnswerS] = useState([]);
    const [numS, setNumS] = useState(0);
    const [nameS, setNameS] = useState('');
    const [lockS, setLockS] = useState(false);

    const [isCollectS, setIsCollectS] = useState(false);
    const errorText = ['', '無効な入力です。数字を入力してください。', '不正解！', '名前の入力が無効です。文字数が不正か、もしくは扱えない文字列を入力している可能性があります。']
    const [errorDisplayS, setErrorDisplayS] = useState(errorText[0])

    const slicer = (num) => {
        return `0${String(num)}`.slice(-2)
    }

    useEffect(() => {
        socket.emit('current_numbers', null, (num) => {
            setQuestionS(num);
        })
        socket.emit('require_answerList', null, (ack) => {
            answerListMaking(ack);
        })
    }, [])

    useEffect(() => {
        socket.on('answer_coming', (data) => {
            answerListMaking(data);
            setQuestionS(data[data.length - 1][3]);
        })
        socket.on('update_question', (num) => {
            setQuestionS(num);
        })
    })


    const collectTimeRef = useRef(0);
    const collectsetting = () => {
        setIsCollectS(true);
        collectTimeRef.current++;
        setTimeout(() => {
            collectTimeRef.current--;
            if (collectTimeRef.current === 0) {
                setIsCollectS(false);
            }
        }, 5000)
    }

    const errorTimeRef = useRef(0);
    const errorsetting = (type) => {
        setErrorDisplayS(errorText[type]);
        errorTimeRef.current++;
        setTimeout(() => {
            errorTimeRef.current--;
            if (errorTimeRef.current === 0) {
                setErrorDisplayS(errorText[0]);
            }
        }, 5000)
    }

    const answerListMaking = (data) => {
        const time = new Date();
        const current = `${slicer(time.getHours())}:${slicer(time.getMinutes())}:${slicer(time.getSeconds())}`
        const newAnswer = data.map((value) => {
            const [answer, nickname, id, question] = value;
            return (
                <div key={`${current}${id}${nickname}${question}${answer}`}>
                    <Card>
                        <Card.Body>
                            <Card.Title>
                                <p>
                                    {nickname}「{answer}」
                                </p>
                            </Card.Title>
                            <Card.Text>
                                <p>{current}{id ? ` | ID:${id}` : null}</p>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </div>
            )
        }).reverse();
        setAnswerS(newAnswer);
    }

    const nameChecker = (name) => {
        const filteringName = name.replace(/[A-z]|[あ-ん]|[ア-ン]|[0-9]|[０-９]/g, '');
        return (filteringName.length === 0) ? name : false;
    }

    const nameConfirm = () => {
        const innerName = nameChecker(nameS);
        if (innerName) {
            socket.emit('name_confirm', innerName, (confirm) => {
                if (confirm) {
                    setLockS(true);
                } else {
                    errorsetting(3);
                }
            });
        } else {
            errorsetting(3);
        }
    }

    const nameChange = () => {
        socket.emit('name_clear', null, (error) => {
            if (error) {
                setLockS(false);
            }
        })
    }

    const numConfirm = () => {
        if (!answerS) {
            errorsetting(1);
        } else {
            socket.emit('answer_number', numS, (correct) => {
                if (correct) {
                    collectsetting();
                } else {
                    errorsetting(2);
                }
            })
        }
    }

    return (
        <div>
            <Head>
                <title>素数</title>
            </Head>
            <PageHeader />
            <div className={styles.wrapper}>
                <h2>問題</h2>
                <h1 className={styles.question}>
                    {questionS}
                </h1>
                <div>
                    <div>
                        {lockS ?
                            <>
                                {nameS}
                                <Button variant='primary' onClick={nameChange}>変更</Button>
                            </>
                            :
                            <>
                                <input type='text' value={nameS} placeholder='名無しさん' onChange={(e) => { setNameS(e.target.value) }} />
                                <Button variant='primary' onClick={nameConfirm}>決定</Button>
                            </>
                        }
                        <p>※ニックネームはひらがなカタカナ英字数字のみ</p>
                    </div>
                </div>
                <div>
                    <input type='number' placeholder='回答入力欄' onChange={(e) => { setNumS(e.target.value) }} />
                    <Button variant='primary' onClick={numConfirm}>送信</Button>
                </div>
                {isCollectS ?
                    <Alert variant='primary'>正解！</Alert>
                    :
                    null
                }
                {errorDisplayS === errorText[0] ?
                    null
                    :
                    <Alert variant='danger'>{errorDisplayS}</Alert>
                }
                <hr />
                <div>
                    <p>履歴は50件まで保存されます。</p>
                    {answerS}
                </div>
            </div>
        </div>
    )
}