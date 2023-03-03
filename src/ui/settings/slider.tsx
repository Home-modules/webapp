import SettingItem, { SettingItemProps } from "./setting";
import React from "react";
import Slider, { SliderProps } from "../fields/slider";
import "./slider.scss";

export type SettingItemSliderProps = SettingItemProps & Omit<SliderProps, 'label'>;

export function SettingItemSlider({
    title, description, icon, className,
    ...sliderProps
}: SettingItemSliderProps) {

    return (
        <SettingItem
            title={title}
            icon={icon}
            description={description}
            className={`slider ${className}`}
        >
            <Slider {...sliderProps} />
        </SettingItem>
    )
}