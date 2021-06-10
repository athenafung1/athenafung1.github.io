import React, { Component } from 'react'
import styles from '../css/adventures.module.css'

class AdventuresPage extends Component {
    render() {
        return (
            <main id="adventures">
                <section id="header">
                    <h1>my other adventures<hr></hr></h1>
                </section>
                <section id={styles.content}>
                    <p>hi</p>
                </section>
            </main>
        )
    }
}

export default AdventuresPage;