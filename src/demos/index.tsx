
import './index.css';
import React, { useCallback, useEffect, useState } from 'react';
import { render } from 'react-dom';
import { BrowserRouter, useLocation } from 'react-router-dom';
import MonacoEditor, { monaco as monacoEditor } from 'react-monaco-editor';
import { uuidv4 } from 'lib0/random';
import { Document } from 'src/structs/document';
import { useQueryParams } from 'src/utils/custom-hooks';

const App = () => {
    //#region variables
    const options: monacoEditor.editor.IStandaloneEditorConstructionOptions = {
        fontSize: 16
    };
    const { roomId } = useQueryParams();
    const [code, setCode] = useState('');
    //#endregion

    //#region callbacks
    const onChange = useCallback((value: string, event: monacoEditor.editor.IModelContentChangedEvent) => {

    }, [code]);
    const editorDidMount = useCallback((editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
        editor.focus();
    }, []);
    //#endregion

    //#region effects
    useEffect(() => {
        const guid = uuidv4();
        // const document = new Document(guid, '');
    }, []);
    //#endregion

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

render(<BrowserRouter><App /></BrowserRouter>, document.getElementById('root'));
