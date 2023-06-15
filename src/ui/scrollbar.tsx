import React from "react";
import {Scrollbars, ScrollbarProps} from "react-custom-scrollbars-2";
import './scrollbar.scss';

export type ScrollViewProps = {

} & ScrollbarProps;

const ScrollView = React.forwardRef<Scrollbars, ScrollViewProps>(function ScrollView({className, ...rest}: ScrollViewProps, ref) {
    return (
        <Scrollbars
            hideTracksWhenNotNeeded={true} 
            renderThumbHorizontal={props => <div {...props} className="thumb-horizontal"/>}
            renderThumbVertical={props => <div {...props} className="thumb-vertical"/>}
            renderTrackHorizontal={props => <div {...props} className="track-horizontal"/>}
            renderTrackVertical={props => <div {...props} className="track-vertical"/>}
            {...rest}
            ref={ref}
            className={`scroll-view ${className || ""}`}
        />
    )
});
export default ScrollView;