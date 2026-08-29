import {useEffect, useRef, useState} from "react";
import Select from 'react-select'
import Message from "./Message.jsx";
import {nanoid} from "nanoid";


export default function PromptChat({models, isDarkMode, url, handleNotification, currentChat,
                                   setChats, chats, newChat, setCurrentChat, selectedModel,
                                   setSelectedModel}) {

    useEffect(() => {
        if (!selectedModel?.name && models.length > 0) {
            setSelectedModel(models[0]);
        }
    }, [models]);

    const messageRef = useRef(null);
    const textAreaRef = useRef(null);
    // const messagesInChat = chats.find((chat) => chat && chat.id === currentChat?.id)?.messages ?? [];
    const [currentMessage, setCurrentMessage] = useState({
        content: "",
        role: "user",
        id: nanoid()
    })

    const [isTyping, setIsTyping] = useState(false);
    // const [messages, setMessages] = useState(chats.find(c => c && c.id === currentChat?.id)?.messages ?? []);
    const messages = chats.find(c => c && c.id === currentChat?.id)?.messages ?? [];
    const modelOptions = models.filter((model) => model.status !== "failed").map((m) => {
        return {
            label: m.name, value: m
        }
    })

    useEffect(() => {
        console.log("Chats: " + JSON.stringify(chats, null, 2));
        console.log("Current messages: " + JSON.stringify(currentChat, null, 2));
    }, [chats])

    useEffect(() => {
        messageRef.current?.scrollIntoView({behavior: "smooth"});
        textAreaRef.current?.focus()
    }, [chats])

    const messageList = messages?.map((message, index) => {
        const length = messages.length;
        const isLast = index === length-1
        return (
            <Message text={message.content} key={message.id} user={message.role} latestMessageRef={messageRef} isLast={isLast} assistant={message.assistant}/>
        )
    })

    async function sendMessage(newChatId, updatedMessages) {
        try {
            const res = await fetch(url + "/ollama/sendMessage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: selectedModel.name,
                    messages: updatedMessages,
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
                            messages: [...c.messages, {content: resData.reply, role: "assistant", id: nanoid(), assistant: selectedModel.name}]
                        }
                    }
                    return c
                })
            })
        } catch (e) {
            console.error(JSON.stringify(e.message))
            handleNotification("error", "Could not reach the model");
            setChats(prev => prev.map(c =>
                c.id === newChatId
                    ? { ...c, messages: c.messages.slice(0, -1) }   // drop the last message, immutably
                    : c
            ));
            messages.slice(0, -1)
        }
    }

    async function onSubmit(e) {
        let chatId
        e.preventDefault();
        const newMessage = currentMessage
        setCurrentMessage((prevState) => {
            return {
                ...prevState,
                content: "",
                id: nanoid()
            }
        })
        if (currentMessage.content === "" || !selectedModel?.name) {
            handleNotification("error", "Please select a model or add a message")
            return;
        }

        if (currentChat.name === "" && currentChat.id === "") {
            chatId = newChat()
        } else {
            chatId = currentChat.id
        }

        const updatedMessages = [...messages, newMessage];

        setChats((prevState) => {
            return prevState.map((c) => {
                if (c.id === chatId) {
                    return {
                        ...c,
                        messages: updatedMessages,
                        name: newMessage.content.slice(0, 20).trim()
                    }
                }
                return c
            })
        })

        await sendMessage(chatId, updatedMessages)
        setCurrentChat(prevState => {
            return {
                ...prevState,
                name: currentMessage.content.slice(0, 20).trim()
            }
        })
    }

    return (
        <>
            {(currentChat.name === "New chat" || currentChat.name === "") ? <header className="prompt-chat__header">
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
                          value={currentMessage.content}
                          ref={textAreaRef}
                          onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  onSubmit(e);
                              }
                          }}
                          onChange={(e) => {
                              setCurrentMessage((prev) => ({
                                  ...prev,
                                  content: e.target.value,
                              }))
                          }}
                ></textarea>
                <div className={"chat-action-buttons"}>
                    <Select options={modelOptions}
                            isDisabled={messages.length > 0}
                            value={modelOptions.find(o => o.value.name === selectedModel?.name) ?? null}
                            styles={{
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