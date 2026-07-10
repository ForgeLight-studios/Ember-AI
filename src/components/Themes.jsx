import {useState} from "react";

export default function Themes (){

    const storedTheme = localStorage.getItem("theme");

    const themes = [
        {
            name: "Sparkr Original",
            colour: {
                secondary: "#FF8C42",
                tertiary: "#CC5803",
                secondary75: "#FF8C4275",
                tertiary75: "#CC580375",
            },
        },
        {
            name: "Midnight Sapphire",
            colour: {
                secondary: "#2f5dff",
                tertiary: "#001f99",
                secondary75: "#2f5dff75",
                tertiary75: "#001f9975",
            },
        },
        {
            name: "Crimson Ember",
            colour: {
                secondary: "#ff4d4d",
                tertiary: "#b30000",
                secondary75: "#ff4d4d75",
                tertiary75: "#b3000075",
            },
        },
        {
            name: "Arctic Cyan",
            colour: {
                secondary: "#42d7ff",
                tertiary: "#0288a8",
                secondary75: "#42d7ff75",
                tertiary75: "#0288a875",
            },
        },
        {
            name: "Copper Flame",
            colour: {
                secondary: "#ff7a42",
                tertiary: "#b34700",
                secondary75: "#ff7a4275",
                tertiary75: "#b3470075",
            },
        },
        {
            name: "Emerald Depths",
            colour: {
                secondary: "#2ecc71",
                tertiary: "#0b7a3e",
                secondary75: "#2ecc7175",
                tertiary75: "#0b7a3e75",
            },
        },
        {
            name: "Violet Storm",
            colour: {
                secondary: "#9b42ff",
                tertiary: "#4b0099",
                secondary75: "#9b42ff75",
                tertiary75: "#4b009975",
            },
        },
        {
            name: "Ocean Blues",
            colour: {
                secondary: "#4287f5",
                tertiary: "#0349cc",
                secondary75: "#4287f575",
                tertiary75: "#0349cc75",
            },
        },
        {
            name: "Forest Greens",
            colour: {
                secondary: "#42b883",
                tertiary: "#0a7e4e",
                secondary75: "#42b88375",
                tertiary75: "#0a7e4e75",
            },
        },
        {
            name: "Royal Purples",
            colour: {
                secondary: "#8a42ff",
                tertiary: "#5e03cc",
                secondary75: "#8a42ff75",
                tertiary75: "#5e03cc75",
            },
        },
        {
            name: "Berry Red",
            colour: {
                secondary: "#ff4270",
                tertiary: "#cc0349",
                secondary75: "#ff427075",
                tertiary75: "#cc034975",
            },
        },
        {
            name: "Sunset Magenta",
            colour: {
                secondary: "#ff42a4",
                tertiary: "#cc0377",
                secondary75: "#ff42a475",
                tertiary75: "#cc037775",
            },
        },
        {
            name: "Golden Sunrise",
            colour: {
                secondary: "#ffb142",
                tertiary: "#cc8403",
                secondary75: "#ffb14275",
                tertiary75: "#cc840375",
            },
        },
        {
            name: "Teal Lagoon",
            colour: {
                secondary: "#42f5e6",
                tertiary: "#03cccc",
                secondary75: "#42f5e675",
                tertiary75: "#03cccc75",
            },
        },
        {
            name: "Lavender Mist",
            colour: {
                secondary: "#c742ff",
                tertiary: "#7f03cc",
                secondary75: "#c742ff75",
                tertiary75: "#7f03cc75",
            },
        },
        {
            name: "Minty Fresh",
            colour: {
                secondary: "#42f57a",
                tertiary: "#03cc49",
                secondary75: "#42f57a75",
                tertiary75: "#03cc4975",
            },
        },
    ]


    const [themeClicked, setThemeClicked] = useState(null);

    function changeTheme(theme) {
        const root = document.documentElement;

        root.style.setProperty("--secondary", theme.colour.secondary);
        root.style.setProperty("--tertiary", theme.colour.tertiary);

        root.style.setProperty("--secondary-75", theme.colour.secondary75);
        root.style.setProperty("--tertiary-75", theme.colour.tertiary75);

        // dark mode
        root.style.setProperty("--dm-secondary", theme.colour.secondary);
        root.style.setProperty("--dm-tertiary", theme.colour.tertiary);

        root.style.setProperty("--dm-secondary-75", theme.colour.secondary75);
        root.style.setProperty("--dm-tertiary-75", theme.colour.tertiary75);
    }

    const themeList = themes.map(theme => {
        return (
            <div key={theme.name} className={"theme_wrapper"} onClick={() => {
                console.log("clicked Theme: " + theme.name)
                changeTheme(theme);
                setThemeClicked(theme)
            }}>
                <div className={(themeClicked === theme) || (storedTheme && JSON.parse(storedTheme).name === theme.name) ? "theme-container theme_wrapper_clicked" : "theme-container"}>
                    <div className={"theme"} style={{
                        backgroundColor: theme.colour.tertiary,
                    }}>
                    </div>
                </div>
                <p style={{
                    fontSize: "12px",
                    textAlign: "center",
                    width: "50px"
                }}>{theme.name}</p>
            </div>
        )
    })

    return (
        <div className={"theme-container__wrapper"}>
            <h1>Themes</h1>
            <form className={"theme-form"}>
                <div className="themes-container">
                    {themeList}
                </div>
                {themeClicked && <div className="theme-form__buttons">
                    <button className={"success-button general-button"} type={"button"} onClick={() => {
                        localStorage.setItem("theme", JSON.stringify(themeClicked));
                        setThemeClicked(null);
                    }}>Save Theme</button>
                    <button className={"danger-button general-button"} type={"button"} onClick={() => {
                        console.log("cancelling theme selection")
                        setThemeClicked(null);
                        if (storedTheme) {
                            const themeObj = JSON.parse(storedTheme);
                            changeTheme(themeObj)
                        } else {
                            changeTheme(themes[0])
                        }
                    }}>Cancel</button>
                </div>}
            </form>
        </div>
    )
}