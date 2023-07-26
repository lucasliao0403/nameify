import {useEffect} from "react";
import useState from 'react-usestateref'
import './App.css';
import axios from 'axios';
import {percentileNormalization, avg, sigmoidTransform} from './utils.jsx'
import Model from './model'


function App() {
    const CLIENT_ID = "7977f05d237f4bb5bba138d645ccffb8"
    const REDIRECT_URI = "http://localhost:5173"
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
    const RESPONSE_TYPE = "token"

    const [token, setToken] = useState("")
    const [playlistKey, setPlaylistKey] = useState("")
    const [playlists, setPlaylists] = useState([])
    const [trackData, setTrackData, trackDataRef] = useState([])
    const [tracks, setTracks, tracksRef] = useState([])
    const [acousticness, setAcousticness, acousticnessRef] = useState()
    const [danceability, setDanceability, danceabilityRef] = useState()
    const [valence, setValence, valenceRef] = useState()
    const [energy, setEnergy, energyRef] = useState()
    const [instrumentalness, setInstrumentalness, instrumentalnessRef] = useState()

    useEffect(() => {
        const hash = window.location.hash
        let token = window.localStorage.getItem("token")

        // getToken()


        if (!token && hash) {
            token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

            window.location.hash = ""
            window.localStorage.setItem("token", token)
        }

        setToken(token)

    }, [])

    const logout = () => {
        setToken("")
        window.localStorage.removeItem("token")
    }

    const fetchUserPlaylists = async (e) => {
        e.preventDefault()

            const {data} = await axios.get("https://api.spotify.com/v1/me/playlists", 
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    limit: 50

                }
            }).catch (function (e) {
                console.warn("Authentication error. Please login again.") // TODO: create new function that returns a block of error text on failed login
                logout()
            })
        

        console.log("user playlists: ")
        console.log(data)
        setPlaylists(data.items)
    }

    function handlePlaylistKeyChange (playlist) {
        setPlaylistKey(playlist.tracks.href)
    }

    const findPlaylist = async () => { 
        // e.preventDefault()

        var offset = 0;
        var temp = []
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
        
        console.warn("playlist data: ")
        console.log(tracksRef.current)
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
        console.warn("track audio data: ")
        console.log(trackDataRef.current)

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

    async function handleSubmit() {
        await findPlaylist()
        analyseTrackData()
    }



    const renderPlaylists = () => {
        return (
            <div>
                <form onSubmit={handleSubmit} >
                    <div className="playlist-container">
                        {playlists.map(playlist => (
                        <div key={playlist.id} className="playlist">
                            {playlist.images.length ? 
                                <button type="button" onClick={() => handlePlaylistKeyChange(playlist)}>
                                    <img width={"100%"} src={playlist.images[0].url} alt="playlist picture"/> 
                                </button>

                            : <div>No Image</div>}
                            {playlist.name}
                        </div>
                        ))}
                    </div>
                    {token ? <button type="submit">submit</button> : <></>}
                    
                </form>
            

            </div>
        )
            
    }

    const renderData = () => {
        return (
            <div>
                 <p> Acousticness: {acousticnessRef.current} </p>
                 <p> Danceability: {danceabilityRef.current} </p>
                 <p> Valence: {valenceRef.current} </p>
                 <p> Energy: {energyRef.current} </p>
                 <p> Instrumentalness: {instrumentalnessRef.current} </p>
            </div>
        )
            
    }




    return (
        <div className="App">
            <header className="App-header">
                <h1>Spotify React</h1>

                <Model/>

                {!token ?
                    <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login
                        to Spotify</a>
                    : <button onClick={logout}>Logout</button>}

                {token ?
                    <button onClick={fetchUserPlaylists}> show playlists </button>
                    : <h2>Please login</h2>
                }

                {renderPlaylists()}
                {renderData()}
            </header>
        </div>
    );
}

export default App;