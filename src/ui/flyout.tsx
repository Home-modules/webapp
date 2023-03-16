import Button, { IntermittentButton } from './button'
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import './flyout.scss';
import { store, StoreState } from '../store';
import { connect } from 'react-redux';

export type FlyoutProps = {
    id: string,
    element: Element,
    children: React.ReactChild | React.ReactChild[],
    showCloseButton?: boolean,
    width: number,
    buttons?: ({
        text: string,
        primary?: boolean,
        attention?: boolean,
        disabled?: boolean,
        closeOnClick?: boolean
    } & ({
        async?: false,
        onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void,
    } | {
        async: true,
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => Promise<any>,
    }))[],
    onClose?: () => void,
}

export default function Flyout({ id, element, children, showCloseButton, width, buttons, onClose }: FlyoutProps) {
    const containerRef = React.useRef(null);
    const [position, setPosition] = React.useState(getFlyoutPosition(element, width));
    const [closing, setClosing] = React.useState(false);

    function handleClose() {
        onClose?.();
        setClosing(true);
        setTimeout(() => {
            store.dispatch({
                type: "REMOVE_FLYOUT",
                id
            })
        }, 500);
    }

    React.useEffect(() => {
        const observer = new ResizeObserver(() => {
            setPosition(getFlyoutPosition(element, width));
        });
        observer.observe(element);
    });

    function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
        const element =
            e.key === 'ArrowLeft' ?
                (e.target as HTMLElement).previousElementSibling :
            e.key === 'ArrowRight' ?
                (e.target as HTMLElement).nextElementSibling :
            null;
        element && (element as HTMLElement).focus();
    }

    return (
        <div ref={containerRef} className={`flyout-container ${closing ? 'closing' : ''}`} onClick={e => {
            if (e.target === containerRef?.current) {
                handleClose();
            }
        }}>
            <div className={`flyout ${position.top !== undefined ? 'bottom' : 'top'}`} style={{ ...position, width }}>
                {showCloseButton && (
                    <FontAwesomeIcon icon={faTimes} className='close' onClick={handleClose} />
                )}
                <div className="content">
                    {children}
                </div>
                {buttons &&
                    <div className="buttons">
                        {buttons.map((button, index) => (
                            button.async ? (
                                <IntermittentButton
                                    key={index}
                                    children={button.text}
                                    primary={button.primary}
                                    attention={button.attention}
                                    disabled={button.disabled}
                                    onClick={(e) => button.onClick(e).then((res) => {
                                        if (button.closeOnClick !== false) {
                                            handleClose();
                                        }
                                    })}
                                    autoFocus={index === 0}
                                    onKeyDown={onKeyDown}
                                />
                            ) : (
                                <Button
                                    key={index}
                                    children={button.text}
                                    primary={button.primary}
                                    attention={button.attention}
                                    disabled={button.disabled}
                                    onClick={e => {
                                        button.onClick?.(e);
                                        if (button.closeOnClick !== false) {
                                            handleClose()
                                        }
                                    }}
                                    autoFocus={index === 0}
                                    onKeyDown={onKeyDown}
                                />
                            )
                        ))}
                    </div>
                }
            </div>
        </div>
    )
}

export const Flyouts = connect(({ flyouts }: StoreState) => ({ flyouts }))(
    function Flyouts({ flyouts }: Pick<StoreState, 'flyouts'>) {
        return <>{flyouts.map(flyout => <Flyout key={flyout.id} {...flyout} />)}</>
    }
)

function getFlyoutPosition(element: Element, width: number) {
    const rect = element.getBoundingClientRect();
    let left: number = rect.x + rect.width / 2 - width / 2;
    let bottom: number | undefined = window.innerHeight - rect.y + 10;
    let top: number | undefined = undefined;

    if (window.innerHeight - bottom < 150) {
        bottom = undefined;
        top = rect.bottom + 10;
    }

    if (left < 10) {
        left = 10;
    }

    if (left + width > window.innerWidth - 10) {
        left = window.innerWidth - 10 - width;
    }

    return { left, bottom, top }
}

export function addConfirmationFlyout({ element, text, confirmText, attention = false, onConfirm, async, width = 200 }: {
    element: EventTarget | Element,
    text: string | JSX.Element,
    confirmText: string,
    attention?: boolean,
    width?: number,
} & ({
    async?: false,
    onConfirm: (e: React.MouseEvent<HTMLButtonElement>) => void,
} | {
    async: true,
    onConfirm: (e: React.MouseEvent<HTMLButtonElement>) => Promise<any>,
})) {
    store.dispatch({
        type: "ADD_FLYOUT",
        flyout: {
            children: text,
            element: element as Element,
            width,
            buttons: [
                { text: "Cancel" },
                {
                    text: confirmText,
                    attention,
                    primary: true,
                    async,
                    onClick: onConfirm
                } as any // To suppress a TypeScript error I cannot figure out
            ]
        }
    })
}