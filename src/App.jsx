import {useEffect, useState} from 'react'
import './index.css'
import Header from "./components/Header.jsx";
import PromptChat from "./components/PromptChat.jsx";
import Models from "./components/Models.jsx";
import Themes from "./components/Themes.jsx";

export default function App() {
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
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark-mode");
        } else {
            document.documentElement.classList.remove("dark-mode");
        }
    }, [isDarkMode])


    useEffect(() => {
        console.log(`view changed to ${activeView}`)
    }, [activeView])

    useEffect(() => {
        if (toggleMenuTitle) {
            setToggleMenuTitle(false)
        } else {
            setTimeout(() => {
                setToggleMenuTitle(prev => !prev)
            }, 350)
        }
    }, [isMenuOpen])

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
            <Header isDarkMode={isDarkMode} isOpen={isMenuOpen} toggleTitle={toggleMenuTitle} setIsOpen={setIsMenuOpen} setActiveView={setActiveView} />
            <section className={"main-page"}>
                {activeView === "Home" && <PromptChat models={models} setModels={setModels} isDarkMode={isDarkMode} />}
                {activeView === "Models" && <Models models={models} setModels={setModels}/>}
                {activeView === "Themes" && <Themes setIsDarkMode={setIsDarkMode} />}
            </section>
        </main>

    )
}