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
        path: 'COM5',
        baudRate: 9600
    })
    const parser = port.pipe(new DelimiterParser({ delimiter: [3] }))
    let lastReadCardId = 0;
    parser.on('data', (data: Buffer) =>{
        console.log(data)
        if(data.length != 8)return;
        
        const cardId = data.readUInt32BE(3)
        if(cardId == lastReadCardId){
            return;
        }
        lastReadCardId = cardId;
        reader.emit('card', cardId);
    })
    
    parser.on('error', err => reader.emit('error', err))
    return reader;
}