import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Container, Nav, Navbar, NavbarBrand, OverlayTrigger, Popover } from 'react-bootstrap';
import { Mention } from 'react-twitter-widgets';
import styles from '../styles/PageHeader.module.css'

const PageHeader = (props) => {
    const [browserLanguage, setBrowserLanguage] = useState('en');

    useEffect(() => {
        setBrowserLanguage(window.navigator.language);
    }, []);

    const HowToPlay = (
        <Popover>
            <Popover.Header as='h3'>
                <div className={styles.setCenter}>
                    素数を当てましょう！
                </div>
            </Popover.Header>
            <Popover.Body>
                <p className={styles.inText}>3〜499のランダムに選ばれた素数を複数個組み合わせた合成数が問題として出題されます。問題の約数となる素数を見つけ出し、回答入力欄に入力して送信しましょう。</p>
                <p className={styles.inText}>解けたところで何か報酬があるわけでもないので、暇つぶし程度に遊んでいってください。素因数分解を行ってくれるウェブサイトを使えば一瞬で答えが分かりますが、風情が無いので出来れば自力で頑張るようお願いします。</p>
                <p className={styles.inText}>なおこのインフォは"あそびかた"のところをもう一回クリックすると消せます。</p>
            </Popover.Body>
        </Popover>
    );

    const WhatIsThisSite = (
        <Popover>
            <Popover.Header as='h3'>
                <div className={styles.setCenter}>
                    試験的に作られたサイトです。
                </div>
            </Popover.Header>
            <Popover.Body>
                <div className={styles.setCenter}>
                    <p className={styles.inText}>このサイトはnext.jsとsocket.ioの学習のために、@allowerosがテストで作ったものです。なのでバグが存在したり、あるいは何らかのエラーによってある日突然アクセスできなくなったり、といった不具合が発生する可能性があります。</p>
                    <p className={styles.inText}>もし質問がございましたり、不具合が発生したりしましたら、製作者のTwitterまでご連絡ください。絶対に対応しますと約束はできませんが、対応可能な範囲であれば対応します。</p>
                    <Mention username='alloweros' options={{ lang: browserLanguage }} />
                    <p className={styles.inText}>なおこのインフォは"このサイトについて"のところをもう一回クリックすると消せます。</p>
                </div>
            </Popover.Body>
        </Popover>
    );

    return (
        <header>
            <Navbar fixed='top' bg='dark' variant='dark'>
                <Container>
                    <NavbarBrand href='/'>
                        <div className={styles.noneSelected}>
                            素数発見ゲーム
                        </div>
                    </NavbarBrand>
                    <Nav>
                        <OverlayTrigger trigger="click" placement="auto" overlay={HowToPlay}>
                            <Nav.Link>
                                <div className={styles.noneSelected}>
                                    あそびかた
                                </div>
                            </Nav.Link>
                        </OverlayTrigger>
                        <OverlayTrigger trigger="click" placement='bottom-start' overlay={WhatIsThisSite}>
                            <Nav.Link>
                                <div className={styles.noneSelected}>
                                    このサイトについて
                                </div>
                            </Nav.Link>
                        </OverlayTrigger>
                    </Nav>
                </Container>
            </Navbar>
        </header>
    )
}

export default PageHeader;