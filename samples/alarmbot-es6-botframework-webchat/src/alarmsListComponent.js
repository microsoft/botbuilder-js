export class AlarmsListComponent {

    /**
     * @property {Observable} activityPipeline
     */

    /**
     * @property {Element} domContext
     */

    /**
     * @property {Activity} lastActivity
     */

    /**
     *
     * @param {Observable} activityPipeline
     * @param {Element} domContext
     */
    constructor(activityPipeline, domContext) {
        Object.assign(this, {activityPipeline, domContext});
        activityPipeline.subscribe(this.activityReceived.bind(this));
    }

    activityReceived(activity) {
        if (activity.type !== 'event') {
            return;
        }

        if (activity.text === 'newAlarm') {
            return this.addAlarm(activity);
        }
        if (activity.text === 'deleteAlarm') {
            this.removeAlarm(activity);
        }
    }

    addAlarm(alarm) {
        const alarmTemplate = document.getElementById('alarm-template');
        const fields = alarmTemplate.content.querySelectorAll('[data-field]');
        const alarms = this.domContext.querySelector('ul');

        fields[0].textContent = alarm.value.title;
        fields[1].textContent = `Set for: ${alarm.value.time}`;
        alarmTemplate.content.firstElementChild.setAttribute('data-alarm', alarm.value.title.toLowerCase());

        alarms.appendChild(document.importNode(alarmTemplate.content, true));
    }

    removeAlarm(alarm) {
        const li = this.domContext.querySelector(`ul > li[data-alarm="${alarm.value.title.toLowerCase()}"`);
        if (li) {
            li.parentElement.removeChild(li);
        }
    }
}

let instance;
AlarmsListComponent.bootstrap = function (activityPipeline, domContext) {
    return instance || (instance = new AlarmsListComponent(activityPipeline, domContext));
};