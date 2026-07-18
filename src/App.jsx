import {useEffect, useRef, useState} from 'react'
import './index.css'
import Header from "./components/Header.jsx";
import PromptChat from "./components/PromptChat.jsx";
import Models from "./components/Models.jsx";
import Themes from "./components/Themes.jsx";
import {nanoid} from "nanoid";
import Notifications from "./components/Notifications.jsx";

export default function App() {

    const [models, setModels] = useState([]);
    const [chats, setChats] = useState([]);
    const [currentChat, setCurrentChat] = useState("");


    const [notification, setNotification] = useState([]);
    function handleNotification(type, message) {
        const id = nanoid();

        setNotification(prev => [...prev, { id, type, message, active: false }]);

        // allow browser to paint the element first, then trigger transition
        setTimeout(() => {
            setNotification(prev => prev.map(n => n.id === id ? { ...n, active: true } : n));
        }, 10);

        setTimeout(() => {
            setNotification(prev => prev.map(n => n.id === id ? { ...n, active: false } : n));
        }, 3000);

        // remove from DOM after the transition has finished
        setTimeout(() => {
            setNotification(prev => prev.filter(n => n.id !== id));
        }, 3400); // 3500 + transition duration
    }

    const api_url = "http://localhost:3100"

    async function apiCallHelper(route, type, params = null, body = null) {
        console.log(`[apiCall] ${type} ${route}`);

        if (!route || !type) {
            handleNotification("error", "Internal error occurred");
            return { success: false };
        }

        const allowedTypes = ["POST", "PATCH", "DELETE"];
        const needsBody = allowedTypes.includes(type);
        if (needsBody && body === null) {
            handleNotification("error", "Internal error occurred");
            return { success: false };
        }

        const fullUrl = params?.length
            ? `${api_url}/${route}/${params.join()}`
            : `${api_url}/${route}`;
        const fetchObject = {
            method: type,
            ...(body !== null && {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })
        };

        try {
            const response = await fetch(fullUrl, fetchObject)

            if (!response) {
                handleNotification("error", `Unsupported method: ${type}`);
                return { success: false };
            }
            const resData = await response.json();
            if (!response.ok) {
                handleNotification("error", `Could not perform request, reason:\n${resData.reason}`)
                return {success: false}
            }
            return resData;
        } catch (e) {
            handleNotification("error", `Internal error occurred: ${e}`);
            return {
              success: false,
            }
        }
    }

    const [progress, setProgress] = useState({
        completed: 0,
        total: 0,
    });
    const [status, setStatus] = useState("Starting");
    const [isModelPulling, setIsModelPulling] = useState(false);
    const [activeView, setActiveView] = useState("Home");
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [toggleMenuTitle, setToggleMenuTitle] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
        if (darkMode) {
            return true
        } else {
            return false
        }
    });

    const didLoad = useRef(false);

    useEffect(() => {
        if (didLoad.current) return;
        didLoad.current = true;

        async function loadModels() {
            handleNotification("notice", "Loading models")
            const resData = await apiCallHelper("model/allmodels", "GET");
            if (resData.success) {
                setModels(resData.models);
            }
        }
        loadModels()
    }, [])

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark-mode");
        } else {
            document.documentElement.classList.remove("dark-mode");
        }
    }, [isDarkMode])

    useEffect(() => {
        if (toggleMenuTitle) {
            setToggleMenuTitle(false)
        } else {
            setTimeout(() => {
                setToggleMenuTitle(prev => !prev)
            }, 350)
        }
    }, [isMenuOpen])

    async function pullModel(e, setAddModelDescription, setAddModel, addModel, addModelDescription) {
        e.preventDefault();

        if (!addModel || !addModelDescription) {
            console.log("Mak sure all fields are entered!!!")
            setStatus("Please make sure all fields are entered!");
            return;
        }
        const model = {
            name: addModel,
            description: addModelDescription,
        }
        const resData = await apiCallHelper("model/create", "POST", null, {name: addModel, description: addModelDescription, status: "pulling"});
        model.status = "pulling"
        setModels((prevModels) => [...prevModels, model]);
        console.log(JSON.stringify(resData));
        if (!resData.success) {
            handleNotification("error", `could not saveModel to database`);
            return;
        }

        setIsModelPulling(true);
        setStatus("Starting");
        setAddModelDescription("");
        setAddModel("")

        try {
            const response = await apiCallHelper("model/create", "POST", null, {model: addModel})
            // const response = await fetch(api_url + "/ollama/pull", {
            //     method: "POST",
            //     body: JSON.stringify({
            //         model: addModel,
            //     }),
            //     headers: {
            //         "Content-Type": "application/json"
            //     }
            // })
            if (!response.ok) {
                setStatus(`Error status code: ${response.status}`);
                console.error(response.reason);
                setTimeout(() => {
                    setIsModelPulling(false);
                }, 3000)
                return;
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const {done, value} = await reader.read();
                // stops the loop if the stream is done
                if (done) {
                    setStatus("Successfully retrieved!");
                    handleNotification("notify", `Model: ${addModel} has been installed successfully!`);
                    const resData = await apiCallHelper("model/status", "PATCH", null, {name: addModel, status: "installed"});
                    model.status = "installed"
                    setModels((prevModels) =>
                        prevModels.map(m =>
                            m.name === model.name ? { ...m, status: "installed" } : m
                        )
                    );
                    if (!resData.success) {
                        handleNotification("error", `could not saveModel to database`);
                        return;
                    }
                    break;
                }

                // adds the decoded value to the buffer
                buffer += decoder.decode(value, { stream: true });
                // splits the buffer at newlines so they can be seperated
                const events = buffer.split("\n\n");
                // removes the first item from the event loop and assigns the value to buffer
                buffer = events.pop()
                for (const event of events) {
                    const trimmed = event.trim();
                    if (!trimmed.startsWith("data: ")) continue;
                    // removes the 'data: ' prefix so it can be parsed as json
                    const chunk = JSON.parse(trimmed.slice(6));

                    setStatus(chunk.status);

                    if (chunk.total && chunk.completed) {
                        setProgress({
                            completed: chunk.completed ?? 0,
                            total: chunk.total,
                        })
                    }
                }
            }
        } catch (e) {
            setStatus(e.message)
            setTimeout(() => {
                setIsModelPulling(false);
            }, 3000)
            const resData = await apiCallHelper("model/status", "PATCH", null, {name: addModel, status: "failed"});
            model.status = "failed";
            setModels((prevModels) =>
                prevModels.map(m =>
                    m.name === model.name ? { ...m, status: "failed" } : m
                )
            );
            if (!resData.success) {
                handleNotification("error", `could not saveModel to database`);
                return;
            }
            console.log(e.message)
            return;
        }
        console.log("Added model " + JSON.stringify({
            name: addModel,
            description: addModelDescription,
        }, null, 2));
        setTimeout(() => {
            setIsModelPulling(false);
        }, 3000)
    }

    const savedTheme = JSON.parse(localStorage.getItem("theme"));
    !savedTheme && localStorage.setItem("theme", JSON.stringify({
        name: "Sparkr Original",
        colour: {
            secondary: "#FF8C42",
            tertiary: "#CC5803",
            secondary75: "#FF8C4275",
            tertiary75: "#CC580375",
        }
    }));
    useEffect(() => {
        if (savedTheme) {
            document.documentElement.style.setProperty("--secondary", savedTheme.colour.secondary);
            document.documentElement.style.setProperty("--tertiary", savedTheme.colour.tertiary);
            document.documentElement.style.setProperty("--secondary-75", savedTheme.colour.secondary75);
            document.documentElement.style.setProperty("--tertiary-75", savedTheme.colour.tertiary75);

            document.documentElement.style.setProperty("--dm-secondary", savedTheme.colour.secondary);
            document.documentElement.style.setProperty("--dm-tertiary", savedTheme.colour.tertiary);
            document.documentElement.style.setProperty("--dm-secondary-75", savedTheme.colour.secondary75);
            document.documentElement.style.setProperty("--dm-tertiary-75", savedTheme.colour.tertiary75);
        }
    }, []);

    return (

        <main>
            <Notifications notification={notification} setNotification={setNotification} />
            <Header isDarkMode={isDarkMode} isOpen={isMenuOpen} toggleTitle={toggleMenuTitle}
                    setIsOpen={setIsMenuOpen} setActiveView={setActiveView} chats={chats} />
            <section className={"main-page"}>
                {activeView === "Home"  && <PromptChat models={models} setModels={setModels}
                                                      isDarkMode={isDarkMode} url={api_url}
                                                      handleNotification={handleNotification} setChats={setChats} chats={chats}
                                                      currentChat={currentChat} setCurrentChat={setCurrentChat} />}
                {activeView === "Models" && <Models models={models} setModels={setModels}
                                                    api_url={api_url} pullModel={pullModel}
                                                    status={status} progress={progress}
                                                    isModelPulling={isModelPulling} apiCallHelper={apiCallHelper}/>}
                {activeView === "Themes" && <Themes setIsDarkMode={setIsDarkMode} />}
            </section>
        </main>

    )
}