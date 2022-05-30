import { FieldValue } from 'firebase-admin/firestore';
import fs from 'fs/promises';
import { db, rtdb } from './admin';
// import initGpio from './gpio';\
import client, { publishPath } from './mqtt';
import initReader from './reader';

type CardRecord = {
    active: boolean,
    createdOn: number,
    englishName: string,
    chineseName: string,
    class: string,
    studentid: string,
}

interface CardRecordList {
    [cardId: number]: CardRecord | undefined
}

(async () => {
    const reader = initReader();
    // const { unlockDoor, gpio } = initGpio();
    console.log('Starting CEC Door Bouncer...');
    //if cards.json doesn't exist, create it
    try {
        await fs.access('cards.json');
    } catch (err) {
        console.log('Creating cards.json...');
        await fs.writeFile('cards.json', '{}');
    }
    let loadedCards: CardRecordList = JSON.parse((await fs.readFile('cards.json')).toString());
    
    // gpio.on('unlock', () => {
    //     // Unlock Door Button pressed
    //     unlockDoor();
    // })
    
    reader.on('card', (cardId) => {
        const cardDetails = loadedCards[cardId];
        if(!cardDetails){
            console.log('Card is not registered');
            return;
        }
        if(cardDetails.active){
            console.log('Card Found in Registry', cardDetails)
            logAccess(cardId, cardDetails);
            // unlockDoor();
        } else {
            console.log('Card is not active');
        }
    
    })
    rtdb.ref('cards').on('value', async snap =>{
        const cards = snap.val();
        if(!cards || Object.keys(cards).length == 0) return;
        loadedCards = cards;
        await fs.writeFile('cards.json', JSON.stringify(loadedCards))
    })
    console.log('Started CEC Door Bouncer');

    const logAccess = async (cardId: number, cardDetails: CardRecord) => {
        //Publish to MQTT
        client.publish(`${publishPath}cardId`, cardId.toString())
        client.publish(`${publishPath}cardholderName`, cardDetails.englishName)
        client.publish(`${publishPath}accessTime`, new Date().toISOString())

        //Log to Firebase
        const log = {
            cardId,
            ...cardDetails,
            accessTime: FieldValue.serverTimestamp(),
        }
        await db.collection('accessLogs').add(log);
    }
})();
