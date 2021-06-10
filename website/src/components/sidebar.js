import React, { Component } from 'react'
import styles from '../css/sidebar.module.css'

class Sidebar extends Component {
    render() {
        return (
            <div className={styles.sidebar}>
                <aside>
                    <nav className="sections">
                        <div id={styles.header}>
                            <a href="#home" className={styles.button}><b>Athena Fung</b></a>
                        </div>
                        <div id={styles.navigationBar}>
                            <ul className={styles.ulNoBullet}>
                                <li><a href="#about" className={styles.button}>about</a></li>
                                <li><a href="#projects" className={styles.button}>projects</a></li>
                            </ul>
                        </div>
                    </nav>
                    <nav className={styles.iconLinks}>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
                        <a href="mailto:affung2@illinois.edu" className={styles.dynamicIcon}>
                            <i className="fa fa-envelope-o"></i></a>
                        <a href="https://github.com/athenafung1" className={styles.dynamicIcon}>
                            <i className="fa fa-github"></i></a>
                        <a href="https://www.linkedin.com/in/athenafung1" className={styles.dynamicIcon}>
                            <i className="fa fa-linkedin-square"></i></a>
                    </nav>
                </aside>
            </div>
        )
    }
}

export default Sidebar;