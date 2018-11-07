import PropTypes from 'prop-types';
import React, { Component } from 'react';
import QRCodeImpl from 'qr.js/lib/QRCode';
import ErrorCorrectLevel from 'qr.js/lib/ErrorCorrectLevel';

class QRCode extends Component {
    constructor (props) {
        super(props);
    }

    render() {
        const props = Object.assign(
            {},
            {
                level: 'L',
                backgroundColor: '',
                foregroundColor: '#000000',
                size: 100
            },
            this.props
        );
        const {value, level, backgroundColor, foregroundColor} = props;

        const qrcode = new QRCodeImpl(-1, ErrorCorrectLevel[level]);
        qrcode.addData(value);
        qrcode.make();

        let cellIndex=0;

        const cells = qrcode.modules;
        const rects = [];
        cells.forEach((rowBoolArray, rowIndex) => {
            const bline = rowBoolArray.map(b => b ? '1' : '0').join('');
            const re = /(1+|0+)?/g;
            let pos = 0;
            bline.match(re).forEach((block) => {
                if (block) {
                    if (block[0] === '1') {
                        rects.push(
                            <rect
                                height={1}
                                key={cellIndex++}
                                style={{ fill: foregroundColor}}
                                width={block.length}
                                x={pos}
                                y={rowIndex}
                            />
                        );
                    }
                    pos += block.length;
                }
            })
        });

        return (
            <svg
                shapeRendering="crispEdges"
                viewBox={[0, 0, cells.length, cells.length].join(" ")}
                style={{backgroundColor, width: props.size + 'px'}}
            >
                {rects}
            </svg>
        )
    }
}

/**
 * Set data types for App
 * @type {Object}
 */
QRCode.propTypes = {
    value: PropTypes.string.isRequired,
    level: PropTypes.oneOf(['L', 'M', 'Q', 'H']),
    backgroundColor: PropTypes.string,
    foregroundColor: PropTypes.string,
    size: PropTypes.number,
};

export default QRCode
