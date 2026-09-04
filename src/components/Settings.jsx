import Themes from "./Themes.jsx";

export default function Settings({setIsDarkMode, setModelLifeCycle, isDarkMode, modelLifeCycle}) {

    return (
            <div className={"page-container"}>
                <div className={"page-header"}>
                    <h1>Settings</h1>
                </div>
                <div className={"button-selection__field"}>
                    <label>Display Mode</label>
                    <div className={"button-selection__container"}>
                        <button className={isDarkMode ? "general-button__selection general-button-selection__clicked" : "general-button__selection"} onClick={() => {
                            setIsDarkMode(true);
                        }}>DarkMode</button>
                        <button className={!isDarkMode ? "general-button__selection general-button-selection__clicked" : "general-button__selection"} onClick={() => {
                            setIsDarkMode(false)
                        }}>LightMode</button>
                    </div>
                </div>
                <div className={"button-selection__field"}>
                    <label>Model life-time</label>
                    <div className={"button-selection__container"}>
                        <button className={modelLifeCycle === "30m" ? "general-button__selection general-button-selection__clicked" : "general-button__selection"} onClick={() => {
                            setModelLifeCycle("30m")
                        }
                        }>30m</button>
                        <button className={modelLifeCycle === "1h" ? "general-button__selection general-button-selection__clicked" : "general-button__selection"} onClick={() => {
                            setModelLifeCycle("1h")
                        }
                        }>1hr</button>
                        <button className={modelLifeCycle === "2h" ? "general-button__selection general-button-selection__clicked" : "general-button__selection"} onClick={() => {
                            setModelLifeCycle("2h")
                        }
                        }>2hr</button>
                    </div>
                </div>
                <Themes setIsDarkMode={setIsDarkMode} />
            </div>
    )
}