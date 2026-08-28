export default function Message ({text, user, latestMessageRef, isLast, assistant}) {
    return (
        <div ref={isLast ? latestMessageRef : null} className={user === "user" ? "message message-user" : "message-ai"}>
            <div className={"message-header"}>
                <p>{user === "assistant" ? `${assistant}` : user}</p>
            </div>
            <div className={"message-body"}>
                <p>{text}</p>
            </div>
        </div>
    )
}