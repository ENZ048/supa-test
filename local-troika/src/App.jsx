import SupaChatbot from "./SupaChatbot"
import FullScreenBot from "./FullScreenBot"
import Original from "./Original"


function App() {

  return (
    <>
     <SupaChatbot
     chatbotId={"68bec1b89c8c40d6ab428b5d"}
    //  apiBase={"https://api.0804.in/api"}
     apiBase={"http://localhost:5000/api"}
     
     /> 
    // </>
    // <><FullScreenBot
    // chatbotId={"688068d45ba526540d784b24"}
    //  apiBase={"https://api.0804.in/api"}
    // /></>
    // <><Original
    // chatbotId={"688068d45ba526540d784b24"}
    //  apiBase={"https://api.0804.in/api"}
    // /></>
  )
}

export default App
