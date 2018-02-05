export class ChatComponent {

    constructor(messagePipeline, domContext) {
        Object.assign(this, {messagePipeline, domContext});
        this.addEventListeners();
    }

    addEventListeners() {
        this.domContext.querySelector('form').addEventListener('submit', this.onFormSubmit.bind(this));
    }

    onFormSubmit(event) {
        event.preventDefault();
        const input = event.target.querySelector('input');
        const message = input.value;
        if (message) {
            this.messagePipeline(message).then(response => {
                debugger;
            });
        }
    }
}