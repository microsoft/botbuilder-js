import React, { Fragment, useCallback, useEffect, useMemo, useReducer } from 'react';
import ReactWebChat from 'botframework-webchat';
import { DirectLineStreaming } from 'botframework-directlinejs';

const actions = {
    error: 'error',
    token: 'token',
};

function App({ bot }) {
    if (!bot) {
        throw new Error('bot prop is required');
    }

    const hostname = `https://${bot}.azurewebsites.net`;

    const [state, dispatch] = useReducer(
        (state, action) => {
            switch (action.type) {
                case actions.error:
                    return { ...state, error: action.value, token: null };

                case actions.token:
                    return { ...state, error: null, token: action.value };

                default:
                    return state;
            }
        },
        { error: null, token: null }
    );

    // Synchronize token with hostname
    useEffect(() => {
        const abortController = new AbortController();

        // dispatch mutates state which should only happen if component is still mounted
        const maybeDispatch = (...args) => !abortController.signal.aborted && dispatch(...args);

        (async () => {
            try {
                const resp = await fetch(`${hostname}/api/token/directlinease`, {
                    method: 'POST',
                    signal: abortController.signal,
                });

                if (abortController.signal.aborted) {
                    return;
                }

                if (!resp.ok) {
                    throw new Error(`request failed with ${resp.status}`);
                }

                try {
                    const { token } = await resp.json();
                    maybeDispatch({ type: actions.token, value: token });
                } catch (err) {
                    try {
                        // try to dispatch error with raw response text
                        const text = await resp.clone().text();
                        maybeDispatch({ type: actions.error, value: `${err.message} (raw body: ${text})` });
                    } catch (_err) {
                        // error decoding text should not override initial error
                        throw err;
                    }
                }
            } catch (err) {
                maybeDispatch({ type: actions.error, value: err.message });
            }
        })();

        return () => abortController.abort();
    }, [hostname, dispatch]);

    // memo-ize directline client synchronized with hostname and token
    const directLine = useMemo(
        () =>
            state.token
                ? new DirectLineStreaming({
                      domain: `${hostname}/.bot/v3/directline`,
                      token: state.token,
                  })
                : null,
        [hostname, state.token]
    );

    return (
        <Fragment>
            {state.error ? (
                <div id="webchat-error">{state.error}</div>
            ) : (
                directLine && (
                    <Fragment>
                        <span id="react-webchat" />
                        {/* nonce related to botbuilder-js content security issue #2762: https://github.com/microsoft/botbuilder-js/issues/2762 */}
                        <ReactWebChat directLine={directLine} nonce="a1b2c3d" />
                    </Fragment>
                )
            )}
        </Fragment>
    );
}

export default App;
