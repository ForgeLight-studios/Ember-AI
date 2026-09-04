import Themes from "./Themes.jsx";

export default function Settings({setIsDarkMode}) {

    return (
            <div className={"page-container"}>
                <div className={"page-header"}>
                    <h1>Settings</h1>
                </div>
                <div className={"button-selection__field"}>
                    <label>Display Mode</label>
                    <div className={"button-selection__container"}>
                        <button className={"general-button__selection"} onClick={() => {
                            setIsDarkMode(true);
                        }}>DarkMode</button>
                        <button className={"general-button__selection"} onClick={() => {
                            setIsDarkMode(false)
                        }}>LightMode</button>
                    </div>
                </div>
                <Themes setIsDarkMode={setIsDarkMode} />
            </div>
    )
}