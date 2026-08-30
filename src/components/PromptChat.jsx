import {useEffect, useRef, useState} from "react";
import Select from 'react-select'
import Message from "./Message.jsx";
import {nanoid} from "nanoid";


export default function PromptChat({models, isDarkMode, url, handleNotification, currentChat,
                                   setChats, chats, newChat, setCurrentChat, selectedModel,
                                   setSelectedModel, apiCallHelper}) {
    useEffect(() => {
        if (!selectedModel?.name && models.length > 0) {
            setSelectedModel(models[0]);
        }
    }, [models]);

    function resetMessageOnFail (newChatId) {
        handleNotification("error", "Could not reach the model");
        setChats(prev => prev.map(c =>
            c.id === newChatId
                ? { ...c, messages: c.messages.slice(0, -1) }   // drop the last message, immutably
                : c
        ));
    }

    const messageRef = useRef(null);
    const textAreaRef = useRef(null);
    const [currentMessage, setCurrentMessage] = useState({
        content: "",
        role: "user",
        id: nanoid(),
    })

    const [isTyping, setIsTyping] = useState(false);
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
            <Message text={message.content} key={message.id} user={message.role} latestMessageRef={messageRef} isLast={isLast} assistant={selectedModel.name}/>
        )
    })

    function updateChats(didMessageSend = null, chat, newMessage) {
        setChats((prevState) => {
            return prevState.map((c) => {
                if (c.id === chat.id) {
                    return {
                        ...c,
                        messages: [...c.messages, newMessage],
                        name: chat.name
                    }
                }
                return c
            })
        })
        if (didMessageSend) {
            setCurrentMessage((prevState) => {
                return {
                    ...prevState,
                    content: "",
                    id: nanoid()
                }
            })
        }
    }

    async function sendMessage(chat, newMessage) {
        console.log("Sending message...")
        try {
            const res = await fetch(url + "/ollama/sendMessage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: [...messages, newMessage],
                    model: selectedModel.name,
                })
            });

            const resData = await res.json();

            if (!resData.success) {
                handleNotification("error", "Model Contact failed: " + res.reason);
                return
            }

            const assistantResponse = {content: resData.reply, role: "assistant", id: nanoid(), assistant: selectedModel.name, chat_id: chat.id}

            try{
                const userMessageRes = await apiCallHelper("chats/createMessage", "POST", null, newMessage);
                if (!userMessageRes.success) return
                const assistantMessageRes = await apiCallHelper("chats/createMessage", "POST", null, assistantResponse);
                if (!assistantMessageRes.success) return
                return {
                    assistantResponse: assistantResponse,
                    success: true
                };
            } catch (e){
                handleNotification("error", `Internal Server error sending message ${e}`)
            }
        } catch (e) {
            console.error(JSON.stringify(e.message))
            resetMessageOnFail(chat.id)
            return false
        }
    }

    async function onSubmit(e) {
        e.preventDefault();
        let chat
        if (currentMessage.content === "" || !selectedModel?.name) {
            handleNotification("error", "Please select a model or add a message")
            return;
        }

        if (currentChat.name === "" && currentChat.id === "") {
            chat = {...newChat(), name: currentMessage.content.slice(0, 20).trim()}
        } else if(currentChat.name === "New chat") {
            chat = {...currentChat, name: currentMessage.content.slice(0, 20).trim()}
            console.log("Current Chat Object: " + JSON.stringify(chat, null, 2))
        } else {
            chat = currentChat
        }

        if (messages.length === 0) {
            try {
                const response = await apiCallHelper("chats/createChat",
                    "POST", null, {id: chat.id, title: chat.name, model: chat.model})
                if (!response.success) return false
            } catch(e) {
                console.log(JSON.stringify(e, null, 2));
                handleNotification("error", "Could not store the new chat");
                return;
            }
        }

        const didMessageSend = await sendMessage(chat, {...currentMessage, chat_id: chat.id});
        updateChats(didMessageSend.success, chat, currentMessage)
        setCurrentChat(prevState => {
            return {
                ...prevState,
                name: chat.name
            }
        })
        updateChats(null, chat, didMessageSend.assistantResponse)
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
                        container: (base) => ({
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