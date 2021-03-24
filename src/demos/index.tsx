import React, { useCallback, useEffect, useState } from 'react';
import { render } from 'react-dom';
import MonacoEditor, { monaco as monacoEditor } from 'react-monaco-editor';
import './index.css';

const App = () => {
    const options: monacoEditor.editor.IStandaloneEditorConstructionOptions = {
        fontSize: 16
    };
    const [code, setCode] = useState('');
    
    const onChange = useCallback((value: string, event: monacoEditor.editor.IModelContentChangedEvent) => {

    }, [code]);
    const editorDidMount = useCallback((editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
        editor.focus();
    }, []);


    return (
        <MonacoEditor
            width="800"
            height="600"
            language="typescript"
            theme="vs-dark"
            value={code}
            options={options}
            onChange={onChange}
            editorDidMount = {editorDidMount}
        />
    );
}

render(<App />, document.getElementById('root'));
