import {useEffect} from "react";
import useState from 'react-usestateref'
import './App.css';
import axios from 'axios';

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

        const {data} = await axios.get("https://api.spotify.com/v1/me/playlists", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                limit: 50

            }
        })

        console.log("user playlists: ")
        console.log(data)
        setPlaylists(data.items)
    }

    function handlePlaylistKeyChange (playlist) {
        setPlaylistKey(playlist.tracks.href)
    }

    const findPlaylist = async (e) => { // TODO: take playlistKey and find playlist
        e.preventDefault()

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

        var trackIds = ""

        console.warn("playlist data: ")
        console.log(tracksRef.current)

        for (let index = 0; index < tracksRef.current.length; index++) {
            let track = tracksRef.current[index]
        
            try {
            trackIds += track.track.id + ","
            // console.log("index:" + index + " trackids:" + trackIds)
            
            if ((index%100 == 99) || (index >= (tracksRef.current.length-1))) {
                // console.warn("CALLED at index: " + index)
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



    const renderPlaylists = () => {
        return (
            <div>
                <form onSubmit={findPlaylist} >
                    {playlists.map(playlist => (
                    <div key={playlist.id}>
                        {playlist.images.length ? 
                            <button type="button" onClick={() => handlePlaylistKeyChange(playlist)}>
                                <img width={"100%"} src={playlist.images[0].url} alt="playlist picture"/> 
                            </button>

                        : <div>No Image</div>}
                        {playlist.name}
                    </div>
                    ))}
                    {token ? <button type="submit">submit</button> : <></>}
                    
                </form>
            </div>
        )
            
    }

    const renderTracks = () => {
        return (
            <div>
                {tracks.map(track => (
                    track.track !== null ? // spotify has null tracks in playlists apparently
                <div key={track.track.id}>
                    {track.track.name}
                </div>
                : <></>
                ))}    
            </div>
        )
            
    }




    return (
        <div className="App">
            <header className="App-header">
                <h1>Spotify React</h1>
                {!token ?
                    <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login
                        to Spotify</a>
                    : <button onClick={logout}>Logout</button>}

                {token ?
                    <button onClick={fetchUserPlaylists}> show playlists </button>
                    : <h2>Please login</h2>
                }

                {renderPlaylists()}
                {renderTracks()}
            </header>
        </div>
    );
}

export default App;