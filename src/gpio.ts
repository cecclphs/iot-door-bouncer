import { Gpio } from "onoff";
import TypedEventEmitter from "typed-emitter";
import EventEmitter from 'events';

export default function initGpio() {
    const gpio = new EventEmitter() as TypedEventEmitter<{
        unlock: () => void,
    }>;
    
    const doorRelay = new Gpio(17, 'out');
    const buzzer = new Gpio(18, 'out');
    const button = new Gpio(4, 'in', 'rising', {debounceTimeout: 10});
    
    button.watch((err, value) => gpio.emit('unlock'));
    
    let doorTimeout: NodeJS.Timeout | undefined;

    const unlockDoor = async () => {
        doorRelay.writeSync(1);
        buzzer.writeSync(1);
        if(doorTimeout) clearTimeout(doorTimeout);
        doorTimeout = setTimeout(() => {
            doorRelay.writeSync(0);
            buzzer.writeSync(0);
        }, 3000);
    }
    
    return { unlockDoor, gpio };
}
