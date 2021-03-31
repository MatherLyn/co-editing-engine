
import './index.css';
import React, { useCallback, useEffect, useState } from 'react';
import { render } from 'react-dom';
import { BrowserRouter, useLocation } from 'react-router-dom';
import MonacoEditor, { monaco } from 'react-monaco-editor';
import Range from '../structs/range';
import Edit from '../operations/edit';
import { uuidv4 } from 'lib0/random';
// import { Document } from 'src/structs/document';
import { useQueryParams } from 'src/utils/custom-hooks';


//#region static
const options: monaco.editor.IStandaloneEditorConstructionOptions = {
    fontSize: 16
};
let websocket: WebSocket;
//#endregion
//#region variables
let isHost: boolean = false;
let clientID: number = -1;
let initialized: boolean = false;
//#endregion

const App = () => {
    //#region callbacks
    const editorDidMount = useCallback((editor: monaco.editor.IStandaloneCodeEditor, m: typeof monaco) => {
        editor.focus();
        // @ts-ignore
        window.editor = editor;
        // @ts-ignore
        window.monaco = m;
    }, []);
    const onChange = useCallback((value: string, event: monaco.editor.IModelContentChangedEvent) => {
        const { changes } = event;
        const serializedChanges = JSON.stringify(changes);
        websocket.send(`b: ${serializedChanges}`);
    }, []);
    //#endregion

    //#region effects
    useEffect(() => {
        !websocket && (websocket = (new WebSocket(`ws://${location.hostname}:8889`)));

        websocket.onmessage = (ev: MessageEvent<string>) => {
            const { data } = ev;
            const protocol = data[0];
            const message = data.slice(3);

            switch(protocol) {
                case 'a': break;
                case 'b': {
                    const changes = JSON.parse(message) as monaco.editor.IModelContentChange[];
                    // @ts-ignore
                    window.editor.getModel().applyEdits(changes);
                    break;
                }
                case 'n': break;
                case 'w': {
                    if (initialized) {
                        if (isHost) {
                            
                        }
                        break;
                    }
                    clientID = Number(/\#\d+/.exec(data)?.[0].slice(1));
                    isHost = clientID === 1;
                    isHost && (initialized = true);
                    break;
                }
                case 's': {
                    if (!isHost && !initialized) {
                        
                        initialized = true;
                    }
                    break;
                }
            }
        }

        return () => websocket.close();
    }, []);
    //#endregion

    return (
        <MonacoEditor
            width="800"
            height="600"
            language="typescript"
            theme="vs-dark"
            options={options}
            onChange={onChange}
            editorDidMount = {editorDidMount}
        />
    );
}

render(<BrowserRouter><App /></BrowserRouter>, document.getElementById('root'));

// @ts-ignore
window.Selection = monaco.Selection;
