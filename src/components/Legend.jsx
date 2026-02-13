import React from 'react';
import './Legend.css';

const Legend = () => {
    return (
        <div className="legend">
            <div className="legend-item">
                <div className="legend-node node-start"></div>
                <span>Start Node</span>
            </div>
            <div className="legend-item">
                <div className="legend-node node-finish"></div>
                <span>Target Node</span>
            </div>
            <div className="legend-item">
                <div className="legend-node node-wall"></div>
                <span>Wall Node</span>
            </div>
            <div className="legend-item">
                <div className="legend-node node-visited"></div>
                <span>Visited Node</span>
            </div>
            <div className="legend-item">
                <div className="legend-node node-path"></div>
                <span>Shortest Path</span>
            </div>
            <div className="legend-item">
                <div className="legend-node node-unvisited"></div>
                <span>Unvisited Node</span>
            </div>
        </div>
    );
};

export default Legend;
