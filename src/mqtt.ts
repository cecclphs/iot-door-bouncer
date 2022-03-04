import mqtt from 'mqtt';

const client  = mqtt.connect('mqtt://localhost:1883')

export default client;