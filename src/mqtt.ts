import * as mqtt from "mqtt";

const client  = mqtt.connect('mqtt://localhost:1883', {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
})

export const publishPath = "cec/doorbouncer/"

export default client;