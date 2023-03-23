import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const API_KEY = "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";

function App() {
  const [systemMsg, setSystemMsg] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello! I am ChatGPT!",
      sender: "ChatGPT",
    }
  ])

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing",
    }

    const newMessages = [...messages, newMessage];

    // Update the messages state
    setMessages(newMessages);

    // Set a typing indicator
    setTyping(true);

    // Process message with ChatGPT
    await processMessageToChatGPT(newMessages);
  }

  async function processMessageToChatGPT (chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    const systemMessage = {
      role: "system",
      content: systemMsg
    };

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [systemMessage, ...apiMessages]
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY
      },
      body: JSON.stringify(apiRequestBody),
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT",
      }]);
    });
    setTyping(false);
  }

  return (
    <div className="App">
      <label htmlFor="systemContent" style={{ display: "block", marginBottom: "0.5rem", textAlign: "left" }}>Write any Prompt you want like "Talk like a Pirate." (Optional)</label>
      <textarea
        id="systemContent"
        rows="4"
        cols="50"
        placeholder="You can restrict the chatbot to your liking by writing a prompt. Leave empty for no prompt."
        style={{ marginBottom: "1rem", display: "block" }}
        type="text"
        value={systemMsg}
        onChange={(event) => setSystemMsg(event.target.value)}
      />
      <div style={{ position: "relative", height: "500px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList scrollBehavior="smooth" typingIndicator={ typing ? <TypingIndicator content="ChatGPT is Typing" /> : null } >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App
