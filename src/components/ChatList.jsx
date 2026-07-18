export default function ChatList ({chatName, }) {

    return (
        <div className={"chat-list"}>
            <div className={"chat-list__item"}>
                <p>{chatName}</p>
            </div>
        </div>
    )
}