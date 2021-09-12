const express = require('express');
const next = require('next');
const socketio = require('socket.io')();

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const port = process.env.PORT || 3000

const randomDice = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
}


const prime = (num) => {
    let innerNum = num;

    if (innerNum > 10000000 || innerNum < -10000000) {
        console.warn('処理しようとしている数値が巨大なため、処理を終了しました');
        return false;
    }

    if (innerNum === 1 || innerNum === -1) {
        console.warn('1は素数ではありません');
        return [1];
    }
    if (innerNum === 0) {
        console.warn('0は素数ではありません');
        return [0];
    }
    if (innerNum <= -2) {
        console.warn('数値が負の数のため、自動的に自然数に変換されました');
        innerNum *= -1;
    }

    //エラトステネスの篩のアルゴリズムを使用
    let boolList = [];
    for (let i = 0; i < innerNum; i++) {
        boolList[i] = true;
    }
    boolList[0] = false;
    boolList[1] = false;

    const maxNum = Math.floor(Math.sqrt(innerNum));
    let primeIndexList = [];
    for (let i = 0; i < maxNum; i++) {
        if (boolList[i]) {
            primeIndexList.push(i);
            boolList[i] = false;
            for (let ib = i ** 2; ib < innerNum; ib += i) {
                boolList[ib] = false;
            }
        }
    }
    boolList.forEach((value, index) => {
        if (value) {
            primeIndexList.push(index);
        }
    })
    return primeIndexList;
}

let targetPrime = prime(randomDice(100, 500));

const makeNumber = () => {
    console.log('素数リスト:', targetPrime);

    let primelist = [];
    let num = 1;

    while (String(num).length <= 10) {
        const primeIndex = Math.floor(Math.random() * (targetPrime.length));
        primelist.push(targetPrime[primeIndex]);
        num *= targetPrime[primeIndex];
    }
    return [primelist, num];
}

app.prepare().then(() => {
    const server = express();

    server.post('/chat', (req, res) => {
        console.log('body', req.body)
        postIO(req.body)
        res.status(200).json({ message: 'success' })
    })

    server.all('*', async (req, res) => {
        return handle(req, res)
    })

    const httpServer = server.listen(port, (err) => {
        if (err) throw err
        console.log(`> ローカルホスト、ポート${port}番にサーバーを作成しました - env ${process.env.NODE_ENV}`)
    })

    const io = socketio.listen(httpServer)
    let clientList = {}

    let numbers = makeNumber();

    let answerNumbers = [];
    let questionNumber = numbers[1];
    let firstNum = numbers[1]

    const resetNumber = () => {
        targetPrime = prime(randomDice(100, 500));
        numbers = makeNumber();
        questionNumber = numbers[1];
        firstNum = numbers[1]
    }

    io.on('connection', (socket) => {
        console.log('クライアントid:' + socket.id + 'が接続しました');
        console.log(`総接続人数 :`, io.eio.clientsCount);

        clientList[socket.id] = {
            nickName: null,
        }

        socket.on('current_numbers', (none, ack) => {
            ack(questionNumber);
        });

        socket.on('answer_number', (num, ack) => {
            const innerNum = Number(num);
            if (isNaN(innerNum)) {
                ack(false);
                return;
            }

            const isCorrect = numbers[0].map((value) => {
                return value === innerNum;
            }).includes(true);

            ack(isCorrect);

            if (isCorrect) {
                numbers[0].splice(numbers[0].indexOf(innerNum), 1);
                questionNumber /= innerNum;
                const socketname = (clientList[socket.id].nickName === null) ? '名無しさん' : clientList[socket.id].nickName;
                answerNumbers.push([num, socketname, socket.id, questionNumber])

                if (answerNumbers.length >= 31) {
                    answerNumbers.shift();
                }

                if (questionNumber === 1) {
                    answerNumbers.push([firstNum, '答えが求まりました！', null, questionNumber])
                    resetNumber();
                }
                io.emit('answer_coming', answerNumbers)
                io.emit('update_question', questionNumber)
            }
        })

        socket.on('require_answerList', (none, ack) => {
            ack(answerNumbers);
        })

        socket.on('name_confirm', (name, ack) => {
            const innerName = String(name);
            if (innerName.length >= 20 || innerName.length <= 0) {
                ack(false);
            } else {
                clientList[socket.id].nickName = innerName;
                ack(true);
            }
        })

        socket.on('name_clear', (none, ack) => {
            clientList[socket.id].nickName = null;
            ack(true);
        })

        socket.on("disconnect", (reason) => {
            console.log(`${socket.id}が退出しました`)
            delete clientList[socket.id];
        })

    })

    const postIO = (data) => {
        io.emit('update-data', data)
    }
})
    .catch((ex) => {
        console.error(ex.stack)
        process.exit(1)
    })
