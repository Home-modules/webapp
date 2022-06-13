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
    children: React.ReactChild|React.ReactChild[],
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
        onClick: (e: React.MouseEvent<HTMLElement>) => Promise<any>,
        onThen?: (res: any)=> void,
        onCatch?: (err: any)=> void
    }))[],
    onClose?: ()=> void,
}

export default function Flyout({id, element, children, showCloseButton, width, buttons, onClose}: FlyoutProps) {
    const containerRef = React.useRef(null);
    const [position, setPosition] = React.useState(getFlyoutPosition(element, width));
    const [closing, setClosing] = React.useState(false);

    function handleClose() {
        onClose?.();
        setClosing(true);
        setTimeout(()=> {
            store.dispatch({
                type: "REMOVE_FLYOUT",
                id
            })
        }, 500);
    }

    return (
        <div ref={containerRef} className={`flyout-container ${closing?'closing':''}`} onClick={e=> {
            if(e.target === containerRef?.current) {
                handleClose();
            }
        }}>
            <div className={`flyout ${position.top!==undefined ? 'bottom':'top'}`} style={{...position, width}}>
                {showCloseButton && (
                    <FontAwesomeIcon icon={faTimes} className='close' onClick={handleClose} />
                )}
                <div className="content">
                    {children}
                </div>
                {buttons && 
                    <div className="buttons">
                        {buttons.map((button, index)=> (
                            button.async ? (
                                <IntermittentButton
                                    key={index}
                                    children={button.text}
                                    primary={button.primary}
                                    attention={button.attention}
                                    disabled={button.disabled}
                                    onClick={button.onClick}
                                    onThen={(res)=> {
                                        button.onThen?.(res);
                                        if(button.closeOnClick!==false) {
                                            handleClose();
                                        }
                                    }}
                                    onCatch={button.onCatch}
                                />
                            ) : (
                                <Button 
                                    key={index}
                                    children={button.text}
                                    primary={button.primary}
                                    attention={button.attention}
                                    disabled={button.disabled}
                                    onClick={e=> {
                                        button.onClick?.(e);
                                        if(button.closeOnClick!==false) {
                                            handleClose()
                                        }
                                    }}
                                />
                            )
                        ))}
                    </div>
                }
            </div>
        </div>
    )
}

export const Flyouts = connect(({flyouts}: StoreState)=>({flyouts}))(
    function Flyouts({flyouts}: Pick<StoreState, 'flyouts'>) {
        return <>{flyouts.map(flyout => <Flyout key={flyout.id} {...flyout}/>)}</>
    }
)

function getFlyoutPosition(element: Element, width: number) {
    const rect = element.getBoundingClientRect();
    console.log(rect);
    let left: number = rect.x + rect.width/2 - width/2;
    let bottom: number|undefined = window.innerHeight - rect.y + 10;
    let top: number|undefined = undefined;

    if(window.innerHeight - bottom < 150) {
        bottom = undefined;
        top = rect.bottom + 10;
    }

    if(left < 10) {
        left = 10;
    }

    if(left + width > window.innerWidth - 10) {
        left = window.innerWidth - 10 - width;
    }

    return {left, bottom, top}
}