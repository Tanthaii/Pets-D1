import { Frame } from '@nativescript/core';
import { Observable } from '@nativescript/core';

export class HomeViewModel extends Observable {
    constructor() {
        super();
    }

    onStartDetection() {
        Frame.topmost().navigate({
            moduleName: "pages/detection/detection-page",
            animated: true
        });
    }

    onCreateAccount() {
        Frame.topmost().navigate({
            moduleName: "pages/register/register-page",
            animated: true
        });
    }
}