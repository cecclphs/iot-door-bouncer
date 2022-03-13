import { SerialPort } from 'serialport';
import { DelimiterParser } from '@serialport/parser-delimiter';
import EventEmitter from 'events';
import TypedEmitter from "typed-emitter"

type ReaderEvents = {
    card: (cardId: number) => void,
    error: (error: Error) => void
}
export default function initReader() {
    const reader = new EventEmitter() as TypedEmitter<ReaderEvents>;

    const port = new SerialPort({
        path: '/dev/ttyUSB0',
        baudRate: 9600
    })
    const parser = port.pipe(new DelimiterParser({ delimiter: [3] }))

    parser.on('data', data =>{
        // console.log(data)
        if(data.length != 13)return;
        let hexCardId = '';
        for (let hex of data.slice(3,11)) {
            hexCardId += String.fromCharCode(hex);
        }
        const cardId = parseInt(`0x${hexCardId}`)
        reader.emit('card', cardId);
    })
    
    parser.on('error', err => reader.emit('error', err))
    return reader;
}