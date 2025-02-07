import { Observable } from '@nativescript/core';
import { ImageSource } from '@nativescript/core';
import { Camera } from '@nativescript/core';
import { ImagePicker } from '@nativescript/core';

export class DetectionViewModel extends Observable {
    private _previewImage: ImageSource | null = null;
    private _detectionResult: any = null;
    private _detectionHistory: Array<any> = [];

    constructor() {
        super();
    }

    get previewImage(): ImageSource | null {
        return this._previewImage;
    }

    set previewImage(value: ImageSource | null) {
        if (this._previewImage !== value) {
            this._previewImage = value;
            this.notifyPropertyChange('previewImage', value);
        }
    }

    get detectionResult(): any {
        return this._detectionResult;
    }

    set detectionResult(value: any) {
        if (this._detectionResult !== value) {
            this._detectionResult = value;
            this.notifyPropertyChange('detectionResult', value);
        }
    }

    get detectionHistory(): Array<any> {
        return this._detectionHistory;
    }

    set detectionHistory(value: Array<any>) {
        if (this._detectionHistory !== value) {
            this._detectionHistory = value;
            this.notifyPropertyChange('detectionHistory', value);
        }
    }

    async onTakePhoto() {
        try {
            const image = await Camera.takePicture();
            this.previewImage = image;
            await this.detectPest(image);
        } catch (error) {
            console.error('Error taking photo:', error);
        }
    }

    async onChoosePhoto() {
        try {
            const selection = await ImagePicker.openPicker();
            if (selection.length > 0) {
                const image = await ImageSource.fromAsset(selection[0]);
                this.previewImage = image;
                await this.detectPest(image);
            }
        } catch (error) {
            console.error('Error choosing photo:', error);
        }
    }

    private async detectPest(image: ImageSource) {
        try {
            // TODO: Implement pest detection API call
            // Mock result for now
            this.detectionResult = {
                pest_name: "Sample Pest",
                confidence: 0.95,
                created_at: new Date().toISOString()
            };

            this.detectionHistory = [this.detectionResult, ...this.detectionHistory];
        } catch (error) {
            console.error('Error detecting pest:', error);
        }
    }
}