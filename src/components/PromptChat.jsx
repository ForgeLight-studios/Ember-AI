import {useEffect, useRef, useState} from "react";
import Select from 'react-select'
import Message from "./Message.jsx";
import {nanoid} from "nanoid";


export default function PromptChat({models, isDarkMode, url, handleNotification, currentChat, setCurrentChat, setChats, chats }) {
    const messageRef = useRef(null);
    // const messagesInChat = chats.find((chat) => chat && chat.id === currentChat?.id)?.messages ?? [];
    const [currentMessage, setCurrentMessage] = useState({
        text: "",
        sender: "user",
        id: nanoid()
    })

    useEffect(() => {
        console.log("CHATS: " + JSON.stringify(chats, null, 2));
    }, [chats])
    useEffect(() => {
        console.log(`CURRENT CHAT: ${JSON.stringify(currentChat, null, 2 )}`);
    }, [currentChat]);

    const [selectedModel, setSelectedModel] = useState("Choose Model");
    const [isTyping, setIsTyping] = useState(false);
    const modelOptions = models.map((model) => {
        return {
            label: model.name,
            value: model,
        }
    })

    useEffect(() => {
        messageRef.current?.scrollIntoView({behavior: "smooth"});
    }, [chats])

    const messageList = chats.find((chat) => chat && chat.id === currentChat?.id)?.messages.map((message, index) => {
        const length = chats.find((chat) => chat && chat.id === currentChat?.id)?.messages.length;
        const isLast = index === length-1
        return (
            <Message text={message.text} key={message.id} user={message.sender} latestMessageRef={messageRef} isLast={isLast} assistant={message.assistant? "" :  message.assistant}/>
        )
    })

    async function sendMessage(newChatId) {
        try {
            const res = await fetch(url + "/ollama/newChat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: selectedModel.name,
                    message: currentMessage.text,
                })
            });
            const resData = await res.json();
            if (resData.success) {
                console.log("BOT RESPONSE: " + resData.reply);
                setChats((prevState) => {
                    return prevState.map((c) => {
                        if (c.id === newChatId) {
                            return {
                                ...c,
                                messages: [...c.messages, {text: resData.reply, sender: "bot", id: nanoid(), assistant: selectedModel.name}]
                            }
                        }
                        return c
                    })
                })
            }
        } catch (e) {
            console.error(JSON.stringify(e.message))
        }
    }
    return (
        <>
            {!currentChat ? <header className="prompt-chat__header">
                <h1>Ember AI</h1>
                <p>Welcome to Ember AI, A simple and locally hosted LLM web-app! Enjoy</p>
            </header> :
                <section className="prompt-chat__messages">
                    {messageList}
                </section>
            }


            <form className={isTyping ? "prompt-chat_textarea prompt-chat_textarea__focus" : "prompt-chat_textarea"}
                 style={!currentChat ? {} : {margin: '60px 0 60px 0'}}>
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
                    <button type={"submit"} className={"general-button success-button"} onClick={async (e) => {
                        e.preventDefault();
                        if (currentMessage.text === "" || !selectedModel) {
                            handleNotification("error", "Please select a model or add a message")
                            return;
                        }
                        let newChatId
                        if (!currentChat) {
                            newChatId = nanoid();
                            setCurrentChat({
                                name: currentMessage.text.split(" ").splice(0, 8).join(" "),
                                id: newChatId
                            });
                            setChats((prev) => {
                                return [...prev, {
                                    id: newChatId,
                                    name: currentMessage.text.split(" ").splice(0, 8).join(" "),
                                    messages: [currentMessage],
                            }]})
                        } else {
                            newChatId = currentChat.id
                            setChats((prevState) => {
                                return prevState.map((c) => {
                                    if (c.id === currentChat.id) {
                                        return {...c, messages: [...c.messages, currentMessage]};
                                    }
                                    return c;
                                })
                            })
                        }
                        await sendMessage(newChatId)

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