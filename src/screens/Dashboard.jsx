import React, { useRef } from 'react';
import Button from "../components/button";
import Typography from "../components/typography";
import DraftEditor from "../components/editor";

const Dashboard = () => {
    const editorRef = useRef(null);
    const title = "Demo editor by Sathish";

    const saveEditorData = () => {
        if (editorRef.current) {
            editorRef.current.saveEditorData();
        }
    }

    return (
        <>
            <div className="flex align-center px-20 py-4">
                <div className="w-90 text-center">
                    <Typography variant="p" text={title}></Typography>
                </div>
                <div className="w-10 flex justify-content-end">
                    <Button className="w-30" label="Save" saveEditorData={saveEditorData}></Button>
                </div>
            </div>
            <div className="px-20">
                <DraftEditor ref={editorRef}/>
            </div>
        </>
    )
}

export default Dashboard;