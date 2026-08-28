import { useState, useRef, useCallback, useEffect } from 'react';

const UNDO_WINDOW_MS = 5000;

export const useUndoableAction = () => {
    const [pending, setPending] = useState(null);   // { message, onUndo, commit }
    const timerRef = useRef(null);

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    // Start an undoable action: the UI has already changed; `commit` runs when the window expires
    const run = useCallback(({ message, commit, onUndo }) => {
        clearTimer();

        // if another action is still pending, commit it now rather than losing it
        setPending(prev => {
            if (prev) prev.commit();
            return { message, commit, onUndo };
        });

        timerRef.current = setTimeout(() => {
            setPending(current => {
                if (current) current.commit();
                return null;
            });
            timerRef.current = null;
        }, UNDO_WINDOW_MS);
    }, []);

    const undo = useCallback(() => {
        clearTimer();
        setPending(current => {
            if (current) current.onUndo();
            return null;
        });
    }, []);

    // commit anything pending if the component unmounts (navigation away)
    useEffect(() => () => {
        clearTimer();
        setPending(current => {
            if (current) current.commit();
            return null;
        });
    }, []);

    return { pending, run, undo };
};
