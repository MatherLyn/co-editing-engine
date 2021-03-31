
import './index.css';
import React, { useCallback, useEffect, useState } from 'react';
import { render } from 'react-dom';
import { BrowserRouter, useLocation } from 'react-router-dom';
import MonacoEditor, { monaco, monaco as monacoEditor } from 'react-monaco-editor';
import { uuidv4 } from 'lib0/random';
// import { Document } from 'src/structs/document';
import { useQueryParams } from 'src/utils/custom-hooks';


let websocket: WebSocket;

const App = () => {
    //#region variables
    const options: monacoEditor.editor.IStandaloneEditorConstructionOptions = {
        fontSize: 16
    };
    let isHost: boolean = false;
    let clientID: number = -1;
    let initialized: boolean = false;
    //#endregion

    //#region callbacks
    const editorDidMount = useCallback((editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
        editor.focus();
        // @ts-ignore
        window.editor = editor;
        // @ts-ignore
        window.monaco = monaco;
    }, []);
    const onChange = useCallback((value: string, event: monacoEditor.editor.IModelContentChangedEvent) => {
        console.log(event);
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
                    break;
                }
                case 'n': break;
                case 'w': {
                    if (initialized) {
                        if (isHost) {
                            // @ts-ignore
                            // websocket.send(`s: ${JSON.stringify(window.editor.getModel())}`);
                        }
                    } else {
                        clientID = Number(/\#\d+/.exec(data)?.[0].slice(1));
                        isHost = clientID === 1;
                        isHost && (initialized = true);
                    }
                    break;
                }
                case 's': {
                    if (!isHost && !initialized) {
                        // @ts-ignore
                        // window.editor.setModel(JSON.parse(message));
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
