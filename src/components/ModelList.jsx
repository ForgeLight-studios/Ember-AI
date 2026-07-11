export default function ModelList() {

    const models = [
        {
            name: "llama3.2",
            description: "general chatting"
        },
        {
            name: "llama3.1",
            description: "general chatting"
        }
    ]

    const modelList = models.map((model) => {
        return (
            <div className={"model-list__item"}>
                <p>{model.name}</p>
                <p>{model.description}</p>
            </div>
        )
    })

    return (
        <div className="model-list__container">
            {modelList}
        </div>
    )
}