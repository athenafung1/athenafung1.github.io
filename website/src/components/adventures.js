import React, { Component } from 'react'
import styles from '../css/adventures.module.css'
import Carousel from 'react-bootstrap/Carousel';

class AdventuresPage extends Component {
    // constructor(props) {
    //     super(props);
    //     this.showimageSlides = this.showimageSlides.bind(this);
    // }

    // showimageSlides() {
    //     var slideIndex = 0;
    //     var slides = document.getElementsByClassName("imageSlides");
    //     console.log(slides.length)
    //     for (var i = 0; i < slides.length; i++) {
    //         slides[i].style.display = "none";
    //     }
    //     slideIndex++;
    //     if (slideIndex > slides.length) {
    //         slideIndex = 1;
    //     }
    //     console.log(slides.length)
    //     slides[slideIndex - 1].style.display = "block";
    //     setTimeout(this.showimageSlides, 2000);
    // }

    render() {
        return (
            <main id="adventures">
                <section id="header">
                    <h1>my other adventures<hr></hr></h1>
                </section>
                <section id={styles.content}>
                    <div id="App"></div>
                  <Carousel interval={2000}>
                    <Carousel.Item>
                      <div className={styles.imageSlides}>
                          <img className="d-block w-100" className={styles.image} src={process.env.PUBLIC_URL + 'assets/surf.JPG'} alt="surf and waves"></img>
                      </div>
                    </Carousel.Item>
                    <Carousel.Item>
                    <div className={styles.imageSlides}>
                            <img className="d-block w-100" className={styles.image} src={process.env.PUBLIC_URL + 'assets/eclectus_parrot.JPG'} alt="eclectus parrot"></img>
                        </div>
                    </Carousel.Item>
                    <Carousel.Item>
                    <div className={styles.imageSlides}>
                            <img className="d-block w-100" className={styles.image} src={process.env.PUBLIC_URL + 'assets/sausalito.JPG'} alt="sausalito"></img>
                        </div>
                    </Carousel.Item>
                    <Carousel.Item>
                    <div className={styles.imageSlides}>
                            <img className="d-block w-100" className={styles.image} src={process.env.PUBLIC_URL + 'assets/funny_trees.JPG'} alt="funny trees"></img>
                        </div>
                    </Carousel.Item>
                    <Carousel.Item>
                    <div className={styles.imageSlides}>
                            <img className="d-block w-100" className={styles.image} src={process.env.PUBLIC_URL + 'assets/carmel_ocean_left.JPG'} alt="ocean at carmel"></img>
                        </div>
                    </Carousel.Item>
                    <Carousel.Item>
                    <div className={styles.imageSlides}>
                            <img className="d-block w-100" className={styles.image} src={process.env.PUBLIC_URL + 'assets/carmel_ocean_right.JPG'} alt="ocean at carmel"></img>
                        </div>
                    </Carousel.Item>
                    <Carousel.Item>
                    <div className={styles.imageSlides}>
                            <img className="d-block w-100" className={styles.image} src={process.env.PUBLIC_URL + 'assets/palms.JPG'} alt="palm trees"></img>
                        </div>
                    </Carousel.Item>
                    <Carousel.Item>
                    <div className={styles.imageSlides}>
                            <img className="d-block w-100" className={styles.image} src={process.env.PUBLIC_URL + 'assets/cloud_forest.JPG'} alt="cloud forest"></img>
                        </div>
                    </Carousel.Item>
                    <Carousel.Item>
                    <div className={styles.imageSlides}>
                            <img className="d-block w-100" className={styles.image} src={process.env.PUBLIC_URL + 'assets/carmel_landscape.JPG'} alt="carmel landscape"></img>
                        </div>
                    </Carousel.Item>
                    <Carousel.Item>
                    <div className={styles.imageSlides}>
                            <img className="d-block w-100" className={styles.image} src={process.env.PUBLIC_URL + 'assets/snow_landscape.JPG'} alt="snow landscape"></img>
                        </div>
                    </Carousel.Item>
                    <Carousel.Item>
                    <div className={styles.imageSlides}>
                            <img className="d-block w-100" className={styles.image} src={process.env.PUBLIC_URL + 'assets/plant_portrait.JPG'} alt="plant portrait"></img>
                        </div>
                    </Carousel.Item>
                    
                  </Carousel>
                    {/* <div className={styles.imageSlidesContainer}>
                        <div className={styles.imageSlides}>
                            <img className={styles.image} src={process.env.PUBLIC_URL + 'assets/surf.JPG'} alt="surf and waves"></img>
                        </div>
                        <div className={styles.imageSlides}>
                            <img className={styles.image} src={process.env.PUBLIC_URL + 'assets/eclectus_parrot.JPG'} alt="eclectus parrot"></img>
                        </div>
                        <div className={styles.imageSlides}>
                            <img className={styles.image} src={process.env.PUBLIC_URL + 'assets/sausalito.JPG'} alt="sausalito"></img>
                        </div>
                        <div className={styles.imageSlides}>
                            <img className={styles.image} src={process.env.PUBLIC_URL + 'assets/funny_trees.JPG'} alt="funny trees"></img>
                        </div>
                        <div className={styles.imageSlides}>
                            <img className={styles.image} src={process.env.PUBLIC_URL + 'assets/carmel_ocean_left.JPG'} alt="ocean at carmel"></img>
                        </div>
                        <div className={styles.imageSlides}>
                            <img className={styles.image} src={process.env.PUBLIC_URL + 'assets/carmel_ocean_right.JPG'} alt="ocean at carmel"></img>
                        </div>
                        <div className={styles.imageSlides}>
                            <img className={styles.image} src={process.env.PUBLIC_URL + 'assets/palms.JPG'} alt="palm trees"></img>
                        </div>
                        <div className={styles.imageSlides}>
                            <img className={styles.image} src={process.env.PUBLIC_URL + 'assets/cloud_forest.JPG'} alt="cloud forest"></img>
                        </div>
                        <div className={styles.imageSlides}>
                            <img className={styles.image} src={process.env.PUBLIC_URL + 'assets/carmel_landscape.JPG'} alt="carmel landscape"></img>
                        </div>
                        <div className={styles.imageSlides}>
                            <img className={styles.image} src={process.env.PUBLIC_URL + 'assets/snow_landscape.JPG'} alt="snow landscape"></img>
                        </div>
                        <div className={styles.imageSlides}>
                            <img className={styles.image} src={process.env.PUBLIC_URL + 'assets/plant_portrait.JPG'} alt="plant portrait"></img>
                        </div>
                        {this.showimageSlides}
                    </div> */}
                </section>
            </main>
        )
    }
}

export default AdventuresPage;