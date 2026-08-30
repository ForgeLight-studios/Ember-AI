export default function Message ({text, user, latestMessageRef, isLast, assistant, failed}) {

    console.log("[Server - MessageElement] message failed??: " + failed)
    return (
        <div className="message-wrapper">
            <div ref={isLast ? latestMessageRef : null} className={user === "user" ? failed ? "disabled-button message message-user" : "message message-user" : "message-ai"}>
                <div className={"message-header"}>
                    <p>{user === "assistant" ? `${assistant}` : user}</p>
                </div>
                <div className={user === "assistant" ? "assistant-message__body" : "message-body"}>
                    <p>{text}</p>
                </div>
            </div>
            {failed && <p className={"failedMessage"}>Failed to send</p>}
        </div>
    )
}