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