import React, { Component } from 'react'
import styles from '../css/about.module.css'
import Emoji from './auxiliary/emoji.js'

class AboutPage extends Component {
    render() {
        return (
            <main id="about">
                <section id="header">
                    <h1>about me<hr></hr></h1>
                </section>
                <section id={styles.content}>
                    <p>Hi there! I'm Athena, an undergraduate student studying Computer Science at the University of Illinois at Urbana-Champaign.
                       I'm constantly inspired by the revolutionary advances that humans and technology have made (and are making) in so many different fields of study, and
                       I'd love to one day contribute a positive societial impact as well by building and developing solutions for the present, future, and beyond.
                    </p>
                    <p>
                        <b> At UIUC, I'm involved with ...</b>
                        <ul className={styles.ulNoBullet}>
                            <li className={styles.liPadded}> <Emoji symbol="👩‍💻" label="female with computer"></Emoji> Women in Computer Science (WCS) - Corporate Co-Chair</li>
                            <li className={styles.liPadded}> <Emoji symbol="🧬" label="DNA"></Emoji> Illinois Medical Advancements through Design and Engineering (i-MADE) - GIBuddy Software Engineer</li>
                            <li className={styles.liPadded}> <Emoji symbol="🖥" label="desktop computer"></Emoji> Association for Computing Machinery (ACM)</li>
                            <li className={styles.liPadded}> <Emoji symbol="🐙" label="octopus"></Emoji> Society of Women Engineers (SWE) Team Tech - Machine Learning subteam</li>
                        </ul>
                    </p>
                    <p>
                        <b> At heart, I'm ...</b>
                        <ul className={styles.ulNoBullet}>
                            <li className={styles.liPadded}> <Emoji symbol="☀️" label="heart with stars"></Emoji> a Bay Area native</li>
                            <li className={styles.liPadded}> <Emoji symbol="🦦" label="otter"></Emoji> a huge fan of otters</li>
                            <li className={styles.liPadded}> <Emoji symbol="🌱" label="growing plant"></Emoji> a lifelong learner finding inspiration everywhere</li>
                            {/* <li className={styles.liPadded}> <Emoji symbol="✨" label="sparkles"></Emoji> and the list goes on ... let's have a conversation sometime!</li> */}
                        </ul>
                    </p>
                </section>
            </main>
        )
    }
}

export default AboutPage;