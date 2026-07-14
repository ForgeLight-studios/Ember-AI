import {useEffect, useState} from 'react'
import './index.css'
import Header from "./components/Header.jsx";
import PromptChat from "./components/PromptChat.jsx";
import Models from "./components/Models.jsx";
import Themes from "./components/Themes.jsx";
import {nanoid} from "nanoid";
import Notifications from "./components/Notifications.jsx";

export default function App() {
    const api_url = "http://localhost:3100"
    const [progress, setProgress] = useState({
        completed: 0,
        total: 0,
    });
    const [status, setStatus] = useState("Starting");
    const [isModelPulling, setIsModelPulling] = useState(false);
    const [models, setModels] = useState([
        {
            name: "llama3.2",
            description: "general chatting"
        }
    ]);
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

    const [notification, setNotification] = useState([]);


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


    async function pullModel(e, setAddModelDescription, setAddModel, addModel, addModelDescription) {
        e.preventDefault();
        setIsModelPulling(true);
        setStatus("Starting");
        setAddModelDescription("");
        setAddModel("")
        const model = {
            name: addModel,
            description: addModelDescription,
        }

        if (!addModel || !addModelDescription) {
            console.log("Mak sure all fields are entered!!!")
            setStatus("Please make sure all fields are entered!");
            return;
        }

        try {
            const response = await fetch(api_url + "/api/models/pull", {
                method: "POST",
                body: JSON.stringify({
                    model: addModel,
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            })

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
            console.log(e.message)
            return;
        }

        setModels((prevModels) => [...prevModels, model]);
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
            <Header isDarkMode={isDarkMode} isOpen={isMenuOpen} toggleTitle={toggleMenuTitle} setIsOpen={setIsMenuOpen} setActiveView={setActiveView} />
            <section className={"main-page"}>
                {activeView === "Home" && <PromptChat models={models} setModels={setModels}
                                                      isDarkMode={isDarkMode} url={api_url}/>}
                {activeView === "Models" && <Models models={models} setModels={setModels}
                                                    api_url={api_url} pullModel={pullModel}
                                                    status={status} progress={progress}
                                                    isModelPulling={isModelPulling} />}
                {activeView === "Themes" && <Themes setIsDarkMode={setIsDarkMode} />}
            </section>
        </main>

    )
}