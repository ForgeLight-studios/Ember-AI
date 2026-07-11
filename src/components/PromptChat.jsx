import {useState} from "react";

export default function PromptChat() {
    const [isTyping, setIsTyping] = useState(false);

    return (
        <>
            <header className="prompt-chat__header">
                <h1>Ember AI</h1>
                <p>Welcome to Ember AI, A simple and locally hosted LLM web-app! Enjoy</p>
            </header>

            <div className={isTyping ? "prompt-chat_textarea prompt-chat_textarea__focus" : "prompt-chat_textarea"}>
                <textarea className="chat-box"
                      onFocus={() => setIsTyping( true)}
                      onBlur={() => setIsTyping(false)}
                ></textarea>
                <div className={"chat-action-buttons"}>
                    <button className={"general-button success-button"}>Send</button>
                </div>
            </div>
        </>
    )
}