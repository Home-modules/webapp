import React from 'react';
import './search-highlight.scss';

type SearchKeywordHighlightProps = {
    children: string;
    term?: string;
}

/**
 * Highlight the occurrences of a search keyword in a string
 */
export default function SearchKeywordHighlight({ children, term }: SearchKeywordHighlightProps) {
    if (!term) {
        return <>{children}</>;
    }

    const results: [number, number][] = [];
    let lastIndex = 0;
    let index = children.toLowerCase().indexOf(term.toLowerCase());
    while (index >= 0) {
        results.push([index, index + term.length]);
        lastIndex = index + term.length;
        index = children.toLowerCase().indexOf(term.toLowerCase(), lastIndex);
    }
    return (
        <>
            {results.map(([start, end], index) => (
                <React.Fragment key={start}>
                    {children.slice(results[index - 1]?.[1] || 0, start)}
                    <span className="search-highlight">
                        {children.slice(start, end)}
                    </span>
                </React.Fragment>
            ))}
            {children.slice(lastIndex)}
        </>
    );
}
