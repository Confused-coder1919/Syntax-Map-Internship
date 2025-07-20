import React from "react";
import { Switch, Route } from "react-router-dom"
import './css/App.css';
import './css/CoursePage.css';
import PageCourse from './Component/PageCourse/PageCourse.js';
import PageCourseMod from './Component/PageAdmin/PageCourseMod.js';
import PageLoginRegister from './Component/PageLoginRegister.js';
import PageQuiz from './Component/PageQuiz/PageQuiz.js';
import TenseMap from './Component/PageMap/TenseMap.js'
import CondMap from './Component/PageMap/CondMap.js'
import FutureMap from './Component/PageMap/FutureMap.js'
import ModEdMap from './Component/PageMap/ModEdMap.js'
import ModMap from './Component/PageMap/ModMap.js'
import Home from './Component/Home.js'
import Navbar from './Component/Navbar'
import PageQuestionMod from './Component/PageAdmin/PageQuestionMod.js';
import PageCreatePassword from './Component/PageCreatePassword.js'
import PageNotepad from './Component/PageNotePad/PageNotepad.js'
import PageProfessor from './Component/PageProfessor/PageProfessor.js'
import PageMultiplayer from './Component/PageMultiplayer/PageMultiplayer.js'
import PageLobby from './Component/PageLobby/PageLobby.js'

import ModalDefinition from './Component/ModalDefinition.js'
import { ModalContext }from "./Contexts/ModalContext.js"
import ClientColyseusContextProvider from './Contexts/ClientColyseusContext.js'

class App extends React.Component {
    static contextType = ModalContext;

    constructor(props){
        super(props);
        
        this.state = {
            word: '',
            definition: []
      }
    }

    componentDidMount() {
        const body = document.body;
        const { setOpen } = this.context;

        body.addEventListener('dblclick', e => {
            console.log(window.getSelection().toString());
            const word = window.getSelection().toString();
            if (word.length === 0)
                return;
            fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + word)
            .then(res =>res.json()
            .then((res) => {
                    console.log(res);
                    setOpen();
                    this.setState({word: word, definition: res});
                })
            .catch(err => console.log(err))
            );
            if (localStorage.getItem('jstoken') !== "") {
                fetch(process.env.REACT_APP_API_URL + "/dictionnary",
                  {
                  method: "POST",
                  body: JSON.stringify({
                          word: word,
                          session_name: localStorage.getItem('session')
                  }),
                  headers:
                    {
                        "Content-type": "application/json; charset=UTF-8",
                        "Authorization" : localStorage.getItem('jstoken')}
                    })
                  .then(res =>res.json())
                  .then((res) => {console.log(res);});
            }
        });


        if (!localStorage.getItem("upload") || localStorage.getItem("upload").length === 0) {
            var emptyUploadJson = {upload:[]};
            var emptyDictionnaryJson = {word:[]};
            localStorage.setItem("jstoken","");
            localStorage.setItem("refresh-jstoken","");
            localStorage.setItem("session","");
            localStorage.setItem("upload", JSON.stringify(emptyUploadJson));
            localStorage.setItem("dictionnary", JSON.stringify(emptyDictionnaryJson));
        }
    }
    
    render()  {
    return (
        <div className="App">
            <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate"/>
            <meta httpEquiv="Pragma" content="no-cache"/>
            <meta httpEquiv="Expires" content="0"/>
            <Navbar/>
            <ClientColyseusContextProvider>
                <Switch>
                    <Route exact path="/" component={Home}/>
                    <Route path="/addquestion" component={PageQuestionMod}/>
                    <Route path="/admincourse" component={PageCourseMod}/>

                    <Route path="/professor" component={PageProfessor}/>

                    <Route path="/notepad" component={PageNotepad}/>
                
                    <Route path="/confirmation/:token" component={PageCreatePassword}/>
                    <Route path="/confirmation/" component={PageCreatePassword}/>
                    <Route path="/passwordforgotten/:token" component={PageCreatePassword}/>

                    <Route exact path="/login_register" component={PageLoginRegister}/>
                
                    <Route exact path="/tensemap" component={TenseMap}/>
                    <Route exact path="/map/cond" component={CondMap}/>
                    <Route exact path="/map/future" component={FutureMap}/>
                    <Route exact path="/map/mod" component={ModMap}/>
                    <Route exact path="/map/mod past" component={ModEdMap}/>
                    <Route exact path="/quiz" component={PageQuiz}/>
                
                    <Route exact path="/multiplayer" component={PageMultiplayer}/>
                    <Route exact path="/multiplayer/:id_room" component={PageLobby}/>

                    <Route exact path="/course/:title" component={PageCourse}/>
                    <Route exact path="/quiz/:course" component={PageQuiz}/>

                </Switch>
            </ClientColyseusContextProvider>
            <ModalDefinition word={this.state.word} definition={this.state.definition}/>
        </div>
      );
    }
}

export default App;