import {ClientData} from './ClientData';
import {EventHub, eventHubData } from './EventHub';
import {Socket} from './Socket';


export const globalRobotData = {
    clientData : new ClientData() ,
    socket : Socket ,
    webIMSource : 'client' ,
}



export function initChatRobot(app) {

    globalRobotData.clientData.init(app);
    eventHubData.eventHub.$init(app);

    globalRobotData.webIMSource = 'client';
}