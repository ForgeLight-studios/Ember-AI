export default function Message ({text, user}) {
    return (
        <div className={user === "user" ? "message message-user" : "message message-ai"}>
            <div className={"message-header"}>
                <p>{user}</p>
            </div>
            <div className={"message-body"}>
                <p>{text}</p>
            </div>
        </div>
    )
}