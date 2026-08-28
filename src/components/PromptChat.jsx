import {useEffect, useRef, useState} from "react";
import Select from 'react-select'
import Message from "./Message.jsx";
import {nanoid} from "nanoid";


export default function PromptChat({models, isDarkMode, url, handleNotification, currentChat, setChats, chats, newChat, setCurrentChat}) {
    const messageRef = useRef(null);
    const textAreaRef = useRef(null);
    // const messagesInChat = chats.find((chat) => chat && chat.id === currentChat?.id)?.messages ?? [];
    const [currentMessage, setCurrentMessage] = useState({
        text: "",
        sender: "user",
        id: nanoid()
    })

    const [selectedModel, setSelectedModel] = useState("Choose Model");
    const [isTyping, setIsTyping] = useState(false);
    const modelOptions = models.filter((model) => model.status !== "failed").map((m) => {
        return {
            label: m.name, value: m
        }
    })

    useEffect(() => {
        messageRef.current?.scrollIntoView({behavior: "smooth"});
        textAreaRef.current?.focus()
    }, [chats])

    const messageList = chats.find((chat) => chat && chat.id === currentChat?.id)?.messages.map((message, index) => {
        const length = chats.find((chat) => chat && chat.id === currentChat?.id)?.messages.length;
        const isLast = index === length-1
        return (
            <Message text={message.text} key={message.id} user={message.sender} latestMessageRef={messageRef} isLast={isLast} assistant={message.assistant}/>
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

            if (!resData.success) {
                handleNotification("error", "Model Contact failed: " + res.reason);
                return
            }

            console.log("BOT RESPONSE: " + resData.reply);
            setChats((prevState) => {
                return prevState.map((c) => {
                    if (c.id === newChatId) {
                        return {
                            ...c,
                            messages: [...c.messages, {text: resData.reply, sender: "assistant", id: nanoid(), assistant: selectedModel.name}]
                        }
                    }
                    return c
                })
            })
        } catch (e) {
            console.error(JSON.stringify(e.message))
        }
    }

    async function onSubmit(e) {
        let chatId
        e.preventDefault();
        const newMessage = currentMessage
        setCurrentMessage((prevState) => {
            return {
                ...prevState,
                text: "",
                id: nanoid()
            }
        })
        if (currentMessage.text === "" || !selectedModel?.name) {
            handleNotification("error", "Please select a model or add a message")
            return;
        }

        if (currentChat.name === "" && currentChat.id === "") {
            chatId = newChat()
        } else {
            chatId = currentChat.id
        }

        setChats((prevState) => {
            return prevState.map((c) => {
                if (c.id === chatId) {
                    return {
                        ...c,
                        messages: [...c.messages, newMessage],
                        name: newMessage.text.slice(0, 25).trim()
                    }
                }
                return c
            })
        })

        await sendMessage(chatId)
        setCurrentChat(prevState => {
            return {
                ...prevState,
                name: currentMessage.text.slice(0, 25).trim()
            }
        })
    }

    return (
        <>
            {currentChat.id === "" ? <header className="prompt-chat__header">
                <h1>Ember AI</h1>
                <p>Welcome to Ember AI, A simple and locally hosted LLM web-app! Enjoy</p>
            </header> :
                <section className="prompt-chat__messages">
                    {messageList}
                </section>
            }


            <form onSubmit={(e) => onSubmit(e)} className={isTyping ? "prompt-chat_textarea prompt-chat_textarea__focus" : "prompt-chat_textarea"}
                 style={!currentChat ? {} : {marginBottom: '60px'}}>
                <textarea className="chat-box"
                          placeholder={"Write a message..."}
                          onFocus={() => setIsTyping( true)}
                          onBlur={() => setIsTyping(false)}
                          value={currentMessage.text}
                          ref={textAreaRef}
                          onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();      // stop the newline
                                  onSubmit(e);             // submit instead
                              }
                          }}
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
                        <button type={"submit"} className={"general-button success-button"}>Send</button>
                </div>
            </form>
        </>
    )
}