export default function AreYouSure({message, yesFunction, setIsAreYouSure}) {
    return (
        <div className="you-sure-wrapper">
            <div className="you-sure-container">
                <div className="you-sure-body">
                    <p className={"you-sure-message"}>Are you sure you want to</p>
                    <p className={"you-sure-highlight"}>{message}?</p>
                </div>

                <div className={"you-sure-buttons"}>
                    <button className={"general-button success-button"} onClick={() => {
                        yesFunction()
                    }}>Yes</button>
                    <button className={"general-button danger-button"} onClick={() => setIsAreYouSure(prev => !prev)}>No</button>
                </div>
            </div>
        </div>
    )
}