import {useEffect, useState} from "react";
import Select from 'react-select'
import Message from "./Message.jsx";
import {nanoid} from "nanoid";


export default function PromptChat({models, isDarkMode}) {
    const [messagesInChat, setMessagesInChat] = useState([])
    const [currentMessage, setCurrentMessage] = useState({
        text: "",
        sender: "user"
    })
    const [selectedModel, setSelectedModel] = useState("Choose Model");
    const [isTyping, setIsTyping] = useState(false);
    const modelOptions = models.map((model) => {
        return {
            label: model.name,
            value: model,
        }
    })

    const messageList = messagesInChat.map((message) => {
        return (
            <Message text={message.text} key={message.id} user={message.sender} />
        )
    })

    useEffect(() => {
        console.log("messages in chat: ", JSON.stringify(messagesInChat, null, 2));
    }, [messagesInChat]);

    useEffect(() => {
        console.log("model chosen: ", selectedModel);
    }, [selectedModel]);
    return (
        <>
            {messagesInChat.length <= 0 ? <header className="prompt-chat__header">
                <h1>Ember AI</h1>
                <p>Welcome to Ember AI, A simple and locally hosted LLM web-app! Enjoy</p>
            </header> :
                <section className="prompt-chat__messages">
                    {messageList}
                </section>
            }


            <form className={isTyping ? "prompt-chat_textarea prompt-chat_textarea__focus" : "prompt-chat_textarea"}
                 style={messagesInChat <= 0 ? {} : {margin: '60px 0 60px 0'}}>
                <textarea className="chat-box"
                          placeholder={"Write a message..."}
                          onFocus={() => setIsTyping( true)}
                          onBlur={() => setIsTyping(false)}
                          value={currentMessage.text}
                          onChange={(e) => {
                              setCurrentMessage((prev) => ({
                                  ...prev,
                                  text: e.target.value,
                              }))
                          }}
                ></textarea>
                <div className={"chat-action-buttons"}>
                    <Select options={modelOptions} styles={{
                        container: (base, state) => ({
                            ...base,
                            width: '40%',
                            outline: 'none'
                        }),
                        singleValue: (base) => ({
                            ...base,
                            color: isDarkMode ? 'var(--dm-accent)' : 'var(--accent)',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '15px'
                        }),
                        dropdownIndicator: (base) => ({
                            ...base,
                            '&:hover': {
                                color: 'var(--secondary)',
                            }
                        }),
                        control: (base, state) => ({
                            ...base,
                            backgroundColor: isDarkMode ? 'var(--dm-neutral)' : 'var(--neutral)',
                            outline: 'none',
                            boxShadow: state.isFocused ? '0 0 0 1px var(--secondary)' : 'none',
                            border: state.isFocused ? '1px solid var(--secondary)' : isDarkMode ? '1px solid var(--dm-border-color)' : '1px solid var(--accent)',
                            '&:hover': {
                                border: '1px solid var(--secondary)',
                            }
                        }),
                        option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused ? 'var(--secondary-75)' : isDarkMode ? 'var(--dm-neutral)' : 'var(--neutral)',
                            color: isDarkMode ? 'var(--dm-accent)' : 'var(--accent)',
                            fontSize: '15px',
                        }),
                        menu: (base) => ({
                            ...base,
                            backgroundColor: isDarkMode ? 'var(--dm-neutral)' : 'var(--neutral)',
                            borderRadius: '0 0 10px 10px',
                            padding: '5px',
                            borderBottom: '1px solid var(--tertiary)',
                        })
                    }} onChange={(selectedOption) => {
                        setSelectedModel(selectedOption.value)
                    }}     noOptionsMessage={() => 'You have no models'}/>
                    <button type={"submit"} className={"general-button success-button"} onClick={(e) => {
                        e.preventDefault();
                        if (currentMessage.text === "" || !selectedModel) {
                            return;
                        }
                        setMessagesInChat((prevState) => {
                            return [...prevState, currentMessage]
                        })
                        setMessagesInChat((prevState) => {
                            return [...prevState, {text: "This is an ai response...", sender: "bot", id: nanoid()}]
                        })
                        setCurrentMessage((prevState) => {
                            return {
                                ...prevState,
                                text: "",
                                id: nanoid()
                            }
                        })
                    }}>Send</button>
                </div>
            </form>
        </>
    )
}