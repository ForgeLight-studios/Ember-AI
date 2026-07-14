export default function Message ({text, user, latestMessageRef, isLast}) {
    return (
        <div ref={isLast ? latestMessageRef : null} className={user === "user" ? "message message-user" : "message message-ai"}>
            <div className={"message-header"}>
                <p>{user}</p>
            </div>
            <div className={"message-body"}>
                <p>{text}</p>
            </div>
        </div>
    )
}