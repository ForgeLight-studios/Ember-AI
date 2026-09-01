export default function AreYouSure({message, yesFunction, setIsAreYouSure, setAreYouSureMessage, setAreYouSureFunction}) {
    function resetAreYouSure() {
        setIsAreYouSure(false);
        setAreYouSureFunction(null);
        setAreYouSureMessage("")
    }

    return (
        <div className="you-sure-wrapper">
            <div className="you-sure-container">
                <div className="you-sure-body">
                    <p className={"you-sure-message"}>Are you sure you want to</p>
                    <p className={"you-sure-highlight"} style={{color: "var(--tertiary)"}}>{message}?</p>
                </div>

                <div className={"you-sure-buttons"}>
                    <button className={"general-button success-button"} onClick={() => {
                        yesFunction()
                        resetAreYouSure()
                    }}>Yes</button>
                    <button className={"general-button danger-button"} onClick={() => {
                        resetAreYouSure()
                    }}>No</button>
                </div>
            </div>
        </div>
    )
}