import { useState, useRef, useCallback, useEffect } from 'react';

const UNDO_WINDOW_MS = 5000;

export const useUndoableAction = () => {
    const [pending, setPending] = useState(null);   // display only
    const actionRef = useRef(null);
    const timerRef = useRef(null);

    // Pulls the action out of the ref before running it, so a second call
    // finds nothing. This is what makes double invocation harmless.
    const take = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        const action = actionRef.current;
        actionRef.current = null;
        setPending(null);
        return action;
    }, []);

    const commit = useCallback(async () => {
        const action = take();
        if (action) await action.commit();
    }, [take]);

    const undo = useCallback(() => {
        const action = take();
        if (action) action.onUndo?.();
    }, [take]);

    const run = useCallback(async ({ message, commit: commitFn, onUndo }) => {
        await commit();   // finish any previous pending action first

        actionRef.current = { commit: commitFn, onUndo };
        setPending({ message, commit });
        timerRef.current = setTimeout(commit, UNDO_WINDOW_MS);
    }, [commit]);

    useEffect(() => () => { commit(); }, [commit]);

    return { pending, run, undo, commit };
};