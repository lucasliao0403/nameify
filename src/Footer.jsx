import React from 'react';
import {motion} from "framer-motion";

function Footer(props) {
    return (
        <motion.div 
        className="about"
        initial={{ x: 0 , y: -300, opacity: -1}}
        whileInView={{ x: 0 , y: 0, opacity: 1}}
        transition={{ duration: .8, delay: 0}}
        >
            <div className="footer" style={props.step==1?{bottom: "-700px"}:{bottom:"-300px"}}>
                <div className="footer-container">
                    <div>
                        <div className="footer-outline">
                            <h2> How does it work? </h2>
                            <p> 
                                <span>Nameify</span> uses Spotify's&nbsp;

                                <a href="https://developer.spotify.com/documentation/web-api/reference/get-audio-features">
                                Audio Features
                                </a>

                                &nbsp;to analyze track properties such as 
                                danceability, energy, and&nbsp;

                                <a href="https://en.wikipedia.org/wiki/Valence_(psychology)">
                                valence
                                </a>.

                                The properties are normalized through a&nbsp;
                                <a href="https://en.wikipedia.org/wiki/Quantile_normalization">
                                    percentile distribution
                                </a> and a&nbsp; 

                                <a href="https://en.wikipedia.org/wiki/Sigmoid_function">
                                    sigmoid transform
                                </a>,
                                
                                then passed into&nbsp;
                                <a href="https://platform.openai.com/docs/models">GPT-3.5</a>
                                &nbsp;along with the prompt to generate playlist names.

                            </p>
                        </div>
                        <h3> created by <a href="https://liaolucas.com">lucas liao</a>. 2023</h3>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}

export default Footer;