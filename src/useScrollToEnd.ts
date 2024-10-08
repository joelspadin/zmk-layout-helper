import { RefObject, useCallback } from 'react';

/**
 * Get a function which, when called, scrolls the given element to its bottom.
 */
export function useScrollToEnd<T extends HTMLElement>(ref: RefObject<T>) {
    return useCallback(() => {
        // Delay until after the render, so we scroll to the element's new end
        // after any changes made during rendering.
        requestAnimationFrame(() => {
            if (ref.current) {
                ref.current.scrollTo({
                    top: ref.current.scrollHeight,
                    behavior: 'smooth',
                });
            }
        });
    }, [ref]);
}
