import React from 'react';
import {motion} from "framer-motion";

function Footer(props) {

    function copy(input){

    }

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
                                <span>Nameify</span> uses Spotify's

                                <a href="https://developer.spotify.com/documentation/web-api/reference/get-audio-features">
                                Audio Features
                                </a>

                                to analyze track properties such as 
                                danceability, energy, and

                                <a href="https://en.wikipedia.org/wiki/Valence_(psychology)">
                                valence.
                                </a>

                                The properties are normalized through a
                                <a href="https://en.wikipedia.org/wiki/Quantile_normalization">
                                    percentile distribution
                                </a>and a 

                                <a href="https://en.wikipedia.org/wiki/Sigmoid_function">
                                    sigmoid transform,
                                </a>
                                
                                then passed into
                                <a href="https://platform.openai.com/docs/models">GPT-3.5</a>
                                along with the prompt to generate playlist names.

                                <br/><br/>
                                note: spotify does not allow public accounts to access their API. if you want to use this app, please access a test account: 
                                
                                user: <button onClick={() => {navigator.clipboard.writeText(this.state.textToCopy)}}>31vehuhhrwsmm7mdx6kwdr5lxaca</button> <br/>
                                password: <button onClick={() => {navigator.clipboard.writeText(this.state.textToCopy)}}>/1234567</button>

                            </p>
                        </div>
                        <div className="footer-credits">
                            <h3> created by <a href="https://liaolucas.com">lucas liao</a>. 2023</h3>
                            <div className="github-img-wrapper"> <a href="https://github.com/lucasliao0403/nameify"><img src="/github.png"></img></a> </div>
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}

export default Footer;