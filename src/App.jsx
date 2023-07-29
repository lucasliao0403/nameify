import {useEffect} from "react";
import useState from 'react-usestateref'
import './App.css';
import axios from 'axios';
import {motion} from "framer-motion";
import {percentileNormalization, avg, sigmoidTransform} from './utils.jsx'
import ParticleBackground from "./particles/ParticleBackground.jsx"
import Footer from "./footer";


function App() {
    const CLIENT_ID = "7977f05d237f4bb5bba138d645ccffb8"
    const REDIRECT_URI = "http://localhost:5173"
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
    const RESPONSE_TYPE = "token"

    const [token, setToken, tokenRef] = useState("")
    const [playlistKey, setPlaylistKey] = useState("")
    const [playlists, setPlaylists] = useState([])
    const [trackData, setTrackData, trackDataRef] = useState([])
    const [tracks, setTracks, tracksRef] = useState([])
    const [acousticness, setAcousticness, acousticnessRef] = useState()
    const [danceability, setDanceability, danceabilityRef] = useState()
    const [valence, setValence, valenceRef] = useState()
    const [energy, setEnergy, energyRef] = useState()
    const [instrumentalness, setInstrumentalness, instrumentalnessRef] = useState()
    const [prompt, setPrompt, promptRef] = useState()
    const [input, setInput, inputRef] = useState('');
    const [generatedNames, setGeneratedNames, generatedNamesRef] = useState([]) // final responses
    const [response, setResponse, responseRef] = useState('');
    const [step, setStep] = useState(0)
    // step 0: login
    // step 1: select playlist
    // step 2: enter genre
    // step 3: returned playlist names
    

    // console.log("step: ", step)

    useEffect(() => {
        const hash = window.location.hash
        let token = window.localStorage.getItem("token")

        if (!token && hash) {
            token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

            window.location.hash = ""
            window.localStorage.setItem("token", token)
        }

        setToken(token)

    }, [])

    useEffect(() => { // ON LOGIN
        if(tokenRef.current) {
            fetchUserPlaylists() 
            setStep(1)
        }
        
    }, [tokenRef.current])



    const logout = () => {
        setStep(0)
        setToken("")
        window.localStorage.removeItem("token")
    }

    async function fetchUserPlaylists()  {

            const {data} = await axios.get("https://api.spotify.com/v1/me/playlists", 
            {
                headers: {
                    Authorization: `Bearer ${tokenRef.current}`
                },
                params: {
                    limit: 50

                }
            }).catch (function (e) {
                console.warn("Authentication error. Please login again.") // TODO: create new function that returns a block of error text on failed login
                logout()
            })
        

        setPlaylists(data.items)
    }

    async function fetchPlaylistData() { 
        var offset = 0;
        var temp = []
        
        // playlistkey example: "https://api.spotify.com/v1/playlists/0Or3Z4tgGlafLh6KZXOmTE/tracks"

        do {
            var {data} = await axios.get(playlistKey, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    offset: offset
                }
            })

            try {setPlaylistKey(data.next)} catch (e) {}
            temp = temp.concat(data.items)
            offset += 100;

        } while (data.next !== null);

        setTracks(temp)
        
        // console.warn("playlist data: ")
        // console.log(tracksRef.current)
        setTrackData([]) // reset track data

        let trackIds = ""
        for (let index = 0; index < tracksRef.current.length; index++) {
            let track = tracksRef.current[index]
        
            try {
            trackIds += track.track.id + ","
            
            if ((index%100 == 99) || (index >= (tracksRef.current.length-1))) {
                await fetchTrackData(trackIds)
                trackIds=""
            }
            
        } catch (e) {}
        }

        // console.warn("track audio data: ")
        // console.log(trackDataRef.current)

    }

    async function fetchTrackData (trackIds) {
        const {data} = await axios.get("https://api.spotify.com/v1/audio-features", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                ids: trackIds
            }
        })
        setTrackData(trackDataRef.current.concat(data.audio_features))
    }

    function analyseTrackData() {
        let input = {acousticness: [], danceability: [], valence: [], energy: [], instrumentalness: []}
        for (let i = 0; i < trackDataRef.current.length; i++) {
            try {
                input.acousticness.push(trackDataRef.current[i].acousticness)
                input.danceability.push(trackDataRef.current[i].danceability)
                input.valence.push(trackDataRef.current[i].valence)
                input.energy.push(trackDataRef.current[i].energy)
                input.instrumentalness.push(trackDataRef.current[i].instrumentalness)
            } catch (e) {
                console.log("null track at index " + i)
            }
        }
        setAcousticness(avg(percentileNormalization(input.acousticness, "acousticness")))
        setDanceability(avg(sigmoidTransform(percentileNormalization(input.danceability, "danceability"), 10, 0.5)))
        setValence(avg(sigmoidTransform(percentileNormalization(input.valence, "valence"), 10, 0.5)))
        setEnergy(avg(sigmoidTransform(percentileNormalization(input.energy, "energy"), 10, 0.5)))
        setInstrumentalness(avg(percentileNormalization(input.instrumentalness, "instrumentalness")))
        
    }
    
    function generatePrompt() {
        setPrompt(`8 creative poetic 2/3-word playlist names: 
        ${acousticnessRef.current}/10 acousticness, 
        ${danceabilityRef.current}/10 danceability, 
        ${valenceRef.current}/10 valence, 
        ${energyRef.current}/10 energy, 
        ${instrumentalnessRef.current}/10 instrumentalness. 
        genre: ${inputRef.current}.
        Do not use genre name. Mood is ${inputRef.current}
        ` )
    }

    function formatResponse() { 
        let formattedArray = responseRef.current.split('\n');
        for (let i = 0; i < formattedArray.length; i++) {
            formattedArray[i] = formattedArray[i].substring(3).replace('"', '').replace('"', '')
        }
        setGeneratedNames(formattedArray)

    }

    async function handleSubmit(e) {
        e.preventDefault()
        await fetchPlaylistData()
        analyseTrackData()
        generatePrompt()
        await handleGenreSubmit()
        formatResponse()
        setInput("")
        setStep(3)
    }

    function handlePlaylistKeyChange (playlist) {
        setPlaylistKey(playlist.tracks.href)
    }

    async function handleGenreSubmit() {
        console.log("prompt: \n" + promptRef.current)
        try {
        
            const result = await axios.post('http://localhost:8000/chatgpt', 
                {input: promptRef.current}
            );
            setResponse(result.data);
        } catch (error) {
            setResponse('An error occurred while processing your request.');
        }

        console.log(responseRef.current)
    };



    const renderPlaylists = () => { // step 1
        return (<div>
            {token ?
            <div className="playlist-page">
                <h3> select a playlist: </h3>
                    <div className="playlist-container">
                        {playlists.map(playlist => (
                        <div key={playlist.id} className="playlist">
                            {playlist.images.length ? 
                                <button className="playlist-button" type="button" onClick={() => handlePlaylistKeyChange(playlist)}>
                                    <img width={"100%"} src={playlist.images[0].url} alt="playlist picture"/> 
                                </button>

                            : <div>No Image</div>}

                            <h2>{playlist.name}</h2>
                        </div>
                        ))}
                    </div>
                    {step==2 ? <button onClick={() => handleSubmit()}>submit</button> : <></>}
                    

            
                <button onClick={() => {
                setStep(2) 
                window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }
                )}}> next </button>
            </div>
            : <></>}
            </div>
        )
            
    }
    
    

    const renderModel = () => { // step 2
        return (
            <div>  
                {token ? 
                <div className="submit">
                    <form onSubmit={handleSubmit} >
                        <div className="submit-query">
                            genre/mood/purpose: <input
                            placeholder="what's it about?"
                            type="text"
                            className="input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            />
                        </div> 
                        <button className="submit-button" type="submit">submit</button>
                    </form>
                    <button className="goback-button" onClick={() => setStep(1)}> go back </button>
                </div>
                : <></>}
            </div>
        );
      };

    const renderResponse = () => { // step 3
        return(
            <div>
                <h3>titles:</h3>
                <div className="responses">
                    {generatedNames.map(name => (
                        <div> {name} </div>
                    ))}
                </div>
                <button className="goback-button" onClick={() => setStep(1)}>do it again</button>
            </div>
        )
    }


    return (
        <div className="app">
            <ParticleBackground/>
            <div className="header" style={step==0?{marginTop: "30vh"}:{marginTop: "3rem"}}>
                {token ? <button onClick={logout}className= "app-logout"> logout</button>: <></>}
            </div>

            <header className="app-header">
                <h1>Name<span>ify</span></h1>

                {step==0 ? <h3><span>a.i.</span> generated playlist names.</h3> : <></>}

                <div className="app-auth">
                    {!token ?
                        <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>
                            <p>login to spotify</p>
                        </a>
                        : <></>}
                </div>

            </header>
            
            {step==1 ? renderPlaylists() : <></>}
            {step==2 ? renderModel() : <></>}
            {step==3 ? renderResponse(): <></>}
            <div/> {/*no idea why this empty div has to be here but it need to be here*/ }
            <motion.img
            style={{ scale: 0.1}}
                src={"/arrow.png"}
                initial={{rotate: 180}}
                whileInView={{ rotate: 0}}
                transition={{duration: .2,}}
            />
            <Footer step={step}/>
            

            
        </div>
    );
}

export default App;