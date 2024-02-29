import './buttonStyle.css';

const Button = ({label, saveEditorData}) => {
    return (
        <>
            <button onClick={saveEditorData}>{label}</button>
        </>
    )
}

export default Button;