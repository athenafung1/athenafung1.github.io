import React, { Component } from 'react'
import styles from '../css/projects.module.css'

class ProjectsPage extends Component {
    render() {
        return (
            <main id="projects">
                <section id="header">
                    <h1>my projects<hr></hr></h1>
                </section>
                <section id={styles.content}>
                    <div className={styles.flexContainer}>
                        <div className={styles.projectContent}>
                            <h3>PuzzleBounce Game</h3>
                            <div className={styles.projectDescription}>
                                <p>
                                    A single-player game developed using the C++ Cinder library. 
                                    Player movement is guided by 2D kinematics equations with Earth's gravitational acceleration, 
                                    and collisions within game environment model partial inelastic collisions.
                                </p>
                            </div>
                        </div>
                        <div className={styles.projectContent}>
                            <h3>Naive Bayes Classifier</h3>
                            <div className={styles.projectDescription}>
                                <p>
                                    A probabilistic optical character recognition (OCR) model trained on the MNIST database and a naive Bayes classifier. 
                                    Interface has options to train and validate a model based on  either preloaded or user-inputted image files and prior/feature probabilities.
                                    Also implemented a 28x28 pixel sketchpad using the C++ Cinder library, where a use can draw and classify any image.
                                </p>
                            </div>
                        </div>
                        <div className={styles.projectContent}>
                            <h3>Ideal Gas Simulation</h3>
                            <div className={styles.projectDescription}>
                                <p>
                                    Physics-based project simulating the movement of ideal gas particles: perfect elastic collisions with no net kinetic energy loss. 
                                    Displays histograms depicting the speed distributions of each particle type. Extensible to particles of different radii, mass, and color.
                                </p>
                            </div>
                        </div>
                        <div className={styles.projectContent}>
                            <h3>NutriBuddy</h3>
                            <div className={styles.projectDescription}>
                                <p>
                                    Fall 2020 CS 196: Freshman Honors group project.
                                    An application that recommends a weekly meal and recipe plan based on user's diet and preferences input.
                                    Backend infrastructure leverages the Spoonacular API and supports ETL functionality for determining and presenting the ideal meal plan.
                                    User authentication integrated via the Firebase Realtime Database.
                                </p>
                            </div>
                        </div>
                        <div className={styles.projectContent}>
                            <h3>Rapt</h3>
                            <div className={styles.projectDescription}>
                                <p>
                                    A Chrome extension created with my team during the UIUC WCS Code Ada Hackathon. 
                                    Allows educators and instructors to input lesson check-in questions for any website, 
                                    and uses Google's chrome.alarms API to periodically present those questions for students to answer as they interact.
                                    Won Officer's Best Choice Project.
                                </p>
                                {/* insert tech stack icons */}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        )
    }
}

export default ProjectsPage;