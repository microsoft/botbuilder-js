export class ChatComponent {

    /**
     * @property {Function} messagePipeline
     */

    /**
     * @property {Element} domContext
     */

    /**
     * @property {Activity} lastActivity
     */

    /**
     * @property {number} animationFrame
     */

    /**
     *
     * @param {Promise} messagePipeline
     * @param {Element} domContext
     */
    constructor(messagePipeline, domContext) {
        Object.assign(this, {messagePipeline, domContext});
        this.addEventListeners();
        this.animateScroll(domContext.querySelector('.messages-container')); // initial positioning
    }

    /**
     *
     */
    addEventListeners() {
        this.domContext.querySelector('form').addEventListener('submit', this.onFormSubmit.bind(this));
    }

    /**
     * Handler for form submission events.
     * Triggered after the user presses enter
     * while a form element is in focus or
     * when the send button is presses
     *
     * @param {Event} event
     */
    onFormSubmit(event) {
        event.preventDefault();
        const input = event.target.querySelector('input');
        const message = input.value;
        if (message) {
            this.messagePipeline(message)
                .then(this.activitiesReceived.bind(this))
                .catch(this.errorHandler.bind(this, message));
            this.addMessageToChat(message, 'user-message');
            input.value = '';
        }
    }

    activitiesReceived(activities) {
        const messages = activities.filter(message => message.type === 'message');
        if (messages.length) {
            messages.forEach(message => setTimeout(this.addMessageToChat.bind(this, message.text, 'bot-message'), 1000));
            this.lastActivity = messages[messages.length - 1]; // Not sure if its safe to pop this element
        }
        const events = activities.filter(event => event.type === 'event');
        if (events.length) {
            events.forEach(this.eventReceived.bind(this));
        }
    }

    eventReceived(event) {
        if (event.text === 'newAlarm') {
            return this.addAlarm(event);
        }
        if (event.text === 'deleteAlarm') {
            this.removeAlarm(event);
        }
    }

    errorHandler() {
        this.addMessageToChat(`Oops!. I didn't quite get that. Let's try again`, 'bot-message');
        setTimeout(this.addMessageToChat.bind(this.lastActivity.text, 'bot-message'), 1000);
    }

    addMessageToChat(message, className) {
        const div = document.createElement('div');
        const p = document.createElement('p');
        p.textContent = message;
        div.appendChild(p);

        const chat = this.domContext.querySelector('.messages-container');
        chat.appendChild(div).className = className;
        requestAnimationFrame(this.animateScroll.bind(this, chat));
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

    animateScroll(element) {
        const clientHeight = element.clientHeight;
        const tY = element.parentElement.clientHeight - clientHeight;

        element.style.transform = `translateY(${tY}px)`;
    }
}

let instance;
ChatComponent.bootstrap = function (messagePipeline, domContext) {
    return instance || (instance = new ChatComponent(messagePipeline, domContext));
};