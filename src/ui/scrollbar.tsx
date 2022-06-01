import React from "react";
import {Scrollbars, ScrollbarProps} from "react-custom-scrollbars-2";
import './scrollbar.scss';

export type ScrollViewProps = {

} & ScrollbarProps;

export default function ScrollView({className, ...rest}: ScrollViewProps) {
    return (
        <Scrollbars
            hideTracksWhenNotNeeded={true} 
            renderThumbHorizontal={props => <div {...props} className="thumb-horizontal"/>}
            renderThumbVertical={props => <div {...props} className="thumb-vertical"/>}
            renderTrackHorizontal={props => <div {...props} className="track-horizontal"/>}
            renderTrackVertical={props => <div {...props} className="track-vertical"/>}
            {...rest}
            className={`scroll-view ${className || ""}`}
        />
    )
}