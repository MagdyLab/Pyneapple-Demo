import React, { useState } from 'react';
import Slider from 'react-slider';
import './RangeSlider.css'; // replace with the path to your CSS file

function RangeSlider({ labelLow, labelHigh, lowValue, highValue, onSliderChange }) {
    const [value, setValue] = useState([lowValue, highValue]);
    const priceGap = 1000;

    const handleChange = (newValue) => {
        if (Math.abs(newValue[0] - newValue[1]) >= priceGap) {
            setValue(newValue);
            onSliderChange('low', newValue[0]);
            onSliderChange('high', newValue[1]);
        }
    };

    const formatValue = (val) => {
        return val === 1000000 ? "∞" : val === -1000000 ? "-∞" : null;
    };

    return (
        <div className="container" style={{ background: '#ffffff', padding: '10px', borderRadius: '5px' }}>
            <Slider
                value={value}
                onChange={handleChange}
                min={-1000000}
                max={1000000}
                step={1000}
                pearling
                minDistance={priceGap}
                className="horizontal-slider"
                thumbClassName="thumb"
                trackClassName="track"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <div>
                    <label>{labelLow}</label>
                    <input
                        type="number"
                        value={value[0]}
                        onChange={(e) => handleChange([parseInt(e.target.value), value[1]])}
                        style={{ width: '100px', marginRight: '10px', background: 'rgba(0, 0, 0, 0.1)', border: 'none', color: '#000', padding: '10px', display: formatValue(value[0]) ? 'none' : 'block' }}
                    />
                    <span style={{display: formatValue(value[0]) ? 'block' : 'none'}}>{formatValue(value[0])}</span>
                </div>
                <div>
                    <label>{labelHigh}</label>
                    <input
                        type="number"
                        value={value[1]}
                        onChange={(e) => handleChange([value[0], parseInt(e.target.value)])}
                        style={{ width: '100px', marginLeft: '10px', background: 'rgba(0, 0, 0, 0.1)', border: 'none', color: '#000', padding: '10px', display: formatValue(value[1]) ? 'none' : 'block' }}
                    />
                    <span style={{display: formatValue(value[1]) ? 'block' : 'none'}}>{formatValue(value[1])}</span>
                </div>
            </div>
        </div>
    );
}

export default RangeSlider;
