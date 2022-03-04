import { FieldValue } from 'firebase-admin/firestore';
import fs from 'fs/promises';
import { db, rtdb } from './admin';
import gpio, { unlockDoor } from './gpio';
import client from './mqtt';
import reader from './reader';

interface CardRecord {
    active: boolean,
    displayName: string,
    createdOn: number,
    modifiedOn: number
}

interface CardRecordList {
    [cardId: number]: CardRecord | undefined
}

(async () => {
    console.log('Starting CEC Door Bouncer...');
    let loadedCards: CardRecordList = JSON.parse((await fs.readFile('../cards.json')).toString());

    gpio.on('unlock', () => {
        // Unlock Door Button pressed
        unlockDoor();
    })

    reader.on('card', (cardId) => {
        const cardDetails = loadedCards[cardId];
        if(!cardDetails){
            console.log('Card is not registered');
            return;
        }
        if(cardDetails.active){
            console.log('Card Found in Registry', cardDetails)
            logAccess(cardId, cardDetails);
            unlockDoor();
        } else {
            console.log('Card is not active');
        }
    
    })
    rtdb.ref('cards').on('value', async snap =>{
        loadedCards = snap.val();
        await fs.writeFile('../cards.json', JSON.stringify(loadedCards))
    })

    const logAccess = async (cardId: number, cardDetails: CardRecord) => {
        //Publish to MQTT
        client.publish(`cec/makerspace/doorbouncer/lastAccessCardId`, cardId.toString())
        client.publish(`cec/makerspace/doorbouncer/lastAccessName`, cardDetails.displayName)
        client.publish(`cec/makerspace/doorbouncer/lastAccessTime`, new Date().toISOString())

        //Log to Firebase
        const log = {
            cardId,
            ...cardDetails,
            accessTime: FieldValue.serverTimestamp(),
        }
        await db.collection('accessLogs').add(log);
    }
})();
