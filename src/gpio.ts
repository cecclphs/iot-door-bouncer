import { Gpio } from "onoff";
import TypedEventEmitter from "typed-emitter";
import EventEmitter from 'events';
import { sleep } from "./utils";

const gpio = new EventEmitter() as TypedEventEmitter<{
    unlock: () => void,
}>;

const doorRelay = new Gpio(17, 'out');
const buzzer = new Gpio(18, 'out');
const button = new Gpio(4, 'in', 'rising', {debounceTimeout: 10});

button.watch((err, value) => gpio.emit('unlock'));

const unlockDoor = async () => {
    doorRelay.writeSync(1);
    buzzer.writeSync(1);
    await sleep(3000);
    doorRelay.writeSync(0);
    buzzer.writeSync(0);
}

export { unlockDoor };
export default gpio;