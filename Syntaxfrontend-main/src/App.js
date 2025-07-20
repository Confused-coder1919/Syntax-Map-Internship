import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import "./css/App.css";
import "./css/CoursePage.css";
import PageTenseDetails from "./Component/PageTense/PageTenseDetails.js";
import PageLoginRegister from "./Component/Auth/PageLoginRegister.js";
import PageQuiz from "./Component/PageQuiz/PageQuiz.js";
import ToeicPage from "./Component/PageMap/ToeicPage.js";
import CondMap from "./Component/PageMap/CondMap.js";
import FutureMap from "./Component/PageMap/FutureMap.js";
import ModEdMap from "./Component/PageMap/ModEdMap.js";
import ModMap from "./Component/PageMap/ModMap.js";
import Home from "./Component/Home.js";
import PageNotepad from "./Component/PageNotePad/PageNotepad.js";
import PageProfessor from "./Component/PageProfessor/PageProfessor.js";
import PageAdminTenseMap from "./Component/PageAdmin/PageAdminTenseMap.js";
import AdminUserManagement from "./Component/PageAdmin/AdminUserManagement.js";
import AdminRoleRequests from "./Component/PageAdmin/AdminRoleRequests.js";
import PageContact from "./Component/PageContact.js";
import AdminControlPanel from "./Component/PageAdmin/AdminControlPanel.js";
import QuizBuilder from "./Component/PageAdmin/QuizBuilder.js";
import VocabularyContextProvider from "./Contexts/VocabularyContext";
import ProgressTracker from "./Component/ProgressTracker/ProgressTracker";
import ProtectedRoute from "./protected.route";
import { withRouter } from "react-router-dom";
import { DictionaryContext } from "./Contexts/DictionaryContext.js";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from './Contexts/AuthContext';
import Layout from './Component/Layout/Layout';
import FourOhFour from './Component/404/404';
import PasswordRecovery from './Component/Auth/PasswordRecovery/PasswordRecovery.js';
import AdminAnalytics from "./Component/PageAdmin/AdminAnalytics.js";
import StudentDashboard from "./Component/student/StudentDashboard.js";
import FAQ from "./Component/Support/FAQ.js";
import Feedback from "./Component/Support/Feedback.js";
import HelpCenter from "./Component/Support/HelpCenter.js";
import TenseMapSVG from "./Component/SVGs/TenseMapSVG.js";
import GuestDashboard from "./Component/Guest/GuestDashboard.js";
import TensePreview from "./Component/Guest/TensePreview.js";
import ProgressPreview from "./Component/Guest/ProgressPreview.js";
import QuizPreview from "./Component/Guest/QuizPreview.js";
import RoleRequestPage from "./Component/Guest/RoleRequestPage.js";
import TensePractice from "./Component/PageTense/TensePractice.js";

// Get the backend URL based on environment
const getBackendUrl = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? 'https://syntaxbackend.onrender.com' : 'http://localhost:8000';
};

class App extends React.Component {
  static contextType = DictionaryContext;

  componentDidMount() {
    // Track word lookups in backend if user is logged in
    const { fetchWordMeaning } = this.context;
    const originalFetchWordMeaning = fetchWordMeaning;
    
    // Extend fetchWordMeaning to also log the lookup in the backend
    this.context.fetchWordMeaning = async (word) => {
      // Call the original function to show definition
      originalFetchWordMeaning(word);
      
      // Log the word lookup to backend if user is logged in
      if (localStorage.getItem("jstoken") !== null && localStorage.getItem("jstoken") !== "") {
        try {
          const response = await fetch(`${getBackendUrl()}/dictionnary`, {
            method: "POST",
            body: JSON.stringify({
              word: word,
              session_name: localStorage.getItem("session"),
            }),
            headers: {
              "Content-type": "application/json; charset=UTF-8",
              Authorization: localStorage.getItem("jstoken"),
            },
          });
          const data = await response.json();
          console.log("Word saved to dictionary:", data);
        } catch (error) {
          console.error("Error saving word to dictionary:", error);
        }
      }
    };
  }

  render() {
    return (
      <AuthProvider>
        <div className="App min-h-screen bg-gray-100">
          <meta
            httpEquiv="Cache-Control"
            content="no-cache, no-store, must-revalidate"
          />
          <meta httpEquiv="Pragma" content="no-cache" />
          <meta httpEquiv="Expires" content="0" />
          <Toaster position="top-right" />
          <VocabularyContextProvider>
        
              <Layout>
                <Switch>
                  {/* Public routes */}
                  <Route exact path="/" component={Home} />
                  <Route exact path="/contact" component={PageContact} />
                  <Route path="/reset-password" component={PasswordRecovery} />
                  
                  {/* Admin-only routes - protected with userTypes=[1] */}
                  <ProtectedRoute path="/quizbuilder" component={QuizBuilder} userTypes={[1]} />
                  <ProtectedRoute path="/admintensemap" component={PageAdminTenseMap} userTypes={[1]} />
                  <ProtectedRoute path="/adminusers" component={AdminUserManagement} userTypes={[1]} />
                  <ProtectedRoute path="/admincontrolpanel" component={AdminControlPanel} userTypes={[1]} />
                  <ProtectedRoute path="/adminrolerequests" component={AdminRoleRequests} userTypes={[1]} />
                  <ProtectedRoute path="/adminanalytics" component={AdminAnalytics} userTypes={[1]} />
                  
                  {/* Teacher routes - protected for teachers and admins */}
                  <ProtectedRoute path="/professor" component={PageProfessor} userTypes={[1, 2]} />

                  <ProtectedRoute path="/dashboard" component={StudentDashboard} userTypes={[1,2,3]} />
                  
                  {/* Routes for authenticated users of any role */}
                  <ProtectedRoute path="/profile" component={() => <div />} />
                  <ProtectedRoute path="/progress" component={ProgressTracker} />   
                    <ProtectedRoute path="/tense/:tenseId/progress" 
                    render={({ match }) => <ProgressTracker tenseId={match.params.tenseId} />} 
                  />
                  {/* Guest routes - protected for users with guest role (4) */}
                  <ProtectedRoute path="/guest" exact component={GuestDashboard} userTypes={[4]} />
                  <ProtectedRoute path="/guest/tenses" component={TensePreview} userTypes={[4]} />
                  <ProtectedRoute path="/guest/quizzes" component={QuizPreview} userTypes={[4]} />
                  <ProtectedRoute path="/guest/progress" component={ProgressPreview} userTypes={[4]} />
                  <ProtectedRoute path="/guest/request-role" component={RoleRequestPage} userTypes={[4]} />
                  
                  {/* Public routes */}
                  <Route exact path="/notepad" component={PageNotepad} />
                  
                  <Route exact path="/login_register" component={PageLoginRegister} />
                  <Route exact path="/tensemap" component={TenseMapSVG} />
                  <Route exact path="/toeicpage" component={ToeicPage} />
                  <Route exact path="/map/cond" component={CondMap} />
                  <Route exact path="/map/future" component={FutureMap} />
                  <Route exact path="/map/mod" component={ModMap} />
                  <Route exact path="/map/mod past" component={ModEdMap} />
                  <Route exact path="/quiz" component={PageQuiz} />
                  <Route exact path="/tense/:title" component={PageTenseDetails} /> 
                  <Route exact path="/tense/:tenseId/practice" component={TensePractice} /> 
                  <Route exact path="/quiz/:tense" component={PageQuiz} />
                  <Route exact path="/faq" component={FAQ} />
                  <Route exact path="/feedback" component={Feedback} />
                  <Route exact path="/help-center" component={HelpCenter} />
                  {/* 404 route */}
                  <Route path="/404" component={FourOhFour} />
                  <Redirect to="/404" />
                </Switch>
              </Layout>
            
          </VocabularyContextProvider>
        </div>
      </AuthProvider>
    );
  }
}

export default withRouter(App);
